import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";

import di from "@/container";
import {
  ActorService,
  ActorSessionService,
  CompetitionService,
  ParticipantService,
  RecordService,
  TimerLogService,
} from "@/core/services";

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
const participantService: CustomProvider<ParticipantService> = {
  provide: "ParticipantService",
  useValue: di.services.participant,
};
const recordService: CustomProvider<RecordService> = {
  provide: "RecordService",
  useValue: di.services.record,
};
const timerLogService: CustomProvider<TimerLogService> = {
  provide: "TimerLogService",
  useValue: di.services.timerLog,
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
    actorService,
    actorSessionService,
    competitionService,
    participantService,
    recordService,
    timerLogService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ActorSessionMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
