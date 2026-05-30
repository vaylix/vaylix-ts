import type { ClientConfig } from '../config/types.js';
import type { SetResult, VaylixClient } from '../client/types.js';

/**
 * Connection-pool sizing and timing controls.
 */
export interface PoolConfig {
  min?: number;
  max?: number;
  idleTimeoutMs?: number;
  acquireTimeoutMs?: number;
}

/**
 * Round-robin pool facade over multiple `VaylixClient` connections.
 */
export interface VaylixPool extends Pick<VaylixClient, 'ping' | 'get' | 'del' | 'exists' | 'mget' | 'mset' | 'expire' | 'ttl' | 'persist' | 'info' | 'health' | 'showReplication' | 'promoteFollower' | 'pauseReplication' | 'resumeReplication' | 'metrics' | 'metricsProm' | 'transaction'> {
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
