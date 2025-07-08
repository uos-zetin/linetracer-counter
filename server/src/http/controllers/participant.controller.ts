import { Actor } from "@/core/models";
import { ParticipantService } from "@/core/services";

import {
  Body,
  Controller,
  Delete,
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
  ParticipantResponseDto,
  UpdateParticipantDto,
} from "../dtos/participant.dto";

@ApiTags("Participants")
@Controller("participants")
export class ParticipantController {
  constructor(
    @Inject("ParticipantService")
    private readonly participantService: ParticipantService
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
}
