import type { TimerState } from "../model/types";

export function getRemainingMs(s: TimerState, now = Date.now()): number {
  const base = s.initialMs + s.offsetMs;
  const elapsed = s.accumulatedMs + (s.startedAt ? now - s.startedAt : 0);
  return Math.max(base - elapsed, 0);
}

export function getStatus(s: TimerState): "running" | "stopped" | "finished" {
  if (getRemainingMs(s) === 0) return "finished";
  return s.startedAt ? "running" : "stopped";
}
