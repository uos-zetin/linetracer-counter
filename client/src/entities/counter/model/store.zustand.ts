import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { CounterState, CounterStore } from "./types";

export const useZustandCounterStore = create<CounterStore>()(
  immer((set) => ({
    counters: [] as CounterState[],

    init: (counterId, initialState) =>
      set((state) => {
        state.counters = [...state.counters.filter((c) => c.id !== counterId), { ...initialState }];
      }),

    start: (counterId, startedAt) =>
      set((state) => {
        state.counters = state.counters.map((c) => (c.id === counterId ? { ...c, startedAt, stoppedAt: null } : c));
      }),

    stop: (counterId, stoppedAt) =>
      set((state) => {
        state.counters = state.counters.map((c) => (c.id === counterId ? { ...c, stoppedAt } : c));
      }),

    reset: (counterId) =>
      set((state) => {
        state.counters = state.counters.map((c) =>
          c.id === counterId ? { ...c, startedAt: null, stoppedAt: null } : c
        );
      }),

    remove: (counterId) =>
      set((state) => {
        state.counters = state.counters.filter((c) => c.id !== counterId);
      }),

    clearAll: () =>
      set((state) => {
        state.counters = [];
      }),
  }))
);
