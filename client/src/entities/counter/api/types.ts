import type { CounterState } from "../model/types";

export interface CounterDto {
  id: string;
  name: string;
  startedAt: number | null;
  stoppedAt: number | null;
  divisionId: string | null;
}

export interface CounterRepository {
  getAll: () => Promise<CounterState[]>;
  getById: (id: string) => Promise<CounterState | null>;
  connectDivision: (counterId: string, divisionId: string) => Promise<void>;
  disconnectDivision: (counterId: string) => Promise<void>;
  reset: (counterId: string) => Promise<void>;
}

export interface CounterChannel {
  connect: (counterId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  subscribe: (callback: (state: CounterState) => void) => () => void;
}
