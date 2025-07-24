import type { Fetcher } from "@/shared";
import type { ProgressRepository } from "./types";

export class ProgressFetcherRepository implements ProgressRepository {
  private authFetcher: Fetcher;

  constructor(authFetcher: Fetcher) {
    this.authFetcher = authFetcher;
  }
}
