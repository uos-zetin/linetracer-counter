import { describe, it, expect } from "vitest";
import { integrateLogs } from "../reducers";

import type { TimerLogDto } from "@/shared/api/models";

describe("integrateLogs", () => {
  const base = 1_000_000;

  it("should accumulate time between start and stop", () => {
    const logs: TimerLogDto[] = [
      { id: "1", participantId: "x", type: "start", value: base, createdAt: new Date(base) },
      { id: "2", participantId: "x", type: "stop", value: base + 5000, createdAt: new Date(base + 5000) },
    ];

    const result = integrateLogs(10000, logs);
    expect(result.startedAt).toBe(null);
    expect(result.accumulatedMs).toBe(5000);
  });

  it("should compute offset correctly for add/sub", () => {
    const logs: TimerLogDto[] = [
      { id: "a", participantId: "x", type: "add", value: 3000, createdAt: new Date() },
      { id: "b", participantId: "x", type: "sub", value: 1000, createdAt: new Date() },
    ];

    const result = integrateLogs(8000, logs);
    expect(result.offsetMs).toBe(2000);
  });
});
