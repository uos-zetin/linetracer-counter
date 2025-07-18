import { describe, it, expect, beforeEach, vi } from "vitest";

import { createUserStore, userStore } from "../factory";
import type { UserRepository } from "../../api/types";

describe("User Factory Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createUserStore", () => {
    it("should create UserStore with default repository", () => {
      // Act
      const store = createUserStore();

      // Assert
      expect(store).toBeDefined();
      expect(typeof store.getUser).toBe("function");
      expect(typeof store.getIsAuthenticated).toBe("function");
      expect(typeof store.login).toBe("function");
      expect(typeof store.logout).toBe("function");
      expect(typeof store.register).toBe("function");
      expect(typeof store.restoreSession).toBe("function");
      expect(typeof store.updateUser).toBe("function");
      expect(typeof store.subscribe).toBe("function");
    });

    it("should create UserStore with custom repository", () => {
      // Arrange
      const mockRepository: UserRepository = {
        getAllUsers: vi.fn(),
        getCurrentUser: vi.fn(),
        registerUser: vi.fn(),
        loginUser: vi.fn(),
        logoutUser: vi.fn(),
        updateUserRoles: vi.fn(),
        deleteUser: vi.fn(),
      };

      // Act
      const store = createUserStore(mockRepository);

      // Assert
      expect(store).toBeDefined();
      expect(typeof store.getUser).toBe("function");
    });
  });

  describe("default userStore", () => {
    it("should provide a default UserStore instance", () => {
      // Act & Assert
      expect(userStore).toBeDefined();
      expect(typeof userStore.getUser).toBe("function");
      expect(typeof userStore.getIsAuthenticated).toBe("function");
      expect(typeof userStore.login).toBe("function");
      expect(typeof userStore.logout).toBe("function");
      expect(typeof userStore.register).toBe("function");
      expect(typeof userStore.restoreSession).toBe("function");
      expect(typeof userStore.updateUser).toBe("function");
      expect(typeof userStore.subscribe).toBe("function");
    });

    it("should have initial state", () => {
      // Act
      const user = userStore.getUser();
      const isAuthenticated = userStore.getIsAuthenticated();

      // Assert
      expect(user).toBeNull();
      expect(isAuthenticated).toBe(false);
    });
  });
});
