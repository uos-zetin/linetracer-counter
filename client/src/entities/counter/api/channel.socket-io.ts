import { io, type Socket } from "socket.io-client";
import type { CounterChannel } from "./types";
import type { CounterState } from "../model/types";

export class CounterSocketIOChannel implements CounterChannel {
  private socket: Socket | null = null;

  async connect(counterId: string): Promise<void> {
    this.socket = io("/counters", {
      query: { counterId },
    });

    if (!this.socket) {
      throw new Error("Socket connection failed");
    }

    return new Promise((resolve, reject) => {
      this.socket!.on("connect", () => {
        resolve();
      });

      this.socket!.on("connect_error", (error) => {
        reject(error);
      });
    });
  }

  async disconnect(): Promise<void> {
    if (!this.socket) {
      throw new Error("Socket is not connected");
    }

    this.socket.disconnect();
    this.socket = null;
  }

  subscribe(callback: (state: CounterState) => void): () => void {
    if (!this.socket) {
      throw new Error("Socket is not connected");
    }

    this.socket.on("counter:update", (state: CounterState) => {
      callback(state);
    });

    return () => {
      this.socket!.off("counter:update");
    };
  }
}
