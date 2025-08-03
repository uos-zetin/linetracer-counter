import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { CompetitionStore } from "./types";

export const useZustandCompetitionStore = create<CompetitionStore>()(
  immer((set) => ({
    competitions: [],

    init: (competitions) =>
      set((state) => {
        // 생성일시 역순으로 정렬하여 저장
        state.competitions = [...competitions].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      }),

    add: (competition) =>
      set((state) => {
        // 기존 항목이 있으면 제거 후 추가
        state.competitions = state.competitions.filter((c) => c.id !== competition.id);

        // 생성일시 순서에 맞게 삽입
        const insertIndex = state.competitions.findIndex(
          (c) => new Date(competition.createdAt).getTime() > new Date(c.createdAt).getTime(),
        );

        if (insertIndex === -1) {
          state.competitions.push(competition);
        } else {
          state.competitions.splice(insertIndex, 0, competition);
        }
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
  })),
);
