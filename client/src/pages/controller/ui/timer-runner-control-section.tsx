import { useProgressService } from "@/features/progress";
import { useAdminDivisionService } from "@/features/admin-division";
import { useTimerControlService } from "@/features/timer-control";
import { formatElapsedMs } from "@/entities/counter";
import { integrateLogs, useCountdownTimer } from "@/entities/timer";
import { useState, useCallback, useMemo } from "react";

export const TimerRunnerControlSection = () => {
  const progressService = useProgressService();
  const divisionService = useAdminDivisionService();
  const timerControlService = useTimerControlService();

  const [isProcessing, setIsProcessing] = useState(false);
  const [customTimeAdjustment, setCustomTimeAdjustment] = useState("");

  const progress = progressService?.useProgress() || null;
  const runner = progress?.runner;
  const division = progress?.division;

  // TimerState 계산 (integrateLogs 사용)
  const timerState = useMemo(() => {
    if (!runner?.timerLogs || !division?.timeLimit) return null;
    return integrateLogs(division.timeLimit, runner.timerLogs);
  }, [runner?.timerLogs, division?.timeLimit]);

  // 더미 TimerState (Hook 조건부 호출 방지)
  const dummyTimerState = useMemo(
    () => ({
      initialMs: 0,
      offsetMs: 0,
      accumulatedMs: 0,
      startedAt: null,
    }),
    [],
  );

  const countdownResult = useCountdownTimer(timerState || dummyTimerState);
  const liveRemainingTimeMs = timerState ? countdownResult : null;

  // 타이머 제어 함수들
  const handleStartTimer = useCallback(async () => {
    if (!timerControlService || !runner?.participant.id) return;

    try {
      await timerControlService.startTimer(runner.participant.id);
    } catch (error) {
      console.error("Failed to start timer:", error);
    }
  }, [timerControlService, runner?.participant.id]);

  const handleStopTimer = useCallback(async () => {
    if (!timerControlService || !runner?.participant.id) return;

    try {
      await timerControlService.stopTimer(runner.participant.id);
    } catch (error) {
      console.error("Failed to stop timer:", error);
    }
  }, [timerControlService, runner?.participant.id]);

  const handleAddTime = useCallback(
    async (timeMs: number) => {
      if (!timerControlService || !runner?.participant.id) return;

      try {
        await timerControlService.adjustTimer(runner.participant.id, "add", timeMs);
      } catch (error) {
        console.error("Failed to add time:", error);
      }
    },
    [timerControlService, runner?.participant.id],
  );

  const handleSubtractTime = useCallback(
    async (timeMs: number) => {
      if (!timerControlService || !runner?.participant.id) return;

      try {
        await timerControlService.adjustTimer(runner.participant.id, "sub", timeMs);
      } catch (error) {
        console.error("Failed to subtract time:", error);
      }
    },
    [timerControlService, runner?.participant.id],
  );

  const handleCustomTimeAdjustment = useCallback(() => {
    const adjustment = parseInt(customTimeAdjustment);
    if (isNaN(adjustment) || adjustment === 0) {
      alert("올바른 시간 값을 입력해주세요 (0이 아닌 숫자)");
      return;
    }

    if (adjustment > 0) {
      handleAddTime(Math.abs(adjustment));
    } else {
      handleSubtractTime(Math.abs(adjustment));
    }

    setCustomTimeAdjustment("");
  }, [customTimeAdjustment, handleAddTime, handleSubtractTime]);

  const handlePostponeRunner = useCallback(async () => {
    if (!progressService || !division?.id || !runner?.participant.id) return;

    if (confirm(`${runner.participant.name}을(를) 마지막 순번으로 미루시겠습니까?`)) {
      setIsProcessing(true);
      try {
        await progressService.postponeCurrentRunner(division.id);
      } catch (error) {
        console.error("Failed to postpone runner:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  }, [progressService, division?.id, runner?.participant.id, runner?.participant.name]);

  if (!progressService || !divisionService || !timerControlService) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">타이머 & 참가자 제어</h2>
        <p className="text-red-500">서비스를 사용할 수 없습니다.</p>
      </div>
    );
  }

  if (!runner || !timerState || !division) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">타이머 & 참가자 제어</h2>
        <p className="text-gray-500">현재 참가자가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">타이머 & 참가자 제어</h2>

      <div className="space-y-6">
        {/* 구역 1: Countdown 타이머 */}
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">대회 타이머 - {runner.participant.name}</h3>

          {/* 실시간 남은 시간 표시 */}
          <div className="text-center mb-4">
            <div className="text-4xl font-mono font-bold text-gray-900 mb-2">
              {liveRemainingTimeMs !== null ? formatElapsedMs(liveRemainingTimeMs).toString() : "00:00.000"}
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  timerState.startedAt
                    ? "bg-green-100 text-green-800"
                    : liveRemainingTimeMs === 0
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {timerState.startedAt ? "실행 중" : liveRemainingTimeMs === 0 ? "시간 종료" : "정지"}
              </span>
            </div>
          </div>

          {/* 타이머 정보 */}
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">제한 시간:</span>
                <span className="font-mono">{formatElapsedMs(division.timeLimit).toString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">누적 시간:</span>
                <span className="font-mono">{formatElapsedMs(timerState.accumulatedMs).toString()}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">시간 조정:</span>
                <span className="font-mono">
                  {timerState.offsetMs >= 0 ? "+" : "-"}
                  {formatElapsedMs(Math.abs(timerState.offsetMs)).toString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">상태:</span>
                <span className={timerState.startedAt ? "text-green-600" : "text-gray-600"}>
                  {timerState.startedAt ? "측정 중" : "정지"}
                </span>
              </div>
            </div>
          </div>

          {/* 타이머 제어 버튼들 */}
          <div className="space-y-3">
            {/* 시작/정지 버튼 */}
            <div className="flex space-x-2">
              <button
                onClick={handleStartTimer}
                disabled={!!timerState.startedAt}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded text-sm flex-1"
              >
                시작
              </button>
              <button
                onClick={handleStopTimer}
                disabled={!timerState.startedAt}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-4 py-2 rounded text-sm flex-1"
              >
                정지
              </button>
            </div>

            {/* 빠른 시간 조정 버튼들 */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleSubtractTime(10000)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-2 rounded text-xs"
              >
                -10초
              </button>
              <button
                onClick={() => handleSubtractTime(1000)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-2 rounded text-xs"
              >
                -1초
              </button>
              <button
                onClick={() => handleAddTime(1000)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-2 rounded text-xs"
              >
                +1초
              </button>
              <button
                onClick={() => handleAddTime(10000)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-2 rounded text-xs"
              >
                +10초
              </button>
            </div>

            {/* 커스텀 시간 조정 */}
            <div className="flex items-center space-x-2 border-t pt-3">
              <label className="text-sm text-gray-600 whitespace-nowrap">직접 입력:</label>
              <input
                type="number"
                value={customTimeAdjustment}
                onChange={(e) => setCustomTimeAdjustment(e.target.value)}
                placeholder="±ms (예: 5000, -3000)"
                className="border border-gray-300 rounded px-2 py-1 text-sm flex-1"
              />
              <button
                onClick={handleCustomTimeAdjustment}
                disabled={!customTimeAdjustment || customTimeAdjustment === "0"}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-3 py-1 rounded text-sm"
              >
                적용
              </button>
            </div>
          </div>
        </div>

        {/* 구역 2: 현재 Runner 정보 */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">현재 참가자</h3>
            <button
              onClick={handlePostponeRunner}
              disabled={isProcessing}
              className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-3 py-1 rounded text-xs"
            >
              {isProcessing ? "처리 중..." : "마지막 순번으로 미루기"}
            </button>
          </div>

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
              <span className="text-sm text-gray-600">타이머 로그:</span>
              <span className="text-sm text-gray-900">{runner.timerLogs.length}개</span>
            </div>
          </div>

          {/* 타이머 로그 상세 */}
          {runner.timerLogs.length > 0 && (
            <div className="mt-3 border-t pt-3">
              <h4 className="text-xs font-medium text-gray-600 mb-2">타이머 로그</h4>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {runner.timerLogs.map((log) => (
                  <div key={log.id} className="text-xs text-gray-600 font-mono">
                    {new Date(log.createdAt).toLocaleTimeString()} - {log.type}: {formatElapsedMs(log.value).toString()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
