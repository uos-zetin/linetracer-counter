import type { BaseEntityActions } from "@/shared/lib";

export type RecordSource = "stopwatch" | "manual" | "other";
export type RecordStatus = "pending" | "approved" | "rejected";

export type Record = {
  id: string;
  participantId: string;
  value: number;
  source: RecordSource;
  status: RecordStatus;
  note: string;
  createdAt: Date;
};

export type RecordForm = Pick<Record, "value" | "source" | "note">;

export interface RecordActions extends BaseEntityActions<Record> {
  addMany: (records: Record[]) => void;
}

export interface RecordStore extends RecordActions {
  records: Record[];
}
