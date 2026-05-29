import type { PoolClientConfig, VaylixPool } from './types.js';
import { PoolImpl } from './pool.js';

export function createPool(config: PoolClientConfig = {}): VaylixPool {
  return new PoolImpl(config);
}
