import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui/dialog";
import { getInitialModalState, registerModalStateSetter } from "../lib/modal-controller";

/**
 * 에러 모달 컴포넌트
 */
export function ErrorModal() {
  const [state, setState] = useState(getInitialModalState());

  // 상태 업데이트 함수 등록
  useEffect(() => {
    return registerModalStateSetter(setState);
  }, []);

  const handleClose = () => {
    if (!state.config) return;

    // 모달 닫기
    setState({
      isOpen: false,
      config: null,
      onAction: undefined,
    });

    // 액션 콜백이 있으면 호출
    if (state.onAction) {
      state.onAction();
    } else {
      // 기본 액션 처리
      switch (state.config.actionType) {
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
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  if (!state.config) {
    return null;
  }

  return (
    <Dialog open={state.isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle className="text-lg">
              {state.config.title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {state.config.message}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button onClick={handleClose} className="w-full">
            {state.config.actionText || "확인"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}