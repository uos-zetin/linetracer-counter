import type { Participant, ParticipantForm } from "@/entities/participant";

export interface ParticipantService {
  // 조회 기능 (공용)
  loadParticipantsByDivisions: (divisionIds: string[]) => Promise<void>;
  loadParticipantsByDivision: (divisionId: string) => Promise<void>;
  useAllParticipants: () => Participant[];
  useParticipantsByDivision: (divisionId: string) => Participant[];
  useParticipantById: (id: string) => Participant | null;

  // 관리 기능 (admin 전용, authFetcher에서 인증 확인)
  createParticipant: (divisionId: string, data: ParticipantForm) => Promise<void>;
  updateParticipant: (id: string, data: ParticipantForm) => Promise<void>;
  deleteParticipant: (id: string) => Promise<void>;
}