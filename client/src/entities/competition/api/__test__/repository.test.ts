import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Fetcher, ApiResponse } from "@/shared/api";
import { parseCompetitionDto, parseCompetitionForm } from "../../lib/parse-dto";
import type { Competition } from "../../model/types";
import { CompetitionFetcherRepository } from "../repository";
import type { CompetitionDto } from "../types";

// parseCompetitionDto와 parseCompetitionForm 함수 모킹
vi.mock("../../lib/parse-dto", () => ({
  parseCompetitionDto: vi.fn(),
  parseCompetitionForm: vi.fn(),
}));

describe("CompetitionFetcherRepository", () => {
  let mockFetcher: Fetcher;
  let mockAuthFetcher: Fetcher;
  let repository: CompetitionFetcherRepository;

  const mockCompetitionDto: CompetitionDto = {
    id: "competition-1",
    name: "Test Competition",
    description: "Test Description",
    createdAt: "2024-01-01T00:00:00.000Z",
  };

  const mockCompetition: Competition = {
    id: "competition-1",
    name: "Test Competition",
    description: "Test Description",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    vi.clearAllMocks();

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

    repository = new CompetitionFetcherRepository(mockFetcher, mockAuthFetcher);

    // parseCompetitionDto mock 설정
    vi.mocked(parseCompetitionDto).mockImplementation((dto) => ({
      id: dto.id,
      name: dto.name,
      description: dto.description,
      createdAt: new Date(dto.createdAt),
    }));

    // parseCompetitionForm mock 설정
    vi.mocked(parseCompetitionForm).mockImplementation((form) => ({
      name: form.name,
      description: form.description,
    }));
  });

  describe("getAllCompetitions", () => {
    it("should get all competitions successfully", async () => {
      // Arrange
      const mockResponse: ApiResponse<CompetitionDto[]> = {
        data: [mockCompetitionDto],
        status: 200,
        headers: {},
      };
      vi.mocked(mockFetcher.get).mockResolvedValue(mockResponse);

      // Act
      const result = await repository.getAllCompetitions();

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith("/competitions");
      expect(result).toEqual([mockCompetition]);
    });

    it("should return empty array", async () => {
      // Arrange
      const mockResponse: ApiResponse<CompetitionDto[]> = {
        data: [],
        status: 200,
        headers: {},
      };
      vi.mocked(mockFetcher.get).mockResolvedValue(mockResponse);

      // Act
      const result = await repository.getAllCompetitions();

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith("/competitions");
      expect(result).toEqual([]);
    });

    it("should get multiple competitions successfully", async () => {
      // Arrange
      const mockCompetitions: CompetitionDto[] = [
        mockCompetitionDto,
        {
          id: "competition-2",
          name: "Second Competition",
          description: "Second Description",
          createdAt: "2024-01-02T00:00:00.000Z",
        },
      ];
      const mockResponse: ApiResponse<CompetitionDto[]> = {
        data: mockCompetitions,
        status: 200,
        headers: {},
      };
      vi.mocked(mockFetcher.get).mockResolvedValue(mockResponse);

      // Act
      const result = await repository.getAllCompetitions();

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith("/competitions");
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockCompetition);
      expect(result[1]).toEqual({
        id: "competition-2",
        name: "Second Competition",
        description: "Second Description",
        createdAt: new Date("2024-01-02T00:00:00.000Z"),
      });
    });
  });

  describe("getCompetitionById", () => {
    it("should get competition by ID successfully", async () => {
      // Arrange
      const competitionId = "competition-1";
      const mockResponse: ApiResponse<CompetitionDto> = {
        data: mockCompetitionDto,
        status: 200,
        headers: {},
      };
      vi.mocked(mockFetcher.get).mockResolvedValue(mockResponse);

      // Act
      const result = await repository.getCompetitionById(competitionId);

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith(`/competitions/${competitionId}`);
      expect(result).toEqual(mockCompetition);
    });

    it("should return null when competition does not exist", async () => {
      // Arrange
      const competitionId = "non-existent";
      const mockResponse: ApiResponse<null> = {
        data: null,
        status: 404,
        headers: {},
      };
      vi.mocked(mockFetcher.get).mockResolvedValue(mockResponse);

      // Act
      const result = await repository.getCompetitionById(competitionId);

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith(`/competitions/${competitionId}`);
      expect(result).toBeNull();
    });
  });

  describe("createCompetition", () => {
    it("should create new competition successfully", async () => {
      // Arrange
      const newCompetition = {
        name: "New Competition",
        description: "New Description",
      };
      const mockCreatedDto: CompetitionDto = {
        id: "new-competition-id",
        name: "New Competition",
        description: "New Description",
        createdAt: "2024-01-01T00:00:00.000Z",
      };
      const mockResponse: ApiResponse<CompetitionDto> = {
        data: mockCreatedDto,
        status: 201,
        headers: {},
      };
      vi.mocked(mockAuthFetcher.post).mockResolvedValue(mockResponse);

      // Act
      const result = await repository.createCompetition(newCompetition);

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalledWith("/competitions", {
        body: {
          name: "New Competition",
          description: "New Description",
        },
      });
      expect(result).toEqual({
        id: "new-competition-id",
        name: "New Competition",
        description: "New Description",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
      });
    });
  });

  describe("updateCompetition", () => {
    it("should update competition successfully", async () => {
      // Arrange
      const updatedCompetition: Competition = {
        id: "competition-1",
        name: "Updated Competition",
        description: "Updated Description",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
      };
      const mockUpdatedDto: CompetitionDto = {
        id: "competition-1",
        name: "Updated Competition",
        description: "Updated Description",
        createdAt: "2024-01-01T00:00:00.000Z",
      };
      const mockResponse: ApiResponse<CompetitionDto> = {
        data: mockUpdatedDto,
        status: 200,
        headers: {},
      };
      vi.mocked(mockAuthFetcher.patch).mockResolvedValue(mockResponse);

      // Act
      const result = await repository.updateCompetition(updatedCompetition);

      // Assert
      expect(mockAuthFetcher.patch).toHaveBeenCalledWith("/competitions/competition-1", {
        body: {
          name: "Updated Competition",
          description: "Updated Description",
        },
      });
      expect(result).toEqual(updatedCompetition);
    });
  });

  describe("deleteCompetition", () => {
    it("should delete competition successfully", async () => {
      // Arrange
      const competitionId = "competition-1";
      const mockResponse: ApiResponse<void> = {
        data: undefined,
        status: 204,
        headers: {},
      };
      vi.mocked(mockAuthFetcher.delete).mockResolvedValue(mockResponse);

      // Act
      await repository.deleteCompetition(competitionId);

      // Assert
      expect(mockAuthFetcher.delete).toHaveBeenCalledWith(`/competitions/${competitionId}`);
    });
  });

  describe("constructor", () => {
    it("should inject fetcher and authFetcher correctly", () => {
      // Arrange & Act
      const newRepository = new CompetitionFetcherRepository(mockFetcher, mockAuthFetcher);

      // Assert
      expect(newRepository).toBeInstanceOf(CompetitionFetcherRepository);
    });
  });
});
