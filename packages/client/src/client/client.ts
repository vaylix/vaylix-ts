import { opcodes } from '../protocol/opcodes.js';
import { encodeKey, encodeKeyU64, encodeKeys, encodeOptionalString, encodePairs, encodeSet, encodeStringPair } from '../commands/encoding.js';
import { decodeBoolean, decodeCount, decodeEntries, decodeInteger, decodeString32, decodeStrings } from '../protocol/response.js';
import type { ClientConfig } from '../config/types.js';
import type { CommandOptions, SetOptions, SetResult, VaylixClient } from './types.js';
import type {
  ClusterInfoMap,
  HealthMap,
  InfoMap,
  MetricsMap,
  ReplicationInfoMap,
  VaylixTransaction,
} from '../types/public.js';
import { Connection } from '../net/connection.js';
import { Transaction } from '../transaction/transaction.js';

export class ClientImpl implements VaylixClient {
  public constructor(private readonly connection: Connection) {}

  public async connect(): Promise<void> {
    await this.connection.connect();
  }

  public async close(): Promise<void> {
    await this.connection.close();
  }

  public async ping(options?: CommandOptions): Promise<'PONG'> {
    const response = await this.connection.request({
      opcode: opcodes.Ping,
      payload: encodeOptionalString(undefined),
      metadata: toMetadata(options),
    });
    if (response.payload.length === 0) {
      return 'PONG';
    }
    return decodeString32(response.payload) as 'PONG';
  }

  public async get(key: string, options?: CommandOptions): Promise<string | null> {
    const response = await this.connection.request({
      opcode: opcodes.Get,
      payload: encodeKey(key),
      metadata: toMetadata(options),
    });
    return response.status === 'NOT_FOUND' ? null : decodeString32(response.payload);
  }

  public async set(key: string, value: string, options?: SetOptions & CommandOptions): Promise<SetResult> {
    const response = await this.connection.request({
      opcode: opcodes.Set,
      payload: encodeSet(key, value, options),
      metadata: toMetadata(options),
    });
    if (options?.returnPrevious) {
      return response.status === 'NOT_FOUND' ? null : decodeString32(response.payload);
    }
    if (options?.onlyIfMissing || options?.onlyIfExists) {
      return decodeBoolean(response.payload);
    }
    return 'OK';
  }

  public async del(...keys: string[]): Promise<number> {
    const response = await this.connection.request({
      opcode: opcodes.Delete,
      payload: encodeKeys(keys),
    });
    return decodeCount(response.payload);
  }

  public async exists(key: string, options?: CommandOptions): Promise<boolean> {
    const response = await this.connection.request({
      opcode: opcodes.Exists,
      payload: encodeKey(key),
      metadata: toMetadata(options),
    });
    return decodeBoolean(response.payload);
  }

  public async mget(keys: string[], options?: CommandOptions): Promise<Array<string | null>> {
    const response = await this.connection.request({
      opcode: opcodes.MGet,
      payload: encodeKeys(keys),
      metadata: toMetadata(options),
    });
    return decodeStrings(response.payload);
  }

  public async mset(entries: Record<string, string>, options?: CommandOptions): Promise<'OK'> {
    await this.connection.request({
      opcode: opcodes.MSet,
      payload: encodePairs(entries),
      metadata: toMetadata(options),
    });
    return 'OK';
  }

  public async expire(key: string, seconds: number, options?: CommandOptions): Promise<boolean> {
    const response = await this.connection.request({
      opcode: opcodes.Expire,
      payload: encodeKeyU64(key, seconds),
      metadata: toMetadata(options),
    });
    return decodeBoolean(response.payload);
  }

  public async ttl(key: string, options?: CommandOptions): Promise<number> {
    const response = await this.connection.request({
      opcode: opcodes.Ttl,
      payload: encodeKey(key),
      metadata: toMetadata(options),
    });
    return decodeInteger(response.payload);
  }

  public async persist(key: string, options?: CommandOptions): Promise<boolean> {
    const response = await this.connection.request({
      opcode: opcodes.Persist,
      payload: encodeKey(key),
      metadata: toMetadata(options),
    });
    return decodeBoolean(response.payload);
  }

  public async info(options?: CommandOptions): Promise<InfoMap> {
    const response = await this.connection.request({
      opcode: opcodes.Info,
      payload: Buffer.alloc(0),
      metadata: toMetadata(options),
    });
    return Object.fromEntries(decodeEntries(response.payload));
  }

  public async health(options?: CommandOptions): Promise<HealthMap> {
    const response = await this.connection.request({
      opcode: opcodes.Health,
      payload: Buffer.alloc(0),
      metadata: toMetadata(options),
    });
    return Object.fromEntries(decodeEntries(response.payload));
  }

  public async showCluster(options?: CommandOptions): Promise<ClusterInfoMap> {
    const response = await this.connection.request({
      opcode: opcodes.ShowCluster,
      payload: Buffer.alloc(0),
      metadata: toMetadata(options),
    });
    return Object.fromEntries(decodeEntries(response.payload));
  }

  public async clusterJoin(nodeId: string, address: string, options?: CommandOptions): Promise<'OK'> {
    await this.connection.request({
      opcode: opcodes.ClusterJoin,
      payload: encodeStringPair(nodeId, address),
      metadata: toMetadata(options),
    });
    return 'OK';
  }

  public async clusterRemove(nodeId: string, options?: CommandOptions): Promise<'OK'> {
    await this.connection.request({
      opcode: opcodes.ClusterRemove,
      payload: encodeKey(nodeId),
      metadata: toMetadata(options),
    });
    return 'OK';
  }

  public async showReplication(options?: CommandOptions): Promise<ReplicationInfoMap> {
    const response = await this.connection.request({
      opcode: opcodes.ShowReplication,
      payload: Buffer.alloc(0),
      metadata: toMetadata(options),
    });
    return Object.fromEntries(decodeEntries(response.payload));
  }

  public async promoteFollower(options?: CommandOptions): Promise<'OK'> {
    await this.connection.request({
      opcode: opcodes.PromoteFollower,
      payload: Buffer.alloc(0),
      metadata: toMetadata(options),
    });
    return 'OK';
  }

  public async pauseReplication(options?: CommandOptions): Promise<'OK'> {
    await this.connection.request({
      opcode: opcodes.PauseReplication,
      payload: Buffer.alloc(0),
      metadata: toMetadata(options),
    });
    return 'OK';
  }

  public async resumeReplication(options?: CommandOptions): Promise<'OK'> {
    await this.connection.request({
      opcode: opcodes.ResumeReplication,
      payload: Buffer.alloc(0),
      metadata: toMetadata(options),
    });
    return 'OK';
  }

  public async metrics(options?: CommandOptions): Promise<MetricsMap> {
    const response = await this.connection.request({
      opcode: opcodes.Metrics,
      payload: Buffer.alloc(0),
      metadata: toMetadata(options),
    });
    return Object.fromEntries(
      decodeEntries(response.payload).map(([key, value]) => [key, Number.parseFloat(value)]),
    );
  }

  public async metricsProm(options?: CommandOptions): Promise<string> {
    const response = await this.connection.request({
      opcode: opcodes.MetricsProm,
      payload: Buffer.alloc(0),
      metadata: toMetadata(options),
    });
    return decodeString32(response.payload);
  }

  public async transaction(): Promise<VaylixTransaction> {
    await this.connection.connect();
    const transaction = new Transaction(this.connection);
    await transaction.begin();
    return transaction;
  }
}

export function createClientImpl(config: ClientConfig): ClientImpl {
  return new ClientImpl(new Connection(config));
}

function toMetadata(options: CommandOptions | undefined): { deadlineMs?: bigint; traceId?: string } {
  const metadata: { deadlineMs?: bigint; traceId?: string } = {};
  if (options?.deadlineMs !== undefined) {
    metadata.deadlineMs = BigInt(options.deadlineMs);
  }
  if (options?.traceId !== undefined) {
    metadata.traceId = options.traceId;
  }
  return metadata;
}
