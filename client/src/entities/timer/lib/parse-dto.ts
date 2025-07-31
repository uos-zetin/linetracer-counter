import type { TimerLogDto, TimerLogTypeDto } from "../api/types";
import type { TimerLog, TimerLogType } from "../model/types";

export function parseTimerLogTypeDto(
  type: TimerLogTypeDto,
  value: number,
): { timerLogType: TimerLogType; value: number } {
  if (type === "start" || type === "stop") {
    return { timerLogType: type, value };
  } else if (value > 0) {
    return { timerLogType: "add", value };
  } else {
    return { timerLogType: "sub", value: -value };
  }
}

export function parseTimerLogDto(dto: TimerLogDto): TimerLog {
  const { timerLogType: newType, value: newValue } = parseTimerLogTypeDto(dto.type as TimerLogTypeDto, dto.value);

  return {
    id: dto.id,
    participantId: dto.participantId,
    value: newValue,
    type: newType,
    createdAt: new Date(dto.createdAt),
  };
}
