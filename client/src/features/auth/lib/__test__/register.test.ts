import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerUser, checkUserNameAvailability } from "../register";
import { userStore } from "@/entities/user";
import type { RegisterFormData } from "../../types";
import type { User } from "@/entities/user";

// userStore 모킹
vi.mock("@/entities/user", () => ({
  userStore: {
    register: vi.fn(),
  },
}));

describe("Auth Register Functions", () => {
  const mockUser: User = {
    id: "test-user-id",
    name: "테스트 사용자",
    roles: ["administrator"],
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should register successfully with valid form data", async () => {
      // Arrange
      const formData: RegisterFormData = {
        name: "테스트 사용자",
        userName: "testuser",
        password: "password123",
        confirmPassword: "password123",
      };

      vi.mocked(userStore.register).mockResolvedValue(mockUser);

      // Act
      const result = await registerUser(formData);

      // Assert
      expect(userStore.register).toHaveBeenCalledWith("테스트 사용자", "testuser", "password123");
      expect(result).toEqual(mockUser);
    });

    it("should throw error with invalid form data", async () => {
      // Arrange
      const formData: RegisterFormData = {
        name: "", // empty name
        userName: "ab", // too short
        password: "123", // too short
        confirmPassword: "456", // doesn't match
      };

      // Act & Assert
      await expect(registerUser(formData)).rejects.toThrow("입력 오류:");
      expect(userStore.register).not.toHaveBeenCalled();
    });

    it("should handle duplicate username error", async () => {
      // Arrange
      const formData: RegisterFormData = {
        name: "테스트 사용자",
        userName: "existinguser",
        password: "password123",
        confirmPassword: "password123",
      };

      vi.mocked(userStore.register).mockRejectedValue(new Error("User already exists"));

      // Act & Assert
      await expect(registerUser(formData)).rejects.toThrow("이미 사용 중인 사용자명입니다.");
      expect(userStore.register).toHaveBeenCalledWith("테스트 사용자", "existinguser", "password123");
    });

    it("should handle duplicate error with different message", async () => {
      // Arrange
      const formData: RegisterFormData = {
        name: "테스트 사용자",
        userName: "existinguser",
        password: "password123",
        confirmPassword: "password123",
      };

      vi.mocked(userStore.register).mockRejectedValue(new Error("duplicate key error"));

      // Act & Assert
      await expect(registerUser(formData)).rejects.toThrow("이미 사용 중인 사용자명입니다.");
    });

    it("should handle 400 bad request error", async () => {
      // Arrange
      const formData: RegisterFormData = {
        name: "테스트 사용자",
        userName: "testuser",
        password: "password123",
        confirmPassword: "password123",
      };

      vi.mocked(userStore.register).mockRejectedValue(new Error("400 Bad Request"));

      // Act & Assert
      await expect(registerUser(formData)).rejects.toThrow("입력된 정보가 올바르지 않습니다.");
    });

    it("should handle network error", async () => {
      // Arrange
      const formData: RegisterFormData = {
        name: "테스트 사용자",
        userName: "testuser",
        password: "password123",
        confirmPassword: "password123",
      };

      vi.mocked(userStore.register).mockRejectedValue(new Error("Network error"));

      // Act & Assert
      await expect(registerUser(formData)).rejects.toThrow("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    });

    it("should handle unknown error", async () => {
      // Arrange
      const formData: RegisterFormData = {
        name: "테스트 사용자",
        userName: "testuser",
        password: "password123",
        confirmPassword: "password123",
      };

      vi.mocked(userStore.register).mockRejectedValue(new Error("Unknown error"));

      // Act & Assert
      await expect(registerUser(formData)).rejects.toThrow("Unknown error");
    });

    it("should handle non-Error objects", async () => {
      // Arrange
      const formData: RegisterFormData = {
        name: "테스트 사용자",
        userName: "testuser",
        password: "password123",
        confirmPassword: "password123",
      };

      vi.mocked(userStore.register).mockRejectedValue("String error");

      // Act & Assert
      await expect(registerUser(formData)).rejects.toThrow("회원가입 중 알 수 없는 오류가 발생했습니다.");
    });
  });

  describe("checkUserNameAvailability", () => {
    it("should return true for any username (placeholder implementation)", async () => {
      // Act
      const result = await checkUserNameAvailability("testuser");

      // Assert
      expect(result).toBe(true);
    });

    it("should return true for empty username (placeholder implementation)", async () => {
      // Act
      const result = await checkUserNameAvailability("");

      // Assert
      expect(result).toBe(true);
    });
  });
});
