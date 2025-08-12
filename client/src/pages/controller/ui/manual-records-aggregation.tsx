import React from "react";
import { Loader2, Calculator } from "lucide-react";
import { Card, CardContent, Button, Label, Checkbox } from "@/shared/ui";
import { formatElapsedMs } from "@/entities/counter";
import type { ManualRecord } from "@/entities/manual-record";
import type { RecordForm } from "@/entities/record";

interface ManualRecordsAggregationProps {
  manualRecords: ManualRecord[];
  selectedManualRecords: string[];
  aggregatedRecord: RecordForm | null;
  isCreatingRecord: boolean;
  onToggleRecord: (recordId: string) => void;
  onToggleAll: () => void;
  onCreate: () => void;
}

export const ManualRecordsAggregation = React.memo(({
  manualRecords,
  selectedManualRecords,
  aggregatedRecord,
  isCreatingRecord,
  onToggleRecord,
  onToggleAll,
  onCreate,
}: ManualRecordsAggregationProps) => {
  // 시간 포맷팅 함수
  const formatValue = (value: number) => {
    return formatElapsedMs(value).toString();
  };

  const selectedRecords = manualRecords.filter((record) => selectedManualRecords.includes(record.id));

  if (manualRecords.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="px-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>수동 계수 기록 취합</span>
          </h3>
          <Button variant="ghost" size="sm" onClick={onToggleAll} className="text-xs h-auto p-1">
            {selectedManualRecords.length === manualRecords.length ? "모두 해제" : "모두 선택"}
          </Button>
        </div>

        <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
          {manualRecords.map((record) => (
            <div key={record.id} className="flex items-center space-x-3">
              <Checkbox
                id={record.id}
                checked={selectedManualRecords.includes(record.id)}
                onCheckedChange={() => onToggleRecord(record.id)}
              />
              <Label htmlFor={record.id} className="text-sm text-foreground flex-1 cursor-pointer">
                {formatValue(record.value)} - {record.recorderName}
              </Label>
            </div>
          ))}
        </div>

        {selectedManualRecords.length > 0 && (
          <div className="border-t pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">취합된 기록:</span>
              <span className="text-sm font-medium text-foreground">
                {aggregatedRecord ? formatValue(aggregatedRecord.value) : ""}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mb-3">
              {selectedRecords.length}개 계수 기록 {selectedRecords.length % 2 === 1 ? "중간값" : "평균값"}
            </div>
            <Button onClick={onCreate} disabled={isCreatingRecord} className="w-full">
              {isCreatingRecord && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isCreatingRecord ? "생성 중..." : "계수 기록 생성"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
