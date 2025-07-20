import { Unsubscriber } from "@/core/interfaces";
import { Competition, Division, Record } from "@/core/models";
import {
  CompetitionRepository,
  DivisionRepository,
  ParticipantRepository,
  RecordRepository,
} from "@/core/repositories";

import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";

export type DivisionEvent =
  | {
      type: "updated" | "status-changed";
      division: Division;
    }
  | {
      type: "deleted";
    };

export class CompetitionService {
  private competitionRepo: CompetitionRepository;
  private divisionRepo: DivisionRepository;
  private recordRepo: RecordRepository;
  private participantRepo: ParticipantRepository;

  constructor(
    // 의존성 주입
    di: {
      competitionRepository: CompetitionRepository;
      divisionRepository: DivisionRepository;
      participantRepository: ParticipantRepository;
      recordRepository: RecordRepository;
    }
  ) {
    this.competitionRepo = di.competitionRepository;
    this.divisionRepo = di.divisionRepository;
    this.participantRepo = di.participantRepository;
    this.recordRepo = di.recordRepository;
  }

  /**
   * 모든 대회 목록을 조회한다.
   */
  public async getCompetitions(): Promise<Competition[]> {
    return this.competitionRepo.getAll();
  }

  /**
   * 특정 대회를 조회한다.
   */
  public async getCompetition(competitionId: string): Promise<Competition> {
    return this.competitionRepo.getById(competitionId);
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
    return updated;
  }

  /**
   * 대회를 삭제한다.
   */
  public async deleteCompetition(competitionId: string): Promise<void> {
    await this.competitionRepo.delete(competitionId);
  }

  /**
   * 특정 대회 부문을 조회한다.
   */
  public async getDivision(divisionId: string): Promise<Division> {
    return this.divisionRepo.getById(divisionId);
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
    this.emitDivisionEvent(divisionId, {
      type: "updated",
      division: updated,
    });
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
    this.emitDivisionEvent(divisionId, {
      type: "status-changed",
      division: updated,
    });
    return updated;
  }

  /**
   * 대회 부문을 삭제한다.
   */
  public async deleteDivision(divisionId: string): Promise<void> {
    await this.divisionRepo.delete(divisionId);
    this.emitDivisionEvent(divisionId, {
      type: "deleted",
    });
  }

  /**
   * 특정 부문의 상위 기록을 조회한다.
   *
   * 1. 특정 부문에 대한 참가자 목록을 조회한다.
   * 2. 각 참가자의 기록 목록을 조회한다.
   * 3. 승인된 기록 중 참가자별 최고 기록을 찾는다.
   * 4. 최고 기록을 오름차순으로 정렬한다.
   */
  async getTopRecordsByDivision(divisionId: string): Promise<Record[]> {
    // 해당 부문의 모든 참가자 조회
    const participants = await this.participantRepo.getByDivisionId(divisionId);

    // 각 참가자의 최고 기록을 찾는다.
    const bestRecordByParticipant: Map<string, Record> = new Map();
    for (const participant of participants) {
      const records = await this.recordRepo.getByParticipantId(participant.id);
      const bestRecord = records
        .filter((record) => record.status === "approved")
        .sort((a, b) => a.value - b.value);
      if (bestRecord.length > 0) {
        bestRecordByParticipant.set(participant.id, bestRecord[0]);
      }
    }

    // 참가자의 최고 기록을 오름차순으로 정렬한다.
    const bestRecords = Array.from(bestRecordByParticipant.values());
    return bestRecords.sort((a, b) => a.value - b.value);
  }

  private _divisionEventEmitter = new EventEmitter();

  private emitDivisionEvent(id: string, event: DivisionEvent) {
    this._divisionEventEmitter.emit(id, event);
  }

  /**
   * 특정 대회 부문의 변경 이벤트를 구독할 수 있다.
   */
  public subscribeDivisionEvent(
    divisionId: string,
    callback: (event: DivisionEvent) => Promise<void>
  ): Unsubscriber {
    const safeCb = async (event: DivisionEvent) => {
      try {
        await callback(event);
      } catch (err) {
        console.error(err);
      }
    };
    this._divisionEventEmitter.on(divisionId, safeCb);
    return () => {
      this._divisionEventEmitter.off(divisionId, safeCb);
    };
  }
}
