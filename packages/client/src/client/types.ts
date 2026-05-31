import type {
  ClusterInfoMap,
  HealthMap,
  InfoMap,
  MetricsMap,
  ReplicationInfoMap,
  VaylixTransaction,
} from '../types/public.js';

/**
 * Optional per-command metadata understood by the Vaylix transport.
 */
export interface CommandOptions {
  /**
   * Relative deadline in milliseconds for the command.
   */
  deadlineMs?: number;
  /**
   * Opaque trace identifier forwarded to the server for correlation.
   */
  traceId?: string;
}

/**
 * Modifiers supported by the `SET` command.
 */
export interface SetOptions {
  /**
   * Expire the value after this many whole seconds.
   */
  ttlSeconds?: number;
  /**
   * Expire the value after this many milliseconds.
   */
  ttlMilliseconds?: number;
  /**
   * Preserve the existing TTL when overwriting a key.
   */
  keepTtl?: boolean;
  /**
   * Write only when the key does not already exist.
   */
  onlyIfMissing?: boolean;
  /**
   * Write only when the key already exists.
   */
  onlyIfExists?: boolean;
  /**
   * Return the previous value instead of a plain `"OK"` result.
   */
  returnPrevious?: boolean;
}

/**
 * Result type for `SET`.
 *
 * Plain writes return `"OK"`. Conditional writes return a boolean indicating
 * whether the write happened. `returnPrevious` returns the previous value or
 * `null` when the key was absent.
 */
export type SetResult = 'OK' | boolean | string | null;

/**
 * Public client contract for talking to a Vaylix server.
 */
export interface VaylixClient {
  /**
   * Open the network connection and complete startup negotiation.
   */
  connect(): Promise<void>;
  /**
   * Close the underlying connection and reject outstanding requests.
   */
  close(): Promise<void>;
  /**
   * Check server reachability and basic request/response health.
   */
  ping(options?: CommandOptions): Promise<'PONG'>;
  /**
   * Read a string value by key.
   */
  get(key: string, options?: CommandOptions): Promise<string | null>;
  /**
   * Write a string value with optional conditional and TTL modifiers.
   */
  set(key: string, value: string, options?: SetOptions & CommandOptions): Promise<SetResult>;
  /**
   * Delete one or more keys and return the number of removed keys.
   */
  del(...keys: string[]): Promise<number>;
  /**
   * Test whether a key currently exists.
   */
  exists(key: string, options?: CommandOptions): Promise<boolean>;
  /**
   * Fetch multiple keys in a single round trip.
   */
  mget(keys: string[], options?: CommandOptions): Promise<Array<string | null>>;
  /**
   * Write multiple key/value pairs in a single round trip.
   */
  mset(entries: Record<string, string>, options?: CommandOptions): Promise<'OK'>;
  /**
   * Attach or replace a TTL in whole seconds.
   */
  expire(key: string, seconds: number, options?: CommandOptions): Promise<boolean>;
  /**
   * Read the server-reported TTL for a key.
   */
  ttl(key: string, options?: CommandOptions): Promise<number>;
  /**
   * Remove any TTL from a key.
   */
  persist(key: string, options?: CommandOptions): Promise<boolean>;
  /**
   * Read general server and storage metadata.
   */
  info(options?: CommandOptions): Promise<InfoMap>;
  /**
   * Read machine-oriented health status for the current node.
   */
  health(options?: CommandOptions): Promise<HealthMap>;
  /**
   * Read Vaylix v0.5.0 cluster term, leader, quorum, and member state.
   */
  showCluster(options?: CommandOptions): Promise<ClusterInfoMap>;
  /**
   * Add or update a cluster member.
   *
   * Vaylix v0.5.0 expects `address` in `host:port` form and may reject the
   * command when the current node cannot safely apply membership changes.
   */
  clusterJoin(nodeId: string, address: string, options?: CommandOptions): Promise<'OK'>;
  /**
   * Remove a cluster member by node id.
   *
   * Use this operator command only after accounting for quorum impact.
   */
  clusterRemove(nodeId: string, options?: CommandOptions): Promise<'OK'>;
  /**
   * Read replication role, lag, and acknowledgement state for the current node.
   */
  showReplication(options?: CommandOptions): Promise<ReplicationInfoMap>;
  /**
   * Promote a follower to a writable leader.
   *
   * The server enforces maintenance and replication safety checks.
   */
  promoteFollower(options?: CommandOptions): Promise<'OK'>;
  /**
   * Pause follower replication streams on the current node.
   */
  pauseReplication(options?: CommandOptions): Promise<'OK'>;
  /**
   * Resume follower replication streams on the current node.
   */
  resumeReplication(options?: CommandOptions): Promise<'OK'>;
  /**
   * Read structured numeric metrics.
   */
  metrics(options?: CommandOptions): Promise<MetricsMap>;
  /**
   * Read Prometheus exposition text for scraping.
   */
  metricsProm(options?: CommandOptions): Promise<string>;
  /**
   * Start an explicit session-bound transaction.
   */
  transaction(): Promise<VaylixTransaction>;
}
