import type { ManualRecordCreateDto, ManualRecordDto } from "../api/types";
import type { ManualRecord, ManualRecordForm } from "../model/types";

export function parseManualRecordDto(dto: ManualRecordDto): ManualRecord {
  return {
    id: dto.id,
    participantId: dto.participantId,
    value: dto.value,
    recorderName: dto.recorderName,
    createdAt: new Date(dto.createdAt),
  };
}

export function parseManualRecordForm(form: ManualRecordForm): ManualRecordCreateDto {
  return {
    value: form.value,
    recorderName: form.recorderName,
  };
}
