import { describe, it, expect, beforeEach, vi } from "vitest";

import { createUserRepository, userRepository, UserSessionProvider } from "../factory";
import type { Fetcher } from "@/shared";

describe("User API Factory Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createUserRepository", () => {
    it("should create UserRepository with default fetchers", () => {
      // Act
      const repository = createUserRepository();

      // Assert
      expect(repository).toBeDefined();
      expect(typeof repository.getAllUsers).toBe("function");
      expect(typeof repository.getCurrentUser).toBe("function");
      expect(typeof repository.registerUser).toBe("function");
      expect(typeof repository.loginUser).toBe("function");
      expect(typeof repository.logoutUser).toBe("function");
      expect(typeof repository.updateUserRoles).toBe("function");
      expect(typeof repository.deleteUser).toBe("function");
    });

    it("should create UserRepository with custom fetchers", () => {
      // Arrange
      const mockPublicFetcher: Fetcher = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        patch: vi.fn(),
        request: vi.fn(),
      };

      const mockAuthenticatedFetcher: Fetcher = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        patch: vi.fn(),
        request: vi.fn(),
      };

      // Act
      const repository = createUserRepository(mockPublicFetcher, mockAuthenticatedFetcher);

      // Assert
      expect(repository).toBeDefined();
      expect(typeof repository.getAllUsers).toBe("function");
    });
  });

  describe("default userRepository", () => {
    it("should provide a default UserRepository instance", () => {
      // Act & Assert
      expect(userRepository).toBeDefined();
      expect(typeof userRepository.getAllUsers).toBe("function");
      expect(typeof userRepository.getCurrentUser).toBe("function");
      expect(typeof userRepository.registerUser).toBe("function");
      expect(typeof userRepository.loginUser).toBe("function");
      expect(typeof userRepository.logoutUser).toBe("function");
      expect(typeof userRepository.updateUserRoles).toBe("function");
      expect(typeof userRepository.deleteUser).toBe("function");
    });
  });

  describe("UserSessionProvider", () => {
    it("should be able to create instance", () => {
      // Act
      const sessionProvider = new UserSessionProvider();

      // Assert
      expect(sessionProvider).toBeDefined();
      expect(typeof sessionProvider.getSessionKey).toBe("function");
    });

    it("should return null initially", () => {
      // Arrange
      const sessionProvider = new UserSessionProvider();

      // Act
      const sessionKey = sessionProvider.getSessionKey();

      // Assert
      expect(sessionKey).toBeNull();
    });
  });
});
