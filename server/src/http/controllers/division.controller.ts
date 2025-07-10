import { Actor } from "@/core/models";
import {
  CompetitionService,
  ParticipantService,
  RecordService,
} from "@/core/services";

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
  DivisionResponseDto,
  SetDivisionStatusDto,
  UpdateDivisionDto,
} from "../dtos/division.dto";
import {
  CreateParticipantDto,
  ParticipantResponseDto,
} from "../dtos/participant.dto";
import { RecordResponseDto } from "../dtos/record.dto";

@ApiTags("Divisions")
@Controller("divisions")
export class DivisionController {
  constructor(
    @Inject("CompetitionService")
    private readonly competitionService: CompetitionService,
    @Inject("ParticipantService")
    private readonly participantService: ParticipantService,
    @Inject("RecordService")
    private readonly recordService: RecordService
  ) {}

  @Patch("/:divisionId")
  @ApiActorSecurity()
  @ApiResponse({
    status: 200,
    description: "대회 부문 정보 수정 성공 및 대회 부문 정보 반환",
    type: UpdateDivisionDto,
  })
  async updateDivision(
    @CurrentActor() actor: Actor,
    @Param("divisionId") divisionId: string,
    @Body() body: UpdateDivisionDto
  ): Promise<DivisionResponseDto> {
    const updated = await this.competitionService.updateDivision(
      actor,
      divisionId,
      body
    );
    return updated;
  }

  @Delete("/:divisionId")
  @HttpCode(204)
  @ApiActorSecurity()
  @ApiResponse({
    status: 204,
    description: "대회 부문 삭제 성공",
  })
  async deleteDivision(
    @CurrentActor() actor: Actor,
    @Param("divisionId") divisionId: string
  ): Promise<void> {
    await this.competitionService.deleteDivision(actor, divisionId);
  }

  @Patch("/:divisionId/status")
  @ApiActorSecurity()
  @ApiResponse({
    status: 200,
    description: "대회 부문 상태 수정 성공 및 대회 부문 정보 반환",
    type: DivisionResponseDto,
  })
  async setDivisionStatus(
    @CurrentActor() actor: Actor,
    @Param("divisionId") divisionId: string,
    @Body() body: SetDivisionStatusDto
  ): Promise<DivisionResponseDto> {
    const updated = await this.competitionService.setDivisionStatus(
      actor,
      divisionId,
      body.status
    );
    return updated;
  }

  @Get("/:divisionId/participants")
  @ApiResponse({
    status: 200,
    description: "특정 부문의 모든 참가자 목록 반환",
    type: [ParticipantResponseDto],
  })
  async getParticipants(
    @CurrentActor() actor: Actor,
    @Param("divisionId") divisionId: string
  ): Promise<ParticipantResponseDto[]> {
    return this.participantService.getParticipants(actor, divisionId);
  }

  @Post("/:divisionId/participants")
  @HttpCode(201)
  @ApiActorSecurity()
  @ApiResponse({
    status: 201,
    description: "참가자 생성 성공 및 생성된 참가자 정보 반환",
    type: ParticipantResponseDto,
  })
  async createParticipant(
    @CurrentActor() actor: Actor,
    @Param("divisionId") divisionId: string,
    @Body() body: CreateParticipantDto
  ): Promise<ParticipantResponseDto> {
    const { name, teamName, robotName, comment, orderRaw, givenTime } = body;
    return this.participantService.addParticipant(
      actor,
      divisionId,
      name,
      teamName,
      robotName,
      comment,
      orderRaw,
      givenTime
    );
  }

  @Get("/:divisionId/top-records")
  @ApiResponse({
    status: 200,
    description: "특정 부문의 상위 기록 목록 반환",
    type: [RecordResponseDto],
  })
  async getTopRecordsByDivision(
    @CurrentActor() actor: Actor,
    @Param("divisionId") divisionId: string
  ): Promise<RecordResponseDto[]> {
    return this.recordService.getTopRecordsByDivision(actor, divisionId);
  }
}
