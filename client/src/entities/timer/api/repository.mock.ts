import type { TimerLog } from "../model/types";
import type { TimerRepository } from "./types";

export class MockTimerRepository implements TimerRepository {
  private timerLogs: Map<string, TimerLog[]> = new Map();
  private nextId = 1;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    const mockTimerLogs = [
      // participant-1의 타이머 로그
      {
        participantId: "participant-1",
        logs: [
          {
            id: "timer-log-1",
            participantId: "participant-1",
            value: 0,
            type: "start" as const,
            createdAt: new Date("2024-01-15T10:00:00Z"),
          },
          {
            id: "timer-log-2", 
            participantId: "participant-1",
            value: 185000,
            type: "stop" as const,
            createdAt: new Date("2024-01-15T10:03:05Z"),
          },
          {
            id: "timer-log-3",
            participantId: "participant-1", 
            value: -5000,
            type: "add" as const,
            createdAt: new Date("2024-01-15T10:03:10Z"),
          },
        ],
      },
      // participant-2의 타이머 로그
      {
        participantId: "participant-2",
        logs: [
          {
            id: "timer-log-4",
            participantId: "participant-2",
            value: 0,
            type: "start" as const,
            createdAt: new Date("2024-01-15T10:05:00Z"),
          },
          {
            id: "timer-log-5",
            participantId: "participant-2",
            value: 142000,
            type: "stop" as const,
            createdAt: new Date("2024-01-15T10:07:22Z"),
          },
        ],
      },
      // participant-3의 타이머 로그
      {
        participantId: "participant-3",
        logs: [
          {
            id: "timer-log-6",
            participantId: "participant-3",
            value: 0,
            type: "start" as const,
            createdAt: new Date("2024-01-15T10:10:00Z"),
          },
          {
            id: "timer-log-7",
            participantId: "participant-3",
            value: 198000,
            type: "stop" as const,
            createdAt: new Date("2024-01-15T10:13:18Z"),
          },
          {
            id: "timer-log-8",
            participantId: "participant-3",
            value: 10000,
            type: "sub" as const,
            createdAt: new Date("2024-01-15T10:13:25Z"),
          },
        ],
      },
    ];

    mockTimerLogs.forEach(({ participantId, logs }) => {
      this.timerLogs.set(participantId, logs);
    });

    this.nextId = 9;
  }

  async getTimerLogs(participantId: string): Promise<TimerLog[]> {
    await this.simulateDelay(80);
    
    const logs = this.timerLogs.get(participantId) || [];
    return [...logs].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async startTimer(participantId: string): Promise<TimerLog> {
    await this.simulateDelay(100);

    const newLog: TimerLog = {
      id: `timer-log-${this.nextId++}`,
      participantId,
      value: 0,
      type: "start",
      createdAt: new Date(),
    };

    const existingLogs = this.timerLogs.get(participantId) || [];
    this.timerLogs.set(participantId, [...existingLogs, newLog]);

    return { ...newLog };
  }

  async stopTimer(participantId: string): Promise<TimerLog> {
    await this.simulateDelay(100);

    const existingLogs = this.timerLogs.get(participantId) || [];
    const startLog = [...existingLogs]
      .reverse()
      .find(log => log.type === "start");

    if (!startLog) {
      throw new Error("시작된 타이머가 없습니다.");
    }

    const elapsedMs = Date.now() - startLog.createdAt.getTime();

    const newLog: TimerLog = {
      id: `timer-log-${this.nextId++}`,
      participantId,
      value: elapsedMs,
      type: "stop",
      createdAt: new Date(),
    };

    this.timerLogs.set(participantId, [...existingLogs, newLog]);

    return { ...newLog };
  }

  async adjustTimer(participantId: string, value: number): Promise<TimerLog> {
    await this.simulateDelay(120);

    const newLog: TimerLog = {
      id: `timer-log-${this.nextId++}`,
      participantId,
      value,
      type: value >= 0 ? "add" : "sub",
      createdAt: new Date(),
    };

    const existingLogs = this.timerLogs.get(participantId) || [];
    this.timerLogs.set(participantId, [...existingLogs, newLog]);

    return { ...newLog };
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public reset(): void {
    this.timerLogs.clear();
    this.nextId = 1;
    this.initializeMockData();
  }

  public addTestTimerLog(participantId: string, log: TimerLog): void {
    const existingLogs = this.timerLogs.get(participantId) || [];
    this.timerLogs.set(participantId, [...existingLogs, log]);
  }

  public getStoredTimerLogs(participantId: string): TimerLog[] {
    return this.timerLogs.get(participantId) || [];
  }

  public getCurrentTimerState(participantId: string): { isRunning: boolean; lastStartTime?: Date } {
    const logs = this.timerLogs.get(participantId) || [];
    const sortedLogs = [...logs].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    const lastLog = sortedLogs[sortedLogs.length - 1];
    
    if (!lastLog) {
      return { isRunning: false };
    }

    if (lastLog.type === "start") {
      return { isRunning: true, lastStartTime: lastLog.createdAt };
    }

    return { isRunning: false };
  }
}