import type { Fetcher, RequestOptions, ApiResponse, HttpMethod } from "./fetcher";

/**
 * 세션 키 공급자 인터페이스
 */
export interface SessionProvider {
  getSessionKey(): string | null;
}

/**
 * 인증이 필요한 요청을 처리하는 Fetcher 래퍼
 * 기본 Fetcher를 감싸서 자동으로 Authorization 헤더를 추가합니다.
 */
export class AuthenticatedFetcher implements Fetcher {
  private readonly baseFetcher: Fetcher;
  private readonly sessionProvider: SessionProvider;

  constructor(baseFetcher: Fetcher, sessionProvider: SessionProvider) {
    this.baseFetcher = baseFetcher;
    this.sessionProvider = sessionProvider;
  }

  async get<T = unknown>(url: string, options?: Omit<RequestOptions, "body">): Promise<ApiResponse<T>> {
    return this.request<T>("GET", url, options);
  }

  async post<T = unknown>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>("POST", url, options);
  }

  async put<T = unknown>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>("PUT", url, options);
  }

  async delete<T = unknown>(url: string, options?: Omit<RequestOptions, "body">): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", url, options);
  }

  async patch<T = unknown>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>("PATCH", url, options);
  }

  async request<T = unknown>(method: HttpMethod, url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    // 세션 키가 있으면 Authorization 헤더에 추가
    const sessionKey = this.sessionProvider.getSessionKey();
    const headers: Record<string, string> = { ...options?.headers };

    if (sessionKey) {
      headers["Authorization"] = `Bearer ${sessionKey}`;
    }

    const requestOptions: RequestOptions = {
      ...options,
      headers,
    };

    return this.baseFetcher.request<T>(method, url, requestOptions);
  }
}
