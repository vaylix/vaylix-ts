import type { PoolClientConfig, VaylixPool } from './types.js';
import { createClientImpl } from '../client/client.js';
import type { VaylixClient } from '../client/types.js';
import type { VaylixValue } from '../types/public.js';
import { ProtocolError } from '../errors/index.js';

export class PoolImpl implements VaylixPool {
  private readonly clients: VaylixClient[] = [];
  private cursor = 0;

  public constructor(private readonly config: PoolClientConfig) {}

  public async connect(): Promise<void> {
    if (this.clients.length !== 0) {
      return;
    }
    const max = this.config.max ?? 4;
    for (let index = 0; index < max; index += 1) {
      const client = createClientImpl(this.config);
      await client.connect();
      this.clients.push(client);
    }
  }

  public async close(): Promise<void> {
    await Promise.all(this.clients.map((client) => client.close()));
    this.clients.length = 0;
  }

  public async acquire(): Promise<VaylixClient> {
    await this.connect();
    const client = this.clients[this.cursor % this.clients.length];
    this.cursor += 1;
    if (!client) {
      throw new ProtocolError('pool has no available clients');
    }
    return client;
  }

  public async ping(...args: Parameters<VaylixClient['ping']>): Promise<'PONG'> { return (await this.acquire()).ping(...args); }
  public async get(...args: Parameters<VaylixClient['get']>): Promise<string | null> { return (await this.acquire()).get(...args); }
  public async getBytes(...args: Parameters<VaylixClient['getBytes']>): Promise<Buffer | null> { return (await this.acquire()).getBytes(...args); }
  public async set(
    key: string,
    value: VaylixValue,
    options?: Parameters<VaylixClient['set']>[2],
  ) { return (await this.acquire()).set(key, value, options); }
  public async setBytes(...args: Parameters<VaylixClient['setBytes']>) { return (await this.acquire()).setBytes(...args); }
  public async del(...keys: string[]): Promise<number> { return (await this.acquire()).del(...keys); }
  public async exists(...args: Parameters<VaylixClient['exists']>): Promise<boolean> { return (await this.acquire()).exists(...args); }
  public async mget(...args: Parameters<VaylixClient['mget']>): Promise<Array<string | null>> { return (await this.acquire()).mget(...args); }
  public async mgetBytes(...args: Parameters<VaylixClient['mgetBytes']>): Promise<Array<Buffer | null>> { return (await this.acquire()).mgetBytes(...args); }
  public async mset(...args: Parameters<VaylixClient['mset']>): Promise<'OK'> { return (await this.acquire()).mset(...args); }
  public async msetBytes(...args: Parameters<VaylixClient['msetBytes']>): Promise<'OK'> { return (await this.acquire()).msetBytes(...args); }
  public async expire(...args: Parameters<VaylixClient['expire']>): Promise<boolean> { return (await this.acquire()).expire(...args); }
  public async ttl(...args: Parameters<VaylixClient['ttl']>): Promise<number> { return (await this.acquire()).ttl(...args); }
  public async persist(...args: Parameters<VaylixClient['persist']>): Promise<boolean> { return (await this.acquire()).persist(...args); }
  public async info(...args: Parameters<VaylixClient['info']>) { return (await this.acquire()).info(...args); }
  public async health(...args: Parameters<VaylixClient['health']>) { return (await this.acquire()).health(...args); }
  public async showCluster(...args: Parameters<VaylixClient['showCluster']>) { return (await this.acquire()).showCluster(...args); }
  public async clusterJoin(...args: Parameters<VaylixClient['clusterJoin']>) { return (await this.acquire()).clusterJoin(...args); }
  public async clusterRemove(...args: Parameters<VaylixClient['clusterRemove']>) { return (await this.acquire()).clusterRemove(...args); }
  public async showReplication(...args: Parameters<VaylixClient['showReplication']>) { return (await this.acquire()).showReplication(...args); }
  public async promoteFollower(...args: Parameters<VaylixClient['promoteFollower']>) { return (await this.acquire()).promoteFollower(...args); }
  public async pauseReplication(...args: Parameters<VaylixClient['pauseReplication']>) { return (await this.acquire()).pauseReplication(...args); }
  public async resumeReplication(...args: Parameters<VaylixClient['resumeReplication']>) { return (await this.acquire()).resumeReplication(...args); }
  public async metrics(...args: Parameters<VaylixClient['metrics']>) { return (await this.acquire()).metrics(...args); }
  public async metricsProm(...args: Parameters<VaylixClient['metricsProm']>) { return (await this.acquire()).metricsProm(...args); }
  public async transaction() { return (await this.acquire()).transaction(); }
}
