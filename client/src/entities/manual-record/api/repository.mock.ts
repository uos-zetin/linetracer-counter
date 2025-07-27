import type { ManualRecord } from "../model/types";
import type { ManualRecordRepository } from "./types";

export class MockManualRecordRepository implements ManualRecordRepository {
  private manualRecords: Map<string, ManualRecord[]> = new Map();
  private recordStore: Map<string, ManualRecord> = new Map();
  private nextId = 1;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    const mockData = [
      // participant-1의 수동 기록들
      {
        participantId: "participant-1",
        records: [
          {
            id: "manual-record-1",
            participantId: "participant-1",
            value: 180000, // 3분
            recorderName: "박심판",
            invalidatedAt: null,
            createdAt: new Date("2024-01-15T10:05:00Z"),
          },
          {
            id: "manual-record-2",
            participantId: "participant-1",
            value: 175000, // 2분 55초
            recorderName: "이기록원",
            invalidatedAt: null,
            createdAt: new Date("2024-01-15T10:20:00Z"),
          },
        ],
      },
      // participant-2의 수동 기록들
      {
        participantId: "participant-2",
        records: [
          {
            id: "manual-record-3",
            participantId: "participant-2",
            value: 142000, // 2분 22초
            recorderName: "박심판",
            invalidatedAt: null,
            createdAt: new Date("2024-01-15T10:10:00Z"),
          },
          {
            id: "manual-record-4",
            participantId: "participant-2",
            value: 138000, // 2분 18초 (무효화된 기록)
            recorderName: "최운영진",
            invalidatedAt: new Date("2024-01-15T10:25:00Z"),
            createdAt: new Date("2024-01-15T10:12:00Z"),
          },
        ],
      },
      // participant-3의 수동 기록들
      {
        participantId: "participant-3",
        records: [
          {
            id: "manual-record-5",
            participantId: "participant-3",
            value: 208000, // 3분 28초
            recorderName: "이기록원",
            invalidatedAt: null,
            createdAt: new Date("2024-01-15T10:15:00Z"),
          },
        ],
      },
      // participant-4의 수동 기록들
      {
        participantId: "participant-4",
        records: [
          {
            id: "manual-record-6",
            participantId: "participant-4",
            value: 195000, // 3분 15초
            recorderName: "정기록자",
            invalidatedAt: null,
            createdAt: new Date("2024-01-15T11:05:00Z"),
          },
          {
            id: "manual-record-7",
            participantId: "participant-4",
            value: 188000, // 3분 8초
            recorderName: "박심판",
            invalidatedAt: null,
            createdAt: new Date("2024-01-15T11:30:00Z"),
          },
        ],
      },
      // participant-5의 수동 기록들
      {
        participantId: "participant-5",
        records: [
          {
            id: "manual-record-8",
            participantId: "participant-5",
            value: 158000, // 2분 38초
            recorderName: "최운영진",
            invalidatedAt: null,
            createdAt: new Date("2024-01-15T11:15:00Z"),
          },
        ],
      },
    ];

    mockData.forEach(({ participantId, records }) => {
      this.manualRecords.set(participantId, records);
      records.forEach(record => {
        this.recordStore.set(record.id, record);
      });
    });

    this.nextId = 9;
  }

  async getAllManualRecords(participantId: string): Promise<ManualRecord[]> {
    await this.simulateDelay(100);
    
    const records = this.manualRecords.get(participantId) || [];
    return [...records]
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createManualRecord(
    participantId: string,
    manualRecordData: Pick<ManualRecord, "value" | "recorderName">
  ): Promise<ManualRecord> {
    await this.simulateDelay(150);

    const newRecord: ManualRecord = {
      id: `manual-record-${this.nextId++}`,
      participantId,
      ...manualRecordData,
      invalidatedAt: null,
      createdAt: new Date(),
    };

    // 기존 기록들에 추가
    const existingRecords = this.manualRecords.get(participantId) || [];
    const updatedRecords = [...existingRecords, newRecord];
    this.manualRecords.set(participantId, updatedRecords);

    // 전체 저장소에도 추가
    this.recordStore.set(newRecord.id, newRecord);

    return { ...newRecord };
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public resetMockData(): void {
    this.manualRecords.clear();
    this.recordStore.clear();
    this.nextId = 1;
    this.initializeMockData();
  }

  public addTestManualRecord(participantId: string, record: ManualRecord): void {
    const existingRecords = this.manualRecords.get(participantId) || [];
    existingRecords.push(record);
    this.manualRecords.set(participantId, existingRecords);
    this.recordStore.set(record.id, record);
  }

  public getStoredManualRecord(recordId: string): ManualRecord | undefined {
    return this.recordStore.get(recordId);
  }

  public getManualRecordsByRecorder(recorderName: string): ManualRecord[] {
    return Array.from(this.recordStore.values())
      .filter(record => record.recorderName === recorderName)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  public getValidManualRecords(participantId: string): ManualRecord[] {
    const records = this.manualRecords.get(participantId) || [];
    return records
      .filter(record => record.invalidatedAt === null)
      .sort((a, b) => a.value - b.value); // 시간 순으로 정렬
  }

  public getInvalidatedManualRecords(participantId: string): ManualRecord[] {
    const records = this.manualRecords.get(participantId) || [];
    return records
      .filter(record => record.invalidatedAt !== null)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  public invalidateManualRecord(recordId: string): boolean {
    const record = this.recordStore.get(recordId);
    if (!record || record.invalidatedAt !== null) {
      return false;
    }

    const invalidatedRecord: ManualRecord = {
      ...record,
      invalidatedAt: new Date(),
    };

    // 전체 저장소 업데이트
    this.recordStore.set(recordId, invalidatedRecord);

    // 참가자별 저장소 업데이트
    const participantRecords = this.manualRecords.get(record.participantId);
    if (participantRecords) {
      const index = participantRecords.findIndex(r => r.id === recordId);
      if (index !== -1) {
        participantRecords[index] = invalidatedRecord;
      }
    }

    return true;
  }

  public restoreManualRecord(recordId: string): boolean {
    const record = this.recordStore.get(recordId);
    if (!record || record.invalidatedAt === null) {
      return false;
    }

    const restoredRecord: ManualRecord = {
      ...record,
      invalidatedAt: null,
    };

    // 전체 저장소 업데이트
    this.recordStore.set(recordId, restoredRecord);

    // 참가자별 저장소 업데이트
    const participantRecords = this.manualRecords.get(record.participantId);
    if (participantRecords) {
      const index = participantRecords.findIndex(r => r.id === recordId);
      if (index !== -1) {
        participantRecords[index] = restoredRecord;
      }
    }

    return true;
  }

  public getTotalRecordCount(): number {
    return this.recordStore.size;
  }

  public getRecordCountByParticipant(participantId: string): number {
    const records = this.manualRecords.get(participantId) || [];
    return records.length;
  }

  public getValidRecordCountByParticipant(participantId: string): number {
    const records = this.manualRecords.get(participantId) || [];
    return records.filter(record => record.invalidatedAt === null).length;
  }
}