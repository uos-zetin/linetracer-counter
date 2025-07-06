import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { ApiSecurity } from "@nestjs/swagger";
import { Request } from "express";

import { Actor } from "@/core/models";

export const ApiActorSecurity = () => ApiSecurity("ActorSessionKey");

export const CurrentActor = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Actor => {
    const request = ctx.switchToHttp().getRequest() as Request;
    return request.actor;
  }
);
