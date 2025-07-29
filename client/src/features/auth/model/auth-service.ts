import type { User, UserRepository } from "@/entities/user";
import { useAuthStore } from "./store.zustand";
import type { AuthState, AuthService } from "./types";

interface AuthServiceProps {
  userRepository: UserRepository;
}

/**
 * 세션 정보 (내부적으로만 사용)
 */
interface SessionCredential {
  sessionKey?: string;
  expiresAt?: number;
}

export const createAuthService = ({ userRepository }: AuthServiceProps): AuthService => {
  const storageKey = "user_session";
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

  // Service 메서드들
  const login = async (userName: string, password: string): Promise<User> => {
    try {
      const loginResult = await userRepository.loginUser({ userName, password });

      if (!loginResult) {
        throw new Error("로그인에 실패했습니다.");
      }

      saveSession(loginResult);

      // 로그인 성공 시 사용자 정보 조회
      const user = await userRepository.getCurrentUser();
      if (!user) {
        throw new Error("사용자 정보를 가져오는 데 실패했습니다.");
      }

      // 상태 업데이트
      useAuthStore.getState().setAuth(user, true);

      // 세션 저장

      return user;
    } catch (error) {
      clearSession();
      useAuthStore.getState().clearAuth();
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await userRepository.logoutUser();
    } catch (error) {
      console.warn("로그아웃 API 호출 실패:", error);
    } finally {
      useAuthStore.getState().clearAuth();
      clearSession();
    }
  };

  const register = async (name: string, userName: string, password: string): Promise<User> => {
    try {
      await userRepository.registerUser({ name, userName, password });

      // 등록 후 자동 로그인
      return await login(userName, password);
    } catch (error) {
      clearSession();
      useAuthStore.getState().clearAuth();
      throw error;
    }
  };

  const restoreSession = async (): Promise<User | null> => {
    const session = loadSession();

    if (!session || !session.sessionKey) {
      return null;
    }

    // 세션 만료 체크
    if (session.expiresAt && Date.now() > session.expiresAt) {
      clearSession();
      useAuthStore.getState().clearAuth();
      return null;
    }

    try {
      const user = await userRepository.getCurrentUser();

      if (user) {
        useAuthStore.getState().setAuth(user, true);
        return user;
      } else {
        clearSession();
        useAuthStore.getState().clearAuth();
        return null;
      }
    } catch {
      clearSession();
      useAuthStore.getState().clearAuth();
      return null;
    }
  };

  const getSessionKey = (): string | null => {
    const session = loadSession();
    return session?.sessionKey || null;
  };

  const updateUser = (user: User): void => {
    useAuthStore.getState().setAuth(user, true);
  };

  const useAuth = (): AuthState => {
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return { user, isAuthenticated };
  };

  return {
    login,
    logout,
    register,
    restoreSession,
    useAuth,
    getSessionKey,
    updateUser,
  };
};
