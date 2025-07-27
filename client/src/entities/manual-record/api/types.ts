import type { ManualRecord } from "../model/types";

export interface ManualRecordDto {
  id: string;
  participantId: string;
  value: number;
  recorderName: string;
  createdAt: string;
  invalidatedAt: string | null;
}

export interface ManualRecordRepository {
  getAllManualRecords(participantId: string): Promise<ManualRecord[]>;
  createManualRecord(
    participantId: string,
    manualRecord: Pick<ManualRecord, "value" | "recorderName">,
  ): Promise<ManualRecord>;
}
