/**
 * Flat string map returned by `client.info()`.
 *
 * Vaylix uses section-prefixed keys such as `server.version`,
 * `transport.protocol_version`, and `storage.key_count`.
 */
export type InfoMap = Record<string, string>;

/**
 * Flat string map returned by `client.health()`.
 *
 * Vaylix v0.5.0 includes role-aware readiness fields such as `status`,
 * `ready`, `reason`, `role`, and optional follower phase details.
 */
export type HealthMap = Record<string, string>;

/**
 * Flat string map returned by `client.showCluster()`.
 *
 * Vaylix v0.5.0 uses this surface for term, leader, quorum, sync policy, and
 * member diagnostics.
 */
export type ClusterInfoMap = Record<string, string>;

/**
 * Flat string map returned by `client.showReplication()`.
 *
 * Keys are server-defined replication fields such as role, leader identity,
 * commit position, follower phase, and lag.
 */
export type ReplicationInfoMap = Record<string, string>;

/**
 * Numeric metrics returned by `client.metrics()`.
 */
export type MetricsMap = Record<string, number>;

/**
 * Structured error payload emitted by Vaylix for command failures.
 */
export interface ErrorPayload {
  /**
   * Stable server error code, for example `SRV-008`.
   */
  code: string;
  /**
   * Human-readable server error class name.
   */
  name: string;
  /**
   * Human-readable error detail from the server.
   */
  message: string;
}

/**
 * Typed result for one queued command returned from `transaction().exec()`.
 */
export interface TransactionCommandResult {
  /**
   * Per-command execution status.
   */
  status: 'OK' | 'NOT_FOUND' | 'ERROR';
  /**
   * String value returned by commands such as `GET`, or `null` for missing values.
   */
  value?: string | null;
  /**
   * Integer result returned by commands such as `TTL` or `DEL`.
   */
  integer?: number;
  /**
   * Boolean result returned by commands such as `EXISTS`.
   */
  boolean?: boolean;
  /**
   * Key/value entries returned by inspection commands.
   */
  entries?: Array<[string, string]>;
  /**
   * Multi-value result returned by commands such as `MGET`.
   */
  strings?: Array<string | null>;
  /**
   * Structured server error when the queued command failed.
   */
  error?: ErrorPayload;
}

/**
 * Explicit transaction handle pinned to a single server session.
 *
 * Queue commands with the fluent methods and call `exec()` to commit them in
 * order. Use `discard()` to abandon the queued work.
 */
export interface VaylixTransaction {
  /**
   * Queue a `GET` inside the active transaction.
   */
  get(key: string): this;
  /**
   * Queue a `SET` inside the active transaction.
   *
   * Transactional `SET` currently supports second-based TTL and TTL retention.
   */
  set(key: string, value: string, options?: { ttlSeconds?: number; keepTtl?: boolean }): this;
  /**
   * Queue a `DEL` inside the active transaction.
   */
  del(...keys: string[]): this;
  /**
   * Queue an `EXISTS` check inside the active transaction.
   */
  exists(key: string): this;
  /**
   * Queue an `EXPIRE` operation inside the active transaction.
   */
  expire(key: string, seconds: number): this;
  /**
   * Queue a `TTL` lookup inside the active transaction.
   */
  ttl(key: string): this;
  /**
   * Queue a `PERSIST` operation inside the active transaction.
   */
  persist(key: string): this;
  /**
   * Commit the queued commands and return typed results in queue order.
   */
  exec(): Promise<TransactionCommandResult[]>;
  /**
   * Abandon the queued commands and end the active transaction.
   */
  discard(): Promise<void>;
}
