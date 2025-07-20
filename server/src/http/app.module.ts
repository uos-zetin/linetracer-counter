import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";

import di from "@/container";
import { ActorSessionStore } from "@/core/interfaces";

import { ActorService } from "@/core/services/actor";
import { CompetitionActorService } from "@/core/services/competition.actor";
import { ParticipantActorService } from "@/core/services/participant.actor";

import { ActorController } from "./controllers/actor.controller";
import { CompetitionController } from "./controllers/competition.controller";
import { DivisionController } from "./controllers/division.controller";
import { ParticipantController } from "./controllers/participant.controller";
import { RecordController } from "./controllers/record.controller";
import { ActorSessionMiddleware } from "./middlewares/actor-session.middleware";

type CustomProvider<T> = {
  provide: string;
  useValue: T;
};

// interface providers
const actorSessionStore: CustomProvider<ActorSessionStore> = {
  provide: "ActorSessionStore",
  useValue: di.sessionStore,
};

// service providers
const actorService: CustomProvider<ActorService> = {
  provide: "ActorService",
  useValue: di.services.actor,
};
const competitionService: CustomProvider<CompetitionActorService> = {
  provide: "CompetitionService",
  useValue: di.services.competition,
};
const participantService: CustomProvider<ParticipantActorService> = {
  provide: "ParticipantService",
  useValue: di.services.participant,
};

@Module({
  controllers: [
    ActorController,
    CompetitionController,
    DivisionController,
    ParticipantController,
    RecordController,
  ],
  providers: [
    actorSessionStore,
    actorService,
    competitionService,
    participantService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ActorSessionMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
