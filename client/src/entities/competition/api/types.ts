import type { Competition } from "../model/types";

export interface CompetitionDto {
  id: string;
  name: string;
  description: string;
  createdAt: string; // ISO 문자열
}

export interface CompetitionCreateDto {
  name: string;
  description: string;
}

export interface CompetitionRepository {
  getAllCompetitions(): Promise<Competition[]>;
  getCompetitionById(competitionId: string): Promise<Competition | null>;
  createCompetition(competition: Omit<Competition, "id" | "createdAt">): Promise<Competition>;
  updateCompetition(competition: Competition): Promise<Competition>;
  deleteCompetition(competitionId: string): Promise<void>;
}
