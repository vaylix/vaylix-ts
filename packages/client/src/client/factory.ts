import type { ClientConfig } from '../config/types.js';
import type { VaylixClient } from './types.js';
import { createClientImpl } from './client.js';

export function createClient(config: ClientConfig = {}): VaylixClient {
  return createClientImpl(config);
}
