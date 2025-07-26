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

export interface ProgressRepository {}

export interface ProgressChannel {
  connect: (divisionId: string) => void;
  disconnect: () => void;
  subscribe: (callback: (progress: ProgressState) => void) => () => void;
}
