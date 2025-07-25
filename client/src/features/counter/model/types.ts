export interface CounterService {
  connect: (counterId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  reset: (counterId: string) => Promise<void>;
  useStopwatch: (counterId?: string) => {
    startedAt: number | null;
    stoppedAt: number | null;
  };
  start: (counterId: string, startedAt: number) => void;
  stop: (counterId: string, stoppedAt: number) => void;
  getElapsedMs: (counterId: string, now?: number) => number;
}
