import { useMemo, useState } from "react";
import { Toaster } from "@/shared/ui/sonner";
import { ErrorHandlingContext, createErrorHandlingService, ErrorModal } from "@/features/error-handling";
import type { ErrorHandlingConfig } from "@/features/error-handling";

interface ErrorHandlingProviderProps {
  children: React.ReactNode;
}

// Modal 상태 인터페이스
interface ErrorModalState {
  isOpen: boolean;
  config: ErrorHandlingConfig | null;
  onAction?: () => void;
}

/**
 * 에러 핸들링 프로바이더
 * - ErrorHandlingService 제공
 * - 에러 모달 상태 관리
 * - 에러 모달 컴포넌트 렌더링
 * - sonner Toaster 컴포넌트 포함
 */
export function ErrorHandlingProvider({ children }: ErrorHandlingProviderProps) {
  // 모달 상태 관리
  const [modalState, setModalState] = useState<ErrorModalState>({
    isOpen: false,
    config: null,
    onAction: undefined,
  });

  const showModal = (config: ErrorHandlingConfig, onAction?: () => void) => {
    setModalState({
      isOpen: true,
      config,
      onAction,
    });
  };

  const hideModal = () => {
    setModalState({
      isOpen: false,
      config: null,
      onAction: undefined,
    });
  };

  // 에러 핸들링 서비스 생성
  const errorHandlingService = useMemo(() => {
    return createErrorHandlingService(showModal);
  }, []);

  return (
    <ErrorHandlingContext.Provider value={errorHandlingService}>
      {children}

      {/* 에러 UI 컴포넌트들 */}
      <ErrorModal
        isOpen={modalState.isOpen}
        config={modalState.config}
        onAction={modalState.onAction}
        onClose={hideModal}
      />

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
