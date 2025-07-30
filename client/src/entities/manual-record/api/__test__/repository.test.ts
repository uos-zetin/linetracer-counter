import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ManualRecordFetcherRepository } from '../repository';
import type { ManualRecord } from '../../model/types';
import type { ManualRecordDto } from '../types';
import type { Fetcher } from '@/shared';
import { parseManualRecordDto } from '../../lib/parse-dto';

// parseManualRecordDto 함수 모킹
vi.mock('../../lib/parse-dto', () => ({
  parseManualRecordDto: vi.fn(),
}));

describe('ManualRecordFetcherRepository', () => {
  let mockFetcher: Fetcher;
  let mockAuthFetcher: Fetcher;
  let manualRecordRepository: ManualRecordFetcherRepository;

  const mockManualRecordDto: ManualRecordDto = {
    id: 'manual-record-1',
    participantId: 'participant-1',
    value: 15.67,
    recorderName: 'Test Recorder',
    createdAt: '2024-01-01T00:00:00Z',
    invalidatedAt: null,
  };

  const mockManualRecord: ManualRecord = {
    id: 'manual-record-1',
    participantId: 'participant-1',
    value: 15.67,
    recorderName: 'Test Recorder',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    invalidatedAt: null,
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

    manualRecordRepository = new ManualRecordFetcherRepository(mockFetcher, mockAuthFetcher);

    // parseManualRecordDto 모킹 설정
    vi.mocked(parseManualRecordDto).mockReturnValue(mockManualRecord);
  });

  describe('getAllManualRecords', () => {
    it('특정 참가자의 모든 수동 기록을 성공적으로 가져와야 한다', async () => {
      // Arrange
      const participantId = 'participant-1';
      const manualRecords: ManualRecordDto[] = [
        mockManualRecordDto,
        {
          id: 'manual-record-2',
          participantId: 'participant-1',
          value: 18.23,
          recorderName: 'Another Recorder',
          createdAt: '2024-01-02T00:00:00Z',
          invalidatedAt: '2024-01-03T00:00:00Z',
        },
      ];

      mockFetcher.get = vi.fn().mockResolvedValue({
        data: manualRecords,
      });

      // Act
      const result = await manualRecordRepository.getAllManualRecords(participantId);

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith(`/participants/${participantId}/manual-records`);
      expect(parseManualRecordDto).toHaveBeenCalledTimes(2);
      expect(parseManualRecordDto).toHaveBeenCalledWith(manualRecords[0]);
      expect(parseManualRecordDto).toHaveBeenCalledWith(manualRecords[1]);
      expect(result).toEqual([mockManualRecord, mockManualRecord]);
    });

    it('빈 수동 기록 목록을 반환할 수 있어야 한다', async () => {
      // Arrange
      const participantId = 'participant-1';
      mockFetcher.get = vi.fn().mockResolvedValue({
        data: [],
      });

      // Act
      const result = await manualRecordRepository.getAllManualRecords(participantId);

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith(`/participants/${participantId}/manual-records`);
      expect(parseManualRecordDto).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('네트워크 에러 시 에러를 처리해야 한다', async () => {
      // Arrange
      const participantId = 'participant-1';
      const networkError = new Error('네트워크 연결 실패');
      mockFetcher.get = vi.fn().mockRejectedValue(networkError);

      // Act & Assert
      await expect(manualRecordRepository.getAllManualRecords(participantId)).rejects.toThrow('네트워크 연결 실패');
      expect(mockFetcher.get).toHaveBeenCalledWith(`/participants/${participantId}/manual-records`);
    });

    it('존재하지 않는 참가자에 대한 요청 시 에러를 처리해야 한다', async () => {
      // Arrange
      const participantId = 'non-existent-participant';
      const notFoundError = new Error('참가자를 찾을 수 없습니다');
      mockFetcher.get = vi.fn().mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(manualRecordRepository.getAllManualRecords(participantId)).rejects.toThrow('참가자를 찾을 수 없습니다');
    });
  });

  describe('createManualRecord', () => {
    it('새 수동 기록을 성공적으로 생성해야 한다', async () => {
      // Arrange
      const participantId = 'participant-1';
      const newManualRecord: Pick<ManualRecord, 'value' | 'recorderName'> = {
        value: 14.56,
        recorderName: 'New Recorder',
      };

      mockAuthFetcher.post = vi.fn().mockResolvedValue({
        data: mockManualRecordDto,
      });

      // Act
      const result = await manualRecordRepository.createManualRecord(participantId, newManualRecord);

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalledWith(`/participants/${participantId}/manual-records`, {
        body: newManualRecord,
      });
      expect(parseManualRecordDto).toHaveBeenCalledWith(mockManualRecordDto);
      expect(result).toEqual(mockManualRecord);
    });

    it('인증 실패 시 에러를 처리해야 한다', async () => {
      // Arrange
      const participantId = 'participant-1';
      const newManualRecord: Pick<ManualRecord, 'value' | 'recorderName'> = {
        value: 14.56,
        recorderName: 'New Recorder',
      };
      const authError = new Error('인증 실패');
      mockAuthFetcher.post = vi.fn().mockRejectedValue(authError);

      // Act & Assert
      await expect(manualRecordRepository.createManualRecord(participantId, newManualRecord)).rejects.toThrow('인증 실패');
    });

    it('유효하지 않은 데이터로 생성 시 에러를 처리해야 한다', async () => {
      // Arrange
      const participantId = 'participant-1';
      const invalidManualRecord = {
        value: -1, // 음수 값
        recorderName: '', // 빈 기록자 이름
      } as Pick<ManualRecord, 'value' | 'recorderName'>;

      const validationError = new Error('유효하지 않은 수동 기록 데이터입니다');
      mockAuthFetcher.post = vi.fn().mockRejectedValue(validationError);

      // Act & Assert
      await expect(manualRecordRepository.createManualRecord(participantId, invalidManualRecord)).rejects.toThrow('유효하지 않은 수동 기록 데이터입니다');
    });

    it('존재하지 않는 참가자에 대한 기록 생성 시 에러를 처리해야 한다', async () => {
      // Arrange
      const participantId = 'non-existent-participant';
      const newManualRecord: Pick<ManualRecord, 'value' | 'recorderName'> = {
        value: 14.56,
        recorderName: 'Recorder',
      };
      const notFoundError = new Error('참가자를 찾을 수 없습니다');
      mockAuthFetcher.post = vi.fn().mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(manualRecordRepository.createManualRecord(participantId, newManualRecord)).rejects.toThrow('참가자를 찾을 수 없습니다');
    });

    it('서버 내부 에러를 처리해야 한다', async () => {
      // Arrange
      const participantId = 'participant-1';
      const newManualRecord: Pick<ManualRecord, 'value' | 'recorderName'> = {
        value: 14.56,
        recorderName: 'Recorder',
      };
      const serverError = new Error('서버 내부 오류');
      mockAuthFetcher.post = vi.fn().mockRejectedValue(serverError);

      // Act & Assert
      await expect(manualRecordRepository.createManualRecord(participantId, newManualRecord)).rejects.toThrow('서버 내부 오류');
    });

    it('권한 없음 에러를 처리해야 한다', async () => {
      // Arrange
      const participantId = 'participant-1';
      const newManualRecord: Pick<ManualRecord, 'value' | 'recorderName'> = {
        value: 14.56,
        recorderName: 'Recorder',
      };
      const forbiddenError = new Error('수동 기록 생성 권한이 없습니다');
      mockAuthFetcher.post = vi.fn().mockRejectedValue(forbiddenError);

      // Act & Assert
      await expect(manualRecordRepository.createManualRecord(participantId, newManualRecord)).rejects.toThrow('수동 기록 생성 권한이 없습니다');
    });
  });

  describe('Fetcher 사용 구분', () => {
    it('getAllManualRecords는 fetcher를 사용해야 한다', async () => {
      // Arrange & Act
      mockFetcher.get = vi.fn().mockResolvedValue({ data: [] });
      await manualRecordRepository.getAllManualRecords('participant-1');

      // Assert
      expect(mockFetcher.get).toHaveBeenCalled();
      expect(mockAuthFetcher.get).not.toHaveBeenCalled();
    });

    it('createManualRecord는 authFetcher를 사용해야 한다', async () => {
      // Arrange & Act
      const newManualRecord: Pick<ManualRecord, 'value' | 'recorderName'> = {
        value: 12.34,
        recorderName: 'Test Recorder',
      };

      mockAuthFetcher.post = vi.fn().mockResolvedValue({ data: mockManualRecordDto });
      await manualRecordRepository.createManualRecord('participant-1', newManualRecord);

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalled();
      expect(mockFetcher.post).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('매우 큰 값의 기록을 처리할 수 있어야 한다', async () => {
      // Arrange
      const participantId = 'participant-1';
      const largeValueRecord: Pick<ManualRecord, 'value' | 'recorderName'> = {
        value: 999999.999,
        recorderName: 'Recorder',
      };

      mockAuthFetcher.post = vi.fn().mockResolvedValue({
        data: {
          ...mockManualRecordDto,
          value: 999999.999,
        },
      });

      // Act
      const result = await manualRecordRepository.createManualRecord(participantId, largeValueRecord);

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalledWith(`/participants/${participantId}/manual-records`, {
        body: largeValueRecord,
      });
      expect(result).toEqual(mockManualRecord);
    });

    it('특수문자가 포함된 기록자 이름을 처리할 수 있어야 한다', async () => {
      // Arrange
      const participantId = 'participant-1';
      const specialCharRecord: Pick<ManualRecord, 'value' | 'recorderName'> = {
        value: 12.34,
        recorderName: 'Recorder@#$%^&*()',
      };

      mockAuthFetcher.post = vi.fn().mockResolvedValue({
        data: {
          ...mockManualRecordDto,
          recorderName: 'Recorder@#$%^&*()',
        },
      });

      // Act
      const result = await manualRecordRepository.createManualRecord(participantId, specialCharRecord);

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalledWith(`/participants/${participantId}/manual-records`, {
        body: specialCharRecord,
      });
      expect(result).toEqual(mockManualRecord);
    });

    it('0초 기록을 처리할 수 있어야 한다', async () => {
      // Arrange
      const participantId = 'participant-1';
      const zeroTimeRecord: Pick<ManualRecord, 'value' | 'recorderName'> = {
        value: 0.0,
        recorderName: 'Recorder',
      };

      mockAuthFetcher.post = vi.fn().mockResolvedValue({
        data: {
          ...mockManualRecordDto,
          value: 0.0,
        },
      });

      // Act
      const result = await manualRecordRepository.createManualRecord(participantId, zeroTimeRecord);

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalledWith(`/participants/${participantId}/manual-records`, {
        body: zeroTimeRecord,
      });
      expect(result).toEqual(mockManualRecord);
    });
  });
});