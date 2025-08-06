import type { Competition, CompetitionForm } from "@/entities/competition";

export interface CompetitionService {
  // 조회 기능 (공용)
  loadAllCompetitions: () => Promise<void>;
  loadCompetitionById: (id: string) => Promise<void>;
  useCompetitions: () => Competition[];
  useCompetitionById: (id: string) => Competition | null;

  // 관리 기능 (admin 전용, authFetcher에서 인증 확인)
  createCompetition: (data: CompetitionForm) => Promise<void>;
  updateCompetition: (id: string, data: CompetitionForm) => Promise<void>;
  deleteCompetition: (id: string) => Promise<void>;
}
