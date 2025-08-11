import { Actor } from "@/core/models";
import { requireAnyRole } from "@/core/utils/auth";
import {
  CounterDeviceManager,
  FrontBackIrCounterDeviceDataItem,
} from "@/infrastructure/counters/counter-device-manager";

export type { FrontBackIrCounterDeviceDataItem };

export class CounterDeviceActorManager {
  private readonly manager: CounterDeviceManager;

  constructor(manager: CounterDeviceManager) {
    this.manager = manager;
  }

  public async registerFrontBackIrCounter(
    actor: Actor,
    deviceId: string,
    name: string,
    startThreshold: number,
    endThreshold: number,
    endDebouncingTime: number
  ): Promise<void> {
    requireAnyRole(actor, "administrator", "stopwatchRecorder");
    this.manager.registerFrontBackIrCounter(
      name,
      deviceId,
      startThreshold,
      endThreshold,
      endDebouncingTime
    );
  }

  public async pushFrontBackIrCounterData(
    actor: Actor,
    deviceId: string,
    data: FrontBackIrCounterDeviceDataItem[]
  ): Promise<void> {
    requireAnyRole(actor, "administrator", "stopwatchRecorder");
    this.manager.pushFrontBackIrCounterData(deviceId, data);
  }
}
