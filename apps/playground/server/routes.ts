import type { FastifyInstance } from "fastify";

import type { PlaygroundRequest } from "../src/types.js";
import { executeOperation } from "./executor.js";
import { createErrorResponse, createSuccessResponse } from "./responses.js";

export async function registerRoutes(server: FastifyInstance): Promise<void> {
  server.get("/api/config", async () => ({
    databaseUrl: process.env.DATABASE_URL,
    hasDatabaseUrl: typeof process.env.DATABASE_URL === "string",
  }));

  server.post<{ Body: PlaygroundRequest }>("/api/execute", async (request, reply) => {
    const startedAt = performance.now();
    const body = request.body as PlaygroundRequest;

    try {
      const result = await executeOperation(body.operation, {
        payload: body.payload ?? {},
        ...(body.url ? { url: body.url } : {}),
      });
      return createSuccessResponse(
        body.operation,
        Math.round((performance.now() - startedAt) * 100) / 100,
        result,
      );
    } catch (error) {
      reply.status(400);
      return createErrorResponse(
        body.operation,
        Math.round((performance.now() - startedAt) * 100) / 100,
        error,
      );
    }
  });
}
