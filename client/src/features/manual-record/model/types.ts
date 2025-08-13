import type { ManualRecord, ManualRecordForm } from "@/entities/manual-record";

export interface ManualRecordService {
  // Load functions (데이터 조회)
  load: {
    byParticipant: (participantId: string) => Promise<ManualRecord[]>;
  };

  // Admin functions (수동 기록 관리)
  admin: {
    create: (participantId: string, form: ManualRecordForm) => Promise<ManualRecord>;
  };
}
