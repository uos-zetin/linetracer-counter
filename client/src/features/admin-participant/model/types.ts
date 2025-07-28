import type { Participant, ParticipantForm } from "@/entities/participant";

export interface AdminParticipantService {
  // Store state updates
  loadAllParticipants: () => Promise<void>;
  loadParticipantsByDivisions: (divisionIds: string[]) => Promise<void>;
  loadParticipantsByDivision: (divisionId: string) => Promise<void>;
  loadParticipantById: (id: string) => Promise<void>;
  createParticipant: (data: ParticipantForm) => Promise<void>;
  updateParticipant: (id: string, data: ParticipantForm) => Promise<void>;
  deleteParticipant: (id: string) => Promise<void>;
  
  // Store 구독 메서드들
  useParticipants: () => Participant[];
  useParticipantsByDivision: (divisionId: string) => Participant[];
  useParticipantById: (id: string) => Participant | null;
}
