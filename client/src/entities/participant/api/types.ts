import type { Participant, ParticipantForm } from "../model/types";

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

export interface ParticipantCreateDto {
  name: string;
  teamName: string;
  robotName: string;
  comment: string;
  orderRaw: number;
}

export interface ParticipantRepository {
  getAllParticipants(divisionId: string): Promise<Participant[]>;
  createParticipant(divisionId: string, participant: ParticipantForm): Promise<Participant>;
  updateParticipant(participantId: string, participant: Participant): Promise<Participant>;
  deleteParticipant(participantId: string): Promise<void>;
}
