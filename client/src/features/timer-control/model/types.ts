import type { TimerLog, TimerLogType } from "@/entities/timer";

export interface TimerControlService {
  // Load functions (데이터 조회)
  load: {
    logs: (participantId: string) => Promise<TimerLog[]>;
  };

  // Admin functions (타이머 제어)
  admin: {
    start: (participantId: string) => Promise<TimerLog>;
    stop: (participantId: string) => Promise<TimerLog>;
    adjust: (participantId: string, type: TimerLogType, value: number) => Promise<TimerLog>;
  };
}
