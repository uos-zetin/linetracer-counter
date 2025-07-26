import type { Fetcher } from "@/shared/api/fetcher";
import type { CounterDto, CounterRepository } from "./types";
import { parseCounterDto } from "../lib/parse-dto";

export class CounterFetcherRepository implements CounterRepository {
  private authFetcher: Fetcher;

  constructor(authFetcher: Fetcher) {
    this.authFetcher = authFetcher;
  }

  async getAll() {
    const response = await this.authFetcher.get<CounterDto[]>("/api/counters");
    return response.data.map((dto) => parseCounterDto(dto));
  }

  async getById(id: string) {
    const response = await this.authFetcher.get<CounterDto>(`/api/counters/${id}`);
    return parseCounterDto(response.data);
  }

  async connectDivision(counterId: string, divisionId: string) {
    await this.authFetcher.patch(`/api/counters/${counterId}/division`, {
      body: { divisionId },
    });

    return;
  }

  async disconnectDivision(counterId: string) {
    await this.authFetcher.delete(`/api/counters/${counterId}/division`);
    return;
  }

  async reset(counterId: string) {
    await this.authFetcher.post(`/api/counters/${counterId}/reset`);
    return;
  }

  async disconnectCounter(counterId: string) {
    await this.authFetcher.delete(`/api/counters/${counterId}`);
    return;
  }
}
