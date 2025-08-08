import { useMemo } from "react";
import { Toaster } from "@/shared/ui/sonner";
import { 
  ErrorHandlingContext, 
  createErrorHandlingService, 
  ErrorModal 
} from "@/features/error-handling";
import { ErrorModalProvider, useErrorModal } from "@/features/error-handling/model/modal-context";

interface ErrorHandlingProviderProps {
  children: React.ReactNode;
}

// 내부 Provider 컴포넌트 (ErrorModal context가 필요)
function ErrorHandlingServiceProvider({ children }: { children: React.ReactNode }) {
  const { showModal } = useErrorModal();
  
  const errorHandlingService = useMemo(() => {
    return createErrorHandlingService(showModal);
  }, [showModal]);

  return (
    <ErrorHandlingContext.Provider value={errorHandlingService}>
      {children}
    </ErrorHandlingContext.Provider>
  );
}

/**
 * 에러 핸들링 프로바이더
 * - ErrorModalProvider와 ErrorHandlingService를 함께 제공
 * - 에러 모달 컴포넌트 렌더링
 * - sonner Toaster 컴포넌트 포함
 */
export function ErrorHandlingProvider({ children }: ErrorHandlingProviderProps) {
  return (
    <ErrorModalProvider>
      <ErrorHandlingServiceProvider>
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
      </ErrorHandlingServiceProvider>
    </ErrorModalProvider>
  );
}