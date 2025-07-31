import type { Record, RecordForm, RecordStatus } from "../model/types";

export type RecordSourceDto = "stopwatch" | "manual" | "other";
export type RecordStatusDto = "pending" | "approved" | "rejected";

export interface RecordDto {
  id: string;
  participantId: string;
  value: number;
  source: RecordSourceDto;
  status: RecordStatusDto;
  note: string;
  createdAt: string;
}

export interface RecordCreateDto {
  value: number;
  source: RecordSourceDto;
  note: string;
}

export interface RecordRepository {
  getAllRecords(participantId: string): Promise<Record[]>;
  getTopRecords(divisionId: string): Promise<Record[]>;
  createRecord(participantId: string, record: RecordForm): Promise<Record>;
  updateRecordNote(recordId: string, note: string): Promise<Record>;
  updateRecordStatus(recordId: string, status: RecordStatus): Promise<Record>;
}
