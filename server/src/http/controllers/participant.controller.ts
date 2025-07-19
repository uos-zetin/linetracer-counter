import { Actor, ManualRecord, TimerLog } from "@/core/models";
import { ManualRecordService } from "@/core/services/manual-record";
import { ParticipantActorService } from "@/core/services/participant.actor";
import { TimerLogService } from "@/core/services/timer-log";

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
  AddManualRecordDto,
  ManualRecordResponseDto,
} from "../dtos/manual-record.dto";
import {
  ParticipantResponseDto,
  UpdateParticipantDto,
} from "../dtos/participant.dto";
import { AddRecordDto, RecordResponseDto } from "../dtos/record.dto";
import { AdjustTimerDto, TimerLogResponseDto } from "../dtos/timer-log.dto";

@ApiTags("Participants")
@Controller("participants")
export class ParticipantController {
  constructor(
    @Inject("ParticipantService")
    private readonly participantService: ParticipantActorService,
    @Inject("TimerLogService")
    private readonly timerLogService: TimerLogService,
    @Inject("ManualRecordService")
    private readonly manualRecordService: ManualRecordService
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
    return this.participantService.getRecords(actor, participantId);
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
    return this.participantService.addRecord(
      actor,
      participantId,
      body.value,
      body.source,
      body.note
    );
  }

  @Get("/:participantId/manual-records")
  @ApiResponse({
    status: 200,
    description: "특정 참가자의 모든 수동 계수 기록 목록 반환",
    type: [ManualRecordResponseDto],
  })
  async getManualRecords(
    @CurrentActor() actor: Actor,
    @Param("participantId") participantId: string
  ): Promise<ManualRecord[]> {
    return this.manualRecordService.getManualRecords(actor, participantId);
  }

  @Post("/:participantId/manual-records")
  @HttpCode(201)
  @ApiActorSecurity()
  @ApiResponse({
    status: 201,
    description: "수동 계수 기록 추가 성공 및 추가된 기록 정보 반환",
    type: ManualRecordResponseDto,
  })
  async addManualRecord(
    @CurrentActor() actor: Actor,
    @Param("participantId") participantId: string,
    @Body() body: AddManualRecordDto
  ): Promise<ManualRecord> {
    return this.manualRecordService.addManualRecord(
      actor,
      participantId,
      body.value,
      body.recorderName
    );
  }

  @Post("/:participantId/timer/start")
  @HttpCode(201)
  @ApiActorSecurity()
  @ApiResponse({
    status: 201,
    description: "타이머 시작 성공 및 생성된 타이머 로그 반환",
    type: TimerLogResponseDto,
  })
  async startTimer(
    @CurrentActor() actor: Actor,
    @Param("participantId") participantId: string
  ): Promise<TimerLog> {
    return this.timerLogService.startTimer(actor, participantId);
  }

  @Post("/:participantId/timer/stop")
  @HttpCode(201)
  @ApiActorSecurity()
  @ApiResponse({
    status: 201,
    description: "타이머 중지 성공 및 생성된 타이머 로그 반환",
    type: TimerLogResponseDto,
  })
  async stopTimer(
    @CurrentActor() actor: Actor,
    @Param("participantId") participantId: string
  ): Promise<TimerLog> {
    return this.timerLogService.stopTimer(actor, participantId);
  }

  @Post("/:participantId/timer/adjust")
  @HttpCode(201)
  @ApiActorSecurity()
  @ApiResponse({
    status: 201,
    description: "타이머 조정 성공 및 생성된 타이머 로그 반환",
    type: TimerLogResponseDto,
  })
  async adjustTimer(
    @CurrentActor() actor: Actor,
    @Param("participantId") participantId: string,
    @Body() body: AdjustTimerDto
  ): Promise<TimerLog> {
    return this.timerLogService.adjustTimer(
      actor,
      participantId,
      body.adjustmentMs
    );
  }

  @Get("/:participantId/timer/logs")
  @ApiResponse({
    status: 200,
    description: "특정 참가자의 모든 타이머 로그 목록 반환",
    type: [TimerLogResponseDto],
  })
  async getTimerLogs(
    @CurrentActor() actor: Actor,
    @Param("participantId") participantId: string
  ): Promise<TimerLog[]> {
    return this.timerLogService.getTimerLogs(actor, participantId);
  }
}
