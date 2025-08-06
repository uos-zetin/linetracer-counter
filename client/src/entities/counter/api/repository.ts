import type { Fetcher } from "@/shared/api";
import { parseCounterDto } from "../lib/parse-dto";
import type { CounterDto, CounterRepository } from "./types";

export class CounterFetcherRepository implements CounterRepository {
  private authFetcher: Fetcher;

  constructor(authFetcher: Fetcher) {
    this.authFetcher = authFetcher;
  }

  async getAll() {
    const response = await this.authFetcher.get<CounterDto[]>("/counters");
    return response.data.map((dto) => parseCounterDto(dto));
  }

  async getById(id: string) {
    const response = await this.authFetcher.get<CounterDto>(`/counters/${id}`);
    return response.data ? parseCounterDto(response.data) : null;
  }

  async connectDivision(counterId: string, divisionId: string) {
    await this.authFetcher.patch(`/counters/${counterId}/division`, {
      body: { divisionId },
    });

    return;
  }

  async disconnectDivision(counterId: string) {
    await this.authFetcher.delete(`/counters/${counterId}/division`);
    return;
  }

  async reset(counterId: string) {
    await this.authFetcher.post(`/counters/${counterId}/reset`);
    return;
  }

  async disconnectCounter(counterId: string) {
    await this.authFetcher.delete(`/counters/${counterId}`);
    return;
  }
}
