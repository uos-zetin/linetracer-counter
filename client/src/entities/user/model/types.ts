export type UserRole = "administrator" | "manualRecorder" | "stopwatchRecorder";

export interface User {
  id: string;
  name: string;
  roles: UserRole[];
  createdAt: Date;
}

/**
 * 사용자 상태
 */
export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
}

/**
 * 사용자 관련 액션들
 */
export interface UserActions {
  /**
   * 사용자 로그인 처리
   * credential은 내부적으로 저장되며 사용자 정보만 반환
   */
  login(userName: string, password: string): Promise<User>;

  /**
   * 사용자 로그아웃 처리
   * credential과 사용자 정보 모두 제거
   */
  logout(): Promise<void>;

  /**
   * 사용자 등록 처리
   */
  register(name: string, userName: string, password: string): Promise<User>;

  /**
   * 저장된 credential로 자동 로그인 시도
   * 앱 시작 시나 페이지 새로고침 시 호출
   */
  restoreSession(): Promise<User | null>;

  /**
   * 사용자 정보 업데이트 (권한 변경 등)
   */
  updateUser(user: User): void;
}
