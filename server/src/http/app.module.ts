import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";

import di from "@/container";
import {
  ActorService,
  ActorSessionService,
  CompetitionService,
} from "@/core/services";

import { ActorController } from "./controllers/actor.controller";
import { ActorSessionMiddleware } from "./middlewares/actor-session.middleware";
import { CompetitionController } from "./controllers/competition.controller";
import { DivisionController } from "./controllers/division.controller";

type CustomProvider<T> = {
  provide: string;
  useValue: T;
};

// service providers
const actorService: CustomProvider<ActorService> = {
  provide: "ActorService",
  useValue: di.services.actor,
};
const actorSessionService: CustomProvider<ActorSessionService> = {
  provide: "ActorSessionService",
  useValue: di.services.actorSession,
};
const competitionService: CustomProvider<CompetitionService> = {
  provide: "CompetitionService",
  useValue: di.services.competition,
};

@Module({
  controllers: [ActorController, CompetitionController, DivisionController],
  providers: [actorService, actorSessionService, competitionService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ActorSessionMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
