import type { ManualRecord, ManualRecordForm } from "../model/types";

export interface ManualRecordDto {
  id: string;
  participantId: string;
  value: number;
  recorderName: string;
  createdAt: string;
}

export interface ManualRecordCreateDto {
  value: number;
  recorderName: string;
}

export interface ManualRecordRepository {
  getAllManualRecords(participantId: string): Promise<ManualRecord[]>;
  createManualRecord(participantId: string, manualRecord: ManualRecordForm): Promise<ManualRecord>;
  deleteManualRecords(participantId: string): Promise<void>;
}
