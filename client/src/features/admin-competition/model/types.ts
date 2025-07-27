import type { Competition, CompetitionForm } from "@/entities/competition";

export interface AdminCompetitionService {
  // Data fetching
  getAllCompetitions(): Promise<Competition[]>;
  getCompetitionById(id: string): Promise<Competition | null>;
  
  // CRUD operations
  createCompetition(data: CompetitionForm): Promise<Competition>;
  updateCompetition(id: string, data: CompetitionForm): Promise<Competition>;
  deleteCompetition(id: string): Promise<void>;
}