import { useState, useCallback } from "react";
import type { StopwatchState, StopwatchActions } from "./types";

/**
 * React useState 기반 Stopwatch Store를 생성하는 팩토리 함수
 * zustand와 동일한 API를 제공합니다
 */
export const createReactStopwatchStore = () => {
  return () => {
    const [state, setState] = useState<StopwatchState>({
      startedAt: null,
      stoppedAt: null,
    });

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

    // zustand와 동일한 selector 방식 API 제공
    const selectorAPI = useCallback(
      <T>(selector: (state: StopwatchState & StopwatchActions) => T): T => {
        return selector({
          startedAt: state.startedAt,
          stoppedAt: state.stoppedAt,
          init,
          start,
          stop,
          reset,
        });
      },
      [state.startedAt, state.stoppedAt, init, start, stop, reset],
    );

    return selectorAPI;
  };
};
