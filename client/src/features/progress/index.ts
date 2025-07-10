import { useProgressStore as _useProgressStore } from "./model/store.zustand";
import type { Progress, ProgressStore, Runner } from "./model/types";

export const useProgressStore: () => ProgressStore = () => ({
  setProgress: _useProgressStore.getState().setProgress,
  patchProgress: _useProgressStore.getState().patchProgress,
  reset: _useProgressStore.getState().reset,

  useProgress: (): Progress | null => _useProgressStore((s) => s.progress),
  useRunner: (): Runner | null => _useProgressStore((s) => s.progress?.runner ?? null),
});
