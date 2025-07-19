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
    actor: Actor,
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
  getParticipants(actor: Actor, divisionId: string): Promise<Participant[]>;

  /**
   * 특정 참가자의 이름, 팀명, 로봇명, 하고 싶은 말, 경연 순번, 주어진 시간을 수정할 수 있다.
   */
  updateParticipant(
    actor: Actor,
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
  deleteParticipant(actor: Actor, participantId: string): Promise<void>;

  // -----------------------------
  // Observable 구독 관련 메서드들
  // -----------------------------
  /**
   * 특정 참가자의 변경 이벤트를 구독할 수 있다.
   */
  subscribeParticipantUpdated(
    participantId: string,
    callback: (participant: Participant) => Promise<void>
  ): Unsubscriber;
}

/**
 * 참가자 경연 타이머 관련 서비스 레이어
 */
export interface TimerLogService {
  /**
   * 특정 참가자의 경연 타이머를 시작할 수 있다. 현재 시각을 기준으로 타이머가 시작된다.
   */
  startTimer(actor: Actor, participantId: string): Promise<TimerLog>;

  /**
   * 특정 참가자의 경연 타이머를 중지할 수 있다. 현재 시각을 기준으로 타이머가 중지된다.
   */
  stopTimer(actor: Actor, participantId: string): Promise<TimerLog>;

  /**
   * 특정 참가자의 타이머 시간을 조정할 수 있다. 양수는 시간 추가, 음수는 시간 차감을 의미한다.
   */
  adjustTimer(
    actor: Actor,
    participantId: string,
    adjustmentMs: number
  ): Promise<TimerLog>;

  /**
   * 특정 참가자의 타이머 기록을 조회할 수 있다.
   */
  getTimerLogs(actor: Actor, participantId: string): Promise<TimerLog[]>;

  // -----------------------------
  // Observable 구독 관련 메서드들
  // -----------------------------
  /**
   * 특정 참가자에 대한 타이머 기록 추가 이벤트를 구독할 수 있다.
   */
  subscribeTimerLogsChanged(
    participantId: string,
    callback: (timerLog: TimerLog) => Promise<void>
  ): Unsubscriber;
}

/**
 * 참가자 기록 관련 서비스 레이어
 */
export interface RecordService {
  /**
   * 특정 참가자의 대회 기록을 조회할 수 있다.
   */
  getRecords(actor: Actor, participantId: string): Promise<Record[]>;

  /**
   * 특정 참가자에 대회 기록을 추가할 수 있다.
   */
  addRecord(
    actor: Actor,
    participantId: string,
    value: number,
    source: Record["source"],
    note: string
  ): Promise<Record>;

  /**
   * 특정 참가자의 대회 기록에 비고란을 수정할 수 있다.
   */
  setRecordNote(actor: Actor, recordId: string, note: string): Promise<Record>;

  /**
   * 특정 참가자의 대회 기록의 상태(승인/거절)를 변경할 수 있다.
   */
  setRecordStatus(
    actor: Actor,
    recordId: string,
    status: Record["status"]
  ): Promise<Record>;

  /**
   * 특정 부문의 상위 대회 기록을 조회할 수 있다.
   */
  getTopRecordsByDivision(actor: Actor, divisionId: string): Promise<Record[]>;

  // -----------------------------
  // Observable 구독 관련 메서드들
  // -----------------------------
  /**
   * 특정 참가자의 기록 상태(승인/거절)가 변경된 경우를 구독할 수 있다.
   * addRecord() 호출로 인한 기록 추가 또는 setRecordStatus() 호출로 인한 상태 변경 시에 이벤트가 발생한다.
   */
  subscribeRecordStatusChanged(
    participantId: string,
    callback: (record: Record) => Promise<void>
  ): Unsubscriber;
}

export interface ManualRecordService {
  /**
   * 특정 참가자에 대한 수동 계수 기록을 조회할 수 있다.
   */
  getManualRecords(
    actor: Actor,
    participantId: string
  ): Promise<ManualRecord[]>;

  /**
   * 특정 참가자에 대한 수동 계수 기록을 추가할 수 있다.
   */
  addManualRecord(
    actor: Actor,
    participantId: string,
    value: number,
    recorderName: string
  ): Promise<ManualRecord>;

  // -----------------------------
  // Observable 구독 관련 메서드들
  // -----------------------------
  /**
   * 특정 참가자에 대한 수동 계수 기록 추가 이벤트를 구독할 수 있다.
   */
  subscribeManualRecordAdded(
    participantId: string,
    callback: (manualRecord: ManualRecord) => Promise<void>
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

export interface ActorService {
  /**
   * 관리자는 모든 액터(사용자) 목록을 조회할 수 있다.
   */
  getActors(actor: Actor): Promise<Actor[]>;

  /**
   * 관리자는 사용자에 역할을 설정할 수 있다.
   */
  setActorRoles(
    actor: Actor,
    targetActorId: string,
    roles: Actor["roles"]
  ): Promise<Actor>;

  /**
   * ID, PW로 새로운 액터(사용자)를 등록할 수 있다.
   */
  registerWithIdPw(
    name: string,
    username: string,
    password: string
  ): Promise<Actor>;

  /**
   * ID가 존재하는지 확인할 수 있다.
   */
  checkIdPwExists(username: string): Promise<boolean>;

  /**
   * ID, PW로 액터(사용자)를 인증할 수 있다.
   */
  verifyIdPw(username: string, password: string): Promise<Actor>;

  /**
   * 관리자는 액터(사용자)를 등록 해제할 수 있다.
   */
  unregister(actor: Actor, targetActorId: string): Promise<void>;
}
