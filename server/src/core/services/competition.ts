import { Unsubscriber } from "@/core/interfaces";
import { Actor, Competition, Division } from "@/core/models";
import { CompetitionRepository, DivisionRepository } from "@/core/repositories";
import { requireAnyRole } from "@/core/utils/auth";

import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";

export class CompetitionService {
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

  /**
   * 모든 대회 목록을 조회할 수 있다.
   */
  public async getCompetitions(actor: Actor): Promise<Competition[]> {
    return this.competitionRepo.getAll();
  }

  /**
   * 특정 대회의 그 아래의 부문들을 조회할 수 있다.
   */
  async getCompetitionWithDivisions(
    actor: Actor,
    competitionId: string
  ): Promise<{ competition: Competition; divisions: Division[] }> {
    const competition = await this.competitionRepo.getById(competitionId);
    const divisions = await this.divisionRepo.getByCompetitionId(competitionId);
    return { competition, divisions };
  }

  /**
   * 대회를 생성할 수 있다.
   */
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

  /**
   * 대회 이름/설명을 수정할 수 있다.
   */
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

  /**
   * 대회를 삭제할 수 있다.
   */
  async deleteCompetition(actor: Actor, competitionId: string): Promise<void> {
    requireAnyRole(actor, "administrator");

    await this.competitionRepo.delete(competitionId);
  }

  /**
   * 대회 부문을 생성할 수 있다.
   */
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
    };
    return this.divisionRepo.create(data);
  }

  /**
   * 대회 부문의 이름/설명을 수정할 수 있다.
   */
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

  /**
   * 대회 부문의 상태 정보를 설정할 수 있다.
   */
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

  /**
   * 대회 부문을 삭제할 수 있다.
   */
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

  /**
   * 특정 대회의 변경 이벤트를 구독할 수 있다.
   */
  subscribeCompetitionUpdated(
    competitionId: string,
    callback: (competition: Competition) => Promise<void>
  ): Unsubscriber {
    const eventName = this.getCompetitionUpdatedEventName(competitionId);
    const safeCb = async (c: Competition) => {
      try {
        await callback(c);
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

  /**
   * 특정 대회 부문의 변경 이벤트를 구독할 수 있다.
   */
  subscribeDivisionUpdated(
    divisionId: string,
    callback: (division: Division) => Promise<void>
  ): Unsubscriber {
    const eventName = this.getDivisionUpdatedEventName(divisionId);
    const safeCb = async (d: Division) => {
      try {
        await callback(d);
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
