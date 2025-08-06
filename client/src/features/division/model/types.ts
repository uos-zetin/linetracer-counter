import type { Division, DivisionForm } from "@/entities/division";

export interface DivisionService {
  // 조회 기능 (공용)
  loadAllDivisions: () => Promise<void>;
  loadDivisionsByCompetition: (competitionId: string) => Promise<void>;
  loadDivisionById: (id: string) => Promise<void>;
  useDivisions: () => Division[];
  useDivisionsByCompetition: (competitionId: string) => Division[];
  useDivisionById: (id: string) => Division | null;

  // 관리 기능 (admin 전용, authFetcher에서 인증 확인)
  createDivision: (data: DivisionForm) => Promise<void>;
  updateDivision: (id: string, data: DivisionForm) => Promise<void>;
  deleteDivision: (id: string) => Promise<void>;
}
