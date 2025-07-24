import { TimerView } from "./ui/timer-view";
import { TimerPageHeader } from "./ui/timer-header";
import { DivisionInfo } from "./ui/division-info";
import { RunnerInfo } from "./ui/runner-info";
import { StopwatchView } from "./ui/stopwatch-view";
import { NextRunnerInfo } from "./ui/next-runner-info";
import { TopRecordView } from "./ui/top-record-info";
import { CurrentRecordView } from "./ui/current-record-view";
import { useNavigate, useParams } from "react-router";
import { useEffect } from "react";

import { type ProgressState, useProgressService } from "@/features/progress";
import { SponsorView } from "./ui/sponsor-view";
import { QRViewer } from "./ui/qr-viewer";
import { useCounterChannel, useCounterRepo, useCounterService } from "@/features/counter";
import { integrateLogs } from "@/entities/timer-log";

const mockProgress: ProgressState = {
  id: "progress-1",
  competition: {
    id: "competition-1",
    name: "제 24회 전국 라인트레이서 경연대회",
    description: "라인트레이서 경연대회",
    createdAt: new Date("2023-10-01T00:00:00Z"),
  },
  division: {
    id: "division-1",
    name: "Expert-Step (예선)",
    description: "Export-Step Division",
    createdAt: new Date("2023-10-01T00:00:00Z"),
    competitionId: "competition-1",
    status: "ongoing",
  },
  runner: {
    participant: {
      id: "abc",
      name: "김민교",
      teamName: "ZETIN",
      robotName: "2019년산",
      givenTime: 4 * 60 * 1000,
      createdAt: new Date("2023-10-01T00:00:00Z"),
      comment: "최고의 라인트레이서",
      orderRaw: 1,
    },
    timerLogs: [
      {
        id: "start-log",
        participantId: "abc",
        type: "start",
        value: Date.now() - 10000,
        createdAt: new Date(1000000000000),
      },
      {
        id: "stop-log",
        participantId: "abc",
        type: "stop",
        value: Date.now() - 5000,
        createdAt: new Date(1000000005000),
      },
      {
        id: "running-log",
        participantId: "abc",
        type: "start",
        value: Date.now(),
        createdAt: new Date(1000000011000),
      },
    ],
    records: [
      {
        id: "record-1",
        participantId: "abc",
        value: 5000,
        createdAt: new Date(1000000005000),
        source: "stopwatch",
        status: "approved",
        note: "",
      },
      {
        id: "record-2",
        participantId: "abc",
        value: 6000,
        createdAt: new Date(1000000011000),
        source: "stopwatch",
        status: "approved",
        note: "최고 기록",
      },
    ],
    manualRecords: [],
  },
  nextRunners: [
    {
      id: "def",
      name: "이영희",
      teamName: "ZETIN",
      robotName: "2020년산",
      givenTime: 3 * 60 * 1000, // 3 minutes in milliseconds
      createdAt: new Date("2023-10-01T00:00:00Z"),
      comment: "빠른 라인트레이서",
      orderRaw: 2,
    },
    {
      id: "ghi",
      name: "박철수",
      teamName: "ZETIN",
      robotName: "2021년산",
      givenTime: 5 * 60 * 1000, // 5 minutes in milliseconds
      createdAt: new Date("2023-10-01T00:00:00Z"),
      comment: "강력한 라인트레이서",
      orderRaw: 3,
    },
  ],
  topRecords: [],
};

const mockTopRecords = [
  {
    id: "top-record-1",
    participantName: "김민교",
    timeMs: 5000,
  },
  {
    id: "top-record-2",
    participantName: "이영희",
    timeMs: 6000,
  },
  {
    id: "top-record-3",
    participantName: "박철수",
    timeMs: 7000,
  },
  {
    id: "top-record-4",
    participantName: "최지우",
    timeMs: 8000,
  },
  {
    id: "top-record-5",
    participantName: "홍길동",
    timeMs: 9000,
  },
  {
    id: "top-record-6",
    participantName: "이순신",
    timeMs: 10000,
  },
];

export function TimerPage() {
  const navigate = useNavigate();
  const { counterId } = useParams();

  // counterId가 없으면 계수기 선택으로 리다이렉트
  useEffect(() => {
    if (!counterId) {
      navigate(`/counter`);
    }
  }, [counterId, navigate]);

  const counterRepository = useCounterRepo();
  const counterChannel = useCounterChannel();

  const counterService = useCounterService(counterRepository, counterChannel);
  const stopwatch = counterService.useStopwatch();

  const progressService = useProgressService();
  progressService.setProgress(mockProgress);

  const competition = progressService.useCompetition();
  const division = progressService.useDivision();
  const runner = progressService.useRunner();
  const nextRunners = progressService.useNextRunners();
  const timerLogs = runner?.timerLogs ?? [];

  const timerState = integrateLogs(runner?.participant.givenTime ?? 0, timerLogs);

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
      <TimerPageHeader competitionName={competition?.name ?? "No Competition"} />
      <section
        id="timer-content"
        className="grid gap-x-[1.5vw] gap-y-[1vw] grid-cols-1 md:grid-cols-2 px-[1vw] md:px-[1.5vw] py-[2vw] md:py-[3vw] h-full"
      >
        <div className="order-1 md:row-start-1 md:col-start-1">
          <DivisionInfo divisionName={division?.name ?? "No Division"} stopwatchName={decodeURIComponent(counterId)} />
        </div>
        <div className="order-2 md:row-start-1 md:col-start-2">
          <RunnerInfo
            runnerName={runner?.participant.name ?? "No Runner"}
            runnerTeam={runner?.participant.teamName ?? "No Team"}
            runnerRobotName={runner?.participant.robotName ?? "No Robot"}
          />
        </div>
        <div className="order-3 md:row-start-2 md:col-start-1">
          <TimerView timerState={timerState} />
        </div>
        <div className="order-4 md:row-start-2 md:col-start-2">
          <StopwatchView startedAt={stopwatch.startedAt} stoppedAt={stopwatch.stoppedAt} />
        </div>
        <div className="order-5 md:col-span-2 mt-[1.5vw] mx-[20vw] md:mx-[2vw]">
          <div
            className="grid grid-cols-2 gap-[1vw]
            md:grid-cols-[1.5fr_3fr_1.5fr_1fr] md:gap-[1vw] 
            "
          >
            <div className="order-2 md:order-1">
              <NextRunnerInfo nextRunners={nextRunners} />
            </div>
            <div className="order-1 col-span-2 md:order-2 md:col-span-1">
              <TopRecordView topRecords={mockTopRecords} />
            </div>
            <div className="order-3 md:order-3">
              <CurrentRecordView currentRecords={runner?.records ?? []} />
            </div>
            <div className="order-4 md:order-4 col-span-2 md:col-span-1 flex flex-row md:flex-col items-stretch gap-[1vw] md:h-full">
              <div className="flex flex-1 w-full md:flex-1">
                <SponsorView />
              </div>
              <div className="flex flex-1 w-full md:flex-[0_0_auto]">
                <QRViewer url={window.location.href} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
