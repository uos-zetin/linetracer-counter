import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Fetcher } from "@/shared/api";
import { parseRecordDto, parseRecordForm } from "../../lib/parse-dto";
import type { Record, RecordSource, RecordStatus } from "../../model/types";
import { RecordFetcherRepository } from "../repository";
import type { RecordDto } from "../types";

// parseRecordDto와 parseRecordForm 함수 모킹
vi.mock("../../lib/parse-dto", () => ({
  parseRecordDto: vi.fn(),
  parseRecordForm: vi.fn(),
  parseRecordSourceDto: vi.fn(),
  parseRecordSource: vi.fn(),
  parseRecordStatusDto: vi.fn(),
}));

describe("RecordFetcherRepository", () => {
  let mockFetcher: Fetcher;
  let mockAuthFetcher: Fetcher;
  let recordRepository: RecordFetcherRepository;

  const mockRecordDto: RecordDto = {
    id: "record-1",
    participantId: "participant-1",
    value: 12.34,
    source: "stopwatch",
    status: "pending",
    note: "Test Note",
    createdAt: "2024-01-01T00:00:00Z",
  };

  const mockRecord: Record = {
    id: "record-1",
    participantId: "participant-1",
    value: 12.34,
    source: "stopwatch" as RecordSource,
    status: "pending" as RecordStatus,
    note: "Test Note",
    createdAt: new Date("2024-01-01T00:00:00Z"),
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

    recordRepository = new RecordFetcherRepository(mockFetcher, mockAuthFetcher);

    // parseRecordDto 모킹 설정
    vi.mocked(parseRecordDto).mockReturnValue(mockRecord);

    // parseRecordForm 모킹 설정
    vi.mocked(parseRecordForm).mockImplementation((form) => ({
      value: form.value,
      source: form.source,
      note: form.note,
    }));
  });

  describe("getAllRecords", () => {
    it("특정 참가자의 모든 기록을 성공적으로 가져와야 한다", async () => {
      // Arrange
      const participantId = "participant-1";
      const records: RecordDto[] = [
        mockRecordDto,
        {
          id: "record-2",
          participantId: "participant-1",
          value: 15.67,
          source: "manual",
          status: "approved",
          note: "Another Note",
          createdAt: "2024-01-02T00:00:00Z",
        },
      ];

      mockFetcher.get = vi.fn().mockResolvedValue({
        data: records,
      });

      // Act
      const result = await recordRepository.getAllRecords(participantId);

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith(`/participants/${participantId}/records`);
      expect(parseRecordDto).toHaveBeenCalledTimes(2);
      expect(parseRecordDto).toHaveBeenCalledWith(records[0]);
      expect(parseRecordDto).toHaveBeenCalledWith(records[1]);
      expect(result).toEqual([mockRecord, mockRecord]);
    });

    it("빈 기록 목록을 반환할 수 있어야 한다", async () => {
      // Arrange
      const participantId = "participant-1";
      mockFetcher.get = vi.fn().mockResolvedValue({
        data: [],
      });

      // Act
      const result = await recordRepository.getAllRecords(participantId);

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith(`/participants/${participantId}/records`);
      expect(parseRecordDto).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("네트워크 에러 시 에러를 처리해야 한다", async () => {
      // Arrange
      const participantId = "participant-1";
      const networkError = new Error("네트워크 연결 실패");
      mockFetcher.get = vi.fn().mockRejectedValue(networkError);

      // Act & Assert
      await expect(recordRepository.getAllRecords(participantId)).rejects.toThrow("네트워크 연결 실패");
      expect(mockFetcher.get).toHaveBeenCalledWith(`/participants/${participantId}/records`);
    });
  });

  describe("getTopRecords", () => {
    it("특정 디비전의 최고 기록을 성공적으로 가져와야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      const topRecords: RecordDto[] = [
        {
          ...mockRecordDto,
          value: 10.0,
          status: "approved",
        },
        {
          ...mockRecordDto,
          id: "record-2",
          value: 11.5,
          status: "approved",
        },
      ];

      mockFetcher.get = vi.fn().mockResolvedValue({
        data: topRecords,
      });

      // Act
      const result = await recordRepository.getTopRecords(divisionId);

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith(`/divisions/${divisionId}/records/top`);
      expect(parseRecordDto).toHaveBeenCalledTimes(2);
      expect(result).toEqual([mockRecord, mockRecord]);
    });

    it("빈 최고 기록 목록을 반환할 수 있어야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      mockFetcher.get = vi.fn().mockResolvedValue({
        data: [],
      });

      // Act
      const result = await recordRepository.getTopRecords(divisionId);

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith(`/divisions/${divisionId}/records/top`);
      expect(parseRecordDto).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("네트워크 에러 시 에러를 처리해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      const networkError = new Error("최고 기록 조회 실패");
      mockFetcher.get = vi.fn().mockRejectedValue(networkError);

      // Act & Assert
      await expect(recordRepository.getTopRecords(divisionId)).rejects.toThrow("최고 기록 조회 실패");
      expect(mockFetcher.get).toHaveBeenCalledWith(`/divisions/${divisionId}/records/top`);
    });
  });

  describe("createRecord", () => {
    it("새 기록을 성공적으로 생성해야 한다", async () => {
      // Arrange
      const participantId = "participant-1";
      const newRecord: Pick<Record, "value" | "source" | "note"> = {
        value: 13.45,
        source: "stopwatch" as RecordSource,
        note: "New Record Note",
      };

      mockAuthFetcher.post = vi.fn().mockResolvedValue({
        data: mockRecordDto,
      });

      // Act
      const result = await recordRepository.createRecord(participantId, newRecord);

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalledWith(`/participants/${participantId}/records`, {
        body: newRecord,
      });
      expect(parseRecordDto).toHaveBeenCalledWith(mockRecordDto);
      expect(result).toEqual(mockRecord);
    });

    it("인증 실패 시 에러를 처리해야 한다", async () => {
      // Arrange
      const participantId = "participant-1";
      const newRecord: Pick<Record, "value" | "source" | "note"> = {
        value: 13.45,
        source: "stopwatch" as RecordSource,
        note: "New Record Note",
      };
      const authError = new Error("인증 실패");
      mockAuthFetcher.post = vi.fn().mockRejectedValue(authError);

      // Act & Assert
      await expect(recordRepository.createRecord(participantId, newRecord)).rejects.toThrow("인증 실패");
    });

    it("유효하지 않은 데이터로 생성 시 에러를 처리해야 한다", async () => {
      // Arrange
      const participantId = "participant-1";
      const invalidRecord = {
        value: -1, // 음수 값
        source: "invalid-source",
        note: "Note",
      } as unknown as Pick<Record, "value" | "source" | "note">;

      const validationError = new Error("유효하지 않은 기록 데이터입니다");
      mockAuthFetcher.post = vi.fn().mockRejectedValue(validationError);

      // Act & Assert
      await expect(recordRepository.createRecord(participantId, invalidRecord)).rejects.toThrow(
        "유효하지 않은 기록 데이터입니다"
      );
    });
  });

  describe("updateRecordNote", () => {
    it("기록 노트를 성공적으로 업데이트해야 한다", async () => {
      // Arrange
      const recordId = "record-1";
      const updatedNote = "Updated Note";
      const updatedRecordDto: RecordDto = {
        ...mockRecordDto,
        note: updatedNote,
      };

      const updatedRecord: Record = {
        ...mockRecord,
        note: updatedNote,
      };

      mockAuthFetcher.patch = vi.fn().mockResolvedValue({
        data: updatedRecordDto,
      });

      vi.mocked(parseRecordDto).mockReturnValue(updatedRecord);

      // Act
      const result = await recordRepository.updateRecordNote(recordId, updatedNote);

      // Assert
      expect(mockAuthFetcher.patch).toHaveBeenCalledWith(`/records/${recordId}/note`, {
        body: { note: updatedNote },
      });
      expect(parseRecordDto).toHaveBeenCalledWith(updatedRecordDto);
      expect(result).toEqual(updatedRecord);
    });

    it("존재하지 않는 기록 노트 업데이트 시 에러를 처리해야 한다", async () => {
      // Arrange
      const recordId = "non-existent-record";
      const note = "Note";
      const notFoundError = new Error("기록을 찾을 수 없습니다");
      mockAuthFetcher.patch = vi.fn().mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(recordRepository.updateRecordNote(recordId, note)).rejects.toThrow("기록을 찾을 수 없습니다");
    });

    it("권한 없음 에러를 처리해야 한다", async () => {
      // Arrange
      const recordId = "record-1";
      const note = "Note";
      const forbiddenError = new Error("권한이 없습니다");
      mockAuthFetcher.patch = vi.fn().mockRejectedValue(forbiddenError);

      // Act & Assert
      await expect(recordRepository.updateRecordNote(recordId, note)).rejects.toThrow("권한이 없습니다");
    });
  });

  describe("updateRecordStatus", () => {
    it("기록 상태를 성공적으로 업데이트해야 한다", async () => {
      // Arrange
      const recordId = "record-1";
      const newStatus: RecordStatus = "approved";
      const updatedRecordDto: RecordDto = {
        ...mockRecordDto,
        status: newStatus,
      };

      const updatedRecord: Record = {
        ...mockRecord,
        status: newStatus,
      };

      mockAuthFetcher.patch = vi.fn().mockResolvedValue({
        data: updatedRecordDto,
      });

      vi.mocked(parseRecordDto).mockReturnValue(updatedRecord);

      // Act
      const result = await recordRepository.updateRecordStatus(recordId, newStatus);

      // Assert
      expect(mockAuthFetcher.patch).toHaveBeenCalledWith(`/records/${recordId}/status`, {
        body: { status: newStatus },
      });
      expect(parseRecordDto).toHaveBeenCalledWith(updatedRecordDto);
      expect(result).toEqual(updatedRecord);
    });

    it("유효하지 않은 상태로 업데이트 시 에러를 처리해야 한다", async () => {
      // Arrange
      const recordId = "record-1";
      const invalidStatus = "invalid-status" as RecordStatus;
      const validationError = new Error("유효하지 않은 상태입니다");
      mockAuthFetcher.patch = vi.fn().mockRejectedValue(validationError);

      // Act & Assert
      await expect(recordRepository.updateRecordStatus(recordId, invalidStatus)).rejects.toThrow(
        "유효하지 않은 상태입니다"
      );
    });

    it("권한 없음 에러를 처리해야 한다", async () => {
      // Arrange
      const recordId = "record-1";
      const status: RecordStatus = "approved";
      const forbiddenError = new Error("상태 변경 권한이 없습니다");
      mockAuthFetcher.patch = vi.fn().mockRejectedValue(forbiddenError);

      // Act & Assert
      await expect(recordRepository.updateRecordStatus(recordId, status)).rejects.toThrow("상태 변경 권한이 없습니다");
    });
  });

  describe("Fetcher 사용 구분", () => {
    it("조회 메서드는 fetcher를 사용해야 한다", async () => {
      // Arrange & Act
      mockFetcher.get = vi.fn().mockResolvedValue({ data: [] });
      await recordRepository.getAllRecords("participant-1");

      mockFetcher.get = vi.fn().mockResolvedValue({ data: [] });
      await recordRepository.getTopRecords("division-1");

      // Assert
      expect(mockFetcher.get).toHaveBeenCalled();
      expect(mockAuthFetcher.get).not.toHaveBeenCalled();
    });

    it("인증이 필요한 메서드는 authFetcher를 사용해야 한다", async () => {
      // Arrange & Act
      const newRecord: Pick<Record, "value" | "source" | "note"> = {
        value: 12.34,
        source: "stopwatch" as RecordSource,
        note: "Note",
      };

      mockAuthFetcher.post = vi.fn().mockResolvedValue({ data: mockRecordDto });
      await recordRepository.createRecord("participant-1", newRecord);

      mockAuthFetcher.patch = vi.fn().mockResolvedValue({ data: mockRecordDto });
      await recordRepository.updateRecordNote("record-1", "Updated Note");

      mockAuthFetcher.patch = vi.fn().mockResolvedValue({ data: mockRecordDto });
      await recordRepository.updateRecordStatus("record-1", "approved");

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalled();
      expect(mockAuthFetcher.patch).toHaveBeenCalled();
    });
  });
});
