import type { Fetcher } from "@/shared";
import type { DivisionCreateDto, DivisionDto, DivisionRepository } from "./types";
import { parseDivisionDto } from "../lib/parse-dto";
import type { Division, DivisionForm } from "../model/types";

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

  async createDivision(division: DivisionForm): Promise<Division> {
    const response = await this.authFetcher.post<DivisionDto>(`/competitions/${division.competitionId}/divisions`, {
      body: {
        name: division.name,
        description: division.description,
        timeLimit: division.timeLimit,
      } as DivisionCreateDto,
    });
    return parseDivisionDto(response.data);
  }

  async updateDivision(division: Division): Promise<Division | null> {
    const response = await this.authFetcher.patch<DivisionDto>(`/divisions/${division.id}`, {
      body: {
        name: division.name,
        description: division.description,
        timeLimit: division.timeLimit,
      } as DivisionCreateDto,
    });
    return parseDivisionDto(response.data) || null;
  }

  async deleteDivision(divisionId: string): Promise<void> {
    await this.authFetcher.delete(`/divisions/${divisionId}`);
  }
}
