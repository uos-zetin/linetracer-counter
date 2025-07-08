import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { integrateLogs } from "./reducers";
import { getRemainingMs, getStatus } from "./selectors";

import type { Timer } from "./types";
import type { TimerLogDto } from "@/shared";

interface InternalTimerSlice {
  timer: Timer;

  // 상태 변경 함수
  setTimer: (initialMs: number, logs: TimerLogDto[]) => void;
  updateLogs: (logs: TimerLogDto[]) => void;

  // 파생값 계산 함수
  getRemainingMs: () => number;
  getStatus: () => "running" | "stopped" | "finished";
}

export const useTimerStore = create<InternalTimerSlice>()(
  immer((set, get) => ({
    // Initial state
    timer: {
      current: { initialMs: 0, offsetMs: 0, accumulatedMs: 0, startedAt: null },
      timerLogs: [],
    },

    // Actions
    setTimer: (initialMs, timerLogs) => {
      const logs = [...timerLogs].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      set((s) => {
        s.timer.timerLogs = logs;
        s.timer.current = integrateLogs(initialMs, logs);
      });
    },

    updateLogs: (timerLogs) => {
      const logs = [...timerLogs].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      set((s) => {
        const init = s.timer.current.initialMs;
        s.timer.timerLogs = logs;
        s.timer.current = integrateLogs(init, logs);
      });
    },

    // Selectors
    getRemainingMs: () => getRemainingMs(get().timer.current),
    getStatus: () => getStatus(get().timer.current),
  })),
);
