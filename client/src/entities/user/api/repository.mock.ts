import type { User, UserRole } from "../model/types";
import type { LoginUserDto, RegisterUserDto, UserRepository } from "./types";

/**
 * Mock User Repository Implementation
 * 메모리 기반 사용자 데이터 저장 및 관리를 위한 Mock Repository
 */
export class MockUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();
  private userCredentials: Map<string, { userName: string; password: string }> = new Map();
  private currentUserId: string | null = null;
  private sessionKeys: Set<string> = new Set();

  constructor() {
    this.initializeMockData();
  }

  /**
   * 초기 Mock 데이터 생성
   */
  private initializeMockData(): void {
    const mockUsers: Array<{ user: User; credentials: { userName: string; password: string } }> = [
      {
        user: {
          id: "user-001",
          name: "김관리자",
          roles: ["administrator"],
          createdAt: new Date("2024-01-15T09:00:00Z"),
        },
        credentials: { userName: "admin", password: "admin123" },
      },
      {
        user: {
          id: "user-002",
          name: "박심판",
          roles: ["manualRecorder"],
          createdAt: new Date("2024-02-01T10:30:00Z"),
        },
        credentials: { userName: "judge01", password: "judge123" },
      },
      {
        user: {
          id: "user-003",
          name: "이기록원",
          roles: ["stopwatchRecorder"],
          createdAt: new Date("2024-02-15T14:20:00Z"),
        },
        credentials: { userName: "recorder01", password: "record123" },
      },
      {
        user: {
          id: "user-004",
          name: "최운영진",
          roles: ["administrator", "manualRecorder"],
          createdAt: new Date("2024-03-01T08:45:00Z"),
        },
        credentials: { userName: "operator", password: "op123" },
      },
      {
        user: {
          id: "user-005",
          name: "정기록자",
          roles: ["stopwatchRecorder"],
          createdAt: new Date("2024-03-10T16:00:00Z"),
        },
        credentials: { userName: "timer01", password: "timer123" },
      },
    ];

    mockUsers.forEach(({ user, credentials }) => {
      this.users.set(user.id, user);
      this.userCredentials.set(user.id, credentials);
    });
  }

  /**
   * 세션 키 생성
   */
  private generateSessionKey(): string {
    const sessionKey = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    this.sessionKeys.add(sessionKey);
    return sessionKey;
  }

  /**
   * 사용자 이름으로 사용자 ID 찾기
   */
  private findUserIdByUserName(userName: string): string | null {
    for (const [userId, credentials] of this.userCredentials.entries()) {
      if (credentials.userName === userName) {
        return userId;
      }
    }
    return null;
  }

  /**
   * 고유한 사용자 ID 생성
   */
  private generateUserId(): string {
    let id: string;
    do {
      id = `user-${String(Date.now()).slice(-6)}-${Math.random().toString(36).substr(2, 4)}`;
    } while (this.users.has(id));
    return id;
  }

  async getAllUsers(): Promise<User[]> {
    // 관리자만 모든 사용자 조회 가능
    if (!this.currentUserId) {
      throw new Error("인증이 필요합니다.");
    }

    const currentUser = this.users.get(this.currentUserId);
    if (!currentUser?.roles.includes("administrator")) {
      throw new Error("관리자 권한이 필요합니다.");
    }

    return Array.from(this.users.values()).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.currentUserId) {
      return null;
    }

    return this.users.get(this.currentUserId) || null;
  }

  async registerUser(user: RegisterUserDto): Promise<User> {
    // 사용자명 중복 확인
    const existingUserId = this.findUserIdByUserName(user.userName);
    if (existingUserId) {
      throw new Error("이미 존재하는 사용자명입니다.");
    }

    // 비밀번호 유효성 검사
    if (user.password.length < 6) {
      throw new Error("비밀번호는 6자 이상이어야 합니다.");
    }

    // 이름 유효성 검사
    if (!user.name.trim()) {
      throw new Error("이름은 필수입니다.");
    }

    const userId = this.generateUserId();
    const newUser: User = {
      id: userId,
      name: user.name.trim(),
      roles: [], // 새 사용자는 기본적으로 역할 없음
      createdAt: new Date(),
    };

    this.users.set(userId, newUser);
    this.userCredentials.set(userId, {
      userName: user.userName,
      password: user.password,
    });

    return newUser;
  }

  async loginUser(user: LoginUserDto): Promise<string> {
    const userId = this.findUserIdByUserName(user.userName);
    if (!userId) {
      return ""; // 사용자 없음
    }

    const credentials = this.userCredentials.get(userId);
    if (!credentials || credentials.password !== user.password) {
      return ""; // 비밀번호 틀림
    }

    const userData = this.users.get(userId);
    if (!userData) {
      return ""; // 사용자 데이터 없음
    }

    // 로그인 성공
    this.currentUserId = userId;
    const sessionKey = this.generateSessionKey();

    return sessionKey;
  }

  async logoutUser(): Promise<void> {
    if (!this.currentUserId) {
      throw new Error("로그인된 사용자가 없습니다.");
    }

    this.currentUserId = null;
    // 실제 구현에서는 특정 세션 키만 제거해야 하지만,
    // 간단한 mock에서는 모든 세션 키를 클리어
    this.sessionKeys.clear();
  }

  async updateUserRoles(userId: string, roles: UserRole[]): Promise<User> {
    // 관리자만 역할 변경 가능
    if (!this.currentUserId) {
      throw new Error("인증이 필요합니다.");
    }

    const currentUser = this.users.get(this.currentUserId);
    if (!currentUser?.roles.includes("administrator")) {
      throw new Error("관리자 권한이 필요합니다.");
    }

    const targetUser = this.users.get(userId);
    if (!targetUser) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    // 유효한 역할인지 확인
    const validRoles: UserRole[] = ["administrator", "manualRecorder", "stopwatchRecorder"];
    const invalidRoles = roles.filter((role) => !validRoles.includes(role));
    if (invalidRoles.length > 0) {
      throw new Error(`유효하지 않은 역할: ${invalidRoles.join(", ")}`);
    }

    // 역할 업데이트
    const updatedUser: User = {
      ...targetUser,
      roles: [...roles], // 배열 복사
    };

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async deleteUser(userId: string): Promise<void> {
    // 관리자만 사용자 삭제 가능
    if (!this.currentUserId) {
      throw new Error("인증이 필요합니다.");
    }

    const currentUser = this.users.get(this.currentUserId);
    if (!currentUser?.roles.includes("administrator")) {
      throw new Error("관리자 권한이 필요합니다.");
    }

    // 자기 자신은 삭제할 수 없음
    if (userId === this.currentUserId) {
      throw new Error("자기 자신을 삭제할 수 없습니다.");
    }

    const targetUser = this.users.get(userId);
    if (!targetUser) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    this.users.delete(userId);
    this.userCredentials.delete(userId);
  }

  /**
   * Mock 전용 유틸리티 메서드들
   */

  /**
   * 현재 로그인된 사용자 ID 반환 (테스트용)
   */
  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  /**
   * 모든 사용자 데이터 리셋 (테스트용)
   */
  reset(): void {
    this.users.clear();
    this.userCredentials.clear();
    this.currentUserId = null;
    this.sessionKeys.clear();
    this.initializeMockData();
  }

  /**
   * 특정 사용자로 강제 로그인 (테스트용)
   */
  forceLogin(userId: string): void {
    if (this.users.has(userId)) {
      this.currentUserId = userId;
    } else {
      throw new Error("존재하지 않는 사용자입니다.");
    }
  }

  /**
   * 사용자 자격 증명 정보 조회 (테스트용)
   */
  getUserCredentials(userId: string): { userName: string; password: string } | null {
    return this.userCredentials.get(userId) || null;
  }
}
