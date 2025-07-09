import type { StopwatchDto } from "../api/types";
import type { StopwatchState } from "../model/types";

export function parseStopwatchDto(dto: StopwatchDto): StopwatchState {
  return {
    startedAt: dto.startedAt ? dto.startedAt : null,
    stoppedAt: dto.stoppedAt ? dto.stoppedAt : null,
  };
}
