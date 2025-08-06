import type { Fetcher } from "@/shared";
import { parseManualRecordDto } from "../lib/parse-dto";
import type { ManualRecord, ManualRecordForm } from "../model/types";
import type { ManualRecordCreateDto, ManualRecordDto, ManualRecordRepository } from "./types";

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
      body: {
        value: manualRecord.value,
        recorderName: manualRecord.recorderName,
      } as ManualRecordCreateDto,
    });
    return parseManualRecordDto(response.data);
  }
}
