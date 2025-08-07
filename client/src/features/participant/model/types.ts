import type { Participant, ParticipantForm } from "@/entities/participant";

export interface ParticipantService {
  // Load functions (공용)
  load: {
    byDivisions: (divisionIds: string[]) => Promise<void>;
    byDivision: (divisionId: string) => Promise<void>;
  };
  // Admin functions (관리자 전용)
  admin: {
    create: (divisionId: string, data: ParticipantForm) => Promise<void>;
    update: (id: string, data: ParticipantForm) => Promise<void>;
    delete: (id: string) => Promise<void>;
  };
  // Subscription hooks (구독)
  use: {
    allParticipants: () => Participant[];
    participantsByDivision: (divisionId: string) => Participant[];
    participantById: (id: string) => Participant | null;
  };
}
