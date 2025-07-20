import { TimerLogConsecutiveError } from "@/core/errors";
import { Unsubscriber } from "@/core/interfaces";
import { ManualRecord, Participant, Record, TimerLog } from "@/core/models";
import {
  ManualRecordRepository,
  ParticipantRepository,
  RecordRepository,
  TimerLogRepository,
} from "@/core/repositories";

import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";

export type ParticipantEvent =
  | {
      type: "updated";
      participant: Participant;
    }
  | {
      type: "record-updated";
      record: Record;
    }
  | {
      type: "manual-record-added";
      manualRecord: ManualRecord;
    }
  | {
      type: "timer-log-added";
      timerLog: TimerLog;
    }
  | {
      type: "deleted";
    };

export type ParticipantEventCallback = (
  event: ParticipantEvent
) => Promise<void>;

export class ParticipantService {
  private readonly participantRepo: ParticipantRepository;
  private readonly recordRepo: RecordRepository;
  private readonly manualRecordRepo: ManualRecordRepository;
  private readonly timerLogRepo: TimerLogRepository;

  constructor(di: {
    participantRepository: ParticipantRepository;
    manualRecordRepository: ManualRecordRepository;
    recordRepository: RecordRepository;
    timerLogRepository: TimerLogRepository;
  }) {
    this.participantRepo = di.participantRepository;
    this.recordRepo = di.recordRepository;
    this.manualRecordRepo = di.manualRecordRepository;
    this.timerLogRepo = di.timerLogRepository;
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
   * 특정 참가자를 조회할 수 있다.
   */
  async getParticipant(participantId: string): Promise<Participant> {
    return this.participantRepo.getById(participantId);
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

    this.emitParticipantEvent(result.id, {
      type: "updated",
      participant: result,
    });
    return result;
  }

  /**
   * 특정 참가자를 삭제할 수 있다.
   */
  async deleteParticipant(participantId: string): Promise<void> {
    await this.participantRepo.delete(participantId);

    this.emitParticipantEvent(participantId, {
      type: "deleted",
    });
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

    this.emitParticipantEvent(participantId, {
      type: "record-updated",
      record: result,
    });
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

    this.emitParticipantEvent(record.participantId, {
      type: "record-updated",
      record: result,
    });
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

    this.emitParticipantEvent(record.participantId, {
      type: "record-updated",
      record: result,
    });
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

    this.emitParticipantEvent(result.participantId, {
      type: "manual-record-added",
      manualRecord: result,
    });
    return result;
  }

  private async checkTimerIsRunning(participantId: string): Promise<boolean> {
    let lastStartLog: TimerLog | null = null;
    let lastStopLog: TimerLog | null = null;

    const timerLogs = await this.timerLogRepo.getByParticipantId(participantId);
    for (let i = timerLogs.length - 1; i >= 0; i--) {
      const logType = timerLogs[i].type;
      if (logType === "start" && lastStartLog === null) {
        lastStartLog = timerLogs[i];
      } else if (logType === "stop" && lastStopLog === null) {
        lastStopLog = timerLogs[i];
      }
    }

    if (lastStartLog === null) {
      return false; // 타이머가 한 번도 시작되지 않은 경우
    }
    if (lastStopLog === null) {
      return true; // 타이머가 시작되었지만 중지되지 않은 경우
    }
    return lastStartLog.createdAt > lastStopLog.createdAt;
  }

  /**
   * 특정 참가자의 경연 타이머를 시작할 수 있다. 현재 시각을 기준으로 타이머가 시작된다.
   */
  async startTimer(participantId: string): Promise<TimerLog> {
    const isRunning = await this.checkTimerIsRunning(participantId);
    if (isRunning === true) {
      throw new TimerLogConsecutiveError("Timer is already running");
    }
    const now = Date.now();
    const timerLog: TimerLog = {
      id: uuidv4(),
      participantId,
      value: now,
      type: "start",
      createdAt: new Date(now),
    };
    const result = await this.timerLogRepo.create(timerLog);

    this.emitParticipantEvent(result.participantId, {
      type: "timer-log-added",
      timerLog: result,
    });
    return result;
  }

  /**
   * 특정 참가자의 경연 타이머를 중지할 수 있다. 현재 시각을 기준으로 타이머가 중지된다.
   */
  async stopTimer(participantId: string): Promise<TimerLog> {
    const isRunning = await this.checkTimerIsRunning(participantId);
    if (isRunning === false) {
      throw new TimerLogConsecutiveError("Timer is not running");
    }
    const now = Date.now();
    const timerLog: TimerLog = {
      id: uuidv4(),
      participantId,
      value: now,
      type: "stop",
      createdAt: new Date(now),
    };
    const result = await this.timerLogRepo.create(timerLog);

    this.emitParticipantEvent(result.participantId, {
      type: "timer-log-added",
      timerLog: result,
    });
    return result;
  }

  /**
   * 특정 참가자의 타이머 시간을 조정할 수 있다. 양수는 시간 추가, 음수는 시간 차감을 의미한다.
   */
  async adjustTimer(
    participantId: string,
    adjustmentMs: number
  ): Promise<TimerLog> {
    const timerLog: TimerLog = {
      id: uuidv4(),
      participantId,
      value: adjustmentMs,
      type: "adjust",
      createdAt: new Date(),
    };
    const result = await this.timerLogRepo.create(timerLog);

    this.emitParticipantEvent(result.participantId, {
      type: "timer-log-added",
      timerLog: result,
    });
    return result;
  }

  /**
   * 특정 참가자의 타이머 기록을 조회할 수 있다.
   */
  async getTimerLogs(participantId: string): Promise<TimerLog[]> {
    return this.timerLogRepo.getByParticipantId(participantId);
  }

  private _participantEventEmitter = new EventEmitter();

  private emitParticipantEvent(participantId: string, event: ParticipantEvent) {
    this._participantEventEmitter.emit(participantId, event);
  }

  /**
   * 특정 참가자의 이벤트를 구독할 수 있다.
   */
  public subscribeParticipantEvent(
    participantId: string,
    callback: ParticipantEventCallback
  ): Unsubscriber {
    const safeCb = async (event: ParticipantEvent) => {
      try {
        await callback(event);
      } catch (err) {
        console.error(err);
      }
    };
    this._participantEventEmitter.on(participantId, safeCb);
    return () => {
      this._participantEventEmitter.off(participantId, safeCb);
    };
  }
}
