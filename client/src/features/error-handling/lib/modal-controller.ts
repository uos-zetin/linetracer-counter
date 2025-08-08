import type { ErrorHandlingConfig } from "../model/types";

interface ErrorModalState {
  isOpen: boolean;
  config: ErrorHandlingConfig | null;
  onAction?: () => void; // 액션 콜백
}

// 전역 상태 (단순하게 모듈 레벨에서 관리)
const modalState: ErrorModalState = {
  isOpen: false,
  config: null,
  onAction: undefined,
};

let setModalState: ((state: ErrorModalState) => void) | null = null;

/**
 * 에러 모달을 표시하는 함수
 */
export function showErrorModal(config: ErrorHandlingConfig, onAction?: () => void) {
  if (setModalState) {
    setModalState({
      isOpen: true,
      config,
      onAction,
    });
  }
}

/**
 * Modal 상태 관리를 위한 초기 상태
 */
export function getInitialModalState(): ErrorModalState {
  return modalState;
}

/**
 * Modal 상태 업데이터 등록
 */
export function registerModalStateSetter(setter: (state: ErrorModalState) => void) {
  setModalState = setter;
  return () => {
    setModalState = null;
  };
}