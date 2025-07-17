import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserStore } from "./types";
import type { UserRepository } from "../api/types";
import type { UseBoundStore, StoreApi } from "zustand";

/**
 * 세션 정보 (내부적으로만 사용)
 */
interface SessionCredential {
  sessionKey?: string;
  expiresAt?: number;
  // 필요에 따라 다른 세션 정보 추가 가능
}

/**
 * Zustand Store의 내부 상태
 */
interface ZustandUserState {
  user: User | null;
  isAuthenticated: boolean;
  login: (userName: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (name: string, userName: string, password: string) => Promise<User>;
  restoreSession: () => Promise<User | null>;
  updateUser: (user: User) => void;
}

/**
 * UserStore 인터페이스를 구현하는 Zustand 기반 클래스
 */
class ZustandUserStore implements UserStore {
  private store: UseBoundStore<StoreApi<ZustandUserState>>;
  private getAuthToken: () => string | null;

  constructor(store: UseBoundStore<StoreApi<ZustandUserState>>, getAuthToken: () => string | null) {
    this.store = store;
    this.getAuthToken = getAuthToken;
  }

  getUser(): User | null {
    return this.store.getState().user;
  }

  getIsAuthenticated(): boolean {
    return this.store.getState().isAuthenticated;
  }

  async login(userName: string, password: string): Promise<User> {
    return this.store.getState().login(userName, password);
  }

  async logout(): Promise<void> {
    return this.store.getState().logout();
  }

  async register(name: string, userName: string, password: string): Promise<User> {
    return this.store.getState().register(name, userName, password);
  }

  async restoreSession(): Promise<User | null> {
    return this.store.getState().restoreSession();
  }

  updateUser(user: User): void {
    this.store.getState().updateUser(user);
  }

  subscribe(callback: (user: User | null, isAuthenticated: boolean) => void): () => void {
    return this.store.subscribe((state: ZustandUserState) => callback(state.user, state.isAuthenticated));
  }

  /**
   * Zustand hook을 반환 (React 컴포넌트에서 사용)
   */
  useZustandStore() {
    return this.store;
  }

  /**
   * 세션 키 반환 (API 요청 시 사용)
   */
  getSessionKey(): string | null {
    return this.getAuthToken();
  }
}

/**
 * Zustand 기반 UserStore를 생성하는 팩토리 함수
 */
export const createZustandUserStore = (userRepository: UserRepository): ZustandUserStore => {
  const storageKey = "user_session";

  /**
   * 세션 정보를 localStorage에 저장
   */
  const saveSession = (sessionKey: string): void => {
    try {
      const sessionData: SessionCredential = {
        sessionKey,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24시간 후 만료
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
   * 현재 저장된 세션 키 반환 (API 요청 시 헤더에 사용)
   */
  const getSessionKey = (): string | null => {
    const session = loadSession();

    // 세션 만료 체크
    if (session?.expiresAt && Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }

    return session?.sessionKey || null;
  };

  // zustand store 생성
  const useZustandStore = create<ZustandUserState>()(
    persist(
      (set) => ({
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
            set({ user: loginResult.user, isAuthenticated: true });

            // 서버에서 받은 실제 세션 키 저장
            saveSession(loginResult.sessionKey);

            return loginResult.user;
          } catch (error) {
            clearSession();
            set({ user: null, isAuthenticated: false });
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
            set({ user: null, isAuthenticated: false });
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

            set({ user: loginResult.user, isAuthenticated: true });
            saveSession(loginResult.sessionKey);

            return loginResult.user;
          } catch (error) {
            clearSession();
            set({ user: null, isAuthenticated: false });
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
            set({ user: null, isAuthenticated: false });
            return null;
          }

          try {
            // 저장된 세션 키로 현재 사용자 정보 조회
            // getCurrentUser API가 세션 키를 헤더에 포함해서 요청
            const user = await userRepository.getCurrentUser();

            if (user) {
              set({ user, isAuthenticated: true });
              return user;
            } else {
              clearSession();
              set({ user: null, isAuthenticated: false });
              return null;
            }
          } catch {
            clearSession();
            set({ user: null, isAuthenticated: false });
            return null;
          }
        },

        updateUser: (user: User): void => {
          set({ user, isAuthenticated: true });
        },
      }),
      {
        name: "user-store", // localStorage key for user data
        partialize: (state) => ({
          // persist할 상태만 선택 (세션은 별도 저장)
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
  );

  return new ZustandUserStore(useZustandStore, getSessionKey);
};
