import type { Record } from "@/entities/record";
import type { ProgressState } from "../model/types";
import type { ProgressRepository } from "./types";

export class MockProgressRepository implements ProgressRepository {
  private progressStates: Map<string, ProgressState> = new Map();
  private runnerOrders: Map<string, string[]> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // division-1의 진행 상태
    const division1Progress: ProgressState = {
      id: "progress-division-1",
      competition: {
        id: "comp-001",
        name: "제1회 로봇 프로그래밍 대회",
        description: "초중고등학생을 대상으로 한 로봇 프로그래밍 대회입니다.",
        createdAt: new Date("2024-01-15T09:00:00Z"),
      },
      division: {
        id: "division-1",
        competitionId: "comp-001",
        name: "초등부",
        description: "초등학교 1-6학년 대상 부문",
        createdAt: new Date("2024-01-01T09:00:00Z"),
        status: "ongoing",
      },
      runner: {
        participant: {
          id: "participant-2",
          name: "이지은",
          teamName: "부산국제고등학교",
          robotName: "라이트닝볼트",
          comment: "두 번째 참가자",
          orderRaw: 2,
          givenTime: 165,
          createdAt: new Date("2024-01-02T09:05:00Z"),
        },
        timerLogs: [
          {
            id: "timer-log-4",
            participantId: "participant-2",
            value: 0,
            type: "start",
            createdAt: new Date("2024-01-15T10:05:00Z"),
          },
        ],
        records: [
          {
            id: "record-3",
            participantId: "participant-2",
            value: 142000,
            source: "stopwatch",
            status: "approved",
            note: "훌륭한 기록",
            createdAt: new Date("2024-01-15T10:07:22Z"),
          },
        ],
        manualRecords: [
          {
            id: "manual-record-3",
            participantId: "participant-2",
            value: 142000,
            recorderName: "박심판",
            invalidatedAt: null,
            createdAt: new Date("2024-01-15T10:10:00Z"),
          },
        ],
      },
      nextRunners: [
        {
          id: "participant-3",
          name: "박준호",
          teamName: "대전고등학교",
          robotName: "썬더봇",
          comment: "세 번째 참가자",
          orderRaw: 3,
          givenTime: 195,
          createdAt: new Date("2024-01-02T09:10:00Z"),
        },
        {
          id: "participant-1",
          name: "김민수",
          teamName: "서울과학고등학교",
          robotName: "스피드마스터",
          comment: "첫 번째 참가자",
          orderRaw: 1,
          givenTime: 180,
          createdAt: new Date("2024-01-02T09:00:00Z"),
        },
      ],
      topRecords: [
        {
          id: "record-3",
          participantId: "participant-2",
          value: 142000,
          source: "stopwatch",
          status: "approved",
          note: "훌륭한 기록",
          createdAt: new Date("2024-01-15T10:07:22Z"),
        },
        {
          id: "record-1",
          participantId: "participant-1",
          value: 180000,
          source: "stopwatch",
          status: "approved",
          note: "완주 성공",
          createdAt: new Date("2024-01-15T10:03:00Z"),
        },
      ],
    };

    // division-2의 진행 상태
    const division2Progress: ProgressState = {
      id: "progress-division-2",
      competition: {
        id: "comp-001",
        name: "제1회 로봇 프로그래밍 대회",
        description: "초중고등학생을 대상으로 한 로봇 프로그래밍 대회입니다.",
        createdAt: new Date("2024-01-15T09:00:00Z"),
      },
      division: {
        id: "division-2",
        competitionId: "comp-001",
        name: "중등부",
        description: "중학교 1-3학년 대상 부문",
        createdAt: new Date("2024-01-01T09:05:00Z"),
        status: "ready",
      },
      runner: null,
      nextRunners: [
        {
          id: "participant-4",
          name: "최지훈",
          teamName: "미래 엔지니어",
          robotName: "감마봇",
          comment: "중학생 부문에서 최선을 다하겠습니다.",
          orderRaw: 1,
          givenTime: 240,
          createdAt: new Date("2024-01-02T10:00:00Z"),
        },
        {
          id: "participant-5",
          name: "정수연",
          teamName: "AI 워리어즈",
          robotName: "델타봇",
          comment: "인공지능 기술을 활용한 로봇입니다.",
          orderRaw: 2,
          givenTime: 260,
          createdAt: new Date("2024-01-02T10:05:00Z"),
        },
      ],
      topRecords: [],
    };

    this.progressStates.set("division-1", division1Progress);
    this.progressStates.set("division-2", division2Progress);

    // 러너 순서 설정
    this.runnerOrders.set("division-1", ["participant-2", "participant-3", "participant-1"]);
    this.runnerOrders.set("division-2", ["participant-4", "participant-5"]);
  }

  async getProgress(divisionId: string): Promise<ProgressState | null> {
    await this.simulateDelay(100);

    const progress = this.progressStates.get(divisionId);
    return progress ? JSON.parse(JSON.stringify(progress)) : null;
  }

  async openProgressDivision(divisionId: string): Promise<void> {
    await this.simulateDelay(150);

    const progress = this.progressStates.get(divisionId);
    if (!progress) {
      throw new Error(`부문을 찾을 수 없습니다: ${divisionId}`);
    }

    if (progress.division) {
      progress.division.status = "ongoing";
    }

    this.progressStates.set(divisionId, progress);
  }

  async closeProgressDivision(divisionId: string): Promise<void> {
    await this.simulateDelay(150);

    const progress = this.progressStates.get(divisionId);
    if (!progress) {
      throw new Error(`부문을 찾을 수 없습니다: ${divisionId}`);
    }

    if (progress.division) {
      progress.division.status = "closed";
    }

    // 현재 러너 제거
    progress.runner = null;

    this.progressStates.set(divisionId, progress);
  }

  async resetProgressDivision(divisionId: string): Promise<void> {
    await this.simulateDelay(120);

    const progress = this.progressStates.get(divisionId);
    if (!progress) {
      throw new Error(`부문을 찾을 수 없습니다: ${divisionId}`);
    }

    // 상태 초기화
    if (progress.division) {
      progress.division.status = "ready";
    }
    progress.runner = null;
    progress.topRecords = [];

    this.progressStates.set(divisionId, progress);
  }

  async setCurrentRunner(divisionId: string, participantId: string): Promise<void> {
    await this.simulateDelay(100);

    const progress = this.progressStates.get(divisionId);
    if (!progress) {
      throw new Error(`부문을 찾을 수 없습니다: ${divisionId}`);
    }

    // nextRunners에서 해당 참가자 찾기
    const participantIndex = progress.nextRunners.findIndex((p) => p.id === participantId);
    if (participantIndex === -1) {
      throw new Error(`참가자를 찾을 수 없습니다: ${participantId}`);
    }

    const participant = progress.nextRunners[participantIndex];

    // 현재 러너로 설정
    progress.runner = {
      participant,
      timerLogs: [],
      records: [],
      manualRecords: [],
    };

    // nextRunners에서 제거
    progress.nextRunners.splice(participantIndex, 1);

    this.progressStates.set(divisionId, progress);
  }

  async postponeCurrentRunner(divisionId: string): Promise<void> {
    await this.simulateDelay(100);

    const progress = this.progressStates.get(divisionId);
    if (!progress || !progress.runner) {
      throw new Error(`현재 러너가 없습니다: ${divisionId}`);
    }

    // 현재 러너를 nextRunners 맨 뒤로 이동
    progress.nextRunners.push(progress.runner.participant);
    progress.runner = null;

    this.progressStates.set(divisionId, progress);
  }

  async getOrder(divisionId: string): Promise<string[]> {
    await this.simulateDelay(50);

    const order = this.runnerOrders.get(divisionId);
    return order ? [...order] : [];
  }

  async changeOrder(divisionId: string, participantId: string, order: number): Promise<void> {
    await this.simulateDelay(120);

    const currentOrder = this.runnerOrders.get(divisionId) || [];
    const participantIndex = currentOrder.indexOf(participantId);

    if (participantIndex === -1) {
      throw new Error(`참가자를 찾을 수 없습니다: ${participantId}`);
    }

    // 순서 변경
    currentOrder.splice(participantIndex, 1);
    const newIndex = Math.max(0, Math.min(order, currentOrder.length));
    currentOrder.splice(newIndex, 0, participantId);

    this.runnerOrders.set(divisionId, currentOrder);

    // progress state의 nextRunners 순서도 업데이트
    const progress = this.progressStates.get(divisionId);
    if (progress) {
      progress.nextRunners.sort((a, b) => {
        const aIndex = currentOrder.indexOf(a.id);
        const bIndex = currentOrder.indexOf(b.id);
        return aIndex - bIndex;
      });
      this.progressStates.set(divisionId, progress);
    }
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public resetMockData(): void {
    this.progressStates.clear();
    this.runnerOrders.clear();
    this.initializeMockData();
  }

  public addTestProgress(divisionId: string, progress: ProgressState): void {
    this.progressStates.set(divisionId, progress);
  }

  public getStoredProgress(divisionId: string): ProgressState | undefined {
    return this.progressStates.get(divisionId);
  }

  public simulateRunnerFinish(divisionId: string, record: Record): boolean {
    const progress = this.progressStates.get(divisionId);
    if (!progress || !progress.runner) {
      return false;
    }

    // 기록 추가
    progress.runner.records.push(record);
    progress.topRecords.push(record);

    // 상위 기록 정렬 (시간 순)
    progress.topRecords.sort((a, b) => a.value - b.value);
    progress.topRecords = progress.topRecords.slice(0, 10); // 상위 10개만 유지

    // 러너 완료 처리
    progress.runner = null;

    this.progressStates.set(divisionId, progress);
    return true;
  }

  public getProgressByStatus(status: "ready" | "ongoing" | "closed"): ProgressState[] {
    return Array.from(this.progressStates.values()).filter((progress) => progress.division?.status === status);
  }

  public getAllDivisionIds(): string[] {
    return Array.from(this.progressStates.keys());
  }
}
