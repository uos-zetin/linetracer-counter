import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { CounterState, CounterStore } from "./types";

export const useZustandCounterStore = create<CounterStore>()(
  immer((set) => ({
    counters: [] as CounterState[],

    init: (initialState) =>
      set((state) => {
        state.counters = initialState;
      }),

    add: (counter) =>
      set((state) => {
        // 기존 항목 제거
        state.counters = state.counters.filter((c) => c.id !== counter.id);
        // 추가 후 정렬
        state.counters.push(counter);
        state.counters.sort((a, b) => (a.startedAt || 0) - (b.startedAt || 0));
      }),

    update: (counter) =>
      set((state) => {
        const index = state.counters.findIndex((c) => c.id === counter.id);
        if (index !== -1) {
          state.counters[index] = counter;
        }
      }),

    remove: (counterId) =>
      set((state) => {
        state.counters = state.counters.filter((c) => c.id !== counterId);
      }),

    clearAll: () =>
      set((state) => {
        state.counters = [];
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
  }))
);
