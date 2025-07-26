import { describe, it, expect } from "vitest";
import { getRemainingMs, getStatus } from "../selectors";
import type { TimerState } from "../../model/types";

describe("getRemainingMs", () => {
  it("returns remaining time when stopped", () => {
    const state: TimerState = {
      initialMs: 10000,
      offsetMs: 2000,
      accumulatedMs: 3000,
      startedAt: null,
    };

    expect(getRemainingMs(state)).toBe(10000 + 2000 - 3000);
  });
});

describe("getStatus", () => {
  it("returns 'running' if startedAt is set", () => {
    const state: TimerState = {
      initialMs: 10000,
      offsetMs: 0,
      accumulatedMs: 0,
      startedAt: Date.now(),
    };
    expect(getStatus(state)).toBe("running");
  });

  it("returns 'finished' if remaining time is 0 or negative", () => {
    const state: TimerState = {
      initialMs: 5000,
      offsetMs: 0,
      accumulatedMs: 5000,
      startedAt: null,
    };
    expect(getStatus(state)).toBe("finished");
  });
});
