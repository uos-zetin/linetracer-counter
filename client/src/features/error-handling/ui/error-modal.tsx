import { AlertTriangle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/ui/dialog";
import type { ErrorHandlingConfig } from "../model/types";

interface ErrorModalProps {
  isOpen: boolean;
  config: ErrorHandlingConfig | null;
  onAction?: () => void;
  onClose: () => void;
}

/**
 * 에러 모달 컴포넌트
 */
export function ErrorModal({ isOpen, config, onAction, onClose }: ErrorModalProps) {
  const handleClose = () => {
    if (!config) return;

    // 액션 콜백이 있으면 호출
    if (onAction) {
      onAction();
    } else {
      // 기본 액션 처리
      switch (config.actionType) {
        case "reload":
          window.location.reload();
          break;

        case "redirect":
        case "none":
        default:
          // 아무 액션도 하지 않음
          break;
      }
    }

    // 모달 닫기
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  if (!config) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle className="text-lg">{config.title}</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {config.message}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button onClick={handleClose} className="w-full">
            {config.actionText || "확인"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
