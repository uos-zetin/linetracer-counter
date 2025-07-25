// features/counter/model/store.zustand.ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";
import type { CounterState, CounterStore } from "./types";
import { getElapsedMs, isRunning } from "../lib/selectors";

// Immer MapSet 플러그인 활성화
enableMapSet();

/** 테스트 편의를 위해 그대로 export */
export const useZustandCounterStore = create<CounterStore>()(
  immer((set, get) => ({
    counters: new Map<string, CounterState>(),

    init: (counterId, initialState) =>
      set((state) => {
        state.counters.set(counterId, initialState);
      }),

    start: (counterId, startedAt) =>
      set((state) => {
        const counter = state.counters.get(counterId);
        if (counter) {
          counter.startedAt = startedAt;
          counter.stoppedAt = null;
        }
      }),

    stop: (counterId, stoppedAt) =>
      set((state) => {
        const counter = state.counters.get(counterId);
        if (counter) {
          counter.stoppedAt = stoppedAt;
        }
      }),

    reset: (counterId) =>
      set((state) => {
        const counter = state.counters.get(counterId);
        if (counter) {
          counter.startedAt = null;
          counter.stoppedAt = null;
        }
      }),

    getIsRunning: (counterId) => {
      const counter = get().counters.get(counterId);
      return counter ? isRunning(counter.startedAt, counter.stoppedAt) : false;
    },

    getElapsedMs: (counterId, now) => {
      const counter = get().counters.get(counterId);
      return counter ? getElapsedMs(counter.startedAt, now ?? counter.stoppedAt) : 0;
    },

    getDivisionId: (counterId) => {
      const counter = get().counters.get(counterId);
      return counter?.divisionId ?? null;
    },

    clearAll: () =>
      set((state) => {
        state.counters.clear();
      }),
  })),
);
