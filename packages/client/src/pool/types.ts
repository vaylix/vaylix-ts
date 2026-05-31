import type { ClientConfig } from '../config/types.js';
import type { SetResult, VaylixClient } from '../client/types.js';

/**
 * Connection-pool sizing and timing controls accepted by `createPool()`.
 */
export interface PoolConfig {
  /**
   * Minimum idle connection count reserved for future pool warmup behavior.
   */
  min?: number;
  /**
   * Maximum number of client connections opened by the pool.
   */
  max?: number;
  /**
   * Idle close threshold in milliseconds, reserved for future pool trimming.
   */
  idleTimeoutMs?: number;
  /**
   * Maximum time to wait for a pooled connection, reserved for future bounded acquisition.
   */
  acquireTimeoutMs?: number;
}

/**
 * Round-robin pool facade over multiple `VaylixClient` connections.
 */
export interface VaylixPool extends Pick<VaylixClient, 'ping' | 'get' | 'del' | 'exists' | 'mget' | 'mset' | 'expire' | 'ttl' | 'persist' | 'info' | 'health' | 'showCluster' | 'clusterJoin' | 'clusterRemove' | 'showReplication' | 'promoteFollower' | 'pauseReplication' | 'resumeReplication' | 'metrics' | 'metricsProm' | 'transaction'> {
  /**
   * Open all configured pooled connections.
   */
  connect(): Promise<void>;
  /**
   * Close all pooled connections.
   */
  close(): Promise<void>;
  /**
   * Acquire a concrete client from the pool.
   */
  acquire(): Promise<VaylixClient>;
  /**
   * Pool-aware `SET` convenience method.
   */
  set(key: string, value: string, options?: Parameters<VaylixClient['set']>[2]): Promise<SetResult>;
}

/**
 * Combined client and pool configuration accepted by `createPool()`.
 */
export interface PoolClientConfig extends ClientConfig, PoolConfig {}
