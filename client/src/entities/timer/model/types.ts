import type { TimerLogDto } from "@/shared";

export interface TimerState {
  initialMs: number; // 초기 시간 (ms)
  offsetMs: number; // 증감된 시간 (ms)
  accumulatedMs: number; // 타이머가 정지할 때까지의 누적 시간 (ms), 타이머가 정지될 때마다 갱신됨
  startedAt: number | null; // 타이머 시작 시간 (ms), null이면 타이머가 정지되어 있음
}

export interface Timer {
  current: TimerState;
  timerLogs: TimerLogDto[];
}

export interface TimerStore {
  setTimer: (initialMs: number, timerLogs: TimerLogDto[]) => void;
  updateLogs: (logs: TimerLogDto[]) => void;
  useRemainingMs: () => number;
  useStatus: () => "running" | "stopped" | "finished";
}
