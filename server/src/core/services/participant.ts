import { Unsubscriber } from "@/core/interfaces";
import { ManualRecord, Participant, Record } from "@/core/models";
import {
  ManualRecordRepository,
  ParticipantRepository,
  RecordRepository,
} from "@/core/repositories";

import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";

export class ParticipantService {
  private readonly participantRepo: ParticipantRepository;
  private readonly recordRepo: RecordRepository;
  private readonly manualRecordRepo: ManualRecordRepository;

  constructor(di: {
    participantRepository: ParticipantRepository;
    manualRecordRepository: ManualRecordRepository;
    recordRepository: RecordRepository;
  }) {
    this.participantRepo = di.participantRepository;
    this.recordRepo = di.recordRepository;
    this.manualRecordRepo = di.manualRecordRepository;
  }

  /**
   * 참가자를 특정 대회 부문에 추가할 수 있다.
   */
  async addParticipant(
    divisionId: string,
    name: string,
    teamName: string,
    robotName: string,
    comment: string,
    orderRaw: number,
    givenTime: number
  ): Promise<Participant> {
    const participant: Participant = {
      id: uuidv4(),
      divisionId,
      name,
      teamName,
      robotName,
      comment,
      orderRaw,
      givenTime,
      createdAt: new Date(),
    };
    return this.participantRepo.create(participant);
  }

  /**
   * 특정 부문의 모든 참가자를 조회할 수 있다.
   */
  async getParticipants(divisionId: string): Promise<Participant[]> {
    return this.participantRepo.getByDivisionId(divisionId);
  }

  /**
   * 특정 참가자의 이름, 팀명, 로봇명, 하고 싶은 말, 경연 순번, 주어진 시간을 수정할 수 있다.
   */
  async updateParticipant(
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
    const participant = await this.participantRepo.getById(participantId);

    // undefined 값을 필터링하여 실제로 전달된 값만 업데이트
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );

    const updated = {
      ...participant,
      ...filteredData,
    };
    const result = await this.participantRepo.update(updated);
    this.emitParticipantUpdated(result);
    return result;
  }

  /**
   * 특정 참가자를 삭제할 수 있다.
   */
  async deleteParticipant(participantId: string): Promise<void> {
    await this.participantRepo.delete(participantId);
  }

  /**
   * 특정 참가자의 모든 기록을 조회할 수 있다.
   */
  async getRecords(participantId: string): Promise<Record[]> {
    return this.recordRepo.getByParticipantId(participantId);
  }

  /**
   * 특정 참가자에 대한 기록을 추가할 수 있다.
   */
  async addRecord(
    participantId: string,
    value: number,
    source: Record["source"],
    note: string
  ): Promise<Record> {
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
  async setRecordNote(recordId: string, note: string): Promise<Record> {
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
    recordId: string,
    status: Record["status"]
  ): Promise<Record> {
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
   * 특정 참가자의 수동 계수 기록을 조회할 수 있다.
   */
  async getManualRecords(participantId: string): Promise<ManualRecord[]> {
    return this.manualRecordRepo.getByParticipantId(participantId);
  }

  /**
   * 특정 참가자에 대한 수동 계수 기록을 추가할 수 있다.
   */
  async addManualRecord(
    participantId: string,
    value: number,
    recorderName: string
  ): Promise<ManualRecord> {
    const manualRecord: ManualRecord = {
      id: uuidv4(),
      participantId,
      value,
      recorderName,
      createdAt: new Date(),
    };
    const result = await this.manualRecordRepo.create(manualRecord);
    this.emitManualRecordAdded(result);
    return result;
  }

  // ------------------------------
  // 이벤트 핸들링 관련 로직
  // ------------------------------
  private eventEmitter = new EventEmitter();

  private getParticipantUpdatedEventName = (id: string) =>
    `participant:update:${id}`;

  private emitParticipantUpdated(p: Participant) {
    this.eventEmitter.emit(this.getParticipantUpdatedEventName(p.id), p);
  }

  /**
   * 특정 참가자의 변경 이벤트를 구독할 수 있다.
   */
  subscribeParticipantUpdated(
    participantId: string,
    callback: (participant: Participant) => Promise<void>
  ): Unsubscriber {
    const eventName = this.getParticipantUpdatedEventName(participantId);
    const safeCb = async (p: Participant) => {
      try {
        await callback(p);
      } catch (err) {
        console.error(
          `ParticipantUpdated listener error for ${participantId}:`,
          err
        );
      }
    };
    this.eventEmitter.on(eventName, safeCb);
    return () => {
      this.eventEmitter.off(eventName, safeCb);
    };
  }

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

  private getManualRecordAddedEventName = (participantId: string) =>
    `manual-record:added:${participantId}`;

  private emitManualRecordAdded(manualRecord: ManualRecord) {
    this.eventEmitter.emit(
      this.getManualRecordAddedEventName(manualRecord.participantId),
      manualRecord
    );
  }

  /**
   * 특정 참가자에 대한 수동 계수 기록 추가 이벤트를 구독할 수 있다.
   */
  subscribeManualRecordAdded(
    participantId: string,
    callback: (manualRecord: ManualRecord) => Promise<void>
  ): Unsubscriber {
    const eventName = this.getManualRecordAddedEventName(participantId);
    const safeCb = async (manualRecord: ManualRecord) => {
      try {
        await callback(manualRecord);
      } catch (err) {
        console.error(
          `Manual record added listener error for ${participantId}:`,
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
