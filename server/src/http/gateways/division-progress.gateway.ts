import { Inject, Injectable } from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from "@nestjs/websockets";
import { Socket } from "socket.io";

import { ActorSessionStore, Unsubscriber } from "@/core/interfaces";
import { Actor, DivisionProgress } from "@/core/models";
import { DivisionProgressActorService } from "@/core/services/division-progress.actor";

/**
 * DivisionProgress 메시지 소켓 연결 시 발생하는 에러 메시지 타입 정의
 */
type SocketErrorMessage = {
  code:
    | "MISSING_DIVISION_ID"
    | "MISSING_SESSION"
    | "INVALID_SESSION"
    | "SUBSCRIPTION_ERROR";
  message?: string;
};

/**
 * DivisionProgress 메시지 소켓 인터페이스
 */
interface DivisionProgressSocket extends Socket {
  actor?: Actor;
  unsubscribeDivisionProgress: Unsubscriber | null;

  emit(event: "message", data: DivisionProgress): boolean;
  emit(event: "error", data: SocketErrorMessage): boolean;
}

@Injectable()
@WebSocketGateway({
  namespace: "/socket/divisions/progress",
  cors: {
    origin: "*",
  },
})
export class DivisionProgressGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject("DivisionProgressService")
    private readonly divisionProgressService: DivisionProgressActorService,
    @Inject("ActorSessionStore")
    private readonly sessionStore: ActorSessionStore
  ) {}

  public async handleConnection(client: DivisionProgressSocket) {
    await this.startSubscription(client);
  }

  public handleDisconnect(client: DivisionProgressSocket) {
    client.unsubscribeDivisionProgress?.();
    client.unsubscribeDivisionProgress = null;
  }

  private emitErrorAndDisconnect(
    client: DivisionProgressSocket,
    error: SocketErrorMessage
  ) {
    client.emit("error", error);
    client.disconnect();
  }

  private async startSubscription(client: DivisionProgressSocket) {
    try {
      // divisionId 쿼리 파라미터 유무 검사
      const divisionId = client.handshake.query.divisionId;
      if (
        !divisionId ||
        typeof divisionId !== "string" ||
        divisionId.trim() === ""
      ) {
        this.emitErrorAndDisconnect(client, {
          code: "MISSING_DIVISION_ID",
          message: "divisionId query parameter is required",
        });
        return;
      }

      // session 쿼리 파라미터 유무 검사
      const session = client.handshake.headers.authorization?.split(" ")[1];
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
      client.unsubscribeDivisionProgress?.();
      client.unsubscribeDivisionProgress = null;

      // 연결 시 즉시 DivisionProgress 조회 및 전송
      const initialProgress =
        await this.divisionProgressService.getDivisionProgress(
          client.actor,
          divisionId
        );
      client.emit("message", initialProgress);

      // 새로운 구독 생성
      const unsubscribe =
        this.divisionProgressService.subscribeDivisionProgress(
          client.actor,
          divisionId,
          async (progress) => {
            // 실시간으로 클라이언트에게 진행 상태 전송
            client.emit("message", progress);
          }
        );
      client.unsubscribeDivisionProgress = unsubscribe;
    } catch (error) {
      this.emitErrorAndDisconnect(client, {
        code: "SUBSCRIPTION_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
