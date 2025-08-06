import { useState, useEffect } from "react";
import { formatElapsedMs } from "@/entities/counter";
import { useCounterService } from "@/features/counter";

interface StopwatchControlSectionProps {
  counterId: string;
}

export const StopwatchControlSection = ({ counterId }: StopwatchControlSectionProps) => {
  const counterService = useCounterService();
  const [currentTime, setCurrentTime] = useState(Date.now());

  const counter = counterService?.useCounterState(counterId) || null;
  const stopwatch = counterService?.useStopwatch(counterId) || null;

  // 실시간 시간 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10); // 10ms 간격으로 업데이트

    return () => clearInterval(interval);
  }, []);

  // 경과 시간 계산
  const getElapsedTime = () => {
    if (!stopwatch?.startedAt || !counterService) return 0;

    // 종료시간이 있으면 종료시간 기준으로 계산, 없으면 현재시간 기준
    const endTime = stopwatch.stoppedAt || currentTime;
    return counterService.getElapsedMs(counterId, endTime);
  };

  // 시간 포맷팅 (기존 formatter 사용)
  const formatTime = (ms: number) => {
    return formatElapsedMs(ms).toString();
  };

  const handleReset = async () => {
    if (!counterService) return;

    if (confirm("스톱워치를 리셋하시겠습니까?")) {
      try {
        await counterService.reset(counterId);
      } catch (error) {
        console.error("스톱워치 리셋 실패:", error);
      }
    }
  };

  // 상태 계산
  const isRunning = stopwatch?.startedAt && !stopwatch?.stoppedAt;
  const isStopped = stopwatch?.startedAt && stopwatch?.stoppedAt;
  const isIdle = !stopwatch?.startedAt;

  const elapsedTime = getElapsedTime();

  if (!counterService) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">스톱워치 모니터</h2>
        <p className="text-red-500">카운터 서비스를 사용할 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">스톱워치 모니터</h2>
      <p className="text-sm text-gray-600 mb-6">센서에 의해 자동으로 측정됩니다</p>

      <div className="space-y-6">
        {/* 시간 표시 */}
        <div className="text-center">
          <div className="text-6xl font-mono font-bold text-gray-900 mb-4">{formatTime(elapsedTime)}</div>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span
              className={`px-4 py-2 text-lg rounded-full font-medium ${
                isRunning
                  ? "bg-green-100 text-green-800"
                  : isStopped
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
              }`}
            >
              {isRunning ? "측정 중" : isStopped ? "측정 완료" : "대기 중"}
            </span>
          </div>

          {/* 시작/종료 시간 표시 */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="font-medium text-gray-700">시작 시간</div>
              <div className="font-mono">
                {stopwatch?.startedAt ? new Date(stopwatch.startedAt).toLocaleTimeString() : "---"}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="font-medium text-gray-700">종료 시간</div>
              <div className="font-mono">
                {stopwatch?.stoppedAt ? new Date(stopwatch.stoppedAt).toLocaleTimeString() : "---"}
              </div>
            </div>
          </div>
        </div>

        {/* 리셋 버튼 */}
        {!isIdle && (
          <div className="flex justify-center">
            <button
              onClick={handleReset}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              리셋
            </button>
          </div>
        )}

        {/* 카운터 정보 */}
        {counter && (
          <div className="border-t pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">카운터 정보</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">ID:</span>
                <span className="text-sm font-mono text-gray-900">{counter.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">이름:</span>
                <span className="text-sm text-gray-900">{counter.name || "이름 없음"}</span>
              </div>
              {counter.divisionId && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Division:</span>
                  <span className="text-sm font-mono text-gray-900">{counter.divisionId}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
