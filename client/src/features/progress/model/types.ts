import type { Competition } from "@/entities/competition";
import type { Division } from "@/entities/division";
import type { Participant } from "@/entities/participant";
import type { TimerLog } from "@/entities/timer";
import type { Record } from "@/entities/record";
import type { ManualRecord } from "@/entities/manual-record";

export interface Runner {
  participant: Participant;
  timerLogs: TimerLog[];
  records: Record[];
  manualRecords: ManualRecord[];
}

export interface ProgressState {
  id: string;
  competition: Competition | null;
  division: Division | null;
  runner: Runner | null;
  nextRunners: Participant[];
  topRecords: Record[];
}

export interface ProgressActions {
  setProgress: (progress: ProgressState) => void;
  patchProgress: (partial: Partial<ProgressState>) => void;
  reset: () => void;
}

export interface ProgressGetters {
  getProgress: () => ProgressState;
  getCompetition: () => Competition | null;
  getDivision: () => Division | null;
  getRunner: () => Runner | null;
  getNextRunners: () => Participant[];
  getTopRecords: () => Record[];
}

export type ProgressStore = ProgressState & ProgressActions & ProgressGetters;

export interface ProgressService {
  connect: (divisionId: string) => void;
  disconnect: () => void;
  setProgress: (progress: ProgressState) => void;
  useProgress: () => ProgressState;
  useCompetition: () => Competition | null;
  useDivision: () => Division | null;
  useRunner: () => Runner | null;
  useNextRunners: () => Participant[];
  useTopRecords: () => Record[];
}
