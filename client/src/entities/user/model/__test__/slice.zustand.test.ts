import { describe, it, expect, beforeEach, vi } from "vitest";

import { createZustandUserStore } from "../slice.zustand";
import type { UserStore, User } from "../../model/types";
import type { UserRepository, LoginResult } from "../../api/types";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("ZustandUserStore", () => {
  let mockUserRepository: UserRepository;
  let userStore: UserStore;

  const mockUser: User = {
    id: "user-1",
    name: "홍길동",
    roles: ["administrator"],
    createdAt: new Date("2024-01-01"),
  };

  const mockLoginResult: LoginResult = {
    user: mockUser,
    sessionKey: "session-key-123",
  };

  beforeEach(() => {
    // Arrange: Mock UserRepository 생성
    mockUserRepository = {
      getAllUsers: vi.fn(),
      getCurrentUser: vi.fn(),
      registerUser: vi.fn(),
      loginUser: vi.fn(),
      logoutUser: vi.fn(),
      updateUserRoles: vi.fn(),
      deleteUser: vi.fn(),
    };

    // localStorage 초기화
    localStorageMock.clear();
    vi.clearAllMocks();

    // UserStore 생성
    userStore = createZustandUserStore(mockUserRepository);
  });

  describe("initial state", () => {
    it("should have null user and false isAuthenticated initially", () => {
      // Act
      const user = userStore.getUser();
      const isAuthenticated = userStore.getIsAuthenticated();

      // Assert
      expect(user).toBeNull();
      expect(isAuthenticated).toBe(false);
    });
  });

  describe("login", () => {
    it("should login user successfully and update state", async () => {
      // Arrange
      vi.mocked(mockUserRepository.loginUser).mockResolvedValue(mockLoginResult);

      // Act
      const result = await userStore.login("gd-hong", "password123");

      // Assert
      expect(mockUserRepository.loginUser).toHaveBeenCalledWith({
        userName: "gd-hong",
        password: "password123",
      });
      expect(result).toEqual(mockUser);
      expect(userStore.getUser()).toEqual(mockUser);
      expect(userStore.getIsAuthenticated()).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith("user_session", expect.stringContaining("session-key-123"));
    });

    it("should throw error when login fails", async () => {
      // Arrange
      vi.mocked(mockUserRepository.loginUser).mockResolvedValue(null);

      // Act & Assert
      await expect(userStore.login("wrong-user", "wrong-password")).rejects.toThrow("로그인에 실패했습니다.");
      expect(userStore.getUser()).toBeNull();
      expect(userStore.getIsAuthenticated()).toBe(false);
    });

    it("should handle login API error", async () => {
      // Arrange
      const mockError = new Error("Network error");
      vi.mocked(mockUserRepository.loginUser).mockRejectedValue(mockError);

      // Act & Assert
      await expect(userStore.login("gd-hong", "password123")).rejects.toThrow("Network error");
      expect(userStore.getUser()).toBeNull();
      expect(userStore.getIsAuthenticated()).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("user_session");
    });
  });

  describe("logout", () => {
    it("should logout user successfully and clear state", async () => {
      // Arrange: 먼저 로그인 상태로 만들기
      vi.mocked(mockUserRepository.loginUser).mockResolvedValue(mockLoginResult);
      await userStore.login("gd-hong", "password123");

      vi.mocked(mockUserRepository.logoutUser).mockResolvedValue();

      // Act
      await userStore.logout();

      // Assert
      expect(mockUserRepository.logoutUser).toHaveBeenCalled();
      expect(userStore.getUser()).toBeNull();
      expect(userStore.getIsAuthenticated()).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("user_session");
    });

    it("should clear local state even when logout API fails", async () => {
      // Arrange: 먼저 로그인 상태로 만들기
      vi.mocked(mockUserRepository.loginUser).mockResolvedValue(mockLoginResult);
      await userStore.login("gd-hong", "password123");

      const mockError = new Error("Logout API failed");
      vi.mocked(mockUserRepository.logoutUser).mockRejectedValue(mockError);

      // Mock console.warn to avoid console output in tests
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Act
      await userStore.logout();

      // Assert
      expect(userStore.getUser()).toBeNull();
      expect(userStore.getIsAuthenticated()).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("user_session");
      expect(consoleSpy).toHaveBeenCalledWith("로그아웃 API 호출 실패:", mockError);

      consoleSpy.mockRestore();
    });
  });

  describe("register", () => {
    it("should register user and auto-login successfully", async () => {
      // Arrange
      vi.mocked(mockUserRepository.registerUser).mockResolvedValue(mockUser);
      vi.mocked(mockUserRepository.loginUser).mockResolvedValue(mockLoginResult);

      // Act
      const result = await userStore.register("홍길동", "gd-hong", "password123");

      // Assert
      expect(mockUserRepository.registerUser).toHaveBeenCalledWith({
        name: "홍길동",
        userName: "gd-hong",
        password: "password123",
      });
      expect(mockUserRepository.loginUser).toHaveBeenCalledWith({
        userName: "gd-hong",
        password: "password123",
      });
      expect(result).toEqual(mockUser);
      expect(userStore.getUser()).toEqual(mockUser);
      expect(userStore.getIsAuthenticated()).toBe(true);
    });

    it("should throw error when registration fails", async () => {
      // Arrange
      const mockError = new Error("Username already exists");
      vi.mocked(mockUserRepository.registerUser).mockRejectedValue(mockError);

      // Act & Assert
      await expect(userStore.register("홍길동", "existing-user", "password123")).rejects.toThrow(
        "Username already exists",
      );
      expect(userStore.getUser()).toBeNull();
      expect(userStore.getIsAuthenticated()).toBe(false);
    });

    it("should throw error when auto-login after registration fails", async () => {
      // Arrange
      vi.mocked(mockUserRepository.registerUser).mockResolvedValue(mockUser);
      vi.mocked(mockUserRepository.loginUser).mockResolvedValue(null);

      // Act & Assert
      await expect(userStore.register("홍길동", "gd-hong", "password123")).rejects.toThrow(
        "등록 후 자동 로그인에 실패했습니다.",
      );
      expect(userStore.getUser()).toBeNull();
      expect(userStore.getIsAuthenticated()).toBe(false);
    });
  });

  describe("restoreSession", () => {
    it("should restore session successfully when valid session exists", async () => {
      // Arrange
      const mockSessionData = {
        sessionKey: "session-key-123",
        expiresAt: Date.now() + 60 * 60 * 1000, // 1시간 후 만료
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSessionData));
      vi.mocked(mockUserRepository.getCurrentUser).mockResolvedValue(mockUser);

      // Act
      const result = await userStore.restoreSession();

      // Assert
      expect(mockUserRepository.getCurrentUser).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
      expect(userStore.getUser()).toEqual(mockUser);
      expect(userStore.getIsAuthenticated()).toBe(true);
    });

    it("should return null when no session exists", async () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue(null);

      // Act
      const result = await userStore.restoreSession();

      // Assert
      expect(result).toBeNull();
      expect(userStore.getUser()).toBeNull();
      expect(userStore.getIsAuthenticated()).toBe(false);
    });

    it("should clear expired session and return null", async () => {
      // Arrange
      const expiredSessionData = {
        sessionKey: "session-key-123",
        expiresAt: Date.now() - 60 * 60 * 1000, // 1시간 전 만료
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredSessionData));

      // Act
      const result = await userStore.restoreSession();

      // Assert
      expect(result).toBeNull();
      expect(userStore.getUser()).toBeNull();
      expect(userStore.getIsAuthenticated()).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("user_session");
    });

    it("should clear session when getCurrentUser fails", async () => {
      // Arrange
      const mockSessionData = {
        sessionKey: "session-key-123",
        expiresAt: Date.now() + 60 * 60 * 1000,
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSessionData));
      vi.mocked(mockUserRepository.getCurrentUser).mockRejectedValue(new Error("Unauthorized"));

      // Act
      const result = await userStore.restoreSession();

      // Assert
      expect(result).toBeNull();
      expect(userStore.getUser()).toBeNull();
      expect(userStore.getIsAuthenticated()).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("user_session");
    });
  });

  describe("updateUser", () => {
    it("should update user information", () => {
      // Arrange
      const updatedUser: User = {
        ...mockUser,
        name: "김철수",
        roles: ["administrator", "manualRecorder"],
      };

      // Act
      userStore.updateUser(updatedUser);

      // Assert
      expect(userStore.getUser()).toEqual(updatedUser);
      expect(userStore.getIsAuthenticated()).toBe(true);
    });
  });

  describe("subscribe", () => {
    it("should notify subscribers when user state changes", async () => {
      // Arrange
      const mockCallback = vi.fn();
      const unsubscribe = userStore.subscribe(mockCallback);
      vi.mocked(mockUserRepository.loginUser).mockResolvedValue(mockLoginResult);

      // Act
      await userStore.login("gd-hong", "password123");

      // Assert
      expect(mockCallback).toHaveBeenCalledWith(mockUser, true);

      // Cleanup
      unsubscribe();
    });
  });
});
