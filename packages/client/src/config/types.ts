export type CompressionMode = 'zstd' | 'none';

export interface TlsConfig {
  enabled: boolean;
  caFile?: string;
  certFile?: string;
  keyFile?: string;
  servername?: string;
  rejectUnauthorized?: boolean;
}

export interface Logger {
  debug?(message: string, fields?: Record<string, unknown>): void;
  info?(message: string, fields?: Record<string, unknown>): void;
  warn?(message: string, fields?: Record<string, unknown>): void;
  error?(message: string, fields?: Record<string, unknown>): void;
}

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
