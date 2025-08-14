import React from "react";
import { Card, CardContent, Button, Input, Label, Plus, Loader2 } from "@/shared/ui";

interface ManualRecordInputProps {
  value: string;
  note: string;
  isCreatingRecord: boolean;
  onValueChange: (value: string) => void;
  onNoteChange: (note: string) => void;
  onCreate: () => void;
}

export const ManualRecordInput = React.memo(
  ({ value, note, isCreatingRecord, onValueChange, onNoteChange, onCreate }: ManualRecordInputProps) => {
    return (
      <Card>
        <CardContent className="px-6">
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>기록 수동 추가</span>
          </h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="record-value" className="pb-1 text-xs text-muted-foreground">
                기록값 (밀리초)
              </Label>
              <Input
                id="record-value"
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                placeholder="예: 15340 (15.34초)"
              />
            </div>
            <div>
              <Label htmlFor="record-note" className="pb-1 text-xs text-muted-foreground">
                메모 (선택사항)
              </Label>
              <Input
                id="record-note"
                type="text"
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
                placeholder="기록에 대한 설명"
              />
            </div>
            <Button
              onClick={onCreate}
              disabled={isCreatingRecord || !value.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isCreatingRecord && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isCreatingRecord ? "생성 중..." : "계수 기록 추가"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
);
