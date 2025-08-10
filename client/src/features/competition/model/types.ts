import type { Competition, CompetitionForm } from "@/entities/competition";

export interface CompetitionService {
  // Load functions (공용)
  load: {
    all: () => Promise<void>;
    byId: (id: string) => Promise<void>;
  };

  // Admin functions (관리자 전용)
  admin: {
    create: (data: CompetitionForm) => Promise<Competition>;
    update: (id: string, data: CompetitionForm) => Promise<Competition>;
    delete: (id: string) => Promise<void>;
  };

  // Subscription hooks (구독)
  use: {
    competitions: () => Competition[];
    competitionById: (id: string) => Competition | null;
  };
}
