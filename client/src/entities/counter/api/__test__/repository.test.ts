import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Fetcher, ApiResponse } from "@/shared/api";
import type { CounterState } from "../../model/types";
import { CounterFetcherRepository } from "../repository";
import type { CounterDto } from "../types";

describe("CounterFetcherRepository", () => {
  let mockAuthFetcher: Fetcher;
  let repository: CounterFetcherRepository;

  const mockCounterDto: CounterDto = {
    deviceId: "counter-1",
    name: "Test Counter",
    startedAt: 1640995200000, // 2022-01-01T00:00:00.000Z
    stoppedAt: null,
    divisionId: "division-1",
  };

  const mockCounterState: CounterState = {
    id: "counter-1",
    name: "Test Counter",
    startedAt: 1640995200000,
    stoppedAt: null,
    divisionId: "division-1",
  };

  beforeEach(() => {
    mockAuthFetcher = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
      request: vi.fn(),
    };

    repository = new CounterFetcherRepository(mockAuthFetcher);
  });

  describe("getAll", () => {
    it("should get all counters successfully", async () => {
      // Arrange
      const mockResponse: ApiResponse<CounterDto[]> = {
        data: [mockCounterDto],
        status: 200,
        headers: {},
      };
      vi.mocked(mockAuthFetcher.get).mockResolvedValue(mockResponse);

      // Act
      const result = await repository.getAll();

      // Assert
      expect(mockAuthFetcher.get).toHaveBeenCalledWith("/counters");
      expect(result).toEqual([mockCounterState]);
    });

    it("should return empty array when no counters exist", async () => {
      // Arrange
      const mockResponse: ApiResponse<CounterDto[]> = {
        data: [],
        status: 200,
        headers: {},
      };
      vi.mocked(mockAuthFetcher.get).mockResolvedValue(mockResponse);

      // Act
      const result = await repository.getAll();

      // Assert
      expect(mockAuthFetcher.get).toHaveBeenCalledWith("/counters");
      expect(result).toEqual([]);
    });

    it("should get multiple counters successfully", async () => {
      // Arrange
      const secondCounterDto: CounterDto = {
        deviceId: "counter-2",
        name: "Second Counter",
        startedAt: null,
        stoppedAt: 1640998800000, // 2022-01-01T01:00:00.000Z
        divisionId: null,
      };
      const mockResponse: ApiResponse<CounterDto[]> = {
        data: [mockCounterDto, secondCounterDto],
        status: 200,
        headers: {},
      };
      vi.mocked(mockAuthFetcher.get).mockResolvedValue(mockResponse);

      // Act
      const result = await repository.getAll();

      // Assert
      expect(mockAuthFetcher.get).toHaveBeenCalledWith("/counters");
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockCounterState);
      expect(result[1]).toEqual({
        id: "counter-2",
        name: "Second Counter",
        startedAt: null,
        stoppedAt: 1640998800000,
        divisionId: null,
      });
    });
  });

  describe("getById", () => {
    it("should get counter by ID successfully", async () => {
      // Arrange
      const counterId = "counter-1";
      const mockResponse: ApiResponse<CounterDto> = {
        data: mockCounterDto,
        status: 200,
        headers: {},
      };
      vi.mocked(mockAuthFetcher.get).mockResolvedValue(mockResponse);

      // Act
      const result = await repository.getById(counterId);

      // Assert
      expect(mockAuthFetcher.get).toHaveBeenCalledWith(`/counters/${counterId}`);
      expect(result).toEqual(mockCounterState);
    });

    it("should return null when counter does not exist", async () => {
      // Arrange
      const counterId = "non-existent";
      const mockResponse: ApiResponse<null> = {
        data: null,
        status: 404,
        headers: {},
      };
      vi.mocked(mockAuthFetcher.get).mockResolvedValue(mockResponse);

      // Act
      const result = await repository.getById(counterId);

      // Assert
      expect(mockAuthFetcher.get).toHaveBeenCalledWith(`/counters/${counterId}`);
      expect(result).toBeNull();
    });
  });

  describe("connectDivision", () => {
    it("should connect counter to division successfully", async () => {
      // Arrange
      const counterId = "counter-1";
      const divisionId = "division-1";
      const mockResponse: ApiResponse<void> = {
        data: undefined,
        status: 200,
        headers: {},
      };
      vi.mocked(mockAuthFetcher.patch).mockResolvedValue(mockResponse);

      // Act
      await repository.connectDivision(counterId, divisionId);

      // Assert
      expect(mockAuthFetcher.patch).toHaveBeenCalledWith(`/counters/${counterId}/division`, {
        body: { divisionId },
      });
    });
  });

  describe("disconnectDivision", () => {
    it("should disconnect counter from division successfully", async () => {
      // Arrange
      const counterId = "counter-1";
      const mockResponse: ApiResponse<void> = {
        data: undefined,
        status: 200,
        headers: {},
      };
      vi.mocked(mockAuthFetcher.delete).mockResolvedValue(mockResponse);

      // Act
      await repository.disconnectDivision(counterId);

      // Assert
      expect(mockAuthFetcher.delete).toHaveBeenCalledWith(`/counters/${counterId}/division`);
    });
  });

  describe("reset", () => {
    it("should reset counter successfully", async () => {
      // Arrange
      const counterId = "counter-1";
      const mockResponse: ApiResponse<void> = {
        data: undefined,
        status: 200,
        headers: {},
      };
      vi.mocked(mockAuthFetcher.post).mockResolvedValue(mockResponse);

      // Act
      await repository.reset(counterId);

      // Assert
      expect(mockAuthFetcher.post).toHaveBeenCalledWith(`/counters/${counterId}/reset`);
    });
  });

  describe("disconnectCounter", () => {
    it("should disconnect counter successfully", async () => {
      // Arrange
      const counterId = "counter-1";
      const mockResponse: ApiResponse<void> = {
        data: undefined,
        status: 200,
        headers: {},
      };
      vi.mocked(mockAuthFetcher.delete).mockResolvedValue(mockResponse);

      // Act
      await repository.disconnectCounter(counterId);

      // Assert
      expect(mockAuthFetcher.delete).toHaveBeenCalledWith(`/counters/${counterId}`);
    });
  });

  describe("constructor", () => {
    it("should inject authFetcher correctly", () => {
      // Arrange & Act
      const newRepository = new CounterFetcherRepository(mockAuthFetcher);

      // Assert
      expect(newRepository).toBeInstanceOf(CounterFetcherRepository);
    });
  });
});
