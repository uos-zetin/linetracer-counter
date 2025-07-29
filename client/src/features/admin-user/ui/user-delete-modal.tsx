import { useState } from "react";
import { Modal, ModalFooter, IconAlert } from "@/shared"; // shared Public API
import type { User } from "@/entities/user";

interface UserDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  user: User | null;
}

export function UserDeleteModal({ isOpen, onClose, onConfirm, user }: UserDeleteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!user) return null;

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
      title="사용자 삭제"
      showCloseButton={false}
      closeOnBackdrop={false}
    >
      {/* 본문 */}
      <div className="px-6 pt-6 flex items-start gap-3">
        <IconAlert className="w-6 h-6 shrink-0 text-red-600" />
        <p className="text-sm text-gray-700">'{user.name}' 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
      </div>

      {/* 액션 */}
      <ModalFooter>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
        >
          {isSubmitting ? "삭제 중..." : "삭제"}
        </button>
      </ModalFooter>
    </Modal>
  );
}
