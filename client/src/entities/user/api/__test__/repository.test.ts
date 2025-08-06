// entities/user/api/__test__/repository.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Fetcher } from "@/shared";
import type { User, UserRole } from "../../model/types";
import { UserFetcherRepository } from "../repository";

describe("UserFetcherRepository", () => {
  let mockPublicFetcher: Fetcher;
  let mockAuthenticatedFetcher: Fetcher;
  let userRepository: UserFetcherRepository;

  const mockUser: User = {
    id: "user-1",
    name: "Test User",
    roles: ["administrator"], // 실제 UserRole 값 사용
    createdAt: new Date(),
  };

  beforeEach(() => {
    mockPublicFetcher = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      request: vi.fn(),
    };

    mockAuthenticatedFetcher = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      request: vi.fn(),
    };

    userRepository = new UserFetcherRepository(mockPublicFetcher, mockAuthenticatedFetcher);
  });

  // ───────────────────────────── getAllUsers
  describe("getAllUsers", () => {
    it("모든 사용자 목록을 반환해야 한다", async () => {
      const users: User[] = [
        mockUser,
        { id: "user-2", name: "Another", roles: ["manualRecorder"], createdAt: new Date() },
      ];
      mockAuthenticatedFetcher.get = vi.fn().mockResolvedValue({ data: users });

      const result = await userRepository.getAllUsers();

      expect(mockAuthenticatedFetcher.get).toHaveBeenCalledWith("/actors");
      expect(result).toEqual(users);
    });

    it("네트워크 오류 발생 시 예외를 던져야 한다", async () => {
      const err = new Error("network fail");
      mockAuthenticatedFetcher.get = vi.fn().mockRejectedValue(err);

      await expect(userRepository.getAllUsers()).rejects.toThrow("network fail");
      expect(mockAuthenticatedFetcher.get).toHaveBeenCalledWith("/actors");
    });
  });

  // ───────────────────────────── getCurrentUser
  describe("getCurrentUser", () => {
    it("현재 사용자 정보를 반환해야 한다", async () => {
      mockAuthenticatedFetcher.get = vi.fn().mockResolvedValue({ data: mockUser });

      const result = await userRepository.getCurrentUser();

      expect(mockAuthenticatedFetcher.get).toHaveBeenCalledWith("/actors/whoami");
      expect(result).toEqual(mockUser);
    });

    it("인증되지 않은 경우 null을 반환해야 한다", async () => {
      mockAuthenticatedFetcher.get = vi.fn().mockResolvedValue({ data: null });

      const result = await userRepository.getCurrentUser();

      expect(mockAuthenticatedFetcher.get).toHaveBeenCalledWith("/actors/whoami");
      expect(result).toBeNull();
    });
  });

  // ───────────────────────────── registerUser
  describe("registerUser", () => {
    it("새 사용자를 등록하고 반환해야 한다", async () => {
      const dto = { name: "New", userName: "new", password: "pw" };
      mockPublicFetcher.post = vi.fn().mockResolvedValue({ data: mockUser });

      const result = await userRepository.registerUser(dto);

      expect(mockPublicFetcher.post).toHaveBeenCalledWith("/actors/register", {
        body: { name: dto.name, username: dto.userName, password: dto.password },
      });
      expect(result).toEqual(mockUser);
    });

    it("중복 사용자 등록 시 예외를 던져야 한다", async () => {
      const dto = { name: "Dup", userName: "dup", password: "pw" };
      mockPublicFetcher.post = vi.fn().mockRejectedValue(new Error("exists"));

      await expect(userRepository.registerUser(dto)).rejects.toThrow("exists");
    });
  });

  // ───────────────────────────── loginUser
  describe("loginUser", () => {
    it("로그인 성공 시 sessionKey를 반환해야 한다", async () => {
      const dto = { userName: "u", password: "p" };
      const sessionKey = "sess-123";

      mockPublicFetcher.post = vi.fn().mockResolvedValue({ data: sessionKey });

      const result = await userRepository.loginUser(dto);

      expect(mockPublicFetcher.post).toHaveBeenCalledWith("/actors/login", {
        body: { username: dto.userName, password: dto.password },
      });
      expect(result).toEqual(sessionKey);
    });

    it("잘못된 인증 정보 시 예외를 던져야 한다", async () => {
      const loginError = new Error("인증 실패");
      mockPublicFetcher.post = vi.fn().mockRejectedValue(loginError);

      await expect(userRepository.loginUser({ userName: "x", password: "y" })).rejects.toThrow("인증 실패");
    });

    it("네트워크 에러 시 예외를 던져야 한다", async () => {
      const networkError = new Error("네트워크 연결 실패");
      mockPublicFetcher.post = vi.fn().mockRejectedValue(networkError);

      await expect(userRepository.loginUser({ userName: "u", password: "p" })).rejects.toThrow("네트워크 연결 실패");
    });
  });

  // ───────────────────────────── logoutUser
  describe("logoutUser", () => {
    it("정상 로그아웃", async () => {
      mockAuthenticatedFetcher.post = vi.fn().mockResolvedValue({ data: undefined });

      await userRepository.logoutUser();

      expect(mockAuthenticatedFetcher.post).toHaveBeenCalledWith("/actors/logout");
    });

    it("로그아웃 실패 시 예외", async () => {
      const err = new Error("logout fail");
      mockAuthenticatedFetcher.post = vi.fn().mockRejectedValue(err);

      await expect(userRepository.logoutUser()).rejects.toThrow("logout fail");
    });
  });

  // ───────────────────────────── updateUserRoles
  describe("updateUserRoles", () => {
    it("권한 업데이트 후 사용자 반환", async () => {
      const newRoles: UserRole[] = ["manualRecorder", "stopwatchRecorder"];
      const updated: User = { ...mockUser, roles: newRoles };

      mockAuthenticatedFetcher.patch = vi.fn().mockResolvedValue({ data: updated });

      const result = await userRepository.updateUserRoles(mockUser.id, newRoles);

      expect(mockAuthenticatedFetcher.patch).toHaveBeenCalledWith(`/actors/${mockUser.id}/roles`, {
        body: { roles: newRoles },
      });
      expect(result).toEqual(updated);
    });

    it("없는 사용자면 예외", async () => {
      mockAuthenticatedFetcher.patch = vi.fn().mockRejectedValue(new Error("not found"));

      await expect(userRepository.updateUserRoles("none", ["administrator"])).rejects.toThrow("not found");
    });
  });

  // ───────────────────────────── deleteUser
  describe("deleteUser", () => {
    it("사용자 삭제", async () => {
      mockAuthenticatedFetcher.delete = vi.fn().mockResolvedValue({ data: undefined });

      await userRepository.deleteUser(mockUser.id);

      expect(mockAuthenticatedFetcher.delete).toHaveBeenCalledWith(`/actors/${mockUser.id}`);
    });

    it("없는 사용자 삭제 시 예외", async () => {
      mockAuthenticatedFetcher.delete = vi.fn().mockRejectedValue(new Error("not found"));

      await expect(userRepository.deleteUser("none")).rejects.toThrow("not found");
    });
  });

  // ───────────────────────────── fetcher 구분
  describe("Fetcher 사용 구분", () => {
    it("publicFetcher 만 사용하는 메서드", async () => {
      // registerUser 호출
      mockPublicFetcher.post = vi.fn().mockResolvedValue({ data: mockUser });
      await userRepository.registerUser({ name: "a", userName: "a", password: "1" });

      // loginUser 호출 (별도의 mock 함수 생성)
      const loginMock = vi.fn().mockResolvedValue({ data: "sess" });
      mockPublicFetcher.post = loginMock;
      await userRepository.loginUser({ userName: "a", password: "1" });

      // loginUser만 1번 호출되었는지 확인
      expect(loginMock).toHaveBeenCalledTimes(1);
      expect(mockAuthenticatedFetcher.post).not.toHaveBeenCalled();
    });

    it("authenticatedFetcher 를 사용하는 메서드", async () => {
      mockAuthenticatedFetcher.get = vi.fn().mockResolvedValue({ data: [mockUser] });
      await userRepository.getAllUsers();

      mockAuthenticatedFetcher.get = vi.fn().mockResolvedValue({ data: mockUser });
      await userRepository.getCurrentUser();

      mockAuthenticatedFetcher.post = vi.fn().mockResolvedValue({ data: undefined });
      await userRepository.logoutUser();

      mockAuthenticatedFetcher.patch = vi.fn().mockResolvedValue({ data: mockUser });
      await userRepository.updateUserRoles(mockUser.id, ["administrator"]);

      mockAuthenticatedFetcher.delete = vi.fn().mockResolvedValue({ data: undefined });
      await userRepository.deleteUser(mockUser.id);

      expect(mockAuthenticatedFetcher.get).toHaveBeenCalled();
      expect(mockAuthenticatedFetcher.post).toHaveBeenCalled();
      expect(mockAuthenticatedFetcher.patch).toHaveBeenCalled();
      expect(mockAuthenticatedFetcher.delete).toHaveBeenCalled();
    });
  });
});
