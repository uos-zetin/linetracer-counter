import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useAdminAuthorization } from "@/features/auth";
import { useCounterService } from "@/features/counter";
import { useProgressService } from "@/features/progress";
import { PageContainer } from "@/widgets/page-container";
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

  const { isAuthorized } = useAdminAuthorization();
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

  // 권한 체크 또는 counterId가 없으면 로딩 상태 표시
  if (!isAuthorized || !counterId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <main className="flex flex-col h-screen w-full bg-background">
      <TimerPageHeader />
      <section
        id="timer-content"
        className="flex-1 flex flex-col h-full py-8 sm:py-10 md:py-12 xl:py-16 2xl:py-20 gap-4 sm:gap-6 md:gap-8"
      >
        <PageContainer maxWidth="full" padding="md" className="h-full">
          <div className="min-h-0 h-full flex flex-col gap-8 sm:gap-10 md:gap-12">
            {/* 상단 4개 컴포넌트를 하나의 Card로 감싸기 */}
            <div className="grid gap-x-4 gap-y-3 sm:gap-x-6 sm:gap-y-4 md:gap-x-8 md:gap-y-6 grid-cols-1 md:grid-cols-2">
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
            </div>
            {/* 하단 데이터 섹션 */}
            <div className="flex-1 flex flex-col min-h-0">
              <div
                className="flex-1 grid grid-cols-2 gap-3 sm:gap-4 md:gap-6
            md:grid-cols-[1fr_2fr_1fr_10vw] md:grid-rows-1
            "
              >
                <div className="order-2 md:order-1 h-full">
                  <NextRunnerInfo />
                </div>
                <div className="order-1 col-span-2 md:order-2 md:col-span-1 h-full">
                  <TopRecordView />
                </div>
                <div className="order-3 md:order-3 h-full">
                  <CurrentRecordView />
                </div>
                <div className="order-4 md:order-4 col-span-2 md:col-span-1 flex flex-row md:flex-col items-stretch gap-3 sm:gap-4 md:gap-6 h-full w-full">
                  <div className="flex-1 w-full md:flex-1">
                    <SponsorView />
                  </div>
                  <div className="flex-1 w-full aspect-square md:flex-none md:w-full md:aspect-square">
                    <QRViewer url={dashboardUrl} title="대회 대시보드" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    </main>
  );
}
