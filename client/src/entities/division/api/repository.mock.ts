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
    // Competition Mock Repository의 실제 ID 사용
    const comp001 = "comp-001"; // 제1회 로봇 프로그래밍 대회
    const comp002 = "comp-002"; // 대학생 알고리즘 경진대회
    const comp003 = "comp-003"; // AI 해커톤 2024

    // comp-001 (로봇 프로그래밍 대회)의 부문들
    const comp001Divisions: Division[] = [
      {
        id: "division-001",
        competitionId: comp001,
        name: "초등부",
        description: "초등학교 1-6학년 대상 로봇 프로그래밍 부문",
        createdAt: new Date("2024-01-15T09:00:00Z"),
        status: "ready",
        timeLimit: 240, // 4시간 (분 단위)
      },
      {
        id: "division-002",
        competitionId: comp001,
        name: "중등부",
        description: "중학교 1-3학년 대상 로봇 프로그래밍 부문",
        createdAt: new Date("2024-01-15T09:05:00Z"),
        status: "ready",
        timeLimit: 300, // 5시간
      },
      {
        id: "division-003",
        competitionId: comp001,
        name: "고등부",
        description: "고등학교 1-3학년 대상 로봇 프로그래밍 부문",
        createdAt: new Date("2024-01-15T09:10:00Z"),
        status: "ongoing",
        timeLimit: 360, // 6시간
      },
    ];

    // comp-002 (알고리즘 경진대회)의 부문들
    const comp002Divisions: Division[] = [
      {
        id: "division-004",
        competitionId: comp002,
        name: "Beginner",
        description: "프로그래밍 입문자 대상 알고리즘 문제",
        createdAt: new Date("2024-02-20T10:30:00Z"),
        status: "ready",
        timeLimit: 180, // 3시간
      },
      {
        id: "division-005",
        competitionId: comp002,
        name: "Intermediate",
        description: "중급자 대상 알고리즘 문제",
        createdAt: new Date("2024-02-20T10:35:00Z"),
        status: "ready",
        timeLimit: 240, // 4시간
      },
      {
        id: "division-006",
        competitionId: comp002,
        name: "Advanced",
        description: "고급자 대상 고난도 알고리즘 문제",
        createdAt: new Date("2024-02-20T10:40:00Z"),
        status: "closed",
        timeLimit: 300, // 5시간
      },
    ];

    // comp-003 (AI 해커톤)의 부문들
    const comp003Divisions: Division[] = [
      {
        id: "division-007",
        competitionId: comp003,
        name: "Computer Vision",
        description: "컴퓨터 비전 기술을 활용한 AI 솔루션 개발",
        createdAt: new Date("2024-03-10T14:00:00Z"),
        status: "ready",
        timeLimit: 2880, // 48시간
      },
      {
        id: "division-008",
        competitionId: comp003,
        name: "Natural Language Processing",
        description: "자연어 처리 기술을 활용한 AI 솔루션 개발", 
        createdAt: new Date("2024-03-10T14:05:00Z"),
        status: "ready",
        timeLimit: 2880, // 48시간
      },
    ];

    // competitionId별로 divisions 저장
    this.divisions.set(comp001, comp001Divisions);
    this.divisions.set(comp002, comp002Divisions);
    this.divisions.set(comp003, comp003Divisions);

    // 전체 division 저장소에 저장
    [...comp001Divisions, ...comp002Divisions, ...comp003Divisions].forEach((division) => {
      this.divisionStore.set(division.id, division);
    });

    this.nextId = 9; // 다음 ID는 9부터 시작
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

  async createDivision(competitionId: string, division: Omit<Division, "id" | "createdAt" | "status">): Promise<Division> {
    // 실제 API 호출을 시뮬레이션하기 위한 지연
    await new Promise((resolve) => setTimeout(resolve, 200));

    const newDivision: Division = {
      ...division,
      id: `division-${String(this.nextId++).padStart(3, '0')}`,
      createdAt: new Date(),
      status: "ready",
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
}