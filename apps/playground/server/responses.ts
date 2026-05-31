import type {
  PlaygroundErrorResponse,
  PlaygroundOperationId,
  PlaygroundSuccessResponse,
} from "../src/types.js";

export function createSuccessResponse(
  operation: PlaygroundOperationId,
  durationMs: number,
  result: unknown,
): PlaygroundSuccessResponse {
  return {
    ok: true,
    operation,
    durationMs,
    result,
  };
}

export function createErrorResponse(
  operation: PlaygroundOperationId,
  durationMs: number,
  error: unknown,
): PlaygroundErrorResponse {
  const normalized =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          ...(typeof (error as Error & { code?: string }).code === "string"
            ? { code: (error as Error & { code?: string }).code }
            : {}),
        }
      : {
          name: "Error",
          message: String(error),
        };

  return {
    ok: false,
    operation,
    durationMs,
    error: normalized,
  };
}
