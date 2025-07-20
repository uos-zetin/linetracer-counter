import { useState, useCallback } from "react";
import type { User } from "./types";
import type { UserState, UserActions } from "./types";
import type { UserRepository } from "../api/types";

interface SessionCredential {
  sessionKey: string;
  expiresAt: number;
}

/**
 * React useState 기반 User Store 생성 함수
 */
export const createReactUserStore = (userRepository: UserRepository) => {
  const storageKey = "user_session"; // 세션 저장용
  const userStoreKey = "user-store"; // 사용자 상태 저장용
  const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24시간 후 만료

  /**
   * 세션 정보를 localStorage에 저장
   */
  const saveSession = (sessionKey: string): void => {
    try {
      const sessionData: SessionCredential = {
        sessionKey,
        expiresAt: Date.now() + SESSION_EXPIRY,
      };
      localStorage.setItem(storageKey, JSON.stringify(sessionData));
    } catch (error) {
      console.warn("세션 저장 실패:", error);
    }
  };

  /**
   * localStorage에서 세션 정보 로드
   */
  const loadSession = (): SessionCredential | null => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn("세션 로드 실패:", error);
      return null;
    }
  };

  /**
   * 세션 정보 정리
   */
  const clearSession = (): void => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn("세션 정리 실패:", error);
    }
  };

  /**
   * localStorage에서 사용자 상태 로드
   */
  const loadUserState = (): UserState => {
    try {
      const stored = localStorage.getItem(userStoreKey);
      return stored ? JSON.parse(stored) : { user: null, isAuthenticated: false };
    } catch (error) {
      console.warn("사용자 상태 로드 실패:", error);
      return { user: null, isAuthenticated: false };
    }
  };

  /**
   * localStorage에 사용자 상태 저장
   */
  const saveUserState = (state: UserState): void => {
    try {
      localStorage.setItem(userStoreKey, JSON.stringify(state));
    } catch (error) {
      console.warn("사용자 상태 저장 실패:", error);
    }
  };

  return () => {
    const [state, setState] = useState<UserState>(loadUserState);

    // 상태 변경 시 localStorage에 자동 저장
    const updateState = useCallback((newState: UserState) => {
      setState(newState);
      saveUserState(newState);
    }, []);

    const login = useCallback(
      async (userName: string, password: string): Promise<User> => {
        try {
          const loginResult = await userRepository.loginUser({ userName, password });

          if (!loginResult) {
            throw new Error("로그인에 실패했습니다.");
          }

          // 사용자 정보 저장
          const newState = { user: loginResult.user, isAuthenticated: true };
          updateState(newState);

          // 서버에서 받은 실제 세션 키 저장
          saveSession(loginResult.sessionKey);

          return loginResult.user;
        } catch (error) {
          clearSession();
          updateState({ user: null, isAuthenticated: false });
          throw error;
        }
      },
      [updateState],
    );

    const logout = useCallback(async (): Promise<void> => {
      try {
        await userRepository.logoutUser();
      } catch (error) {
        // 로그아웃 API 실패해도 로컬 상태는 정리
        console.warn("로그아웃 API 호출 실패:", error);
      } finally {
        updateState({ user: null, isAuthenticated: false });
        clearSession();
      }
    }, [updateState]);

    const register = useCallback(
      async (name: string, userName: string, password: string): Promise<User> => {
        try {
          await userRepository.registerUser({ name, userName, password });

          // 등록 후 자동 로그인 처리
          const loginResult = await userRepository.loginUser({ userName, password });

          if (!loginResult) {
            throw new Error("등록 후 자동 로그인에 실패했습니다.");
          }

          const newState = { user: loginResult.user, isAuthenticated: true };
          updateState(newState);
          saveSession(loginResult.sessionKey);

          return loginResult.user;
        } catch (error) {
          clearSession();
          updateState({ user: null, isAuthenticated: false });
          throw error;
        }
      },
      [updateState],
    );

    const restoreSession = useCallback(async (): Promise<User | null> => {
      const session = loadSession();

      if (!session || !session.sessionKey) {
        return null;
      }

      // 세션 만료 체크
      if (session.expiresAt && Date.now() > session.expiresAt) {
        clearSession();
        updateState({ user: null, isAuthenticated: false });
        return null;
      }

      try {
        // 저장된 세션 키로 현재 사용자 정보 조회
        const user = await userRepository.getCurrentUser();

        if (user) {
          updateState({ user, isAuthenticated: true });
          return user;
        } else {
          clearSession();
          updateState({ user: null, isAuthenticated: false });
          return null;
        }
      } catch {
        clearSession();
        updateState({ user: null, isAuthenticated: false });
        return null;
      }
    }, [updateState]);

    const updateUser = useCallback(
      (user: User): void => {
        updateState({ user, isAuthenticated: true });
      },
      [updateState],
    );

    // zustand와 동일한 selector 방식 API 제공
    const selectorAPI = useCallback(
      <T>(selector: (state: UserState & UserActions) => T): T => {
        return selector({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          login,
          logout,
          register,
          restoreSession,
          updateUser,
        });
      },
      [state.user, state.isAuthenticated, login, logout, register, restoreSession, updateUser],
    );

    return selectorAPI;
  };
};
