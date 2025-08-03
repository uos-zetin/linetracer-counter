import type { TimerLogType } from "@/entities/timer";

export interface TimerControlService {
  startTimer: (participantId: string) => Promise<void>;
  stopTimer: (participantId: string) => Promise<void>;
  adjustTimer: (participantId: string, type: TimerLogType, value: number) => Promise<void>;
  getTimerLogs: (participantId: string) => Promise<void>;
}
