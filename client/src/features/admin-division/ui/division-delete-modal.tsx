import { ConfirmModal } from "@/shared/ui";
import type { Division } from "@/entities/division";

interface DivisionDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  division: Division | null;
}

export function DivisionDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  division,
}: DivisionDeleteModalProps) {
  if (!division) {
    return null;
  }

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="부문 삭제"
      message={`'${division.name}' 부문을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
      confirmText="삭제"
      cancelText="취소"
      variant="danger"
    />
  );
}