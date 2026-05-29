export { createClient } from './client/factory.js';
export { createPool } from './pool/factory.js';
import 'dotenv/config.js';

export type {
  CommandOptions,
  SetOptions,
  VaylixClient,
} from './client/types.js';
export type {
  ClientConfig,
  CompressionMode,
  Logger,
  TlsConfig,
} from './config/types.js';
export type { PoolConfig, VaylixPool } from './pool/types.js';
export type {
  ErrorPayload,
  InfoMap,
  MetricsMap,
  TransactionCommandResult,
  VaylixTransaction,
} from './types/public.js';

export {
  AuthenticationError,
  AuthorizationError,
  ConnectionError,
  ProtocolError,
  RemoteCommandError,
  TimeoutError,
  VaylixError,
} from './errors/index.js';
