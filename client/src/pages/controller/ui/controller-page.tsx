import { useEffect } from "react";
import { useParams } from "react-router";
import { useAuthService } from "@/features/auth";
import { useCounterService } from "@/features/counter";
import { ControllerLayout } from "./controller-layout";
import { CounterControlSection } from "./counter-control-section";
import { ProgressMonitorSection } from "./progress-monitor-section";
import { RecordControlSection } from "./record-control-section";
import { StopwatchControlSection } from "./stopwatch-control-section";
import { TimerRunnerControlSection } from "./timer-runner-control-section";

export const ControllerPage = () => {
  const { counterId } = useParams<{ counterId: string }>();
  const counterService = useCounterService();
  const authService = useAuthService();
  const { isAuthenticated } = authService.useAuth();

  // Counter 채널 연결 - 인증이 완료된 후에만 시도
  useEffect(() => {
    if (counterId && counterService && isAuthenticated) {
      const connectCounter = async () => {
        try {
          // Session key가 준비될 때까지 대기
          const sessionKey = authService.getSessionKey();
          if (!sessionKey) {
            console.warn("Session key not available, retrying in 500ms...");
            setTimeout(() => connectCounter(), 500);
            return;
          }

          await counterService.connection.connect(counterId);
          console.log(`Counter connected successfully: ${counterId}`);
        } catch (error) {
          console.error(`Failed to connect to counter ${counterId}:`, error);
        }
      };

      connectCounter();

      // 컴포넌트 언마운트 시 연결 해제
      return () => {
        counterService.connection.disconnect(counterId).catch(console.error);
      };
    }
  }, [counterId, counterService, isAuthenticated, authService]);

  if (!counterId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">오류</h1>
          <p className="text-gray-600">카운터 ID가 제공되지 않았습니다.</p>
        </div>
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
