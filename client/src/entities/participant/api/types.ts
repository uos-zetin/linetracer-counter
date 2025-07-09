import type { Participant } from "../model/types";

export interface ParticipantDto {
  id: string;
  divisionId: string;
  name: string;
  teamName: string;
  robotName: string;
  comment: string;
  orderRaw: number;
  givenTime: number;
  createdAt: string;
}

export interface ParticipantRepository {
  // Implement methods when api is ready
  getParticipants(divisionId: string): Promise<Participant[]>;
}
