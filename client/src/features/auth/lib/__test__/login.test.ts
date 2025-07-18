import { describe, it, expect, vi, beforeEach } from "vitest";
import { loginUser, logoutUser, checkAuthStatus, restoreSession } from "../login";
import { userStore } from "@/entities/user";
import type { LoginFormData } from "../../types";
import type { User } from "@/entities/user";

// userStore 모킹
vi.mock("@/entities/user", () => ({
  userStore: {
    login: vi.fn(),
    logout: vi.fn(),
    getUser: vi.fn(),
    getIsAuthenticated: vi.fn(),
    restoreSession: vi.fn(),
  },
}));

describe("Auth Login Functions", () => {
  const mockUser: User = {
    id: "test-user-id",
    name: "테스트 사용자",
    roles: ["administrator"],
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loginUser", () => {
    it("should login successfully with valid credentials", async () => {
      // Arrange
      const formData: LoginFormData = {
        userName: "testuser",
        password: "password123",
      };

      vi.mocked(userStore.login).mockResolvedValue(mockUser);

      // Act
      const result = await loginUser(formData);

      // Assert
      expect(userStore.login).toHaveBeenCalledWith("testuser", "password123");
      expect(result).toEqual(mockUser);
    });

    it("should throw error with invalid form data", async () => {
      // Arrange
      const formData: LoginFormData = {
        userName: "ab", // too short
        password: "123", // too short
      };

      // Act & Assert
      await expect(loginUser(formData)).rejects.toThrow("입력 오류:");
      expect(userStore.login).not.toHaveBeenCalled();
    });

    it("should handle 401 unauthorized error", async () => {
      // Arrange
      const formData: LoginFormData = {
        userName: "testuser",
        password: "wrongpassword",
      };

      vi.mocked(userStore.login).mockRejectedValue(new Error("401 Unauthorized"));

      // Act & Assert
      await expect(loginUser(formData)).rejects.toThrow("사용자명 또는 비밀번호가 올바르지 않습니다.");
      expect(userStore.login).toHaveBeenCalledWith("testuser", "wrongpassword");
    });

    it("should handle network error", async () => {
      // Arrange
      const formData: LoginFormData = {
        userName: "testuser",
        password: "password123",
      };

      vi.mocked(userStore.login).mockRejectedValue(new Error("Network error"));

      // Act & Assert
      await expect(loginUser(formData)).rejects.toThrow("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    });

    it("should handle unknown error", async () => {
      // Arrange
      const formData: LoginFormData = {
        userName: "testuser",
        password: "password123",
      };

      vi.mocked(userStore.login).mockRejectedValue(new Error("Unknown error"));

      // Act & Assert
      await expect(loginUser(formData)).rejects.toThrow("Unknown error");
    });

    it("should handle non-Error objects", async () => {
      // Arrange
      const formData: LoginFormData = {
        userName: "testuser",
        password: "password123",
      };

      vi.mocked(userStore.login).mockRejectedValue("String error");

      // Act & Assert
      await expect(loginUser(formData)).rejects.toThrow("로그인 중 알 수 없는 오류가 발생했습니다.");
    });
  });

  describe("logoutUser", () => {
    it("should logout successfully", async () => {
      // Arrange
      vi.mocked(userStore.logout).mockResolvedValue(undefined);

      // Act
      await logoutUser();

      // Assert
      expect(userStore.logout).toHaveBeenCalled();
    });

    it("should handle logout error gracefully", async () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      vi.mocked(userStore.logout).mockRejectedValue(new Error("Logout failed"));

      // Act
      await logoutUser();

      // Assert
      expect(userStore.logout).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith("로그아웃 API 호출 실패:", expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe("checkAuthStatus", () => {
    it("should return current auth status", () => {
      // Arrange
      vi.mocked(userStore.getUser).mockReturnValue(mockUser);
      vi.mocked(userStore.getIsAuthenticated).mockReturnValue(true);

      // Act
      const result = checkAuthStatus();

      // Assert
      expect(result).toEqual({
        user: mockUser,
        isAuthenticated: true,
      });
      expect(userStore.getUser).toHaveBeenCalled();
      expect(userStore.getIsAuthenticated).toHaveBeenCalled();
    });

    it("should return null user when not authenticated", () => {
      // Arrange
      vi.mocked(userStore.getUser).mockReturnValue(null);
      vi.mocked(userStore.getIsAuthenticated).mockReturnValue(false);

      // Act
      const result = checkAuthStatus();

      // Assert
      expect(result).toEqual({
        user: null,
        isAuthenticated: false,
      });
    });
  });

  describe("restoreSession", () => {
    it("should restore session successfully", async () => {
      // Arrange
      vi.mocked(userStore.restoreSession).mockResolvedValue(mockUser);

      // Act
      const result = await restoreSession();

      // Assert
      expect(userStore.restoreSession).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it("should handle session restoration failure", async () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      vi.mocked(userStore.restoreSession).mockRejectedValue(new Error("Session restore failed"));

      // Act
      const result = await restoreSession();

      // Assert
      expect(userStore.restoreSession).toHaveBeenCalled();
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith("세션 복원 실패:", expect.any(Error));

      consoleSpy.mockRestore();
    });
  });
});
