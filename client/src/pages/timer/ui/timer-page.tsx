import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useCounterService } from "@/features/counter";
import { useProgressService } from "@/features/progress";
import { CurrentRecordView } from "./current-record-view";
import { DivisionInfo } from "./division-info";
import { NextRunnerInfo } from "./next-runner-info";
import { QRViewer } from "./qr-viewer";
import { RunnerInfo } from "./runner-info";
import { SponsorView } from "./sponsor-view";
import { StopwatchView } from "./stopwatch-view";
import { TimerPageHeader } from "./timer-header";
import { TimerView } from "./timer-view";
import { TopRecordView } from "./top-record-info";

export function TimerPage() {
  const navigate = useNavigate();
  const { counterId } = useParams();

  const progressService = useProgressService();
  const counterService = useCounterService();

  // Counter 서비스 연결
  useEffect(() => {
    if (!counterId) {
      navigate(`/counter`);
      return;
    }

    const connectCounter = async () => {
      try {
        await counterService.connection.connect(counterId);
      } catch (error) {
        console.error("Failed to connect counter service:", error);
      }
    };

    connectCounter();

    return () => {
      counterService.connection.disconnect(counterId).catch(console.error);
    };
  }, [counterId, navigate, counterService]);

  // Counter 상태에서 divisionId를 가져와서 Progress 서비스 연결
  const counterState = counterService.use.counterState(counterId || "");
  useEffect(() => {
    const connectProgress = async () => {
      if (counterState?.divisionId) {
        try {
          await progressService.connection.connect(counterState.divisionId);
        } catch (error) {
          console.error("Failed to connect progress service:", error);
        }
      }
    };

    connectProgress();

    return () => {
      if (counterState?.divisionId) {
        progressService.connection.disconnect().catch(console.error);
      }
    };
  }, [counterState?.divisionId, progressService]);

  // Dashboard URL 생성을 위한 division 정보
  const division = progressService.use.division();
  const dashboardUrl = division?.competitionId
    ? `${window.location.origin}/dashboard?competitionId=${division.competitionId}`
    : window.location.href;

  // counterId가 없으면 로딩 상태 표시
  if (!counterId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-uos-gray-mist">
        <div className="text-[2vw] font-bold text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen h-full w-full bg-gray-200">
      <TimerPageHeader />
      <section
        id="timer-content"
        className="grid gap-x-[1.5vw] gap-y-[1vw] grid-cols-1 md:grid-cols-2 px-[1vw] md:px-[1.5vw] py-[2vw] md:py-[3vw] h-full"
      >
        <div className="order-1 md:row-start-1 md:col-start-1">
          <DivisionInfo counterId={counterId} />
        </div>
        <div className="order-2 md:row-start-1 md:col-start-2">
          <RunnerInfo />
        </div>
        <div className="order-3 md:row-start-2 md:col-start-1">
          <TimerView />
        </div>
        <div className="order-4 md:row-start-2 md:col-start-2">
          <StopwatchView />
        </div>
        <div className="order-5 md:col-span-2 mt-[1.5vw] mx-[20vw] md:mx-[2vw]">
          <div
            className="grid grid-cols-2 gap-[1vw]
            md:grid-cols-[1.5fr_3fr_1.5fr_1fr] md:gap-[1vw] 
            "
          >
            <div className="order-2 md:order-1">
              <NextRunnerInfo />
            </div>
            <div className="order-1 col-span-2 md:order-2 md:col-span-1">
              <TopRecordView />
            </div>
            <div className="order-3 md:order-3">
              <CurrentRecordView />
            </div>
            <div className="order-4 md:order-4 col-span-2 md:col-span-1 flex flex-row md:flex-col items-stretch gap-[1vw] md:h-full">
              <div className="flex flex-1 w-full md:flex-1">
                <SponsorView />
              </div>
              <div className="flex flex-1 w-full md:flex-[0_0_auto]">
                <QRViewer url={dashboardUrl} title="대회 대시보드" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
