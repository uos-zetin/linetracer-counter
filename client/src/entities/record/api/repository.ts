import type { Fetcher } from "@/shared/api";
import { parseRecordDto } from "../lib/parse-dto";
import type { Record, RecordForm, RecordStatus } from "../model/types";
import type { RecordCreateDto, RecordDto, RecordRepository } from "./types";

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

  async getTopRecords(divisionId: string): Promise<Record[]> {
    const response = await this.fetcher.get<RecordDto[]>(`/divisions/${divisionId}/records/top`);
    return response.data.map((dto) => parseRecordDto(dto));
  }

  async createRecord(participantId: string, record: RecordForm): Promise<Record> {
    const response = await this.authFetcher.post<RecordDto>(`/participants/${participantId}/records`, {
      body: {
        value: record.value,
        source: record.source,
        note: record.note,
      } as RecordCreateDto,
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
      body: { status } as { status: RecordStatus },
    });
    return parseRecordDto(response.data);
  }
}
