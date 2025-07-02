import fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";

import { pingRoutes } from "./infrastructure/routes/ping-pong";

async function buildServer() {
  const server = fastify({ logger: true });

  server.register(swagger, {
    openapi: {
      info: {
        title: "Linetracer Counter Server",
        description: "ZETIN 라인트레이서 경연 대회 계수기 서버",
        version: "0.0.1",
      },
      servers: [{ url: "http://localhost:3000" }],
    },
  });
  server.register(swaggerUI, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
    },
  });

  server.register(pingRoutes);

  return server;
}

async function startServer() {
  const server = await buildServer();
  try {
    const res = await server.listen({ port: 3000 });
    console.log(`server listening at ${res}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

startServer();
