import type { TimerLog, TimerLogType } from "../model/types";

export type TimerLogTypeDto = "start" | "stop" | "adjust";

export interface TimerLogDto {
  id: string;
  participantId: string;
  value: number;
  type: TimerLogTypeDto;
  createdAt: string;
}

export interface TimerRepository {
  getTimerLogs: (participantId: string) => Promise<TimerLog[]>;
  startTimer: (participantId: string) => Promise<TimerLog>;
  stopTimer: (participantId: string) => Promise<TimerLog>;
  adjustTimer: (participantId: string, type: TimerLogType, value: number) => Promise<TimerLog>;
}
