import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { formatElapsedMs, useStopwatchTimer } from "@/entities/counter";
import { useAuthService } from "@/features/auth";
import { useCounterService } from "@/features/counter";
import { useManualRecordService } from "@/features/manual-record";
import { useProgressService } from "@/features/progress";
import { AppHeader } from "@/widgets/app-header";

export function ManualCounter() {
  const navigate = useNavigate();
  const { counterId } = useParams();

  // Auth check
  const authService = useAuthService();
  const authState = authService.use.auth();
  const { isAuthenticated, user } = authState;

  const manualRecordService = useManualRecordService();
  const progressService = useProgressService();
  const counterService = useCounterService();

  // 로컬 타이머 상태 (서버와 독립적)
  const [localStartedAt, setLocalStartedAt] = useState<number | null>(null);
  const [localStoppedAt, setLocalStoppedAt] = useState<number | null>(null);

  // Form state
  const [recorderName, setRecorderName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 권한 체크
  const isAdministrator = user?.roles?.includes("administrator") ?? false;
  const isManualRecorder = user?.roles?.includes("manualRecorder") ?? false;
  const isAuthorized = isAuthenticated && (isAdministrator || isManualRecorder);

  // 권한이 없으면 홈으로 리다이렉트
  useEffect(() => {
    if (!isAuthenticated || (user && !isAdministrator && !isManualRecorder)) {
      navigate("/");
      return;
    }
  }, [isAuthenticated, user, isAdministrator, isManualRecorder, navigate]);


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

      // 6. 성공 시 자동 리셋 (기록자 이름은 유지)
      handleReset();
      alert("기록이 성공적으로 전송되었습니다!");
    } catch (error) {
      console.error("Failed to submit manual record:", error);
      alert(`기록 전송에 실패했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = !isRunning && hasRecord && recorderName.trim() && !isSubmitting;

  // 권한 체크 또는 counterId가 없으면 로딩 상태 표시
  if (!isAuthorized || !counterId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="수동 계수" showBackButton />
      <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-6 sm:mb-8 md:mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">
              수동 계수
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-2xl text-muted-foreground">
              계수기: {decodeURIComponent(counterId)}
            </p>
          </header>

          <div className="bg-card rounded-lg shadow-lg border border-border px-6 sm:px-8 md:px-12 lg:px-12 py-6 sm:py-8 md:py-10">
            {/* Timer Display */}
            <div className="text-center mb-6 sm:mb-8 md:mb-10">
              <div className="text-6xl sm:text-7xl md:text-8xl lg:text-8xl leading-none font-bold text-foreground mb-4 sm:mb-6 flex items-baseline justify-center">
                <span>{timeComponents.minutes}</span>
                <span className="transform -translate-y-1">:</span>
                <span>{timeComponents.seconds}</span>
                <span>.</span>
                <span className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl">{timeComponents.milliseconds}</span>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-3xl text-muted-foreground">
                {isRunning ? "⏱️ 측정 중" : hasRecord ? "⏹️ 측정 완료" : "⏸️ 대기 중"}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 md:gap-6 mb-6 sm:mb-8 md:mb-10">
              <Button
                onClick={handleStart}
                disabled={isRunning}
                size="lg"
                className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 bg-green-500 text-white font-bold text-lg sm:text-xl md:text-xl lg:text-xl hover:bg-green-600"
              >
                시작
              </Button>
              <Button
                onClick={handleStop}
                disabled={!isRunning}
                size="lg"
                className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 bg-red-500 text-white font-bold text-lg sm:text-xl md:text-xl lg:text-xl hover:bg-red-600"
              >
                정지
              </Button>
              <Button
                onClick={handleReset}
                disabled={isRunning}
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 font-bold text-lg sm:text-xl md:text-xl lg:text-xl"
              >
                리셋
              </Button>
            </div>

            {/* Recorder Name Input */}
            <div className="mb-6 sm:mb-8 md:mb-10">
              <Label
                htmlFor="recorderName"
                className="text-lg sm:text-xl md:text-xl lg:text-xl font-medium mb-2 sm:mb-3"
              >
                기록자 이름
              </Label>
              <Input
                id="recorderName"
                type="text"
                value={recorderName}
                onChange={(e) => setRecorderName(e.target.value)}
                placeholder="기록자 이름을 입력하세요"
                className="w-full px-4 py-3 sm:px-4 sm:py-3 md:px-4 md:py-3 text-lg sm:text-xl md:text-xl lg:text-xl"
              />
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                size="lg"
                className="px-8 py-4 sm:px-10 sm:py-5 md:px-12 md:py-6 font-bold text-xl sm:text-2xl md:text-2xl lg:text-2xl"
              >
                {isSubmitting ? "전송 중..." : "기록 전송"}
              </Button>
              <div className="mt-3 sm:mt-4 md:mt-5 text-sm sm:text-base md:text-base lg:text-base text-muted-foreground">
                {!recorderName.trim() && "기록자 이름을 입력하세요"}
                {recorderName.trim() && isRunning && "타이머를 정지하세요"}
                {recorderName.trim() && !isRunning && !hasRecord && "타이머를 시작하고 정지하세요"}
                {canSubmit && "전송 준비 완료"}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
