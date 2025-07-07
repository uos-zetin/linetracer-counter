import { Actor } from "@/core/models";
import { CompetitionService } from "@/core/services";

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
  CompetitionResponseDto,
  CreateCompetitionDto,
  UpdateCompetitionDto,
} from "../dtos/competition.dto";
import { CreateDivisionDto, DivisionResponseDto } from "../dtos/division.dto";

@ApiTags("Competitions")
@Controller("competitions")
export class CompetitionController {
  constructor(
    @Inject("CompetitionService")
    private readonly competitionService: CompetitionService
  ) {}

  @Get("/")
  @ApiResponse({
    status: 200,
    description: "모든 대회 목록 반환",
    type: [CompetitionResponseDto],
  })
  async getCompetitions(@CurrentActor() actor: Actor) {
    return this.competitionService.getCompetitions(actor);
  }

  @Get("/:competitionId")
  @ApiResponse({
    status: 200,
    description: "대회 정보 반환",
    type: CompetitionResponseDto,
  })
  async getCompetition(
    @CurrentActor() actor: Actor,
    @Param("competitionId") competitionId: string
  ): Promise<CompetitionResponseDto> {
    const { competition } =
      await this.competitionService.getCompetitionWithDivisions(
        actor,
        competitionId
      );
    return competition;
  }

  @Post("/")
  @HttpCode(201)
  @ApiActorSecurity()
  @ApiResponse({
    status: 201,
    description: "대회 생성 성공 및 생성된 대회 정보 반환",
    type: CompetitionResponseDto,
  })
  async createCompetition(
    @CurrentActor() actor: Actor,
    @Body() body: CreateCompetitionDto
  ): Promise<CompetitionResponseDto> {
    const { name, description } = body;
    const competition = await this.competitionService.createCompetition(
      actor,
      name,
      description
    );
    return competition;
  }

  @Patch("/:competitionId")
  @ApiActorSecurity()
  @ApiResponse({
    status: 200,
    description: "대회 정보 수정 성공 및 수정된 대회 정보 반환",
    type: UpdateCompetitionDto,
  })
  async updateCompetition(
    @CurrentActor() actor: Actor,
    @Param("competitionId") competitionId: string,
    @Body() body: UpdateCompetitionDto
  ): Promise<CompetitionResponseDto> {
    const updated = await this.competitionService.updateCompetition(
      actor,
      competitionId,
      body
    );
    return updated;
  }

  @Delete("/:competitionId")
  @HttpCode(204)
  @ApiActorSecurity()
  @ApiResponse({
    status: 204,
    description: "대회 삭제 성공",
  })
  async deleteCompetition(
    @CurrentActor() actor: Actor,
    @Param("competitionId") competitionId: string
  ): Promise<void> {
    await this.competitionService.deleteCompetition(actor, competitionId);
  }

  @Get("/:competitionId/divisions")
  @ApiResponse({
    status: 200,
    description: "대회에 속한 모든 부문 목록 반환",
    type: [DivisionResponseDto],
  })
  async getDivisions(
    @CurrentActor() actor: Actor,
    @Param("competitionId") competitionId: string
  ): Promise<DivisionResponseDto[]> {
    const { divisions } =
      await this.competitionService.getCompetitionWithDivisions(
        actor,
        competitionId
      );
    return divisions;
  }

  @Post("/:competitionId/divisions")
  @HttpCode(201)
  @ApiActorSecurity()
  @ApiResponse({
    status: 201,
    description: "대회 부문 생성 성공",
    type: DivisionResponseDto,
  })
  async createDivision(
    @CurrentActor() actor: Actor,
    @Param("competitionId") competitionId: string,
    @Body() body: CreateDivisionDto
  ) {
    const division = await this.competitionService.createDivision(
      actor,
      competitionId,
      body.name,
      body.description
    );
    return division;
  }
}
