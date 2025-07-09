export interface TimerLog {
  id: string;
  participantTd: string;
  value: number;
  type: "start" | "stop" | "add" | "sub";
  createdAt: Date;
}
