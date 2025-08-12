import { useState, useEffect } from "react";
import { Activity, Users, User, AlertCircle, Loader2, CheckCircle, XCircle, Wifi, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/shared/ui";
import { useCounterService } from "@/features/counter";
import { useDivisionService } from "@/features/division";
import { useErrorHandlingService } from "@/features/error-handling";
import { useProgressService } from "@/features/progress";

interface ProgressMonitorSectionProps {
  counterId: string;
}

export const ProgressMonitorSection = ({ counterId }: ProgressMonitorSectionProps) => {
  const counterService = useCounterService();
  const divisionService = useDivisionService();
  const progressService = useProgressService();
  const errorHandler = useErrorHandlingService();
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
      errorHandler.handle(error as Error, "참가자 설정에 실패했습니다");
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
          // 계수기에 divisionId가 있으면 progress channel 연결
          setIsConnecting(true);
          setConnectionError(null);
          await progressService.connection.connect(counter.divisionId);
        } else {
          // 계수기에 divisionId가 없으면 연결 해제
          await progressService.connection.disconnect();
          console.log("Progress channel disconnected");
        }
      } catch (error) {
        errorHandler.handle(error as Error, "진행 상황 모니터 연결에 실패했습니다");
        setConnectionError(error instanceof Error ? error.message : "연결 실패");
      } finally {
        setIsConnecting(false);
      }
    };

    handleConnection();
  }, [counter?.divisionId, progressService, errorHandler]);

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>진행 상황 모니터</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm sm:text-base">서비스를 사용할 수 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
          <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>진행 상황 모니터</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 연결 상태 */}
        <Card>
          <CardContent className="px-6">
            <h3 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
              <Wifi className="h-4 w-4" />
              <span>Progress Channel 상태</span>
            </h3>

            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">연결 상태</span>
              <div className="flex items-center space-x-2">
                {isConnecting && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                {!isConnecting && isConnected && <CheckCircle className="h-4 w-4 text-green-600" />}
                {!isConnecting && !isConnected && connectionError && <XCircle className="h-4 w-4 text-red-600" />}
                {!isConnecting && !isConnected && !connectionError && (
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <Badge variant={isConnected ? "default" : connectionError ? "destructive" : "secondary"}>
                  {isConnecting ? "연결 중..." : isConnected ? "연결됨" : connectionError ? "연결 실패" : "연결 안됨"}
                </Badge>
              </div>
            </div>

            {connectionError && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded mb-2">오류: {connectionError}</div>
            )}

            <div className="text-xs text-muted-foreground">
              {!counter?.divisionId && "부문이 연결되지 않음"}
              {counter?.divisionId &&
                division &&
                `부문 상태: ${division.status === "ongoing" ? "진행 중" : division.status === "ready" ? "준비" : "종료"}`}
              {canConnect && !isConnected && "부문이 연결되어 있으면 자동으로 progress channel에 연결됩니다"}
              {isConnected && "Progress channel에 연결되어 실시간 정보를 수신합니다"}
            </div>
          </CardContent>
        </Card>

        {/* Division 정보 */}
        {division && (
          <Card>
            <CardContent className="px-6">
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                <Info className="h-4 w-4" />
                <span>부문 정보</span>
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">이름:</span>
                  <span className="text-sm text-foreground">{division.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">상태:</span>
                  <Badge
                    variant={
                      division.status === "ongoing" ? "default" : division.status === "ready" ? "secondary" : "outline"
                    }
                  >
                    {division.status === "ongoing" ? "진행 중" : division.status === "ready" ? "준비" : "종료"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 현재 러너 정보 */}
        {isConnected && progress && (
          <Card>
            <CardContent className="px-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-foreground flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>현재 참가자</span>
                </h3>
                {nextRunners.length > 0 && (
                  <Button
                    onClick={handleSetCurrentRunner}
                    disabled={isConnecting || isSettingRunner}
                    size="sm"
                    className="text-xs"
                  >
                    {isSettingRunner && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                    <span>{isSettingRunner ? "설정 중..." : runner ? "다음 참가자로 변경" : "다음 참가자 시작"}</span>
                  </Button>
                )}
              </div>
              {runner ? (
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
                    <span className="text-sm text-muted-foreground">기록 수:</span>
                    <Badge variant="outline">{runner.records.length}개</Badge>
                  </div>
                  {nextRunners.length > 0 && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-blue-600">다음 참가자: {nextRunners[0].name}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">현재 참가자가 없습니다</p>
                  {nextRunners.length > 0 && (
                    <p className="text-xs text-blue-600">다음 참가자: {nextRunners[0].name}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 대기 중인 참가자들 */}
        {isConnected && nextRunners.length > 0 && (
          <Card>
            <CardContent className="px-6">
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>대기 중인 참가자</span>
                <Badge variant="secondary">{nextRunners.length}명</Badge>
              </h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {nextRunners.slice(0, 5).map((participant, index) => (
                  <div key={participant.id} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{index + 1}.</span>
                    <span className="text-foreground flex-1 ml-2">{participant.name}</span>
                    <span className="text-muted-foreground">{participant.teamName}</span>
                  </div>
                ))}
                {nextRunners.length > 5 && (
                  <div className="text-xs text-muted-foreground text-center pt-1">외 {nextRunners.length - 5}명</div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
