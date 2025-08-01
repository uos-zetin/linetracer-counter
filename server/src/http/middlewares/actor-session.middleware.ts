import { Inject, Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

import { ActorSessionStore } from "@/core/interfaces";
import { Actor } from "@/core/models";
import { errorToResponse } from "../exception.filter";

declare module "express" {
  export interface Request {
    actor: Actor;
    actorSessionKey?: string;
  }
}

@Injectable()
export class ActorSessionMiddleware implements NestMiddleware {
  constructor(
    @Inject("ActorSessionStore")
    private readonly actorSessionStore: ActorSessionStore
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
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
      actor = await this.actorSessionStore.validateSession(sessionKey);
      req.actorSessionKey = sessionKey;
    }

    req.actor = actor;
    next();
  }
}
