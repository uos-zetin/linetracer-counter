import type { User } from "@/entities/user";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AuthActions {
  setAuth: (user: User | null, isAuthenticated: boolean) => void;
  clearAuth: () => void;
}

export interface AuthGetters {
  getUser: () => User | null;
  getIsAuthenticated: () => boolean;
}

export interface AuthStore extends AuthState, AuthActions, AuthGetters {}

export interface AuthService {
  // 인증 관련 메서드
  login: (userName: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (name: string, userName: string, password: string) => Promise<User>;
  restoreSession: () => Promise<User | null>;

  // 상태 접근 훅 (Counter/Progress와 통일)
  useAuth: () => AuthState;

  // 세션 관리 (SessionProvider 호환)
  getSessionKey: () => string | null;

  // 사용자 업데이트
  updateUser: (user: User) => void;
}

export interface LoginCredentials {
  userName: string;
  password: string;
}

export interface RegisterData {
  name: string;
  userName: string;
  password: string;
}
