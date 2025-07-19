import { TimerLogConsecutiveError } from "@/core/errors";
import { Unsubscriber } from "@/core/interfaces";
import { Actor, TimerLog } from "@/core/models";
import { TimerLogRepository } from "@/core/repositories";
import { requireAnyRole } from "@/core/utils/auth";

import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";

export class TimerLogService {
  private readonly timerLogRepo: TimerLogRepository;

  constructor(di: { timerLogRepository: TimerLogRepository }) {
    this.timerLogRepo = di.timerLogRepository;
  }

  async checkTimerIsRunning(participantId: string): Promise<boolean> {
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
  async startTimer(actor: Actor, participantId: string): Promise<TimerLog> {
    requireAnyRole(actor, "administrator");
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
    this.emitTimerLogsChanged(result);
    return result;
  }

  /**
   * 특정 참가자의 경연 타이머를 중지할 수 있다. 현재 시각을 기준으로 타이머가 중지된다.
   */
  async stopTimer(actor: Actor, participantId: string): Promise<TimerLog> {
    requireAnyRole(actor, "administrator");
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
    this.emitTimerLogsChanged(result);
    return result;
  }

  /**
   * 특정 참가자의 타이머 시간을 조정할 수 있다. 양수는 시간 추가, 음수는 시간 차감을 의미한다.
   */
  async adjustTimer(
    actor: Actor,
    participantId: string,
    adjustmentMs: number
  ): Promise<TimerLog> {
    requireAnyRole(actor, "administrator");

    const timerLog: TimerLog = {
      id: uuidv4(),
      participantId,
      value: adjustmentMs,
      type: "adjust",
      createdAt: new Date(),
    };

    const result = await this.timerLogRepo.create(timerLog);
    this.emitTimerLogsChanged(result);
    return result;
  }

  /**
   * 특정 참가자의 타이머 기록을 조회할 수 있다.
   */
  async getTimerLogs(actor: Actor, participantId: string): Promise<TimerLog[]> {
    return this.timerLogRepo.getByParticipantId(participantId);
  }

  // ------------------------------
  // 이벤트 핸들링 관련 로직
  // ------------------------------
  private eventEmitter = new EventEmitter();

  private getTimerLogsChangedEventName = (participantId: string) =>
    `timerLogs:changed:${participantId}`;

  private emitTimerLogsChanged(timerLog: TimerLog) {
    this.eventEmitter.emit(
      this.getTimerLogsChangedEventName(timerLog.participantId),
      timerLog
    );
  }

  /**
   * 특정 참가자에 대한 타이머 기록 추가 이벤트를 구독할 수 있다.
   */
  subscribeTimerLogsChanged(
    participantId: string,
    callback: (timerLog: TimerLog) => Promise<void>
  ): Unsubscriber {
    const eventName = this.getTimerLogsChangedEventName(participantId);
    const safeCb = async (timerLog: TimerLog) => {
      try {
        await callback(timerLog);
      } catch (err) {
        console.error(
          `TimerLogsChanged listener error for ${participantId}:`,
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
