import { useRealTimeTimer } from "@/shared";
import type { TimerState } from "../model/types";
import { getRemainingMs } from "./selectors";

/**
 * Countdown Timer - 남은 시간을 실시간으로 계산하는 훅
 * @param timerState - Timer 상태 객체
 * @returns 남은 시간 (milliseconds)
 */
export function useCountdownTimer(timerState: TimerState): number {
  return useRealTimeTimer(
    timerState.startedAt,
    timerState.startedAt ? null : 0, // 실행 중이면 null, 정지 중이면 0으로 간주
    (_, __, now) => getRemainingMs(timerState, now)
  );
}
