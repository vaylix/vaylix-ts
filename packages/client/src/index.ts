export { createClient } from './client/factory.js';
export { createPool } from './pool/factory.js';

export type {
  CommandOptions,
  SetBytesResult,
  SetOptions,
  SetResult,
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
  ClusterInfoMap,
  ErrorPayload,
  HealthMap,
  InfoMap,
  MetricsMap,
  ReplicationInfoMap,
  TransactionCommandResult,
  VaylixValue,
  VaylixVersion,
  VaylixTransaction,
} from './types/public.js';

export {
  AuthenticationError,
  AuthorizationError,
  ConnectionError,
  FollowerWriteRejectedError,
  ProtocolError,
  ReplicationAckTimeoutError,
  ReplicationAckUnavailableError,
  ReplicationPromotionDeniedError,
  RemoteCommandError,
  TimeoutError,
  VaylixError,
} from './errors/index.js';
