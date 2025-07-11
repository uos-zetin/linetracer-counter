import { describe, it, expect, beforeEach, vi } from "vitest";

import { useProgressStore } from "../slice.zustand";
import type { Progress } from "../types";
import type { Competition } from "@/entities/competition";
import type { Division } from "@/entities/division";

/* ------------------------------------------------------------------ */
/*  테스트 유틸                                                        */
/* ------------------------------------------------------------------ */
function createDummyProgress(id = "p-1"): Progress {
  return {
    id,
    competition: { id: "c-1", name: "Fake Competition" } as Competition,
    division: { id: "d-1", name: "Fake Division" } as Division,
    runner: null,
    nextRunners: [],
    topRecords: [],
  };
}

function resetStore() {
  useProgressStore.getState().reset();
}

/* ------------------------------------------------------------------ */
/*  테스트 케이스                                                      */
/* ------------------------------------------------------------------ */
describe("ProgressStore (zustand)", () => {
  beforeEach(resetStore);

  it("sets progress correctly", () => {
    // Arrange
    const progress = createDummyProgress();

    // Act
    useProgressStore.getState().setProgress(progress);

    // Assert
    expect(useProgressStore.getState().progress).toEqual(progress);
  });

  it("clears progress correctly", () => {
    // Arrange
    useProgressStore.getState().setProgress(createDummyProgress());

    // Act
    useProgressStore.getState().reset();

    // Assert
    expect(useProgressStore.getState().progress).toBeNull();
  });

  it("notifies subscribers and supports unsubscription", () => {
    // Arrange
    const listener = vi.fn();
    const unsubscribe = useProgressStore.subscribe((state) => {
      listener(state.progress);
    });
    const progress = createDummyProgress();

    // Act
    useProgressStore.getState().setProgress(progress);
    unsubscribe(); // 구독 해제 후
    useProgressStore.getState().reset(); // 더 이상 호출되면 안 됨

    // Assert
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(progress);
  });
});
