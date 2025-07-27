export interface Competition {
  id: string; // 대회 ID
  name: string; // 대회 이름
  description: string; // 대회 설명
  createdAt: Date; // 생성 시각
}

export interface Division {
  id: string; // 대회 부문 ID
  competitionId: string; // 대회 ID
  name: string; // 대회 부문 이름
  timeLimit: number; // 각 경연자에게 주어질 경연 제한 시간(ms)
  description: string; // 대회 부문 설명
  createdAt: Date; // 생성 시각
  /**
   * 대회 부문 상태
   * - "ready": 아직 대회 부문이 시작되지 않은 상태
   * - "ongoing": 대회 부문이 진행 중인 상태
   * - "closed": 대회 부문이 종료된 상태
   */
  status: "ready" | "ongoing" | "closed";
}

export interface Participant {
  id: string;
  divisionId: string; // 대회 부문 ID
  name: string; // 참가자 이름
  teamName: string; // 팀 이름
  robotName: string; // 로봇 이름
  comment: string; // 하고 싶은 말
  orderRaw: number; // 원본 경연 순번
  createdAt: Date; // 생성 시각
}

export interface Record {
  id: string;
  participantId: string; // 참가자 ID
  value: number; // 기록 값
  /**
   * 기록 출처
   * - "stopwatch": 계수기 H/W로부터 자동으로 기록된 값
   * - "manual": 수동 계수 기록에 의해 취합된 값
   * - "other": 기타 다른 방법으로 기록된 값
   */
  source: "stopwatch" | "manual" | "other";
  status: "pending" | "approved" | "rejected"; // 기록 인정 여부
  note: string; // 비고란
  createdAt: Date; // 생성일
}

export interface ManualRecord {
  id: string;
  participantId: string; // 참가자 ID
  value: number; // 기록 값
  recorderName: string; // 수동 계수자 이름
  createdAt: Date; // 생성일
}

export interface TimerLog {
  id: string;
  participantId: string; // 참가자 ID
  value: number;
  /**
   * 타이머 로그 타입
   * - "start": 타이머 시작, value는 시작 시각(unix timestamp)
   * - "stop": 타이머 정지, value는 정지 시각(unix timestamp)
   * - "adjust": 타이머 시간 조정, value는 조정된 시간(ms, 양수는 추가, 음수는 차감)
   */
  type: "start" | "stop" | "adjust";
  createdAt: Date;
}

export interface Counter {
  deviceId: string; // 계수기 ID
  name: string; // 계수기 이름
  startedAt: number | null; // 시작 시각(unix timestamp, null이면 아직 시작되지 않음을 의미함)
  stoppedAt: number | null; // 종료 시각(unix timestamp, null이면 아직 종료되지 않음을 의미함)
  divisionId: string | null; // 대회 부문 ID (null이면 아직 대회 부문에 연결되지 않음을 의미함)
}

export interface DivisionProgress {
  competition: Competition; // 대회 정보
  division: Division; // 대회 부문 정보

  runner: {
    participant: Participant; // 현재 경연자 정보
    timerLogs: TimerLog[]; // 현재 경연자의 타이머 로그 목록
    records: Record[]; // 현재 경연자의 기록 목록
    manualRecords: ManualRecord[]; // 현재 경연자의 수동 계수 기록 목록
  } | null;

  nextRunners: Participant[]; // 다음 경연자 정보(최대 5명까지, 순번에 대한 오름차순으로 정렬됨)
  topRecords: Record[]; // 참가자들의 최고 기록 목록
}

/**
 * - "administrator": 운영자/게수기 관리자
 * - "manualRecorder": 수동 계수자
 * - "stopwatchRecorder": 계수기(스톱워치)
 */
export type ActorRole =
  | "administrator"
  | "manualRecorder"
  | "stopwatchRecorder";

export interface Actor {
  id: string;
  name: string; // 액터 이름
  roles: ActorRole[]; // 액터 역할
  createdAt: Date; // 액터 생성 시각
}

export interface ActorIdPw {
  id: string;
  actorId: string; // 액터 ID
  username: string; // 로그인 시 사용하는 ID
  hashedPassword: string; // 해시된 비밀번호
  createdAt: Date;
}
