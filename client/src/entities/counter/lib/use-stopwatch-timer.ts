import { useCallback } from "react";
import { useRealTimeTimer } from "@/shared/lib";
import { getElapsedMs } from "./selectors";

/**
 * Stopwatch - 경과 시간을 실시간으로 계산하는 훅
 * @param startedAt - 시작 시간 (timestamp)
 * @param stoppedAt - 정지 시간 (timestamp, null이면 실행 중)
 * @returns 경과 시간 (milliseconds)
 */
export function useStopwatchTimer(startedAt: number | null, stoppedAt: number | null): number {
  const calculateValue = useCallback(
    (startedAt: number | null, stoppedAt: number | null, now: number) => getElapsedMs(startedAt, stoppedAt ?? now),
    []
  );

  return useRealTimeTimer(startedAt, stoppedAt, calculateValue);
}
