import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";

import path from "path";

import di from "@/container";
import { ActorSessionStore } from "@/core/interfaces";
import { env } from "@/env";

import { ActorService } from "@/core/services/actor";
import { CompetitionActorService } from "@/core/services/competition.actor";
import { CounterActorService } from "@/core/services/counter.actor";
import { DivisionProgressActorService } from "@/core/services/division-progress.actor";
import { ParticipantActorService } from "@/core/services/participant.actor";

import { CounterDeviceActorManager } from "@/infrastructure/counters/counter-device-manager.actor";

import { ActorController } from "./controllers/actor.controller";
import { CompetitionController } from "./controllers/competition.controller";
import { CounterController } from "./controllers/counter.controller";
import { DivisionController } from "./controllers/division.controller";
import { ParticipantController } from "./controllers/participant.controller";
import { RecordController } from "./controllers/record.controller";
import { CounterGateway } from "./gateways/counter.gateway";
import { DivisionProgressGateway } from "./gateways/division-progress.gateway";
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
const counterService: CustomProvider<CounterActorService> = {
  provide: "CounterService",
  useValue: di.services.counter,
};
const divisionProgressService: CustomProvider<DivisionProgressActorService> = {
  provide: "DivisionProgressService",
  useValue: di.services.divisionProgress,
};
const participantService: CustomProvider<ParticipantActorService> = {
  provide: "ParticipantService",
  useValue: di.services.participant,
};
const counterDeviceManager: CustomProvider<CounterDeviceActorManager> = {
  provide: "CounterDeviceManager",
  useValue: di.managers.counterDevice,
};

@Module({
  controllers: [
    ActorController,
    CompetitionController,
    CounterController,
    DivisionController,
    ParticipantController,
    RecordController,
  ],
  providers: [
    actorSessionStore,
    actorService,
    competitionService,
    participantService,
    divisionProgressService,
    counterService,
    counterDeviceManager,
    DivisionProgressGateway,
    CounterGateway,
  ],
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.resolve(env.STATIC_FILES_PATH),
      exclude: ["/api{/*path}"],
    }),
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ActorSessionMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
