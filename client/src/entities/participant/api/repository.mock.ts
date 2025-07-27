import type { Participant } from "../model/types";
import type { ParticipantRepository } from "./types";

/**
 * 참가자(Participant) 엔티티의 Mock Repository 구현체
 * 개발 및 테스트 환경에서 실제 API 호출 없이 참가자 데이터를 관리합니다.
 */
export class MockParticipantRepository implements ParticipantRepository {
  private participants: Map<string, Participant> = new Map();
  private participantsByDivision: Map<string, string[]> = new Map();
  private nextId = 1;

  constructor() {
    this.initializeMockData();
  }

  /**
   * Mock 데이터 초기화
   * 실제적인 한국어 참가자 데이터를 생성합니다.
   */
  private initializeMockData(): void {
    const mockData = [
      // 부문 1 참가자들
      {
        divisionId: "division-1",
        name: "김민수",
        teamName: "서울과학고등학교",
        robotName: "스피드마스터",
        comment: "첫 번째 참가자",
        orderRaw: 1,
        givenTime: 180,
      },
      {
        divisionId: "division-1", 
        name: "이지은",
        teamName: "부산국제고등학교",
        robotName: "라이트닝볼트",
        comment: "두 번째 참가자",
        orderRaw: 2,
        givenTime: 165,
      },
      {
        divisionId: "division-1",
        name: "박준호",
        teamName: "대전고등학교",
        robotName: "썬더봇",
        comment: "세 번째 참가자",
        orderRaw: 3,
        givenTime: 195,
      },
      // 부문 2 참가자들  
      {
        divisionId: "division-2",
        name: "최은영",
        teamName: "인천과학고등학교",
        robotName: "파이어워크",
        comment: "부문 2 첫 번째 참가자",
        orderRaw: 1,
        givenTime: 200,
      },
      {
        divisionId: "division-2",
        name: "정우진",
        teamName: "광주과학고등학교", 
        robotName: "아이언이글",
        comment: "부문 2 두 번째 참가자",
        orderRaw: 2,
        givenTime: 175,
      },
      {
        divisionId: "division-2",
        name: "한소희",
        teamName: "울산과학고등학교",
        robotName: "골든드래곤",
        comment: "부문 2 세 번째 참가자",
        orderRaw: 3,
        givenTime: 190,
      },
      // 부문 3 참가자들
      {
        divisionId: "division-3",
        name: "임태현",
        teamName: "청주고등학교",
        robotName: "사이버나이트",
        comment: "부문 3 첫 번째 참가자",
        orderRaw: 1,
        givenTime: 210,
      },
      {
        divisionId: "division-3",
        name: "송미래",
        teamName: "전주과학고등학교",
        robotName: "퓨처스타",
        comment: "부문 3 두 번째 참가자", 
        orderRaw: 2,
        givenTime: 185,
      },
    ];

    mockData.forEach((data) => {
      const participant: Participant = {
        id: `participant-${this.nextId++}`,
        name: data.name,
        teamName: data.teamName,
        robotName: data.robotName,
        comment: data.comment,
        orderRaw: data.orderRaw,
        givenTime: data.givenTime,
        createdAt: new Date(),
      };

      this.participants.set(participant.id, participant);
      
      if (!this.participantsByDivision.has(data.divisionId)) {
        this.participantsByDivision.set(data.divisionId, []);
      }
      this.participantsByDivision.get(data.divisionId)!.push(participant.id);
    });
  }

  /**
   * 특정 부문의 모든 참가자를 조회합니다.
   */
  async getAllParticipants(divisionId: string): Promise<Participant[]> {
    // 실제 API 호출 시뮬레이션을 위한 약간의 지연
    await this.simulateNetworkDelay();

    const participantIds = this.participantsByDivision.get(divisionId) || [];
    const participants = participantIds
      .map(id => this.participants.get(id))
      .filter((participant): participant is Participant => participant !== undefined)
      .sort((a, b) => a.orderRaw - b.orderRaw); // 순서대로 정렬

    return participants;
  }

  /**
   * ID로 특정 참가자를 조회합니다.
   */
  async getParticipantById(participantId: string): Promise<Participant | null> {
    await this.simulateNetworkDelay();

    const participant = this.participants.get(participantId);
    return participant || null;
  }

  /**
   * 새로운 참가자를 생성합니다.
   */
  async createParticipant(
    divisionId: string,
    participantData: Omit<Participant, "id" | "createdAt">,
  ): Promise<Participant> {
    await this.simulateNetworkDelay();

    // 새 참가자 생성
    const newParticipant: Participant = {
      id: `participant-${this.nextId++}`,
      ...participantData,
      createdAt: new Date(),
    };

    // 참가자 저장
    this.participants.set(newParticipant.id, newParticipant);

    // 부문별 참가자 목록에 추가
    if (!this.participantsByDivision.has(divisionId)) {
      this.participantsByDivision.set(divisionId, []);
    }
    this.participantsByDivision.get(divisionId)!.push(newParticipant.id);

    return newParticipant;
  }

  /**
   * 참가자 정보를 업데이트합니다.
   */
  async updateParticipant(
    participantId: string,
    participant: Participant,
  ): Promise<Participant | null> {
    await this.simulateNetworkDelay();

    const existingParticipant = this.participants.get(participantId);
    if (!existingParticipant) {
      return null;
    }

    // 업데이트된 참가자 정보 저장 (생성일시는 유지)
    const updatedParticipant: Participant = {
      ...participant,
      id: participantId,
      createdAt: existingParticipant.createdAt,
    };

    this.participants.set(participantId, updatedParticipant);
    return updatedParticipant;
  }

  /**
   * 참가자를 삭제합니다.
   */
  async deleteParticipant(participantId: string): Promise<void> {
    await this.simulateNetworkDelay();

    const participant = this.participants.get(participantId);
    if (!participant) {
      throw new Error(`참가자를 찾을 수 없습니다: ${participantId}`);
    }

    // 참가자 삭제
    this.participants.delete(participantId);

    // 부문별 참가자 목록에서도 제거
    for (const [divisionId, participantIds] of this.participantsByDivision.entries()) {
      const index = participantIds.indexOf(participantId);
      if (index !== -1) {
        participantIds.splice(index, 1);
        break;
      }
    }
  }

  /**
   * 네트워크 지연을 시뮬레이션합니다.
   */
  private async simulateNetworkDelay(): Promise<void> {
    const delay = Math.random() * 100 + 50; // 50-150ms 랜덤 지연
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Mock 데이터를 리셋합니다. (테스트 용도)
   */
  public resetMockData(): void {
    this.participants.clear();
    this.participantsByDivision.clear();
    this.nextId = 1;
    this.initializeMockData();
  }

  /**
   * 특정 부문의 참가자 수를 반환합니다. (유틸리티 메서드)
   */
  public getParticipantCount(divisionId: string): number {
    const participantIds = this.participantsByDivision.get(divisionId) || [];
    return participantIds.length;
  }

  /**
   * 모든 참가자 수를 반환합니다. (유틸리티 메서드)
   */
  public getTotalParticipantCount(): number {
    return this.participants.size;
  }
}