import { Inject, Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

import { Actor } from "@/core/models";
import { ActorSessionService } from "@/core/services";

declare module "express" {
  export interface Request {
    actor: Actor;
    actorSessionKey?: string;
  }
}

@Injectable()
export class ActorSessionMiddleware implements NestMiddleware {
  constructor(
    @Inject("ActorSessionService")
    private readonly actorSessionService: ActorSessionService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      const sessionKey = authHeader?.split(" ")[1];

      // TODO: 추후 유틸리티 함수로 분리할 것
      let actor: Actor = {
        id: "",
        name: "익명 사용자",
        roles: [],
        createdAt: new Date(),
      };
      if (sessionKey) {
        actor = await this.actorSessionService.validateSession(sessionKey);
        req.actorSessionKey = sessionKey;
      }

      req.actor = actor;
      next();
    } catch (err) {
      next(err);
    }
  }
}
