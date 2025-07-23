import { CounterNotRegisteredError } from "@/core/errors";
import {
  CounterDevice,
  CounterDeviceEvent,
  CounterDeviceRegistry,
  Unsubscriber,
} from "@/core/interfaces";

import EventEmitter from "events";

import { FrontBackIrCounterDevice } from "./front-back-ir-counter-device";

type CounterVariant = (
  | { type: "unknown"; value: CounterDevice }
  | { type: "front-back-ir"; value: FrontBackIrCounterDevice }
) & { unsubscribe: Unsubscriber };

export type FrontBackIrCounterDeviceDataItem = [
  timestamp: number,
  startSensor: number,
  endSensor: number
];

interface CounterEventEmitter extends EventEmitter {
  on(deviceId: string, listener: (event: CounterDeviceEvent) => void): this;
  off(deviceId: string, listener: (event: CounterDeviceEvent) => void): this;
  emit(deviceId: string, event: CounterDeviceEvent): boolean;
}

/**
 * 계수기 구현체를 관리하는 매니저 클래스
 *
 * - CounterDeviceRegistry 인터페이스를 구현하여 서비스 로직에서 계수기 인터페이스에 접근할 수 있도록 한다.
 * - 새로운 계수기 구현체가 추가되면 해당 클래스에 새로운 메서드를 추가하여 확장할 수 있도록 한다.
 * - 여기서 각 계수기 구현체별 등록 메서드, 데이터 전달 및 상태 갱신 메서드를 구현한다.
 */
export class CounterDeviceManager implements CounterDeviceRegistry {
  private readonly counters: Map<string, CounterVariant> = new Map();
  private readonly eventEmitter: CounterEventEmitter = new EventEmitter();

  /**
   * 계수기 ID에 따른 계수기 타입을 반환한다.
   * 해당 계수기 ID에 등록된 계수기가 없으면 CounterNotRegisteredError를 던진다.
   */
  private getCounterVariant(deviceId: string): CounterVariant {
    const counterType = this.counters.get(deviceId);
    if (!counterType) {
      throw new CounterNotRegisteredError(
        `Counter not registered for deviceId: ${deviceId}`
      );
    }
    return counterType;
  }

  /**
   * 계수기 ID에 따른 계수기 타입을 등록한다. 이때 계수기 인스턴스의 상태 갱신 이벤트를 구독한다.
   * 이미 등록된 경우라면 이전에 등록된 계수기 인스턴스를 해제하고 새로운 계수기 인스턴스를 등록한다.
   */
  private registerCounterVariant(
    deviceId: string,
    counterVariant: CounterVariant
  ): void {
    const prevCounterVariant = this.counters.get(deviceId);
    if (prevCounterVariant) {
      prevCounterVariant.value.reset();
      prevCounterVariant.unsubscribe();
    }
    this.counters.set(deviceId, counterVariant);
  }

  public async getCounterDevices(): Promise<CounterDevice[]> {
    return Array.from(this.counters.values()).map((variant) => variant.value);
  }

  public async getCounterDevice(deviceId: string): Promise<CounterDevice> {
    const counterVariant = this.getCounterVariant(deviceId);
    return counterVariant.value;
  }

  public async unregisterCounterDevice(deviceId: string): Promise<void> {
    // 계수기 인스턴스 해제
    const counterVariant = this.counters.get(deviceId);
    if (counterVariant) {
      counterVariant.unsubscribe();
      this.counters.delete(deviceId);
    }
  }

  public subscribeCounterDeviceEvent(
    deviceId: string,
    callback: (event: CounterDeviceEvent) => Promise<void>
  ): Unsubscriber {
    const safeCb = async (event: CounterDeviceEvent) => {
      try {
        await callback(event);
      } catch (error) {
        console.error(error);
      }
    };
    this.eventEmitter.on(deviceId, safeCb);
    return () => {
      this.eventEmitter.off(deviceId, safeCb);
    };
  }

  /// ----- 계수기 구현체 관련 메서드 -----

  /**
   * Front-Back IR 계수기 H/W 인스턴스를 생성 및 등록한다.
   */
  public registerFrontBackIrCounter(
    name: string,
    deviceId: string,
    startThreshold: number,
    endThreshold: number,
    endDebouncingTime: number
  ): FrontBackIrCounterDevice {
    const counter = new FrontBackIrCounterDevice(
      deviceId,
      name,
      startThreshold,
      endThreshold,
      endDebouncingTime
    );
    this.registerCounterVariant(deviceId, {
      type: "front-back-ir",
      value: counter,
      unsubscribe: counter.subscribe(async (event) => {
        this.eventEmitter.emit(deviceId, event);
      }),
    });
    return counter;
  }

  /**
   * Front-Back IR 계수기에 센서 데이터를 전달한다.
   * 이때 data는 timestamp 오름차순으로 정렬되어 있어야 한다(그리고 전역적으로 봤을 때에도 마찬가지).
   */
  public pushFrontBackIrCounterData(
    deviceId: string,
    data: FrontBackIrCounterDeviceDataItem[]
  ) {
    const counterVariant = this.getCounterVariant(deviceId);
    if (counterVariant.type !== "front-back-ir") {
      throw new CounterNotRegisteredError(
        `Front-Back IR counter not registered for deviceId: ${deviceId}`
      );
    }
    for (const [timestamp, startSensor, endSensor] of data) {
      counterVariant.value.transitState(timestamp, startSensor, endSensor);
    }
  }
}
