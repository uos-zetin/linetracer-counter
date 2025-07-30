import type { Record, RecordStatus } from "@/entities/record";

export interface RecordControlService {
  getAllRecords: (participantId: string) => Promise<Record[]>;
  getRecordById: (recordId: string) => Promise<Record | null>;
  getTopRecords: (divisionId: string) => Promise<Record[]>;
  createRecord: (participantId: string, record: Pick<Record, "value" | "source" | "note">) => Promise<Record>;
  updateRecordNote: (recordId: string, note: string) => Promise<Record>;
  updateRecordStatus: (recordId: string, status: RecordStatus) => Promise<Record>;
  useRecords: () => Record[];
  useRecordById: (recordId: string) => Record | undefined;
  getRecordsByParticipant: (participantId: string) => Record[];
  getRecordsByStatus: (status: RecordStatus) => Record[];
}