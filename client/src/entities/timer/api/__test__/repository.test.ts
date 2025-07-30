import { beforeEach, describe, expect, it, vi } from "vitest";
import { TimerFetcherRepository } from "../repository";
import type { TimerLog } from "../../model/types";
import type { TimerLogDto } from "../types";
import type { Fetcher } from "@/shared";
import { parseTimerLogDto } from "../../lib/parse-dto";

// parseTimerLogDto 함수 모킹
vi.mock("../../lib/parse-dto", () => ({
  parseTimerLogDto: vi.fn(),
}));

describe("TimerFetcherRepository", () => {
  let mockFetcher: Fetcher;
  let mockAuthFetcher: Fetcher;
  let timerRepository: TimerFetcherRepository;

  const mockTimerLogDto: TimerLogDto = {
    id: "timer-log-1",
    participantId: "participant-1",
    value: 12345,
    type: "start",
    createdAt: "2024-01-01T00:00:00Z",
  };

  const mockTimerLog: TimerLog = {
    id: "timer-log-1",
    participantId: "participant-1",
    value: 12345,
    type: "start",
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

    timerRepository = new TimerFetcherRepository(mockFetcher, mockAuthFetcher);

    // parseTimerLogDto 모킹 설정
    vi.mocked(parseTimerLogDto).mockReturnValue(mockTimerLog);
  });

  describe("getTimerLogs", () => {
    it("특정 참가자의 모든 타이머 로그를 성공적으로 가져와야 한다", async () => {
      // Arrange
      const participantId = "participant-1";
      const timerLogs: TimerLogDto[] = [
        mockTimerLogDto,
        {
          id: "timer-log-2",
          participantId: "participant-1",
          value: 15000,
          type: "stop",
          createdAt: "2024-01-01T00:00:15Z",
        },
        {
          id: "timer-log-3",
          participantId: "participant-1",
          value: 1000,
          type: "adjust",
          createdAt: "2024-01-01T00:00:16Z",
        },
      ];

      mockFetcher.get = vi.fn().mockResolvedValue({
        data: timerLogs,
      });

      // Act
      const result = await timerRepository.getTimerLogs(participantId);

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith(`/participants/${participantId}/timers`);
      expect(parseTimerLogDto).toHaveBeenCalledTimes(3);
      expect(parseTimerLogDto).toHaveBeenCalledWith(timerLogs[0]);
      expect(parseTimerLogDto).toHaveBeenCalledWith(timerLogs[1]);
      expect(parseTimerLogDto).toHaveBeenCalledWith(timerLogs[2]);
      expect(result).toEqual([mockTimerLog, mockTimerLog, mockTimerLog]);
    });

    it("빈 타이머 로그 목록을 반환할 수 있어야 한다", async () => {
      // Arrange
      const participantId = "participant-1";
      mockFetcher.get = vi.fn().mockResolvedValue({
        data: [],
      });

      // Act
      const result = await timerRepository.getTimerLogs(participantId);

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith(`/participants/${participantId}/timers`);
      expect(parseTimerLogDto).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("null 데이터를 빈 배열로 처리해야 한다", async () => {
      // Arrange
      const participantId = "participant-1";
      mockFetcher.get = vi.fn().mockResolvedValue({
        data: null,
      });

      // Act
      const result = await timerRepository.getTimerLogs(participantId);

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith(`/participants/${participantId}/timers`);
      expect(parseTimerLogDto).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("네트워크 에러 시 에러를 처리해야 한다", async () => {
      // Arrange
      const participantId = "participant-1";
      const networkError = new Error("네트워크 연결 실패");
      mockFetcher.get = vi.fn().mockRejectedValue(networkError);

      // Act & Assert
      await expect(timerRepository.getTimerLogs(participantId)).rejects.toThrow("네트워크 연결 실패");
      expect(mockFetcher.get).toHaveBeenCalledWith(`/participants/${participantId}/timers`);
    });

    it("존재하지 않는 참가자에 대한 요청 시 에러를 처리해야 한다", async () => {
      // Arrange
      const participantId = "non-existent-participant";
      const notFoundError = new Error("참가자를 찾을 수 없습니다");
      mockFetcher.get = vi.fn().mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(timerRepository.getTimerLogs(participantId)).rejects.toThrow("참가자를 찾을 수 없습니다");
    });
  });

  describe("startTimer", () => {
    it("타이머를 성공적으로 시작해야 한다", async () => {
      // Arrange
      const participantId = "participant-1";
      const startTimerDto: TimerLogDto = {
        id: "timer-log-start",
        participantId: "participant-1",
        value: Date.now(),
        type: "start",
        createdAt: "2024-01-01T00:00:00Z",
      };

      const startTimerLog: TimerLog = {
        id: "timer-log-start",
        participantId: "participant-1",
        value: Date.now(),
        type: "start",
        createdAt: new Date("2024-01-01T00:00:00Z"),
      };

      mockAuthFetcher.post = vi.fn().mockResolvedValue({
        data: startTimerDto,
      });

      vi.mocked(parseTimerLogDto).mockReturnValue(startTimerLog);

      // Act
      const result = await timerRepository.startTimer(participantId);

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalledWith(`/participants/${participantId}/timers/start`);
      expect(parseTimerLogDto).toHaveBeenCalledWith(startTimerDto);
      expect(result).toEqual(startTimerLog);
    });

    it("인증 실패 시 에러를 처리해야 한다", async () => {
      // Arrange
      const participantId = "participant-1";
      const authError = new Error("인증 실패");
      mockAuthFetcher.post = vi.fn().mockRejectedValue(authError);

      // Act & Assert
      await expect(timerRepository.startTimer(participantId)).rejects.toThrow("인증 실패");
    });

    it("이미 시작된 타이머 재시작 시 에러를 처리해야 한다", async () => {
      // Arrange
      const participantId = "participant-1";
      const conflictError = new Error("타이머가 이미 시작되어 있습니다");
      mockAuthFetcher.post = vi.fn().mockRejectedValue(conflictError);

      // Act & Assert
      await expect(timerRepository.startTimer(participantId)).rejects.toThrow("타이머가 이미 시작되어 있습니다");
    });

    it("존재하지 않는 참가자의 타이머 시작 시 에러를 처리해야 한다", async () => {
      // Arrange
      const participantId = "non-existent-participant";
      const notFoundError = new Error("참가자를 찾을 수 없습니다");
      mockAuthFetcher.post = vi.fn().mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(timerRepository.startTimer(participantId)).rejects.toThrow("참가자를 찾을 수 없습니다");
    });
  });

  describe("stopTimer", () => {
    it("타이머를 성공적으로 정지해야 한다", async () => {
      // Arrange
      const participantId = "participant-1";
      const stopTimerDto: TimerLogDto = {
        id: "timer-log-stop",
        participantId: "participant-1",
        value: 15000,
        type: "stop",
        createdAt: "2024-01-01T00:00:15Z",
      };

      const stopTimerLog: TimerLog = {
        id: "timer-log-stop",
        participantId: "participant-1",
        value: 15000,
        type: "stop",
        createdAt: new Date("2024-01-01T00:00:15Z"),
      };

      mockAuthFetcher.post = vi.fn().mockResolvedValue({
        data: stopTimerDto,
      });

      vi.mocked(parseTimerLogDto).mockReturnValue(stopTimerLog);

      // Act
      const result = await timerRepository.stopTimer(participantId);

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalledWith(`/participants/${participantId}/timers/stop`);
      expect(parseTimerLogDto).toHaveBeenCalledWith(stopTimerDto);
      expect(result).toEqual(stopTimerLog);
    });

    it("정지되지 않은 타이머 정지 시 에러를 처리해야 한다", async () => {
      // Arrange
      const participantId = "participant-1";
      const conflictError = new Error("타이머가 시작되지 않았습니다");
      mockAuthFetcher.post = vi.fn().mockRejectedValue(conflictError);

      // Act & Assert
      await expect(timerRepository.stopTimer(participantId)).rejects.toThrow("타이머가 시작되지 않았습니다");
    });

    it("권한 없음 에러를 처리해야 한다", async () => {
      // Arrange
      const participantId = "participant-1";
      const forbiddenError = new Error("타이머 정지 권한이 없습니다");
      mockAuthFetcher.post = vi.fn().mockRejectedValue(forbiddenError);

      // Act & Assert
      await expect(timerRepository.stopTimer(participantId)).rejects.toThrow("타이머 정지 권한이 없습니다");
    });

    it("서버 내부 에러를 처리해야 한다", async () => {
      // Arrange
      const participantId = "participant-1";
      const serverError = new Error("서버 내부 오류");
      mockAuthFetcher.post = vi.fn().mockRejectedValue(serverError);

      // Act & Assert
      await expect(timerRepository.stopTimer(participantId)).rejects.toThrow("서버 내부 오류");
    });
  });

  describe("adjustTimer", () => {
    it("타이머를 성공적으로 조정해야 한다 (양수 값)", async () => {
      // Arrange
      const participantId = "participant-1";
      const adjustValue = 1000; // 1초 추가
      const adjustTimerDto: TimerLogDto = {
        id: "timer-log-adjust",
        participantId: "participant-1",
        value: adjustValue,
        type: "adjust",
        createdAt: "2024-01-01T00:00:16Z",
      };

      const adjustTimerLog: TimerLog = {
        id: "timer-log-adjust",
        participantId: "participant-1",
        value: 1000,
        type: "add",
        createdAt: new Date("2024-01-01T00:00:16Z"),
      };

      mockAuthFetcher.post = vi.fn().mockResolvedValue({
        data: adjustTimerDto,
      });

      vi.mocked(parseTimerLogDto).mockReturnValue(adjustTimerLog);

      // Act
      const result = await timerRepository.adjustTimer(participantId, adjustValue);

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalledWith(`/participants/${participantId}/timers/adjust`, {
        body: { value: adjustValue },
      });
      expect(parseTimerLogDto).toHaveBeenCalledWith(adjustTimerDto);
      expect(result).toEqual(adjustTimerLog);
    });

    it("타이머를 성공적으로 조정해야 한다 (음수 값)", async () => {
      // Arrange
      const participantId = "participant-1";
      const adjustValue = -500; // 0.5초 감소
      const adjustTimerDto: TimerLogDto = {
        id: "timer-log-adjust-negative",
        participantId: "participant-1",
        value: adjustValue,
        type: "adjust",
        createdAt: "2024-01-01T00:00:16Z",
      };

      const adjustTimerLog: TimerLog = {
        id: "timer-log-adjust-negative",
        participantId: "participant-1",
        value: 500,
        type: "sub",
        createdAt: new Date("2024-01-01T00:00:16Z"),
      };

      mockAuthFetcher.post = vi.fn().mockResolvedValue({
        data: adjustTimerDto,
      });

      vi.mocked(parseTimerLogDto).mockReturnValue(adjustTimerLog);

      // Act
      const result = await timerRepository.adjustTimer(participantId, adjustValue);

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalledWith(`/participants/${participantId}/timers/adjust`, {
        body: { value: adjustValue },
      });
      expect(parseTimerLogDto).toHaveBeenCalledWith(adjustTimerDto);
      expect(result).toEqual(adjustTimerLog);
    });

    it("0 값으로 조정 시에도 정상 처리해야 한다", async () => {
      // Arrange
      const participantId = "participant-1";
      const adjustValue = 0;
      const adjustTimerDto: TimerLogDto = {
        id: "timer-log-adjust-zero",
        participantId: "participant-1",
        value: 0,
        type: "adjust",
        createdAt: "2024-01-01T00:00:16Z",
      };

      const adjustTimerLog: TimerLog = {
        id: "timer-log-adjust-zero",
        participantId: "participant-1",
        value: 0,
        type: "sub",
        createdAt: new Date("2024-01-01T00:00:16Z"),
      };

      mockAuthFetcher.post = vi.fn().mockResolvedValue({
        data: adjustTimerDto,
      });

      vi.mocked(parseTimerLogDto).mockReturnValue(adjustTimerLog);

      // Act
      const result = await timerRepository.adjustTimer(participantId, adjustValue);

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalledWith(`/participants/${participantId}/timers/adjust`, {
        body: { value: adjustValue },
      });
      expect(result).toEqual(adjustTimerLog);
    });

    it("유효하지 않은 조정 값에 대한 에러를 처리해야 한다", async () => {
      // Arrange
      const participantId = "participant-1";
      const invalidValue = Number.NaN;
      const validationError = new Error("유효하지 않은 조정 값입니다");
      mockAuthFetcher.post = vi.fn().mockRejectedValue(validationError);

      // Act & Assert
      await expect(timerRepository.adjustTimer(participantId, invalidValue)).rejects.toThrow(
        "유효하지 않은 조정 값입니다",
      );
    });

    it("권한 없음 에러를 처리해야 한다", async () => {
      // Arrange
      const participantId = "participant-1";
      const adjustValue = 1000;
      const forbiddenError = new Error("타이머 조정 권한이 없습니다");
      mockAuthFetcher.post = vi.fn().mockRejectedValue(forbiddenError);

      // Act & Assert
      await expect(timerRepository.adjustTimer(participantId, adjustValue)).rejects.toThrow(
        "타이머 조정 권한이 없습니다",
      );
    });
  });

  describe("Fetcher 사용 구분", () => {
    it("조회 메서드는 fetcher를 사용해야 한다", async () => {
      // Arrange & Act
      mockFetcher.get = vi.fn().mockResolvedValue({ data: [] });
      await timerRepository.getTimerLogs("participant-1");

      // Assert
      expect(mockFetcher.get).toHaveBeenCalled();
      expect(mockAuthFetcher.get).not.toHaveBeenCalled();
    });

    it("인증이 필요한 메서드는 authFetcher를 사용해야 한다", async () => {
      // Arrange & Act
      mockAuthFetcher.post = vi.fn().mockResolvedValue({ data: mockTimerLogDto });
      await timerRepository.startTimer("participant-1");

      mockAuthFetcher.post = vi.fn().mockResolvedValue({ data: mockTimerLogDto });
      await timerRepository.stopTimer("participant-1");

      mockAuthFetcher.post = vi.fn().mockResolvedValue({ data: mockTimerLogDto });
      await timerRepository.adjustTimer("participant-1", 1000);

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalled();
      expect(mockFetcher.post).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("매우 큰 타이머 값을 처리할 수 있어야 한다", async () => {
      // Arrange
      const participantId = "participant-1";
      const largeValue = 999999999; // 약 11.5일

      mockAuthFetcher.post = vi.fn().mockResolvedValue({
        data: {
          ...mockTimerLogDto,
          value: largeValue,
        },
      });

      // Act
      const result = await timerRepository.adjustTimer(participantId, largeValue);

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalledWith(`/participants/${participantId}/timers/adjust`, {
        body: { value: largeValue },
      });
      expect(result).toEqual(mockTimerLog);
    });

    it("매우 작은 음수 타이머 값을 처리할 수 있어야 한다", async () => {
      // Arrange
      const participantId = "participant-1";
      const smallNegativeValue = -999999999;

      mockAuthFetcher.post = vi.fn().mockResolvedValue({
        data: {
          ...mockTimerLogDto,
          value: smallNegativeValue,
        },
      });

      // Act
      const result = await timerRepository.adjustTimer(participantId, smallNegativeValue);

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalledWith(`/participants/${participantId}/timers/adjust`, {
        body: { value: smallNegativeValue },
      });
      expect(result).toEqual(mockTimerLog);
    });

    it("특수 문자가 포함된 참가자 ID를 처리할 수 있어야 한다", async () => {
      // Arrange
      const specialParticipantId = "participant-123@#$%";

      mockFetcher.get = vi.fn().mockResolvedValue({
        data: [mockTimerLogDto],
      });

      // Act
      const result = await timerRepository.getTimerLogs(specialParticipantId);

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith(`/participants/${specialParticipantId}/timers`);
      expect(result).toEqual([mockTimerLog]);
    });
  });
});