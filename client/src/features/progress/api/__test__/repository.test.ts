import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Fetcher } from "@/shared";
import { parseProgressDto } from "../../lib/parse-dto";
import type { ProgressState } from "../../model/types";
import { ProgressFetcherRepository } from "../repository";
import type { ProgressDto } from "../types";

// parseProgressDto 함수 모킹
vi.mock("../../lib/parse-dto", () => ({
  parseProgressDto: vi.fn(),
}));

describe("ProgressFetcherRepository", () => {
  let mockFetcher: Fetcher;
  let mockAuthFetcher: Fetcher;
  let progressRepository: ProgressFetcherRepository;

  const mockProgressDto: ProgressDto = {
    id: "progress-1",
    competition: {
      id: "competition-1",
      name: "Test Competition",
      description: "Test Description",
      createdAt: "2024-01-01T00:00:00Z",
    },
    division: {
      id: "division-1",
      competitionId: "competition-1",
      name: "Test Division",
      description: "Test Description",
      createdAt: "2024-01-01T00:00:00Z",
      status: "ongoing",
      timeLimit: 4 * 60 * 1000,
    },
    runner: null,
    nextRunners: [],
    topRecords: [],
  };

  const mockProgressState: ProgressState = {
    id: "progress-1",
    competition: {
      id: "competition-1",
      name: "Test Competition",
      description: "Test Description",
      createdAt: new Date("2024-01-01T00:00:00Z"),
    },
    division: {
      id: "division-1",
      competitionId: "competition-1",
      name: "Test Division",
      description: "Test Description",
      createdAt: new Date("2024-01-01T00:00:00Z"),
      status: "ongoing",
      timeLimit: 4 * 60 * 1000,
    },
    runner: null,
    nextRunners: [],
    topRecords: [],
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

    progressRepository = new ProgressFetcherRepository(mockFetcher, mockAuthFetcher);

    // parseProgressDto 모킹 설정
    vi.mocked(parseProgressDto).mockReturnValue(mockProgressState);
  });

  describe("getProgress", () => {
    it("특정 디비전의 진행 상태를 성공적으로 가져와야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      mockFetcher.get = vi.fn().mockResolvedValue({
        data: mockProgressDto,
      });

      // Act
      const result = await progressRepository.getProgress(divisionId);

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith(`/divisions/${divisionId}/progress`);
      expect(parseProgressDto).toHaveBeenCalledWith(mockProgressDto);
      expect(result).toEqual(mockProgressState);
    });

    it("진행 상태가 없는 경우 null을 반환해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      mockFetcher.get = vi.fn().mockResolvedValue({
        data: null,
      });

      // Act
      const result = await progressRepository.getProgress(divisionId);

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith(`/divisions/${divisionId}/progress`);
      expect(parseProgressDto).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("네트워크 에러 시 에러를 처리해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      const networkError = new Error("네트워크 연결 실패");
      mockFetcher.get = vi.fn().mockRejectedValue(networkError);

      // Act & Assert
      await expect(progressRepository.getProgress(divisionId)).rejects.toThrow("네트워크 연결 실패");
      expect(mockFetcher.get).toHaveBeenCalledWith(`/divisions/${divisionId}/progress`);
    });

    it("존재하지 않는 디비전에 대한 요청 시 에러를 처리해야 한다", async () => {
      // Arrange
      const divisionId = "non-existent-division";
      const notFoundError = new Error("디비전을 찾을 수 없습니다");
      mockFetcher.get = vi.fn().mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(progressRepository.getProgress(divisionId)).rejects.toThrow("디비전을 찾을 수 없습니다");
    });
  });

  describe("openProgressDivision", () => {
    it("디비전 진행을 성공적으로 시작해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      mockAuthFetcher.post = vi.fn().mockResolvedValue({
        data: undefined,
      });

      // Act
      await progressRepository.openProgressDivision(divisionId);

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalledWith(`/divisions/${divisionId}/progress/open`);
    });

    it("이미 시작된 디비전에 대한 요청 시 에러를 처리해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      const conflictError = new Error("이미 진행 중인 디비전입니다");
      mockAuthFetcher.post = vi.fn().mockRejectedValue(conflictError);

      // Act & Assert
      await expect(progressRepository.openProgressDivision(divisionId)).rejects.toThrow("이미 진행 중인 디비전입니다");
    });

    it("권한 없음 에러를 처리해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      const forbiddenError = new Error("디비전 시작 권한이 없습니다");
      mockAuthFetcher.post = vi.fn().mockRejectedValue(forbiddenError);

      // Act & Assert
      await expect(progressRepository.openProgressDivision(divisionId)).rejects.toThrow("디비전 시작 권한이 없습니다");
    });
  });

  describe("closeProgressDivision", () => {
    it("디비전 진행을 성공적으로 종료해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      mockAuthFetcher.post = vi.fn().mockResolvedValue({
        data: undefined,
      });

      // Act
      await progressRepository.closeProgressDivision(divisionId);

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalledWith(`/divisions/${divisionId}/progress/close`);
    });

    it("이미 종료된 디비전에 대한 요청 시 에러를 처리해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      const conflictError = new Error("이미 종료된 디비전입니다");
      mockAuthFetcher.post = vi.fn().mockRejectedValue(conflictError);

      // Act & Assert
      await expect(progressRepository.closeProgressDivision(divisionId)).rejects.toThrow("이미 종료된 디비전입니다");
    });

    it("진행 중이지 않은 디비전에 대한 요청 시 에러를 처리해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      const badRequestError = new Error("진행 중이지 않은 디비전입니다");
      mockAuthFetcher.post = vi.fn().mockRejectedValue(badRequestError);

      // Act & Assert
      await expect(progressRepository.closeProgressDivision(divisionId)).rejects.toThrow(
        "진행 중이지 않은 디비전입니다"
      );
    });
  });

  describe("resetProgressDivision", () => {
    it("디비전 진행을 성공적으로 리셋해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      mockAuthFetcher.post = vi.fn().mockResolvedValue({
        data: undefined,
      });

      // Act
      await progressRepository.resetProgressDivision(divisionId);

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalledWith(`/divisions/${divisionId}/progress/reset`);
    });

    it("진행 중인 디비전에 대한 리셋 요청 시 에러를 처리해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      const conflictError = new Error("진행 중인 디비전은 리셋할 수 없습니다");
      mockAuthFetcher.post = vi.fn().mockRejectedValue(conflictError);

      // Act & Assert
      await expect(progressRepository.resetProgressDivision(divisionId)).rejects.toThrow(
        "진행 중인 디비전은 리셋할 수 없습니다"
      );
    });

    it("권한 없음 에러를 처리해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      const forbiddenError = new Error("디비전 리셋 권한이 없습니다");
      mockAuthFetcher.post = vi.fn().mockRejectedValue(forbiddenError);

      // Act & Assert
      await expect(progressRepository.resetProgressDivision(divisionId)).rejects.toThrow("디비전 리셋 권한이 없습니다");
    });
  });

  describe("setCurrentRunner", () => {
    it("현재 주자를 성공적으로 설정해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      const participantId = "participant-1";
      mockAuthFetcher.patch = vi.fn().mockResolvedValue({
        data: undefined,
      });

      // Act
      await progressRepository.setCurrentRunner(divisionId, participantId);

      // Assert
      expect(mockAuthFetcher.patch).toHaveBeenCalledWith(`/divisions/${divisionId}/progress/runner`, {
        body: { participantId },
      });
    });

    it("존재하지 않는 참가자에 대한 요청 시 에러를 처리해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      const participantId = "non-existent-participant";
      const notFoundError = new Error("참가자를 찾을 수 없습니다");
      mockAuthFetcher.patch = vi.fn().mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(progressRepository.setCurrentRunner(divisionId, participantId)).rejects.toThrow(
        "참가자를 찾을 수 없습니다"
      );
    });

    it("권한 없음 에러를 처리해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      const participantId = "participant-1";
      const forbiddenError = new Error("주자 설정 권한이 없습니다");
      mockAuthFetcher.patch = vi.fn().mockRejectedValue(forbiddenError);

      // Act & Assert
      await expect(progressRepository.setCurrentRunner(divisionId, participantId)).rejects.toThrow(
        "주자 설정 권한이 없습니다"
      );
    });
  });

  describe("postponeCurrentRunner", () => {
    it("현재 주자를 성공적으로 연기해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      mockAuthFetcher.post = vi.fn().mockResolvedValue({
        data: undefined,
      });

      // Act
      await progressRepository.postponeCurrentRunner(divisionId);

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalledWith(`/divisions/${divisionId}/progress/runner/postpone`);
    });

    it("현재 주자가 없는 경우 에러를 처리해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      const badRequestError = new Error("현재 주자가 설정되지 않았습니다");
      mockAuthFetcher.post = vi.fn().mockRejectedValue(badRequestError);

      // Act & Assert
      await expect(progressRepository.postponeCurrentRunner(divisionId)).rejects.toThrow(
        "현재 주자가 설정되지 않았습니다"
      );
    });

    it("권한 없음 에러를 처리해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      const forbiddenError = new Error("주자 연기 권한이 없습니다");
      mockAuthFetcher.post = vi.fn().mockRejectedValue(forbiddenError);

      // Act & Assert
      await expect(progressRepository.postponeCurrentRunner(divisionId)).rejects.toThrow("주자 연기 권한이 없습니다");
    });
  });

  describe("getOrder", () => {
    it("디비전의 주자 순서를 성공적으로 가져와야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      const order = ["participant-1", "participant-2", "participant-3"];
      mockFetcher.get = vi.fn().mockResolvedValue({
        data: order,
      });

      // Act
      const result = await progressRepository.getOrder(divisionId);

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith(`/divisions/${divisionId}/progress/order`);
      expect(result).toEqual(order);
    });

    it("빈 주자 순서를 반환할 수 있어야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      mockFetcher.get = vi.fn().mockResolvedValue({
        data: null,
      });

      // Act
      const result = await progressRepository.getOrder(divisionId);

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith(`/divisions/${divisionId}/progress/order`);
      expect(result).toEqual([]);
    });

    it("네트워크 에러 시 에러를 처리해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      const networkError = new Error("주자 순서 조회 실패");
      mockFetcher.get = vi.fn().mockRejectedValue(networkError);

      // Act & Assert
      await expect(progressRepository.getOrder(divisionId)).rejects.toThrow("주자 순서 조회 실패");
    });
  });

  describe("changeOrder", () => {
    it("주자 순서를 성공적으로 변경해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      const participantId = "participant-1";
      const order = 2;
      mockAuthFetcher.patch = vi.fn().mockResolvedValue({
        data: undefined,
      });

      // Act
      await progressRepository.changeOrder(divisionId, participantId, order);

      // Assert
      expect(mockAuthFetcher.patch).toHaveBeenCalledWith(`/divisions/${divisionId}/progress/order`, {
        body: { participantId, order: String(order) },
      });
    });

    it("유효하지 않은 순서로 변경 시 에러를 처리해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      const participantId = "participant-1";
      const order = -1;
      const validationError = new Error("유효하지 않은 순서입니다");
      mockAuthFetcher.patch = vi.fn().mockRejectedValue(validationError);

      // Act & Assert
      await expect(progressRepository.changeOrder(divisionId, participantId, order)).rejects.toThrow(
        "유효하지 않은 순서입니다"
      );
    });

    it("존재하지 않는 참가자에 대한 요청 시 에러를 처리해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      const participantId = "non-existent-participant";
      const order = 1;
      const notFoundError = new Error("참가자를 찾을 수 없습니다");
      mockAuthFetcher.patch = vi.fn().mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(progressRepository.changeOrder(divisionId, participantId, order)).rejects.toThrow(
        "참가자를 찾을 수 없습니다"
      );
    });

    it("권한 없음 에러를 처리해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      const participantId = "participant-1";
      const order = 1;
      const forbiddenError = new Error("순서 변경 권한이 없습니다");
      mockAuthFetcher.patch = vi.fn().mockRejectedValue(forbiddenError);

      // Act & Assert
      await expect(progressRepository.changeOrder(divisionId, participantId, order)).rejects.toThrow(
        "순서 변경 권한이 없습니다"
      );
    });
  });

  describe("Fetcher 사용 구분", () => {
    it("조회 메서드는 fetcher를 사용해야 한다", async () => {
      // Arrange & Act
      mockFetcher.get = vi.fn().mockResolvedValue({ data: mockProgressDto });
      await progressRepository.getProgress("division-1");

      mockFetcher.get = vi.fn().mockResolvedValue({ data: ["participant-1"] });
      await progressRepository.getOrder("division-1");

      // Assert
      expect(mockFetcher.get).toHaveBeenCalled();
      expect(mockAuthFetcher.get).not.toHaveBeenCalled();
    });

    it("인증이 필요한 메서드는 authFetcher를 사용해야 한다", async () => {
      // Arrange & Act
      mockAuthFetcher.post = vi.fn().mockResolvedValue({ data: undefined });
      await progressRepository.openProgressDivision("division-1");

      mockAuthFetcher.post = vi.fn().mockResolvedValue({ data: undefined });
      await progressRepository.closeProgressDivision("division-1");

      mockAuthFetcher.post = vi.fn().mockResolvedValue({ data: undefined });
      await progressRepository.resetProgressDivision("division-1");

      mockAuthFetcher.patch = vi.fn().mockResolvedValue({ data: undefined });
      await progressRepository.setCurrentRunner("division-1", "participant-1");

      mockAuthFetcher.post = vi.fn().mockResolvedValue({ data: undefined });
      await progressRepository.postponeCurrentRunner("division-1");

      mockAuthFetcher.patch = vi.fn().mockResolvedValue({ data: undefined });
      await progressRepository.changeOrder("division-1", "participant-1", 1);

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalled();
      expect(mockAuthFetcher.patch).toHaveBeenCalled();
    });
  });

  describe("메서드 반환값 검증", () => {
    it("void 메서드들은 undefined를 반환해야 한다", async () => {
      // Arrange & Act
      mockAuthFetcher.post = vi.fn().mockResolvedValue({ data: undefined });
      const openResult = await progressRepository.openProgressDivision("division-1");

      mockAuthFetcher.post = vi.fn().mockResolvedValue({ data: undefined });
      const closeResult = await progressRepository.closeProgressDivision("division-1");

      mockAuthFetcher.post = vi.fn().mockResolvedValue({ data: undefined });
      const resetResult = await progressRepository.resetProgressDivision("division-1");

      mockAuthFetcher.patch = vi.fn().mockResolvedValue({ data: undefined });
      const setRunnerResult = await progressRepository.setCurrentRunner("division-1", "participant-1");

      mockAuthFetcher.post = vi.fn().mockResolvedValue({ data: undefined });
      const postponeResult = await progressRepository.postponeCurrentRunner("division-1");

      mockAuthFetcher.patch = vi.fn().mockResolvedValue({ data: undefined });
      const changeOrderResult = await progressRepository.changeOrder("division-1", "participant-1", 1);

      // Assert
      expect(openResult).toBeUndefined();
      expect(closeResult).toBeUndefined();
      expect(resetResult).toBeUndefined();
      expect(setRunnerResult).toBeUndefined();
      expect(postponeResult).toBeUndefined();
      expect(changeOrderResult).toBeUndefined();
    });
  });
});
