import type { CounterState } from "@/entities/counter";

export interface CounterService {
  // Load functions (데이터 조회)
  load: {
    all: () => Promise<void>;
    byId: (counterId: string) => Promise<CounterState | null>;
  };

  // Admin functions (카운터 관리)
  admin: {
    reset: (counterId: string) => Promise<void>;
    connectDivision: (counterId: string, divisionId: string) => Promise<void>;
    disconnectDivision: (counterId: string) => Promise<void>;
  };

  // Real-time connection functions (실시간 연결)
  connection: {
    connect: (counterId: string) => Promise<void>;
    disconnect: (counterId?: string) => Promise<void>;
  };

  // Local state functions (로컬 상태 조작)
  local: {
    start: (counterId: string, startedAt: number) => void;
    stop: (counterId: string, stoppedAt: number) => void;
  };

  // Subscription hooks (구독)
  use: {
    counters: () => CounterState[];
    stopwatch: (counterId: string) => {
      startedAt: number | null;
      stoppedAt: number | null;
    };
    counterState: (counterId: string) => CounterState | null;
  };
}
