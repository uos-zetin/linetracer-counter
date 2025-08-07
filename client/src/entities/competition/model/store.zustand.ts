import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { sortByCreatedAtDesc } from "@/shared/lib";
import type { CompetitionStore } from "./types";

export const useZustandCompetitionStore = create<CompetitionStore>()(
  immer((set) => ({
    competitions: [],

    init: (competitions) =>
      set((state) => {
        // 생성일시 역순으로 정렬하여 저장
        state.competitions = competitions.sort(sortByCreatedAtDesc);
      }),

    add: (competition) =>
      set((state) => {
        // 기존 항목 제거
        state.competitions = state.competitions.filter((c) => c.id !== competition.id);
        // 추가 후 정렬
        state.competitions.push(competition);
        state.competitions.sort(sortByCreatedAtDesc);
      }),

    update: (competition) =>
      set((state) => {
        const index = state.competitions.findIndex((c) => c.id === competition.id);
        if (index !== -1) {
          state.competitions[index] = competition;
        }
      }),

    remove: (competitionId) =>
      set((state) => {
        state.competitions = state.competitions.filter((c) => c.id !== competitionId);
      }),

    clearAll: () =>
      set((state) => {
        state.competitions = [];
      }),
  }))
);
