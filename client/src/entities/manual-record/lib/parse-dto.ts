import type { ManualRecordDto } from "../api/types";
import type { ManualRecord } from "../model/types";

export function parseManualRecordDto(dto: ManualRecordDto): ManualRecord {
  return {
    id: dto.id,
    participantId: dto.participantId,
    value: dto.value,
    recorderName: dto.recorderName,
    createdAt: new Date(dto.createdAt),
  };
}
