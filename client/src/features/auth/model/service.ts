import type { User, UserRepository } from "@/entities/user";
import type { AuthRepository } from "../api/types";
import { useAuthStore } from "./store.zustand";
import type { AuthService, AuthState, LoginForm } from "./types";
import { parseSessionCredential } from "./validation";

interface AuthServiceProps {
  userRepository: UserRepository;
  authRepository: AuthRepository;
}

/**
 * 세션 정보 (내부적으로만 사용)
 */
interface SessionCredential {
  sessionKey?: string;
  expiresAt?: number;
}

export const createAuthService = ({ userRepository, authRepository }: AuthServiceProps): AuthService => {
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
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      const validated = parseSessionCredential(parsed);

      if (!validated) {
        // 잘못된 세션 데이터가 있으면 정리
        localStorage.removeItem(storageKey);
        return null;
      }

      return validated;
    } catch (error) {
      console.warn("세션 로드 실패:", error);
      // 파싱 실패 시에도 localStorage 정리
      localStorage.removeItem(storageKey);
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
  const login = async (credentials: LoginForm): Promise<User> => {
    try {
      const sessionKey = await authRepository.login(credentials);

      if (!sessionKey) {
        throw new Error("로그인에 실패했습니다.");
      }

      saveSession(sessionKey);

      // 로그인 성공 시 사용자 정보 조회
      const user = await userRepository.getCurrentUser();
      if (!user) {
        throw new Error("사용자 정보를 가져오는 데 실패했습니다.");
      }

      // 상태 업데이트
      useAuthStore.getState().setAuth(user, true);

      return user;
    } catch (error) {
      clearSession();
      useAuthStore.getState().clearAuth();
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authRepository.logout();
    } catch (error) {
      console.warn("로그아웃 API 호출 실패:", error);
    } finally {
      useAuthStore.getState().clearAuth();
      clearSession();
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
    return useAuthStore((state) => state.authState);
  };

  return {
    // Authentication functions (인증 관리)
    auth: {
      login,
      logout,
      restoreSession,
    },

    // Session functions (세션 관리)
    session: {
      getSessionKey,
      updateUser,
    },

    // Subscription hooks (상태 구독)
    use: {
      auth: useAuth,
    },
  };
};
