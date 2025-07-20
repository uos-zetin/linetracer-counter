import { createContext, useContext } from "react";

import { createZustandUserStore } from "../model/slice.zustand";
import { createReactUserStore } from "../model/slice.react";
import type { UserState, UserActions } from "../model/types";
import type { UserRepository } from "../api/types";
import type { SessionProvider } from "@/shared";

// 상태 관리 방식 타입
type StateManagerType = "zustand" | "react";

// 어떤 구현체를 사용할지 결정 (환경변수로 제어)
const STATE_MANAGER: StateManagerType = (import.meta.env.VITE_STATE_MANAGER as StateManagerType) || "zustand";

// 통일된 Store 타입 - selector 함수를 받아서 결과를 반환
type UserStore = <T>(selector: (state: UserState & UserActions) => T) => T;

/**
 * User Context
 */
export const UserContext = createContext<UserStore | null>(null);

/**
 * User Provider 팩토리 함수 반환 타입
 */
interface UserProviderFactory {
  UserProvider: React.ComponentType<{ children: React.ReactNode }>;
  sessionProvider: SessionProvider;
}

/**
 * User Provider 팩토리 함수
 */
export const createUserProvider = (userRepository: UserRepository): UserProviderFactory => {
  switch (STATE_MANAGER) {
    case "zustand": {
      // Zustand 방식
      const store = createZustandUserStore(userRepository);

      // 세션 키는 내부에서만 접근 가능
      const sessionProvider: SessionProvider = {
        getSessionKey: () => {
          try {
            const session = JSON.parse(localStorage.getItem("user_session") || "{}");
            return session?.sessionKey || null;
          } catch {
            return null;
          }
        },
      };

      return {
        UserProvider: ({ children }: { children: React.ReactNode }) => (
          <UserContext.Provider value={store}>{children}</UserContext.Provider>
        ),
        sessionProvider,
      };
    }

    case "react": {
      // React 방식
      const useReactStore = createReactUserStore(userRepository);

      // 세션 키는 내부에서만 접근 가능
      const sessionProvider: SessionProvider = {
        getSessionKey: () => {
          try {
            const session = JSON.parse(localStorage.getItem("user_session") || "{}");
            return session?.sessionKey || null;
          } catch {
            return null;
          }
        },
      };

      return {
        UserProvider: ({ children }: { children: React.ReactNode }) => {
          const store = useReactStore();
          return <UserContext.Provider value={store}>{children}</UserContext.Provider>;
        },
        sessionProvider,
      };
    }

    default: {
      throw new Error(`Unsupported state manager: ${STATE_MANAGER}`);
    }
  }
};

/**
 * User Hook
 */
export const useUser = () => {
  const store = useContext(UserContext);
  if (!store) {
    throw new Error("useUser must be used within UserProvider");
  }
  return store;
};
