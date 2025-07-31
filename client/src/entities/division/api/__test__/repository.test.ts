import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Fetcher, ApiResponse } from "@/shared/api/fetcher";
import type { DivisionDto } from "../types";
import type { Division } from "../../model/types";
import { DivisionFetcherRepository } from "../repository";

describe("DivisionFetcherRepository", () => {
  let mockFetcher: Fetcher;
  let mockAuthFetcher: Fetcher;
  let repository: DivisionFetcherRepository;

  const mockDivisionDto: DivisionDto = {
    id: "division-1",
    competitionId: "competition-1",
    name: "Test Division",
    description: "Test Description",
    createdAt: "2024-01-01T00:00:00.000Z",
    status: "ready",
    timeLimit: 3600,
  };

  const mockDivision: Division = {
    id: "division-1",
    competitionId: "competition-1",
    name: "Test Division",
    description: "Test Description",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    status: "ready",
    timeLimit: 3600,
  };

  beforeEach(() => {
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

    repository = new DivisionFetcherRepository(mockFetcher, mockAuthFetcher);
  });

  describe("getAllDivisions", () => {
    it("should get all divisions successfully", async () => {
      // Arrange
      const competitionId = "competition-1";
      const mockResponse: ApiResponse<DivisionDto[]> = {
        data: [mockDivisionDto],
        status: 200,
        headers: {},
      };
      vi.mocked(mockFetcher.get).mockResolvedValue(mockResponse);

      // Act
      const result = await repository.getAllDivisions(competitionId);

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith(`/competitions/${competitionId}/divisions`);
      expect(result).toEqual([mockDivision]);
    });

    it("should return empty array when no divisions exist", async () => {
      // Arrange
      const competitionId = "competition-1";
      const mockResponse: ApiResponse<DivisionDto[]> = {
        data: [],
        status: 200,
        headers: {},
      };
      vi.mocked(mockFetcher.get).mockResolvedValue(mockResponse);

      // Act
      const result = await repository.getAllDivisions(competitionId);

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith(`/competitions/${competitionId}/divisions`);
      expect(result).toEqual([]);
    });

    it("should get multiple divisions successfully", async () => {
      // Arrange
      const competitionId = "competition-1";
      const secondDivisionDto: DivisionDto = {
        id: "division-2",
        competitionId: "competition-1",
        name: "Second Division",
        description: "Second Description",
        createdAt: "2024-01-02T00:00:00.000Z",
        status: "ongoing",
        timeLimit: 7200,
      };
      const mockResponse: ApiResponse<DivisionDto[]> = {
        data: [mockDivisionDto, secondDivisionDto],
        status: 200,
        headers: {},
      };
      vi.mocked(mockFetcher.get).mockResolvedValue(mockResponse);

      // Act
      const result = await repository.getAllDivisions(competitionId);

      // Assert
      expect(mockFetcher.get).toHaveBeenCalledWith(`/competitions/${competitionId}/divisions`);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockDivision);
      expect(result[1]).toEqual({
        id: "division-2",
        competitionId: "competition-1",
        name: "Second Division",
        description: "Second Description",
        createdAt: new Date("2024-01-02T00:00:00.000Z"),
        status: "ongoing",
        timeLimit: 7200,
      });
    });
  });

  describe("getDivisionById", () => {
    it("should get division by ID successfully", async () => {
      // Arrange
      const divisionId = "division-1";
      const mockResponse: ApiResponse<DivisionDto> = {
        data: mockDivisionDto,
        status: 200,
        headers: {},
      };
      vi.mocked(mockAuthFetcher.get).mockResolvedValue(mockResponse);

      // Act
      const result = await repository.getDivisionById(divisionId);

      // Assert
      expect(mockAuthFetcher.get).toHaveBeenCalledWith(`/divisions/${divisionId}`);
      expect(result).toEqual(mockDivision);
    });

    it("should return null when division does not exist", async () => {
      // Arrange
      const divisionId = "non-existent";
      const mockResponse: ApiResponse<null> = {
        data: null,
        status: 404,
        headers: {},
      };
      vi.mocked(mockAuthFetcher.get).mockResolvedValue(mockResponse);

      // Act
      const result = await repository.getDivisionById(divisionId);

      // Assert
      expect(mockAuthFetcher.get).toHaveBeenCalledWith(`/divisions/${divisionId}`);
      expect(result).toBeNull();
    });
  });

  describe("createDivision", () => {
    it("should create new division successfully", async () => {
      // Arrange
      const competitionId = "competition-1";
      const newDivision = {
        competitionId: "competition-1",
        name: "New Division",
        description: "New Description",
        status: "ready" as const,
        timeLimit: 1800,
      };
      const mockCreatedDto: DivisionDto = {
        id: "new-division-id",
        competitionId: "competition-1",
        name: "New Division",
        description: "New Description",
        createdAt: "2024-01-01T00:00:00.000Z",
        status: "ready",
        timeLimit: 1800,
      };
      const mockResponse: ApiResponse<DivisionDto> = {
        data: mockCreatedDto,
        status: 201,
        headers: {},
      };
      vi.mocked(mockAuthFetcher.post).mockResolvedValue(mockResponse);

      // Act
      const result = await repository.createDivision(newDivision);

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalledWith(`/competitions/${competitionId}/divisions`, {
        body: newDivision,
      });
      expect(result).toEqual({
        id: "new-division-id",
        competitionId: "competition-1",
        name: "New Division",
        description: "New Description",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        status: "ready",
        timeLimit: 1800,
      });
    });
  });

  describe("updateDivision", () => {
    it("should update division successfully", async () => {
      // Arrange
      const divisionId = "division-1";
      const updatedDivision: Division = {
        id: "division-1",
        competitionId: "competition-1",
        name: "Updated Division",
        description: "Updated Description",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        status: "ongoing",
        timeLimit: 5400,
      };
      const mockUpdatedDto: DivisionDto = {
        id: "division-1",
        competitionId: "competition-1",
        name: "Updated Division",
        description: "Updated Description",
        createdAt: "2024-01-01T00:00:00.000Z",
        status: "ongoing",
        timeLimit: 5400,
      };
      const mockResponse: ApiResponse<DivisionDto> = {
        data: mockUpdatedDto,
        status: 200,
        headers: {},
      };
      vi.mocked(mockAuthFetcher.patch).mockResolvedValue(mockResponse);

      // Act
      const result = await repository.updateDivision(updatedDivision);

      // Assert
      expect(mockAuthFetcher.patch).toHaveBeenCalledWith(`/divisions/${divisionId}`, {
        body: updatedDivision,
      });
      expect(result).toEqual(updatedDivision);
    });

    it("should return null when division update fails", async () => {
      // Arrange
      const divisionId = "division-1";
      const updatedDivision: Division = {
        id: "division-1",
        competitionId: "competition-1",
        name: "Updated Division",
        description: "Updated Description",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        status: "ongoing",
        timeLimit: 5400,
      };
      const mockResponse: ApiResponse<null> = {
        data: null,
        status: 404,
        headers: {},
      };
      vi.mocked(mockAuthFetcher.patch).mockResolvedValue(mockResponse);

      // Act
      const result = await repository.updateDivision(updatedDivision);

      // Assert
      expect(mockAuthFetcher.patch).toHaveBeenCalledWith(`/divisions/${divisionId}`, {
        body: updatedDivision,
      });
      expect(result).toBeNull();
    });
  });

  describe("deleteDivision", () => {
    it("should delete division successfully", async () => {
      // Arrange
      const divisionId = "division-1";
      const mockResponse: ApiResponse<void> = {
        data: undefined,
        status: 204,
        headers: {},
      };
      vi.mocked(mockAuthFetcher.delete).mockResolvedValue(mockResponse);

      // Act
      await repository.deleteDivision(divisionId);

      // Assert
      expect(mockAuthFetcher.delete).toHaveBeenCalledWith(`/divisions/${divisionId}`);
    });
  });

  describe("constructor", () => {
    it("should inject fetcher and authFetcher correctly", () => {
      // Arrange & Act
      const newRepository = new DivisionFetcherRepository(mockFetcher, mockAuthFetcher);

      // Assert
      expect(newRepository).toBeInstanceOf(DivisionFetcherRepository);
    });
  });
});
