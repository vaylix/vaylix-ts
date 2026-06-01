import cors from "@fastify/cors";
import Fastify from "fastify";

import { registerRoutes } from "./routes.js";

export async function createPlaygroundServer() {
  const server = Fastify({
    logger: process.env.NODE_ENV === "production",
  });

  await server.register(cors, { origin: true });
  await registerRoutes(server);

  return server;
}
