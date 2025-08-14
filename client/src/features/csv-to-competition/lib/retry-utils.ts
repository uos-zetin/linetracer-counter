/**
 * 재시도 유틸리티 함수들
 * 지수 백오프 패턴으로 네트워크 요청 재시도 처리
 */

import { NetworkError, ServerError, ApiError } from "@/shared/api/errors";

export interface RetryOptions {
  /** 최대 재시도 횟수 (기본: 4회) */
  maxRetries?: number;
  /** 초기 대기 시간 (밀리초, 기본: 1000ms) */
  initialDelay?: number;
  /** 백오프 배수 (기본: 2) */
  backoffMultiplier?: number;
  /** 재시도 가능한 에러인지 판단하는 함수 */
  shouldRetry?: (error: unknown) => boolean;
  /** 재시도 시작 시 콜백 */
  onRetry?: (attempt: number, error: unknown) => void;
}

export interface RetryResult<T> {
  /** 작업 성공 여부 */
  success: boolean;
  /** 성공 시 결과 데이터 */
  data?: T;
  /** 실패 시 최종 에러 */
  error?: unknown;
  /** 총 시도 횟수 */
  attempts: number;
  /** 총 소요 시간 (밀리초) */
  totalTime: number;
}

/**
 * 기본 재시도 가능 에러 판단 함수
 * 네트워크 오류, 서버 5xx 오류, 타임아웃 등 일시적 장애만 재시도
 */
const defaultShouldRetry = (error: unknown): boolean => {
  // 프로젝트의 커스텀 에러 타입 체크
  if (error instanceof NetworkError) {
    return true;
  }

  if (error instanceof ServerError) {
    // 5xx 서버 에러는 재시도 가능
    return error.statusCode >= 500 && error.statusCode < 600;
  }

  if (error instanceof ApiError) {
    // 일반적인 API 에러는 재시도하지 않음 (4xx 클라이언트 에러 등)
    return false;
  }

  // 브라우저 내장 에러 타입들 체크
  if (error instanceof Error) {
    const errorName = error.name;
    const errorMessage = error.message.toLowerCase();

    // 네트워크 관련 에러 타입들
    if (
      errorName === "NetworkError" ||
      errorName === "TimeoutError" ||
      errorName === "AbortError" ||
      errorMessage.includes("network error") ||
      errorMessage.includes("fetch error") ||
      errorMessage.includes("connection") ||
      errorMessage.includes("timeout")
    ) {
      return true;
    }

    // TypeError에서 네트워크 관련 메시지 체크 (fetch API 에러)
    if (errorName === "TypeError" && errorMessage.includes("fetch")) {
      return true;
    }
  }

  // 일반적인 HTTP 응답 에러 객체 체크 (fallback)
  if (typeof error === "object" && error !== null && "status" in error) {
    const httpError = error as { status: number };
    return httpError.status >= 500 && httpError.status < 600;
  }

  return false;
};

/**
 * 지정된 시간만큼 대기
 */
const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * 지수 백오프 패턴으로 함수 실행 재시도
 */
export async function retryWithBackoff<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<RetryResult<T>> {
  const {
    maxRetries = 4,
    initialDelay = 1000,
    backoffMultiplier = 2,
    shouldRetry = defaultShouldRetry,
    onRetry,
  } = options;

  const startTime = Date.now();
  let lastError: unknown;
  let attempts = 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    attempts = attempt + 1;

    try {
      const result = await fn();
      return {
        success: true,
        data: result,
        attempts,
        totalTime: Date.now() - startTime,
      };
    } catch (error) {
      lastError = error;

      // 마지막 시도이거나 재시도 불가능한 에러면 실패
      if (attempt === maxRetries || !shouldRetry(error)) {
        break;
      }

      // 재시도 콜백 호출
      onRetry?.(attempt + 1, error);

      // 지수 백오프 대기
      const delayTime = initialDelay * Math.pow(backoffMultiplier, attempt);
      await delay(delayTime);
    }
  }

  return {
    success: false,
    error: lastError,
    attempts,
    totalTime: Date.now() - startTime,
  };
}

/**
 * 여러 개의 비동기 작업을 병렬로 실행하되, 실패한 작업은 재시도
 * 모든 작업이 완료될 때까지 대기
 */
export async function retryAllWithBackoff<T>(
  tasks: (() => Promise<T>)[],
  options: RetryOptions = {}
): Promise<RetryResult<T>[]> {
  const promises = tasks.map((task) => retryWithBackoff(task, options));
  return Promise.all(promises);
}

/**
 * API 호출용 재시도 래퍼 함수
 */
export function createRetryWrapper(defaultOptions: RetryOptions = {}) {
  return async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<RetryResult<T>> {
    return retryWithBackoff(fn, { ...defaultOptions, ...options });
  };
}
