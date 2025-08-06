import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Fetcher } from "@/shared/api";
import { parseParticipantDto } from "../../lib/parse-dto";
import type { Participant } from "../../model/types";
import { ParticipantFetcherRepository } from "../repository";
import type { ParticipantDto } from "../types";

// parseParticipantDto 함수 모킹
vi.mock("../../lib/parse-dto", () => ({
  parseParticipantDto: vi.fn(),
}));

describe("ParticipantFetcherRepository", () => {
  let mockFetcher: Fetcher;
  let mockAuthFetcher: Fetcher;
  let participantRepository: ParticipantFetcherRepository;

  const mockParticipantDto: ParticipantDto = {
    id: "participant-1",
    divisionId: "division-1",
    name: "Test Participant",
    teamName: "Test Team",
    robotName: "Test Robot",
    comment: "Test Comment",
    orderRaw: 1,
    createdAt: "2024-01-01T00:00:00Z",
  };

  const mockParticipant: Participant = {
    id: "participant-1",
    divisionId: "division-1",
    name: "Test Participant",
    teamName: "Test Team",
    robotName: "Test Robot",
    comment: "Test Comment",
    orderRaw: 1,
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

    participantRepository = new ParticipantFetcherRepository(mockFetcher, mockAuthFetcher);

    // parseParticipantDto 모킹 설정
    vi.mocked(parseParticipantDto).mockReturnValue(mockParticipant);
  });

  describe("getAllParticipants", () => {
    it("특정 디비전의 모든 참가자 목록을 성공적으로 가져와야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      const participants: ParticipantDto[] = [
        mockParticipantDto,
        {
          id: "participant-2",
          divisionId: "division-1",
          name: "Another Participant",
          teamName: "Another Team",
          robotName: "Another Robot",
          comment: "Another Comment",
          orderRaw: 2,
          createdAt: "2024-01-02T00:00:00Z",
        },
      ];

      mockFetcher.get = vi.fn().mockResolvedValue({
        data: participants,
      });

      // Act
      const result = await participantRepository.getAllParticipants(divisionId);

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith(`/divisions/${divisionId}/participants`);
      expect(parseParticipantDto).toHaveBeenCalledTimes(2);
      expect(parseParticipantDto).toHaveBeenCalledWith(participants[0]);
      expect(parseParticipantDto).toHaveBeenCalledWith(participants[1]);
      expect(result).toEqual([mockParticipant, mockParticipant]);
    });

    it("빈 참가자 목록을 반환할 수 있어야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      mockFetcher.get = vi.fn().mockResolvedValue({
        data: [],
      });

      // Act
      const result = await participantRepository.getAllParticipants(divisionId);

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith(`/divisions/${divisionId}/participants`);
      expect(parseParticipantDto).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("네트워크 에러 시 에러를 처리해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      const networkError = new Error("네트워크 연결 실패");
      mockFetcher.get = vi.fn().mockRejectedValue(networkError);

      // Act & Assert
      await expect(participantRepository.getAllParticipants(divisionId)).rejects.toThrow("네트워크 연결 실패");
      expect(mockFetcher.get).toHaveBeenCalledWith(`/divisions/${divisionId}/participants`);
    });
  });

  describe("createParticipant", () => {
    it("새 참가자를 성공적으로 생성해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      const newParticipant: Omit<Participant, "id" | "createdAt"> = {
        name: "New Participant",
        divisionId: divisionId,
        teamName: "New Team",
        robotName: "New Robot",
        comment: "New Comment",
        orderRaw: 3,
      };

      mockAuthFetcher.post = vi.fn().mockResolvedValue({
        data: mockParticipantDto,
      });

      // Act
      const result = await participantRepository.createParticipant(divisionId, newParticipant);

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalledWith(`/divisions/${divisionId}/participants`, {
        body: {
          name: newParticipant.name,
          teamName: newParticipant.teamName,
          robotName: newParticipant.robotName,
          comment: newParticipant.comment,
          orderRaw: newParticipant.orderRaw,
        },
      });
      expect(parseParticipantDto).toHaveBeenCalledWith(mockParticipantDto);
      expect(result).toEqual(mockParticipant);
    });

    it("인증 실패 시 에러를 처리해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      const newParticipant: Omit<Participant, "id" | "createdAt"> = {
        name: "New Participant",
        divisionId: divisionId,
        teamName: "New Team",
        robotName: "New Robot",
        comment: "New Comment",
        orderRaw: 3,
      };
      const authError = new Error("인증 실패");
      mockAuthFetcher.post = vi.fn().mockRejectedValue(authError);

      // Act & Assert
      await expect(participantRepository.createParticipant(divisionId, newParticipant)).rejects.toThrow("인증 실패");
    });

    it("유효하지 않은 데이터로 생성 시 에러를 처리해야 한다", async () => {
      // Arrange
      const divisionId = "division-1";
      const invalidParticipant = {
        name: "", // 빈 이름
        divisionId: divisionId,
        teamName: "Team",
        robotName: "Robot",
        comment: "Comment",
        orderRaw: -1, // 잘못된 순서
        givenTime: 0,
      } as Omit<Participant, "id" | "createdAt">;

      const validationError = new Error("유효하지 않은 데이터입니다");
      mockAuthFetcher.post = vi.fn().mockRejectedValue(validationError);

      // Act & Assert
      await expect(participantRepository.createParticipant(divisionId, invalidParticipant)).rejects.toThrow(
        "유효하지 않은 데이터입니다"
      );
    });
  });

  describe("updateParticipant", () => {
    it("참가자 정보를 성공적으로 업데이트해야 한다", async () => {
      // Arrange
      const participantId = "participant-1";
      const updatedParticipant: Participant = {
        ...mockParticipant,
        name: "Updated Participant",
        teamName: "Updated Team",
      };

      const updatedParticipantDto: ParticipantDto = {
        ...mockParticipantDto,
        name: "Updated Participant",
        teamName: "Updated Team",
      };

      mockAuthFetcher.patch = vi.fn().mockResolvedValue({
        data: updatedParticipantDto,
      });

      vi.mocked(parseParticipantDto).mockReturnValue(updatedParticipant);

      // Act
      const result = await participantRepository.updateParticipant(participantId, updatedParticipant);

      // Assert
      expect(mockAuthFetcher.patch).toHaveBeenCalledWith(`/participants/${participantId}`, {
        body: {
          name: updatedParticipant.name,
          teamName: updatedParticipant.teamName,
          robotName: updatedParticipant.robotName,
          comment: updatedParticipant.comment,
          orderRaw: updatedParticipant.orderRaw,
        },
      });
      expect(parseParticipantDto).toHaveBeenCalledWith(updatedParticipantDto);
      expect(result).toEqual(updatedParticipant);
    });

    it("존재하지 않는 참가자 업데이트 시 null을 반환해야 한다", async () => {
      // Arrange
      const participantId = "non-existent-participant";
      const participant: Participant = mockParticipant;

      mockAuthFetcher.patch = vi.fn().mockResolvedValue({
        data: null,
      });

      // Act
      const result = await participantRepository.updateParticipant(participantId, participant);

      // Assert
      expect(mockAuthFetcher.patch).toHaveBeenCalledWith(`/participants/${participantId}`, {
        body: {
          name: participant.name,
          teamName: participant.teamName,
          robotName: participant.robotName,
          comment: participant.comment,
          orderRaw: participant.orderRaw,
        },
      });
      expect(parseParticipantDto).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("권한 없음 에러를 처리해야 한다", async () => {
      // Arrange
      const participantId = "participant-1";
      const participant: Participant = mockParticipant;
      const forbiddenError = new Error("권한이 없습니다");
      mockAuthFetcher.patch = vi.fn().mockRejectedValue(forbiddenError);

      // Act & Assert
      await expect(participantRepository.updateParticipant(participantId, participant)).rejects.toThrow(
        "권한이 없습니다"
      );
    });
  });

  describe("deleteParticipant", () => {
    it("참가자를 성공적으로 삭제해야 한다", async () => {
      // Arrange
      const participantId = "participant-1";
      mockAuthFetcher.delete = vi.fn().mockResolvedValue({
        data: undefined,
      });

      // Act
      await participantRepository.deleteParticipant(participantId);

      // Assert
      expect(mockAuthFetcher.delete).toHaveBeenCalledWith(`/participants/${participantId}`);
    });

    it("존재하지 않는 참가자 삭제 시 에러를 처리해야 한다", async () => {
      // Arrange
      const participantId = "non-existent-participant";
      const notFoundError = new Error("참가자를 찾을 수 없습니다");
      mockAuthFetcher.delete = vi.fn().mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(participantRepository.deleteParticipant(participantId)).rejects.toThrow("참가자를 찾을 수 없습니다");
      expect(mockAuthFetcher.delete).toHaveBeenCalledWith(`/participants/${participantId}`);
    });

    it("권한 없음 에러를 처리해야 한다", async () => {
      // Arrange
      const participantId = "participant-1";
      const forbiddenError = new Error("삭제 권한이 없습니다");
      mockAuthFetcher.delete = vi.fn().mockRejectedValue(forbiddenError);

      // Act & Assert
      await expect(participantRepository.deleteParticipant(participantId)).rejects.toThrow("삭제 권한이 없습니다");
    });
  });

  describe("Fetcher 사용 구분", () => {
    it("조회 메서드는 fetcher를 사용해야 한다", async () => {
      // Arrange & Act
      mockFetcher.get = vi.fn().mockResolvedValue({ data: [] });
      await participantRepository.getAllParticipants("division-1");

      // Assert
      expect(mockFetcher.get).toHaveBeenCalled();
      expect(mockAuthFetcher.get).not.toHaveBeenCalled();
    });

    it("인증이 필요한 메서드는 authFetcher를 사용해야 한다", async () => {
      // Arrange & Act
      const newParticipant: Omit<Participant, "id" | "createdAt"> = {
        name: "Test",
        divisionId: "division-1",
        teamName: "Test Team",
        robotName: "Test Robot",
        comment: "Test Comment",
        orderRaw: 1,
      };

      mockAuthFetcher.post = vi.fn().mockResolvedValue({ data: mockParticipantDto });
      await participantRepository.createParticipant("division-1", newParticipant);

      mockAuthFetcher.patch = vi.fn().mockResolvedValue({ data: mockParticipantDto });
      await participantRepository.updateParticipant("participant-1", mockParticipant);

      mockAuthFetcher.delete = vi.fn().mockResolvedValue({ data: undefined });
      await participantRepository.deleteParticipant("participant-1");

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalled();
      expect(mockAuthFetcher.patch).toHaveBeenCalled();
      expect(mockAuthFetcher.delete).toHaveBeenCalled();
    });
  });
});
