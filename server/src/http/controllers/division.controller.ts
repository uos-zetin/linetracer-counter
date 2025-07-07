import { CompetitionService } from "@/core/services";
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
  DivisionResponseDto,
  SetDivisionStatusDto,
  UpdateDivisionDto,
} from "../dtos/division.dto";
import { Actor } from "@/core/models";

@ApiTags("Divisions")
@Controller("divisions")
export class DivisionController {
  constructor(
    @Inject("CompetitionService")
    private readonly competitionService: CompetitionService
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
}
