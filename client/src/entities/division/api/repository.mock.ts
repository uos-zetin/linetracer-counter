import type { Division } from "../model/types";
import type { DivisionRepository } from "./types";

export class MockDivisionRepository implements DivisionRepository {
  private divisions: Map<string, Division[]> = new Map(); // competitionId별 divisions 관리
  private divisionStore: Map<string, Division> = new Map(); // 모든 divisions 저장소
  private nextId = 1;

  constructor() {
    // 초기 mock 데이터 생성
    this.initializeMockData();
  }

  private initializeMockData(): void {
    const competition1Id = "competition-1";
    const competition2Id = "competition-2";

    // 대회 1의 부문들
    const competition1Divisions: Division[] = [
      {
        id: "division-1",
        competitionId: competition1Id,
        name: "초등부",
        description: "초등학교 1-6학년 대상 부문",
        createdAt: new Date("2024-01-01T09:00:00Z"),
        status: "ready",
      },
      {
        id: "division-2",
        competitionId: competition1Id,
        name: "중등부",
        description: "중학교 1-3학년 대상 부문",
        createdAt: new Date("2024-01-01T09:05:00Z"),
        status: "ongoing",
      },
      {
        id: "division-3",
        competitionId: competition1Id,
        name: "고등부",
        description: "고등학교 1-3학년 대상 부문",
        createdAt: new Date("2024-01-01T09:10:00Z"),
        status: "ready",
      },
      {
        id: "division-4",
        competitionId: competition1Id,
        name: "일반부",
        description: "대학생 및 성인 대상 부문",
        createdAt: new Date("2024-01-01T09:15:00Z"),
        status: "closed",
      },
    ];

    // 대회 2의 부문들
    const competition2Divisions: Division[] = [
      {
        id: "division-5",
        competitionId: competition2Id,
        name: "주니어부",
        description: "10세 이하 참가자 대상",
        createdAt: new Date("2024-02-01T10:00:00Z"),
        status: "ready",
      },
      {
        id: "division-6",
        competitionId: competition2Id,
        name: "시니어부",
        description: "18세 이상 참가자 대상",
        createdAt: new Date("2024-02-01T10:05:00Z"),
        status: "ongoing",
      },
    ];

    // competitionId별로 divisions 저장
    this.divisions.set(competition1Id, competition1Divisions);
    this.divisions.set(competition2Id, competition2Divisions);

    // 전체 division 저장소에 저장
    [...competition1Divisions, ...competition2Divisions].forEach((division) => {
      this.divisionStore.set(division.id, division);
    });

    this.nextId = 7; // 다음 ID는 7부터 시작
  }

  async getAllDivisions(competitionId: string): Promise<Division[]> {
    // 실제 API 호출을 시뮬레이션하기 위한 지연
    await new Promise((resolve) => setTimeout(resolve, 100));

    const divisions = this.divisions.get(competitionId);
    return divisions ? [...divisions] : [];
  }

  async getDivisionById(divisionId: string): Promise<Division | null> {
    // 실제 API 호출을 시뮬레이션하기 위한 지연
    await new Promise((resolve) => setTimeout(resolve, 50));

    const division = this.divisionStore.get(divisionId);
    return division ? { ...division } : null;
  }

  async createDivision(
    competitionId: string,
    division: Omit<Division, "id" | "createdAt">
  ): Promise<Division> {
    // 실제 API 호출을 시뮬레이션하기 위한 지연
    await new Promise((resolve) => setTimeout(resolve, 200));

    const newDivision: Division = {
      ...division,
      id: `division-${this.nextId++}`,
      createdAt: new Date(),
    };

    // competitionId별 divisions에 추가
    const existingDivisions = this.divisions.get(competitionId) || [];
    const updatedDivisions = [...existingDivisions, newDivision];
    this.divisions.set(competitionId, updatedDivisions);

    // 전체 저장소에도 추가
    this.divisionStore.set(newDivision.id, newDivision);

    return { ...newDivision };
  }

  async updateDivision(divisionId: string, division: Division): Promise<Division | null> {
    // 실제 API 호출을 시뮬레이션하기 위한 지연
    await new Promise((resolve) => setTimeout(resolve, 150));

    const existingDivision = this.divisionStore.get(divisionId);
    if (!existingDivision) {
      return null;
    }

    const updatedDivision: Division = {
      ...division,
      id: divisionId, // ID는 변경하지 않음
      createdAt: existingDivision.createdAt, // 생성일은 유지
    };

    // 전체 저장소 업데이트
    this.divisionStore.set(divisionId, updatedDivision);

    // competitionId별 저장소도 업데이트
    const competitionDivisions = this.divisions.get(division.competitionId);
    if (competitionDivisions) {
      const index = competitionDivisions.findIndex((d) => d.id === divisionId);
      if (index !== -1) {
        competitionDivisions[index] = updatedDivision;
      }
    }

    return { ...updatedDivision };
  }

  async deleteDivision(divisionId: string): Promise<void> {
    // 실제 API 호출을 시뮬레이션하기 위한 지연
    await new Promise((resolve) => setTimeout(resolve, 100));

    const division = this.divisionStore.get(divisionId);
    if (!division) {
      throw new Error("부문을 찾을 수 없습니다");
    }

    // 전체 저장소에서 삭제
    this.divisionStore.delete(divisionId);

    // competitionId별 저장소에서도 삭제
    const competitionDivisions = this.divisions.get(division.competitionId);
    if (competitionDivisions) {
      const filteredDivisions = competitionDivisions.filter((d) => d.id !== divisionId);
      this.divisions.set(division.competitionId, filteredDivisions);
    }
  }

  // 테스트를 위한 헬퍼 메서드들
  public reset(): void {
    this.divisions.clear();
    this.divisionStore.clear();
    this.nextId = 1;
    this.initializeMockData();
  }

  public addTestDivision(division: Division): void {
    this.divisionStore.set(division.id, division);
    const competitionDivisions = this.divisions.get(division.competitionId) || [];
    competitionDivisions.push(division);
    this.divisions.set(division.competitionId, competitionDivisions);
  }

  public getStoredDivision(divisionId: string): Division | undefined {
    return this.divisionStore.get(divisionId);
  }

  public getStoredDivisionsByCompetition(competitionId: string): Division[] {
    return this.divisions.get(competitionId) || [];
  }

  // 상태 변경을 시뮬레이션하는 메서드
  public simulateStatusChange(divisionId: string, newStatus: Division["status"]): boolean {
    const division = this.divisionStore.get(divisionId);
    if (!division) {
      return false;
    }

    const updatedDivision = { ...division, status: newStatus };
    this.divisionStore.set(divisionId, updatedDivision);

    // competitionId별 저장소도 업데이트
    const competitionDivisions = this.divisions.get(division.competitionId);
    if (competitionDivisions) {
      const index = competitionDivisions.findIndex((d) => d.id === divisionId);
      if (index !== -1) {
        competitionDivisions[index] = updatedDivision;
      }
    }

    return true;
  }
}