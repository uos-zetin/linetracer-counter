import { createContext, useContext, useMemo } from "react";

import { createZustandStopwatchStore } from "../model/slice.zustand";
import { createReactStopwatchStore } from "../model/slice.react";
import type { StopwatchState, StopwatchActions } from "../model/types";

// 상태 관리 방식 타입
type StateManagerType = "zustand" | "react";

// 어떤 구현체를 사용할지 결정 (환경변수로 제어)
const STATE_MANAGER: StateManagerType = (import.meta.env.VITE_STATE_MANAGER as StateManagerType) || "zustand";

// 통일된 Store 타입 - selector 함수를 받아서 결과를 반환
type StopwatchStore = <T>(selector: (state: StopwatchState & StopwatchActions) => T) => T;

/**
 * Stopwatch Context
 */
export const StopwatchContext = createContext<StopwatchStore | null>(null);

/**
 * Stopwatch Provider 팩토리 함수
 */
export const createStopwatchProvider = () => {
  switch (STATE_MANAGER) {
    case "zustand": {
      // Zustand 방식
      const store = createZustandStopwatchStore();

      return ({ children }: { children: React.ReactNode }) => (
        <StopwatchContext.Provider value={store}>{children}</StopwatchContext.Provider>
      );
    }

    case "react": {
      // React 방식 - 컴포넌트 내부에서 hooks 사용
      return ({ children }: { children: React.ReactNode }) => {
        const store = useMemo(() => createReactStopwatchStore()(), []); // 컴포넌트 내부에서 호출

        return <StopwatchContext.Provider value={store}>{children}</StopwatchContext.Provider>;
      };
    }

    default: {
      throw new Error(`Unsupported state manager: ${STATE_MANAGER}`);
    }
  }
};

/**
 * Stopwatch Hook
 */
export const useStopwatch = () => {
  const store = useContext(StopwatchContext);
  if (!store) {
    throw new Error("useStopwatch must be used within StopwatchProvider");
  }
  return store;
};
