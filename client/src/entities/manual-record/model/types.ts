export type ManualRecord = {
  id: string;
  participantId: string;
  value: number;
  recorderName: string;
  createdAt: Date;
};

export type ManualRecordForm = Pick<ManualRecord, "value" | "recorderName">;
