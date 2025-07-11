import { describe, it, expect, beforeEach } from "vitest";
import { useTimerStore as _useTimerStore } from "../slice.zustand"; // 내부 store
import type { TimerLog } from "@/entities/timer-log";

// helper: zustand 상태 초기화 (테스트 간 state 공유 방지)
beforeEach(() => {
  _useTimerStore.setState(_useTimerStore.getInitialState());
});

describe("useTimerStore integration", () => {
  const base = Date.now();

  it("sets timer correctly and updates state", () => {
    const logs: TimerLog[] = [
      {
        id: "1",
        participantId: "abc",
        type: "start",
        value: base,
        createdAt: new Date(base),
      },
      {
        id: "2",
        participantId: "abc",
        type: "stop",
        value: base + 5000,
        createdAt: new Date(base + 5000),
      },
    ];

    _useTimerStore.getState().setTimer(10000, logs);

    const remaining = _useTimerStore.getState().getRemainingMs();
    const status = _useTimerStore.getState().getStatus();

    expect(remaining).toBe(10000 - 5000); // 남은 시간
    expect(status).toBe("stopped"); // 타이머 멈춰있음
  });

  it("getStatus returns 'running' if startedAt is set", () => {
    const now = Date.now();
    const logs: TimerLog[] = [
      {
        id: "1",
        participantId: "abc",
        type: "start",
        value: now,
        createdAt: new Date(now),
      },
    ];

    _useTimerStore.getState().setTimer(5000, logs);
    const status = _useTimerStore.getState().getStatus();
    expect(status).toBe("running");
  });

  it("updateLogs overrides logs and updates timer state", () => {
    const logs1: TimerLog[] = [
      {
        id: "1",
        participantId: "abc",
        type: "start",
        value: base,
        createdAt: new Date(base),
      },
      {
        id: "2",
        participantId: "abc",
        type: "stop",
        value: base + 3000,
        createdAt: new Date(base + 3000),
      },
    ];

    const logs2: TimerLog[] = [
      ...logs1,
      {
        id: "3",
        participantId: "abc",
        type: "add",
        value: 2000,
        createdAt: new Date(base + 4000),
      },
    ];

    _useTimerStore.getState().setTimer(5000, logs1);
    const remaining1 = _useTimerStore.getState().getRemainingMs();

    _useTimerStore.getState().updateLogs(logs2);
    const remaining2 = _useTimerStore.getState().getRemainingMs();

    expect(remaining2).toBeGreaterThan(remaining1); // 시간이 늘어났음
  });
});
