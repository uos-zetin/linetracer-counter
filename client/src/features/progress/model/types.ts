import type { Competition } from "@/entities/competition";
import type { Division } from "@/entities/division";
import type { ManualRecord } from "@/entities/manual-record";
import type { Participant } from "@/entities/participant";
import type { Record } from "@/entities/record";
import type { TimerLog } from "@/entities/timer";

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

export type ProgressStore = ProgressState & ProgressActions;

export interface ProgressService {
  // Load functions (데이터 조회)
  load: {
    byDivision: (divisionId: string) => Promise<ProgressState | null>;
    order: (divisionId: string) => Promise<string[]>;
  };

  // Admin functions (관리자 전용)
  admin: {
    postponeCurrentRunner: (divisionId: string) => Promise<void>;
    setCurrentRunner: (divisionId: string, participantId: string) => Promise<void>;
    changeOrder: (divisionId: string, participantId: string, order: number) => Promise<void>;
    openDivision: (divisionId: string) => Promise<void>;
    closeDivision: (divisionId: string) => Promise<void>;
    resetDivision: (divisionId: string) => Promise<void>;
    addManualRecord: (participantId: string, value: number, recorderName: string) => Promise<void>;
  };

  // Real-time connection functions (실시간 연결)
  connection: {
    connect: (divisionId: string) => Promise<void>;
    disconnect: () => Promise<void>;
  };

  // Local state functions (로컬 상태 조작)
  local: {
    setProgress: (progress: ProgressState) => void;
  };

  // Subscription hooks (구독)
  use: {
    progress: () => ProgressState;
    competition: () => Competition | null;
    division: () => Division | null;
    runner: () => Runner | null;
    nextRunners: () => Participant[];
    topRecords: () => Record[];
    currentRunnerManualRecords: () => ManualRecord[];
  };
}
