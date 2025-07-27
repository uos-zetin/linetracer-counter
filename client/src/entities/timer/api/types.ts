import type { TimerLog } from "../model/types";

export interface TimerLogDto {
  id: string;
  participantId: string;
  value: number;
  type: "start" | "stop" | "adjust";
  createdAt: string;
}

export interface TimerRepository {
  getTimerLogs: (participantId: string) => Promise<TimerLog[]>;
  startTimer: (participantId: string) => Promise<TimerLog>;
  stopTimer: (participantId: string) => Promise<TimerLog>;
  adjustTimer: (participantId: string, value: number) => Promise<TimerLog>;
}
