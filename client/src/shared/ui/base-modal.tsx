import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

export interface BaseModalProps {
  /** 모달 표시 여부 */
  isOpen: boolean;
  /** ESC 키‧배경 클릭 등으로 모달이 닫힐 때 실행 */
  onClose: () => void;
  /** 모달 내부에 렌더링할 콘텐츠 */
  children: ReactNode;
  /** 배경(overlay) 클릭으로 모달을 닫을지 여부 */
  closeOnBackdrop?: boolean;
}

export function BaseModal({ isOpen, onClose, children, closeOnBackdrop = true }: BaseModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  // ESC 키 처리 & body 스크롤 잠금
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEsc);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  // 배경 클릭 시 닫기
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (!closeOnBackdrop) return;
    if (e.target === backdropRef.current) onClose();
  };

  if (!isOpen) return null;

  const node = (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  );

  return createPortal(node, document.body);
}
