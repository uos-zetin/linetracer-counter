import React from "react";
import { Card, CardContent, Badge, User } from "@/shared/ui";
import type { Runner } from "@/features/progress";

interface CurrentParticipantInfoProps {
  runner: Runner;
}

export const CurrentParticipantInfo = React.memo(({ runner }: CurrentParticipantInfoProps) => {
  return (
    <Card>
      <CardContent className="px-6">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span>현재 참가자</span>
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">이름:</span>
            <span className="text-sm font-medium text-foreground">{runner.participant.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">소속:</span>
            <span className="text-sm text-foreground">{runner.participant.teamName || "없음"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">기록 수:</span>
            <Badge variant="outline">{runner.records.length}개</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">코멘트:</span>
            <span className="text-sm font-medium text-foreground">{runner.participant.comment}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
