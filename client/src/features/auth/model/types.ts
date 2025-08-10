import type { User } from "@/entities/user";

export interface LoginForm {
  userName: string;
  password: string;
}

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
};

export interface AuthActions {
  setAuth: (user: User | null, isAuthenticated: boolean) => void;
  clearAuth: () => void;
}

export interface AuthStore extends AuthActions {
  authState: AuthState;
}

export interface AuthService {
  // Authentication functions (인증 관리)
  auth: {
    login: (credentials: LoginForm) => Promise<User>;
    logout: () => Promise<void>;
    restoreSession: () => Promise<User | null>;
  };

  // Session functions (세션 관리)
  session: {
    getSessionKey: () => string | null;
    updateUser: (user: User) => void;
  };

  // Subscription hooks (상태 구독)
  use: {
    auth: () => AuthState;
  };
}
