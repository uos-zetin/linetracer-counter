import { useState, useCallback } from "react";
import type { StopwatchState, StopwatchStore } from "./types";
import { isRunning, getElapsedMs as calcElapsedMs, type StopwatchSelector } from "../lib/selectors";

/**
 * React useState 기반 Stopwatch Store를 생성하는 팩토리 함수
 * zustand와 동일한 API를 제공합니다
 */
export const createReactStopwatchStore = (): (() => StopwatchSelector) => {
  return () => {
    // State
    const [state, setState] = useState<StopwatchState>({
      startedAt: null,
      stoppedAt: null,
    });

    // Actions
    const init = useCallback((startedAt: number | null, stoppedAt: number | null) => {
      setState({ startedAt, stoppedAt });
    }, []);

    const start = useCallback((current: number = Date.now()) => {
      setState({ startedAt: current, stoppedAt: null });
    }, []);

    const stop = useCallback((current: number = Date.now()) => {
      setState((prev) => ({ ...prev, stoppedAt: current }));
    }, []);

    const reset = useCallback(() => {
      setState({ startedAt: null, stoppedAt: null });
    }, []);

    // Getters
    const getIsRunning = useCallback(() => isRunning(state), [state]);

    const getElapsedMs = useCallback((now: number = Date.now()) => calcElapsedMs(state, now), [state]);

    // zustand와 동일한 selector 방식 API 제공
    const selector: StopwatchSelector = useCallback(
      (sel) =>
        sel({
          ...state,
          init,
          start,
          stop,
          reset,
          getIsRunning,
          getElapsedMs,
        } satisfies StopwatchStore),
      [state, init, start, stop, reset, getIsRunning, getElapsedMs],
    );

    return selector;
  };
};
