import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useAdminAuthorization } from "@/features/auth";
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
      <div className="flex items-center justify-center min-h-dvh bg-background">
        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <main className="flex flex-col h-screen w-full bg-background">
      <TimerPageHeader />
      <section id="timer-content" className="flex-1 h-[85vh] flex justify-center items-center">
        {/* 헤더 제외 영역에서 4:3 비율로 꽉 차는 컨테이너 */}
        <div className="h-full aspect-[4/3] flex flex-col" style={{ gap: "4vh", padding: "2vh 0" }}>
          {/* 상단 4개 컴포넌트 영역 */}
          <div>
            <div className="h-full grid gap-1 grid-cols-2">
              <div>
                <DivisionInfo counterId={counterId} />
              </div>
              <div>
                <RunnerInfo />
              </div>
              <div>
                <TimerView />
              </div>
              <div>
                <StopwatchView />
              </div>
            </div>
          </div>
          {/* 하단 데이터 섹션 */}
          <div className="flex-1 ">
            <div className="h-full grid grid-cols-[1fr_2fr_1fr_20vh] grid-rows-1 gap-[2vh]">
              <div className="h-full">
                <NextRunnerInfo />
              </div>
              <div className="h-full">
                <TopRecordView />
              </div>
              <div className="h-full">
                <CurrentRecordView />
              </div>
              <div className="flex flex-col items-stretch gap-[2vh] h-full">
                <div className="flex-1">
                  <SponsorView />
                </div>
                <div className="aspect-square">
                  <QRViewer url={dashboardUrl} title="대회 대시보드" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
