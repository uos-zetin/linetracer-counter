import type { CounterDto } from "../api/types";
import type { CounterState } from "../model/types";

export function parseCounterDto(dto: CounterDto): CounterState {
  return {
    id: dto.id,
    name: dto.name,
    startedAt: dto.startedAt ? dto.startedAt : null,
    stoppedAt: dto.stoppedAt ? dto.stoppedAt : null,
    divisionId: dto.divisionId ? dto.divisionId : null,
  };
}
