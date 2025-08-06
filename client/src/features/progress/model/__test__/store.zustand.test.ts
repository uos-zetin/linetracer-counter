import { describe, it, expect, beforeEach } from "vitest";
import type { Competition } from "@/entities/competition";
import type { Division, DivisionStatus } from "@/entities/division";
import type { ManualRecord } from "@/entities/manual-record";
import type { Participant } from "@/entities/participant";
import type { Record, RecordSource, RecordStatus } from "@/entities/record";
import type { TimerLog } from "@/entities/timer";
import { useZustandProgressStore } from "../store.zustand";
import type { ProgressState, Runner } from "../types";

// ---------------------------------------------------------------------------
// 🔧 테스트 유틸 — 목데이터 & 초기화
// ---------------------------------------------------------------------------
const NOW = new Date("2025-01-01T00:00:00Z");

/* Competition */
function dummyCompetition(): Competition {
  return {
    id: "comp‑1",
    name: "Dummy Competition",
    description: "테스트용 대회",
    createdAt: NOW,
  };
}

/* Division */
function dummyDivision(): Division {
  return {
    id: "div‑1",
    competitionId: "comp‑1",
    name: "Dummy Division",
    description: "테스트용 부문",
    createdAt: NOW,
    status: "ready" as DivisionStatus,
    timeLimit: 10 * 60 * 1_000, // 10분
  };
}

/* Participant */
function dummyParticipant(id = "par‑1"): Participant {
  return {
    id,
    divisionId: "div‑1",
    name: `참가자 ${id}`,
    teamName: "Team A",
    robotName: "Robot‑X",
    comment: "",
    orderRaw: 1,
    createdAt: NOW,
  };
}

/* TimerLog */
function dummyTimerLog(): TimerLog {
  return {
    id: "log‑1",
    participantId: "par‑1",
    value: 0,
    type: "start",
    createdAt: NOW,
  };
}

/* Record */
function dummyRecord(): Record {
  return {
    id: "rec‑1",
    participantId: "par‑1",
    value: 9_876,
    source: "manual" as RecordSource,
    status: "valid" as RecordStatus,
    note: "",
    createdAt: NOW,
  };
}

/* ManualRecord */
function dummyManualRecord(): ManualRecord {
  return {
    id: "mrec‑1",
    participantId: "par‑1",
    value: 9_876,
    recorderName: "관리자",
    createdAt: NOW,
  };
}

/* Runner */
function dummyRunner(): Runner {
  return {
    participant: dummyParticipant(),
    timerLogs: [dummyTimerLog()],
    records: [dummyRecord()],
    manualRecords: [dummyManualRecord()],
  };
}

/* Progress */
function dummyProgress(): ProgressState {
  return {
    id: "prog‑1",
    competition: dummyCompetition(),
    division: dummyDivision(),
    runner: dummyRunner(),
    nextRunners: [dummyParticipant("par‑2")],
    topRecords: [dummyRecord()],
  };
}

/* 각 테스트마다 스토어 초기화 */
function resetStore() {
  useZustandProgressStore.getState().reset();
}

// ---------------------------------------------------------------------------
// 🧪 ProgressStore 테스트 (AAA 패턴)
// ---------------------------------------------------------------------------
describe("Zustand ProgressStore", () => {
  beforeEach(resetStore);

  it("setProgress() — 전체 Progress를 설정한다", () => {
    // Arrange
    const progress = dummyProgress();

    // Act
    useZustandProgressStore.getState().setProgress(progress);

    // Assert
    const state = useZustandProgressStore.getState();
    expect({
      id: state.id,
      competition: state.competition,
      division: state.division,
      runner: state.runner,
      nextRunners: state.nextRunners,
      topRecords: state.topRecords,
    }).toEqual(progress);
  });

  it("patchProgress() — 부분 업데이트를 적용한다", () => {
    // Arrange
    const original = dummyProgress();
    useZustandProgressStore.getState().setProgress(original);
    const patchedRunner: Runner = {
      ...original.runner!,
      participant: { ...original.runner!.participant, name: "Patched Runner" },
    };

    // Act
    useZustandProgressStore.getState().patchProgress({ runner: patchedRunner });

    // Assert
    const state = useZustandProgressStore.getState();
    const { runner, competition, division, nextRunners, topRecords } = state;

    expect(runner).toEqual(patchedRunner); // 변경된 필드
    expect(competition).toEqual(original.competition);
    expect(division).toEqual(original.division);
    expect(nextRunners).toEqual(original.nextRunners);
    expect(topRecords).toEqual(original.topRecords);
  });

  it("reset() — 초기 상태로 되돌린다", () => {
    // Arrange
    useZustandProgressStore.getState().setProgress(dummyProgress());

    // Act
    useZustandProgressStore.getState().reset();

    // Assert
    const state = useZustandProgressStore.getState();
    expect({
      id: state.id,
      competition: state.competition,
      division: state.division,
      runner: state.runner,
      nextRunners: state.nextRunners,
      topRecords: state.topRecords,
    }).toEqual({
      id: "",
      competition: null,
      division: null,
      runner: null,
      nextRunners: [],
      topRecords: [],
    });
  });
});
