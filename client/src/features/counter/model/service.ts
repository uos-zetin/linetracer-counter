import { useShallow } from "zustand/shallow";
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

  // --- Load functions (데이터 조회) ---
  const loadAllCounters = async () => {
    try {
      const counters = await counterRepository.getAll();
      const store = useZustandCounterStore.getState();
      store.init(counters);
    } catch (error) {
      console.error("Failed to get all counters:", error);
      throw error;
    }
  };

  const loadCounterById = async (counterId: string): Promise<CounterState | null> => {
    try {
      return await counterRepository.getById(counterId);
    } catch (error) {
      console.error(`Failed to load counter ${counterId}:`, error);
      throw error;
    }
  };

  // --- Admin functions (카운터 관리) ---
  const reset = async (counterId: string) => {
    try {
      await counterRepository.reset(counterId);
    } catch (error) {
      console.error("Failed to reset counter:", error);
      throw error;
    }
  };

  const connectDivision = async (counterId: string, divisionId: string) => {
    try {
      await counterRepository.connectDivision(counterId, divisionId);
    } catch (error) {
      console.error("Failed to connect division to counter:", error);
      throw error;
    }
  };

  const disconnectDivision = async (counterId: string) => {
    try {
      await counterRepository.disconnectDivision(counterId);
    } catch (error) {
      console.error("Failed to disconnect division from counter:", error);
      throw error;
    }
  };

  // --- Real-time connection functions (실시간 연결) ---
  const updateStore = (counter: CounterState) => {
    const store = useZustandCounterStore.getState();
    const currentCounter = store.counters.find((c) => c.id === counter.id);

    if (!currentCounter || currentCounter.name !== counter.name || currentCounter.divisionId !== counter.divisionId) {
      store.add(counter);
      return;
    }

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
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      unsubscribe = counterChannel.subscribe(updateStore);
      await counterChannel.connect(counterId);
    } catch (error) {
      console.error("Failed to connect to counter channel:", error);
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      throw error;
    }
  };

  const disconnect = async (counterId?: string) => {
    try {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      await counterChannel.disconnect();

      if (counterId) {
        const store = useZustandCounterStore.getState();
        store.remove(counterId);
      }
    } catch (error) {
      console.error("Failed to disconnect from counter channel:", error);
    }
  };

  // --- Local state functions (로컬 상태 조작) ---
  const start = (counterId: string, startedAt: number) => {
    const store = useZustandCounterStore.getState();
    store.start(counterId, startedAt);
  };

  const stop = (counterId: string, stoppedAt: number) => {
    const store = useZustandCounterStore.getState();
    store.stop(counterId, stoppedAt);
  };

  // --- Subscription hooks (구독) ---
  const useCounters = (): CounterState[] => {
    return useZustandCounterStore(useShallow((state) => state.counters));
  };

  const useStopwatch = (counterId: string) => {
    const startedAt = useZustandCounterStore((state) => state.counters.find((c) => c.id === counterId)?.startedAt);
    const stoppedAt = useZustandCounterStore((state) => state.counters.find((c) => c.id === counterId)?.stoppedAt);

    return {
      startedAt: startedAt || null,
      stoppedAt: stoppedAt || null,
    };
  };

  const useCounterState = (counterId: string) => {
    const counter = useZustandCounterStore((state) => state.counters.find((c) => c.id === counterId));
    return counter || null;
  };

  return {
    load: {
      all: loadAllCounters,
      byId: loadCounterById,
    },
    admin: {
      reset,
      connectDivision,
      disconnectDivision,
    },
    connection: {
      connect,
      disconnect,
    },
    local: {
      start,
      stop,
    },
    use: {
      counters: useCounters,
      stopwatch: useStopwatch,
      counterState: useCounterState,
    },
  };
};
