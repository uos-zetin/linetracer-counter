import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { RecordStore, Record } from "./types";

export const useZustandRecordStore = create<RecordStore>()(
  immer((set) => ({
    records: [],

    // Actions
    init: (records: Record[]) =>
      set((state) => {
        state.records = records;
      }),

    add: (record: Record) =>
      set((state) => {
        // 기존 항목 제거
        state.records = state.records.filter((r) => r.id !== record.id);
        // 추가 후 정렬
        state.records.push(record);
        state.records.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }),

    addMany: (records: Record[]) =>
      set((state) => {
        // 기존 항목 제거
        const existingIds = new Set(state.records.map((r) => r.id));
        state.records = state.records.filter((r) => !existingIds.has(r.id));
        // 추가 후 정렬
        state.records.push(...records);
      }),

    update: (record: Record) =>
      set((state) => {
        const index = state.records.findIndex((r) => r.id === record.id);
        if (index !== -1) {
          state.records[index] = record;
        }
      }),

    remove: (recordId: string) =>
      set((state) => {
        state.records = state.records.filter((r) => r.id !== recordId);
      }),
  }))
);
