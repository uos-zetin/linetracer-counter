import { create } from "zustand";
import { produce } from "immer";
import type { Progress, Runner } from "./types";
import type { Competition } from "@/entities/competition";
import type { Division } from "@/entities/division";
import type { Record } from "@/entities/record";
import type { Participant } from "@/entities/participant";

type InternalStore = {
  progress: Progress;

  setProgress: (progress: Progress) => void;
  patchProgress: (partial: Partial<Progress>) => void;
  reset: () => void;

  getProgress: () => Progress | null;
  getCompetition: () => Competition | null;
  getDivision: () => Division | null;
  getRunner: () => Runner | null;
  getNextRunners: () => Participant[];
  getTopRecords: () => Record[];
};

const initialProgress: Progress = {
  id: "",
  competition: null,
  division: null,
  runner: null,
  nextRunners: [],
  topRecords: [],
};

export const useProgressStore = create<InternalStore>()((set, get) => ({
  progress: initialProgress,

  setProgress: (progress) => set({ progress }),

  patchProgress: (partial) =>
    set(
      produce<InternalStore>((state) => {
        if (!state.progress) return;
        state.progress = { ...state.progress, ...partial };
      }),
    ),

  reset: () => set({ progress: initialProgress }),

  getProgress: () => get().progress,
  getCompetition: () => get().progress.competition,
  getDivision: () => get().progress.division,
  getRunner: () => get().progress.runner,
  getNextRunners: () => get().progress.nextRunners,
  getTopRecords: () => get().progress.topRecords,
}));
