import { Inject, Injectable } from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from "@nestjs/websockets";
import { Socket } from "socket.io";

import { ActorSessionStore, Unsubscriber } from "@/core/interfaces";
import { Actor, Counter } from "@/core/models";
import {
  CounterActorService,
  CounterEvent,
} from "@/core/services/counter.actor";

/**
 * Counter 메시지 소켓 연결 시 발생하는 에러 메시지 타입 정의
 */
type SocketErrorMessage = {
  code:
    | "MISSING_DEVICE_ID"
    | "MISSING_SESSION"
    | "INVALID_SESSION"
    | "SUBSCRIPTION_ERROR";
  message?: string;
};

/**
 * Counter 메시지 소켓 인터페이스
 */
interface CounterSocket extends Socket {
  actor?: Actor;
  unsubscribeCounterEvent: Unsubscriber | null;

  emit(event: "event", data: CounterEvent): boolean;
  emit(event: "message", data: Counter): boolean;
  emit(event: "error", data: SocketErrorMessage): boolean;
}

@Injectable()
@WebSocketGateway({
  namespace: "/socket/counters",
  cors: {
    origin: "*",
  },
})
export class CounterGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject("CounterService")
    private readonly counterService: CounterActorService,
    @Inject("ActorSessionStore")
    private readonly sessionStore: ActorSessionStore
  ) {}

  public async handleConnection(client: CounterSocket) {
    await this.startSubscription(client);
  }

  public handleDisconnect(client: CounterSocket) {
    client.unsubscribeCounterEvent?.();
    client.unsubscribeCounterEvent = null;
  }

  private emitErrorAndDisconnect(
    client: CounterSocket,
    error: SocketErrorMessage
  ) {
    client.emit("error", error);
    client.disconnect();
  }

  private async startSubscription(client: CounterSocket) {
    try {
      // deviceId 쿼리 파라미터 유무 검사
      const deviceId = client.handshake.query.deviceId;
      if (!deviceId || typeof deviceId !== "string" || deviceId.trim() === "") {
        this.emitErrorAndDisconnect(client, {
          code: "MISSING_DEVICE_ID",
          message: "deviceId query parameter is required",
        });
        return;
      }

      // session 쿼리 파라미터 유무 검사
      const session = client.handshake.query.session;
      if (!session || typeof session !== "string" || session.trim() === "") {
        this.emitErrorAndDisconnect(client, {
          code: "MISSING_SESSION",
          message: "session query parameter is required",
        });
        return;
      }

      // session 검증
      let actor: Actor;
      try {
        actor = await this.sessionStore.validateSession(session);
      } catch (error) {
        this.emitErrorAndDisconnect(client, {
          code: "INVALID_SESSION",
          message: "invalid session",
        });
        return;
      }
      client.actor = actor;

      // 이미 구독 중인 경우 기존 구독 해제
      client.unsubscribeCounterEvent?.();
      client.unsubscribeCounterEvent = null;

      // 연결 시 즉시 Counter 조회 및 전송
      const counter = await this.counterService.getCounter(actor, deviceId);
      client.emit("message", counter);

      // 새로운 구독 생성
      const unsubscribe = await this.counterService.subscribeCounterEvent(
        client.actor,
        deviceId,
        async (event: CounterEvent) => {
          // 실시간으로 클라이언트에게 카운터 이벤트 전송
          client.emit("event", event);

          /**
           * <NOTE>
           * 동시성 문제가 발생할 수 있다.
           * 비동기로 Counter 정보를 조회하기 때문에, 여러 이벤트가 빠른 시간 안에 동시에 처리된다면,
           * 당장의 클라이언트에게는 마지막으로 갱신된 값이 중복 전송될 수 있다. 하지만,
           * (1) 계수기의 출발 신호와 도착 신호는 그다지 빠른 시간 안에 발생하지 않으며,
           * (2) 계수기의 상태가 같은 값으로 중복 발생하여도 마지막 상태가 보장되므로 문제가 되지 않는다.
           *
           * 꼭 서로 다른 이벤트가 발생해야 함이 보장되어야 한다면 'event' 이벤트를 구독하면 된다!
           */
          const counter = await this.counterService.getCounter(actor, deviceId);
          client.emit("message", counter);
        }
      );
      client.unsubscribeCounterEvent = unsubscribe;
    } catch (error) {
      this.emitErrorAndDisconnect(client, {
        code: "SUBSCRIPTION_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
