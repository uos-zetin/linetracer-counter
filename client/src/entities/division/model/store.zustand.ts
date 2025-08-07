import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { sortByCreatedAtDesc } from "@/shared/lib";
import type { DivisionStore } from "./types";

export const useZustandDivisionStore = create<DivisionStore>()(
  immer((set) => ({
    divisions: [],

    init: (divisions) =>
      set((state) => {
        // 생성일시 역순으로 정렬하여 저장
        state.divisions = divisions.sort(sortByCreatedAtDesc);
      }),

    add: (division) =>
      set((state) => {
        // 기존 항목 제거
        state.divisions = state.divisions.filter((d) => d.id !== division.id);
        // 추가 후 정렬
        state.divisions.push(division);
        state.divisions.sort(sortByCreatedAtDesc);
      }),

    update: (division) =>
      set((state) => {
        const index = state.divisions.findIndex((d) => d.id === division.id);
        if (index !== -1) {
          state.divisions[index] = division;
        }
      }),

    remove: (divisionId) =>
      set((state) => {
        state.divisions = state.divisions.filter((d) => d.id !== divisionId);
      }),

    clearAll: () =>
      set((state) => {
        state.divisions = [];
      }),
  }))
);
