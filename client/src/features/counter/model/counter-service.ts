import {
  useZustandCounterStore,
  type CounterChannel,
  type CounterRepository,
  type CounterState,
} from "@/entities/counter";
import type { CounterService } from "./types";

interface CounterServiceProps {
  counterRepository: CounterRepository;
  counterChannel: CounterChannel;
}

export const createCounterService = ({ counterRepository, counterChannel }: CounterServiceProps): CounterService => {
  let unsubscribe: (() => void) | null = null;

  const updateStore = (counter: CounterState) => {
    const store = useZustandCounterStore.getState();
    const currentCounter = store.counters.get(counter.id);

    // 새로운 counter이거나 전체 상태가 다르면 초기화
    if (!currentCounter || currentCounter.name !== counter.name || currentCounter.divisionId !== counter.divisionId) {
      store.init(counter.id, counter);
      return;
    }

    // 상태 변화에 따른 개별 업데이트
    if (counter.startedAt !== currentCounter.startedAt) {
      if (counter.startedAt) {
        store.start(counter.id, counter.startedAt);
      } else {
        store.reset(counter.id);
      }
    }

    if (counter.stoppedAt !== currentCounter.stoppedAt && counter.stoppedAt) {
      store.stop(counter.id, counter.stoppedAt);
    }
  };

  const connect = async (counterId: string) => {
    try {
      await counterChannel.connect(counterId);
      unsubscribe = counterChannel.subscribe(updateStore);
    } catch (error) {
      console.error("Failed to connect to counter channel:", error);
      throw error;
    }
  };

  const disconnect = async () => {
    try {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      await counterChannel.disconnect();
    } catch (error) {
      console.error("Failed to disconnect from counter channel:", error);
    }
  };

  const reset = async (counterId: string) => {
    try {
      await counterRepository.reset(counterId);
    } catch (error) {
      console.error("Failed to reset counter:", error);
      throw error;
    }
  };

  const useStopwatch = (counterId?: string) => {
    if (!counterId) {
      return {
        startedAt: null,
        stoppedAt: null,
      };
    }

    const store = useZustandCounterStore.getState();
    const counter = store.counters.get(counterId);

    return {
      startedAt: counter?.startedAt ?? null,
      stoppedAt: counter?.stoppedAt ?? null,
    };
  };

  const start = (counterId: string, startedAt: number) => {
    const store = useZustandCounterStore.getState();
    store.start(counterId, startedAt);
  };

  const stop = (counterId: string, stoppedAt: number) => {
    const store = useZustandCounterStore.getState();
    store.stop(counterId, stoppedAt);
  };

  const getElapsedMs = (counterId: string, now?: number) => {
    const store = useZustandCounterStore.getState();
    return store.getElapsedMs(counterId, now);
  };

  return {
    connect,
    disconnect,
    reset,
    useStopwatch,
    start,
    stop,
    getElapsedMs,
  };
};
