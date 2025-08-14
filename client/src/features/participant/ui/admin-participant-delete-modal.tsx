import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button, AlertTriangle } from "@/shared/ui";
import type { Participant } from "@/entities/participant";

interface ParticipantDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  participant: Participant | null;
}

export function AdminParticipantDeleteModal({ isOpen, onClose, onConfirm, participant }: ParticipantDeleteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!participant) return null;

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>참가자 삭제</DialogTitle>
          <DialogDescription>참가자를 삭제하면 되돌릴 수 없습니다.</DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-3 py-4">
          <AlertTriangle className="w-6 h-6 shrink-0 text-red-600" />
          <p className="text-sm text-gray-700">
            '{participant.name}' 참가자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            취소
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? "삭제 중..." : "삭제"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
