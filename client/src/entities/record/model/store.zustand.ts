import { create } from "zustand";
import type { RecordStore, Record } from "./types";
import { immer } from "zustand/middleware/immer";

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
        state.records.push(record);
      }),

    addMany: (records: Record[]) =>
      set((state) => {
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
  })),
);
