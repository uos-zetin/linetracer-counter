export type RecordSource = "stopwatch" | "manual" | "other";
export type RecordStatus = "pending" | "approved" | "rejected";

export interface Record {
  id: string;
  participantId: string;
  value: number;
  source: RecordSource;
  status: RecordStatus;
  note: string;
  createdAt: Date;
}

export interface RecordForm {
  value: number;
  source: RecordSource;
  note: string;
}

export interface RecordActions {
  init: (records: Record[]) => void;
  add: (record: Record) => void;
  addMany: (records: Record[]) => void;
  update: (record: Record) => void;
  remove: (recordId: string) => void;
}

export interface RecordStore extends RecordActions {
  records: Record[];
}
