import type { Competition } from "../model/types";

export interface CompetitionDto {
  id: string;
  name: string;
  description: string;
  createdAt: string; // ISO 문자열
}

export interface CompetitionRepository {
  // Implement methods when api is ready
  getCompetitions(): Promise<Competition[]>;
}
