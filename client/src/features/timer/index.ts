import { useTimerStore as _useTimerStore } from "./model/slice.zustand";

import type { TimerStore } from "./model/types";

export const useTimerStore: () => TimerStore = () => ({
  setTimer: _useTimerStore.getState().setTimer,
  updateLogs: _useTimerStore.getState().updateLogs,
  useRemainingMs: () => _useTimerStore((s) => s.getRemainingMs()),
  useStatus: () => _useTimerStore((s) => s.getStatus()),
});

export * from "./model/types";
export { TimerView } from "./ui/timer-view";
