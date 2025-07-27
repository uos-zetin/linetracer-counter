import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CompetitionFetcherRepository } from '../repository';
import type { Competition } from '../../model/types';
import type { CompetitionDto } from '../types';
import type { Fetcher } from '@/shared';
import { parseCompetitionDto } from '../../lib/parse-dto';

// parseCompetitionDto 함수 모킹
vi.mock('../../lib/parse-dto', () => ({
  parseCompetitionDto: vi.fn(),
}));

describe('CompetitionFetcherRepository', () => {
  let mockFetcher: Fetcher;
  let mockAuthFetcher: Fetcher;
  let competitionRepository: CompetitionFetcherRepository;

  const mockCompetitionDto: CompetitionDto = {
    id: 'competition-1',
    name: 'Test Competition',
    description: 'Test Description',
    createdAt: '2024-01-01T00:00:00Z',
  };

  const mockCompetition: Competition = {
    id: 'competition-1',
    name: 'Test Competition',
    description: 'Test Description',
    createdAt: new Date('2024-01-01T00:00:00Z'),
  };

  beforeEach(() => {
    // Mock 초기화
    vi.clearAllMocks();
    
    // Arrange: Mock fetcher 생성 및 repository 초기화
    mockFetcher = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };

    mockAuthFetcher = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
    };

    competitionRepository = new CompetitionFetcherRepository(mockFetcher, mockAuthFetcher);

    // parseCompetitionDto 모킹 설정
    vi.mocked(parseCompetitionDto).mockReturnValue(mockCompetition);
  });

  describe('getAllCompetitions', () => {
    it('모든 대회 목록을 성공적으로 가져와야 한다', async () => {
      // Arrange
      const competitions: CompetitionDto[] = [
        mockCompetitionDto,
        {
          id: 'competition-2',
          name: 'Another Competition',
          description: 'Another Description',
          createdAt: '2024-01-02T00:00:00Z',
        },
      ];

      mockFetcher.get = vi.fn().mockResolvedValue({
        data: competitions,
      });

      // Act
      const result = await competitionRepository.getAllCompetitions();

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith('/api/competitions');
      expect(parseCompetitionDto).toHaveBeenCalledTimes(2);
      expect(parseCompetitionDto).toHaveBeenCalledWith(competitions[0]);
      expect(parseCompetitionDto).toHaveBeenCalledWith(competitions[1]);
      expect(result).toEqual([mockCompetition, mockCompetition]);
    });

    it('네트워크 에러 시 에러를 처리해야 한다', async () => {
      // Arrange
      const networkError = new Error('네트워크 연결 실패');
      mockFetcher.get = vi.fn().mockRejectedValue(networkError);

      // Act & Assert
      await expect(competitionRepository.getAllCompetitions()).rejects.toThrow('네트워크 연결 실패');
      expect(mockFetcher.get).toHaveBeenCalledWith('/api/competitions');
    });

    it('빈 목록을 반환할 수 있어야 한다', async () => {
      // Arrange
      mockFetcher.get = vi.fn().mockResolvedValue({
        data: [],
      });

      // Act
      const result = await competitionRepository.getAllCompetitions();

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith('/api/competitions');
      expect(parseCompetitionDto).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('getCompetitionById', () => {
    it('특정 대회 정보를 성공적으로 가져와야 한다', async () => {
      // Arrange
      const competitionId = 'competition-1';
      mockFetcher.get = vi.fn().mockResolvedValue({
        data: mockCompetitionDto,
      });

      // Act
      const result = await competitionRepository.getCompetitionById(competitionId);

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith(`/api/competitions/${competitionId}`);
      expect(parseCompetitionDto).toHaveBeenCalledWith(mockCompetitionDto);
      expect(result).toEqual(mockCompetition);
    });

    it('존재하지 않는 대회 조회 시 null을 반환해야 한다', async () => {
      // Arrange
      const competitionId = 'non-existent-competition';
      mockFetcher.get = vi.fn().mockResolvedValue({
        data: null,
      });

      // Act
      const result = await competitionRepository.getCompetitionById(competitionId);

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith(`/api/competitions/${competitionId}`);
      expect(parseCompetitionDto).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('네트워크 에러 시 에러를 처리해야 한다', async () => {
      // Arrange
      const competitionId = 'competition-1';
      const networkError = new Error('대회 조회 실패');
      mockFetcher.get = vi.fn().mockRejectedValue(networkError);

      // Act & Assert
      await expect(competitionRepository.getCompetitionById(competitionId)).rejects.toThrow('대회 조회 실패');
      expect(mockFetcher.get).toHaveBeenCalledWith(`/api/competitions/${competitionId}`);
    });
  });

  describe('createCompetition', () => {
    it('새 대회를 성공적으로 생성해야 한다', async () => {
      // Arrange
      const newCompetition: Omit<Competition, 'id' | 'createdAt'> = {
        name: 'New Competition',
        description: 'New Description',
      };

      mockAuthFetcher.post = vi.fn().mockResolvedValue({
        data: mockCompetitionDto,
      });

      // Act
      const result = await competitionRepository.createCompetition(newCompetition);

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalledWith('/api/competitions', {
        body: {
          name: 'New Competition',
          description: 'New Description',
        },
      });
      expect(parseCompetitionDto).toHaveBeenCalledWith(mockCompetitionDto);
      expect(result).toEqual(mockCompetition);
    });

    it('인증 실패 시 에러를 처리해야 한다', async () => {
      // Arrange
      const newCompetition: Omit<Competition, 'id' | 'createdAt'> = {
        name: 'New Competition',
        description: 'New Description',
      };
      const authError = new Error('인증 실패');
      mockAuthFetcher.post = vi.fn().mockRejectedValue(authError);

      // Act & Assert
      await expect(competitionRepository.createCompetition(newCompetition)).rejects.toThrow('인증 실패');
    });

    it('필수 필드가 누락된 경우 에러를 처리해야 한다', async () => {
      // Arrange
      const incompleteCompetition = {
        name: 'Incomplete Competition',
        // description 누락
      } as Omit<Competition, 'id' | 'createdAt'>;

      const validationError = new Error('필수 필드가 누락되었습니다');
      mockAuthFetcher.post = vi.fn().mockRejectedValue(validationError);

      // Act & Assert
      await expect(competitionRepository.createCompetition(incompleteCompetition)).rejects.toThrow('필수 필드가 누락되었습니다');
    });
  });

  describe('updateCompetition', () => {
    it('대회 정보를 성공적으로 업데이트해야 한다', async () => {
      // Arrange
      const updatedCompetition: Competition = {
        ...mockCompetition,
        name: 'Updated Competition',
        description: 'Updated Description',
      };

      const updatedCompetitionDto: CompetitionDto = {
        ...mockCompetitionDto,
        name: 'Updated Competition',
        description: 'Updated Description',
      };

      mockAuthFetcher.patch = vi.fn().mockResolvedValue({
        data: updatedCompetitionDto,
      });

      vi.mocked(parseCompetitionDto).mockReturnValue(updatedCompetition);

      // Act
      const result = await competitionRepository.updateCompetition(updatedCompetition);

      // Assert
      expect(mockAuthFetcher.patch).toHaveBeenCalledWith(`/api/competitions/${updatedCompetition.id}`, {
        body: {
          name: 'Updated Competition',
          description: 'Updated Description',
        },
      });
      expect(parseCompetitionDto).toHaveBeenCalledWith(updatedCompetitionDto);
      expect(result).toEqual(updatedCompetition);
    });

    it('존재하지 않는 대회 업데이트 시 에러를 처리해야 한다', async () => {
      // Arrange
      const nonExistentCompetition: Competition = {
        id: 'non-existent-id',
        name: 'Non-existent Competition',
        description: 'Non-existent Description',
        createdAt: new Date(),
      };

      const notFoundError = new Error('대회를 찾을 수 없습니다');
      mockAuthFetcher.patch = vi.fn().mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(competitionRepository.updateCompetition(nonExistentCompetition)).rejects.toThrow('대회를 찾을 수 없습니다');
    });

    it('권한 없음 에러를 처리해야 한다', async () => {
      // Arrange
      const unauthorizedError = new Error('권한이 없습니다');
      mockAuthFetcher.patch = vi.fn().mockRejectedValue(unauthorizedError);

      // Act & Assert
      await expect(competitionRepository.updateCompetition(mockCompetition)).rejects.toThrow('권한이 없습니다');
    });
  });

  describe('deleteCompetition', () => {
    it('대회를 성공적으로 삭제해야 한다', async () => {
      // Arrange
      const competitionId = 'competition-1';
      mockAuthFetcher.delete = vi.fn().mockResolvedValue({
        data: undefined,
      });

      // Act
      await competitionRepository.deleteCompetition(competitionId);

      // Assert
      expect(mockAuthFetcher.delete).toHaveBeenCalledWith(`/api/competitions/${competitionId}`);
    });

    it('존재하지 않는 대회 삭제 시 에러를 처리해야 한다', async () => {
      // Arrange
      const competitionId = 'non-existent-competition';
      const notFoundError = new Error('대회를 찾을 수 없습니다');
      mockAuthFetcher.delete = vi.fn().mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(competitionRepository.deleteCompetition(competitionId)).rejects.toThrow('대회를 찾을 수 없습니다');
      expect(mockAuthFetcher.delete).toHaveBeenCalledWith(`/api/competitions/${competitionId}`);
    });

    it('권한 없음 에러를 처리해야 한다', async () => {
      // Arrange
      const competitionId = 'competition-1';
      const forbiddenError = new Error('삭제 권한이 없습니다');
      mockAuthFetcher.delete = vi.fn().mockRejectedValue(forbiddenError);

      // Act & Assert
      await expect(competitionRepository.deleteCompetition(competitionId)).rejects.toThrow('삭제 권한이 없습니다');
    });
  });

  describe('Fetcher 사용 구분', () => {
    it('인증이 필요없는 메서드는 fetcher를 사용해야 한다', async () => {
      // Arrange & Act
      mockFetcher.get = vi.fn().mockResolvedValue({ data: [] });
      await competitionRepository.getAllCompetitions();

      mockFetcher.get = vi.fn().mockResolvedValue({ data: mockCompetitionDto });
      await competitionRepository.getCompetitionById('competition-1');

      // Assert
      expect(mockFetcher.get).toHaveBeenCalled();
      expect(mockAuthFetcher.get).not.toHaveBeenCalled();
    });

    it('인증이 필요한 메서드는 authFetcher를 사용해야 한다', async () => {
      // Arrange & Act
      const newCompetition: Omit<Competition, 'id' | 'createdAt'> = {
        name: 'Test',
        description: 'Test',
      };

      mockAuthFetcher.post = vi.fn().mockResolvedValue({ data: mockCompetitionDto });
      await competitionRepository.createCompetition(newCompetition);

      mockAuthFetcher.patch = vi.fn().mockResolvedValue({ data: mockCompetitionDto });
      await competitionRepository.updateCompetition(mockCompetition);

      mockAuthFetcher.delete = vi.fn().mockResolvedValue({ data: undefined });
      await competitionRepository.deleteCompetition('competition-1');

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalled();
      expect(mockAuthFetcher.patch).toHaveBeenCalled();
      expect(mockAuthFetcher.delete).toHaveBeenCalled();
    });
  });
});