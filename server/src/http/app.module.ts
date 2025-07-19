import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";

import di from "@/container";
import { ActorSessionStore } from "@/core/interfaces";

import { ActorService } from "@/core/services/actor";
import { CompetitionActorService } from "@/core/services/competition.actor";
import { ManualRecordService } from "@/core/services/manual-record";
import { ParticipantActorService } from "@/core/services/participant.actor";
import { RecordService } from "@/core/services/record";
import { TimerLogService } from "@/core/services/timer-log";

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
const recordService: CustomProvider<RecordService> = {
  provide: "RecordService",
  useValue: di.services.record,
};
const timerLogService: CustomProvider<TimerLogService> = {
  provide: "TimerLogService",
  useValue: di.services.timerLog,
};
const manualRecordService: CustomProvider<ManualRecordService> = {
  provide: "ManualRecordService",
  useValue: di.services.manualRecord,
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
    manualRecordService,
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
