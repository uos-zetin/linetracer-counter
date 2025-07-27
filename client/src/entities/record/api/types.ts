import type { Record, RecordStatus } from "../model/types";

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
  getAllRecords(participantId: string): Promise<Record[]>;
  getRecordById(recordId: string): Promise<Record | null>;
  getTopRecords(divisionId: string): Promise<Record[]>;
  createRecord(participantId: string, record: Pick<Record, "value" | "source" | "note">): Promise<Record>;
  updateRecordNote(recordId: string, note: string): Promise<Record>;
  updateRecordStatus(recordId: string, status: RecordStatus): Promise<Record>;
}
