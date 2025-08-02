import type { ManualRecord, ManualRecordForm } from "@/entities/manual-record";

export interface ManualRecordService {
  // Manual record 전송
  createManualRecord: (participantId: string, form: ManualRecordForm) => Promise<ManualRecord>;
}
