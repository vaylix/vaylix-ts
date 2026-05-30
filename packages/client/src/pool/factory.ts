import type { PoolClientConfig, VaylixPool } from './types.js';
import { PoolImpl } from './pool.js';

/**
 * Create a round-robin pool of Vaylix client connections.
 */
export function createPool(config: PoolClientConfig = {}): VaylixPool {
  return new PoolImpl(config);
}
