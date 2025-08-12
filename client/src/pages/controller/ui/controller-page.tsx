import { useParams } from "react-router";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/shared/ui";
import { useAdminAuthorization } from "../lib/use-admin-authorization";
import { useCounterConnection } from "../lib/use-counter-connection";
import { ControllerLayout } from "./controller-layout";
import { CounterControlSection } from "./counter-control-section";
import { ProgressMonitorSection } from "./progress-monitor-section";
import { RecordControlSection } from "./record-control-section";
import { StopwatchControlSection } from "./stopwatch-control-section";
import { TimerRunnerControlSection } from "./timer-runner-control-section";

export const ControllerPage = () => {
  const { counterId } = useParams<{ counterId: string }>();
  
  // 권한 체크 및 자동 리다이렉트
  const { isAuthorized, sessionKey } = useAdminAuthorization();
  
  // 계수기 연결 관리
  useCounterConnection({
    counterId: counterId || "",
    isAuthorized,
    sessionKey,
  });

  // 권한이 없으면 렌더링하지 않음 (리다이렉트 처리 중)
  if (!isAuthorized) {
    return null;
  }

  if (!counterId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-destructive mb-4" />
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">오류</h1>
              <p className="text-sm sm:text-base text-muted-foreground">계수기 ID가 제공되지 않았습니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ControllerLayout counterId={counterId}>
      <CounterControlSection counterId={counterId} />
      <StopwatchControlSection counterId={counterId} />
      <ProgressMonitorSection counterId={counterId} />
      <RecordControlSection />
      <TimerRunnerControlSection />
    </ControllerLayout>
  );
};
