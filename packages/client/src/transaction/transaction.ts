import { encodeKey, encodeKeyU64, encodeKeys, encodeSet } from '../commands/encoding.js';
import { opcodes } from '../protocol/opcodes.js';
import { decodeStrings } from '../protocol/response.js';
import type { TransactionCommandResult, VaylixTransaction } from '../types/public.js';
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

  public set(key: string, value: string, options?: { ttlSeconds?: number; keepTtl?: boolean }): this {
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
    const results = decodeStrings(response.payload);
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

function decodeExecResult(command: QueuedCommand, raw: string | null): TransactionCommandResult {
  if (raw === null || raw === '(nil)') {
    return command.kind === 'get'
      ? { status: 'NOT_FOUND', value: null }
      : { status: 'NOT_FOUND' };
  }

  switch (command.kind) {
    case 'get':
      return raw === 'NOT_FOUND'
        ? { status: 'NOT_FOUND', value: null }
        : { status: 'OK', value: raw };
    case 'set':
      return { status: 'OK' };
    case 'del':
      return { status: 'OK', integer: Number.parseInt(raw, 10) };
    case 'exists':
    case 'expire':
    case 'persist':
      return { status: 'OK', boolean: raw === 'true' };
    case 'ttl':
      return { status: 'OK', integer: Number.parseInt(raw, 10) };
  }
}
