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
      // 1. Repository에서 초기 counter 상태 가져오기
      const initialCounterState = await counterRepository.getById(counterId);
      if (initialCounterState) {
        const store = useZustandCounterStore.getState();
        store.init(counterId, initialCounterState);
        console.log('Initialized counter state from repository:', initialCounterState);
      }

      // 2. Channel 연결 및 구독
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
    const startedAt = useZustandCounterStore((state) => 
      counterId ? state.getStartedAt(counterId) : null
    );
    const stoppedAt = useZustandCounterStore((state) => 
      counterId ? state.getStoppedAt(counterId) : null
    );

    return {
      startedAt,
      stoppedAt,
    };
  };

  const getCounterState = (counterId: string) => {
    const store = useZustandCounterStore.getState();
    return store.counters.get(counterId) || null;
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

  return {
    connect,
    disconnect,
    reset,
    useStopwatch,
    getCounterState,
    start,
    stop,
    getElapsedMs,
    connectDivision,
    disconnectDivision,
  };
};
