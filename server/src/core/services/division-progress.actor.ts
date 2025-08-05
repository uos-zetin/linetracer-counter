import { Actor, DivisionProgress } from "@/core/models";
import { requireAnyRole } from "@/core/utils/auth";
import { Unsubscriber } from "@/core/interfaces";

import {
  DivisionProgressService,
  DivisionProgressCallback,
} from "./division-progress";

export class DivisionProgressActorService {
  constructor(private readonly service: DivisionProgressService) {}

  public async openDivision(actor: Actor, divisionId: string) {
    requireAnyRole(actor, "administrator");
    return this.service.openDivision(divisionId);
  }

  public async closeDivision(actor: Actor, divisionId: string) {
    requireAnyRole(actor, "administrator");
    return this.service.closeDivision(divisionId);
  }

  public async resetDivision(actor: Actor, divisionId: string) {
    requireAnyRole(actor, "administrator");
    return this.service.resetDivision(divisionId);
  }

  public async setRunner(actor: Actor, divisionId: string, runnerId: string) {
    requireAnyRole(actor, "administrator");
    return this.service.setRunner(divisionId, runnerId);
  }

  public async postponeRunner(actor: Actor, divisionId: string) {
    requireAnyRole(actor, "administrator");
    return this.service.postponeRunner(divisionId);
  }

  public async getParticipantOrder(
    actor: Actor,
    divisionId: string
  ): Promise<string[]> {
    return this.service.getParticipantOrder(divisionId);
  }

  public async changeParticipantOrder(
    actor: Actor,
    divisionId: string,
    participantId: string,
    order: number
  ) {
    requireAnyRole(actor, "administrator");
    return this.service.changeParticipantOrder(
      divisionId,
      participantId,
      order
    );
  }

  public async getDivisionProgress(
    actor: Actor,
    divisionId: string
  ): Promise<DivisionProgress> {
    return this.service.getDivisionProgress(divisionId);
  }

  public subscribeDivisionProgress(
    actor: Actor,
    divisionId: string,
    callback: DivisionProgressCallback
  ): Unsubscriber {
    return this.service.subscribeDivisionProgress(divisionId, callback);
  }
}
