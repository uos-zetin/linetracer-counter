import { io, type Socket } from "socket.io-client";
import type { CounterChannel, CounterDto } from "./types";
import type { CounterState } from "../model/types";
import { parseCounterDto } from "../lib/parse-dto";

type CounterMessageHandler = (state: CounterState) => void;

export class CounterSocketIOChannel implements CounterChannel {
  private socket: Socket | null = null;
  private getSessionKey: () => string | null;

  private messageHandlers: CounterMessageHandler[] = [];

  constructor(getSessionKey: () => string | null) {
    this.getSessionKey = getSessionKey;
  }

  async connect(counterId: string): Promise<void> {
    if (this.socket) {
      await this.disconnect(); // 기존 연결이 있다면 해제
    }

    return new Promise((resolve, reject) => {
      const sessionKey = this.getSessionKey();
      if (!sessionKey) {
        reject(new Error("No session key available for socket authentication"));
        return;
      }

      this.socket = io("/socket/counters", {
        forceNew: true,
        query: { deviceId: counterId },
        extraHeaders: {
          authorization: `Session ${sessionKey}`,
        },
      });

      this.socket.on("connect", () => {
        console.log("Counter socket connected successfully");
        resolve();
      });

      this.socket.on("connect_error", (error) => {
        console.error("Counter socket connect_error:", error);
        reject(error);
      });

      this.socket.on("disconnect", (reason) => {
        console.log("Counter socket disconnected:", reason);
      });

      this.socket.on("message", (data: CounterDto) => {
        const state = parseCounterDto(data);
        this.messageHandlers.forEach((handler) => handler(state));
      });

      this.socket.on("error", (error: unknown) => {
        console.error("Counter socket error:", error);
      });
    });
  }

  async disconnect(): Promise<void> {
    if (!this.socket) {
      return; // Already disconnected, no error needed
    }

    this.socket.disconnect();
    this.socket = null;
  }

  subscribe(callback: CounterMessageHandler): () => void {
    this.messageHandlers.push(callback);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((handler) => handler !== callback);
    };
  }
}
