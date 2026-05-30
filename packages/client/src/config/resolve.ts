import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import type {
  ClientConfig,
  CompressionMode,
  Logger,
  ResolvedClientConfig,
  TlsConfig,
} from './types.js';

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 9173;
const DEFAULT_CONNECT_TIMEOUT_MS = 5_000;
const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_FRAME_SIZE = 8 * 1024 * 1024;
const DEFAULT_CLIENT_NAME = '@vaylix/client';
const DEFAULT_CLIENT_VERSION = '0.2.0';

export function resolveClientConfig(
  config: ClientConfig = {},
): ResolvedClientConfig {
  const databaseUrl = config.url ?? process.env.DATABASE_URL;
  const fromUrl = databaseUrl ? parseDatabaseUrl(databaseUrl) : undefined;
  const tls = resolveTlsConfig(config.tls, fromUrl?.tls, fromUrl?.host);
  const resolved: ResolvedClientConfig = {
    host: config.host ?? fromUrl?.host ?? DEFAULT_HOST,
    port: config.port ?? fromUrl?.port ?? DEFAULT_PORT,
    tls,
    compression: config.compression ?? fromUrl?.compression ?? 'zstd',
    connectTimeoutMs: config.connectTimeoutMs ?? DEFAULT_CONNECT_TIMEOUT_MS,
    requestTimeoutMs: config.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS,
    maxFrameSize: config.maxFrameSize ?? DEFAULT_MAX_FRAME_SIZE,
    clientName: config.clientName ?? DEFAULT_CLIENT_NAME,
    clientVersion: config.clientVersion ?? DEFAULT_CLIENT_VERSION,
  };
  if (config.logger !== undefined) {
    resolved.logger = config.logger;
  }
  const username = config.username ?? fromUrl?.username;
  const password = config.password ?? fromUrl?.password;
  if (username !== undefined) {
    resolved.username = username;
  }
  if (password !== undefined) {
    resolved.password = password;
  }
  if (databaseUrl !== undefined) {
    resolved.databaseUrl = databaseUrl;
  }
  return resolved;
}

type ParsedUrlConfig = {
  host: string;
  port: number;
  username?: string;
  password?: string;
  tls: TlsConfig;
  compression: CompressionMode;
};

function parseDatabaseUrl(value: string): ParsedUrlConfig {
  const url = new URL(value);
  if (url.protocol !== 'vaylix:') {
    throw new TypeError(`unsupported DATABASE_URL protocol: ${url.protocol}`);
  }
  const compression = parseCompression(url.searchParams.get('compression'));
  const sslParam = url.searchParams.get('ssl');
  const tls: TlsConfig = {
    enabled: sslParam === 'true',
    rejectUnauthorized: true,
  };
  const caFile = url.searchParams.get('ca_cert');
  const certFile = url.searchParams.get('client_cert');
  const keyFile = url.searchParams.get('client_key');
  if (caFile !== null) {
    tls.caFile = caFile;
  }
  if (certFile !== null) {
    tls.certFile = certFile;
  }
  if (keyFile !== null) {
    tls.keyFile = keyFile;
  }
  if (url.hostname) {
    tls.servername = url.hostname;
  }
  const parsed: ParsedUrlConfig = {
    host: url.hostname || DEFAULT_HOST,
    port: url.port ? Number.parseInt(url.port, 10) : DEFAULT_PORT,
    tls,
    compression,
  };
  if (url.username) {
    parsed.username = url.username;
  }
  if (url.password) {
    parsed.password = url.password;
  }
  return parsed;
}

function parseCompression(value: string | null): CompressionMode {
  if (value === null || value === '' || value === 'zstd') {
    return 'zstd';
  }
  if (value === 'none') {
    return 'none';
  }
  throw new TypeError(`unsupported compression mode: ${value}`);
}

function resolveTlsConfig(
  input: boolean | TlsConfig | undefined,
  fromUrl: TlsConfig | undefined,
  host: string | undefined,
): TlsConfig {
  if (typeof input === 'boolean') {
    const tls: TlsConfig = {
      enabled: input,
      rejectUnauthorized: true,
    };
    if (host !== undefined) {
      tls.servername = host;
    }
    return tls;
  }

  if (input) {
    const tls: TlsConfig = {
      enabled: input.enabled,
      rejectUnauthorized: input.rejectUnauthorized ?? true,
    };
    if (input.caFile !== undefined) {
      tls.caFile = input.caFile;
    }
    if (input.certFile !== undefined) {
      tls.certFile = input.certFile;
    }
    if (input.keyFile !== undefined) {
      tls.keyFile = input.keyFile;
    }
    const servername = input.servername ?? host;
    if (servername !== undefined) {
      tls.servername = servername;
    }
    return tls;
  }

  if (fromUrl) {
    const tls: TlsConfig = {
      enabled: fromUrl.enabled,
      rejectUnauthorized: fromUrl.rejectUnauthorized ?? true,
    };
    if (fromUrl.caFile !== undefined) {
      tls.caFile = fromUrl.caFile;
    }
    if (fromUrl.certFile !== undefined) {
      tls.certFile = fromUrl.certFile;
    }
    if (fromUrl.keyFile !== undefined) {
      tls.keyFile = fromUrl.keyFile;
    }
    const servername = fromUrl.servername ?? host;
    if (servername !== undefined) {
      tls.servername = servername;
    }
    return tls;
  }

  const tls: TlsConfig = {
    enabled: false,
    rejectUnauthorized: true,
  };
  if (host !== undefined) {
    tls.servername = host;
  }
  return tls;
}

export function readOptionalFile(path: string | undefined): Buffer | undefined {
  return path ? readFileSync(path) : undefined;
}

export function log(
  logger: Logger | undefined,
  level: keyof Logger,
  message: string,
  fields?: Record<string, unknown>,
): void {
  logger?.[level]?.(message, fields);
}
