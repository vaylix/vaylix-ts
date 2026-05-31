/**
 * Compression modes supported by the Vaylix transport.
 */
export type CompressionMode = 'zstd' | 'none';

/**
 * TLS settings for a client connection.
 */
export interface TlsConfig {
  /**
   * Enable TLS for the TCP connection.
   */
  enabled: boolean;
  /**
   * Optional CA certificate file used to verify the server certificate.
   */
  caFile?: string;
  /**
   * Optional client certificate file for mutual TLS.
   */
  certFile?: string;
  /**
   * Optional client private key file for mutual TLS.
   */
  keyFile?: string;
  /**
   * Server name used for TLS certificate verification.
   */
  servername?: string;
  /**
   * Disable only for trusted local development with self-signed certificates.
   */
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
  /**
   * Connection URL, for example `vaylix://user:password@127.0.0.1:9173`.
   */
  url?: string;
  /**
   * TCP host used when `url` is omitted.
   */
  host?: string;
  /**
   * TCP port used when `url` is omitted.
   */
  port?: number;
  /**
   * Username for the startup `AUTH` command.
   */
  username?: string;
  /**
   * Password for the startup `AUTH` command.
   */
  password?: string;
  /**
   * TLS configuration or boolean TLS enablement.
   */
  tls?: boolean | TlsConfig;
  /**
   * Desired transport compression mode.
   */
  compression?: CompressionMode;
  /**
   * Socket connection timeout in milliseconds.
   */
  connectTimeoutMs?: number;
  /**
   * Per-command response timeout in milliseconds.
   */
  requestTimeoutMs?: number;
  /**
   * Maximum negotiated frame size in bytes.
   */
  maxFrameSize?: number;
  /**
   * Client name sent during startup negotiation.
   */
  clientName?: string;
  /**
   * Client version sent during startup negotiation.
   */
  clientVersion?: string;
  /**
   * Optional lifecycle logger.
   */
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
