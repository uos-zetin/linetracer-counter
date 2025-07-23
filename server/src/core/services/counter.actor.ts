import { Unsubscriber } from "@/core/interfaces";
import { Actor, Counter } from "@/core/models";
import { CounterEvent, CounterService } from "@/core/services/counter";
import { requireAnyRole } from "@/core/utils/auth";

export type { CounterEvent };

export class CounterActorService {
  private readonly service: CounterService;

  constructor(counterService: CounterService) {
    this.service = counterService;
  }

  public async getCounters(actor: Actor): Promise<Counter[]> {
    return this.service.getCounters();
  }

  public async getCounter(actor: Actor, deviceId: string): Promise<Counter> {
    return this.service.getCounter(deviceId);
  }

  public async linkCounterToDivision(
    actor: Actor,
    deviceId: string,
    divisionId: string | null
  ): Promise<void> {
    requireAnyRole(actor, "administrator");
    return this.service.linkCounterToDivision(deviceId, divisionId);
  }

  public async resetCounter(actor: Actor, deviceId: string): Promise<void> {
    requireAnyRole(actor, "administrator");
    return this.service.resetCounter(deviceId);
  }

  public async unregisterCounter(
    actor: Actor,
    deviceId: string
  ): Promise<void> {
    requireAnyRole(actor, "administrator", "stopwatchRecorder");
    return this.service.unregisterCounter(deviceId);
  }

  public async subscribeCounterEvent(
    actor: Actor,
    deviceId: string,
    listener: (event: CounterEvent) => Promise<void>
  ): Promise<Unsubscriber> {
    requireAnyRole(actor, "administrator", "stopwatchRecorder");
    return this.service.subscribeCounterEvent(deviceId, listener);
  }
}
