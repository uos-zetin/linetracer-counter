import type { CompetitionDto } from "@/entities/competition";
import type { DivisionDto } from "@/entities/division";
import type { ManualRecordDto } from "@/entities/manual-record";
import type { ParticipantDto } from "@/entities/participant";
import type { RecordDto } from "@/entities/record";
import type { TimerLogDto } from "@/entities/timer";
import type { ProgressState } from "../model/types";

interface RunnerDto {
  participant: ParticipantDto;
  timerLogs: TimerLogDto[];
  records: RecordDto[];
  manualRecords: ManualRecordDto[];
}

export interface ProgressDto {
  id: string;
  competition: CompetitionDto | null;
  division: DivisionDto | null;
  runner: RunnerDto | null;
  nextRunners: ParticipantDto[];
  topRecords: RecordDto[];
}

export interface ProgressRepository {
  getProgress: (divisionId: string) => Promise<ProgressState | null>;
  openProgressDivision: (divisionId: string) => Promise<void>;
  closeProgressDivision: (divisionId: string) => Promise<void>;
  resetProgressDivision: (divisionId: string) => Promise<void>;
  setCurrentRunner: (divisionId: string, participantId: string) => Promise<void>;
  postponeCurrentRunner: (divisionId: string) => Promise<void>;
  getOrder: (divisionId: string) => Promise<string[]>;
  changeOrder: (divisionId: string, participantId: string, order: number) => Promise<void>;
}

export interface ProgressChannel {
  connect: (divisionId: string) => void;
  disconnect: () => void;
  subscribe: (callback: (progress: ProgressState) => void) => () => void;
}
