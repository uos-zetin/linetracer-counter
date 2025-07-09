export interface Record {
  id: string;
  participantId: string;
  value: number;
  source: "stopwatch" | "manual" | "other";
  status: "pending" | "approved" | "rejected";
  note: string;
  createdAt: Date;
}
