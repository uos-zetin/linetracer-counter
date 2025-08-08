import { useState } from "react";
import { useParams } from "react-router";
import { formatElapsedMs, useStopwatchTimer } from "@/entities/counter";
import { useCounterService } from "@/features/counter";
import { useManualRecordService } from "@/features/manual-record";
import { useProgressService } from "@/features/progress";

export function ManualCounter() {
  const { counterId } = useParams();
  const manualRecordService = useManualRecordService();
  const progressService = useProgressService();
  const counterService = useCounterService();

  // 로컬 타이머 상태 (서버와 독립적)
  const [localStartedAt, setLocalStartedAt] = useState<number | null>(null);
  const [localStoppedAt, setLocalStoppedAt] = useState<number | null>(null);

  // Form state
  const [recorderName, setRecorderName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Counter state 가져오기 (API로부터 로드하지 않고 현재 store 상태만 참조)
  const counterState = counterService.use.counterState(counterId || "");

  // 로컬 타이머 사용 (useStopwatchTimer 훅 활용)
  const elapsedTime = useStopwatchTimer(localStartedAt, localStoppedAt);
  const timeComponents = formatElapsedMs(elapsedTime);

  // Timer 상태 계산
  const isRunning = !!(localStartedAt && !localStoppedAt);
  const hasRecord = !!(localStartedAt && localStoppedAt);

  const handleStart = () => {
    setLocalStartedAt(Date.now());
    setLocalStoppedAt(null);
  };

  const handleStop = () => {
    if (localStartedAt) {
      setLocalStoppedAt(Date.now());
    }
  };

  const handleReset = () => {
    setLocalStartedAt(null);
    setLocalStoppedAt(null);
  };

  const handleSubmit = async () => {
    if (!counterId || !recorderName.trim() || isRunning || !hasRecord) {
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. API를 통해 최신 counter 정보 로드
      const updatedCounter = await counterService.load.byId(counterId);

      // 2. 업데이트된 counter 정보 확인
      if (!updatedCounter?.divisionId) {
        throw new Error("계수기가 division에 연결되지 않았습니다.");
      }

      // 3. progress API를 통해 현재 runner 정보 가져오기
      const progress = await progressService.load.byDivision(updatedCounter.divisionId);
      const runner = progress?.runner;

      if (!runner?.participant.id) {
        throw new Error("현재 경연자 정보를 찾을 수 없습니다.");
      }

      // 5. Manual record 전송
      await manualRecordService.admin.create(runner.participant.id, {
        value: elapsedTime,
        recorderName: recorderName.trim(),
      });

      // 6. 성공 시 자동 리셋
      handleReset();
      setRecorderName("");
      alert("기록이 성공적으로 전송되었습니다!");
    } catch (error) {
      console.error("Failed to submit manual record:", error);
      alert(`기록 전송에 실패했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = !isRunning && hasRecord && recorderName.trim() && !isSubmitting;

  if (!counterId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-2xl md:text-[2vw] font-bold text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-[1vw] py-[2vw]">
      <div className="max-w-none mx-auto">
        <header className="text-center mb-[3vw]">
          <h1 className="text-3xl md:text-[5vw] font-bold text-gray-800 mb-[1vw]">수동 계수</h1>
          <p className="text-lg md:text-[2vw] text-gray-600">계수기: {decodeURIComponent(counterId)}</p>
        </header>

        <div className="bg-white rounded-lg shadow-lg px-[3vw] py-[4vw]">
          {/* Timer Display */}
          <div className="text-center mb-[4vw]">
            <div className="text-6xl md:text-[12vw] leading-none font-mono font-bold text-gray-800 mb-[2vw] flex items-baseline justify-center">
              <span>{timeComponents.minutes}</span>
              <span className="transform -translate-y-1 md:-translate-y-[0.6vw]">:</span>
              <span>{timeComponents.seconds}</span>
              <span>.</span>
              <span>{timeComponents.milliseconds}</span>
            </div>
            <div className="text-xl md:text-[2.5vw] text-gray-600">
              {isRunning ? "⏱️ 측정 중" : hasRecord ? "⏹️ 측정 완료" : "⏸️ 대기 중"}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-[2vw] mb-[4vw]">
            <button
              onClick={handleStart}
              disabled={isRunning}
              className="w-full md:w-auto px-6 py-3 md:px-[3vw] md:py-[2vw] bg-green-500 text-white font-bold text-lg md:text-[2vw] rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              시작
            </button>
            <button
              onClick={handleStop}
              disabled={!isRunning}
              className="w-full md:w-auto px-6 py-3 md:px-[3vw] md:py-[2vw] bg-red-500 text-white font-bold text-lg md:text-[2vw] rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              정지
            </button>
            <button
              onClick={handleReset}
              disabled={isRunning}
              className="w-full md:w-auto px-6 py-3 md:px-[3vw] md:py-[2vw] bg-gray-500 text-white font-bold text-lg md:text-[2vw] rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              리셋
            </button>
          </div>

          {/* Recorder Name Input */}
          <div className="mb-[3vw]">
            <label htmlFor="recorderName" className="block text-lg md:text-[2vw] font-medium text-gray-700 mb-[1vw]">
              기록자 이름
            </label>
            <input
              id="recorderName"
              type="text"
              value={recorderName}
              onChange={(e) => setRecorderName(e.target.value)}
              placeholder="기록자 이름을 입력하세요"
              className="w-full px-4 py-3 md:px-[2vw] md:py-[1.5vw] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg md:text-[2vw]"
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-8 py-4 md:px-[4vw] md:py-[2vw] bg-blue-500 text-white font-bold text-xl md:text-[2vw] rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "전송 중..." : "기록 전송"}
            </button>
            <div className="mt-[1vw] text-sm md:text-[1.5vw] text-gray-500">
              {!counterState && "계수기 정보를 불러오는 중..."}
              {counterState && !counterState.divisionId && "계수기가 division에 연결되지 않았습니다"}
              {counterState && counterState.divisionId && !recorderName.trim() && "기록자 이름을 입력하세요"}
              {counterState && counterState.divisionId && recorderName.trim() && isRunning && "타이머를 정지하세요"}
              {counterState &&
                counterState.divisionId &&
                recorderName.trim() &&
                !isRunning &&
                !hasRecord &&
                "타이머를 시작하고 정지하세요"}
              {canSubmit && "전송 준비 완료"}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
