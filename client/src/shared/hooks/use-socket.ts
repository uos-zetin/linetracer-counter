// src/shared/hooks/use-socket.ts
import { useEffect, useRef } from "react";

export type WsMessage = Record<string, unknown>;
export type MessageHandler<T = WsMessage> = (msg: T) => void;

export function useSocket(url: string, onMessage: MessageHandler) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isUnmounted = false;

    /** WebSocket 연결 & 재연결 담당 */
    function connect() {
      if (isUnmounted) return;

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onmessage = (e) => {
        try {
          onMessage(JSON.parse(e.data));
        } catch {
          console.warn("[WS] JSON 파싱 실패", e.data);
        }
      };

      ws.onclose = () => {
        // 1.5초 뒤 재연결 (단, 컴포넌트가 살아 있을 때만)
        reconnectTimer.current = setTimeout(connect, 1_500);
      };
    }

    connect(); // 첫 연결

    return () => {
      isUnmounted = true;
      if (reconnectTimer.current !== null) {
        clearTimeout(reconnectTimer.current);
      }
      wsRef.current?.close();
    };
  }, [url, onMessage]);

  /** 필요하면 .current?.send() 로 사용 */
  return wsRef;
}
