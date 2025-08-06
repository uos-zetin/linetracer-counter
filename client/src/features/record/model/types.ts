import type { Record } from "@/entities/record";

export interface RecordService {
  // 조회 기능 (공용)
  loadAllRecords: () => Promise<void>;
  loadRecordsByParticipant: (participantId: string) => Promise<void>;
  loadTopRecordsByDivision: (divisionId: string) => Promise<void>;
  useRecords: () => Record[];
  useRecordsByParticipant: (participantId: string) => Record[];
  useTopRecordsByDivision: (divisionId: string) => Record[];
  useRecordById: (id: string) => Record | null;

  // 관리 기능 (admin 전용, authFetcher에서 인증 확인)
  createRecord: (data: Record) => Promise<void>;
  updateRecordNote: (id: string, note: string) => Promise<void>;
  updateRecordStatus: (id: string, status: Record["status"]) => Promise<void>;
}
