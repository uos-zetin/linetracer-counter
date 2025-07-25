import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '../store.zustand';
import type { User } from '@/entities/user';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Arrange: 각 테스트 전에 스토어 초기화
    useAuthStore.getState().clearAuth();
  });

  describe('setAuth', () => {
    it('사용자와 인증 상태를 설정해야 한다', () => {
      // Arrange
      const user: User = {
        id: 'user-1',
        name: 'Test User',
        roles: ['USER'],
        createdAt: new Date(),
      };

      // Act
      useAuthStore.getState().setAuth(user, true);

      // Assert
      const state = useAuthStore.getState();
      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
    });

    it('사용자가 null이고 인증되지 않은 상태를 설정해야 한다', () => {
      // Arrange
      const user: User = {
        id: 'user-1',
        name: 'Test User',
        roles: ['USER'],
        createdAt: new Date(),
      };
      
      useAuthStore.getState().setAuth(user, true);

      // Act
      useAuthStore.getState().setAuth(null, false);

      // Assert
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('clearAuth', () => {
    it('인증 상태를 초기화해야 한다', () => {
      // Arrange
      const user: User = {
        id: 'user-1',
        name: 'Test User',
        roles: ['USER'],
        createdAt: new Date(),
      };
      
      useAuthStore.getState().setAuth(user, true);

      // Act
      useAuthStore.getState().clearAuth();

      // Assert
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('이미 초기화된 상태에서도 문제없이 동작해야 한다', () => {
      // Arrange
      useAuthStore.getState().clearAuth();

      // Act
      useAuthStore.getState().clearAuth();

      // Assert
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('getUser', () => {
    it('현재 사용자를 반환해야 한다', () => {
      // Arrange
      const user: User = {
        id: 'user-1',
        name: 'Test User',
        roles: ['USER'],
        createdAt: new Date(),
      };
      
      useAuthStore.getState().setAuth(user, true);

      // Act
      const result = useAuthStore.getState().getUser();

      // Assert
      expect(result).toEqual(user);
    });

    it('사용자가 없을 때 null을 반환해야 한다', () => {
      // Arrange
      useAuthStore.getState().clearAuth();

      // Act
      const result = useAuthStore.getState().getUser();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getIsAuthenticated', () => {
    it('인증된 상태에서 true를 반환해야 한다', () => {
      // Arrange
      const user: User = {
        id: 'user-1',
        name: 'Test User',
        roles: ['USER'],
        createdAt: new Date(),
      };
      
      useAuthStore.getState().setAuth(user, true);

      // Act
      const result = useAuthStore.getState().getIsAuthenticated();

      // Assert
      expect(result).toBe(true);
    });

    it('인증되지 않은 상태에서 false를 반환해야 한다', () => {
      // Arrange
      useAuthStore.getState().clearAuth();

      // Act
      const result = useAuthStore.getState().getIsAuthenticated();

      // Assert
      expect(result).toBe(false);
    });

    it('사용자가 있지만 인증되지 않은 상태에서 false를 반환해야 한다', () => {
      // Arrange
      const user: User = {
        id: 'user-1',
        name: 'Test User',
        roles: ['USER'],
        createdAt: new Date(),
      };
      
      useAuthStore.getState().setAuth(user, false);

      // Act
      const result = useAuthStore.getState().getIsAuthenticated();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('상태 일관성', () => {
    it('setAuth로 설정한 값이 getter로 정확히 반환되어야 한다', () => {
      // Arrange
      const user: User = {
        id: 'user-1',
        name: 'Test User',
        roles: ['ADMIN'],
        createdAt: new Date(),
      };

      // Act
      useAuthStore.getState().setAuth(user, true);

      // Assert
      expect(useAuthStore.getState().getUser()).toEqual(user);
      expect(useAuthStore.getState().getIsAuthenticated()).toBe(true);
    });

    it('clearAuth 후 모든 getter가 초기값을 반환해야 한다', () => {
      // Arrange
      const user: User = {
        id: 'user-1',
        name: 'Test User',
        roles: ['USER'],
        createdAt: new Date(),
      };
      
      useAuthStore.getState().setAuth(user, true);

      // Act
      useAuthStore.getState().clearAuth();

      // Assert
      expect(useAuthStore.getState().getUser()).toBeNull();
      expect(useAuthStore.getState().getIsAuthenticated()).toBe(false);
    });
  });
});