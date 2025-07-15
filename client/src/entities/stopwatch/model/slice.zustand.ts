import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type { StopwatchState } from "./types";

interface InternalStopwatchSlice {
  stopwatch: StopwatchState;

  init(startedAt: number | null, stoppedAt: number | null): void; // 타이머 초기화
  start: (current?: number) => void; // 타이머 시작
  stop: (current?: number) => void; // 타이머 정지
  reset: () => void; // 타이머 초기화

  getStopwatchState: () => StopwatchState; // 현재 타이머 상태 가져오기
}

export const useStopwatchStore = create<InternalStopwatchSlice>()(
  immer((set, get) => ({
    // Initial state
    stopwatch: {
      startedAt: null, // 타이머 시작 시간 (ms), null이면 타이머가 정지되어 있음
      stoppedAt: null, // 타이머 정지 시간 (ms), null이면 타이머가 시작되지 않았거나 아직 정지되지 않음
    },

    // Actions
    init: (startedAt: number | null, stoppedAt: number | null) => {
      set((s) => {
        s.stopwatch.startedAt = startedAt ?? null;
        s.stopwatch.stoppedAt = stoppedAt ?? null;
      });
    },
    start: (current: number = Date.now()) => {
      set((s) => {
        s.stopwatch.startedAt = current;
        s.stopwatch.stoppedAt = null; // 타이머가 시작되면 정지 시간은 null로 설정
      });
    },
    stop: (current: number = Date.now()) => {
      set((s) => {
        s.stopwatch.stoppedAt = current;
      });
    },
    reset: () => {
      set((s) => {
        s.stopwatch.startedAt = null;
        s.stopwatch.stoppedAt = null;
      });
    },

    getStopwatchState: () => {
      return get().stopwatch;
    },
  })),
);
