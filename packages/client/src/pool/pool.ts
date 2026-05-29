import type { PoolClientConfig, VaylixPool } from './types.js';
import { createClientImpl } from '../client/client.js';
import type { VaylixClient } from '../client/types.js';
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

  public async ping(): Promise<'PONG'> { return (await this.acquire()).ping(); }
  public async get(key: string): Promise<string | null> { return (await this.acquire()).get(key); }
  public async set(
    key: string,
    value: string,
    options?: Parameters<VaylixClient['set']>[2],
  ) { return (await this.acquire()).set(key, value, options); }
  public async del(...keys: string[]): Promise<number> { return (await this.acquire()).del(...keys); }
  public async exists(key: string): Promise<boolean> { return (await this.acquire()).exists(key); }
  public async mget(keys: string[]): Promise<Array<string | null>> { return (await this.acquire()).mget(keys); }
  public async mset(entries: Record<string, string>): Promise<'OK'> { return (await this.acquire()).mset(entries); }
  public async expire(key: string, seconds: number): Promise<boolean> { return (await this.acquire()).expire(key, seconds); }
  public async ttl(key: string): Promise<number> { return (await this.acquire()).ttl(key); }
  public async persist(key: string): Promise<boolean> { return (await this.acquire()).persist(key); }
  public async info() { return (await this.acquire()).info(); }
  public async metrics() { return (await this.acquire()).metrics(); }
  public async metricsProm() { return (await this.acquire()).metricsProm(); }
  public async transaction() { return (await this.acquire()).transaction(); }
}
