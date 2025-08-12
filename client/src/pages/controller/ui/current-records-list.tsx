import React from "react";
import { Check, X, List } from "lucide-react";
import { Card, CardContent, Button, Badge } from "@/shared/ui";
import { formatElapsedMs } from "@/entities/counter";
import type { Record, RecordStatus } from "@/entities/record";

interface CurrentRecordsListProps {
  records: Record[];
  onUpdateStatus: (recordId: string, status: RecordStatus) => void;
}

export const CurrentRecordsList = React.memo(({ records, onUpdateStatus }: CurrentRecordsListProps) => {
  // 시간 포맷팅 함수
  const formatValue = (value: number) => {
    return formatElapsedMs(value).toString();
  };

  if (records.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="px-6">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
          <List className="h-4 w-4" />
          <span>현재 기록</span>
          <Badge variant="secondary">{records.length}개</Badge>
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {records.map((record) => (
            <Card key={record.id} className="py-4">
              <CardContent className="px-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-mono font-bold text-foreground">{formatValue(record.value)}</span>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        record.status === "approved"
                          ? "default"
                          : record.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {record.status === "approved" ? "승인" : record.status === "rejected" ? "거부" : "대기"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {record.source}
                    </Badge>
                  </div>
                </div>

                {record.note && <p className="text-xs text-muted-foreground mb-2">{record.note}</p>}

                {record.status === "pending" && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => onUpdateStatus(record.id, "approved")}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-xs"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      승인
                    </Button>
                    <Button
                      onClick={() => onUpdateStatus(record.id, "rejected")}
                      size="sm"
                      variant="destructive"
                      className="text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      거부
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
