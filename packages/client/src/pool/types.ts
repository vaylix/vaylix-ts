import type { ClientConfig } from '../config/types.js';
import type { SetResult, VaylixClient } from '../client/types.js';

export interface PoolConfig {
  min?: number;
  max?: number;
  idleTimeoutMs?: number;
  acquireTimeoutMs?: number;
}

export interface VaylixPool extends Pick<VaylixClient, 'ping' | 'get' | 'del' | 'exists' | 'mget' | 'mset' | 'expire' | 'ttl' | 'persist' | 'info' | 'metrics' | 'metricsProm' | 'transaction'> {
  connect(): Promise<void>;
  close(): Promise<void>;
  acquire(): Promise<VaylixClient>;
  set(key: string, value: string, options?: Parameters<VaylixClient['set']>[2]): Promise<SetResult>;
}

export interface PoolClientConfig extends ClientConfig, PoolConfig {}
