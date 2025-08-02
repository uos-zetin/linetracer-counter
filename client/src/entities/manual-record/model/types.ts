export interface ManualRecord {
  id: string;
  participantId: string;
  value: number;
  recorderName: string;
  createdAt: Date;
}

export interface ManualRecordForm {
  value: number;
  recorderName: string;
}
