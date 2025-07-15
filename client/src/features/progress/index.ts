import { useProgressStore as _useProgressStore } from "./model/slice.zustand";

import type { Competition } from "@/entities/competition";
import type { Division } from "@/entities/division";
import type { Participant } from "@/entities/participant";
import type { Record } from "@/entities/record";
import type { Progress, ProgressStore, Runner } from "./model/types";

export const useProgressStore: () => ProgressStore = () => ({
  setProgress: _useProgressStore.getState().setProgress,
  patchProgress: _useProgressStore.getState().patchProgress,
  reset: _useProgressStore.getState().reset,

  useProgress: (): Progress | null => _useProgressStore((s) => s.progress),
  useCompetition: (): Competition | null => _useProgressStore((s) => s.getCompetition()),
  useDivision: (): Division | null => _useProgressStore((s) => s.getDivision()),
  useRunner: (): Runner | null => _useProgressStore((s) => s.getRunner()),
  useNextRunners: (): Participant[] => _useProgressStore((s) => s.getNextRunners()),
  useTopRecords: (): Record[] => _useProgressStore((s) => s.getTopRecords()),
});

export * from "./model/types";
