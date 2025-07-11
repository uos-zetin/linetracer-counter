import { create } from "zustand";
import { produce } from "immer";
import type { Progress } from "./types";

type InternalStore = {
  progress: Progress | null;

  setProgress: (progress: Progress) => void;
  patchProgress: (partial: Partial<Progress>) => void;
  reset: () => void;
};

export const useProgressStore = create<InternalStore>()((set) => ({
  progress: null,

  setProgress: (progress) => set({ progress }),

  patchProgress: (partial) =>
    set(
      produce<InternalStore>((state) => {
        if (!state.progress) return;
        state.progress = { ...state.progress, ...partial };
      }),
    ),

  reset: () => set({ progress: null }),
}));
