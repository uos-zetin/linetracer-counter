import type { Record } from "../model/types";

export interface RecordDto {
  id: string;
  participantId: string;
  value: number;
  source: "stopwatch" | "manual" | "other";
  status: "pending" | "approved" | "rejected";
  note: string;
  createdAt: string;
}

export interface RecordRepository {
  // Implement methods when api is ready
  getRecords(participantId: string): Promise<Record[]>;
}
