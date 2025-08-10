import { useState, useEffect } from "react";
import { useCounterService } from "@/features/counter";
import { useDivisionService } from "@/features/division";
import { useProgressService } from "@/features/progress";

interface ProgressMonitorSectionProps {
  counterId: string;
}

export const ProgressMonitorSection = ({ counterId }: ProgressMonitorSectionProps) => {
  const counterService = useCounterService();
  const divisionService = useDivisionService();
  const progressService = useProgressService();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isSettingRunner, setIsSettingRunner] = useState(false);

  const counter = counterService?.use.counterState(counterId) || null;
  const division = divisionService?.use.divisionById(counter?.divisionId || "") || null;
  const progress = progressService?.use.progress() || null;
  const runner = progressService?.use.runner() || null;
  const nextRunners = progressService?.use.nextRunners() || [];

  // 다음 참가자를 현재 참가자로 설정
  const handleSetCurrentRunner = async () => {
    if (!counter?.divisionId || nextRunners.length === 0) return;

    const nextParticipant = nextRunners[0];

    try {
      setIsSettingRunner(true);
      await progressService.admin.setCurrentRunner(counter.divisionId, nextParticipant.id);
    } catch (error) {
      console.error("Failed to set current runner:", error);
      setConnectionError(error instanceof Error ? error.message : "참가자 설정 실패");
    } finally {
      setIsSettingRunner(false);
    }
  };

  // 자동 연결/해제 로직 - divisionId가 있으면 항상 연결
  useEffect(() => {
    const handleConnection = async () => {
      if (!progressService) return;

      try {
        if (counter?.divisionId) {
          // Counter에 divisionId가 있으면 progress channel 연결
          setIsConnecting(true);
          setConnectionError(null);
          await progressService.connection.connect(counter.divisionId);
        } else {
          // Counter에 divisionId가 없으면 연결 해제
          await progressService.connection.disconnect();
          console.log("Progress channel disconnected");
        }
      } catch (error) {
        console.error("Progress connection error:", error);
        setConnectionError(error instanceof Error ? error.message : "연결 실패");
      } finally {
        setIsConnecting(false);
      }
    };

    handleConnection();
  }, [counter?.divisionId, progressService]);

  // 컴포넌트 언마운트 시 연결 해제
  useEffect(() => {
    return () => {
      if (progressService) {
        progressService.connection.disconnect().catch(console.error);
      }
    };
  }, [progressService]);

  // 연결 상태 계산
  const isConnected = counter?.divisionId && progress?.division?.id === counter.divisionId && !connectionError;
  const canConnect = !!counter?.divisionId;

  if (!counterService || !divisionService || !progressService) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">진행 상황 모니터</h2>
        <p className="text-red-500">서비스를 사용할 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">진행 상황 모니터</h2>

      <div className="space-y-6">
        {/* 연결 상태 */}
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Progress Channel 상태</h3>

          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">연결 상태</span>
            <div className="flex items-center space-x-2">
              {isConnecting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>}
              <span
                className={`px-3 py-1 text-xs rounded-full ${
                  isConnected
                    ? "bg-green-100 text-green-800"
                    : connectionError
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {isConnecting ? "연결 중..." : isConnected ? "연결됨" : connectionError ? "연결 실패" : "연결 안됨"}
              </span>
            </div>
          </div>

          {connectionError && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">오류: {connectionError}</div>}

          <div className="text-xs text-gray-500 mt-2">
            {!counter?.divisionId && "Division이 연결되지 않음"}
            {counter?.divisionId &&
              division &&
              `Division 상태: ${division.status === "ongoing" ? "진행 중" : division.status === "ready" ? "준비" : "종료"}`}
            {canConnect && !isConnected && "Division이 연결되어 있으면 자동으로 progress channel에 연결됩니다"}
            {isConnected && "Progress channel에 연결되어 실시간 정보를 수신합니다"}
          </div>
        </div>

        {/* Division 정보 */}
        {division && (
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Division 정보</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">이름:</span>
                <span className="text-sm text-gray-900">{division.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">상태:</span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    division.status === "ongoing"
                      ? "bg-green-100 text-green-800"
                      : division.status === "ready"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {division.status === "ongoing" ? "진행 중" : division.status === "ready" ? "준비" : "종료"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 현재 러너 정보 */}
        {isConnected && progress && (
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-700">현재 참가자</h3>
              {nextRunners.length > 0 && (
                <button
                  onClick={handleSetCurrentRunner}
                  disabled={isConnecting || isSettingRunner}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSettingRunner && <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>}
                  <span>{isSettingRunner ? "설정 중..." : runner ? "다음 참가자로 변경" : "다음 참가자 시작"}</span>
                </button>
              )}
            </div>
            {runner ? (
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
                {nextRunners.length > 0 && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-blue-600">다음 참가자: {nextRunners[0].name}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">현재 참가자가 없습니다</p>
                {nextRunners.length > 0 && <p className="text-xs text-blue-600">다음 참가자: {nextRunners[0].name}</p>}
              </div>
            )}
          </div>
        )}

        {/* 대기 중인 참가자들 */}
        {isConnected && nextRunners.length > 0 && (
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">대기 중인 참가자 ({nextRunners.length}명)</h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {nextRunners.slice(0, 5).map((participant, index) => (
                <div key={participant.id} className="flex justify-between text-xs">
                  <span className="text-gray-600">{index + 1}.</span>
                  <span className="text-gray-900 flex-1 ml-2">{participant.name}</span>
                  <span className="text-gray-500">{participant.teamName}</span>
                </div>
              ))}
              {nextRunners.length > 5 && (
                <div className="text-xs text-gray-500 text-center pt-1">외 {nextRunners.length - 5}명</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
