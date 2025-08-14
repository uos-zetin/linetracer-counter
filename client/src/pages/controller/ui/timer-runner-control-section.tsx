import { useState, useCallback, useMemo } from "react";
import { Timer, User, Clock, Plus, Minus, SkipForward, Play, Pause, AlertCircle, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Label,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui";
import { formatElapsedMs } from "@/entities/counter";
import { integrateLogs, useCountdownTimer } from "@/entities/timer";
import { useDivisionService } from "@/features/division";
import { useErrorHandlingService } from "@/features/error-handling";
import { useProgressService } from "@/features/progress";
import { useTimerControlService } from "@/features/timer-control";

export const TimerRunnerControlSection = () => {
  const progressService = useProgressService();
  const divisionService = useDivisionService();
  const timerControlService = useTimerControlService();
  const errorHandler = useErrorHandlingService();

  const [isProcessing, setIsProcessing] = useState(false);
  const [customTimeAdjustment, setCustomTimeAdjustment] = useState("");

  const progress = progressService?.use.progress() || null;
  const runner = progress?.runner;
  const division = progress?.division;

  // TimerState 계산 (integrateLogs 사용)
  const timerState = useMemo(() => {
    if (!runner?.timerLogs || !division?.timeLimit) {
      return { initialMs: 0, offsetMs: 0, accumulatedMs: 0, startedAt: null };
    }
    return integrateLogs(division.timeLimit * 1000, runner.timerLogs);
  }, [runner?.timerLogs, division?.timeLimit]);

  const countdownResult = useCountdownTimer(timerState);
  const liveRemainingTimeMs = runner?.timerLogs && division?.timeLimit ? countdownResult : null;

  // 타이머 제어 함수들
  const handleStartTimer = useCallback(async () => {
    if (!timerControlService || !runner?.participant.id) return;

    try {
      await timerControlService.admin.start(runner.participant.id);
    } catch (error) {
      errorHandler.handle(error as Error, "타이머 시작에 실패했습니다");
    }
  }, [timerControlService, runner?.participant.id, errorHandler]);

  const handleStopTimer = useCallback(async () => {
    if (!timerControlService || !runner?.participant.id) return;

    try {
      await timerControlService.admin.stop(runner.participant.id);
    } catch (error) {
      errorHandler.handle(error as Error, "타이머 정지에 실패했습니다");
    }
  }, [timerControlService, runner?.participant.id, errorHandler]);

  const handleAddTime = useCallback(
    async (timeMs: number) => {
      if (!timerControlService || !runner?.participant.id) return;

      try {
        await timerControlService.admin.adjust(runner.participant.id, "add", timeMs);
      } catch (error) {
        errorHandler.handle(error as Error, "시간 추가에 실패했습니다");
      }
    },
    [timerControlService, runner?.participant.id, errorHandler]
  );

  const handleSubtractTime = useCallback(
    async (timeMs: number) => {
      if (!timerControlService || !runner?.participant.id) return;

      try {
        await timerControlService.admin.adjust(runner.participant.id, "sub", timeMs);
      } catch (error) {
        errorHandler.handle(error as Error, "시간 차감에 실패했습니다");
      }
    },
    [timerControlService, runner?.participant.id, errorHandler]
  );

  const handleCustomTimeAdjustment = useCallback(() => {
    const adjustment = parseInt(customTimeAdjustment);
    if (isNaN(adjustment) || adjustment === 0) {
      errorHandler.handle(new Error("Invalid time adjustment"), "올바른 시간 값을 입력해주세요 (0이 아닌 숫자)");
      return;
    }

    if (adjustment > 0) {
      handleAddTime(Math.abs(adjustment));
    } else {
      handleSubtractTime(Math.abs(adjustment));
    }

    setCustomTimeAdjustment("");
  }, [customTimeAdjustment, handleAddTime, handleSubtractTime, errorHandler]);

  const handlePostponeRunner = useCallback(async () => {
    if (!progressService || !division?.id || !runner?.participant.id) return;

    setIsProcessing(true);
    try {
      await progressService.admin.postponeCurrentRunner(division.id);
    } catch (error) {
      errorHandler.handle(error as Error, "참가자 순서 변경에 실패했습니다");
    } finally {
      setIsProcessing(false);
    }
  }, [progressService, division?.id, runner?.participant.id, errorHandler]);

  if (!progressService || !divisionService || !timerControlService) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Timer className="h-5 w-5" />
            <span>타이머 & 참가자 제어</span>
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

  if (!runner || !timerState || !division) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Timer className="h-5 w-5" />
            <span>타이머 & 참가자 제어</span>
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
          <Timer className="h-5 w-5" />
          <span>타이머 & 참가자 제어</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 space-y-6">
        {/* 구역 1: Countdown 타이머 */}
        <Card>
          <CardContent className="px-6">
            <h3 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>대회 타이머 - {runner.participant.name}</span>
            </h3>

            {/* 실시간 남은 시간 표시 */}
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-foreground mb-2">
                {liveRemainingTimeMs !== null ? formatElapsedMs(liveRemainingTimeMs).toString() : "00:00.000"}
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Badge
                  variant={timerState.startedAt ? "default" : liveRemainingTimeMs === 0 ? "destructive" : "secondary"}
                >
                  {timerState.startedAt ? "실행 중" : liveRemainingTimeMs === 0 ? "시간 종료" : "정지"}
                </Badge>
              </div>
            </div>

            {/* 타이머 정보 */}
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">제한 시간:</span>
                  <span className="text-foreground">{formatElapsedMs(division.timeLimit).toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">누적 시간:</span>
                  <span className="text-foreground">{formatElapsedMs(timerState.accumulatedMs).toString()}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">시간 조정:</span>
                  <span className="text-foreground">
                    {timerState.offsetMs >= 0 ? "+" : "-"}
                    {formatElapsedMs(Math.abs(timerState.offsetMs)).toString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">상태:</span>
                  <Badge variant={timerState.startedAt ? "default" : "secondary"} className="text-xs">
                    {timerState.startedAt ? "측정 중" : "정지"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* 타이머 제어 버튼들 */}
            <div className="space-y-3">
              {/* 시작/정지 버튼 */}
              <div className="flex space-x-2">
                <Button
                  onClick={handleStartTimer}
                  disabled={!!timerState.startedAt}
                  size="lg"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  시작
                </Button>
                <Button
                  onClick={handleStopTimer}
                  disabled={!timerState.startedAt}
                  size="lg"
                  variant="destructive"
                  className="flex-1"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  정지
                </Button>
              </div>

              {/* 빠른 시간 조정 버튼들 */}
              <div className="grid grid-cols-4 gap-2">
                <Button
                  onClick={() => handleSubtractTime(10000)}
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs"
                >
                  <Minus className="h-3 w-3 mr-1" />
                  10초
                </Button>
                <Button
                  onClick={() => handleSubtractTime(1000)}
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs"
                >
                  <Minus className="h-3 w-3 mr-1" />
                  1초
                </Button>
                <Button
                  onClick={() => handleAddTime(1000)}
                  size="sm"
                  className="bg-purple-500 hover:bg-purple-600 text-white text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  1초
                </Button>
                <Button
                  onClick={() => handleAddTime(10000)}
                  size="sm"
                  className="bg-purple-500 hover:bg-purple-600 text-white text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  10초
                </Button>
              </div>

              {/* 커스텀 시간 조정 */}
              <div className="border-t pt-3">
                <Label htmlFor="custom-time" className="text-xs text-muted-foreground mb-2 block">
                  직접 입력 (초)
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="custom-time"
                    type="number"
                    value={customTimeAdjustment}
                    onChange={(e) => setCustomTimeAdjustment(e.target.value)}
                    placeholder="±ms (예: 5000, -3000)"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleCustomTimeAdjustment}
                    disabled={!customTimeAdjustment || customTimeAdjustment === "0"}
                    size="sm"
                  >
                    적용
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 구역 2: 현재 Runner 정보 */}
        <Card>
          <CardContent className="px-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>현재 참가자</span>
              </h3>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={isProcessing}
                    size="sm"
                    className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        처리 중...
                      </>
                    ) : (
                      <>
                        <SkipForward className="h-3 w-3 mr-1" />
                        마지막 순번으로 미루기
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>참가자 순서 변경</AlertDialogTitle>
                    <AlertDialogDescription>
                      {runner.participant.name}을(를) 마지막 순번으로 미루시겠습니까?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePostponeRunner}>확인</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">이름:</span>
                <span className="text-sm font-medium text-foreground">{runner.participant.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">소속:</span>
                <span className="text-sm text-foreground">{runner.participant.teamName || "없음"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">타이머 로그:</span>
                <Badge variant="outline">{runner.timerLogs.length}개</Badge>
              </div>
            </div>

            {/* 타이머 로그 상세 */}
            {runner.timerLogs.length > 0 && (
              <div className="mt-3 border-t pt-3">
                <h4 className="text-xs font-medium text-muted-foreground mb-2">타이머 로그</h4>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {runner.timerLogs.map((log) => (
                    <div key={log.id} className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleTimeString()} - {log.type}:{" "}
                      {formatElapsedMs(log.value).toString()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};
