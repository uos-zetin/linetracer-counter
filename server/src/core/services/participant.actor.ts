import { Actor, Participant } from "@/core/models";
import { requireAnyRole } from "@/core/utils/auth";

import { ParticipantService } from "./participant";

export class ParticipantActorService {
  constructor(private readonly service: ParticipantService) {}

  async addParticipant(
    actor: Actor,
    divisionId: string,
    name: string,
    teamName: string,
    robotName: string,
    comment: string,
    orderRaw: number,
    givenTime: number
  ): Promise<Participant> {
    requireAnyRole(actor, "administrator");
    return this.service.addParticipant(
      divisionId,
      name,
      teamName,
      robotName,
      comment,
      orderRaw,
      givenTime
    );
  }

  async getParticipants(
    actor: Actor,
    divisionId: string
  ): Promise<Participant[]> {
    return this.service.getParticipants(divisionId);
  }

  async updateParticipant(
    actor: Actor,
    participantId: string,
    data: {
      name?: string;
      teamName?: string;
      robotName?: string;
      comment?: string;
      orderRaw?: number;
      givenTime?: number;
    }
  ): Promise<Participant> {
    requireAnyRole(actor, "administrator");
    return this.service.updateParticipant(participantId, data);
  }

  async deleteParticipant(actor: Actor, participantId: string): Promise<void> {
    requireAnyRole(actor, "administrator");
    return this.service.deleteParticipant(participantId);
  }
}
