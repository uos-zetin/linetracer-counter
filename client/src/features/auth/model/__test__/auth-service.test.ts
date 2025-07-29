import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthService } from "../auth-service";
import { useAuthStore } from "../store.zustand";
import type { UserRepository, User } from "@/entities/user";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock console
vi.spyOn(console, "warn").mockImplementation(() => {});

describe("createAuthService", () => {
  let mockUserRepository: UserRepository;
  let authService: ReturnType<typeof createAuthService>;

  const mockUser: User = {
    id: "user-1",
    name: "Test User",
    roles: [],
    createdAt: new Date(),
  };

  beforeEach(() => {
    // Arrange: Mock 및 스토어 초기화
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);

    mockUserRepository = {
      getAllUsers: vi.fn(),
      getCurrentUser: vi.fn(),
      registerUser: vi.fn(),
      loginUser: vi.fn(),
      logoutUser: vi.fn(),
      updateUserRoles: vi.fn(),
      deleteUser: vi.fn(),
    };

    authService = createAuthService({ userRepository: mockUserRepository });
    useAuthStore.getState().clearAuth();
  });

  describe("login", () => {
    it("성공적인 로그인 시 사용자 정보를 설정하고 세션을 저장해야 한다", async () => {
      // Arrange
      const sessionKey = "session-123";

      mockUserRepository.loginUser = vi.fn().mockResolvedValue(sessionKey);
      mockUserRepository.getCurrentUser = vi.fn().mockResolvedValue(mockUser);

      // Act
      const result = await authService.login("testuser", "password");

      // Assert
      expect(mockUserRepository.loginUser).toHaveBeenCalledWith({
        userName: "testuser",
        password: "password",
      });
      expect(mockUserRepository.getCurrentUser).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith("user_session", expect.stringContaining("session-123"));
    });

    it("로그인 실패 시 에러를 발생시키고 상태를 초기화해야 한다", async () => {
      // Arrange
      mockUserRepository.loginUser = vi.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login("testuser", "wrongpassword")).rejects.toThrow("로그인에 실패했습니다.");
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("user_session");
    });

    it("네트워크 에러 시 에러를 발생시키고 상태를 초기화해야 한다", async () => {
      // Arrange
      const networkError = new Error("네트워크 에러");
      mockUserRepository.loginUser = vi.fn().mockRejectedValue(networkError);

      // Act & Assert
      await expect(authService.login("testuser", "password")).rejects.toThrow("네트워크 에러");
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("user_session");
    });
  });

  describe("logout", () => {
    it("성공적인 로그아웃 시 상태를 초기화하고 세션을 제거해야 한다", async () => {
      // Arrange
      useAuthStore.getState().setAuth(mockUser, true);
      mockUserRepository.logoutUser = vi.fn().mockResolvedValue(undefined);

      // Act
      await authService.logout();

      // Assert
      expect(mockUserRepository.logoutUser).toHaveBeenCalled();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("user_session");
    });

    it("로그아웃 API 실패 시에도 상태를 초기화하고 세션을 제거해야 한다", async () => {
      // Arrange
      useAuthStore.getState().setAuth(mockUser, true);
      mockUserRepository.logoutUser = vi.fn().mockRejectedValue(new Error("API 에러"));

      // Act
      await authService.logout();

      // Assert
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("user_session");
      expect(console.warn).toHaveBeenCalledWith("로그아웃 API 호출 실패:", expect.any(Error));
    });
  });

  describe("register", () => {
    it("성공적인 회원가입 시 자동 로그인을 수행해야 한다", async () => {
      // Arrange
      const registerData = {
        name: "Test User",
        userName: "testuser",
        password: "password",
      };

      const sessionKey = "session-123";

      mockUserRepository.registerUser = vi.fn().mockResolvedValue(mockUser);
      mockUserRepository.loginUser = vi.fn().mockResolvedValue(sessionKey);
      mockUserRepository.getCurrentUser = vi.fn().mockResolvedValue(mockUser);

      // Act
      const result = await authService.register("Test User", "testuser", "password");

      // Assert
      expect(mockUserRepository.registerUser).toHaveBeenCalledWith(registerData);
      expect(mockUserRepository.loginUser).toHaveBeenCalledWith({
        userName: "testuser",
        password: "password",
      });
      expect(mockUserRepository.getCurrentUser).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it("회원가입 실패 시 에러를 발생시키고 상태를 초기화해야 한다", async () => {
      // Arrange
      const registerError = new Error("이미 존재하는 사용자입니다.");
      mockUserRepository.registerUser = vi.fn().mockRejectedValue(registerError);

      // Act & Assert
      await expect(authService.register("Test User", "testuser", "password")).rejects.toThrow(
        "이미 존재하는 사용자입니다.",
      );
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("user_session");
    });
  });

  describe("restoreSession", () => {
    it("유효한 세션이 있을 때 사용자 정보를 복원해야 한다", async () => {
      // Arrange
      const sessionData = {
        sessionKey: "session-123",
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24시간 후
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessionData));
      mockUserRepository.getCurrentUser = vi.fn().mockResolvedValue(mockUser);

      // Act
      const result = await authService.restoreSession();

      // Assert
      expect(mockUserRepository.getCurrentUser).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it("세션이 없을 때 null을 반환해야 한다", async () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue(null);

      // Act
      const result = await authService.restoreSession();

      // Assert
      expect(result).toBeNull();
      expect(mockUserRepository.getCurrentUser).not.toHaveBeenCalled();
    });

    it("만료된 세션일 때 세션을 제거하고 null을 반환해야 한다", async () => {
      // Arrange
      const expiredSessionData = {
        sessionKey: "session-123",
        expiresAt: Date.now() - 1000, // 1초 전 만료
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredSessionData));

      // Act
      const result = await authService.restoreSession();

      // Assert
      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("user_session");
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it("사용자 정보 조회 실패 시 세션을 제거하고 null을 반환해야 한다", async () => {
      // Arrange
      const sessionData = {
        sessionKey: "session-123",
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessionData));
      mockUserRepository.getCurrentUser = vi.fn().mockRejectedValue(new Error("API 에러"));

      // Act
      const result = await authService.restoreSession();

      // Assert
      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("user_session");
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe("getSessionKey", () => {
    it("저장된 세션 키를 반환해야 한다", () => {
      // Arrange
      const sessionData = {
        sessionKey: "session-123",
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessionData));

      // Act
      const result = authService.getSessionKey();

      // Assert
      expect(result).toBe("session-123");
    });

    it("세션이 없을 때 null을 반환해야 한다", () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue(null);

      // Act
      const result = authService.getSessionKey();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("updateUser", () => {
    it("사용자 정보를 업데이트해야 한다", () => {
      // Arrange
      const updatedUser: User = {
        ...mockUser,
        name: "Updated User",
      };

      // Act
      authService.updateUser(updatedUser);

      // Assert
      expect(useAuthStore.getState().user).toEqual(updatedUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });
});
