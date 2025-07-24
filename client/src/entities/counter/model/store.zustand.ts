import { create } from "zustand";
import type { CounterStore } from "./types";
import { immer } from "zustand/middleware/immer";
import { getElapsedMs, isRunning } from "../lib/selectors";

export const useZustandCounterStore = create<CounterStore>()(
  immer((set, get) => ({
    // Initial state
    id: "",
    name: "",
    startedAt: null,
    stoppedAt: null,
    divisionId: null,

    // Actions
    init: (initialState) => set({ ...initialState }),
    start: (startedAt) => set({ startedAt, stoppedAt: null }),
    stop: (stoppedAt) => set({ stoppedAt }),
    reset: () => set({ startedAt: null, stoppedAt: null }),

    // Getters
    getIsRunning: () => isRunning(get().startedAt, get().stoppedAt),
    getElapsedMs: (now?) => getElapsedMs(get().startedAt, now ?? get().stoppedAt),
    getDivisionId: () => get().divisionId,
  })),
);
