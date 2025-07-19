import { Unsubscriber } from "@/core/interfaces";
import { Actor, Record } from "@/core/models";
import { ParticipantRepository, RecordRepository } from "@/core/repositories";
import { requireAnyRole } from "@/core/utils/auth";

import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";

export class RecordService {
  private readonly recordRepo: RecordRepository;
  private readonly participantRepo: ParticipantRepository;

  constructor(di: {
    recordRepository: RecordRepository;
    participantRepository: ParticipantRepository;
  }) {
    this.recordRepo = di.recordRepository;
    this.participantRepo = di.participantRepository;
  }

  /**
   * 특정 참가자의 모든 기록을 조회할 수 있다.
   */
  async getRecords(actor: Actor, participantId: string): Promise<Record[]> {
    return this.recordRepo.getByParticipantId(participantId);
  }

  /**
   * 특정 참가자에 대한 기록을 추가할 수 있다.
   */
  async addRecord(
    actor: Actor,
    participantId: string,
    value: number,
    source: Record["source"],
    note: string
  ): Promise<Record> {
    requireAnyRole(actor, "administrator", "stopwatchRecorder");

    const record: Record = {
      id: uuidv4(),
      participantId,
      value,
      source,
      status: "pending",
      note,
      createdAt: new Date(),
    };
    const result = await this.recordRepo.create(record);
    this.emitRecordStatusChanged(result);
    return result;
  }

  /**
   * 특정 참가자의 기록에 비고란을 수정할 수 있다.
   */
  async setRecordNote(
    actor: Actor,
    recordId: string,
    note: string
  ): Promise<Record> {
    requireAnyRole(actor, "administrator");

    const record = await this.recordRepo.getById(recordId);
    const updated = {
      ...record,
      note,
    };
    const result = await this.recordRepo.update(updated);
    return result;
  }

  /**
   * 특정 참가자의 기록의 상태(승인/거절)를 변경할 수 있다.
   */
  async setRecordStatus(
    actor: Actor,
    recordId: string,
    status: Record["status"]
  ): Promise<Record> {
    requireAnyRole(actor, "administrator");

    const record = await this.recordRepo.getById(recordId);
    const updated = {
      ...record,
      status,
    };
    const result = await this.recordRepo.update(updated);
    this.emitRecordStatusChanged(result);
    return result;
  }

  /**
   * 특정 부문의 상위 기록을 가져올 수 있어야 한다.
   *
   * 1. divisionId에 대한 참가자 목록을 조회한다. -> ParticipantRepository.getByDivisionId()
   * 2. participantId에 대한 최고 기록을 조회한다. -> RecordRepository.getByParticipantId()
   * 3. 승인된 기록 중 최고 기록을 찾는다. -> filter Record.status === "approved" && max(Record.value)
   * 4. 참가자의 최고 기록을 오름차순으로 정렬한다.
   */
  async getTopRecordsByDivision(
    actor: Actor,
    divisionId: string
  ): Promise<Record[]> {
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

  // ------------------------------
  // 이벤트 핸들링 관련 로직
  // ------------------------------
  private eventEmitter = new EventEmitter();

  private getRecordStatusChangedEventName = (participantId: string) =>
    `record:status:changed:${participantId}`;

  private emitRecordStatusChanged(record: Record) {
    this.eventEmitter.emit(
      this.getRecordStatusChangedEventName(record.participantId),
      record
    );
  }

  /**
   * 특정 참가자의 기록 상태(승인/거절)가 변경된 경우를 구독할 수 있다.
   */
  subscribeRecordStatusChanged(
    participantId: string,
    callback: (record: Record) => Promise<void>
  ): Unsubscriber {
    const eventName = this.getRecordStatusChangedEventName(participantId);
    const safeCb = async (record: Record) => {
      try {
        await callback(record);
      } catch (err) {
        console.error(
          `Record status changed listener error for ${participantId}:`,
          err
        );
      }
    };
    this.eventEmitter.on(eventName, safeCb);
    return () => {
      this.eventEmitter.off(eventName, safeCb);
    };
  }
}
