import { io, type Socket } from "socket.io-client";
import type { ProgressChannel } from "./types";
import type { ProgressState } from "../model/types";

export class ProgressSocketIOChannel implements ProgressChannel {
  private socket: Socket | null = null;

  async connect(divisionId: string): Promise<void> {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.socket = io("/progress", {
      query: { divisionId },
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

  subscribe(callback: (progress: ProgressState) => void): () => void {
    if (!this.socket) {
      throw new Error("Socket is not connected");
    }

    this.socket.on("progress:update", (progress: ProgressState) => {
      callback(progress);
    });

    return () => {
      this.socket!.off("progress:update");
    };
  }
}
