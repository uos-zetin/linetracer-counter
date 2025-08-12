import type { Record, RecordStatus } from "@/entities/record";

export interface RecordService {
  // Load functions (공용)
  load: {
    allRecords: () => Promise<void>;
    byParticipant: (participantId: string) => Promise<Record[]>;
    topByDivision: (divisionId: string) => Promise<Record[]>;
  };

  // Admin functions (관리자 전용)
  admin: {
    create: (participantId: string, recordData: Pick<Record, "value" | "source" | "note">) => Promise<Record>;
    updateNote: (recordId: string, note: string) => Promise<Record>;
    updateStatus: (recordId: string, status: RecordStatus) => Promise<Record>;
  };

  // Filter functions (제어용)
  filter: {
    byParticipant: (participantId: string) => Record[];
    byStatus: (status: RecordStatus) => Record[];
  };

  // Subscription hooks (구독)
  use: {
    records: () => Record[];
    recordsByParticipant: (participantId: string) => Record[];
    recordById: (recordId: string) => Record | null;
  };
}
