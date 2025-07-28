import type { Fetcher } from "@/shared";
import type { TimerLog } from "../model/types";
import type { TimerLogDto, TimerRepository } from "./types";
import { parseTimerLogDto } from "../lib/parse-dto";

export class TimerFetcherRepository implements TimerRepository {
  private fetcher: Fetcher;
  private authFetcher: Fetcher;

  constructor(fetcher: Fetcher, authFetcher: Fetcher) {
    this.fetcher = fetcher;
    this.authFetcher = authFetcher;
  }

  async getTimerLogs(participantId: string): Promise<TimerLog[]> {
    const response = await this.fetcher.get<TimerLogDto[]>(`/api/participants/${participantId}/timers`);
    return response.data.map((dto) => parseTimerLogDto(dto)) || [];
  }

  async startTimer(participantId: string): Promise<TimerLog> {
    const response = await this.authFetcher.post<TimerLogDto>(`/api/participants/${participantId}/timers/start`);
    return parseTimerLogDto(response.data);
  }

  async stopTimer(participantId: string): Promise<TimerLog> {
    const response = await this.authFetcher.post<TimerLogDto>(`/api/participants/${participantId}/timers/stop`);
    return parseTimerLogDto(response.data);
  }

  async adjustTimer(participantId: string, value: number): Promise<TimerLog> {
    const response = await this.authFetcher.post<TimerLogDto>(`/api/participants/${participantId}/timers/adjust`, {
      body: { value },
    });
    return parseTimerLogDto(response.data);
  }
}
