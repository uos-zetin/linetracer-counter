import {
  useZustandCounterStore,
  type CounterChannel,
  type CounterRepository,
  type CounterState,
} from "@/entities/counter";

export const useCounterService = (counterRepository: CounterRepository, counterChannel: CounterChannel) => {
  const update = (counter: CounterState) => {
    if (useZustandCounterStore.getState().id !== counter.id) {
      useZustandCounterStore.getState().init(counter);
    } else {
      if (counter.stoppedAt) {
        useZustandCounterStore.getState().stop(counter.stoppedAt);
      } else if (counter.startedAt) {
        useZustandCounterStore.getState().start(counter.startedAt);
      } else {
        useZustandCounterStore.getState().reset();
      }
    }
  };

  const connect = (counterId: string) => {
    counterChannel.connect(counterId);
    counterChannel.subscribe(update);
  };

  const disconnect = (counterId: string) => {
    counterChannel.disconnect(counterId);
  };

  const reset = (counterId: string) => {
    counterRepository.reset(counterId);
  };

  const useStopwatch = () => {
    const { startedAt, stoppedAt } = useZustandCounterStore();
    return {
      startedAt,
      stoppedAt,
    };
  };

  const start = (startedAt: number) => {
    useZustandCounterStore.getState().start(startedAt);
  };

  return {
    connect,
    disconnect,
    reset,
    useStopwatch,
    start,
  };
};
