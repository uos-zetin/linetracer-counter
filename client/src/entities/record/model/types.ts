export interface Record {
  id: string;
  value: number;
  source: "stopwatch" | "manual" | "other";
  status: "pending" | "approved" | "rejected";
  note: string;
}

export interface ManualRecord {
  id: string;
  value: number;
  recorderName: string;
  invalidatedAt: Date | null;
}
