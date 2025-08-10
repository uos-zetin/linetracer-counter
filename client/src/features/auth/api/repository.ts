import type { Fetcher } from "@/shared/api";
import { parseLoginForm } from "../lib/parse-dto";
import type { LoginForm } from "../model/types";
import type { AuthRepository } from "./types";

export class AuthFetcherRepository implements AuthRepository {
  private readonly fetcher: Fetcher; // 인증 불필요한 요청용
  private readonly authFetcher: Fetcher; // 인증 필요한 요청용

  constructor(fetcher: Fetcher, authFetcher: Fetcher) {
    this.fetcher = fetcher;
    this.authFetcher = authFetcher;
  }

  async login(credentials: LoginForm): Promise<string> {
    const response = await this.fetcher.post<string>("/actors/login", {
      body: parseLoginForm(credentials),
    });

    return response.data;
  }

  async logout(): Promise<void> {
    await this.authFetcher.post<void>("/actors/logout");
  }
}
