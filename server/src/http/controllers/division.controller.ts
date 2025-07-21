import { Actor } from "@/core/models";
import { CompetitionActorService } from "@/core/services/competition.actor";
import { DivisionProgressActorService } from "@/core/services/division-progress.actor";
import { ParticipantActorService } from "@/core/services/participant.actor";

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
  Query,
} from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";

import {
  ApiActorSecurity,
  CurrentActor,
} from "../decorators/current-actor.decorator";
import {
  DivisionProgressResponseDto,
  DivisionResponseDto,
  SetCurrentRunnerDto,
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
    private readonly competitionService: CompetitionActorService,
    @Inject("ParticipantService")
    private readonly participantService: ParticipantActorService,
    @Inject("DivisionProgressService")
    private readonly divisionProgressService: DivisionProgressActorService
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
    return this.competitionService.getTopRecordsByDivision(actor, divisionId);
  }

  @Get("/:divisionId/progress")
  @ApiResponse({
    status: 200,
    description: "특정 부문의 진행 상태 반환",
    type: DivisionProgressResponseDto,
  })
  async getDivisionProgress(
    @CurrentActor() actor: Actor,
    @Param("divisionId") divisionId: string
  ): Promise<DivisionProgressResponseDto> {
    return this.divisionProgressService.getDivisionProgress(actor, divisionId);
  }

  @Post("/:divisionId/progress/open")
  @ApiActorSecurity()
  @ApiResponse({
    status: 200,
    description: "대회 부문 시작 성공",
  })
  async openDivision(
    @CurrentActor() actor: Actor,
    @Param("divisionId") divisionId: string
  ): Promise<void> {
    await this.divisionProgressService.openDivision(actor, divisionId);
  }

  @Post("/:divisionId/progress/close")
  @ApiActorSecurity()
  @ApiResponse({
    status: 200,
    description: "대회 부문 종료 성공",
  })
  async closeDivision(
    @CurrentActor() actor: Actor,
    @Param("divisionId") divisionId: string
  ): Promise<void> {
    await this.divisionProgressService.closeDivision(actor, divisionId);
  }

  @Post("/:divisionId/progress/reset")
  @ApiActorSecurity()
  @ApiResponse({
    status: 200,
    description: "대회 부문 초기화 성공",
  })
  async resetDivision(
    @CurrentActor() actor: Actor,
    @Param("divisionId") divisionId: string
  ): Promise<void> {
    await this.divisionProgressService.resetDivision(actor, divisionId);
  }

  @Patch("/:divisionId/progress/runner")
  @ApiActorSecurity()
  @ApiResponse({
    status: 200,
    description: "현재 경연자 설정 성공",
  })
  async setCurrentRunner(
    @CurrentActor() actor: Actor,
    @Param("divisionId") divisionId: string,
    @Body() body: SetCurrentRunnerDto
  ): Promise<void> {
    await this.divisionProgressService.setRunner(
      actor,
      divisionId,
      body.participantId
    );
  }

  @Post("/:divisionId/progress/runner/postpone")
  @ApiActorSecurity()
  @ApiResponse({
    status: 200,
    description: "현재 경연자 연기 성공",
  })
  async postponeCurrentRunner(
    @CurrentActor() actor: Actor,
    @Param("divisionId") divisionId: string
  ): Promise<void> {
    await this.divisionProgressService.postponeRunner(actor, divisionId);
  }

  @Get("/:divisionId/progress/order")
  @ApiResponse({
    status: 200,
    description: "참가자 순번 목록 반환",
    type: [String],
  })
  async getParticipantOrder(
    @CurrentActor() actor: Actor,
    @Param("divisionId") divisionId: string
  ): Promise<string[]> {
    return this.divisionProgressService.getParticipantOrder(actor, divisionId);
  }

  @Patch("/:divisionId/progress/order")
  @ApiActorSecurity()
  @ApiResponse({
    status: 200,
    description: "참가자 순번 변경 성공",
  })
  async setParticipantOrder(
    @CurrentActor() actor: Actor,
    @Param("divisionId") divisionId: string,
    @Query("participantId") participantId: string,
    @Query("order") order: number
  ): Promise<void> {
    await this.divisionProgressService.changeParticipantOrder(
      actor,
      divisionId,
      participantId,
      order
    );
  }
}
