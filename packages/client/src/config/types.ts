/**
 * Compression modes supported by the Vaylix transport.
 */
export type CompressionMode = 'zstd' | 'none';

/**
 * TLS settings for a client connection.
 */
export interface TlsConfig {
  enabled: boolean;
  caFile?: string;
  certFile?: string;
  keyFile?: string;
  servername?: string;
  rejectUnauthorized?: boolean;
}

/**
 * Optional structured logger used by the client for connection lifecycle logs.
 */
export interface Logger {
  debug?(message: string, fields?: Record<string, unknown>): void;
  info?(message: string, fields?: Record<string, unknown>): void;
  warn?(message: string, fields?: Record<string, unknown>): void;
  error?(message: string, fields?: Record<string, unknown>): void;
}

/**
 * User-supplied configuration for creating a client or pool.
 *
 * If `url` is omitted, the client falls back to `process.env.DATABASE_URL`.
 */
export interface ClientConfig {
  url?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  tls?: boolean | TlsConfig;
  compression?: CompressionMode;
  connectTimeoutMs?: number;
  requestTimeoutMs?: number;
  maxFrameSize?: number;
  clientName?: string;
  clientVersion?: string;
  logger?: Logger;
}

/**
 * Fully resolved runtime configuration after defaults and URL parsing.
 */
export interface ResolvedClientConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  tls: TlsConfig;
  compression: CompressionMode;
  connectTimeoutMs: number;
  requestTimeoutMs: number;
  maxFrameSize: number;
  clientName: string;
  clientVersion: string;
  logger?: Logger;
  databaseUrl?: string;
}
