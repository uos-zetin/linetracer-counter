import type { Competition } from "../model/types";
import type { CompetitionRepository } from "./types";

export class MockCompetitionRepository implements CompetitionRepository {
  private competitions: Competition[] = [
    {
      id: "comp-001",
      name: "제1회 로봇 프로그래밍 대회",
      description: "초중고등학생을 대상으로 한 로봇 프로그래밍 대회입니다. Arduino와 센서를 활용하여 자율주행 로봇을 제작하고 미션을 수행합니다.",
      createdAt: new Date("2024-01-15T09:00:00Z"),
    },
    {
      id: "comp-002",
      name: "대학생 알고리즘 경진대회",
      description: "전국 대학생을 대상으로 한 알고리즘 문제 해결 능력을 겨루는 대회입니다. 다양한 난이도의 문제를 통해 프로그래밍 실력을 평가합니다.",
      createdAt: new Date("2024-02-20T10:30:00Z"),
    },
    {
      id: "comp-003",
      name: "AI 해커톤 2024",
      description: "인공지능 기술을 활용한 창의적인 솔루션을 개발하는 48시간 해커톤입니다. 머신러닝, 딥러닝 기술을 활용한 혁신적인 아이디어를 구현해보세요.",
      createdAt: new Date("2024-03-10T14:00:00Z"),
    },
    {
      id: "comp-004",
      name: "웹 개발 챌린지",
      description: "모던 웹 기술을 활용한 풀스택 웹 애플리케이션 개발 대회입니다. React, Node.js, 데이터베이스를 활용하여 완성도 높은 서비스를 구현합니다.",
      createdAt: new Date("2024-03-25T16:45:00Z"),
    },
    {
      id: "comp-005",
      name: "사이버 보안 CTF",
      description: "Capture The Flag 형식의 사이버 보안 대회입니다. 다양한 보안 취약점을 찾고 해결하는 능력을 겨루는 대회입니다.",
      createdAt: new Date("2024-04-05T11:20:00Z"),
    },
  ];

  private getNextId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `comp-${timestamp}-${random}`;
  }

  async getAllCompetitions(): Promise<Competition[]> {
    // 실제 API 호출을 시뮬레이션하기 위한 지연
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    // 생성일시 기준 내림차순 정렬
    return [...this.competitions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCompetitionById(competitionId: string): Promise<Competition | null> {
    // 실제 API 호출을 시뮬레이션하기 위한 지연
    await new Promise((resolve) => setTimeout(resolve, 50));
    
    const competition = this.competitions.find((c) => c.id === competitionId);
    return competition || null;
  }

  async createCompetition(competition: Omit<Competition, "id" | "createdAt">): Promise<Competition> {
    // 실제 API 호출을 시뮬레이션하기 위한 지연
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    const newCompetition: Competition = {
      id: this.getNextId(),
      name: competition.name,
      description: competition.description,
      createdAt: new Date(),
    };

    this.competitions.push(newCompetition);
    return newCompetition;
  }

  async updateCompetition(competition: Competition): Promise<Competition> {
    // 실제 API 호출을 시뮬레이션하기 위한 지연
    await new Promise((resolve) => setTimeout(resolve, 150));
    
    const index = this.competitions.findIndex((c) => c.id === competition.id);
    
    if (index === -1) {
      throw new Error(`대회를 찾을 수 없습니다: ${competition.id}`);
    }

    // 업데이트된 대회 정보 (createdAt은 변경하지 않음)
    const updatedCompetition: Competition = {
      ...competition,
      createdAt: this.competitions[index].createdAt, // 기존 생성일시 유지
    };

    this.competitions[index] = updatedCompetition;
    return updatedCompetition;
  }

  async deleteCompetition(competitionId: string): Promise<void> {
    // 실제 API 호출을 시뮬레이션하기 위한 지연
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    const index = this.competitions.findIndex((c) => c.id === competitionId);
    
    if (index === -1) {
      throw new Error(`대회를 찾을 수 없습니다: ${competitionId}`);
    }

    this.competitions.splice(index, 1);
  }

  // 테스트와 개발을 위한 유틸리티 메서드들
  async reset(): Promise<void> {
    this.competitions = [
      {
        id: "comp-001",
        name: "제1회 로봇 프로그래밍 대회",
        description: "초중고등학생을 대상으로 한 로봇 프로그래밍 대회입니다. Arduino와 센서를 활용하여 자율주행 로봇을 제작하고 미션을 수행합니다.",
        createdAt: new Date("2024-01-15T09:00:00Z"),
      },
      {
        id: "comp-002",
        name: "대학생 알고리즘 경진대회",
        description: "전국 대학생을 대상으로 한 알고리즘 문제 해결 능력을 겨루는 대회입니다. 다양한 난이도의 문제를 통해 프로그래밍 실력을 평가합니다.",
        createdAt: new Date("2024-02-20T10:30:00Z"),
      },
      {
        id: "comp-003",
        name: "AI 해커톤 2024",
        description: "인공지능 기술을 활용한 창의적인 솔루션을 개발하는 48시간 해커톤입니다. 머신러닝, 딥러닝 기술을 활용한 혁신적인 아이디어를 구현해보세요.",
        createdAt: new Date("2024-03-10T14:00:00Z"),
      },
      {
        id: "comp-004",
        name: "웹 개발 챌린지",
        description: "모던 웹 기술을 활용한 풀스택 웹 애플리케이션 개발 대회입니다. React, Node.js, 데이터베이스를 활용하여 완성도 높은 서비스를 구현합니다.",
        createdAt: new Date("2024-03-25T16:45:00Z"),
      },
      {
        id: "comp-005",
        name: "사이버 보안 CTF",
        description: "Capture The Flag 형식의 사이버 보안 대회입니다. 다양한 보안 취약점을 찾고 해결하는 능력을 겨루는 대회입니다.",
        createdAt: new Date("2024-04-05T11:20:00Z"),
      },
    ];
  }

  async getCompetitionCount(): Promise<number> {
    return this.competitions.length;
  }
}