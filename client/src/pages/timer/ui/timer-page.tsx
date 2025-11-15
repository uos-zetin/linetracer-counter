import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAdminAuthorization } from "@/features/auth";
import { useCounterService } from "@/features/counter";
import { useProgressService } from "@/features/progress";
import { CurrentRecordView } from "./current-record-view";
import { DivisionInfo } from "./division-info";
import { FallingLeaves } from "./falling-leaves";
import { LeavesSettingsPanel, type LeavesSettings } from "./leaves-settings-panel";
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
  const [leavesSettings, setLeavesSettings] = useState<LeavesSettings>({
    enabled: true,
    size: 1,
    speed: 5,
    count: 20,
    clearInterval: 60,
  });

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
    <main className="grid grid-rows-[auto_1fr] h-dvh w-full bg-background">
      {/* 낙엽 애니메이션 */}
      <FallingLeaves
        enabled={leavesSettings.enabled}
        speed={leavesSettings.speed}
        count={leavesSettings.count}
        size={leavesSettings.size}
        clearIntervalSeconds={leavesSettings.clearInterval}
      />

      {/* 낙엽 설정 패널 (우측 하단) */}
      <LeavesSettingsPanel settings={leavesSettings} onSettingsChange={setLeavesSettings} />

      <TimerPageHeader />
      <section id="timer-content" className="flex-1 min-h-0 overflow-hidden p-8">
        <div className="grid grid-rows-[auto_1fr] min-h-0 h-full gap-8">
          <div className="shrink-0 grid grid-cols-2">
            <div>
              <DivisionInfo />
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

          <div className="min-h-0 h-full overflow-hidden">
            <div className="grid min-h-0 h-full grid-cols-[1fr_2fr_1fr_20dvh] grid-rows-1 gap-6">
              <div className="min-h-0 overflow-auto">
                <NextRunnerInfo />
              </div>

              <div className="min-h-0 overflow-auto">
                <TopRecordView />
              </div>

              <div className="min-h-0 overflow-auto">
                <CurrentRecordView />
              </div>

              <div className="flex flex-col gap-6 min-h-0">
                <div className="flex-1 min-h-0 overflow-auto">
                  <SponsorView />
                </div>
                <div className="shrink-0">
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
