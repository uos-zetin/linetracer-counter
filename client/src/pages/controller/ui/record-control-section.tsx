import { useState, useMemo } from "react";
import { formatElapsedMs } from "@/entities/counter";
import type { RecordStatus, RecordSource } from "@/entities/record";
import { useProgressService } from "@/features/progress";
import { useRecordService } from "@/features/record";

export const RecordControlSection = () => {
  const progressService = useProgressService();
  const recordService = useRecordService();

  const [selectedManualRecords, setSelectedManualRecords] = useState<string[]>([]);
  const [manualRecordValue, setManualRecordValue] = useState("");
  const [manualRecordNote, setManualRecordNote] = useState("");
  const [isCreatingRecord, setIsCreatingRecord] = useState(false);

  const progress = progressService?.useProgress() || null;
  const runner = progress?.runner;
  const manualRecords = useMemo(() => runner?.manualRecords || [], [runner?.manualRecords]);

  // Manual records 취합 계산
  const aggregatedValue = useMemo(() => {
    const selectedRecords = manualRecords.filter((record) => selectedManualRecords.includes(record.id));

    if (selectedRecords.length === 0) return null;

    const sortedValues = selectedRecords.map((record) => record.value).sort((a, b) => a - b);

    if (sortedValues.length % 2 === 1) {
      // 홀수개: 중간값
      const middleIndex = Math.floor(sortedValues.length / 2);
      return sortedValues[middleIndex];
    } else {
      // 짝수개: 중간 2개의 평균
      const middle1 = sortedValues[sortedValues.length / 2 - 1];
      const middle2 = sortedValues[sortedValues.length / 2];
      return (middle1 + middle2) / 2;
    }
  }, [manualRecords, selectedManualRecords]);

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
    if (!runner || !recordService || aggregatedValue === null) return;

    setIsCreatingRecord(true);
    try {
      await recordService.admin.create(runner.participant.id, {
        value: aggregatedValue,
        source: "manual" as RecordSource,
        note: `${selectedManualRecords.length}개 수동 기록 취합: ${selectedManualRecords
          .map((id) => {
            const record = manualRecords.find((r) => r.id === id);
            return record ? `${record.value}` : "";
          })
          .join(", ")}`,
      });

      // 성공 후 선택 초기화
      setSelectedManualRecords([]);
    } catch (error) {
      console.error("Failed to create record from manual records:", error);
    } finally {
      setIsCreatingRecord(false);
    }
  };

  // 임의 Record 생성
  const handleCreateManualRecord = async () => {
    if (!runner || !recordService || !manualRecordValue.trim()) return;

    const value = parseFloat(manualRecordValue);
    if (isNaN(value)) {
      alert("올바른 숫자를 입력해주세요.");
      return;
    }

    setIsCreatingRecord(true);
    try {
      await recordService.admin.create(runner.participant.id, {
        value,
        source: "manual" as RecordSource,
        note: manualRecordNote || "수동 입력 기록",
      });

      // 성공 후 입력 필드 초기화
      setManualRecordValue("");
      setManualRecordNote("");
    } catch (error) {
      console.error("Failed to create manual record:", error);
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
      console.error("Failed to update record status:", error);
    }
  };

  // 시간 포맷팅 (기존 formatter 사용)
  const formatValue = (value: number) => {
    return formatElapsedMs(value).toString();
  };

  if (!progressService || !recordService) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">기록 관리</h2>
        <p className="text-red-500">서비스를 사용할 수 없습니다.</p>
      </div>
    );
  }

  if (!runner) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">기록 관리</h2>
        <p className="text-gray-500">현재 참가자가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">기록 관리</h2>

      <div className="space-y-6">
        {/* 현재 참가자 정보 */}
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">현재 참가자</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">이름:</span>
              <span className="text-sm font-medium text-gray-900">{runner.participant.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">소속:</span>
              <span className="text-sm text-gray-900">{runner.participant.teamName || "없음"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">기록 수:</span>
              <span className="text-sm text-gray-900">{runner.records.length}개</span>
            </div>
          </div>
        </div>

        {/* Manual Records 취합 */}
        {manualRecords.length > 0 && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">수동 기록 취합</h3>
              <button onClick={toggleAllManualRecords} className="text-xs text-blue-600 hover:text-blue-800">
                {selectedManualRecords.length === manualRecords.length ? "모두 해제" : "모두 선택"}
              </button>
            </div>

            <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
              {manualRecords.map((record) => (
                <label key={record.id} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedManualRecords.includes(record.id)}
                    onChange={() => toggleManualRecord(record.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-900 flex-1">
                    {formatValue(record.value)} - {record.recorderName}
                  </span>
                </label>
              ))}
            </div>

            {selectedManualRecords.length > 0 && (
              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">취합된 기록:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {aggregatedValue ? formatValue(aggregatedValue) : ""}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  {selectedManualRecords.length}개 기록 {selectedManualRecords.length % 2 === 1 ? "중간값" : "평균값"}
                </div>
                <button
                  onClick={handleCreateFromManualRecords}
                  disabled={isCreatingRecord}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm transition-colors"
                >
                  {isCreatingRecord ? "생성 중..." : "기록 생성"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* 임의 Record 생성 */}
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">수동 기록 입력</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">기록값 (밀리초)</label>
              <input
                type="number"
                step="0.01"
                value={manualRecordValue}
                onChange={(e) => setManualRecordValue(e.target.value)}
                placeholder="예: 15340 (15.34초)"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">메모 (선택사항)</label>
              <input
                type="text"
                value={manualRecordNote}
                onChange={(e) => setManualRecordNote(e.target.value)}
                placeholder="기록에 대한 설명"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={handleCreateManualRecord}
              disabled={isCreatingRecord || !manualRecordValue.trim()}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm transition-colors"
            >
              {isCreatingRecord ? "생성 중..." : "기록 추가"}
            </button>
          </div>
        </div>

        {/* 현재 참가자 Records */}
        {runner.records.length > 0 && (
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">현재 기록 ({runner.records.length}개)</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {runner.records.map((record) => (
                <div key={record.id} className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-mono font-bold">{formatValue(record.value)}</span>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          record.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : record.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {record.status === "approved" ? "승인" : record.status === "rejected" ? "거부" : "대기"}
                      </span>
                      <span className="text-xs text-gray-500">{record.source}</span>
                    </div>
                  </div>

                  {record.note && <p className="text-xs text-gray-600 mb-2">{record.note}</p>}

                  {record.status === "pending" && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateRecordStatus(record.id, "approved")}
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => handleUpdateRecordStatus(record.id, "rejected")}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                      >
                        거부
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
