import { Actor } from "@/core/models";
import { ParticipantService, RecordService } from "@/core/services";

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";

import {
  ApiActorSecurity,
  CurrentActor,
} from "../decorators/current-actor.decorator";
import {
  ParticipantResponseDto,
  UpdateParticipantDto,
} from "../dtos/participant.dto";
import { AddRecordDto, RecordResponseDto } from "../dtos/record.dto";

@ApiTags("Participants")
@Controller("participants")
export class ParticipantController {
  constructor(
    @Inject("ParticipantService")
    private readonly participantService: ParticipantService,
    @Inject("RecordService")
    private readonly recordService: RecordService
  ) {}

  @Patch("/:participantId")
  @ApiActorSecurity()
  @ApiResponse({
    status: 200,
    description: "참가자 정보 수정 성공 및 수정된 참가자 정보 반환",
    type: ParticipantResponseDto,
  })
  async updateParticipant(
    @CurrentActor() actor: Actor,
    @Param("participantId") participantId: string,
    @Body() body: UpdateParticipantDto
  ): Promise<ParticipantResponseDto> {
    return this.participantService.updateParticipant(
      actor,
      participantId,
      body
    );
  }

  @Delete("/:participantId")
  @HttpCode(204)
  @ApiActorSecurity()
  @ApiResponse({
    status: 204,
    description: "참가자 삭제 성공",
  })
  async deleteParticipant(
    @CurrentActor() actor: Actor,
    @Param("participantId") participantId: string
  ): Promise<void> {
    await this.participantService.deleteParticipant(actor, participantId);
  }

  @Get("/:participantId/records")
  @ApiResponse({
    status: 200,
    description: "특정 참가자의 모든 기록 목록 반환",
    type: [RecordResponseDto],
  })
  async getRecords(
    @CurrentActor() actor: Actor,
    @Param("participantId") participantId: string
  ): Promise<RecordResponseDto[]> {
    return this.recordService.getRecords(actor, participantId);
  }

  @Post("/:participantId/records")
  @ApiActorSecurity()
  @ApiResponse({
    status: 201,
    description: "기록 추가 성공 및 추가된 기록 정보 반환",
    type: RecordResponseDto,
  })
  async addRecord(
    @CurrentActor() actor: Actor,
    @Param("participantId") participantId: string,
    @Body() body: AddRecordDto
  ): Promise<RecordResponseDto> {
    return this.recordService.addRecord(
      actor,
      participantId,
      body.value,
      body.source,
      body.note
    );
  }
}
