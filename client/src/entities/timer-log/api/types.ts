import type { TimerLog } from "../model/types";

export interface TimerLogDto {
  id: string;
  participantId: string;
  value: number;
  type: "start" | "stop" | "add" | "sub";
  createdAt: string;
}

export interface TimerLogRepository {
  // Implement methods when api is ready
  getTimerLogs(participantId: string): Promise<TimerLog[]>;
}
