import type { Participant } from "../model/types";

export interface ParticipantDto {
  id: string;
  divisionId: string;
  name: string;
  teamName: string;
  robotName: string;
  comment: string;
  orderRaw: number;
  createdAt: string;
}

export interface ParticipantRepository {
  getAllParticipants(divisionId: string): Promise<Participant[]>;
  getParticipantById(participantId: string): Promise<Participant | null>;
  createParticipant(divisionId: string, participant: Omit<Participant, "id" | "createdAt">): Promise<Participant>;
  updateParticipant(participantId: string, participant: Participant): Promise<Participant | null>;
  deleteParticipant(participantId: string): Promise<void>;
}
