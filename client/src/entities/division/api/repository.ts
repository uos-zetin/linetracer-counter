import type { Fetcher } from "@/shared/api";
import { parseDivisionDto, parseDivisionForm } from "../lib/parse-dto";
import type { Division, DivisionForm } from "../model/types";
import type { DivisionDto, DivisionRepository } from "./types";

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
      body: parseDivisionForm(division),
    });
    return parseDivisionDto(response.data);
  }

  async updateDivision(division: Division): Promise<Division | null> {
    const response = await this.authFetcher.patch<DivisionDto>(`/divisions/${division.id}`, {
      body: parseDivisionForm(division),
    });
    return response.data ? parseDivisionDto(response.data) : null;
  }

  async deleteDivision(divisionId: string): Promise<void> {
    await this.authFetcher.delete(`/divisions/${divisionId}`);
  }
}
