import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { DivisionStore } from "./types";

export const useZustandDivisionStore = create<DivisionStore>()(
  immer((set, get) => ({
    divisions: [],

    init: (divisions) =>
      set((state) => {
        // 생성일시 역순으로 정렬하여 저장
        state.divisions = divisions.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }),

    add: (division) =>
      set((state) => {
        // 기존 항목이 있으면 제거 후 추가
        state.divisions = state.divisions.filter(d => d.id !== division.id);
        
        // 생성일시 순서에 맞게 삽입
        const insertIndex = state.divisions.findIndex(d => 
          new Date(division.createdAt).getTime() > new Date(d.createdAt).getTime()
        );
        
        if (insertIndex === -1) {
          state.divisions.push(division);
        } else {
          state.divisions.splice(insertIndex, 0, division);
        }
      }),

    update: (division) =>
      set((state) => {
        const index = state.divisions.findIndex(d => d.id === division.id);
        if (index !== -1) {
          state.divisions[index] = division;
        }
      }),

    remove: (divisionId) =>
      set((state) => {
        state.divisions = state.divisions.filter(d => d.id !== divisionId);
      }),

    getById: (divisionId) => {
      const divisions = get().divisions;
      return divisions.find(d => d.id === divisionId) ?? null;
    },

    getAll: () => {
      return get().divisions;
    },

    clearAll: () =>
      set((state) => {
        state.divisions = [];
      }),
  }))
);