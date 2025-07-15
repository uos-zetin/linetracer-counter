import { useStopwatchStore } from "@/entities/stopwatch";
import { useProgressStore } from "@/features/progress";
import { integrateLogs } from "@/features/timer";
import { TimerView } from "./timer-view";
import { TimerPageHeader } from "./header";
import { DivisionInfo } from "./division-info";
import { RunnerInfo } from "./runner-info";
import { StopwatchView } from "./stopwatch-view";
import { NextRunnerInfo } from "./next-runner-info";
import { TopRecordView } from "./top-record-info";
import { CurrentRecordView } from "./current-record-view";

import type { Progress } from "@/features/progress";
import { SponsorView } from "./sponsor-view";
import { QRViewer } from "./qr-viewer";

const mockProgress: Progress = {
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
  const progressStore = useProgressStore();
  const stopwatchStore = useStopwatchStore();

  const competition = progressStore.useCompetition();
  const division = progressStore.useDivision();
  const runner = progressStore.useRunner();
  const nextRunners = progressStore.useNextRunners();
  const stopwatch = stopwatchStore.useStopwatchState();

  const timerState = integrateLogs(runner?.participant.givenTime ?? 4 * 60 * 1000, runner?.timerLogs ?? []);
  // const topRecords = progressStore.useTopRecords();

  // useEffect(() => {
  //   if (runner) {
  //     timerStore.setTimer(runner.participant.givenTime, runner.timerLogs);
  //   } else {
  //     timerStore.setTimer(0, []);
  //   }
  // }, [runner, timerStore]);

  progressStore.setProgress(mockProgress);
  // stopwatchStore.start(Date.now());

  return (
    <main className="flex flex-col min-h-screen h-full bg-uos-gray-mist">
      <TimerPageHeader content={competition?.name ?? "No Competition"} type="text" />
      <section
        id="timer-content"
        className="grid gap-x-[1.5vw] gap-y-[0.75vw] grid-cols-1 md:grid-cols-2 px-[1vw] md:px-[1.5vw] py-[2vw] md:py-[3vw] h-full"
      >
        <div className="order-1 md:row-start-1 md:col-start-1">
          <DivisionInfo divisionName={division?.name ?? "No Division"} />
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
          <StopwatchView stopwatch={stopwatch} />
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
            <div className="order-4 md:order-4 col-span-2 md:col-span-1 flex flex-row md:flex-col items-center gap-[1vw] md:h-full">
              <div className="flex flex-1 w-full">
                <SponsorView />
              </div>
              <div className="flex flex-1 w-full">
                <QRViewer />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
