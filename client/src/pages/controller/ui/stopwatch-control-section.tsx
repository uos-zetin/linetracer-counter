import { Clock, Play, Square, RotateCcw, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
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
import { formatElapsedMs, useStopwatchTimer } from "@/entities/counter";
import { useCounterService } from "@/features/counter";
import { useErrorHandlingService } from "@/features/error-handling";

interface StopwatchControlSectionProps {
  counterId: string;
}

export const StopwatchControlSection = ({ counterId }: StopwatchControlSectionProps) => {
  const counterService = useCounterService();
  const errorHandler = useErrorHandlingService();

  const stopwatch = counterService?.use.stopwatch(counterId) || null;

  // useStopwatchTimer 훅 사용으로 실시간 경과 시간 계산
  const elapsedTime = useStopwatchTimer(stopwatch?.startedAt || null, stopwatch?.stoppedAt || null);

  // 시간 포맷팅 (기존 formatter 사용)
  const formatTime = (ms: number) => {
    return formatElapsedMs(ms).toString();
  };

  const handleReset = async () => {
    if (!counterService) return;

    try {
      await counterService.admin.reset(counterId);
    } catch (error) {
      errorHandler.handle(error as Error, "계수기 리셋에 실패했습니다");
    }
  };

  // 상태 계산
  const isRunning = stopwatch?.startedAt && !stopwatch?.stoppedAt;
  const isStopped = stopwatch?.startedAt && stopwatch?.stoppedAt;
  const isIdle = !stopwatch?.startedAt;

  if (!counterService) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>계수기 모니터</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm sm:text-base">계수기 서비스를 사용할 수 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>계수기 모니터</span>
        </CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2">센서에 의해 자동으로 측정됩니다</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 시간 표시 */}
        <div className="text-center">
          <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">{formatTime(elapsedTime)}</div>
          <div className="flex items-center justify-center space-x-2 mb-4">
            {isRunning && <Play className="h-5 w-5 text-green-600" />}
            {isStopped && <Square className="h-5 w-5 text-yellow-600" />}
            {isIdle && <Clock className="h-5 w-5 text-muted-foreground" />}
            <Badge variant={isRunning ? "default" : isStopped ? "secondary" : "outline"} className="text-sm sm:text-base px-3 py-1 sm:px-4 sm:py-2">
              {isRunning ? "측정 중" : isStopped ? "측정 완료" : "대기 중"}
            </Badge>
          </div>

          {/* 시작/종료 시간 표시 */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Card>
              <CardContent className="p-3">
                <div className="text-xs sm:text-sm font-medium text-foreground mb-1">시작 시간</div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {stopwatch?.startedAt ? new Date(stopwatch.startedAt).toLocaleTimeString() : "---"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-xs sm:text-sm font-medium text-foreground mb-1">종료 시간</div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {stopwatch?.stoppedAt ? new Date(stopwatch.stoppedAt).toLocaleTimeString() : "---"}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 리셋 버튼 */}
        {!isIdle && (
          <div className="flex justify-center">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="lg" className="px-6">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  리셋
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>계수기 리셋</AlertDialogTitle>
                  <AlertDialogDescription>
                    계수기를 리셋하시겠습니까? 모든 시간 데이터가 초기화됩니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>리셋</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

      </CardContent>
    </Card>
  );
};
