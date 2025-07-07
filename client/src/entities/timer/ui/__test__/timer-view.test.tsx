import { act, render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { TimerView } from "../timer-view";
import { useTimerStore as _useTimerStore } from "@/entities/timer/model/slice.zustand";

describe("TimerView", () => {
  beforeEach(() => {
    _useTimerStore.setState(_useTimerStore.getInitialState());
  });

  it("renders formatted remaining time and status", () => {
    const now = Date.now();
    _useTimerStore.getState().setTimer(10_000, [
      {
        id: "1",
        participantId: "abc",
        type: "start",
        value: now,
        createdAt: new Date(now),
      },
      {
        id: "2",
        participantId: "abc",
        type: "stop",
        value: now + 3000,
        createdAt: new Date(now + 3000),
      },
    ]);

    render(<TimerView />);

    expect(screen.getByTitle("Remaining Time")).toBeInTheDocument();
    expect(screen.getByText("stopped")).toBeInTheDocument();
    expect(screen.getByText("00:00:07")).toBeInTheDocument();
  });

  it("re-renders TimerView when timer changes", () => {
    const { getByTitle } = render(<TimerView />);

    // 초기값
    expect(getByTitle("Remaining Time").textContent).toBe("00:00:00");

    // 현재 시각
    const now = Date.now();

    // 상태 변경: 타이머 초기 시간 5000ms
    act(() => {
      _useTimerStore.getState().setTimer(5000, [
        {
          id: "start-log",
          participantId: "abc",
          type: "start",
          value: now,
          createdAt: new Date(now),
        },
        {
          id: "stop-log",
          participantId: "abc",
          type: "stop",
          value: now + 2000, // 2초 후 정지
          createdAt: new Date(now + 2000),
        },
      ]);
    });

    // 리렌더링 감지 (남은 시간: 5000 - 2000 = 3000ms = 3초)
    expect(getByTitle("Remaining Time").textContent).toBe("00:00:03");
  });
});
