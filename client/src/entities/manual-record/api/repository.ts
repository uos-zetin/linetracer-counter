import type { Fetcher } from "@/shared/api";
import { parseManualRecordDto, parseManualRecordForm } from "../lib/parse-dto";
import type { ManualRecord, ManualRecordForm } from "../model/types";
import type { ManualRecordDto, ManualRecordRepository } from "./types";

export class ManualRecordFetcherRepository implements ManualRecordRepository {
  private fetcher: Fetcher;
  private authFetcher: Fetcher;

  constructor(fetcher: Fetcher, authFetcher: Fetcher) {
    this.fetcher = fetcher;
    this.authFetcher = authFetcher;
  }

  async getAllManualRecords(participantId: string): Promise<ManualRecord[]> {
    const response = await this.fetcher.get<ManualRecordDto[]>(`/participants/${participantId}/manual-records`);
    return response.data.map((record) => parseManualRecordDto(record));
  }

  async createManualRecord(participantId: string, manualRecord: ManualRecordForm): Promise<ManualRecord> {
    const response = await this.authFetcher.post<ManualRecordDto>(`/participants/${participantId}/manual-records`, {
      body: parseManualRecordForm(manualRecord),
    });
    return parseManualRecordDto(response.data);
  }

  async deleteManualRecords(participantId: string): Promise<void> {
    await this.authFetcher.delete(`/participants/${participantId}/manual-records`);
  }
}
