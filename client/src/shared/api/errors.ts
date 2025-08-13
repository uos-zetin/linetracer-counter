import type { ApiErrorResponse } from "./types";

/**
 * API 에러 기본 클래스
 */
export abstract class ApiError extends Error {
  public readonly statusCode: number;
  public readonly type: string;
  public readonly originalResponse?: ApiErrorResponse;

  constructor(message: string, statusCode: number, type: string, originalResponse?: ApiErrorResponse) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.originalResponse = originalResponse;
  }
}

/**
 * 서버 에러 (5xx)
 */
export class ServerError extends ApiError {
  constructor(
    message: string,
    statusCode: number = 500,
    type: string = "SERVER_ERROR",
    originalResponse?: ApiErrorResponse
  ) {
    super(message, statusCode, type, originalResponse);
    this.name = "ServerError";
  }
}

/**
 * 클라이언트 에러 (4xx)
 */
export class ClientError extends ApiError {
  constructor(
    message: string,
    statusCode: number = 400,
    type: string = "CLIENT_ERROR",
    originalResponse?: ApiErrorResponse
  ) {
    super(message, statusCode, type, originalResponse);
    this.name = "ClientError";
  }
}

/**
 * 네트워크 에러 (연결 실패, 타임아웃 등)
 */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

/**
 * 인증 에러 (401)
 */
export class AuthenticationError extends ClientError {
  constructor(message: string = "인증이 필요합니다", originalResponse?: ApiErrorResponse) {
    super(message, 401, "AUTHENTICATION_ERROR", originalResponse);
    this.name = "AuthenticationError";
  }
}

/**
 * 권한 에러 (403)
 */
export class AuthorizationError extends ClientError {
  constructor(message: string = "권한이 없습니다", originalResponse?: ApiErrorResponse) {
    super(message, 403, "AUTHORIZATION_ERROR", originalResponse);
    this.name = "AuthorizationError";
  }
}

/**
 * 리소스 없음 에러 (404)
 */
export class NotFoundError extends ClientError {
  constructor(message: string = "리소스를 찾을 수 없습니다", originalResponse?: ApiErrorResponse) {
    super(message, 404, "NOT_FOUND_ERROR", originalResponse);
    this.name = "NotFoundError";
  }
}

/**
 * 검증 에러 (422)
 */
export class ValidationError extends ClientError {
  constructor(message: string = "입력값이 올바르지 않습니다", originalResponse?: ApiErrorResponse) {
    super(message, 422, "VALIDATION_ERROR", originalResponse);
    this.name = "ValidationError";
  }
}

// === 서버 비즈니스 에러들 ===

/**
 * 데이터베이스 관련 에러 (500)
 */
export class PersistenceError extends ServerError {
  constructor(message: string, originalResponse?: ApiErrorResponse) {
    super(message, 500, "PersistenceError", originalResponse);
    this.name = "PersistenceError";
  }
}

/**
 * 엔티티를 찾을 수 없음 (404)
 */
export class EntityNotFoundError extends ClientError {
  constructor(message: string, originalResponse?: ApiErrorResponse) {
    super(message, 404, "EntityNotFoundError", originalResponse);
    this.name = "EntityNotFoundError";
  }
}

/**
 * 파라미터가 유효하지 않음 (400)
 */
export class ParameterInvalidError extends ClientError {
  constructor(message: string, originalResponse?: ApiErrorResponse) {
    super(message, 400, "ParameterInvalidError", originalResponse);
    this.name = "ParameterInvalidError";
  }
}

/**
 * 사용자명이 이미 존재함 (409)
 */
export class UsernameAlreadyExistsError extends ClientError {
  constructor(message: string, originalResponse?: ApiErrorResponse) {
    super(message, 409, "UsernameAlreadyExistsError", originalResponse);
    this.name = "UsernameAlreadyExistsError";
  }
}

/**
 * 타이머 로그 연속 에러 (400)
 */
export class TimerLogConsecutiveError extends ClientError {
  constructor(message: string, originalResponse?: ApiErrorResponse) {
    super(message, 400, "TimerLogConsecutiveError", originalResponse);
    this.name = "TimerLogConsecutiveError";
  }
}

/**
 * 디비전이 진행중이 아님 (400)
 */
export class DivisionNotOngoingError extends ClientError {
  constructor(message: string, originalResponse?: ApiErrorResponse) {
    super(message, 400, "DivisionNotOngoingError", originalResponse);
    this.name = "DivisionNotOngoingError";
  }
}

/**
 * 디비전이 준비되지 않음 (400)
 */
export class DivisionNotReadyError extends ClientError {
  constructor(message: string, originalResponse?: ApiErrorResponse) {
    super(message, 400, "DivisionNotReadyError", originalResponse);
    this.name = "DivisionNotReadyError";
  }
}

/**
 * 러너가 참가하지 않음 (400)
 */
export class RunnerNotParticipatedError extends ClientError {
  constructor(message: string, originalResponse?: ApiErrorResponse) {
    super(message, 400, "RunnerNotParticipatedError", originalResponse);
    this.name = "RunnerNotParticipatedError";
  }
}

/**
 * 러너가 설정되지 않음 (400)
 */
export class RunnerNotSetError extends ClientError {
  constructor(message: string, originalResponse?: ApiErrorResponse) {
    super(message, 400, "RunnerNotSetError", originalResponse);
    this.name = "RunnerNotSetError";
  }
}

/**
 * 카운터가 등록되지 않음 (400)
 */
export class CounterNotRegisteredError extends ClientError {
  constructor(message: string, originalResponse?: ApiErrorResponse) {
    super(message, 400, "CounterNotRegisteredError", originalResponse);
    this.name = "CounterNotRegisteredError";
  }
}

/**
 * HTTP 상태 코드와 에러 응답을 기반으로 적절한 에러 객체 생성
 */
export function createApiError(status: number, errorResponse?: ApiErrorResponse, fallbackMessage?: string): ApiError {
  const errorMessage = errorResponse?.message || fallbackMessage || `HTTP ${status}`;
  const errorType = errorResponse?.type || "UNKNOWN_ERROR";

  // 서버 에러 타입별 구체적인 에러 생성
  if (errorResponse?.type) {
    switch (errorResponse.type) {
      // 인증/권한 관련
      case "AuthenticationError":
        return new AuthenticationError(errorMessage, errorResponse);
      case "AuthorizationError":
        return new AuthorizationError(errorMessage, errorResponse);

      // 엔티티/파라미터 관련
      case "EntityNotFoundError":
        return new EntityNotFoundError(errorMessage, errorResponse);
      case "ParameterInvalidError":
        return new ParameterInvalidError(errorMessage, errorResponse);

      // 비즈니스 로직 관련
      case "UsernameAlreadyExistsError":
        return new UsernameAlreadyExistsError(errorMessage, errorResponse);
      case "TimerLogConsecutiveError":
        return new TimerLogConsecutiveError(errorMessage, errorResponse);
      case "DivisionNotOngoingError":
        return new DivisionNotOngoingError(errorMessage, errorResponse);
      case "DivisionNotReadyError":
        return new DivisionNotReadyError(errorMessage, errorResponse);
      case "RunnerNotParticipatedError":
        return new RunnerNotParticipatedError(errorMessage, errorResponse);
      case "RunnerNotSetError":
        return new RunnerNotSetError(errorMessage, errorResponse);
      case "CounterNotRegisteredError":
        return new CounterNotRegisteredError(errorMessage, errorResponse);

      // 서버 내부 에러
      case "PersistenceError":
        return new PersistenceError(errorMessage, errorResponse);
    }
  }

  // 상태 코드별 기본 에러 생성 (fallback)
  switch (status) {
    case 401:
      return new AuthenticationError(errorMessage, errorResponse);
    case 403:
      return new AuthorizationError(errorMessage, errorResponse);
    case 404:
      return new NotFoundError(errorMessage, errorResponse);
    case 409:
      return new UsernameAlreadyExistsError(errorMessage, errorResponse);
    case 422:
      return new ValidationError(errorMessage, errorResponse);
    default:
      // 범용 에러 생성
      if (status >= 400 && status < 500) {
        return new ClientError(errorMessage, status, errorType, errorResponse);
      } else if (status >= 500) {
        return new ServerError(errorMessage, status, errorType, errorResponse);
      }
      // 기타는 서버 에러로 처리
      return new ServerError(errorMessage, status, errorType, errorResponse);
  }
}
