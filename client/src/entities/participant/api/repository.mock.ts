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
      // division-001 (초등부) 참가자들 - 12명
      {
        divisionId: "division-001",
        name: "김민수",
        teamName: "서울초등학교",
        robotName: "스피드마스터",
        comment: "초등부 첫 번째 참가자",
        orderRaw: 1,
      },
      {
        divisionId: "division-001",
        name: "이지은",
        teamName: "부산초등학교",
        robotName: "라이트닝볼트",
        comment: "초등부 두 번째 참가자",
        orderRaw: 2,
      },
      {
        divisionId: "division-001",
        name: "박준호",
        teamName: "대전초등학교",
        robotName: "썬더봇",
        comment: "초등부 세 번째 참가자",
        orderRaw: 3,
      },
      {
        divisionId: "division-001",
        name: "최수현",
        teamName: "인천초등학교",
        robotName: "파이어워크",
        comment: "초등부 네 번째 참가자",
        orderRaw: 4,
      },
      {
        divisionId: "division-001",
        name: "정우진",
        teamName: "광주초등학교",
        robotName: "아이언이글",
        comment: "초등부 다섯 번째 참가자",
        orderRaw: 5,
      },
      {
        divisionId: "division-001",
        name: "한소희",
        teamName: "울산초등학교",
        robotName: "골든드래곤",
        comment: "초등부 여섯 번째 참가자",
        orderRaw: 6,
      },
      {
        divisionId: "division-001",
        name: "임태현",
        teamName: "청주초등학교",
        robotName: "사이버나이트",
        comment: "초등부 일곱 번째 참가자",
        orderRaw: 7,
      },
      {
        divisionId: "division-001",
        name: "송미래",
        teamName: "전주초등학교",
        robotName: "퓨처스타",
        comment: "초등부 여덟 번째 참가자",
        orderRaw: 8,
      },
      {
        divisionId: "division-001",
        name: "오세진",
        teamName: "수원초등학교",
        robotName: "로켓부스터",
        comment: "초등부 아홉 번째 참가자",
        orderRaw: 9,
      },
      {
        divisionId: "division-001",
        name: "윤하영",
        teamName: "안양초등학교",
        robotName: "스마트위너",
        comment: "초등부 열 번째 참가자",
        orderRaw: 10,
      },
      {
        divisionId: "division-001",
        name: "강민준",
        teamName: "성남초등학교",
        robotName: "파워레인저",
        comment: "초등부 열한 번째 참가자",
        orderRaw: 11,
      },
      {
        divisionId: "division-001",
        name: "조예린",
        teamName: "용인초등학교",
        robotName: "메가챔피언",
        comment: "초등부 열두 번째 참가자",
        orderRaw: 12,
      },
      // division-002 (중등부) 참가자들 - 8명
      {
        divisionId: "division-002",
        name: "신동우",
        teamName: "서울중학교",
        robotName: "테크노마스터",
        comment: "중등부 첫 번째 참가자",
        orderRaw: 1,
      },
      {
        divisionId: "division-002",
        name: "김서연",
        teamName: "부산중학교",
        robotName: "사이언스킹",
        comment: "중등부 두 번째 참가자",
        orderRaw: 2,
      },
      {
        divisionId: "division-002",
        name: "박지호",
        teamName: "대구중학교",
        robotName: "인텔리봇",
        comment: "중등부 세 번째 참가자",
        orderRaw: 3,
      },
      {
        divisionId: "division-002",
        name: "이민아",
        teamName: "인천중학교",
        robotName: "코딩히어로",
        comment: "중등부 네 번째 참가자",
        orderRaw: 4,
      },
      {
        divisionId: "division-002",
        name: "최현수",
        teamName: "광주중학교",
        robotName: "프로그래머",
        comment: "중등부 다섯 번째 참가자",
        orderRaw: 5,
      },
      {
        divisionId: "division-002",
        name: "정은비",
        teamName: "대전중학교",
        robotName: "알고리즘마스터",
        comment: "중등부 여섯 번째 참가자",
        orderRaw: 6,
      },
      {
        divisionId: "division-002",
        name: "한준영",
        teamName: "울산중학교",
        robotName: "디지털워리어",
        comment: "중등부 일곱 번째 참가자",
        orderRaw: 7,
      },
      {
        divisionId: "division-002",
        name: "오수빈",
        teamName: "창원중학교",
        robotName: "스마트챌린저",
        comment: "중등부 여덟 번째 참가자",
        orderRaw: 8,
      },
      // division-003 (고등부) 참가자들 - 15명
      {
        divisionId: "division-003",
        name: "김태영",
        teamName: "서울과학고",
        robotName: "엔지니어링킹",
        comment: "고등부 첫 번째 참가자",
        orderRaw: 1,
      },
      {
        divisionId: "division-003",
        name: "이하늘",
        teamName: "부산과학고",
        robotName: "테크놀로지스타",
        comment: "고등부 두 번째 참가자",
        orderRaw: 2,
      },
      {
        divisionId: "division-003",
        name: "박도현",
        teamName: "대구과학고",
        robotName: "이노베이터",
        comment: "고등부 세 번째 참가자",
        orderRaw: 3,
      },
      {
        divisionId: "division-003",
        name: "최윤서",
        teamName: "인천과학고",
        robotName: "퓨처메이커",
        comment: "고등부 네 번째 참가자",
        orderRaw: 4,
      },
      {
        divisionId: "division-003",
        name: "정재훈",
        teamName: "광주과학고",
        robotName: "크리에이터봇",
        comment: "고등부 다섯 번째 참가자",
        orderRaw: 5,
      },
      {
        divisionId: "division-003",
        name: "한유진",
        teamName: "대전과학고",
        robotName: "지니어스로봇",
        comment: "고등부 여섯 번째 참가자",
        orderRaw: 6,
      },
      {
        divisionId: "division-003",
        name: "임채원",
        teamName: "울산과학고",
        robotName: "마스터마인드",
        comment: "고등부 일곱 번째 참가자",
        orderRaw: 7,
      },
      {
        divisionId: "division-003",
        name: "송지우",
        teamName: "경남과학고",
        robotName: "어드밴스봇",
        comment: "고등부 여덟 번째 참가자",
        orderRaw: 8,
      },
      {
        divisionId: "division-003",
        name: "오시현",
        teamName: "전북과학고",
        robotName: "엑셀런트로봇",
        comment: "고등부 아홉 번째 참가자",
        orderRaw: 9,
      },
      {
        divisionId: "division-003",
        name: "윤수민",
        teamName: "충남과학고",
        robotName: "챔피언메이커",
        comment: "고등부 열 번째 참가자",
        orderRaw: 10,
      },
      {
        divisionId: "division-003",
        name: "강민혁",
        teamName: "충북과학고",
        robotName: "프리미엄봇",
        comment: "고등부 열한 번째 참가자",
        orderRaw: 11,
      },
      {
        divisionId: "division-003",
        name: "조연우",
        teamName: "강원과학고",
        robotName: "슈퍼로보틱스",
        comment: "고등부 열두 번째 참가자",
        orderRaw: 12,
      },
      {
        divisionId: "division-003",
        name: "신예은",
        teamName: "제주과학고",
        robotName: "울트라봇",
        comment: "고등부 열세 번째 참가자",
        orderRaw: 13,
      },
      {
        divisionId: "division-003",
        name: "김도윤",
        teamName: "경기과학고",
        robotName: "메가트로닉스",
        comment: "고등부 열네 번째 참가자",
        orderRaw: 14,
      },
      {
        divisionId: "division-003",
        name: "이서진",
        teamName: "세종과학고",
        robotName: "하이퍼로봇",
        comment: "고등부 열다섯 번째 참가자",
        orderRaw: 15,
      },
    ];

    mockData.forEach((data) => {
      const participant: Participant = {
        id: `participant-${String(this.nextId++).padStart(3, "0")}`,
        divisionId: data.divisionId,
        name: data.name,
        teamName: data.teamName,
        robotName: data.robotName,
        comment: data.comment,
        orderRaw: data.orderRaw,
        createdAt: new Date(),
      };

      this.participants.set(participant.id, participant);

      if (!this.participantsByDivision.has(data.divisionId)) {
        this.participantsByDivision.set(data.divisionId, []);
      }
      this.participantsByDivision.get(data.divisionId)!.push(participant.id);
    });

    this.nextId = 36; // 다음 ID는 36부터 시작 (35명 초기 데이터)
  }

  /**
   * 특정 부문의 모든 참가자를 조회합니다.
   */
  async getAllParticipants(divisionId: string): Promise<Participant[]> {
    // 실제 API 호출 시뮬레이션을 위한 약간의 지연
    await this.simulateNetworkDelay();

    const participantIds = this.participantsByDivision.get(divisionId) || [];
    const participants = participantIds
      .map((id) => this.participants.get(id))
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
    participantData: Omit<Participant, "id" | "divisionId" | "createdAt">,
  ): Promise<Participant> {
    await this.simulateNetworkDelay();

    // 새 참가자 생성
    const newParticipant: Participant = {
      id: `participant-${String(this.nextId++).padStart(3, "0")}`,
      divisionId,
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
  async updateParticipant(participantId: string, participant: Participant): Promise<Participant | null> {
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
    for (const [, participantIds] of this.participantsByDivision.entries()) {
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
    return new Promise((resolve) => setTimeout(resolve, delay));
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
