import { Actor } from "@/core/models";
import { RecordService } from "@/core/services";

import { Body, Controller, Get, Inject, Param, Patch } from "@nestjs/common";
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
    @Inject("RecordService")
    private readonly recordService: RecordService
  ) {}

  @Patch("/:recordId/note")
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
    return this.recordService.setRecordNote(actor, recordId, body.note);
  }

  @Patch("/:recordId/status")
  @ApiActorSecurity()
  @ApiResponse({
    status: 200,
    description: "기록 상태 변경 성공 및 변경된 기록 정보 반환",
    type: RecordResponseDto,
  })
  async setRecordStatus(
    @CurrentActor() actor: Actor,
    @Param("recordId") recordId: string,
    @Body() body: SetRecordStatusDto
  ): Promise<RecordResponseDto> {
    return this.recordService.setRecordStatus(actor, recordId, body.status);
  }

  @Get("/divisions/:divisionId/top")
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
