import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, FileText, AlertCircle } from "@/shared/ui";
import type { RecordStatus } from "@/entities/record";
import { useErrorHandlingService } from "@/features/error-handling";
import { useProgressService } from "@/features/progress";
import { useRecordService } from "@/features/record";
import { aggregateManualRecords } from "../lib/record-aggregation";
import { CurrentParticipantInfo } from "./current-participant-info";
import { CurrentRecordsList } from "./current-records-list";
import { ManualRecordInput } from "./manual-record-input";
import { ManualRecordsAggregation } from "./manual-records-aggregation";

export const RecordControlSection = () => {
  const progressService = useProgressService();
  const recordService = useRecordService();
  const errorHandler = useErrorHandlingService();

  const [selectedManualRecords, setSelectedManualRecords] = useState<string[]>([]);
  const [manualRecordValue, setManualRecordValue] = useState("");
  const [manualRecordNote, setManualRecordNote] = useState("");
  const [isCreatingRecord, setIsCreatingRecord] = useState(false);

  const progress = progressService?.use.progress() || null;
  const runner = progress?.runner;
  const manualRecords = runner?.manualRecords || [];

  // Manual records 취합 계산
  const selectedRecords = manualRecords.filter((record) => selectedManualRecords.includes(record.id));
  const aggregatedRecord = aggregateManualRecords(selectedRecords);

  // Manual record 체크박스 토글
  const toggleManualRecord = (recordId: string) => {
    setSelectedManualRecords((prev) =>
      prev.includes(recordId) ? prev.filter((id) => id !== recordId) : [...prev, recordId]
    );
  };

  // 모든 manual record 선택/해제
  const toggleAllManualRecords = () => {
    if (selectedManualRecords.length === manualRecords.length) {
      setSelectedManualRecords([]);
    } else {
      setSelectedManualRecords(manualRecords.map((record) => record.id));
    }
  };

  // Manual records 취합해서 Record 생성
  const handleCreateFromManualRecords = async () => {
    if (!runner || !recordService || !aggregatedRecord) return;

    setIsCreatingRecord(true);
    try {
      await recordService.admin.create(runner.participant.id, aggregatedRecord);
      // 성공 후 선택 초기화
      setSelectedManualRecords([]);
    } catch (error) {
      errorHandler.handle(error as Error, "수동 계수 기록 취합에 실패했습니다");
    } finally {
      setIsCreatingRecord(false);
    }
  };

  // 임의 Record 생성
  const handleCreateManualRecord = async () => {
    if (!runner || !recordService || !manualRecordValue.trim()) return;

    const value = parseFloat(manualRecordValue);
    if (isNaN(value)) {
      errorHandler.handle(new Error("Invalid number"), "올바른 숫자를 입력해주세요");
      return;
    }

    setIsCreatingRecord(true);
    try {
      await recordService.admin.create(runner.participant.id, {
        value,
        source: "other",
        note: manualRecordNote || "수동 추가된 기록",
      });

      // 성공 후 입력 필드 초기화
      setManualRecordValue("");
      setManualRecordNote("");
    } catch (error) {
      errorHandler.handle(error as Error, "기록 수동 추가에 실패했습니다");
    } finally {
      setIsCreatingRecord(false);
    }
  };

  // Record 상태 변경
  const handleUpdateRecordStatus = async (recordId: string, status: RecordStatus) => {
    if (!recordService) return;

    try {
      await recordService.admin.updateStatus(recordId, status);
    } catch (error) {
      errorHandler.handle(error as Error, "기록 상태 업데이트에 실패했습니다");
    }
  };

  if (!progressService || !recordService) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>기록 관리</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p>서비스를 사용할 수 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!runner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>기록 관리</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6">
          <p className="text-muted-foreground">현재 참가자가 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>기록 관리</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 space-y-6">
        {/* 현재 참가자 정보 */}
        <CurrentParticipantInfo runner={runner} />

        {/* 수동 계수 기록 취합 */}
        <ManualRecordsAggregation
          manualRecords={manualRecords}
          selectedManualRecords={selectedManualRecords}
          aggregatedRecord={aggregatedRecord}
          isCreatingRecord={isCreatingRecord}
          onToggleRecord={toggleManualRecord}
          onToggleAll={toggleAllManualRecords}
          onCreate={handleCreateFromManualRecords}
        />

        {/* 기록 수동 추가 */}
        <ManualRecordInput
          value={manualRecordValue}
          note={manualRecordNote}
          isCreatingRecord={isCreatingRecord}
          onValueChange={setManualRecordValue}
          onNoteChange={setManualRecordNote}
          onCreate={handleCreateManualRecord}
        />

        {/* 현재 참가자 Records */}
        <CurrentRecordsList records={runner.records} onUpdateStatus={handleUpdateRecordStatus} />
      </CardContent>
    </Card>
  );
};
