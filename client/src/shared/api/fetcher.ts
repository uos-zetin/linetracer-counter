/**
 * HTTP 메서드 타입
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * 요청 옵션 인터페이스
 */
export interface RequestOptions {
  /** 요청 헤더 */
  headers?: Record<string, string>;
  /** 요청 바디 */
  body?: unknown;
  /** 요청 쿼리 파라미터 */
  query?: Record<string, string>;
  /** 타임아웃 (밀리초) */
  timeout?: number;
}

/**
 * 응답 인터페이스
 */
export interface ApiResponse<T = unknown> {
  /** 응답 데이터 */
  data: T;
  /** HTTP 상태 코드 */
  status: number;
  /** 응답 헤더 */
  headers: Record<string, string>;
}

/**
 * 공용 Fetcher 인터페이스
 * 다양한 HTTP 클라이언트 구현체가 이 인터페이스를 구현할 수 있습니다.
 */
export interface Fetcher {
  /**
   * GET 요청
   */
  get<T = unknown>(url: string, options?: Omit<RequestOptions, "body">): Promise<ApiResponse<T>>;

  /**
   * POST 요청
   */
  post<T = unknown>(url: string, options?: RequestOptions): Promise<ApiResponse<T>>;

  /**
   * PUT 요청
   */
  put<T = unknown>(url: string, options?: RequestOptions): Promise<ApiResponse<T>>;

  /**
   * DELETE 요청
   */
  delete<T = unknown>(url: string, options?: Omit<RequestOptions, "body">): Promise<ApiResponse<T>>;

  /**
   * PATCH 요청
   */
  patch<T = unknown>(url: string, options?: RequestOptions): Promise<ApiResponse<T>>;

  /**
   * 범용 요청 메서드
   */
  request<T = unknown>(method: HttpMethod, url: string, options?: RequestOptions): Promise<ApiResponse<T>>;
}
