import {
  Actor,
  Competition,
  Division,
  ManualRecord,
  Participant,
  Progress,
  Record,
  Stopwatch,
  TimerLog,
} from "./models";

export type Unsubscriber = () => void;

/**
 * 대회/부문 관련 서비스 레이어
 */
export interface CompetitionService {
  /**
   * 대회 목록을 조회할 수 있다.
   */
  getCompetitions(actor: Actor): Promise<Competition[]>;

  /**
   * 특정 대회의 그 아래의 부문들을 조회할 수 있다.
   */
  getCompetitionWithDivisions(
    actor: Actor,
    competitionId: string
  ): Promise<{
    competition: Competition;
    divisions: Division[];
  }>;

  /**
   * 대회를 생성할 수 있다.
   */
  createCompetition(
    actor: Actor,
    name: string,
    description: string
  ): Promise<Competition>;

  /**
   * 대회 이름/설명을 수정할 수 있다.
   */
  updateCompetition(
    actor: Actor,
    competitionId: string,
    data: {
      name?: string;
      description?: string;
    }
  ): Promise<Competition>;

  /**
   * 대회를 삭제할 수 있다.
   */
  deleteCompetition(actor: Actor, competitionId: string): Promise<void>;

  /**
   * 특정 대회 부문을 생성할 수 있다.
   */
  createDivision(
    actor: Actor,
    competitionId: string,
    name: string,
    description: string
  ): Promise<Division>;

  /**
   * 특정 대회 부문의 이름/설명을 수정할 수 있다.
   */
  updateDivision(
    actor: Actor,
    divisionId: string,
    data: {
      name?: string;
      description?: string;
    }
  ): Promise<Division>;

  /**
   * 특정 경연 부문의 상태 정보를 설정할 수 있다.
   */
  setDivisionStatus(
    actor: Actor,
    divisionId: string,
    status: Division["status"]
  ): Promise<Division>;

  /**
   * 특정 경연 부문에 스톱워치(타이머)를 지정할 수 있다.
   */
  setDivisionStopwatch(
    actor: Actor,
    divisionId: string,
    stopwatchId: string | null
  ): Promise<Division>;

  /**
   * 특정 경연 부문을 삭제할 수 있다.
   */
  deleteDivision(actor: Actor, divisionId: string): Promise<void>;

  // -----------------------------
  // Observable 구독 관련 메서드들
  // -----------------------------
  /**
   * 특정 대회의 변경 이벤트를 구독할 수 있다.
   */
  subscribeCompetitionUpdated(
    competitionId: string,
    callback: (competition: Competition) => Promise<void>
  ): Unsubscriber;

  /**
   * 특정 대회 부문의 변경 이벤트를 구독할 수 있다.
   */
  subscribeDivisionUpdated(
    divisionId: string,
    callback: (division: Division) => Promise<void>
  ): Unsubscriber;
}

/**
 * 참가자 관련 서비스 레이어
 */
export interface ParticipantService {
  /**
   * 참가자를 특정 대회 부문에 추가할 수 있다.
   */
  addParticipant(
    actorId: string,
    divisionId: string,
    name: string,
    teamName: string,
    robotName: string,
    comment: string,
    orderRaw: number,
    givenTime: number
  ): Promise<Participant>;

  /**
   * 특정 부문의 모든 참가자를 조회할 수 있다.
   */
  getParticipants(actorId: string, divisionId: string): Promise<Participant[]>;

  /**
   * 특정 참가자의 이름, 팀명, 로봇명, 하고 싶은 말, 경연 순번, 주어진 시간을 수정할 수 있다.
   */
  updateParticipant(
    actorId: string,
    participantId: string,
    data: {
      name?: string;
      teamName?: string;
      robotName?: string;
      comment?: string;
      orderRaw?: number;
      givenTime?: number;
    }
  ): Promise<Participant>;

  /**
   * 특정 참가자를 삭제할 수 있다.
   */
  deleteParticipant(actorId: string, participantId: string): Promise<void>;

  // -----------------------------
  // Observable 구독 관련 메서드들
  // -----------------------------
  /**
   * 특정 참가자의 변경 이벤트를 구독할 수 있다.
   */
  subscribeParticipantUpdated(
    participantId: string,
    callback: (participant: Participant) => void
  ): Unsubscriber;
}

/**
 * 참가자 경연 타이머 관련 서비스 레이어
 */
export interface TimerLogService {
  /**
   * 특정 참가자의 경연 타이머를 시작할 수 있다. 현재 시각을 기준으로 타이머가 시작된다.
   */
  startTimer(actorId: string, participantId: string): Promise<TimerLog>;

  /**
   * 특정 참가자의 경연 타이머를 중지할 수 있다. 현재 시각을 기준으로 타이머가 중지된다.
   */
  stopTimer(actorId: string, participantId: string): Promise<void>;

  /**
   * 특정 참가자의 타이머 기록을 조회할 수 있다.
   */
  getTimerLogs(actorId: string, participantId: string): Promise<TimerLog[]>;

  // -----------------------------
  // Observable 구독 관련 메서드들
  // -----------------------------
  /**
   * 특정 참가자의 남은 경연 시간 타이머 변경 이벤트를 구독할 수 있다.
   */
  subscribeTimerLogsChanged(
    participantId: string,
    callback: (timerLogs: TimerLog[]) => void
  ): Unsubscriber;
}

/**
 * 참가자 기록 관련 서비스 레이어
 */
export interface RecordService {
  /**
   * 특정 참가자의 대회 기록을 조회할 수 있다.
   */
  getRecords(actorId: string, participantId: string): Promise<Record[]>;

  /**
   * 특정 참가자에 대회 기록을 추가할 수 있다.
   */
  addRecord(
    actorId: string,
    participantId: string,
    value: number,
    source: Record["source"],
    note?: string
  ): Promise<Record>;

  /**
   * 특정 참가자의 대회 기록에 비고란을 수정할 수 있다.
   */
  setRecordNote(
    actorId: string,
    recordId: string,
    note: string
  ): Promise<Record>;

  /**
   * 특정 참가자의 대회 기록의 상태(승인/거절)를 변경할 수 있다.
   */
  setRecordStatus(
    actorId: string,
    recordId: string,
    status: Record["status"]
  ): Promise<Record>;

  /**
   * 특정 부문의 상위 대회 기록을 조회할 수 있다.
   */
  getTopRecordsByDivision(
    actorId: string,
    divisionId: string
  ): Promise<Record[]>;

  // -----------------------------
  // Observable 구독 관련 메서드들
  // -----------------------------
  /**
   * 특정 참가자의 대회 기록 추가 이벤트를 구독할 수 있다.
   */
  subscribeRecordAdded(
    participantId: string,
    callback: (record: Record) => void
  ): Unsubscriber;

  /**
   * 특정 경연에서 경연자들의 최고 기록이 갱신됐을 때 구독할 수 있다.
   */
  subscribeTopRecordsUpdated(
    divisionId: string,
    callback: (records: Record[]) => void
  ): Unsubscriber;
}

export interface ManualRecordService {
  /**
   * 특정 참가자에 대한 수동 계수 기록을 조회할 수 있다.
   */
  getManualRecords(
    actorId: string,
    participantId: string
  ): Promise<ManualRecord[]>;

  /**
   * 특정 참가자에 대한 수동 계수 기록을 추가할 수 있다.
   */
  addManualRecord(
    actorId: string,
    participantId: string,
    value: number,
    recorderName: string
  ): Promise<ManualRecord>;

  /**
   * 특정 수동 계수 기록을 무효화할 수 있다.
   */
  invalidateManualRecord(
    actorId: string,
    manualRecordId: string
  ): Promise<ManualRecord>;

  // -----------------------------
  // Observable 구독 관련 메서드들
  // -----------------------------
  /**
   * 특정 참가자에 대한 수동 계수 기록 추가 이벤트를 구독할 수 있다.
   */
  subscribeManualRecordAdded(
    participantId: string,
    callback: (manualRecord: ManualRecord) => void
  ): Unsubscriber;
}

export interface StopwatchService {
  /**
   * 새로운 스톱워치를 추가한다. 토큰이 함께 반환되는데, 이는 계수기 H/W이 서버와 통신할 때 사용된다.
   */
  addStopwatch(
    actorId: string,
    name: string
  ): Promise<{
    stopwatch: Stopwatch;
    token: string;
  }>;

  /**
   * 스톱워치를 조회할 수 있다.
   */
  getStopwatch(actorId: string, stopwatchId: string): Promise<Stopwatch>;

  /**
   * 생성된 모든 스톱워치를 조회할 수 있다.
   */
  getStopwatches(actorId: string): Promise<Stopwatch[]>;

  /**
   * 스톱워치를 리셋한다.
   */
  resetStopwatch(actorId: string, stopwatchId: string): Promise<Stopwatch>;

  /**
   * 스톱워치를 삭제한다.
   */
  deleteStopwatch(actorId: string, stopwatchId: string): Promise<void>;

  /**
   * 스톱워치를 시작한다.
   */
  startStopwatch(
    actorId: string,
    stopwatchId: string,
    startedAt: Date
  ): Promise<Stopwatch>;

  /**
   * 스톱워치를 중지한다.
   */
  stopStopwatch(
    actorId: string,
    stopwatchId: string,
    stoppedAt: Date
  ): Promise<Stopwatch>;

  // -----------------------------
  // Observable 구독 관련 메서드들
  // -----------------------------
  /**
   * 특정 스톱워치의 갱신 이벤트를 구독할 수 있다.
   */
  subscribeStopwatchUpdated(
    stopwatchId: string,
    callback: (stopwatch: Stopwatch) => void
  ): Unsubscriber;
}

export interface ProgressService {
  /**
   * 특정 대회 부문의 진행 상태를 조회할 수 있다.
   */
  getProgress(actorId: string, divisionId: string): Promise<Progress>;

  /**
   * 특정 경연자를 현재 경연자로 지정할 수 있다.
   */
  setRunner(
    actorId: string,
    divisionId: string,
    participantId: string
  ): Promise<Progress>;

  // -----------------------------
  // Observable 구독 관련 메서드들
  // -----------------------------
  /**
   * 특정 대회 부문의 진행 상태 변경을 구독할 수 있다.
   */
  subscribeProgressUpdated(
    divisionId: string,
    callback: (progress: Progress) => void
  ): Unsubscriber;
}
