import type { RecordDto } from "../api/types";
import type { Record } from "../model/types";

export function parseRecordDto(dto: RecordDto): Record {
  return {
    id: dto.id,
    participantId: dto.participantId,
    value: dto.value,
    source: dto.source,
    status: dto.status,
    note: dto.note,
    createdAt: new Date(dto.createdAt),
  };
}
