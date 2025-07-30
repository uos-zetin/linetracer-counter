import type { CounterState } from "@/entities/counter";

export interface CounterService {
  connect: (counterId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  reset: (counterId: string) => Promise<void>;
  useStopwatch: (counterId?: string) => {
    startedAt: number | null;
    stoppedAt: number | null;
  };
  getCounterState: (counterId: string) => CounterState | null;
  start: (counterId: string, startedAt: number) => void;
  stop: (counterId: string, stoppedAt: number) => void;
  getElapsedMs: (counterId: string, now?: number) => number;
  connectDivision: (counterId: string, divisionId: string) => Promise<void>;
  disconnectDivision: (counterId: string) => Promise<void>;
}
