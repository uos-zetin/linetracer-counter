import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DivisionFetcherRepository } from '../repository';
import type { Division, DivisionStatus } from '../../model/types';
import type { DivisionDto } from '../types';
import type { Fetcher } from '@/shared';
import { parseDivisionDto } from '../../lib/parse-dto';

// parseDivisionDto 함수 모킹
vi.mock('../../lib/parse-dto', () => ({
  parseDivisionDto: vi.fn(),
}));

describe('DivisionFetcherRepository', () => {
  let mockFetcher: Fetcher;
  let mockAuthFetcher: Fetcher;
  let divisionRepository: DivisionFetcherRepository;

  const mockDivisionDto: DivisionDto = {
    id: 'division-1',
    competitionId: 'competition-1',
    name: 'Test Division',
    description: 'Test Description',
    createdAt: '2024-01-01T00:00:00Z',
    status: 'ready',
  };

  const mockDivision: Division = {
    id: 'division-1',
    competitionId: 'competition-1',
    name: 'Test Division',
    description: 'Test Description',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    status: 'ready' as DivisionStatus,
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
      patch: vi.fn(),
      request: vi.fn(),
    };

    mockAuthFetcher = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
      request: vi.fn(),
    };

    divisionRepository = new DivisionFetcherRepository(mockFetcher, mockAuthFetcher);

    // parseDivisionDto 모킹 설정
    vi.mocked(parseDivisionDto).mockReturnValue(mockDivision);
  });

  describe('getAllDivisions', () => {
    it('특정 대회의 모든 디비전 목록을 성공적으로 가져와야 한다', async () => {
      // Arrange
      const competitionId = 'competition-1';
      const divisions: DivisionDto[] = [
        mockDivisionDto,
        {
          id: 'division-2',
          competitionId: 'competition-1',
          name: 'Another Division',
          description: 'Another Description',
          createdAt: '2024-01-02T00:00:00Z',
          status: 'ongoing',
        },
      ];

      mockFetcher.get = vi.fn().mockResolvedValue({
        data: divisions,
      });

      // Act
      const result = await divisionRepository.getAllDivisions(competitionId);

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith(`/api/competitions/${competitionId}/divisions`);
      expect(parseDivisionDto).toHaveBeenCalledTimes(2);
      expect(parseDivisionDto).toHaveBeenCalledWith(divisions[0]);
      expect(parseDivisionDto).toHaveBeenCalledWith(divisions[1]);
      expect(result).toEqual([mockDivision, mockDivision]);
    });

    it('빈 디비전 목록을 반환할 수 있어야 한다', async () => {
      // Arrange
      const competitionId = 'competition-1';
      mockFetcher.get = vi.fn().mockResolvedValue({
        data: [],
      });

      // Act
      const result = await divisionRepository.getAllDivisions(competitionId);

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith(`/api/competitions/${competitionId}/divisions`);
      expect(parseDivisionDto).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('네트워크 에러 시 에러를 처리해야 한다', async () => {
      // Arrange
      const competitionId = 'competition-1';
      const networkError = new Error('네트워크 연결 실패');
      mockFetcher.get = vi.fn().mockRejectedValue(networkError);

      // Act & Assert
      await expect(divisionRepository.getAllDivisions(competitionId)).rejects.toThrow('네트워크 연결 실패');
      expect(mockFetcher.get).toHaveBeenCalledWith(`/api/competitions/${competitionId}/divisions`);
    });
  });

  describe('getDivisionById', () => {
    it('특정 디비전 정보를 성공적으로 가져와야 한다', async () => {
      // Arrange
      const divisionId = 'division-1';
      mockAuthFetcher.get = vi.fn().mockResolvedValue({
        data: mockDivisionDto,
      });

      // Act
      const result = await divisionRepository.getDivisionById(divisionId);

      // Assert
      expect(mockAuthFetcher.get).toHaveBeenCalledWith(`/api/divisions/${divisionId}`);
      expect(parseDivisionDto).toHaveBeenCalledWith(mockDivisionDto);
      expect(result).toEqual(mockDivision);
    });

    it('존재하지 않는 디비전 조회 시 null을 반환해야 한다', async () => {
      // Arrange
      const divisionId = 'non-existent-division';
      mockAuthFetcher.get = vi.fn().mockResolvedValue({
        data: null,
      });

      // Act
      const result = await divisionRepository.getDivisionById(divisionId);

      // Assert
      expect(mockAuthFetcher.get).toHaveBeenCalledWith(`/api/divisions/${divisionId}`);
      expect(parseDivisionDto).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('인증 실패 시 에러를 처리해야 한다', async () => {
      // Arrange
      const divisionId = 'division-1';
      const authError = new Error('인증 실패');
      mockAuthFetcher.get = vi.fn().mockRejectedValue(authError);

      // Act & Assert
      await expect(divisionRepository.getDivisionById(divisionId)).rejects.toThrow('인증 실패');
      expect(mockAuthFetcher.get).toHaveBeenCalledWith(`/api/divisions/${divisionId}`);
    });
  });

  describe('createDivision', () => {
    it('새 디비전을 성공적으로 생성해야 한다', async () => {
      // Arrange
      const competitionId = 'competition-1';
      const newDivision: Omit<Division, 'id' | 'createdAt'> = {
        competitionId: 'competition-1',
        name: 'New Division',
        description: 'New Description',
        status: 'ready' as DivisionStatus,
      };

      mockAuthFetcher.post = vi.fn().mockResolvedValue({
        data: mockDivisionDto,
      });

      // Act
      const result = await divisionRepository.createDivision(competitionId, newDivision);

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalledWith(`/api/competitions/${competitionId}/divisions`, {
        body: newDivision,
      });
      expect(parseDivisionDto).toHaveBeenCalledWith(mockDivisionDto);
      expect(result).toEqual(mockDivision);
    });

    it('인증 실패 시 에러를 처리해야 한다', async () => {
      // Arrange
      const competitionId = 'competition-1';
      const newDivision: Omit<Division, 'id' | 'createdAt'> = {
        competitionId: 'competition-1',
        name: 'New Division',
        description: 'New Description',
        status: 'ready' as DivisionStatus,
      };
      const authError = new Error('인증 실패');
      mockAuthFetcher.post = vi.fn().mockRejectedValue(authError);

      // Act & Assert
      await expect(divisionRepository.createDivision(competitionId, newDivision)).rejects.toThrow('인증 실패');
    });

    it('유효하지 않은 데이터로 생성 시 에러를 처리해야 한다', async () => {
      // Arrange
      const competitionId = 'competition-1';
      const invalidDivision = {
        name: '', // 빈 이름
        description: 'Description',
        status: 'invalid-status',
      } as Omit<Division, 'id' | 'createdAt'>;

      const validationError = new Error('유효하지 않은 데이터입니다');
      mockAuthFetcher.post = vi.fn().mockRejectedValue(validationError);

      // Act & Assert
      await expect(divisionRepository.createDivision(competitionId, invalidDivision)).rejects.toThrow('유효하지 않은 데이터입니다');
    });
  });

  describe('updateDivision', () => {
    it('디비전 정보를 성공적으로 업데이트해야 한다', async () => {
      // Arrange
      const divisionId = 'division-1';
      const updatedDivision: Division = {
        ...mockDivision,
        name: 'Updated Division',
        description: 'Updated Description',
        status: 'ongoing' as DivisionStatus,
      };

      const updatedDivisionDto: DivisionDto = {
        ...mockDivisionDto,
        name: 'Updated Division',
        description: 'Updated Description',
        status: 'ongoing',
      };

      mockAuthFetcher.patch = vi.fn().mockResolvedValue({
        data: updatedDivisionDto,
      });

      vi.mocked(parseDivisionDto).mockReturnValue(updatedDivision);

      // Act
      const result = await divisionRepository.updateDivision(divisionId, updatedDivision);

      // Assert
      expect(mockAuthFetcher.patch).toHaveBeenCalledWith(`/api/divisions/${divisionId}`, {
        body: updatedDivision,
      });
      expect(parseDivisionDto).toHaveBeenCalledWith(updatedDivisionDto);
      expect(result).toEqual(updatedDivision);
    });

    it('존재하지 않는 디비전 업데이트 시 null을 반환해야 한다', async () => {
      // Arrange
      const divisionId = 'non-existent-division';
      const division: Division = mockDivision;

      mockAuthFetcher.patch = vi.fn().mockResolvedValue({
        data: null,
      });

      // Act
      const result = await divisionRepository.updateDivision(divisionId, division);

      // Assert
      expect(mockAuthFetcher.patch).toHaveBeenCalledWith(`/api/divisions/${divisionId}`, {
        body: division,
      });
      expect(parseDivisionDto).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('권한 없음 에러를 처리해야 한다', async () => {
      // Arrange
      const divisionId = 'division-1';
      const division: Division = mockDivision;
      const forbiddenError = new Error('권한이 없습니다');
      mockAuthFetcher.patch = vi.fn().mockRejectedValue(forbiddenError);

      // Act & Assert
      await expect(divisionRepository.updateDivision(divisionId, division)).rejects.toThrow('권한이 없습니다');
    });
  });

  describe('deleteDivision', () => {
    it('디비전을 성공적으로 삭제해야 한다', async () => {
      // Arrange
      const divisionId = 'division-1';
      mockAuthFetcher.delete = vi.fn().mockResolvedValue({
        data: undefined,
      });

      // Act
      await divisionRepository.deleteDivision(divisionId);

      // Assert
      expect(mockAuthFetcher.delete).toHaveBeenCalledWith(`/api/divisions/${divisionId}`);
    });

    it('존재하지 않는 디비전 삭제 시 에러를 처리해야 한다', async () => {
      // Arrange
      const divisionId = 'non-existent-division';
      const notFoundError = new Error('디비전을 찾을 수 없습니다');
      mockAuthFetcher.delete = vi.fn().mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(divisionRepository.deleteDivision(divisionId)).rejects.toThrow('디비전을 찾을 수 없습니다');
      expect(mockAuthFetcher.delete).toHaveBeenCalledWith(`/api/divisions/${divisionId}`);
    });

    it('권한 없음 에러를 처리해야 한다', async () => {
      // Arrange
      const divisionId = 'division-1';
      const forbiddenError = new Error('삭제 권한이 없습니다');
      mockAuthFetcher.delete = vi.fn().mockRejectedValue(forbiddenError);

      // Act & Assert
      await expect(divisionRepository.deleteDivision(divisionId)).rejects.toThrow('삭제 권한이 없습니다');
    });
  });

  describe('Fetcher 사용 구분', () => {
    it('getAllDivisions는 fetcher를 사용해야 한다', async () => {
      // Arrange & Act
      mockFetcher.get = vi.fn().mockResolvedValue({ data: [] });
      await divisionRepository.getAllDivisions('competition-1');

      // Assert
      expect(mockFetcher.get).toHaveBeenCalled();
      expect(mockAuthFetcher.get).not.toHaveBeenCalled();
    });

    it('인증이 필요한 메서드는 authFetcher를 사용해야 한다', async () => {
      // Arrange & Act
      mockAuthFetcher.get = vi.fn().mockResolvedValue({ data: mockDivisionDto });
      await divisionRepository.getDivisionById('division-1');

      const newDivision: Omit<Division, 'id' | 'createdAt'> = {
        competitionId: 'competition-1',
        name: 'Test',
        description: 'Test',
        status: 'ready' as DivisionStatus,
      };

      mockAuthFetcher.post = vi.fn().mockResolvedValue({ data: mockDivisionDto });
      await divisionRepository.createDivision('competition-1', newDivision);

      mockAuthFetcher.patch = vi.fn().mockResolvedValue({ data: mockDivisionDto });
      await divisionRepository.updateDivision('division-1', mockDivision);

      mockAuthFetcher.delete = vi.fn().mockResolvedValue({ data: undefined });
      await divisionRepository.deleteDivision('division-1');

      // Assert
      expect(mockAuthFetcher.get).toHaveBeenCalled();
      expect(mockAuthFetcher.post).toHaveBeenCalled();
      expect(mockAuthFetcher.patch).toHaveBeenCalled();
      expect(mockAuthFetcher.delete).toHaveBeenCalled();
    });
  });
});