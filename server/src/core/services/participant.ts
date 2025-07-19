import { Unsubscriber } from "@/core/interfaces";
import { Actor, Participant } from "@/core/models";
import { ParticipantRepository } from "@/core/repositories";
import { requireAnyRole } from "@/core/utils/auth";

import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";

export class ParticipantService {
  private readonly participantRepo: ParticipantRepository;

  constructor(di: { participantRepository: ParticipantRepository }) {
    this.participantRepo = di.participantRepository;
  }

  /**
   * 참가자를 특정 대회 부문에 추가할 수 있다.
   */
  async addParticipant(
    actor: Actor,
    divisionId: string,
    name: string,
    teamName: string,
    robotName: string,
    comment: string,
    orderRaw: number,
    givenTime: number
  ): Promise<Participant> {
    requireAnyRole(actor, "administrator");

    const participant: Participant = {
      id: uuidv4(),
      divisionId,
      name,
      teamName,
      robotName,
      comment,
      orderRaw,
      givenTime,
      createdAt: new Date(),
    };
    return this.participantRepo.create(participant);
  }

  /**
   * 특정 부문의 모든 참가자를 조회할 수 있다.
   */
  async getParticipants(
    actor: Actor,
    divisionId: string
  ): Promise<Participant[]> {
    return this.participantRepo.getByDivisionId(divisionId);
  }

  /**
   * 특정 참가자의 이름, 팀명, 로봇명, 하고 싶은 말, 경연 순번, 주어진 시간을 수정할 수 있다.
   */
  async updateParticipant(
    actor: Actor,
    participantId: string,
    data: {
      name?: string;
      teamName?: string;
      robotName?: string;
      comment?: string;
      orderRaw?: number;
      givenTime?: number;
    }
  ): Promise<Participant> {
    requireAnyRole(actor, "administrator");

    const participant = await this.participantRepo.getById(participantId);

    // undefined 값을 필터링하여 실제로 전달된 값만 업데이트
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );

    const updated = {
      ...participant,
      ...filteredData,
    };
    const result = await this.participantRepo.update(updated);
    this.emitParticipantUpdated(result);
    return result;
  }

  /**
   * 특정 참가자를 삭제할 수 있다.
   */
  async deleteParticipant(actor: Actor, participantId: string): Promise<void> {
    requireAnyRole(actor, "administrator");

    await this.participantRepo.delete(participantId);
  }

  // ------------------------------
  // 이벤트 핸들링 관련 로직
  // ------------------------------
  private eventEmitter = new EventEmitter();

  private getParticipantUpdatedEventName = (id: string) =>
    `participant:update:${id}`;

  private emitParticipantUpdated(p: Participant) {
    this.eventEmitter.emit(this.getParticipantUpdatedEventName(p.id), p);
  }

  /**
   * 특정 참가자의 변경 이벤트를 구독할 수 있다.
   */
  subscribeParticipantUpdated(
    participantId: string,
    callback: (participant: Participant) => Promise<void>
  ): Unsubscriber {
    const eventName = this.getParticipantUpdatedEventName(participantId);
    const safeCb = async (p: Participant) => {
      try {
        await callback(p);
      } catch (err) {
        console.error(
          `ParticipantUpdated listener error for ${participantId}:`,
          err
        );
      }
    };
    this.eventEmitter.on(eventName, safeCb);
    return () => {
      this.eventEmitter.off(eventName, safeCb);
    };
  }
}
