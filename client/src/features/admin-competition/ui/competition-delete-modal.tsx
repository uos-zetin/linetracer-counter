import { useState } from "react";
import { Modal, ModalFooter, IconAlert } from "@/shared/ui";
import type { Competition } from "@/entities/competition";

interface CompetitionDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  competition: Competition | null;
}

/**
 * CompetitionDeleteModal – SkeletonModal 기반 삭제 확인 다이얼로그
 * lucide‑react 제거 & IconAlert 사용
 */
export function CompetitionDeleteModal({ isOpen, onClose, onConfirm, competition }: CompetitionDeleteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!competition) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      closeOnBackdrop={false}
      title="대회 삭제"
    >
      <div className="px-6 pt-6 flex items-start gap-3">
        <IconAlert className="w-6 h-6 shrink-0 text-red-600" />
        <p className="text-sm text-gray-700">
          '{competition.name}' 대회를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
        </p>
      </div>

      <ModalFooter>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
          {isSubmitting ? "삭제 중..." : "삭제"}
        </button>
      </ModalFooter>
    </Modal>
  );
}
