import { WebSocketServer } from "ws";

type ClientMsg =
  | {
      type: "ping";
    }
  | {
      type: "reset";
      msLeft: number;
    };

interface TimerUpdate {
  type: "timer:update";
  msLeft: number;
}

interface InitMsg {
  type: "init";
  timer: {
    msLeft: number;
  };
}

const PORT = 4001;
const wss = new WebSocketServer({ port: PORT });
let msLeft = 240000;

console.log(`🟢  Mock WS  »  ws://localhost:${PORT}`);

wss.on("connection", (ws) => {
  const init: InitMsg = {
    type: "init",
    timer: {
      msLeft,
    },
  };
  ws.send(JSON.stringify(init));

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString()) as ClientMsg;
      if (msg.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
      } else if (msg.type === "reset") {
        msLeft = msg.msLeft ?? 240000;
      }
    } catch {
      // Do nothing
    }
  });
});

setInterval(() => {
  msLeft = Math.max(0, msLeft - 1000);
  const update: TimerUpdate = {
    type: "timer:update",
    msLeft,
  };

  const data = JSON.stringify(update);
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  });
}, 1000);
