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
  // Implement methods when api is ready
  postManualRecord(manualRecord: ManualRecord): Promise<ManualRecord>;
}
