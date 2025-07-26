import type { Fetcher } from "@/shared";
import type { Competition } from "../model/types";
import type { CompetitionDto, CompetitionRepository } from "./types";
import { parseCompetitionDto } from "../lib/parse-dto";

export class CompetitionFetcherRepository implements CompetitionRepository {
  private fetcher: Fetcher;
  private authFetcher: Fetcher;

  constructor(fetcher: Fetcher, authFetcher: Fetcher) {
    this.fetcher = fetcher;
    this.authFetcher = authFetcher;
  }

  async getAllCompetitions(): Promise<Competition[]> {
    const response = await this.fetcher.get<CompetitionDto[]>("/competitions");

    return response.data.map((competition) => parseCompetitionDto(competition));
  }

  async getCompetitionById(competitionId: string): Promise<Competition | null> {
    const response = await this.fetcher.get<CompetitionDto>(`/competitions/${competitionId}`);

    return response.data ? parseCompetitionDto(response.data) : null;
  }

  async createCompetition(competition: Omit<Competition, "id" | "createdAt">): Promise<Competition> {
    const response = await this.authFetcher.post<CompetitionDto>("/competitions", {
      body: {
        name: competition.name,
        description: competition.description,
      } as CompetitionDto,
    });

    return parseCompetitionDto(response.data);
  }

  async updateCompetition(competition: Competition): Promise<Competition> {
    const response = await this.authFetcher.patch<CompetitionDto>(`/competitions/${competition.id}`, {
      body: {
        name: competition.name,
        description: competition.description,
      } as CompetitionDto,
    });

    return parseCompetitionDto(response.data);
  }

  async deleteCompetition(competitionId: string): Promise<void> {
    await this.authFetcher.delete(`/competitions/${competitionId}`);
  }
}
