import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type { ProgressState, ProgressStore } from "./types";

const initialState: ProgressState = {
  id: "",
  competition: null,
  division: null,
  runner: null,
  nextRunners: [],
  topRecords: [],
};

export const useZustandProgressStore = create<ProgressStore>()(
  immer((set) => ({
    // Initial state
    ...initialState,

    // Actions
    setProgress: (progress) => set(progress),
    patchProgress: (partial) =>
      set((state) => {
        Object.assign(state, partial);
      }),
    reset: () => set(initialState),
  })),
);
