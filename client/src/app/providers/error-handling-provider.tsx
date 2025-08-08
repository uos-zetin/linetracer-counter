import { useMemo } from "react";
import { Toaster } from "@/shared/ui/sonner";
import { 
  ErrorHandlingContext, 
  createErrorHandlingService, 
  ErrorModal 
} from "@/features/error-handling";

interface ErrorHandlingProviderProps {
  children: React.ReactNode;
}

/**
 * 에러 핸들링 프로바이더
 * - ErrorHandlingService를 전역으로 제공
 * - 에러 모달 컴포넌트 렌더링
 * - sonner Toaster 컴포넌트 포함
 */
export function ErrorHandlingProvider({ children }: ErrorHandlingProviderProps) {
  const errorHandlingService = useMemo(() => {
    return createErrorHandlingService();
  }, []);

  return (
    <ErrorHandlingContext.Provider value={errorHandlingService}>
      {children}
      
      {/* 에러 UI 컴포넌트들 */}
      <ErrorModal />
      
      {/* sonner 토스트 컨테이너 */}
      <Toaster
        position="top-right"
        expand={true}
        richColors={true}
        closeButton={true}
        toastOptions={{
          duration: 5000,
          style: {
            fontSize: "14px",
          },
        }}
      />
    </ErrorHandlingContext.Provider>
  );
}