import type { ErrorPayload } from '../types/public.js';

export class VaylixError extends Error {
  public constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class ConnectionError extends VaylixError {}
export class TimeoutError extends VaylixError {}
export class ProtocolError extends VaylixError {}
export class AuthenticationError extends VaylixError {}
export class AuthorizationError extends VaylixError {}

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
