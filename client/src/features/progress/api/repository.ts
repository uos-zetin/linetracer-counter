import type { Fetcher } from "@/shared";
import type { ProgressDto, ProgressRepository } from "./types";
import type { ProgressState } from "../model/types";
import { parseProgressDto } from "../lib/parse-dto";

export class ProgressFetcherRepository implements ProgressRepository {
  private fetcher: Fetcher;
  private authFetcher: Fetcher;

  constructor(fetcher: Fetcher, authFetcher: Fetcher) {
    this.fetcher = fetcher;
    this.authFetcher = authFetcher;
  }

  async getProgress(divisionId: string): Promise<ProgressState | null> {
    const response = await this.fetcher.get<ProgressDto>(`/divisions/${divisionId}/progress`);
    return response.data ? parseProgressDto(response.data) : null;
  }

  async openProgressDivision(divisionId: string): Promise<void> {
    await this.authFetcher.post(`/divisions/${divisionId}/progress/open`);
  }

  async closeProgressDivision(divisionId: string): Promise<void> {
    await this.authFetcher.post(`/divisions/${divisionId}/progress/close`);
  }

  async resetProgressDivision(divisionId: string): Promise<void> {
    await this.authFetcher.post(`/divisions/${divisionId}/progress/reset`);
  }

  async setCurrentRunner(divisionId: string, participantId: string): Promise<void> {
    await this.authFetcher.patch(`/divisions/${divisionId}/progress/runner`, {
      body: { participantId },
    });
  }

  async postponeCurrentRunner(divisionId: string): Promise<void> {
    await this.authFetcher.post(`/divisions/${divisionId}/progress/runner/postpone`);
  }

  async getOrder(divisionId: string): Promise<string[]> {
    const response = await this.fetcher.get<string[]>(`/divisions/${divisionId}/progress/order`);
    return response.data || [];
  }

  async changeOrder(divisionId: string, participantId: string, order: number): Promise<void> {
    await this.authFetcher.patch(`/divisions/${divisionId}/progress/order`, {
      body: { participantId, order: String(order) },
    });
  }
}
