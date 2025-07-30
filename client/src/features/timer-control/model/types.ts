export interface TimerControlService {
  startTimer: (participantId: string) => Promise<void>;
  stopTimer: (participantId: string) => Promise<void>;
  adjustTimer: (participantId: string, value: number) => Promise<void>;
  getTimerLogs: (participantId: string) => Promise<void>;
}