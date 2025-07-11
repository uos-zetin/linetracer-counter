import type { Competition } from "@/entities/competition";
import type { Division } from "@/entities/division";
import type { Participant } from "@/entities/participant";
import type { TimerLog } from "@/entities/timer-log";
import type { Record } from "@/entities/record";
import type { ManualRecord } from "@/entities/manual-record";

export interface Runner {
  participant: Participant;
  timerLogs: TimerLog[];
  records: Record[];
  manualRecords: ManualRecord[];
}

export interface Progress {
  id: string;
  competition: Competition;
  division: Division;
  runner: Runner | null;
  nextRunners: Participant[];
  topRecords: Record[];
}

export interface ProgressActions {
  setProgress: (progress: Progress) => void;
  patchProgress: (partial: Partial<Progress>) => void;
  reset: () => void;
}

export interface ProgressSelectors {
  useProgress: () => Progress | null;
  useRunner: () => Runner | null;
}

export type ProgressStore = ProgressActions & ProgressSelectors;
