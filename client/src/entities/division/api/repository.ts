import type { Fetcher } from "@/shared";
import type { DivisionDto, DivisionRepository } from "./types";
import { parseDivisionDto } from "../lib/parse-dto";
import type { Division, DivisionStatus } from "../model/types";

export class DivisionFetcherRepository implements DivisionRepository {
  private fetcher: Fetcher;
  private authFetcher: Fetcher;

  constructor(fetcher: Fetcher, authFetcher: Fetcher) {
    this.fetcher = fetcher;
    this.authFetcher = authFetcher;
  }

  async getAllDivisions(competitionId: string): Promise<Division[]> {
    const response = await this.fetcher.get<DivisionDto[]>(`/competitions/${competitionId}/divisions`);
    return response.data.map((division) => parseDivisionDto(division));
  }

  async getDivisionById(divisionId: string): Promise<Division | null> {
    const response = await this.authFetcher.get<DivisionDto>(`/divisions/${divisionId}`);
    return response.data ? parseDivisionDto(response.data) : null;
  }

  async createDivision(competitionId: string, division: Omit<Division, "id" | "createdAt">): Promise<Division> {
    const response = await this.authFetcher.post<DivisionDto>(`/competitions/${competitionId}/divisions`, {
      body: division,
    });
    return parseDivisionDto(response.data);
  }

  async updateDivision(divisionId: string, division: Division): Promise<Division | null> {
    const response = await this.authFetcher.put<DivisionDto>(`/divisions/${divisionId}`, {
      body: division,
    });
    return response.data ? parseDivisionDto(response.data) : null;
  }

  async updateDivisionStatus(divisionId: string, status: DivisionStatus): Promise<Division | null> {
    const response = await this.authFetcher.patch<DivisionDto>(`/divisions/${divisionId}/status`, {
      body: { status },
    });
    return response.data ? parseDivisionDto(response.data) : null;
  }

  async deleteDivision(divisionId: string): Promise<void> {
    await this.authFetcher.delete(`/divisions/${divisionId}`);
  }
}
