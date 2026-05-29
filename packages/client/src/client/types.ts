import type { InfoMap, MetricsMap, VaylixTransaction } from '../types/public.js';

export interface CommandOptions {
  deadlineMs?: number;
  traceId?: string;
}

export interface SetOptions {
  ttlSeconds?: number;
  ttlMilliseconds?: number;
  keepTtl?: boolean;
  onlyIfMissing?: boolean;
  onlyIfExists?: boolean;
  returnPrevious?: boolean;
}

export type SetResult = 'OK' | boolean | string | null;

export interface VaylixClient {
  connect(): Promise<void>;
  close(): Promise<void>;
  ping(options?: CommandOptions): Promise<'PONG'>;
  get(key: string, options?: CommandOptions): Promise<string | null>;
  set(key: string, value: string, options?: SetOptions & CommandOptions): Promise<SetResult>;
  del(...keys: string[]): Promise<number>;
  exists(key: string, options?: CommandOptions): Promise<boolean>;
  mget(keys: string[], options?: CommandOptions): Promise<Array<string | null>>;
  mset(entries: Record<string, string>, options?: CommandOptions): Promise<'OK'>;
  expire(key: string, seconds: number, options?: CommandOptions): Promise<boolean>;
  ttl(key: string, options?: CommandOptions): Promise<number>;
  persist(key: string, options?: CommandOptions): Promise<boolean>;
  info(options?: CommandOptions): Promise<InfoMap>;
  metrics(options?: CommandOptions): Promise<MetricsMap>;
  metricsProm(options?: CommandOptions): Promise<string>;
  transaction(): Promise<VaylixTransaction>;
}
