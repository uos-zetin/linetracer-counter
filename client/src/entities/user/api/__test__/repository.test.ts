import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRepositoryImpl } from '../repository';
import type { User, UserRole } from '../../model/types';
import type { Fetcher } from '@/shared';

describe('UserRepositoryImpl', () => {
  let mockPublicFetcher: Fetcher;
  let mockAuthenticatedFetcher: Fetcher;
  let userRepository: UserRepositoryImpl;

  const mockUser: User = {
    id: 'user-1',
    name: 'Test User',
    roles: ['USER'],
    createdAt: new Date(),
  };

  beforeEach(() => {
    // Arrange: Mock fetcher 생성 및 repository 초기화
    mockPublicFetcher = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };

    mockAuthenticatedFetcher = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };

    userRepository = new UserRepositoryImpl(mockPublicFetcher, mockAuthenticatedFetcher);
  });

  describe('getAllUsers', () => {
    it('모든 사용자 목록을 반환해야 한다', async () => {
      // Arrange
      const users: User[] = [
        mockUser,
        {
          id: 'user-2',
          name: 'Another User',
          roles: ['ADMIN'],
          createdAt: new Date(),
        },
      ];

      mockAuthenticatedFetcher.get = vi.fn().mockResolvedValue({
        data: users,
      });

      // Act
      const result = await userRepository.getAllUsers();

      // Assert
      expect(mockAuthenticatedFetcher.get).toHaveBeenCalledWith('/actors');
      expect(result).toEqual(users);
    });

    it('네트워크 에러 시 에러를 발생시켜야 한다', async () => {
      // Arrange
      const networkError = new Error('네트워크 연결 실패');
      mockAuthenticatedFetcher.get = vi.fn().mockRejectedValue(networkError);

      // Act & Assert
      await expect(userRepository.getAllUsers()).rejects.toThrow('네트워크 연결 실패');
      expect(mockAuthenticatedFetcher.get).toHaveBeenCalledWith('/actors');
    });
  });

  describe('getCurrentUser', () => {
    it('현재 사용자 정보를 반환해야 한다', async () => {
      // Arrange
      mockAuthenticatedFetcher.get = vi.fn().mockResolvedValue({
        data: mockUser,
      });

      // Act
      const result = await userRepository.getCurrentUser();

      // Assert
      expect(mockAuthenticatedFetcher.get).toHaveBeenCalledWith('/actors/whoami');
      expect(result).toEqual(mockUser);
    });

    it('인증되지 않은 경우 null을 반환해야 한다', async () => {
      // Arrange
      mockAuthenticatedFetcher.get = vi.fn().mockResolvedValue({
        data: null,
      });

      // Act
      const result = await userRepository.getCurrentUser();

      // Assert
      expect(mockAuthenticatedFetcher.get).toHaveBeenCalledWith('/actors/whoami');
      expect(result).toBeNull();
    });
  });

  describe('registerUser', () => {
    it('새 사용자를 등록하고 사용자 정보를 반환해야 한다', async () => {
      // Arrange
      const registerData = {
        name: 'New User',
        userName: 'newuser',
        password: 'password123',
      };

      mockPublicFetcher.post = vi.fn().mockResolvedValue({
        data: mockUser,
      });

      // Act
      const result = await userRepository.registerUser(registerData);

      // Assert
      expect(mockPublicFetcher.post).toHaveBeenCalledWith('/actors/register', {
        body: {
          name: 'New User',
          username: 'newuser', // 서버는 username을 사용
          password: 'password123',
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('이미 존재하는 사용자 등록 시 에러를 발생시켜야 한다', async () => {
      // Arrange
      const registerData = {
        name: 'Existing User',
        userName: 'existinguser',
        password: 'password123',
      };

      const conflictError = new Error('이미 존재하는 사용자입니다');
      mockPublicFetcher.post = vi.fn().mockRejectedValue(conflictError);

      // Act & Assert
      await expect(userRepository.registerUser(registerData)).rejects.toThrow('이미 존재하는 사용자입니다');
    });
  });

  describe('loginUser', () => {
    it('로그인 성공 시 사용자 정보와 세션 키를 반환해야 한다', async () => {
      // Arrange
      const loginData = {
        userName: 'testuser',
        password: 'password123',
      };

      const sessionKey = 'session-key-123';

      mockPublicFetcher.post = vi.fn()
        .mockResolvedValueOnce({ data: sessionKey }) // 로그인 응답
        .mockResolvedValueOnce({ data: mockUser }); // whoami 응답

      mockPublicFetcher.get = vi.fn().mockResolvedValue({
        data: mockUser,
      });

      // Act
      const result = await userRepository.loginUser(loginData);

      // Assert
      expect(mockPublicFetcher.post).toHaveBeenCalledWith('/actors/login', {
        body: {
          username: 'testuser',
          password: 'password123',
        },
      });
      expect(mockPublicFetcher.get).toHaveBeenCalledWith('/actors/whoami', {
        headers: {
          Authorization: `Session ${sessionKey}`,
        },
      });
      expect(result).toEqual({
        user: mockUser,
        sessionKey,
      });
    });

    it('잘못된 인증 정보로 로그인 시 null을 반환해야 한다', async () => {
      // Arrange
      const loginData = {
        userName: 'wronguser',
        password: 'wrongpassword',
      };

      mockPublicFetcher.post = vi.fn().mockResolvedValue({
        data: null, // 로그인 실패 시 null 반환
      });

      // Act
      const result = await userRepository.loginUser(loginData);

      // Assert
      expect(mockPublicFetcher.post).toHaveBeenCalledWith('/actors/login', {
        body: {
          username: 'wronguser',
          password: 'wrongpassword',
        },
      });
      expect(result).toBeNull();
    });

    it('세션 키는 받았지만 사용자 정보 조회 실패 시 에러를 발생시켜야 한다', async () => {
      // Arrange
      const loginData = {
        userName: 'testuser',
        password: 'password123',
      };

      const sessionKey = 'session-key-123';

      mockPublicFetcher.post = vi.fn().mockResolvedValue({
        data: sessionKey,
      });

      mockPublicFetcher.get = vi.fn().mockRejectedValue(
        new Error('사용자 정보 조회 실패')
      );

      // Act & Assert
      await expect(userRepository.loginUser(loginData)).rejects.toThrow('사용자 정보 조회 실패');
    });
  });

  describe('logoutUser', () => {
    it('로그아웃 요청을 수행해야 한다', async () => {
      // Arrange
      mockAuthenticatedFetcher.post = vi.fn().mockResolvedValue({
        data: undefined,
      });

      // Act
      await userRepository.logoutUser();

      // Assert
      expect(mockAuthenticatedFetcher.post).toHaveBeenCalledWith('/actors/logout');
    });

    it('로그아웃 요청 실패 시 에러를 발생시켜야 한다', async () => {
      // Arrange
      const logoutError = new Error('로그아웃 실패');
      mockAuthenticatedFetcher.post = vi.fn().mockRejectedValue(logoutError);

      // Act & Assert
      await expect(userRepository.logoutUser()).rejects.toThrow('로그아웃 실패');
    });
  });

  describe('updateUserRoles', () => {
    it('사용자 권한을 업데이트하고 업데이트된 사용자 정보를 반환해야 한다', async () => {
      // Arrange
      const userId = 'user-1';
      const newRoles: UserRole[] = ['ADMIN', 'USER'];
      const updatedUser: User = {
        ...mockUser,
        roles: newRoles,
      };

      mockAuthenticatedFetcher.post = vi.fn().mockResolvedValue({
        data: updatedUser,
      });

      // Act
      const result = await userRepository.updateUserRoles(userId, newRoles);

      // Assert
      expect(mockAuthenticatedFetcher.post).toHaveBeenCalledWith(`/actors/${userId}/roles`, {
        body: { roles: newRoles },
      });
      expect(result).toEqual(updatedUser);
    });

    it('존재하지 않는 사용자 권한 업데이트 시 에러를 발생시켜야 한다', async () => {
      // Arrange
      const userId = 'non-existent-user';
      const newRoles: UserRole[] = ['USER'];
      const notFoundError = new Error('사용자를 찾을 수 없습니다');

      mockAuthenticatedFetcher.post = vi.fn().mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(userRepository.updateUserRoles(userId, newRoles)).rejects.toThrow('사용자를 찾을 수 없습니다');
    });
  });

  describe('deleteUser', () => {
    it('사용자를 삭제해야 한다', async () => {
      // Arrange
      const userId = 'user-1';

      mockAuthenticatedFetcher.delete = vi.fn().mockResolvedValue({
        data: undefined,
      });

      // Act
      await userRepository.deleteUser(userId);

      // Assert
      expect(mockAuthenticatedFetcher.delete).toHaveBeenCalledWith(`/actors/${userId}`);
    });

    it('존재하지 않는 사용자 삭제 시 에러를 발생시켜야 한다', async () => {
      // Arrange
      const userId = 'non-existent-user';
      const notFoundError = new Error('사용자를 찾을 수 없습니다');

      mockAuthenticatedFetcher.delete = vi.fn().mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(userRepository.deleteUser(userId)).rejects.toThrow('사용자를 찾을 수 없습니다');
    });
  });

  describe('Fetcher 사용 구분', () => {
    it('인증이 필요없는 메서드는 publicFetcher를 사용해야 한다', async () => {
      // Arrange & Act
      const registerData = {
        name: 'Test User',
        userName: 'testuser',
        password: 'password',
      };

      mockPublicFetcher.post = vi.fn().mockResolvedValue({ data: mockUser });
      await userRepository.registerUser(registerData);

      mockPublicFetcher.post = vi.fn().mockResolvedValue({ data: 'session-key' });
      mockPublicFetcher.get = vi.fn().mockResolvedValue({ data: mockUser });
      await userRepository.loginUser({ userName: 'testuser', password: 'password' });

      // Assert
      expect(mockPublicFetcher.post).toHaveBeenCalled();
      expect(mockAuthenticatedFetcher.post).not.toHaveBeenCalled();
    });

    it('인증이 필요한 메서드는 authenticatedFetcher를 사용해야 한다', async () => {
      // Arrange & Act
      mockAuthenticatedFetcher.get = vi.fn().mockResolvedValue({ data: [mockUser] });
      await userRepository.getAllUsers();

      mockAuthenticatedFetcher.get = vi.fn().mockResolvedValue({ data: mockUser });
      await userRepository.getCurrentUser();

      mockAuthenticatedFetcher.post = vi.fn().mockResolvedValue({ data: undefined });
      await userRepository.logoutUser();

      mockAuthenticatedFetcher.post = vi.fn().mockResolvedValue({ data: mockUser });
      await userRepository.updateUserRoles('user-1', ['ADMIN']);

      mockAuthenticatedFetcher.delete = vi.fn().mockResolvedValue({ data: undefined });
      await userRepository.deleteUser('user-1');

      // Assert
      expect(mockAuthenticatedFetcher.get).toHaveBeenCalled();
      expect(mockAuthenticatedFetcher.post).toHaveBeenCalled();
      expect(mockAuthenticatedFetcher.delete).toHaveBeenCalled();
    });
  });
});