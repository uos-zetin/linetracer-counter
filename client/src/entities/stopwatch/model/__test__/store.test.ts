import { getElapsedMs } from "../selectors";
import { useStopwatchStore as _useStopwatchStore } from "../slice.zustand";

import type { StopwatchState } from "../types";

beforeEach(() => {
  vi.useFakeTimers();
  _useStopwatchStore.setState(_useStopwatchStore.getInitialState());
});

describe("useStopwatchStore integration", () => {
  it("sets stopwatch correctly", () => {
    const base = Date.now();
    const firstState: StopwatchState = {
      startedAt: base - 10000,
      stoppedAt: base - 5000,
    };

    _useStopwatchStore.getState().init(firstState.startedAt, firstState.stoppedAt);

    let elapsedTime = getElapsedMs(_useStopwatchStore.getState().stopwatch, base);
    expect(elapsedTime).toBe(5000); // 10초 - 5초

    _useStopwatchStore.getState().init(base - 100000, null);
    elapsedTime = getElapsedMs(_useStopwatchStore.getState().stopwatch, base);
    expect(elapsedTime).toBe(100000); // 100초
  });

  it("measures approximately 5000ms when stopped after 5s", () => {
    const deltaMs = 500000;

    const store = _useStopwatchStore.getState();

    store.start();

    // 시간 5000ms 경과
    vi.advanceTimersByTime(deltaMs);

    store.stop();

    const elapsed = store.getElapsedMs();
    console.log("Elapsed time:", elapsed);

    // 오차 10ms 이내 허용
    expect(elapsed).toBeGreaterThanOrEqual(deltaMs - 10);
    expect(elapsed).toBeLessThanOrEqual(deltaMs + 10);
  });
});
