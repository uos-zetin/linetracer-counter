import type { DivisionDto } from "../api/types";
import type { Division } from "../model/types";

export function parseDivisionDto(dto: DivisionDto): Division {
  return {
    id: dto.id,
    competitionId: dto.competitionId,
    name: dto.name,
    description: dto.description,
    createdAt: new Date(dto.createdAt), // ISO 문자열을 Date 객체로 변환
    status: dto.status,
  };
}
