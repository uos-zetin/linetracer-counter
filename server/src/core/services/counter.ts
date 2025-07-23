import { Counter } from "@/core/models";
import {
  CounterDevice,
  CounterDeviceRegistry,
  Unsubscriber,
} from "@/core/interfaces";

import { DivisionProgressService } from "./division-progress";

import EventEmitter from "events";

export type CounterEvent =
  | {
      type: "counter:updated";
      startedAt: number | null;
      stoppedAt: number | null;
    }
  | { type: "division:bound"; divisionId: string }
  | { type: "division:unbound" };

interface CounterEventEmitter extends EventEmitter {
  on(deviceId: string, listener: (event: CounterEvent) => void): this;
  off(deviceId: string, listener: (event: CounterEvent) => void): this;
  emit(deviceId: string, event: CounterEvent): boolean;
}

/**
 * 계수기 서비스
 *
 * - 등록된 계수기 목록 확인
 * - 계수기와 대회 부문(Division) 연결
 * - 계수기 초기화
 * - 계수기 연결 해제
 * - 계수기에 특정 대회 부문이 연결되어 있으면, 종료 이벤트 발생 시 현재 경연자에 기록 자동 등록
 * - 계수기 이벤트(출발/도착 이벤트) 구독
 */
export class CounterService {
  private readonly counterRegistry: CounterDeviceRegistry;
  private readonly divisionProgressService: DivisionProgressService;

  private readonly counterEventEmitter: CounterEventEmitter =
    new EventEmitter();

  private counterDivisionBindingMap: Map<
    string, // deviceId,
    {
      divisionId: string;
      unsubscribe: Unsubscriber;
    }
  > = new Map();

  constructor(di: {
    counterRegistry: CounterDeviceRegistry;
    divisionProgressService: DivisionProgressService;
  }) {
    this.counterRegistry = di.counterRegistry;
    this.divisionProgressService = di.divisionProgressService;
  }

  private async counterDeviceToModel(counter: CounterDevice): Promise<Counter> {
    const { deviceId, name } = counter;
    const { startedAt, stoppedAt } = await counter.getStatus();
    const divisionId =
      this.counterDivisionBindingMap.get(deviceId)?.divisionId ?? null;

    return {
      id: deviceId,
      name,
      startedAt,
      stoppedAt,
      divisionId,
    };
  }

  /**
   * 등록된 모든 계수기 상태 목록을 반환한다.
   */
  public async getCounters(): Promise<Counter[]> {
    const counterDevices = await this.counterRegistry.getCounterDevices();
    return Promise.all(
      counterDevices.map((counter) => this.counterDeviceToModel(counter))
    );
  }

  /**
   * 특정 계수기 상태를 조회한다.
   */
  public async getCounter(deviceId: string): Promise<Counter> {
    const counter = await this.counterRegistry.getCounterDevice(deviceId);
    return this.counterDeviceToModel(counter);
  }

  /**
   * 계수기와 대회 부문의 연결을 해제한다.
   */
  private unbindCounterFromDivision(deviceId: string): void {
    const binding = this.counterDivisionBindingMap.get(deviceId);
    if (binding) {
      binding.unsubscribe();
      this.counterDivisionBindingMap.delete(deviceId);
    }
  }

  /**
   * 계수기를 특정 대회 부문에 연결한다.
   */
  public async linkCounterToDivision(
    deviceId: string,
    divisionId: string | null
  ): Promise<void> {
    // 계수기 하나에 하나의 대회 부문만 연결할 수 있으므로 이전 연결은 꼭 해제해야 한다.
    this.unbindCounterFromDivision(deviceId);

    // 대회 부문이 없으면 계수기와의 연결을 더이상 진행하지 않는다.
    if (divisionId === null) {
      // 계수기 <-> 대회 부문 연결 이벤트 발생
      this.counterEventEmitter.emit(deviceId, {
        type: "division:unbound",
      });
      return;
    }

    const unsubscribe = this.counterRegistry.subscribeCounterDeviceEvent(
      deviceId,
      async (event) => {
        // 도착 이벤트 발생 시 현재 경연자에 기록 자동 등록
        if (event.type === "stop") {
          try {
            await this.divisionProgressService.addRecordToRunner(
              divisionId,
              event.stoppedAt - event.startedAt,
              "stopwatch",
              ""
            );
          } catch (error) {
            // 기록 등록 실패 시 예외 무시
            console.error(
              "Error occurred while adding record to runner:",
              error
            );
          }
        }
      }
    );

    // 계수기 <-> 대회 부문 연결 이벤트 발생
    this.counterEventEmitter.emit(deviceId, {
      type: "division:bound",
      divisionId,
    });

    // 계수기 이벤트 구독 정보 저장
    this.counterDivisionBindingMap.set(deviceId, {
      divisionId,
      unsubscribe,
    });
  }

  /**
   * 특정 계수기의 상태를 초기화한다.
   */
  public async resetCounter(deviceId: string): Promise<void> {
    const counter = await this.counterRegistry.getCounterDevice(deviceId);
    await counter.reset();
  }

  /**
   * 특정 계수기를 등록 해제한다.
   */
  public async unregisterCounter(deviceId: string): Promise<void> {
    this.unbindCounterFromDivision(deviceId);
    await this.counterRegistry.unregisterCounterDevice(deviceId);
  }

  /**
   * 특정 계수기의 이벤트를 구독한다.
   */
  public subscribeCounterEvent(
    deviceId: string,
    listener: (event: CounterEvent) => Promise<void>
  ): Unsubscriber {
    const safeCb = async (event: CounterEvent) => {
      try {
        await listener(event);
      } catch (error) {
        console.error("Error in counter event listener:", error);
      }
    };

    const unsubscribe = this.counterRegistry.subscribeCounterDeviceEvent(
      deviceId,
      async (event) => {
        const stateChangedEvent: CounterEvent = {
          type: "counter:updated",
          startedAt: null,
          stoppedAt: null,
        };

        // 계수기 이벤트 타입에 따라 계수기 상태 업데이트
        switch (event.type) {
          case "start":
            stateChangedEvent.startedAt = event.startedAt;
            break;
          case "stop":
            stateChangedEvent.startedAt = event.startedAt;
            stateChangedEvent.stoppedAt = event.stoppedAt;
            break;
          case "reset":
            stateChangedEvent.startedAt = null;
            stateChangedEvent.stoppedAt = null;
            break;
        }
        /**
         * EventEmitter를 사용해 emit할 경우, 동일한 deviceId에 여러 구독자가 등록되어 있으면
         * 하나의 상태 변경 이벤트에 대해 모든 구독자에게 중복 이벤트가 전달될 수 있다.
         * 여기서는 subscribeCounterState로 등록된 단일 리스너에게만 이벤트를 전달해야 하므로,
         * EventEmitter를 거치지 않고 직접 콜백(safeCb)을 호출한다.
         */
        await safeCb(stateChangedEvent);
      }
    );
    this.counterEventEmitter.on(deviceId, safeCb); // 현재 계수기 서비스 로직에서 이벤트 발생하는 이벤트를 구독한다.

    return () => {
      this.counterEventEmitter.off(deviceId, safeCb);
      unsubscribe();
    };
  }
}
