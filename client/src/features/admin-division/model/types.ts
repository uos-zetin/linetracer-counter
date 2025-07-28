import type { Division, DivisionForm } from "@/entities/division";

export interface AdminDivisionService {
  // Store state updates
  loadAllDivisions: () => Promise<void>;
  loadDivisionsByCompetition: (competitionId: string) => Promise<void>;
  loadDivisionById: (id: string) => Promise<void>;
  createDivision: (data: DivisionForm) => Promise<void>;
  updateDivision: (id: string, data: DivisionForm) => Promise<void>;
  deleteDivision: (id: string) => Promise<void>;
  
  // Store 구독 메서드들
  useDivisions: () => Division[];
  useDivisionsByCompetition: (competitionId: string) => Division[];
  useDivisionById: (id: string) => Division | null;
}