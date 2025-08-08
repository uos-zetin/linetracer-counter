import type { ApiError } from "@/shared/api";
import type { ErrorHandlingConfig } from "../model/types";

// Toast 에러 표시 시간 통일 (5초)
const TOAST_DURATION_MS = 5000;

/**
 * 에러를 분석하여 적절한 처리 설정을 반환
 */
export function classifyError(error: ApiError | Error): ErrorHandlingConfig {
  // ApiError가 아닌 경우 (일반 JavaScript Error)
  if (!(error instanceof Error) || !("statusCode" in error)) {
    return {
      displayType: "toast",
      actionType: "none",
      title: "오류 발생",
      message: "예기치 못한 오류가 발생했습니다.",
      autoCloseMs: TOAST_DURATION_MS,
    };
  }

  const apiError = error as ApiError;
  const { statusCode, type, message } = apiError;

  // 인증 관련 에러 - Modal + 페이지 이동
  if (statusCode === 401 || type === "AuthenticationError") {
    return {
      displayType: "modal",
      actionType: "redirect",
      redirectPath: "/",
      title: "인증 만료",
      message: message || "로그인이 만료되었습니다. 다시 로그인해주세요.",
      actionText: "확인",
    };
  }

  // 권한 관련 에러 - Modal + 페이지 이동
  if (statusCode === 403 || type === "AuthorizationError") {
    return {
      displayType: "modal",
      actionType: "redirect",
      redirectPath: "/",
      title: "접근 권한 없음",
      message: message || "해당 기능에 접근할 권한이 없습니다.",
      actionText: "확인",
    };
  }

  // 서버 에러 (5xx) - Toast
  if (statusCode >= 500) {
    return {
      displayType: "toast",
      actionType: "none",
      title: "서버 오류",
      message: "서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
      autoCloseMs: TOAST_DURATION_MS,
    };
  }

  // 검증 에러 (422) - Toast
  if (statusCode === 422 || type === "ValidationError") {
    return {
      displayType: "toast",
      actionType: "none",
      title: "입력값 오류",
      message: message || "입력값을 확인해주세요.",
      autoCloseMs: TOAST_DURATION_MS,
    };
  }

  // 파라미터 에러 (400) - Toast
  if (statusCode === 400 || type === "ParameterInvalidError") {
    return {
      displayType: "toast",
      actionType: "none",
      title: "잘못된 요청",
      message: message || "요청 내용을 확인해주세요.",
      autoCloseMs: TOAST_DURATION_MS,
    };
  }

  // 리소스 없음 (404) - Toast
  if (statusCode === 404 || type === "NotFoundError" || type === "EntityNotFoundError") {
    return {
      displayType: "toast",
      actionType: "none",
      title: "리소스 없음",
      message: message || "요청한 정보를 찾을 수 없습니다.",
      autoCloseMs: TOAST_DURATION_MS,
    };
  }

  // 중복 데이터 (409) - Toast
  if (statusCode === 409 || type === "UsernameAlreadyExistsError") {
    return {
      displayType: "toast",
      actionType: "none",
      title: "중복 데이터",
      message: message || "이미 존재하는 데이터입니다.",
      autoCloseMs: TOAST_DURATION_MS,
    };
  }

  // 비즈니스 로직 에러들 - Toast
  if (
    type === "TimerLogConsecutiveError" ||
    type === "DivisionNotOngoingError" ||
    type === "DivisionNotReadyError" ||
    type === "RunnerNotParticipatedError" ||
    type === "RunnerNotSetError" ||
    type === "CounterNotRegisteredError"
  ) {
    return {
      displayType: "toast",
      actionType: "none",
      title: "작업 불가",
      message: message || "현재 상태에서는 해당 작업을 수행할 수 없습니다.",
      autoCloseMs: TOAST_DURATION_MS,
    };
  }

  // 기타 클라이언트 에러 (4xx) - Toast
  if (statusCode >= 400 && statusCode < 500) {
    return {
      displayType: "toast",
      actionType: "none",
      title: "요청 오류",
      message: message || "요청 처리 중 오류가 발생했습니다.",
      autoCloseMs: TOAST_DURATION_MS,
    };
  }

  // 기본 처리 - Toast
  return {
    displayType: "toast",
    actionType: "none",
    title: "오류 발생",
    message: message || "알 수 없는 오류가 발생했습니다.",
    autoCloseMs: TOAST_DURATION_MS,
  };
}