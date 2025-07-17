import { describe, it, expect, beforeEach, vi } from "vitest";

import { UserRepositoryImpl } from "../repository";
import type { Fetcher, ApiResponse } from "@/shared";
import type { User, UserRole } from "../../model/types";
import type { LoginResult, RegisterUserDto, LoginUserDto } from "../types";

describe("UserRepositoryImpl", () => {
  let mockPublicFetcher: Fetcher;
  let mockAuthenticatedFetcher: Fetcher;
  let userRepository: UserRepositoryImpl;

  const mockUser: User = {
    id: "user-1",
    name: "홍길동",
    roles: ["administrator"],
    createdAt: new Date("2024-01-01"),
  };

  const mockApiResponse = <T>(data: T): ApiResponse<T> => ({
    data,
    status: 200,
    headers: {},
  });

  beforeEach(() => {
    // Arrange: Mock Fetcher들 생성
    mockPublicFetcher = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
      request: vi.fn(),
    };

    mockAuthenticatedFetcher = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
      request: vi.fn(),
    };

    userRepository = new UserRepositoryImpl(mockPublicFetcher, mockAuthenticatedFetcher);
  });

  describe("getAllUsers", () => {
    it("should fetch all users using authenticated fetcher", async () => {
      // Arrange
      const mockUsers: User[] = [mockUser];
      vi.mocked(mockAuthenticatedFetcher.get).mockResolvedValue(mockApiResponse(mockUsers));

      // Act
      const result = await userRepository.getAllUsers();

      // Assert
      expect(mockAuthenticatedFetcher.get).toHaveBeenCalledWith("/actors");
      expect(result).toEqual(mockUsers);
    });

    it("should throw error when API call fails", async () => {
      // Arrange
      const mockError = new Error("Network error");
      vi.mocked(mockAuthenticatedFetcher.get).mockRejectedValue(mockError);

      // Act & Assert
      await expect(userRepository.getAllUsers()).rejects.toThrow("Network error");
    });
  });

  describe("getCurrentUser", () => {
    it("should fetch current user using authenticated fetcher", async () => {
      // Arrange
      vi.mocked(mockAuthenticatedFetcher.get).mockResolvedValue(mockApiResponse(mockUser));

      // Act
      const result = await userRepository.getCurrentUser();

      // Assert
      expect(mockAuthenticatedFetcher.get).toHaveBeenCalledWith("/actors/whoami");
      expect(result).toEqual(mockUser);
    });

    it("should return null when user is not authenticated", async () => {
      // Arrange
      vi.mocked(mockAuthenticatedFetcher.get).mockResolvedValue(mockApiResponse(null));

      // Act
      const result = await userRepository.getCurrentUser();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("registerUser", () => {
    it("should register user using public fetcher", async () => {
      // Arrange
      const registerDto: RegisterUserDto = {
        name: "홍길동",
        userName: "gd-hong",
        password: "password123",
      };
      vi.mocked(mockPublicFetcher.post).mockResolvedValue(mockApiResponse(mockUser));

      // Act
      const result = await userRepository.registerUser(registerDto);

      // Assert
      expect(mockPublicFetcher.post).toHaveBeenCalledWith("/actors/register", {
        body: {
          name: registerDto.name,
          username: registerDto.userName, // 서버는 username을 사용
          password: registerDto.password,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it("should throw error when registration fails", async () => {
      // Arrange
      const registerDto: RegisterUserDto = {
        name: "홍길동",
        userName: "existing-user",
        password: "password123",
      };
      const mockError = new Error("Username already exists");
      vi.mocked(mockPublicFetcher.post).mockRejectedValue(mockError);

      // Act & Assert
      await expect(userRepository.registerUser(registerDto)).rejects.toThrow("Username already exists");
    });
  });

  describe("loginUser", () => {
    it("should login user and return LoginResult", async () => {
      // Arrange
      const loginDto: LoginUserDto = {
        userName: "gd-hong",
        password: "password123",
      };
      const mockSessionKey = "session-key-123";
      const expectedLoginResult: LoginResult = {
        user: mockUser,
        sessionKey: mockSessionKey,
      };

      vi.mocked(mockPublicFetcher.post).mockResolvedValueOnce(mockApiResponse(mockSessionKey)); // 로그인 요청
      vi.mocked(mockPublicFetcher.get).mockResolvedValueOnce(mockApiResponse(mockUser)); // whoami 요청

      // Act
      const result = await userRepository.loginUser(loginDto);

      // Assert
      expect(mockPublicFetcher.post).toHaveBeenNthCalledWith(1, "/actors/login", {
        body: {
          username: loginDto.userName,
          password: loginDto.password,
        },
      });
      expect(mockPublicFetcher.get).toHaveBeenCalledWith("/actors/whoami", {
        headers: {
          Authorization: `Bearer ${mockSessionKey}`,
        },
      });
      expect(result).toEqual(expectedLoginResult);
    });

    it("should return null when login fails", async () => {
      // Arrange
      const loginDto: LoginUserDto = {
        userName: "wrong-user",
        password: "wrong-password",
      };
      vi.mocked(mockPublicFetcher.post).mockResolvedValue(mockApiResponse(null));

      // Act
      const result = await userRepository.loginUser(loginDto);

      // Assert
      expect(result).toBeNull();
    });

    it("should throw error when session key is received but user fetch fails", async () => {
      // Arrange
      const loginDto: LoginUserDto = {
        userName: "gd-hong",
        password: "password123",
      };
      const mockSessionKey = "session-key-123";

      vi.mocked(mockPublicFetcher.post).mockResolvedValueOnce(mockApiResponse(mockSessionKey)); // 로그인 성공
      vi.mocked(mockPublicFetcher.get).mockRejectedValueOnce(new Error("User fetch failed")); // whoami 실패

      // Act & Assert
      await expect(userRepository.loginUser(loginDto)).rejects.toThrow("User fetch failed");
    });
  });

  describe("logoutUser", () => {
    it("should call logout endpoint using authenticated fetcher", async () => {
      // Arrange
      vi.mocked(mockAuthenticatedFetcher.post).mockResolvedValue(mockApiResponse(undefined));

      // Act
      await userRepository.logoutUser();

      // Assert
      expect(mockAuthenticatedFetcher.post).toHaveBeenCalledWith("/actors/logout");
    });
  });

  describe("updateUserRoles", () => {
    it("should update user roles using authenticated fetcher", async () => {
      // Arrange
      const userId = "user-1";
      const newRoles: UserRole[] = ["administrator", "manualRecorder"];
      const updatedUser: User = {
        ...mockUser,
        roles: newRoles,
      };
      vi.mocked(mockAuthenticatedFetcher.post).mockResolvedValue(mockApiResponse(updatedUser));

      // Act
      const result = await userRepository.updateUserRoles(userId, newRoles);

      // Assert
      expect(mockAuthenticatedFetcher.post).toHaveBeenCalledWith(`/actors/${userId}/roles`, {
        body: { roles: newRoles },
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe("deleteUser", () => {
    it("should delete user using authenticated fetcher", async () => {
      // Arrange
      const userId = "user-1";
      vi.mocked(mockAuthenticatedFetcher.delete).mockResolvedValue(mockApiResponse(undefined));

      // Act
      await userRepository.deleteUser(userId);

      // Assert
      expect(mockAuthenticatedFetcher.delete).toHaveBeenCalledWith(`/actors/${userId}`);
    });
  });
});
