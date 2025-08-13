import { createContext, useContext } from "react";
import type { ErrorHandlingService } from "./types";

/**
 * 에러 핸들링 서비스 컨텍스트
 */
export const ErrorHandlingContext = createContext<ErrorHandlingService | null>(null);

/**
 * 에러 핸들링 서비스 훅
 */
export function useErrorHandlingService(): ErrorHandlingService {
  const service = useContext(ErrorHandlingContext);

  if (!service) {
    throw new Error("useErrorHandlingService must be used within an ErrorHandlingProvider");
  }

  return service;
}
