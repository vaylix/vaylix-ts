/**
 * Flat string map returned by server inspection commands such as `info()`.
 */
export type InfoMap = Record<string, string>;

/**
 * Flat string map returned by the `health()` command.
 *
 * Keys are server-defined health fields such as readiness, liveness, role, and
 * replication state.
 */
export type HealthMap = Record<string, string>;

/**
 * Flat string map returned by the `showReplication()` command.
 *
 * Keys are server-defined replication fields such as role, leader identity,
 * acknowledged sequence, follower phase, and lag.
 */
export type ReplicationInfoMap = Record<string, string>;

/**
 * Numeric metrics returned by the structured `metrics()` command.
 */
export type MetricsMap = Record<string, number>;

/**
 * Structured error payload emitted by the Vaylix server for command failures.
 */
export interface ErrorPayload {
  code: string;
  name: string;
  message: string;
}

/**
 * Typed result for a single queued command returned from `transaction().exec()`.
 */
export interface TransactionCommandResult {
  status: 'OK' | 'NOT_FOUND' | 'ERROR';
  value?: string | null;
  integer?: number;
  boolean?: boolean;
  entries?: Array<[string, string]>;
  strings?: Array<string | null>;
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
