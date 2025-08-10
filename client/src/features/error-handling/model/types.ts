import type { ApiError } from "@/shared/api";

/**
 * 에러 표시 방식
 */
export type ErrorDisplayType = "modal" | "toast";

/**
 * 에러 처리 액션 타입
 */
export type ErrorActionType = "none" | "redirect" | "reload";

/**
 * 에러 처리 설정
 */
export interface ErrorHandlingConfig {
  /** 표시 방식 (modal/toast) */
  displayType: ErrorDisplayType;
  /** 처리 액션 */
  actionType: ErrorActionType;
  /** 리다이렉트 경로 (actionType이 redirect일 때) */
  redirectPath?: string;
  /** 사용자에게 표시할 제목 */
  title: string;
  /** 사용자에게 표시할 메시지 */
  message: string;
  /** 액션 버튼 텍스트 */
  actionText?: string;
  /** 자동으로 닫힐 시간 (ms, toast의 경우) */
  autoCloseMs?: number;
}

/**
 * 에러 핸들링 서비스 인터페이스
 */
export interface ErrorHandlingService {
  /** 에러 처리 */
  handle: (error: ApiError | Error, context?: string, onRedirect?: (path: string) => void) => void;
}