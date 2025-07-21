import type { Selector } from "@/shared/lib/selector";
import type { StopwatchState, StopwatchStore } from "../model/types";

export type StopwatchSelector = Selector<StopwatchStore>;

/**
 * 스톱워치/랩 구간의 경과 시간(ms) 계산
 * @param stopwatch 스톱워치 상태
 * @param end 종료 시각(ms, 없으면 현재 시각)
 * @returns 경과 ms
 */
export function getElapsedMs(stopwatch: StopwatchState, end: number = Date.now()): number {
  if (!stopwatch.startedAt) return 0;

  const start = stopwatch.startedAt;
  const stop = stopwatch.stoppedAt ?? end;
  return Math.max(0, stop - start);
}

export function isRunning(stopwatch: StopwatchState): boolean {
  return stopwatch.startedAt !== null && stopwatch.stoppedAt === null;
}
