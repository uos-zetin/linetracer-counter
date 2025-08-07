import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { sortByCreatedAtDesc } from "@/shared/lib";
import type { RecordStore, Record } from "./types";

export const useZustandRecordStore = create<RecordStore>()(
  immer((set) => ({
    records: [],

    // Actions
    init: (records: Record[]) =>
      set((state) => {
        state.records = records.sort(sortByCreatedAtDesc);
      }),

    add: (record: Record) =>
      set((state) => {
        // 기존 항목 제거
        state.records = state.records.filter((r) => r.id !== record.id);
        // 추가 후 정렬
        state.records.push(record);
        state.records.sort(sortByCreatedAtDesc);
      }),

    addMany: (records: Record[]) =>
      set((state) => {
        // 중복된 새 레코드 제거 (새로 추가할 레코드들의 ID)
        const newRecordIds = new Set(records.map((r) => r.id));
        state.records = state.records.filter((r) => !newRecordIds.has(r.id));
        // 추가 후 정렬
        state.records.push(...records);
        state.records.sort(sortByCreatedAtDesc);
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
