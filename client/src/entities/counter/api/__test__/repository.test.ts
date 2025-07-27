import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CounterFetcherRepository } from '../repository';
import type { CounterState } from '../../model/types';
import type { CounterDto } from '../types';
import type { Fetcher } from '@/shared';
import { parseCounterDto } from '../../lib/parse-dto';

// parseCounterDto 함수 모킹
vi.mock('../../lib/parse-dto', () => ({
  parseCounterDto: vi.fn(),
}));

describe('CounterFetcherRepository', () => {
  let mockAuthFetcher: Fetcher;
  let counterRepository: CounterFetcherRepository;

  const mockCounterDto: CounterDto = {
    id: 'counter-1',
    name: 'Test Counter',
    startedAt: null,
    stoppedAt: null,
    divisionId: null,
  };

  const mockCounterState: CounterState = {
    id: 'counter-1',
    name: 'Test Counter',
    startedAt: null,
    stoppedAt: null,
    divisionId: null,
  };

  beforeEach(() => {
    // Mock 초기화
    vi.clearAllMocks();
    
    // Arrange: Mock fetcher 생성 및 repository 초기화
    mockAuthFetcher = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
      request: vi.fn(),
    };

    counterRepository = new CounterFetcherRepository(mockAuthFetcher);

    // parseCounterDto 모킹 설정
    vi.mocked(parseCounterDto).mockReturnValue(mockCounterState);
  });

  describe('getAll', () => {
    it('모든 계수기 목록을 성공적으로 가져와야 한다', async () => {
      // Arrange
      const counters: CounterDto[] = [
        mockCounterDto,
        {
          id: 'counter-2',
          name: 'Another Counter',
          startedAt: 1704067200000,
          stoppedAt: 1704067260000,
          divisionId: 'division-1',
        },
      ];

      mockAuthFetcher.get = vi.fn().mockResolvedValue({
        data: counters,
      });

      // Act
      const result = await counterRepository.getAll();

      // Assert
      expect(mockAuthFetcher.get).toHaveBeenCalledWith('/api/counters');
      expect(parseCounterDto).toHaveBeenCalledTimes(2);
      expect(parseCounterDto).toHaveBeenCalledWith(counters[0]);
      expect(parseCounterDto).toHaveBeenCalledWith(counters[1]);
      expect(result).toEqual([mockCounterState, mockCounterState]);
    });

    it('빈 계수기 목록을 반환할 수 있어야 한다', async () => {
      // Arrange
      mockAuthFetcher.get = vi.fn().mockResolvedValue({
        data: [],
      });

      // Act
      const result = await counterRepository.getAll();

      // Assert
      expect(mockAuthFetcher.get).toHaveBeenCalledWith('/api/counters');
      expect(parseCounterDto).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('네트워크 에러 시 에러를 처리해야 한다', async () => {
      // Arrange
      const networkError = new Error('네트워크 연결 실패');
      mockAuthFetcher.get = vi.fn().mockRejectedValue(networkError);

      // Act & Assert
      await expect(counterRepository.getAll()).rejects.toThrow('네트워크 연결 실패');
      expect(mockAuthFetcher.get).toHaveBeenCalledWith('/api/counters');
    });

    it('인증 실패 시 에러를 처리해야 한다', async () => {
      // Arrange
      const authError = new Error('인증 실패');
      mockAuthFetcher.get = vi.fn().mockRejectedValue(authError);

      // Act & Assert
      await expect(counterRepository.getAll()).rejects.toThrow('인증 실패');
    });
  });

  describe('getById', () => {
    it('특정 계수기 정보를 성공적으로 가져와야 한다', async () => {
      // Arrange
      const counterId = 'counter-1';
      mockAuthFetcher.get = vi.fn().mockResolvedValue({
        data: mockCounterDto,
      });

      // Act
      const result = await counterRepository.getById(counterId);

      // Assert
      expect(mockAuthFetcher.get).toHaveBeenCalledWith(`/api/counters/${counterId}`);
      expect(parseCounterDto).toHaveBeenCalledWith(mockCounterDto);
      expect(result).toEqual(mockCounterState);
    });

    it('존재하지 않는 계수기 조회 시 null을 반환해야 한다', async () => {
      // Arrange
      const counterId = 'non-existent-counter';
      mockAuthFetcher.get = vi.fn().mockResolvedValue({
        data: null,
      });

      // Act
      const result = await counterRepository.getById(counterId);

      // Assert
      expect(mockAuthFetcher.get).toHaveBeenCalledWith(`/api/counters/${counterId}`);
      expect(parseCounterDto).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('네트워크 에러 시 에러를 처리해야 한다', async () => {
      // Arrange
      const counterId = 'counter-1';
      const networkError = new Error('계수기 조회 실패');
      mockAuthFetcher.get = vi.fn().mockRejectedValue(networkError);

      // Act & Assert
      await expect(counterRepository.getById(counterId)).rejects.toThrow('계수기 조회 실패');
      expect(mockAuthFetcher.get).toHaveBeenCalledWith(`/api/counters/${counterId}`);
    });
  });

  describe('connectDivision', () => {
    it('계수기를 디비전에 성공적으로 연결해야 한다', async () => {
      // Arrange
      const counterId = 'counter-1';
      const divisionId = 'division-1';
      mockAuthFetcher.patch = vi.fn().mockResolvedValue({
        data: undefined,
      });

      // Act
      await counterRepository.connectDivision(counterId, divisionId);

      // Assert
      expect(mockAuthFetcher.patch).toHaveBeenCalledWith(`/api/counters/${counterId}/division`, {
        body: { divisionId },
      });
    });

    it('존재하지 않는 계수기 연결 시 에러를 처리해야 한다', async () => {
      // Arrange
      const counterId = 'non-existent-counter';
      const divisionId = 'division-1';
      const notFoundError = new Error('계수기를 찾을 수 없습니다');
      mockAuthFetcher.patch = vi.fn().mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(counterRepository.connectDivision(counterId, divisionId)).rejects.toThrow('계수기를 찾을 수 없습니다');
    });

    it('존재하지 않는 디비전 연결 시 에러를 처리해야 한다', async () => {
      // Arrange
      const counterId = 'counter-1';
      const divisionId = 'non-existent-division';
      const notFoundError = new Error('디비전을 찾을 수 없습니다');
      mockAuthFetcher.patch = vi.fn().mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(counterRepository.connectDivision(counterId, divisionId)).rejects.toThrow('디비전을 찾을 수 없습니다');
    });

    it('권한 없음 에러를 처리해야 한다', async () => {
      // Arrange
      const counterId = 'counter-1';
      const divisionId = 'division-1';
      const forbiddenError = new Error('계수기 연결 권한이 없습니다');
      mockAuthFetcher.patch = vi.fn().mockRejectedValue(forbiddenError);

      // Act & Assert
      await expect(counterRepository.connectDivision(counterId, divisionId)).rejects.toThrow('계수기 연결 권한이 없습니다');
    });
  });

  describe('disconnectDivision', () => {
    it('계수기를 디비전에서 성공적으로 연결 해제해야 한다', async () => {
      // Arrange
      const counterId = 'counter-1';
      mockAuthFetcher.delete = vi.fn().mockResolvedValue({
        data: undefined,
      });

      // Act
      await counterRepository.disconnectDivision(counterId);

      // Assert
      expect(mockAuthFetcher.delete).toHaveBeenCalledWith(`/api/counters/${counterId}/division`);
    });

    it('존재하지 않는 계수기 연결 해제 시 에러를 처리해야 한다', async () => {
      // Arrange
      const counterId = 'non-existent-counter';
      const notFoundError = new Error('계수기를 찾을 수 없습니다');
      mockAuthFetcher.delete = vi.fn().mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(counterRepository.disconnectDivision(counterId)).rejects.toThrow('계수기를 찾을 수 없습니다');
    });

    it('이미 연결되지 않은 계수기 연결 해제 시 에러를 처리해야 한다', async () => {
      // Arrange
      const counterId = 'counter-1';
      const badRequestError = new Error('계수기가 디비전에 연결되어 있지 않습니다');
      mockAuthFetcher.delete = vi.fn().mockRejectedValue(badRequestError);

      // Act & Assert
      await expect(counterRepository.disconnectDivision(counterId)).rejects.toThrow('계수기가 디비전에 연결되어 있지 않습니다');
    });
  });

  describe('reset', () => {
    it('계수기를 성공적으로 리셋해야 한다', async () => {
      // Arrange
      const counterId = 'counter-1';
      mockAuthFetcher.post = vi.fn().mockResolvedValue({
        data: undefined,
      });

      // Act
      await counterRepository.reset(counterId);

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalledWith(`/api/counters/${counterId}/reset`);
    });

    it('존재하지 않는 계수기 리셋 시 에러를 처리해야 한다', async () => {
      // Arrange
      const counterId = 'non-existent-counter';
      const notFoundError = new Error('계수기를 찾을 수 없습니다');
      mockAuthFetcher.post = vi.fn().mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(counterRepository.reset(counterId)).rejects.toThrow('계수기를 찾을 수 없습니다');
    });

    it('실행 중인 계수기 리셋 시 에러를 처리해야 한다', async () => {
      // Arrange
      const counterId = 'counter-1';
      const conflictError = new Error('실행 중인 계수기는 리셋할 수 없습니다');
      mockAuthFetcher.post = vi.fn().mockRejectedValue(conflictError);

      // Act & Assert
      await expect(counterRepository.reset(counterId)).rejects.toThrow('실행 중인 계수기는 리셋할 수 없습니다');
    });

    it('권한 없음 에러를 처리해야 한다', async () => {
      // Arrange
      const counterId = 'counter-1';
      const forbiddenError = new Error('계수기 리셋 권한이 없습니다');
      mockAuthFetcher.post = vi.fn().mockRejectedValue(forbiddenError);

      // Act & Assert
      await expect(counterRepository.reset(counterId)).rejects.toThrow('계수기 리셋 권한이 없습니다');
    });
  });

  describe('disconnectCounter', () => {
    it('계수기를 성공적으로 연결 해제해야 한다', async () => {
      // Arrange
      const counterId = 'counter-1';
      mockAuthFetcher.delete = vi.fn().mockResolvedValue({
        data: undefined,
      });

      // Act
      await counterRepository.disconnectCounter(counterId);

      // Assert
      expect(mockAuthFetcher.delete).toHaveBeenCalledWith(`/api/counters/${counterId}`);
    });

    it('존재하지 않는 계수기 연결 해제 시 에러를 처리해야 한다', async () => {
      // Arrange
      const counterId = 'non-existent-counter';
      const notFoundError = new Error('계수기를 찾을 수 없습니다');
      mockAuthFetcher.delete = vi.fn().mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(counterRepository.disconnectCounter(counterId)).rejects.toThrow('계수기를 찾을 수 없습니다');
    });

    it('사용 중인 계수기 연결 해제 시 에러를 처리해야 한다', async () => {
      // Arrange
      const counterId = 'counter-1';
      const conflictError = new Error('사용 중인 계수기는 연결 해제할 수 없습니다');
      mockAuthFetcher.delete = vi.fn().mockRejectedValue(conflictError);

      // Act & Assert
      await expect(counterRepository.disconnectCounter(counterId)).rejects.toThrow('사용 중인 계수기는 연결 해제할 수 없습니다');
    });

    it('권한 없음 에러를 처리해야 한다', async () => {
      // Arrange
      const counterId = 'counter-1';
      const forbiddenError = new Error('계수기 연결 해제 권한이 없습니다');
      mockAuthFetcher.delete = vi.fn().mockRejectedValue(forbiddenError);

      // Act & Assert
      await expect(counterRepository.disconnectCounter(counterId)).rejects.toThrow('계수기 연결 해제 권한이 없습니다');
    });
  });

  describe('메서드 반환값 검증', () => {
    it('connectDivision은 undefined를 반환해야 한다', async () => {
      // Arrange
      const counterId = 'counter-1';
      const divisionId = 'division-1';
      mockAuthFetcher.patch = vi.fn().mockResolvedValue({ data: undefined });

      // Act
      const result = await counterRepository.connectDivision(counterId, divisionId);

      // Assert
      expect(result).toBeUndefined();
    });

    it('disconnectDivision은 undefined를 반환해야 한다', async () => {
      // Arrange
      const counterId = 'counter-1';
      mockAuthFetcher.delete = vi.fn().mockResolvedValue({ data: undefined });

      // Act
      const result = await counterRepository.disconnectDivision(counterId);

      // Assert
      expect(result).toBeUndefined();
    });

    it('reset은 undefined를 반환해야 한다', async () => {
      // Arrange
      const counterId = 'counter-1';
      mockAuthFetcher.post = vi.fn().mockResolvedValue({ data: undefined });

      // Act
      const result = await counterRepository.reset(counterId);

      // Assert
      expect(result).toBeUndefined();
    });

    it('disconnectCounter는 undefined를 반환해야 한다', async () => {
      // Arrange
      const counterId = 'counter-1';
      mockAuthFetcher.delete = vi.fn().mockResolvedValue({ data: undefined });

      // Act
      const result = await counterRepository.disconnectCounter(counterId);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('인증 요구사항', () => {
    it('모든 메서드가 authFetcher를 사용해야 한다', async () => {
      // Arrange & Act
      mockAuthFetcher.get = vi.fn().mockResolvedValue({ data: [] });
      await counterRepository.getAll();

      mockAuthFetcher.get = vi.fn().mockResolvedValue({ data: mockCounterDto });
      await counterRepository.getById('counter-1');

      mockAuthFetcher.patch = vi.fn().mockResolvedValue({ data: undefined });
      await counterRepository.connectDivision('counter-1', 'division-1');

      mockAuthFetcher.delete = vi.fn().mockResolvedValue({ data: undefined });
      await counterRepository.disconnectDivision('counter-1');

      mockAuthFetcher.post = vi.fn().mockResolvedValue({ data: undefined });
      await counterRepository.reset('counter-1');

      mockAuthFetcher.delete = vi.fn().mockResolvedValue({ data: undefined });
      await counterRepository.disconnectCounter('counter-1');

      // Assert
      expect(mockAuthFetcher.get).toHaveBeenCalled();
      expect(mockAuthFetcher.post).toHaveBeenCalled();
      expect(mockAuthFetcher.patch).toHaveBeenCalled();
      expect(mockAuthFetcher.delete).toHaveBeenCalled();
    });
  });
});