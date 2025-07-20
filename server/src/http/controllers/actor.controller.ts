import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Req,
} from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { Request } from "express";

import { ActorSessionStore } from "@/core/interfaces";
import { Actor } from "@/core/models";
import { ActorService } from "@/core/services/actor";

import {
  ApiActorSecurity,
  CurrentActor,
} from "../decorators/current-actor.decorator";
import {
  ActorResponseDto,
  LoginActorDto,
  RegisterActorDto,
  SetActorRolesDto,
} from "../dtos/actor.dto";

@ApiTags("Actors")
@Controller("actors")
export class ActorController {
  constructor(
    @Inject("ActorService")
    private readonly actorService: ActorService,
    @Inject("ActorSessionStore")
    private readonly actorSessionStore: ActorSessionStore
  ) {}

  @Get("/")
  @ApiActorSecurity()
  @ApiResponse({
    status: 200,
    description: "모든 액터 목록 반환",
    type: [ActorResponseDto],
  })
  async getActors(
    @CurrentActor()
    actor: Actor
  ): Promise<ActorResponseDto[]> {
    return this.actorService.getActors(actor);
  }

  @Post("/register")
  @HttpCode(201)
  @ApiResponse({
    status: 201,
    description: "액터 등록 성공 및 액터 정보 반환",
    type: ActorResponseDto,
  })
  async registerActor(
    @Body()
    body: RegisterActorDto
  ): Promise<ActorResponseDto> {
    const { name, username, password } = body;
    const actor = await this.actorService.registerWithIdPw(
      name,
      username,
      password
    );
    return actor;
  }

  @Post("/login")
  @ApiResponse({
    status: 200,
    description: "로그인 성공 및 세션 키 반환",
    type: String,
  })
  async loginActor(
    @Body()
    body: LoginActorDto
  ): Promise<string> {
    const { username, password } = body;
    const actor = await this.actorService.verifyIdPw(username, password);
    const session = await this.actorSessionStore.createSession(
      actor,
      12 * 60 * 60 * 1000
    ); // 12 hours

    return session;
  }

  @Get("/whoami")
  @ApiActorSecurity()
  @ApiResponse({
    status: 200,
    description: "현재 액터 정보 반환",
    type: ActorResponseDto,
  })
  async whoami(
    @CurrentActor()
    actor: Actor
  ): Promise<ActorResponseDto> {
    return actor;
  }

  @Post("/logout")
  @HttpCode(204)
  @ApiActorSecurity()
  @ApiResponse({
    status: 204,
    description: "서버에 저장된 세션 키 폐기(또는 없음)",
  })
  async logoutActor(
    @Req()
    request: Request
  ) {
    const sessionKey = request.actorSessionKey;
    if (sessionKey) {
      await this.actorSessionStore.revokeSession(sessionKey);
    }
  }

  @Post("/:actorId/roles")
  @HttpCode(200)
  @ApiActorSecurity()
  @ApiResponse({
    status: 200,
    description: "액터 역할 설정 성공 및 액터 정보 반환",
    type: ActorResponseDto,
  })
  async setActorRoles(
    @CurrentActor()
    actor: Actor,
    @Param("actorId")
    actorId: string,
    @Body()
    body: SetActorRolesDto
  ): Promise<ActorResponseDto> {
    return this.actorService.setActorRoles(actor, actorId, body.roles);
  }

  @Delete("/:actorId")
  @HttpCode(204)
  @ApiActorSecurity()
  @ApiResponse({
    status: 204,
    description: "액터 삭제 성공",
  })
  async deleteActor(
    @CurrentActor()
    actor: Actor,
    @Param("actorId")
    actorId: string
  ) {
    await this.actorService.unregister(actor, actorId);
  }
}
