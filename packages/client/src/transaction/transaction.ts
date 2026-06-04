import { encodeKey, encodeKeyU64, encodeKeys, encodeSet } from '../commands/encoding.js';
import { ProtocolError } from '../errors/index.js';
import { opcodes } from '../protocol/opcodes.js';
import { decodeExecResults, type DecodedExecResult } from '../protocol/response.js';
import type { TransactionCommandResult, VaylixTransaction, VaylixValue, VaylixVersion } from '../types/public.js';
import { Connection } from '../net/connection.js';

type QueuedCommand =
  | { kind: 'get'; opcode: number; payload: Buffer }
  | { kind: 'set'; opcode: number; payload: Buffer }
  | { kind: 'del'; opcode: number; payload: Buffer }
  | { kind: 'exists'; opcode: number; payload: Buffer }
  | { kind: 'expire'; opcode: number; payload: Buffer }
  | { kind: 'ttl'; opcode: number; payload: Buffer }
  | { kind: 'persist'; opcode: number; payload: Buffer };

export class Transaction implements VaylixTransaction {
  private readonly queued: QueuedCommand[] = [];
  private active = false;

  public constructor(private readonly connection: Connection) {}

  public async begin(): Promise<void> {
    if (this.active) {
      return;
    }
    await this.connection.request({ opcode: opcodes.Multi, payload: Buffer.alloc(0) });
    this.active = true;
  }

  public get(key: string): this {
    this.queued.push({
      kind: 'get',
      opcode: opcodes.Get,
      payload: encodeKey(key),
    });
    return this;
  }

  public set(
    key: string,
    value: VaylixValue,
    options?: { ttlSeconds?: number; ttlMilliseconds?: number; keepTtl?: boolean; ifVersion?: VaylixVersion },
  ): this {
    this.queued.push({
      kind: 'set',
      opcode: opcodes.Set,
      payload: encodeSet(key, value, options),
    });
    return this;
  }

  public del(...keys: string[]): this {
    this.queued.push({
      kind: 'del',
      opcode: opcodes.Delete,
      payload: encodeKeys(keys),
    });
    return this;
  }

  public exists(key: string): this {
    this.queued.push({
      kind: 'exists',
      opcode: opcodes.Exists,
      payload: encodeKey(key),
    });
    return this;
  }

  public expire(key: string, seconds: number): this {
    this.queued.push({
      kind: 'expire',
      opcode: opcodes.Expire,
      payload: encodeKeyU64(key, seconds),
    });
    return this;
  }

  public ttl(key: string): this {
    this.queued.push({
      kind: 'ttl',
      opcode: opcodes.Ttl,
      payload: encodeKey(key),
    });
    return this;
  }

  public persist(key: string): this {
    this.queued.push({
      kind: 'persist',
      opcode: opcodes.Persist,
      payload: encodeKey(key),
    });
    return this;
  }

  public async exec(): Promise<TransactionCommandResult[]> {
    await this.begin();
    for (const command of this.queued) {
      await this.connection.request({ opcode: command.opcode, payload: command.payload });
    }
    const response = await this.connection.request({ opcode: opcodes.Exec, payload: Buffer.alloc(0) });
    const results = decodeExecResults(response.payload);
    if (results.length !== this.queued.length) {
      throw new RangeError(`EXEC returned ${results.length} results for ${this.queued.length} queued commands`);
    }
    const decoded = this.queued.map((command, index) => {
      const raw = results[index];
      if (raw === undefined) {
        throw new RangeError(`missing EXEC result at index ${index}`);
      }
      return decodeExecResult(command, raw);
    });
    this.queued.length = 0;
    this.active = false;
    return decoded;
  }

  public async discard(): Promise<void> {
    await this.begin();
    this.queued.length = 0;
    await this.connection.request({ opcode: opcodes.Discard, payload: Buffer.alloc(0) });
    this.active = false;
  }
}

function decodeExecResult(command: QueuedCommand, result: DecodedExecResult): TransactionCommandResult {
  switch (command.kind) {
    case 'get':
      if (result.kind === 'not_found') {
        return { status: 'NOT_FOUND', value: null };
      }
      if (result.kind === 'value') {
        return {
          status: 'OK',
          value: result.value.toString('utf8'),
          valueBytes: result.value,
        };
      }
      break;
    case 'set':
      if (result.kind === 'ok') {
        return { status: 'OK' };
      }
      if (result.kind === 'boolean') {
        return { status: 'OK', boolean: result.value };
      }
      break;
    case 'del':
      if (result.kind === 'count') {
        return { status: 'OK', integer: result.value };
      }
      break;
    case 'exists':
    case 'expire':
    case 'persist':
      if (result.kind === 'boolean') {
        return { status: 'OK', boolean: result.value };
      }
      break;
    case 'ttl':
      if (result.kind === 'integer') {
        return { status: 'OK', integer: result.value };
      }
      break;
  }

  throw new ProtocolError(
    `unexpected EXEC result for ${command.kind}: ${JSON.stringify(result)}`,
  );
}
