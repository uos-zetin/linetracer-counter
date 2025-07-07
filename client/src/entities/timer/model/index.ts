import { useTimerStore as _useTimerStore } from "./slice.zustand";

import type { TimerStore } from "./types";

export const useTimerStore: () => TimerStore = () => ({
  setTimer: _useTimerStore.getState().setTimer,
  updateLogs: _useTimerStore.getState().updateLogs,
  useRemainingMs: () => _useTimerStore((s) => s.getRemainingMs()),
  useStatus: () => _useTimerStore((s) => s.getStatus()),
});

export * from "./types";
