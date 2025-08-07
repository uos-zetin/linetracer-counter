import { NetworkError, createApiError, ApiError, ServerError } from "./errors";
import type { Fetcher, HttpMethod, RequestOptions, ApiResponse, ApiErrorResponse } from "./types";

/**
 * Fetch API를 사용한 Fetcher 구현체
 */
export class FetchApiFetcher implements Fetcher {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = "", defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...defaultHeaders,
    };
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
    const fullUrl = this.buildUrl(url, options?.query);
    const headers = { ...this.defaultHeaders, ...options?.headers };

    const requestInit: RequestInit = {
      method,
      headers,
    };

    // GET, DELETE 메서드가 아닌 경우에만 body 추가
    if (method !== "GET" && method !== "DELETE" && options?.body !== undefined) {
      requestInit.body = this.serializeBody(options.body, headers["Content-Type"]);
    }

    // 타임아웃 처리
    if (options?.timeout) {
      const controller = new AbortController();
      requestInit.signal = controller.signal;
      setTimeout(() => controller.abort(), options.timeout);
    }

    try {
      const response = await fetch(fullUrl, requestInit);
      const responseHeaders = this.parseHeaders(response.headers);

      // 응답 데이터 파싱
      let data: T;
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else if (contentType.includes("text/")) {
        data = (await response.text()) as T;
      } else {
        data = (await response.blob()) as T;
      }

      // HTTP 에러 상태 처리
      if (!response.ok) {
        // 에러 응답 body 파싱 시도
        let errorResponse: ApiErrorResponse | undefined = undefined;
        try {
          if (contentType.includes("application/json")) {
            errorResponse = data as ApiErrorResponse;
          }
        } catch {
          // 에러 응답 파싱 실패 시 기본 처리
        }

        const fallbackMessage = `HTTP ${response.status}: ${response.statusText}`;
        throw createApiError(response.status, errorResponse, fallbackMessage);
      }

      return {
        data,
        status: response.status,
        headers: responseHeaders,
      };
    } catch (error) {
      if (error instanceof ApiError || error instanceof NetworkError) {
        throw error;
      }

      // 네트워크 에러, 타임아웃 등
      if (error instanceof TypeError) {
        throw new NetworkError("네트워크 연결에 실패했습니다.");
      }

      // AbortError 확인 - DOMException 타입과 name 속성 모두 확인
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new NetworkError("요청 시간이 초과되었습니다.");
      }

      throw new ServerError("알 수 없는 에러가 발생했습니다.", 500);
    }
  }

  /**
   * URL과 쿼리 파라미터를 결합하여 완전한 URL을 생성합니다.
   */
  private buildUrl(url: string, query?: Record<string, string>): string {
    const fullUrl = this.baseUrl ? `${this.baseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}` : url;

    if (!query || Object.keys(query).length === 0) {
      return fullUrl;
    }

    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      searchParams.append(key, value);
    });

    const separator = fullUrl.includes("?") ? "&" : "?";
    return `${fullUrl}${separator}${searchParams.toString()}`;
  }

  /**
   * 요청 바디를 직렬화합니다.
   */
  private serializeBody(body: unknown, contentType: string): string | FormData | Blob {
    if (body instanceof FormData || body instanceof Blob) {
      return body;
    }

    if (contentType.includes("application/json")) {
      return JSON.stringify(body);
    }

    if (typeof body === "string") {
      return body;
    }

    return JSON.stringify(body);
  }

  /**
   * Headers 객체를 일반 객체로 변환합니다.
   */
  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
}
