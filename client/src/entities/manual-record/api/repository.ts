import type { Fetcher } from "@/shared";
import type { ManualRecord } from "../model/types";
import type { ManualRecordDto, ManualRecordRepository } from "./types";
import { parseManualRecordDto } from "../lib/parse-dto";

export class ManualRecordFetcherRepository implements ManualRecordRepository {
  private fetcher: Fetcher;
  private authFetcher: Fetcher;

  constructor(fetcher: Fetcher, authFetcher: Fetcher) {
    this.fetcher = fetcher;
    this.authFetcher = authFetcher;
  }

  async getAllManualRecords(participantId: string): Promise<ManualRecord[]> {
    const response = await this.fetcher.get<ManualRecordDto[]>(`/api/participants/${participantId}/manual-records`);
    return response.data.map((record) => parseManualRecordDto(record));
  }

  async createManualRecord(
    participantId: string,
    manualRecord: Pick<ManualRecord, "value" | "recorderName">,
  ): Promise<ManualRecord> {
    const response = await this.authFetcher.post<ManualRecordDto>(`/api/participants/${participantId}/manual-records`, {
      body: manualRecord,
    });
    return parseManualRecordDto(response.data);
  }
}
