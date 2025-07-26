import { Actor } from "@/core/models";
import { requireAnyRole } from "@/core/utils/auth";

import { CompetitionService } from "./competition";

export class CompetitionActorService {
  constructor(private readonly service: CompetitionService) {}

  public async getCompetitions(actor: Actor) {
    return this.service.getCompetitions();
  }

  public async getCompetitionWithDivisions(
    actor: Actor,
    competitionId: string
  ) {
    return this.service.getCompetitionWithDivisions(competitionId);
  }

  public async createCompetition(
    actor: Actor,
    name: string,
    description: string
  ) {
    requireAnyRole(actor, "administrator");
    return this.service.createCompetition(name, description);
  }

  public async updateCompetition(
    actor: Actor,
    competitionId: string,
    data: { name?: string; description?: string }
  ) {
    requireAnyRole(actor, "administrator");
    return this.service.updateCompetition(competitionId, data);
  }

  public async deleteCompetition(actor: Actor, competitionId: string) {
    requireAnyRole(actor, "administrator");
    return this.service.deleteCompetition(competitionId);
  }

  public async createDivision(
    actor: Actor,
    competitionId: string,
    name: string,
    description: string
  ) {
    requireAnyRole(actor, "administrator");
    return this.service.createDivision(competitionId, name, description);
  }

  public async updateDivision(
    actor: Actor,
    divisionId: string,
    data: { name?: string; description?: string }
  ) {
    requireAnyRole(actor, "administrator");
    return this.service.updateDivision(divisionId, data);
  }

  public async deleteDivision(actor: Actor, divisionId: string) {
    requireAnyRole(actor, "administrator");
    return this.service.deleteDivision(divisionId);
  }

  public async getTopRecordsByDivision(actor: Actor, divisionId: string) {
    return this.service.getTopRecordsByDivision(divisionId);
  }
}
