export type InfoMap = Record<string, string>;
export type MetricsMap = Record<string, number>;

export interface ErrorPayload {
  code: string;
  name: string;
  message: string;
}

export interface TransactionCommandResult {
  status: 'OK' | 'NOT_FOUND' | 'ERROR';
  value?: string | null;
  integer?: number;
  boolean?: boolean;
  entries?: Array<[string, string]>;
  strings?: Array<string | null>;
  error?: ErrorPayload;
}

export interface VaylixTransaction {
  get(key: string): this;
  set(key: string, value: string, options?: { ttlSeconds?: number; keepTtl?: boolean }): this;
  del(...keys: string[]): this;
  exists(key: string): this;
  expire(key: string, seconds: number): this;
  ttl(key: string): this;
  persist(key: string): this;
  exec(): Promise<TransactionCommandResult[]>;
  discard(): Promise<void>;
}
