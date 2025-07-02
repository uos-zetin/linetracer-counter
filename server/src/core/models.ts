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
  description: string; // 대회 부문 설명
  createdAt: Date; // 생성 시각
  /**
   * 대회 부문 상태
   * - "ready": 아직 대회 부문이 시작되지 않은 상태
   * - "ongoing": 대회 부문이 진행 중인 상태
   * - "closed": 대회 부문이 종료된 상태
   */
  status: "ready" | "ongoing" | "closed";
  stopwatchId: string | null; // 스톱워치(계수기) ID
}

export interface Participant {
  id: string;
  divisionId: string; // 대회 부문 ID
  name: string; // 참가자 이름
  teamName: string; // 팀 이름
  robotName: string; // 로봇 이름
  comment: string; // 하고 싶은 말
  orderRaw: number; // 원본 경연 순번
  givenTime: number; // 주어진 시간(ms)
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
  invalidatedAt: Date | null; // 무효화된(사용 또는 무시를 의미함) 시각
}

export interface TimerLog {
  id: string;
  participantId: string; // 참가자 ID
  startedAt: number; // 시작 시각(unix timestamp)
  stoppedAt: number | null; // 종료 시각(unix timestamp, null이면 아직 종료되지 않음을 의미함)
}

export interface Stopwatch {
  id: string; // 계수기 ID
  name: string; // 계수기 이름
  startedAt: number | null; // 시작 시각(unix timestamp, null이면 아직 시작되지 않음을 의미함)
  stoppedAt: number | null; // 종료 시각(unix timestamp, null이면 아직 종료되지 않음을 의미함)
}

/**
 * Progress(대회 부문 진행 상태)
 *
 * - 하나의 대회 부문에 하나의 Progress가 존재한다.
 * - 대회 부문이 시작되면(ongoing) Progres가 생성된다.
 * - 대회 부문이 진행되는 동안, 필요한 모든 상태 정보를 포함한다.
 * - 해당 모델의 상태가 변경되면, 실시간으로 전파할 수 있도록 한다.
 */
export interface Progress {
  id: string;

  competition: Competition; // 대회 정보
  division: Division; // 부문 정보
  stopwatch: Stopwatch | null; // 계수기(스톱워치) 정보

  runner: {
    participant: Participant; // 현재 경연자 정보
    timerLogs: TimerLog[]; // 현재 경연자의 타이머 로그 목록
    records: Record[]; // 현재 경연자의 기록 목록
    manualRecords: ManualRecord[]; // 현재 경연자의 수동 계수 기록 목록
  } | null;

  nextRunners: Participant[]; // 다음 경연자 정보(최대 5명까지, 순번에 대한 오름차순으로 정렬됨)
  topRecords: Record[]; // 참가자들의 최고 기록 목록
}
