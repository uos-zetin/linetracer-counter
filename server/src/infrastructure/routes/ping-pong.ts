import { FastifyInstance } from "fastify";

export async function pingRoutes(fastify: FastifyInstance) {
  fastify.get("/ping", (request, reply) => {
    reply.code(200).send("pong\n");
  });
}
