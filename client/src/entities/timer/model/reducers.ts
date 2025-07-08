import type { TimerState } from "./types";
import type { TimerLogDto } from "@/shared";

export function integrateLogs(initialMs: number, logs: TimerLogDto[]): TimerState {
  const state: TimerState = {
    initialMs: initialMs,
    offsetMs: 0,
    accumulatedMs: 0,
    startedAt: null,
  };

  for (const log of logs) {
    switch (log.type) {
      case "start":
        state.startedAt = log.value;
        break;

      case "stop":
        if (state.startedAt !== null) {
          state.accumulatedMs += log.value - state.startedAt;
          state.startedAt = null;
        }
        break;

      case "add":
        state.offsetMs += log.value;
        break;

      case "sub":
        state.offsetMs -= log.value;
        break;
    }
  }
  return state;
}
