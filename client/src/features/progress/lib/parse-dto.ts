import { parseCompetitionDto } from "@/entities/competition";
import { parseDivisionDto } from "@/entities/division";
import { parseManualRecordDto } from "@/entities/manual-record";
import { parseParticipantDto } from "@/entities/participant";
import { parseRecordDto } from "@/entities/record";
import { parseTimerLogDto } from "@/entities/timer";
import type { ProgressDto } from "../api/types";
import type { ProgressState } from "../model/types";

export const parseProgressDto = (dto: ProgressDto): ProgressState => {
  return {
    id: dto.id,
    competition: dto.competition ? parseCompetitionDto(dto.competition) : null,
    division: dto.division ? parseDivisionDto(dto.division) : null,
    runner: dto.runner
      ? {
          participant: parseParticipantDto(dto.runner.participant),
          timerLogs: dto.runner.timerLogs.map(parseTimerLogDto),
          records: dto.runner.records.map(parseRecordDto),
          manualRecords: dto.runner.manualRecords.map(parseManualRecordDto),
        }
      : null,
    nextRunners: dto.nextRunners.map(parseParticipantDto),
    topRecords: dto.topRecords.map(parseRecordDto),
  };
};
