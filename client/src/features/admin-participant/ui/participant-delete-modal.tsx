import { ConfirmModal } from "@/shared/ui";
import type { Participant } from "@/entities/participant";

interface ParticipantDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  participant: Participant | null;
}

export function ParticipantDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  participant,
}: ParticipantDeleteModalProps) {
  if (!participant) {
    return null;
  }

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="참가자 삭제"
      message={`'${participant.name}' 참가자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
      confirmText="삭제"
      cancelText="취소"
      variant="danger"
    />
  );
}