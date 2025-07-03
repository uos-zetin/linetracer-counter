// src/shared/hooks/use-socket.test.tsx
import {
  renderHook,
  waitFor, // ← 추가
} from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Server } from "mock-socket";
import { useSocket } from "./use-socket";

const WS_URL = "ws://localhost:12345";

describe("useSocket (React 19)", () => {
  let server: Server;

  beforeEach(() => {
    server = new Server(WS_URL);
  });

  afterEach(() => {
    server.close();
    vi.clearAllMocks();
  });

  /* 1) 메시지 수신 */
  it("calls onMessage when valid JSON arrives", async () => {
    const spy = vi.fn();
    renderHook(() => useSocket(WS_URL, spy));

    server.on("connection", (socket) => socket.send(JSON.stringify({ type: "ping" })));

    await waitFor(() => expect(spy).toHaveBeenCalledWith({ type: "ping" }));
  });

  /* 2) 자동 재연결 */
  it("reconnects after socket closes", async () => {
    const spy = vi.fn();
    renderHook(() => useSocket(WS_URL, spy));

    // 첫 서버를 닫아 연결을 강제로 끊음
    server.close();

    // 1.5 s 재연결 딜레이보다 길게 기다린 뒤 새 서버 구동
    await new Promise((r) => setTimeout(r, 1600));
    server = new Server(WS_URL);

    server.on("connection", (socket) => socket.send(JSON.stringify({ type: "after-reconnect" })));

    // spy 가 호출될 때까지 최대 3 s 대기
    await waitFor(() => expect(spy).toHaveBeenCalledWith({ type: "after-reconnect" }), { timeout: 3000 });
  });
});
