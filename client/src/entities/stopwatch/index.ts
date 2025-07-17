import { useStopwatchStore as _useStopwatchStore } from "./model/slice.zustand";

import type { StopwatchStore } from "./model/types";

export const useStopwatchStore: () => StopwatchStore = () => ({
  init: _useStopwatchStore.getState().init,
  start: _useStopwatchStore.getState().start,
  stop: _useStopwatchStore.getState().stop,
  reset: _useStopwatchStore.getState().reset,
  useStopwatchState: _useStopwatchStore((state) => state.getStopwatchState),
});

export * from "./api/types";
export * from "./lib/parse-dto";
export * from "./model/types";
export * from "./model/selectors";
export { formatElapsedMs } from "./ui/formatters";
