import { Actor } from "@/core/models";
import { ParticipantActorService } from "@/core/services/participant.actor";

import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Param,
  Patch,
} from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";

import {
  ApiActorSecurity,
  CurrentActor,
} from "../decorators/current-actor.decorator";
import {
  RecordResponseDto,
  SetRecordNoteDto,
  SetRecordStatusDto,
} from "../dtos/record.dto";

@ApiTags("Records")
@Controller("records")
export class RecordController {
  constructor(
    @Inject("ParticipantService")
    private readonly participantService: ParticipantActorService
  ) {}

  @Patch("/:recordId/note")
  @HttpCode(200)
  @ApiActorSecurity()
  @ApiResponse({
    status: 200,
    description: "기록 비고 수정 성공 및 수정된 기록 정보 반환",
    type: RecordResponseDto,
  })
  async setRecordNote(
    @CurrentActor() actor: Actor,
    @Param("recordId") recordId: string,
    @Body() body: SetRecordNoteDto
  ): Promise<RecordResponseDto> {
    return this.participantService.setRecordNote(actor, recordId, body.note);
  }

  @Patch("/:recordId/status")
  @HttpCode(200)
  @ApiActorSecurity()
  @ApiResponse({
    status: 200,
    description: "기록 상태 변경 성공 및 수정된 기록 정보 반환",
    type: RecordResponseDto,
  })
  async setRecordStatus(
    @CurrentActor() actor: Actor,
    @Param("recordId") recordId: string,
    @Body() body: SetRecordStatusDto
  ): Promise<RecordResponseDto> {
    return this.participantService.setRecordStatus(
      actor,
      recordId,
      body.status
    );
  }
}
