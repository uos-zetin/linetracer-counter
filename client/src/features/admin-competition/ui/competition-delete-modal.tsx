import { ConfirmModal } from "@/shared";
import type { Competition } from "@/entities/competition";

interface CompetitionDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  competition: Competition | null;
}

export function CompetitionDeleteModal({ isOpen, onClose, onConfirm, competition }: CompetitionDeleteModalProps) {
  if (!competition) {
    return null;
  }

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="대회 삭제"
      message={`'${competition.name}' 대회를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
      confirmText="삭제"
      cancelText="취소"
      variant="danger"
    />
  );
}
