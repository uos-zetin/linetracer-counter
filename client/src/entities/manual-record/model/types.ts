export interface ManualRecord {
  id: string;
  participantId: string;
  value: number;
  recorderName: string;
  invalidatedAt: Date | null;
  createdAt: Date;
}
