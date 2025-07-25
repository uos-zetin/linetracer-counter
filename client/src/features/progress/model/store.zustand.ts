import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type { ProgressStore } from "./types";

export const useZustandProgressStore = create<ProgressStore>()(
  immer((set, get) => ({
    // Initial state
    id: "",
    competition: null,
    division: null,
    runner: null,
    nextRunners: [],
    topRecords: [],

    // Actions
    setProgress: (progress) => set({ ...progress }),
    patchProgress: (partial) => set((state) => ({ ...state, ...partial })),
    reset: () =>
      set({
        id: "",
        competition: null,
        division: null,
        runner: null,
        nextRunners: [],
        topRecords: [],
      }),

    // Getters
    getProgress: () => {
      const { id, competition, division, runner, nextRunners, topRecords } = get();
      return { id, competition, division, runner, nextRunners, topRecords };
    },
    getCompetition: () => get().competition,
    getDivision: () => get().division,
    getRunner: () => get().runner,
    getNextRunners: () => get().nextRunners,
    getTopRecords: () => get().topRecords,
  })),
);
