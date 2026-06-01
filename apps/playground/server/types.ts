import type { PlaygroundOperationId, PlaygroundRequest } from "../src/types.js";

export type ExecutePayload = Record<string, unknown>;

export type ExecuteContext = {
  url?: string;
  payload: ExecutePayload;
};

export type ExecuteHandler = (context: ExecuteContext) => Promise<unknown>;

export type OperationHandlers = Record<PlaygroundOperationId, ExecuteHandler>;

export type ExecuteRequestBody = PlaygroundRequest;

export type TransactionStep =
  | { op: "get"; key: string }
  | { op: "set"; key: string; value: string; ttlSeconds?: number; keepTtl?: boolean }
  | { op: "del"; keys: string[] }
  | { op: "exists"; key: string }
  | { op: "expire"; key: string; seconds: number }
  | { op: "ttl"; key: string }
  | { op: "persist"; key: string };
