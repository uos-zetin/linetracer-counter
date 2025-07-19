import { Unsubscriber } from "@/core/interfaces";
import { Actor, ManualRecord } from "@/core/models";
import { ManualRecordRepository } from "@/core/repositories";
import { requireAnyRole } from "@/core/utils/auth";

import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";

export class ManualRecordService {
  private readonly manualRecordRepo: ManualRecordRepository;

  constructor(di: { manualRecordRepository: ManualRecordRepository }) {
    this.manualRecordRepo = di.manualRecordRepository;
  }

  /**
   * 특정 참가자의 수동 계수 기록을 조회할 수 있다.
   */
  async getManualRecords(
    actor: Actor,
    participantId: string
  ): Promise<ManualRecord[]> {
    return this.manualRecordRepo.getByParticipantId(participantId);
  }

  /**
   * 특정 참가자에 대한 수동 계수 기록을 추가할 수 있다.
   */
  async addManualRecord(
    actor: Actor,
    participantId: string,
    value: number,
    recorderName: string
  ): Promise<ManualRecord> {
    requireAnyRole(actor, "administrator", "manualRecorder");

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
