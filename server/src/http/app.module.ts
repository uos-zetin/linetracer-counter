import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";

import di from "@/container";
import { ActorService, ActorSessionService } from "@/core/services";

import { ActorController } from "./controllers/actor.controller";
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

@Module({
  controllers: [ActorController],
  providers: [actorService, actorSessionService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ActorSessionMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
