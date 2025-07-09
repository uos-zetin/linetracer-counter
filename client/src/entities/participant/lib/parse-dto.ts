import type { ParticipantDto } from "../api/types";
import type { Participant } from "../model/types";

export function parseParticipantDto(dto: ParticipantDto): Participant {
  return {
    id: dto.id,
    name: dto.name,
    teamName: dto.teamName,
    robotName: dto.robotName,
    comment: dto.comment,
    orderRaw: dto.orderRaw,
    givenTime: dto.givenTime,
    createdAt: new Date(dto.createdAt), // ISO 문자열을 Date 객체로 변환
  };
}
