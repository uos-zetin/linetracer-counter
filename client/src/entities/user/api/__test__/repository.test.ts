// entities/user/api/__test__/repository.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Fetcher } from "@/shared/api";
import type { User, UserRole } from "../../model/types";
import { UserFetcherRepository } from "../repository";
import { parseUserDto, parseUserRegisterForm } from "../../lib/parse-dto";

// parseUserDto와 parseUserRegisterForm 함수 모킹
vi.mock("../../lib/parse-dto", () => ({
  parseUserDto: vi.fn(),
  parseUserRegisterForm: vi.fn(),
  parseUserRoles: vi.fn(),
}));

describe("UserFetcherRepository", () => {
  let mockAuthenticatedFetcher: Fetcher;
  let userRepository: UserFetcherRepository;

  const mockUser: User = {
    id: "user-1",
    name: "Test User",
    roles: ["administrator"], // 실제 UserRole 값 사용
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockAuthenticatedFetcher = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      request: vi.fn(),
    };

    userRepository = new UserFetcherRepository(mockAuthenticatedFetcher);

    // parseUserDto mock 설정
    vi.mocked(parseUserDto).mockImplementation((dto) => ({
      id: dto.id,
      name: dto.name,
      roles: dto.roles as UserRole[],
      createdAt: new Date(dto.createdAt),
    }));

    // parseUserRegisterForm mock 설정
    vi.mocked(parseUserRegisterForm).mockImplementation((form) => ({
      name: form.name,
      username: form.userName,
      password: form.password,
    }));
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

  // ───────────────────────────── createUser
  describe("createUser", () => {
    it("새 사용자를 등록하고 반환해야 한다", async () => {
      const dto = { name: "New", userName: "new", password: "pw" };
      mockAuthenticatedFetcher.post = vi.fn().mockResolvedValue({ data: mockUser });

      const result = await userRepository.createUser(dto);

      expect(mockAuthenticatedFetcher.post).toHaveBeenCalledWith("/actors", {
        body: { name: dto.name, username: dto.userName, password: dto.password },
      });
      expect(result).toEqual(mockUser);
    });

    it("중복 사용자 등록 시 예외를 던져야 한다", async () => {
      const dto = { name: "Dup", userName: "dup", password: "pw" };
      mockAuthenticatedFetcher.post = vi.fn().mockRejectedValue(new Error("exists"));

      await expect(userRepository.createUser(dto)).rejects.toThrow("exists");
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
    it("authenticatedFetcher 를 사용하는 메서드", async () => {
      mockAuthenticatedFetcher.get = vi.fn().mockResolvedValue({ data: [mockUser] });
      await userRepository.getAllUsers();

      mockAuthenticatedFetcher.get = vi.fn().mockResolvedValue({ data: mockUser });
      await userRepository.getCurrentUser();

      mockAuthenticatedFetcher.post = vi.fn().mockResolvedValue({ data: mockUser });
      await userRepository.createUser({ name: "a", userName: "a", password: "1" });

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
