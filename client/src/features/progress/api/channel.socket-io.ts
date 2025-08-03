import { io, type Socket } from "socket.io-client";
import type { ProgressChannel, ProgressDto } from "./types";
import type { ProgressState } from "../model/types";
import { parseProgressDto } from "../lib/parse-dto";

type ProgressMessageHandler = (progress: ProgressState) => void;

export class ProgressSocketIOChannel implements ProgressChannel {
  private socket: Socket | null = null;
  private getSessionKey: () => string | null;

  private messageHandlers: ProgressMessageHandler[] = [];

  constructor(getSessionKey: () => string | null) {
    this.getSessionKey = getSessionKey;
  }

  async connect(divisionId: string): Promise<void> {
    if (this.socket) {
      await this.disconnect(); // 기존 연결이 있다면 해제
    }

    return new Promise((resolve, reject) => {
      const sessionKey = this.getSessionKey();
      if (!sessionKey) {
        reject(new Error("No session key available for socket authentication"));
        return;
      }

      this.socket = io("/socket/divisions/progress", {
        forceNew: true,
        query: { divisionId },
        extraHeaders: {
          authorization: `Session ${sessionKey}`,
        },
      });

      console.log("Progress socket connected to:", this.socket.io.opts.query);

      this.socket.on("connect", () => {
        console.log("Progress socket connected successfully");
        resolve();
      });

      this.socket.on("connect_error", (error) => {
        console.error("Progress socket connect_error:", error);
        reject(error);
      });

      this.socket.on("disconnect", (reason) => {
        console.log("Progress socket disconnected:", reason);
      });

      this.socket.on("message", (data: ProgressDto) => {
        const progress = parseProgressDto(data);
        this.messageHandlers.forEach((handler) => handler(progress));
      });

      this.socket.on("error", (error: unknown) => {
        console.error("Progress socket error:", error);
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

  subscribe(callback: ProgressMessageHandler): () => void {
    this.messageHandlers.push(callback);

    return () => {
      this.messageHandlers = this.messageHandlers.filter((handler) => handler !== callback);
      if (this.messageHandlers.length === 0 && this.socket) {
        this.disconnect().catch(console.error); // Disconnect if no handlers left
      }
    };
  }
}
