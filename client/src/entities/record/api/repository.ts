import type { Fetcher } from "@/shared";
import type { RecordDto, RecordRepository } from "./types";
import type { Record, RecordStatus } from "../model/types";
import { parseRecordDto } from "../lib/parse-dto";

export class RecordFetcherRepository implements RecordRepository {
  private fetcher: Fetcher;
  private authFetcher: Fetcher;

  constructor(fetcher: Fetcher, authFetcher: Fetcher) {
    this.fetcher = fetcher;
    this.authFetcher = authFetcher;
  }

  async getAllRecords(participantId: string): Promise<Record[]> {
    const response = await this.fetcher.get<RecordDto[]>(`/participants/${participantId}/records`);
    return response.data.map((dto) => parseRecordDto(dto));
  }

  async getRecordById(recordId: string): Promise<Record | null> {
    const response = await this.fetcher.get<RecordDto>(`/records/${recordId}`);
    return response.data ? parseRecordDto(response.data) : null;
  }

  async getTopRecords(divisionId: string): Promise<Record[]> {
    const response = await this.fetcher.get<RecordDto[]>(`/divisions/${divisionId}/records/top`);
    return response.data.map((dto) => parseRecordDto(dto));
  }

  async createRecord(participantId: string, record: Pick<Record, "value" | "source" | "note">): Promise<Record> {
    const response = await this.authFetcher.post<RecordDto>(`/participants/${participantId}/records`, {
      body: record,
    });
    return parseRecordDto(response.data);
  }

  async updateRecordNote(recordId: string, note: string): Promise<Record> {
    const response = await this.authFetcher.patch<RecordDto>(`/records/${recordId}/note`, {
      body: { note },
    });
    return parseRecordDto(response.data);
  }

  async updateRecordStatus(recordId: string, status: RecordStatus): Promise<Record> {
    const response = await this.authFetcher.patch<RecordDto>(`/records/${recordId}/status`, {
      body: { status },
    });
    return parseRecordDto(response.data);
  }
}
