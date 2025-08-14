import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Button,
  Label,
} from "@/shared/ui";
import type { Division } from "@/entities/division";
import type { Participant } from "@/entities/participant";
import { useProgressService } from "@/features/progress";

interface CompetitionOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  divisions: Division[];
  participants: Participant[];
  getParticipantName: (participantId: string) => string;
}

export const CompetitionOrderModal = ({ open, onOpenChange, divisions, participants }: CompetitionOrderModalProps) => {
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");
  const [participantOrder, setParticipantOrder] = useState<string[]>([]);
  const [currentRunnerId, setCurrentRunnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const progressSerive = useProgressService();

  // 부문 선택 시 경연 순서 조회
  useEffect(() => {
    // API 호출로 경연 순서 조회
    const fetchParticipantOrder = async (divisionId: string) => {
      setLoading(true);
      try {
        // 경연 순서 조회
        const order = await progressSerive.load.order(divisionId);
        setParticipantOrder(order);

        // 현재 경연자 정보 조회
        const progressData = await progressSerive.load.byDivision(divisionId);
        setCurrentRunnerId(progressData?.runner?.participant?.id || null);
      } catch (error) {
        console.error("Failed to fetch participant order:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedDivisionId) {
      fetchParticipantOrder(selectedDivisionId);
    }
  }, [selectedDivisionId, progressSerive]);

  // 모달이 열릴 때 첫 번째 부문 자동 선택
  useEffect(() => {
    if (open && divisions.length > 0 && !selectedDivisionId) {
      setSelectedDivisionId(divisions[0].id);
    }
  }, [open, divisions, selectedDivisionId]);

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!open) {
      setSelectedDivisionId("");
      setParticipantOrder([]);
      setCurrentRunnerId(null);
    }
  }, [open]);

  const selectedDivision = divisions.find((d) => d.id === selectedDivisionId);

  const getParticipantInfo = (participantId: string) => {
    return participants.find((p) => p.id === participantId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">경연 순서</DialogTitle>
          <DialogDescription>부문별 참가자들의 경연 순서를 확인할 수 있습니다.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 부문 선택 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">부문 선택</Label>
            <Select value={selectedDivisionId} onValueChange={setSelectedDivisionId}>
              <SelectTrigger>
                <SelectValue placeholder="부문을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {divisions.map((division) => (
                  <SelectItem key={division.id} value={division.id}>
                    {division.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 경연 순서 리스트 */}
          {selectedDivision && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{selectedDivision.name} 경연 순서</Label>
                <Badge variant="outline" className="text-xs">
                  {participantOrder.length}명
                </Badge>
              </div>

              {loading ? (
                <div className="text-center py-8 text-sm text-muted-foreground">로딩 중...</div>
              ) : participantOrder.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">경연이 진행되고 있지 않습니다.</div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {participantOrder.map((participantId, index) => {
                      const participant = getParticipantInfo(participantId);
                      const isCurrentRunner = participantId === currentRunnerId;

                      return (
                        <div
                          key={participantId}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            isCurrentRunner ? "border-primary bg-primary/5" : "border-border"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                isCurrentRunner
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{participant?.name || "Unknown"}</p>
                              {participant?.teamName && (
                                <p className="text-xs text-muted-foreground">{participant.teamName}</p>
                              )}
                            </div>
                          </div>
                          {isCurrentRunner && <Badge className="text-xs">진행 중</Badge>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
