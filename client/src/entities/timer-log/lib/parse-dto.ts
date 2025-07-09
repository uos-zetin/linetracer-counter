import type { TimerLogDto } from "../api/types";
import type { TimerLog } from "../model/types";

export function parseTimerLogDto(dto: TimerLogDto): TimerLog {
  return {
    id: dto.id,
    participantId: dto.participantId,
    value: dto.value,
    type: dto.type,
    createdAt: new Date(dto.createdAt),
  };
}
