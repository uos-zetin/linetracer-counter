export type RecordSource = "stopwatch" | "manual" | "other";
export type RecordStatus = "pending" | "approved" | "rejected";

export interface Record {
  id: string;
  participantId: string;
  value: number;
  source: RecordSource;
  status: RecordStatus;
  note: string;
  createdAt: Date;
}
