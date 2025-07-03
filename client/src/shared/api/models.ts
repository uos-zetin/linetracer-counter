export interface CompetitionDto {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

export interface DivisionDto {
  id: string;
  competitionId: string;
  name: string;
  description: string;
  createdAt: Date;
  status: "ready" | "ongoing" | "closed";
  stopwatchId: string | null;
}

export interface ParticipantDto {
  id: string;
  divisionId: string;
  name: string;
  teamName: string;
  robotName: string;
  comment: string;
  orderRaw: number;
  givenTime: number;
  createdAt: Date;
}

export interface RecordDto {
  id: string;
  participantId: string;
  value: number;
  source: "stopwatch" | "manual" | "other";
  status: "pending" | "approved" | "rejected";
  note: string;
  createdAt: Date;
}

export interface ManualRecordDto {
  id: string;
  participantId: string;
  value: number;
  recorderName: string;
  createdAt: Date;
  invalidatedAt: Date | null;
}

export interface TimerLogDto {
  id: string;
  participantId: string;
  value: number;
  type: "start" | "stop" | "add" | "sub";
  createdAt: Date;
}

export interface StopwatchDto {
  id: string;
  name: string;
  startedAt: number | null;
  stoppedAt: number | null;
}

export interface ProgressDto {
  id: string;

  competition: CompetitionDto;
  division: DivisionDto;
  stopwatch: StopwatchDto | null;

  runner: {
    participant: ParticipantDto;
    timerLogs: TimerLogDto[];
    records: RecordDto[];
    manualRecords: ManualRecordDto[];
  } | null;

  nextRunners: ParticipantDto[];
  topRecords: RecordDto[];
}

export type ActorRole = "administrator" | "manualRecorder" | "stopwatchRecorder";

export interface Actor {
  id: string;
  name: string;
  roles: ActorRole[];
  createdAt: Date;
}

export interface ActorIdPw {
  id: string;
  actorId: string;
  username: string;
  hashedPassword: string;
  createdAt: Date;
}
