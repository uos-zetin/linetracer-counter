export type UserRole = "administrator" | "manualRecorder" | "stopwatchRecorder";

export interface User {
  id: string;
  name: string;
  roles: UserRole[];
  createdAt: Date;
}

/**
 * 사용자 상태를 관리하는 Store 인터페이스
 * credential 정보는 내부적으로 처리되며 외부에 노출되지 않습니다.
 * 구현체에 상관없는 범용 인터페이스입니다.
 */
export interface UserStore {
  /**
   * 현재 사용자 정보를 반환 (인증되지 않은 경우 null)
   */
  getUser(): User | null;

  /**
   * 사용자가 인증되었는지 확인
   */
  getIsAuthenticated(): boolean;

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

  /**
   * 상태 변경을 구독
   * 구현체별로 다른 방식으로 구현될 수 있음
   */
  subscribe(callback: (user: User | null, isAuthenticated: boolean) => void): () => void;
}
