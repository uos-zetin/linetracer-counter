import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";
import type { Competition, CompetitionStore } from "./types";

// Immer MapSet 플러그인 활성화
enableMapSet();

/** 테스트 편의를 위해 그대로 export */
export const useZustandCompetitionStore = create<CompetitionStore>()(
  immer((set, get) => ({
    competitions: new Map<string, Competition>(),

    init: (competitions) =>
      set((state) => {
        state.competitions.clear();
        competitions.forEach((competition) => {
          state.competitions.set(competition.id, competition);
        });
      }),

    add: (competition) =>
      set((state) => {
        state.competitions.set(competition.id, competition);
      }),

    update: (competition) =>
      set((state) => {
        state.competitions.set(competition.id, competition);
      }),

    remove: (competitionId) =>
      set((state) => {
        state.competitions.delete(competitionId);
      }),

    getById: (competitionId) => {
      const competitions = get().competitions;
      return competitions.get(competitionId) ?? null;
    },

    getAll: () => {
      const competitions = get().competitions;
      return Array.from(competitions.values()).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },

    clearAll: () =>
      set((state) => {
        state.competitions.clear();
      }),
  }))
);