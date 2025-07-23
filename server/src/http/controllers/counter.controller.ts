import { Actor } from "@/core/models";
import { CounterActorService } from "@/core/services/counter.actor";
import {
  CounterDeviceActorManager,
  FrontBackIrCounterDeviceDataItem,
} from "@/infrastructure/counters/counter-device-manager.actor";

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
  Put,
} from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";

import {
  ApiActorSecurity,
  CurrentActor,
} from "../decorators/current-actor.decorator";
import {
  CounterDivisionBindingDto,
  CounterResponseDto,
  FrontBackIrCounterDeviceDataDto,
  RegisterFrontBackIrCounterDeviceDto,
} from "../dtos/counter.dto";

@ApiTags("Counters")
@Controller("counters")
export class CounterController {
  constructor(
    @Inject("CounterService")
    private readonly counterService: CounterActorService,
    @Inject("CounterDeviceManager")
    private readonly counterDeviceManager: CounterDeviceActorManager
  ) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: "모든 카운터 목록 반환",
    type: [CounterResponseDto],
  })
  async getCounters(
    @CurrentActor() actor: Actor
  ): Promise<CounterResponseDto[]> {
    return this.counterService.getCounters(actor);
  }

  @Get("/:deviceId")
  @ApiResponse({
    status: 200,
    description: "특정 카운터 정보 반환",
    type: CounterResponseDto,
  })
  async getCounter(
    @CurrentActor() actor: Actor,
    @Param("deviceId") deviceId: string
  ): Promise<CounterResponseDto> {
    return this.counterService.getCounter(actor, deviceId);
  }

  @Patch("/:deviceId/division")
  @HttpCode(204)
  @ApiActorSecurity()
  @ApiResponse({
    status: 204,
    description: "카운터를 특정 부문에 연결하거나 해제함",
  })
  async linkCounterToDivision(
    @CurrentActor() actor: Actor,
    @Param("deviceId") deviceId: string,
    @Body() body: CounterDivisionBindingDto
  ): Promise<void> {
    await this.counterService.linkCounterToDivision(
      actor,
      deviceId,
      body.divisionId
    );
  }

  @Delete("/:deviceId/division")
  @HttpCode(204)
  @ApiActorSecurity()
  @ApiResponse({
    status: 204,
    description: "카운터를 부문에서 연결 해제 성공",
  })
  async unlinkCounterFromDivision(
    @CurrentActor() actor: Actor,
    @Param("deviceId") deviceId: string
  ): Promise<void> {
    await this.counterService.linkCounterToDivision(actor, deviceId, null);
  }

  @Post("/:deviceId/reset")
  @HttpCode(204)
  @ApiActorSecurity()
  @ApiResponse({
    status: 204,
    description: "카운터 리셋 성공",
  })
  async resetCounter(
    @CurrentActor() actor: Actor,
    @Param("deviceId") deviceId: string
  ): Promise<void> {
    await this.counterService.resetCounter(actor, deviceId);
  }

  @Delete("/:deviceId")
  @HttpCode(204)
  @ApiActorSecurity()
  @ApiResponse({
    status: 204,
    description: "카운터 등록 해제 성공",
  })
  async unregisterCounter(
    @CurrentActor() actor: Actor,
    @Param("deviceId") deviceId: string
  ): Promise<void> {
    await this.counterService.unregisterCounter(actor, deviceId);
  }

  @Post("/front-back-ir/register")
  @HttpCode(201)
  @ApiActorSecurity()
  @ApiResponse({
    status: 201,
    description: "Front-Back IR 카운터 등록 성공",
  })
  async registerFrontBackIrCounter(
    @CurrentActor() actor: Actor,
    @Body() body: RegisterFrontBackIrCounterDeviceDto
  ): Promise<void> {
    await this.counterDeviceManager.registerFrontBackIrCounter(
      actor,
      body.deviceId,
      body.name,
      body.startThreshold,
      body.endThreshold,
      body.endDebouncingTime
    );
  }

  @Put("/front-back-ir/:deviceId/data")
  @HttpCode(204)
  @ApiActorSecurity()
  @ApiResponse({
    status: 204,
    description: "Front-Back IR 카운터 데이터 전송 성공",
  })
  @ApiBody({
    type: FrontBackIrCounterDeviceDataDto,
  })
  async pushFrontBackIrCounterData(
    @CurrentActor() actor: Actor,
    @Param("deviceId") deviceId: string,
    @Body() body: FrontBackIrCounterDeviceDataDto
  ): Promise<void> {
    const data = body.data.map<FrontBackIrCounterDeviceDataItem>(
      ([timestamp, startSensor, endSensor]) => [
        timestamp,
        startSensor,
        endSensor,
      ]
    );
    await this.counterDeviceManager.pushFrontBackIrCounterData(
      actor,
      deviceId,
      data
    );
  }
}
