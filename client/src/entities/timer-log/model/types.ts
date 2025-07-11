export interface TimerLog {
  id: string;
  participantId: string;
  value: number;
  type: "start" | "stop" | "add" | "sub";
  createdAt: Date;
}
