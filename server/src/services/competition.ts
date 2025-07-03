import { Actor, Competition, Division } from "@/core/models";
import { CompetitionRepository, DivisionRepository } from "@/core/repositories";
import { CompetitionService, Unsubscriber } from "@/core/services";

import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";

import { requireAnyRole } from "@/utils/auth";

export class CompetitionServiceImpl implements CompetitionService {
  private competitionRepo: CompetitionRepository;
  private divisionRepo: DivisionRepository;

  constructor(
    // 의존성 주입
    di: {
      competitionRepository: CompetitionRepository;
      divisionRepository: DivisionRepository;
    }
  ) {
    this.competitionRepo = di.competitionRepository;
    this.divisionRepo = di.divisionRepository;
  }

  async getCompetitions(actor: Actor): Promise<Competition[]> {
    return this.competitionRepo.getAll();
  }

  async getCompetitionWithDivisions(
    actor: Actor,
    competitionId: string
  ): Promise<{ competition: Competition; divisions: Division[] }> {
    const competition = await this.competitionRepo.getById(competitionId);
    const divisions = await this.divisionRepo.getByCompetitionId(competitionId);
    return { competition, divisions };
  }

  async createCompetition(
    actor: Actor,
    name: string,
    description: string
  ): Promise<Competition> {
    requireAnyRole(actor, "administrator");

    const entity: Competition = {
      id: uuidv4(),
      name,
      description,
      createdAt: new Date(),
    };
    return this.competitionRepo.create(entity);
  }

  async updateCompetition(
    actor: Actor,
    competitionId: string,
    data: { name?: string; description?: string }
  ): Promise<Competition> {
    requireAnyRole(actor, "administrator");

    const target = await this.competitionRepo.getById(competitionId);
    if (data.name) target.name = data.name;
    if (data.description) target.description = data.description;
    const updated = await this.competitionRepo.update(target);
    this.emitCompetitionUpdated(updated);
    return updated;
  }

  async deleteCompetition(actor: Actor, competitionId: string): Promise<void> {
    requireAnyRole(actor, "administrator");

    await this.competitionRepo.delete(competitionId);
  }

  async createDivision(
    actor: Actor,
    competitionId: string,
    name: string,
    description: string
  ): Promise<Division> {
    requireAnyRole(actor, "administrator");

    const data: Division = {
      id: uuidv4(),
      competitionId,
      name,
      description,
      createdAt: new Date(),
      status: "ready",
      stopwatchId: null,
    };
    return this.divisionRepo.create(data);
  }

  async updateDivision(
    actor: Actor,
    divisionId: string,
    data: { name?: string; description?: string }
  ): Promise<Division> {
    requireAnyRole(actor, "administrator");

    const target = await this.divisionRepo.getById(divisionId);
    if (data.name) target.name = data.name;
    if (data.description) target.description = data.description;
    const updated = await this.divisionRepo.update(target);
    this.emitDivisionUpdated(updated);
    return updated;
  }

  async setDivisionStatus(
    actor: Actor,
    divisionId: string,
    status: Division["status"]
  ): Promise<Division> {
    requireAnyRole(actor, "administrator");

    const target = await this.divisionRepo.getById(divisionId);
    target.status = status;
    const updated = await this.divisionRepo.update(target);
    this.emitDivisionUpdated(updated);
    return updated;
  }

  async setDivisionStopwatch(
    actor: Actor,
    divisionId: string,
    stopwatchId: string | null
  ): Promise<Division> {
    requireAnyRole(actor, "administrator");

    const target = await this.divisionRepo.getById(divisionId);
    target.stopwatchId = stopwatchId;
    const updated = await this.divisionRepo.update(target);
    this.emitDivisionUpdated(updated);
    return updated;
  }

  async deleteDivision(actor: Actor, divisionId: string): Promise<void> {
    requireAnyRole(actor, "administrator");

    await this.divisionRepo.delete(divisionId);
  }

  // ------------------------------
  // 이벤트 핸들링 관련 로직
  // ------------------------------

  private eventEmitter = new EventEmitter();

  private getCompetitionUpdatedEventName = (id: string) =>
    `competition:update:${id}`;

  private getDivisionUpdatedEventName = (id: string) => `division:update:${id}`;

  private emitCompetitionUpdated(c: Competition) {
    this.eventEmitter.emit(this.getCompetitionUpdatedEventName(c.id), c);
  }

  private emitDivisionUpdated(d: Division) {
    this.eventEmitter.emit(this.getDivisionUpdatedEventName(d.id), d);
  }

  subscribeCompetitionUpdated(
    competitionId: string,
    callback: (competition: Competition) => void
  ): Unsubscriber {
    const eventName = this.getCompetitionUpdatedEventName(competitionId);
    const safeCb = (c: Competition) => {
      try {
        callback(c);
      } catch (err) {
        console.error(
          `CompetitionUpdated listener error for ${competitionId}:`,
          err
        );
      }
    };
    this.eventEmitter.on(eventName, safeCb);
    return () => {
      this.eventEmitter.off(eventName, safeCb);
    };
  }

  subscribeDivisionUpdated(
    divisionId: string,
    callback: (division: Division) => void
  ): Unsubscriber {
    const eventName = this.getDivisionUpdatedEventName(divisionId);
    const safeCb = (d: Division) => {
      try {
        callback(d);
      } catch (err) {
        console.error(`DivisionUpdated listener error for ${divisionId}:`, err);
      }
    };
    this.eventEmitter.on(eventName, safeCb);
    return () => {
      this.eventEmitter.off(eventName, safeCb);
    };
  }
}
