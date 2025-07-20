import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { User, UserState, UserActions } from "./types";
import type { UserRepository } from "../api/types";

/**
 * 세션 정보 (내부적으로만 사용)
 */
interface SessionCredential {
  sessionKey?: string;
  expiresAt?: number;
}

/**
 * Zustand 기반 User Store를 생성하는 팩토리 함수
 */
export const createZustandUserStore = (userRepository: UserRepository) => {
  const storageKey = "user_session";
  const userStoreKey = "user-store";
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

  // zustand store 생성
  return create<UserState & UserActions>()(
    persist(
      immer((set) => ({
        // 상태
        user: null,
        isAuthenticated: false,

        // 액션들
        login: async (userName: string, password: string): Promise<User> => {
          try {
            const loginResult = await userRepository.loginUser({ userName, password });

            if (!loginResult) {
              throw new Error("로그인에 실패했습니다.");
            }

            // 사용자 정보 저장
            set((state) => {
              state.user = loginResult.user;
              state.isAuthenticated = true;
            });

            // 서버에서 받은 실제 세션 키 저장
            saveSession(loginResult.sessionKey);

            return loginResult.user;
          } catch (error) {
            clearSession();
            set((state) => {
              state.user = null;
              state.isAuthenticated = false;
            });
            throw error;
          }
        },

        logout: async (): Promise<void> => {
          try {
            await userRepository.logoutUser();
          } catch (error) {
            // 로그아웃 API 실패해도 로컬 상태는 정리
            console.warn("로그아웃 API 호출 실패:", error);
          } finally {
            set((state) => {
              state.user = null;
              state.isAuthenticated = false;
            });
            clearSession();
          }
        },

        register: async (name: string, userName: string, password: string): Promise<User> => {
          try {
            await userRepository.registerUser({ name, userName, password });

            // 등록 후 자동 로그인 처리
            const loginResult = await userRepository.loginUser({ userName, password });

            if (!loginResult) {
              throw new Error("등록 후 자동 로그인에 실패했습니다.");
            }

            set((state) => {
              state.user = loginResult.user;
              state.isAuthenticated = true;
            });
            saveSession(loginResult.sessionKey);

            return loginResult.user;
          } catch (error) {
            clearSession();
            set((state) => {
              state.user = null;
              state.isAuthenticated = false;
            });
            throw error;
          }
        },

        restoreSession: async (): Promise<User | null> => {
          const session = loadSession();

          if (!session || !session.sessionKey) {
            return null;
          }

          // 세션 만료 체크
          if (session.expiresAt && Date.now() > session.expiresAt) {
            clearSession();
            set((state) => {
              state.user = null;
              state.isAuthenticated = false;
            });
            return null;
          }

          try {
            // 저장된 세션 키로 현재 사용자 정보 조회
            const user = await userRepository.getCurrentUser();

            if (user) {
              set((state) => {
                state.user = user;
                state.isAuthenticated = true;
              });
              return user;
            } else {
              clearSession();
              set((state) => {
                state.user = null;
                state.isAuthenticated = false;
              });
              return null;
            }
          } catch {
            clearSession();
            set((state) => {
              state.user = null;
              state.isAuthenticated = false;
            });
            return null;
          }
        },

        updateUser: (user: User): void => {
          set((state) => {
            state.user = user;
            state.isAuthenticated = true;
          });
        },
      })),
      {
        name: userStoreKey, // localStorage key for user data
        partialize: (state) => ({
          // persist할 상태만 선택 (세션은 별도 저장)
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
  );
};
