import { Unsubscriber } from "@/core/interfaces";
import { Competition, Division } from "@/core/models";
import { CompetitionRepository, DivisionRepository } from "@/core/repositories";

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
   * 모든 대회 목록을 조회한다.
   */
  public async getCompetitions(): Promise<Competition[]> {
    return this.competitionRepo.getAll();
  }

  /**
   * 특정 대회의 그 아래의 부문들을 조회한다.
   */
  public async getCompetitionWithDivisions(
    competitionId: string
  ): Promise<{ competition: Competition; divisions: Division[] }> {
    const competition = await this.competitionRepo.getById(competitionId);
    const divisions = await this.divisionRepo.getByCompetitionId(competitionId);
    return { competition, divisions };
  }

  /**
   * 대회를 생성한다.
   */
  public async createCompetition(
    name: string,
    description: string
  ): Promise<Competition> {
    const entity: Competition = {
      id: uuidv4(),
      name,
      description,
      createdAt: new Date(),
    };
    return this.competitionRepo.create(entity);
  }

  /**
   * 대회 이름/설명을 수정한다.
   */
  public async updateCompetition(
    competitionId: string,
    data: { name?: string; description?: string }
  ): Promise<Competition> {
    const target = await this.competitionRepo.getById(competitionId);
    if (data.name) target.name = data.name;
    if (data.description) target.description = data.description;
    const updated = await this.competitionRepo.update(target);
    this.emitCompetitionUpdated(updated);
    return updated;
  }

  /**
   * 대회를 삭제한다.
   */
  public async deleteCompetition(competitionId: string): Promise<void> {
    await this.competitionRepo.delete(competitionId);
  }

  /**
   * 대회 부문을 생성한다.
   */
  public async createDivision(
    competitionId: string,
    name: string,
    description: string
  ): Promise<Division> {
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
   * 대회 부문의 이름/설명을 수정한다.
   */
  public async updateDivision(
    divisionId: string,
    data: { name?: string; description?: string }
  ): Promise<Division> {
    const target = await this.divisionRepo.getById(divisionId);
    if (data.name) target.name = data.name;
    if (data.description) target.description = data.description;
    const updated = await this.divisionRepo.update(target);
    this.emitDivisionUpdated(updated);
    return updated;
  }

  /**
   * 대회 부문의 상태 정보를 설정한다.
   */
  public async setDivisionStatus(
    divisionId: string,
    status: Division["status"]
  ): Promise<Division> {
    const target = await this.divisionRepo.getById(divisionId);
    target.status = status;
    const updated = await this.divisionRepo.update(target);
    this.emitDivisionUpdated(updated);
    return updated;
  }

  /**
   * 대회 부문을 삭제한다.
   */
  public async deleteDivision(divisionId: string): Promise<void> {
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
  public subscribeCompetitionUpdated(
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
  public subscribeDivisionUpdated(
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
