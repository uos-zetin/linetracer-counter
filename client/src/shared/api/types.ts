/**
 * 백엔드 에러 응답 구조
 */
export interface ApiErrorResponse {
  statusCode: number;
  type: string;
  message: string;
}

/**
 * 성공 응답 인터페이스
 */
export interface ApiSuccessResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
  meta?: {
    timestamp?: string;
    requestId?: string;
  };
}

/**
 * API 응답 타입 (성공 시에만 사용)
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T>;

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
 * 공용 Fetcher 인터페이스
 */
export interface Fetcher {
  get<T = unknown>(url: string, options?: Omit<RequestOptions, "body">): Promise<ApiResponse<T>>;
  post<T = unknown>(url: string, options?: RequestOptions): Promise<ApiResponse<T>>;
  put<T = unknown>(url: string, options?: RequestOptions): Promise<ApiResponse<T>>;
  delete<T = unknown>(url: string, options?: Omit<RequestOptions, "body">): Promise<ApiResponse<T>>;
  patch<T = unknown>(url: string, options?: RequestOptions): Promise<ApiResponse<T>>;
  request<T = unknown>(method: HttpMethod, url: string, options?: RequestOptions): Promise<ApiResponse<T>>;
}