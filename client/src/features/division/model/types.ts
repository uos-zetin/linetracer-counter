import type { Division, DivisionForm } from "@/entities/division";

export interface DivisionService {
  // Load functions (공용)
  load: {
    all: () => Promise<void>;
    byCompetition: (competitionId: string) => Promise<void>;
    byId: (id: string) => Promise<void>;
  };
  // Admin functions (관리자 전용)
  admin: {
    create: (data: DivisionForm) => Promise<void>;
    update: (id: string, data: DivisionForm) => Promise<void>;
    delete: (id: string) => Promise<void>;
  };
  // Subscription hooks (구독)
  use: {
    divisions: () => Division[];
    divisionsByCompetition: (competitionId: string) => Division[];
    divisionById: (id: string) => Division | null;
  };
}
