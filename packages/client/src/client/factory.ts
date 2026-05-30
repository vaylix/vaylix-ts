import type { ClientConfig } from '../config/types.js';
import type { VaylixClient } from './types.js';
import { createClientImpl } from './client.js';

/**
 * Create a Vaylix client.
 *
 * Pass an explicit `url` or rely on `process.env.DATABASE_URL`. The connection
 * is lazy until `connect()` or the first command.
 */
export function createClient(config: ClientConfig = {}): VaylixClient {
  return createClientImpl(config);
}
