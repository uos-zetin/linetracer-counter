import type { ReactNode } from "react";
import { BaseModal } from "./base-modal";
import { IconX } from "./icon-x";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  /** Skeleton 레벨에서 배경 클릭으로 닫힘 여부(기본 true) */
  closeOnBackdrop?: boolean;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
} as const;

/**
 * Modal (Skeleton)
 * 헤더/본문/푸터 영역 레이아웃을 가지며 BaseModal 위에 얹혀 있습니다.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  closeOnBackdrop = true,
}: ModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} closeOnBackdrop={closeOnBackdrop}>
      <div
        className={`w-full rounded-lg bg-white shadow-xl ${sizeClasses[size]} transform transition-all duration-300 ease-out animate-in fade-in zoom-in-95`}
      >
        {(title || showCloseButton) && (
          <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
            {showCloseButton && (
              <button
                onClick={onClose}
                aria-label="모달 닫기"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <IconX className="w-6 h-6" />
              </button>
            )}
          </header>
        )}

        <section>{children}</section>
      </div>
    </BaseModal>
  );
}
