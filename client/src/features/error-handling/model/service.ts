import { toast } from "sonner";
import type { ApiError } from "@/shared/api";
import { classifyError } from "../lib/error-classifier";
import type { ErrorHandlingService, ErrorHandlingConfig } from "./types";

/**
 * 에러 핸들링 서비스 구현
 */
export function createErrorHandlingService(
  showModal?: (config: ErrorHandlingConfig, onAction?: () => void) => void
): ErrorHandlingService {
  return {
    handle: (error: ApiError | Error, context?: string, onRedirect?: (path: string) => void) => {
      // 에러 분류
      const config = classifyError(error);

      // 개발 환경에서 로깅
      if (import.meta.env.DEV) {
        console.error(
          `[Error Handler] ${config.displayType.toUpperCase()}:`,
          {
            type: "type" in error ? error.type : "Unknown",
            message: error.message,
            statusCode: "statusCode" in error ? error.statusCode : "N/A",
            context,
          },
          error
        );
      }

      // 표시 방식에 따른 처리
      if (config.displayType === "modal") {
        // redirect가 필요한 경우 콜백 생성
        let modalCallback: (() => void) | undefined = undefined;
        if (config.actionType === "redirect" && onRedirect && config.redirectPath) {
          const redirectPath = config.redirectPath; // 타입 안전성을 위해 변수에 저장
          modalCallback = () => onRedirect(redirectPath);
        }

        if (showModal) {
          showModal(config, modalCallback);
        }
      } else {
        // Toast 표시
        toast.error(config.message, {
          description: config.title,
          duration: config.autoCloseMs,
        });
      }
    },
  };
}
