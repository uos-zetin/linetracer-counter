import { ParameterInvalidError } from "@/core/errors";
import {
  CounterDevice,
  CounterDeviceEvent,
  CounterDeviceStatus,
  Unsubscriber,
} from "@/core/interfaces";

import { EventEmitter } from "events";

type FrontBackIrCounterDeviceState =
  | "running"
  | "end-begin"
  | "end-debouncing"
  | "end";

interface FrontBackIrCounterDeviceEventEmitter extends EventEmitter {
  on(eventName: "event", listener: (event: CounterDeviceEvent) => void): this;
  off(eventName: "event", listener: (event: CounterDeviceEvent) => void): this;
  emit(eventName: "event", event: CounterDeviceEvent): boolean;
}

/**
 * 2025년도에 만들 계수기 H/W에서는 다음의 방식으로 센서 데이터를 전송한다.
 * unix-timestamp (4 bytes), front-sensor (1 byte), back-sensor (1 byte)
 *
 * 추가적인 제약사항은 다음과 같다.
 * - 들어오는 데이터는 unix-timestamp 기준으로 오름차순으로 정렬되어 있다.
 */
export class FrontBackIrCounterDevice implements CounterDevice {
  private startedAt: number | null = null;
  private stoppedAt: number | null = null;
  private endBeginAt: number = 0;
  private lastTimestamp: number = 0;

  readonly deviceId: string;
  readonly name: string;

  private readonly startThreshold: number;
  private readonly endThreshold: number;
  private readonly endDebouncingTime: number;

  private _state: FrontBackIrCounterDeviceState = "end";
  public get state(): FrontBackIrCounterDeviceState {
    return this._state;
  }
  private set state(state: FrontBackIrCounterDeviceState) {
    this._state = state;
  }

  private readonly eventEmitter: FrontBackIrCounterDeviceEventEmitter =
    new EventEmitter();

  constructor(
    deviceId: string,
    name: string,
    startThreshold: number,
    endThreshold: number,
    endDebouncingTime: number
  ) {
    if (startThreshold < 0 || startThreshold > 255) {
      throw new ParameterInvalidError(
        "startThreshold must be between 0 and 255"
      );
    }
    if (endThreshold < 0 || endThreshold > 255) {
      throw new ParameterInvalidError("endThreshold must be between 0 and 255");
    }

    this.deviceId = deviceId;
    this.name = name;
    this.startThreshold = startThreshold;
    this.endThreshold = endThreshold;
    this.endDebouncingTime = endDebouncingTime;
  }

  public transitState(
    timestamp: number,
    startSensor: number,
    endSensor: number
  ) {
    if (startSensor < 0 || startSensor > 255) {
      throw new ParameterInvalidError("startSensor must be between 0 and 255");
    }
    if (endSensor < 0 || endSensor > 255) {
      throw new ParameterInvalidError("endSensor must be between 0 and 255");
    }
    if (this.lastTimestamp > timestamp) {
      throw new ParameterInvalidError("timestamp is not in ascending order");
    }
    this.lastTimestamp = timestamp;

    const startDetected = startSensor < this.startThreshold;
    const endDetected = endSensor < this.endThreshold;

    switch (this.state) {
      case "running":
        if (endDetected) {
          // 도착 센서가 동작하면 다음 상태(end-begin)로 전이한다.
          this.endBeginAt = timestamp;
          this.state = "end-begin";
        }
        break;
      case "end-begin":
        if (endDetected) {
          // 도착 센서가 동작하는 동안(=로봇이 지나가고 있는 경우) 새로운 도착 시작 시간을 기록한다.
          this.endBeginAt = timestamp;
        } else {
          // 도착 센서가 동작하지 않으면(=로봇이 모두 지나간 경우) 다음 상태(end-debouncing)로 전이한다.
          this.state = "end-debouncing";
        }
        break;
      case "end-debouncing":
        if (endDetected) {
          // 도착 센서가 다시 동작하면 이전 상태(end-begin)로 돌아간다.
          this.endBeginAt = timestamp;
          this.state = "end-begin";
        } else {
          // 일정 시간동안 도착 센서가 동작하지 않으면 로봇이 모두 지나간 것으로 간주(debouncing)하고 다음 상태(end)로 전이한다.
          const elapsedTime = timestamp - this.endBeginAt;
          if (elapsedTime >= this.endDebouncingTime) {
            this.emitEndEvent(this.endBeginAt); // 도착 신호 이벤트를 발생시킨다.
            this.state = "end";
          }
        }
        break;
      case "end":
        if (startDetected) {
          // 출발 센서가 동작하면 출발 시간을 기록하고 다음 상태(running)로 전이한다.
          this.emitStartEvent(timestamp); // 출발 신호 이벤트를 발생시킨다.
          this.state = "running";
        }
        break;
      default:
        throw new Error(`unknown state: ${this.state}`);
    }
  }

  private emitStartEvent(startedAt: number) {
    this.startedAt = startedAt;
    this.stoppedAt = null;
    this.eventEmitter.emit("event", {
      type: "start",
      startedAt,
    });
  }

  private emitEndEvent(stoppedAt: number) {
    if (this.startedAt === null) {
      throw new Error(
        "Something went wrong. End event is emitted before start event."
      );
    }
    this.stoppedAt = stoppedAt;
    this.eventEmitter.emit("event", {
      type: "stop",
      startedAt: this.startedAt,
      stoppedAt,
    });
  }

  public subscribe(
    callback: (event: CounterDeviceEvent) => Promise<void>
  ): Unsubscriber {
    const safeCb = async (event: CounterDeviceEvent) => {
      try {
        await callback(event);
      } catch (error) {
        console.error(error);
      }
    };
    this.eventEmitter.on("event", safeCb);
    return () => {
      this.eventEmitter.off("event", safeCb);
    };
  }

  public async reset(): Promise<void> {
    this.state = "end";
    this.startedAt = null;
    this.stoppedAt = null;
    this.endBeginAt = 0;
    this.lastTimestamp = 0;
    this.eventEmitter.emit("event", { type: "reset" });
  }

  public async getStatus(): Promise<CounterDeviceStatus> {
    return {
      startedAt: this.startedAt,
      stoppedAt: this.stoppedAt,
    };
  }
}
