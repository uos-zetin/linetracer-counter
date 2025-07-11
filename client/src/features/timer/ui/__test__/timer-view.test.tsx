import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { TimerView } from "../timer-view";
import { useTimerStore as _useTimerStore } from "@/features/timer/model/slice.zustand";

describe("TimerView (props version) - Time Flow", () => {
  const now = 1_000_000_000_000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    _useTimerStore.setState(_useTimerStore.getInitialState());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("updates TimerView with new props as time passes", () => {
    // 5초 타이머 시작 로그 설정
    act(() => {
      _useTimerStore.getState().setTimer(5000, [
        {
          id: "start-log",
          participantId: "abc",
          type: "start",
          value: now,
          createdAt: new Date(now),
        },
      ]);
    });

    const getProps = () => ({
      remainingMs: _useTimerStore.getState().getRemainingMs(),
      timerStatus: _useTimerStore.getState().getStatus(),
    });

    // 초기 렌더링
    const { rerender } = render(<TimerView {...getProps()} />);
    expect(screen.getByTitle("Remaining Time").textContent).toBe("00:00:05");

    // 2초 경과
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    rerender(<TimerView {...getProps()} />);
    expect(screen.getByTitle("Remaining Time").textContent).toBe("00:00:03");

    // 3초 더 경과 → 총 5초
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    rerender(<TimerView {...getProps()} />);
    expect(screen.getByTitle("Remaining Time").textContent).toBe("00:00:00");
  });
});
