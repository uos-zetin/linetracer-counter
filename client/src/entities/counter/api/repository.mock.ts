import type { CounterState } from "../model/types";
import type { CounterRepository } from "./types";

export class MockCounterRepository implements CounterRepository {
  private counters: Map<string, CounterState> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    const mockCounters: CounterState[] = [
      {
        id: "counter-1",
        name: "메인 카운터 #1",
        startedAt: null,
        stoppedAt: null,
        divisionId: "division-1",
      },
      {
        id: "counter-2",
        name: "메인 카운터 #2",
        startedAt: Date.now() - 30000, // 30초 전에 시작
        stoppedAt: null,
        divisionId: "division-2",
      },
      {
        id: "counter-3",
        name: "보조 카운터 #1",
        startedAt: Date.now() - 120000, // 2분 전에 시작
        stoppedAt: Date.now() - 60000, // 1분 전에 정지
        divisionId: "division-1",
      },
      {
        id: "counter-4",
        name: "보조 카운터 #2",
        startedAt: null,
        stoppedAt: null,
        divisionId: null, // 연결되지 않은 카운터
      },
      {
        id: "counter-5",
        name: "스탠바이 카운터",
        startedAt: null,
        stoppedAt: null,
        divisionId: "division-3",
      },
    ];

    mockCounters.forEach(counter => {
      this.counters.set(counter.id, counter);
    });
  }

  async getAll(): Promise<CounterState[]> {
    await this.simulateDelay(100);
    
    return Array.from(this.counters.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getById(id: string): Promise<CounterState | null> {
    await this.simulateDelay(50);
    
    const counter = this.counters.get(id);
    return counter ? { ...counter } : null;
  }

  async connectDivision(counterId: string, divisionId: string): Promise<void> {
    await this.simulateDelay(120);
    
    const counter = this.counters.get(counterId);
    if (!counter) {
      throw new Error(`카운터를 찾을 수 없습니다: ${counterId}`);
    }

    // 해당 부문에 이미 연결된 다른 카운터가 있는지 확인
    const existingCounter = Array.from(this.counters.values())
      .find(c => c.divisionId === divisionId && c.id !== counterId);
    
    if (existingCounter) {
      // 기존 카운터의 연결을 해제
      existingCounter.divisionId = null;
      this.counters.set(existingCounter.id, existingCounter);
    }

    // 새 카운터를 부문에 연결
    const updatedCounter: CounterState = {
      ...counter,
      divisionId,
    };

    this.counters.set(counterId, updatedCounter);
  }

  async disconnectDivision(counterId: string): Promise<void> {
    await this.simulateDelay(100);
    
    const counter = this.counters.get(counterId);
    if (!counter) {
      throw new Error(`카운터를 찾을 수 없습니다: ${counterId}`);
    }

    const updatedCounter: CounterState = {
      ...counter,
      divisionId: null,
    };

    this.counters.set(counterId, updatedCounter);
  }

  async reset(counterId: string): Promise<void> {
    await this.simulateDelay(80);
    
    const counter = this.counters.get(counterId);
    if (!counter) {
      throw new Error(`카운터를 찾을 수 없습니다: ${counterId}`);
    }

    const resetCounter: CounterState = {
      ...counter,
      startedAt: null,
      stoppedAt: null,
    };

    this.counters.set(counterId, resetCounter);
  }

  async disconnectCounter(counterId: string): Promise<void> {
    await this.simulateDelay(100);
    
    const counter = this.counters.get(counterId);
    if (!counter) {
      throw new Error(`카운터를 찾을 수 없습니다: ${counterId}`);
    }

    this.counters.delete(counterId);
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public resetMockData(): void {
    this.counters.clear();
    this.initializeMockData();
  }

  public addTestCounter(counter: CounterState): void {
    this.counters.set(counter.id, counter);
  }

  public getStoredCounter(counterId: string): CounterState | undefined {
    return this.counters.get(counterId);
  }

  public getCountersByDivision(divisionId: string): CounterState[] {
    return Array.from(this.counters.values())
      .filter(counter => counter.divisionId === divisionId);
  }

  public getAvailableCounters(): CounterState[] {
    return Array.from(this.counters.values())
      .filter(counter => counter.divisionId === null);
  }

  public simulateCounterStart(counterId: string): boolean {
    const counter = this.counters.get(counterId);
    if (!counter) {
      return false;
    }

    const startedCounter: CounterState = {
      ...counter,
      startedAt: Date.now(),
      stoppedAt: null,
    };

    this.counters.set(counterId, startedCounter);
    return true;
  }

  public simulateCounterStop(counterId: string): boolean {
    const counter = this.counters.get(counterId);
    if (!counter || !counter.startedAt) {
      return false;
    }

    const stoppedCounter: CounterState = {
      ...counter,
      stoppedAt: Date.now(),
    };

    this.counters.set(counterId, stoppedCounter);
    return true;
  }
}