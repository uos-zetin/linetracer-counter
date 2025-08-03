import { useCounterService } from "@/features/counter";
import { useAdminDivisionService } from "@/features/admin-division";
import { useProgressService } from "@/features/progress";
import { useState, useEffect } from "react";

interface ProgressMonitorSectionProps {
  counterId: string;
}

export const ProgressMonitorSection = ({ counterId }: ProgressMonitorSectionProps) => {
  const counterService = useCounterService();
  const divisionService = useAdminDivisionService();
  const progressService = useProgressService();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const counter = counterService?.useCounterState(counterId) || null;
  const division = divisionService?.useDivisionById(counter?.divisionId || "") || null;
  const progress = progressService?.useProgress() || null;

  // 자동 연결/해제 로직
  useEffect(() => {
    const handleConnection = async () => {
      if (!progressService || !counter?.divisionId) return;

      const shouldConnect = division?.status === "ongoing";

      try {
        if (shouldConnect) {
          // Division이 ongoing 상태이면 progress channel 연결
          setIsConnecting(true);
          setConnectionError(null);
          await progressService.connect(counter.divisionId);
          console.log(`Progress channel connected for division: ${counter.divisionId}`);
        } else {
          // Division이 ongoing이 아니면 연결 해제
          await progressService.disconnect();
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
  }, [counter?.divisionId, division?.status, progressService]);

  // 컴포넌트 언마운트 시 연결 해제
  useEffect(() => {
    return () => {
      if (progressService) {
        progressService.disconnect().catch(console.error);
      }
    };
  }, [progressService]);

  // 연결 상태 계산
  const isConnected = division?.status === "ongoing" && progress?.division?.id === division.id && !connectionError;
  const canConnect = counter?.divisionId && division?.status === "ongoing";

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
              division?.status !== "ongoing" &&
              `Division 상태: ${division?.status || "알 수 없음"}`}
            {canConnect && "Division이 ongoing 상태일 때 자동 연결됩니다"}
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
            <h3 className="text-sm font-medium text-gray-700 mb-3">현재 참가자</h3>
            {progress.runner ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">이름:</span>
                  <span className="text-sm font-medium text-gray-900">{progress.runner.participant.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">소속:</span>
                  <span className="text-sm text-gray-900">{progress.runner.participant.teamName || "없음"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">기록 수:</span>
                  <span className="text-sm text-gray-900">{progress.runner.records.length}개</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">대기 중인 참가자가 없습니다</p>
            )}
          </div>
        )}

        {/* 대기 중인 참가자들 */}
        {isConnected && progress && progress.nextRunners.length > 0 && (
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              대기 중인 참가자 ({progress.nextRunners.length}명)
            </h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {progress.nextRunners.slice(0, 5).map((participant, index) => (
                <div key={participant.id} className="flex justify-between text-xs">
                  <span className="text-gray-600">{index + 1}.</span>
                  <span className="text-gray-900 flex-1 ml-2">{participant.name}</span>
                  <span className="text-gray-500">{participant.teamName}</span>
                </div>
              ))}
              {progress.nextRunners.length > 5 && (
                <div className="text-xs text-gray-500 text-center pt-1">외 {progress.nextRunners.length - 5}명</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
