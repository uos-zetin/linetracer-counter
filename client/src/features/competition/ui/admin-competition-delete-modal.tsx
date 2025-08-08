import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button } from "@/shared/ui";
import { AlertTriangle } from "lucide-react";
import type { Competition } from "@/entities/competition";

interface CompetitionDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  competition: Competition | null;
}

export function AdminCompetitionDeleteModal({ isOpen, onClose, onConfirm, competition }: CompetitionDeleteModalProps) {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>대회 삭제</DialogTitle>
          <DialogDescription>
            대회를 삭제하면 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-start gap-3 py-4">
          <AlertTriangle className="w-6 h-6 shrink-0 text-red-600" />
          <p className="text-sm text-gray-700">
            '{competition.name}' 대회를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "삭제 중..." : "삭제"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
