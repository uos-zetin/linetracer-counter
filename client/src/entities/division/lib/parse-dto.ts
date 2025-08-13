import type { DivisionCreateDto, DivisionDto, DivisionStatusDto } from "../api/types";
import type { Division, DivisionForm, DivisionStatus } from "../model/types";

export function parseDivisionStatusDto(status: DivisionStatusDto): DivisionStatus {
  switch (status) {
    case "ready":
      return "ready";
    case "ongoing":
      return "ongoing";
    case "closed":
      return "closed";
    default:
      throw new Error(`Unknown division status: ${status}`);
  }
}

export function parseDivisionStatus(status: DivisionStatus): DivisionStatusDto {
  switch (status) {
    case "ready":
      return "ready";
    case "ongoing":
      return "ongoing";
    case "closed":
      return "closed";
    default:
      throw new Error(`Unknown division status: ${status}`);
  }
}

export function parseDivisionDto(dto: DivisionDto): Division {
  return {
    id: dto.id,
    competitionId: dto.competitionId,
    name: dto.name,
    description: dto.description,
    createdAt: new Date(dto.createdAt), // ISO 문자열을 Date 객체로 변환
    status: parseDivisionStatusDto(dto.status),
    timeLimit: dto.timeLimit,
  };
}

export function parseDivisionForm(form: DivisionForm): DivisionCreateDto {
  return {
    name: form.name,
    description: form.description,
    timeLimit: form.timeLimit,
  };
}
