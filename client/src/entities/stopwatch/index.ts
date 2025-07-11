import { useStopwatchStore as _useStopwatchStore } from "./model/slice.zustand";

import type { StopwatchStore } from "./model/types";

export const useStopwatchStore: () => StopwatchStore = () => ({
  init: _useStopwatchStore.getState().init,
  start: _useStopwatchStore.getState().start,
  stop: _useStopwatchStore.getState().stop,
  reset: _useStopwatchStore.getState().reset,
  useElapsedMs: () => _useStopwatchStore((s) => s.getElapsedMs()),
  useIsRunning: () => _useStopwatchStore((s) => s.getIsRunning()),
});

export * from "./model/types";
export * from "./lib/parse-dto";
export * from "./api/types";
