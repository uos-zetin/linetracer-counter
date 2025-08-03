import type { RecordDto, RecordSourceDto, RecordStatusDto } from "../api/types";
import type { Record, RecordSource, RecordStatus } from "../model/types";

export function parseRecordSourceDto(source: RecordSourceDto): RecordSource {
  switch (source) {
    case "stopwatch":
      return "stopwatch";
    case "manual":
      return "manual";
    case "other":
      return "other";
    default:
      throw new Error(`Unknown record source: ${source}`);
  }
}

export function parseRecordStatusDto(status: RecordStatusDto): RecordStatus {
  switch (status) {
    case "pending":
      return "pending";
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    default:
      throw new Error(`Unknown record status: ${status}`);
  }
}

export function parseRecordDto(dto: RecordDto): Record {
  return {
    id: dto.id,
    participantId: dto.participantId,
    value: dto.value,
    source: parseRecordSourceDto(dto.source),
    status: parseRecordStatusDto(dto.status),
    note: dto.note,
    createdAt: new Date(dto.createdAt),
  };
}
