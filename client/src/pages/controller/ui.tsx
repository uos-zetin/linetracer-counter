import { useParams } from "react-router";
import { useEffect } from "react";
import { useCounterService } from "@/features/counter";
import { ControllerLayout } from "./ui/controller-layout";
import { CounterControlSection } from "./ui/counter-control-section";
import { StopwatchControlSection } from "./ui/stopwatch-control-section";
import { ProgressMonitorSection } from "./ui/progress-monitor-section";
import { RecordControlSection } from "./ui/record-control-section";
import { TimerRunnerControlSection } from "./ui/timer-runner-control-section";

export const ControllerPage = () => {
  const { counterId } = useParams<{ counterId: string }>();
  const counterService = useCounterService();

  // Counter 채널 연결
  useEffect(() => {
    if (counterId && counterService) {
      const connectCounter = async () => {
        try {
          await counterService.connect(counterId);
        } catch (error) {
          console.error(`Failed to connect to counter ${counterId}:`, error);
        }
      };

      connectCounter();

      // 컴포넌트 언마운트 시 연결 해제
      return () => {
        counterService.disconnect(counterId).catch(console.error);
      };
    }
  }, [counterId, counterService]);

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
