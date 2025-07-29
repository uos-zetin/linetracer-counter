import type { Competition, CompetitionForm } from "@/entities/competition";

export interface AdminCompetitionService {
  // Store state updates (void 반환, store만 업데이트)
  loadAllCompetitions(): Promise<void>;
  loadCompetitionById(id: string): Promise<void>;
  createCompetition(data: CompetitionForm): Promise<void>;
  updateCompetition(id: string, data: CompetitionForm): Promise<void>;
  deleteCompetition(id: string): Promise<void>;
  
  // Store 구독 메서드들 (실시간 데이터)
  useCompetitions(): Competition[];
  useCompetitionById(id: string): Competition | null;
}