import type { Record } from "@/entities/record";

export interface AdminRecordService {
  // Store state updates
  loadAllRecords: () => Promise<void>;
  loadRecordsByParticipant: (participantId: string) => Promise<void>;
  loadRecordById: (id: string) => Promise<void>;
  createRecord: (data: Record) => Promise<void>;
  updateRecordNote: (id: string, note: string) => Promise<void>;
  updateRecordStatus: (id: string, status: Record["status"]) => Promise<void>;

  // Store 구독 메서드들
  useRecords: () => Record[];
  useRecordsByParticipant: (participantId: string) => Record[];
  useRecordById: (id: string) => Record | null;
}
