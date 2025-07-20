import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type { StopwatchState, StopwatchActions } from "./types";

/**
 * Zustand 기반 Stopwatch Store를 생성하는 팩토리 함수
 */
export const createZustandStopwatchStore = () => {
  return create<StopwatchState & StopwatchActions>()(
    immer((set) => ({
      // Initial state
      startedAt: null,
      stoppedAt: null,

      // Actions
      init: (startedAt: number | null, stoppedAt: number | null) => {
        set((state) => {
          state.startedAt = startedAt;
          state.stoppedAt = stoppedAt;
        });
      },

      start: (current: number = Date.now()) => {
        set((state) => {
          state.startedAt = current;
          state.stoppedAt = null; // 타이머가 시작되면 정지 시간은 null로 설정
        });
      },

      stop: (current: number = Date.now()) => {
        set((state) => {
          state.stoppedAt = current;
        });
      },

      reset: () => {
        set((state) => {
          state.startedAt = null;
          state.stoppedAt = null;
        });
      },
    })),
  );
};
