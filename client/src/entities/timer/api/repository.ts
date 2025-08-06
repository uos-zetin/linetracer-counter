import type { Fetcher } from "@/shared/api";
import { parseTimerLogDto } from "../lib/parse-dto";
import type { TimerLog, TimerLogType } from "../model/types";
import type { TimerLogDto, TimerRepository } from "./types";

export class TimerFetcherRepository implements TimerRepository {
  private fetcher: Fetcher;
  private authFetcher: Fetcher;

  constructor(fetcher: Fetcher, authFetcher: Fetcher) {
    this.fetcher = fetcher;
    this.authFetcher = authFetcher;
  }

  async getTimerLogs(participantId: string): Promise<TimerLog[]> {
    const response = await this.fetcher.get<TimerLogDto[]>(`/participants/${participantId}/timer/logs`);
    return response.data?.map((dto) => parseTimerLogDto(dto)) || [];
  }

  async startTimer(participantId: string): Promise<TimerLog> {
    const response = await this.authFetcher.post<TimerLogDto>(`/participants/${participantId}/timer/start`);
    return parseTimerLogDto(response.data);
  }

  async stopTimer(participantId: string): Promise<TimerLog> {
    const response = await this.authFetcher.post<TimerLogDto>(`/participants/${participantId}/timer/stop`);
    return parseTimerLogDto(response.data);
  }

  async adjustTimer(participantId: string, type: TimerLogType, value: number): Promise<TimerLog> {
    let adjustedValue = value;
    if (type === "add") {
      adjustedValue = value;
    } else if (type === "sub") {
      adjustedValue = -value;
    } else {
      throw new Error("Invalid timer log type for adjustment. Use 'add' or 'sub'.");
    }

    const response = await this.authFetcher.post<TimerLogDto>(`/participants/${participantId}/timer/adjust`, {
      body: { adjustmentMs: adjustedValue },
    });
    return parseTimerLogDto(response.data);
  }
}
