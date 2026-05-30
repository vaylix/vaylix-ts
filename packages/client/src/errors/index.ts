import type { ErrorPayload } from '../types/public.js';

/**
 * Base class for all errors thrown by `@vaylix/client`.
 */
export class VaylixError extends Error {
  public constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
  }
}

/**
 * Network or socket-level connection failure.
 */
export class ConnectionError extends VaylixError {}
/**
 * Request timed out before a response arrived.
 */
export class TimeoutError extends VaylixError {}
/**
 * Transport framing, decoding, or protocol negotiation failure.
 */
export class ProtocolError extends VaylixError {}
/**
 * Authentication failed during startup or explicit auth.
 */
export class AuthenticationError extends VaylixError {}
/**
 * The authenticated principal lacks permission for the requested action.
 */
export class AuthorizationError extends VaylixError {}
/**
 * A write requiring follower acknowledgements did not complete in time.
 */
export class ReplicationAckTimeoutError extends VaylixError {}
/**
 * The requested replication acknowledgement mode could not be satisfied.
 */
export class ReplicationAckUnavailableError extends VaylixError {}
/**
 * The current node is a follower and rejects writes or other leader-only commands.
 */
export class FollowerWriteRejectedError extends VaylixError {}
/**
 * The server refused follower promotion because safety preconditions were not met.
 */
export class ReplicationPromotionDeniedError extends VaylixError {}

/**
 * Structured command failure returned by the server.
 */
export class RemoteCommandError extends VaylixError {
  public readonly code: string;
  public readonly status: 'ERROR' | 'NOT_FOUND';
  public readonly payload: ErrorPayload;

  public constructor(
    status: 'ERROR' | 'NOT_FOUND',
    payload: ErrorPayload,
    options?: { cause?: unknown },
  ) {
    super(`${payload.name} (${payload.code}): ${payload.message}`, options);
    this.code = payload.code;
    this.status = status;
    this.payload = payload;
  }
}
