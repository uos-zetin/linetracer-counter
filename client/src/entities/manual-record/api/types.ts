import type { ManualRecord } from "../model/types";

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
  createManualRecord(participantId: string, manualRecord: ManualRecordCreateDto): Promise<ManualRecord>;
}
