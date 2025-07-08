import type { StopwatchState } from "./types";

export function getElapsedMs(s: StopwatchState, now = Date.now()): number {
  if (s.startedAt === null) return 0;
  const elapsed = (s.stoppedAt ?? now) - s.startedAt;
  return Math.max(elapsed, 0);
}

export function isRunning(s: StopwatchState): boolean {
  return s.startedAt !== null && s.stoppedAt === null;
}
