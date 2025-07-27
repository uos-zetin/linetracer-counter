import type { TimerLogDto } from "../api/types";
import type { TimerLog } from "../model/types";

export function parseTimerLogDto(dto: TimerLogDto): TimerLog {
  let newType: "start" | "stop" | "add" | "sub";
  let newValue: number;

  if (dto.type === "start" || dto.type === "stop") {
    newType = dto.type;
    newValue = dto.value;
  } else if (dto.value > 0) {
    newType = "add";
    newValue = dto.value;
  } else {
    newType = "sub";
    newValue = -dto.value;
  }

  return {
    id: dto.id,
    participantId: dto.participantId,
    value: newValue,
    type: newType,
    createdAt: new Date(dto.createdAt),
  };
}
