import type { Record, RecordStatus } from "../model/types";
import type { RecordRepository } from "./types";

export class MockRecordRepository implements RecordRepository {
  private records: Map<string, Record> = new Map();
  private recordsByParticipant: Map<string, string[]> = new Map();
  private recordsByDivision: Map<string, string[]> = new Map();
  private nextId = 1;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    const mockRecords = [
      // participant-1의 기록들
      {
        participantId: "participant-1",
        divisionId: "division-1",
        records: [
          {
            id: "record-1",
            participantId: "participant-1",
            value: 180000, // 3분
            source: "stopwatch" as const,
            status: "approved" as const,
            note: "완주 성공",
            createdAt: new Date("2024-01-15T10:03:00Z"),
          },
          {
            id: "record-2",
            participantId: "participant-1",
            value: 175000, // 2분 55초
            source: "stopwatch" as const,
            status: "pending" as const,
            note: "재시도 기록",
            createdAt: new Date("2024-01-15T10:15:00Z"),
          },
        ],
      },
      // participant-2의 기록들
      {
        participantId: "participant-2",
        divisionId: "division-1",
        records: [
          {
            id: "record-3",
            participantId: "participant-2",
            value: 142000, // 2분 22초
            source: "stopwatch" as const,
            status: "approved" as const,
            note: "훌륭한 기록",
            createdAt: new Date("2024-01-15T10:07:22Z"),
          },
        ],
      },
      // participant-3의 기록들
      {
        participantId: "participant-3",
        divisionId: "division-1",
        records: [
          {
            id: "record-4",
            participantId: "participant-3",
            value: 208000, // 3분 28초
            source: "stopwatch" as const,
            status: "approved" as const,
            note: "안정적인 완주",
            createdAt: new Date("2024-01-15T10:13:28Z"),
          },
          {
            id: "record-5",
            participantId: "participant-3",
            value: 165000, // 2분 45초
            source: "manual" as const,
            status: "pending" as const,
            note: "수동 입력 기록",
            createdAt: new Date("2024-01-15T10:25:00Z"),
          },
        ],
      },
      // participant-4의 기록들 (division-2)
      {
        participantId: "participant-4",
        divisionId: "division-2",
        records: [
          {
            id: "record-6",
            participantId: "participant-4",
            value: 195000, // 3분 15초
            source: "stopwatch" as const,
            status: "approved" as const,
            note: "중등부 우수 기록",
            createdAt: new Date("2024-01-15T11:00:00Z"),
          },
        ],
      },
      // participant-5의 기록들 (division-2)
      {
        participantId: "participant-5",
        divisionId: "division-2",
        records: [
          {
            id: "record-7",
            participantId: "participant-5",
            value: 158000, // 2분 38초
            source: "stopwatch" as const,
            status: "approved" as const,
            note: "AI 기술 활용 성공",
            createdAt: new Date("2024-01-15T11:10:00Z"),
          },
          {
            id: "record-8",
            participantId: "participant-5",
            value: 999999, // 실패 기록
            source: "other" as const,
            status: "rejected" as const,
            note: "미션 실패로 인한 기록 무효",
            createdAt: new Date("2024-01-15T11:25:00Z"),
          },
        ],
      },
    ];

    mockRecords.forEach(({ participantId, divisionId, records }) => {
      const participantRecordIds: string[] = [];
      
      records.forEach(record => {
        this.records.set(record.id, record);
        participantRecordIds.push(record.id);
        
        // 부문별 기록 저장
        const divisionRecords = this.recordsByDivision.get(divisionId) || [];
        divisionRecords.push(record.id);
        this.recordsByDivision.set(divisionId, divisionRecords);
      });
      
      this.recordsByParticipant.set(participantId, participantRecordIds);
    });

    this.nextId = 9;
  }

  async getAllRecords(participantId: string): Promise<Record[]> {
    await this.simulateDelay(100);
    
    const recordIds = this.recordsByParticipant.get(participantId) || [];
    const records = recordIds
      .map(id => this.records.get(id))
      .filter((record): record is Record => record !== undefined)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return records;
  }

  async getRecordById(recordId: string): Promise<Record | null> {
    await this.simulateDelay(50);
    
    const record = this.records.get(recordId);
    return record ? { ...record } : null;
  }

  async getTopRecords(divisionId: string): Promise<Record[]> {
    await this.simulateDelay(120);
    
    const recordIds = this.recordsByDivision.get(divisionId) || [];
    const records = recordIds
      .map(id => this.records.get(id))
      .filter((record): record is Record => record !== undefined)
      .filter(record => record.status === "approved")
      .sort((a, b) => a.value - b.value) // 시간 오름차순 (빠른 기록이 위에)
      .slice(0, 10); // 상위 10개만

    return records;
  }

  async createRecord(
    participantId: string,
    recordData: Pick<Record, "value" | "source" | "note">
  ): Promise<Record> {
    await this.simulateDelay(150);

    const newRecord: Record = {
      id: `record-${this.nextId++}`,
      participantId,
      ...recordData,
      status: "pending", // 새 기록은 기본적으로 대기 상태
      createdAt: new Date(),
    };

    this.records.set(newRecord.id, newRecord);

    // 참가자별 기록 추가
    const participantRecords = this.recordsByParticipant.get(participantId) || [];
    participantRecords.push(newRecord.id);
    this.recordsByParticipant.set(participantId, participantRecords);

    // 부문별 기록 추가 (참가자의 부문을 찾아야 함)
    // 여기서는 간단히 division-1로 가정
    const divisionRecords = this.recordsByDivision.get("division-1") || [];
    divisionRecords.push(newRecord.id);
    this.recordsByDivision.set("division-1", divisionRecords);

    return { ...newRecord };
  }

  async updateRecordNote(recordId: string, note: string): Promise<Record> {
    await this.simulateDelay(100);

    const record = this.records.get(recordId);
    if (!record) {
      throw new Error(`기록을 찾을 수 없습니다: ${recordId}`);
    }

    const updatedRecord: Record = {
      ...record,
      note,
    };

    this.records.set(recordId, updatedRecord);
    return { ...updatedRecord };
  }

  async updateRecordStatus(recordId: string, status: RecordStatus): Promise<Record> {
    await this.simulateDelay(120);

    const record = this.records.get(recordId);
    if (!record) {
      throw new Error(`기록을 찾을 수 없습니다: ${recordId}`);
    }

    const updatedRecord: Record = {
      ...record,
      status,
    };

    this.records.set(recordId, updatedRecord);
    return { ...updatedRecord };
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public resetMockData(): void {
    this.records.clear();
    this.recordsByParticipant.clear();
    this.recordsByDivision.clear();
    this.nextId = 1;
    this.initializeMockData();
  }

  public addTestRecord(divisionId: string, record: Record): void {
    this.records.set(record.id, record);
    
    const participantRecords = this.recordsByParticipant.get(record.participantId) || [];
    participantRecords.push(record.id);
    this.recordsByParticipant.set(record.participantId, participantRecords);
    
    const divisionRecords = this.recordsByDivision.get(divisionId) || [];
    divisionRecords.push(record.id);
    this.recordsByDivision.set(divisionId, divisionRecords);
  }

  public getStoredRecord(recordId: string): Record | undefined {
    return this.records.get(recordId);
  }

  public getRecordsByStatus(status: RecordStatus): Record[] {
    return Array.from(this.records.values())
      .filter(record => record.status === status)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  public getRecordsBySource(source: Record["source"]): Record[] {
    return Array.from(this.records.values())
      .filter(record => record.source === source)
      .sort((a, b) => a.value - b.value);
  }
}