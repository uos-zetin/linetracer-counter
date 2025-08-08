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
    const currentCounter = store.counters.find((c) => c.id === counter.id);

    // 새로운 counter이거나 전체 상태가 다르면 초기화
    if (
      !currentCounter ||
      currentCounter.name !== counter.name ||
      currentCounter.id !== counter.id ||
      currentCounter.divisionId !== counter.divisionId
    ) {
      store.add(counter);
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
      // 기존 연결이 있다면 먼저 정리
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }

      // Channel 연결 후 구독
      unsubscribe = counterChannel.subscribe(updateStore);
      await counterChannel.connect(counterId);
    } catch (error) {
      console.error("Failed to connect to counter channel:", error);
      // 연결 실패 시 정리
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

      // 연결 해제 시 store에서 counter 제거
      if (counterId) {
        const store = useZustandCounterStore.getState();
        store.remove(counterId);
      }
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

  const start = (counterId: string, startedAt: number) => {
    const store = useZustandCounterStore.getState();
    store.start(counterId, startedAt);
  };

  const stop = (counterId: string, stoppedAt: number) => {
    const store = useZustandCounterStore.getState();
    store.stop(counterId, stoppedAt);
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

  const getAllCounters = async () => {
    try {
      return await counterRepository.getAll();
    } catch (error) {
      console.error("Failed to get all counters:", error);
      throw error;
    }
  };

  const loadCounterById = async (counterId: string): Promise<CounterState | null> => {
    try {
      const counter = await counterRepository.getById(counterId);
      if (counter) {
        // Store에 최신 counter 정보 업데이트
        const store = useZustandCounterStore.getState();
        store.add(counter);
        return counter;
      }
      return null;
    } catch (error) {
      console.error(`Failed to load counter ${counterId}:`, error);
      throw error;
    }
  };

  return {
    // Load functions (데이터 조회)
    load: {
      all: getAllCounters,
      byId: loadCounterById,
    },

    // Admin functions (카운터 관리)
    admin: {
      reset,
      connectDivision,
      disconnectDivision,
    },

    // Real-time connection functions (실시간 연결)
    connection: {
      connect,
      disconnect,
    },

    // Local state functions (로컬 상태 조작)
    local: {
      start,
      stop,
    },

    // Subscription hooks (구독)
    use: {
      stopwatch: useStopwatch,
      counterState: useCounterState,
    },
  };
};
