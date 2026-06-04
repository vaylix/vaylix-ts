import { BufferWriter } from '../internal/buffer.js';
import type { VaylixValue, VaylixVersion } from '../types/public.js';

const MAX_U64 = (1n << 64n) - 1n;

export function encodeKey(key: string): Buffer {
  const writer = new BufferWriter();
  writer.writeString16(key);
  return writer.toBuffer();
}

export function encodeKeyValue(key: string, value: VaylixValue): Buffer {
  const writer = new BufferWriter();
  writer.writeString16(key);
  writer.writeBytes32(toValueBytes(value));
  return writer.toBuffer();
}

export function encodeStringPair(left: string, right: string): Buffer {
  const writer = new BufferWriter();
  writer.writeString16(left);
  writer.writeString16(right);
  return writer.toBuffer();
}

export function encodeKeys(keys: string[]): Buffer {
  const writer = new BufferWriter();
  if (keys.length > 0xffff) {
    throw new RangeError('too many keys for Vaylix transport payload');
  }
  writer.writeUInt16BE(keys.length);
  for (const key of keys) {
    writer.writeString16(key);
  }
  return writer.toBuffer();
}

export function encodePairs(
  entries: Record<string, VaylixValue> | Iterable<readonly [string, VaylixValue]>,
): Buffer {
  const writer = new BufferWriter();
  const pairs = normalizePairs(entries);
  if (pairs.length > 0xffff) {
    throw new RangeError('too many key/value pairs for Vaylix transport payload');
  }
  writer.writeUInt16BE(pairs.length);
  for (const [key, value] of pairs) {
    writer.writeString16(key);
    writer.writeBytes32(toValueBytes(value));
  }
  return writer.toBuffer();
}

export function encodeKeyU64(key: string, value: number): Buffer {
  const writer = new BufferWriter();
  writer.writeString16(key);
  writer.writeBigUInt64BE(BigInt(value));
  return writer.toBuffer();
}

export function encodeSet(
  key: string,
  value: VaylixValue,
  options:
    | {
        ttlSeconds?: number;
        keepTtl?: boolean;
        onlyIfExists?: boolean;
        onlyIfMissing?: boolean;
        ifVersion?: VaylixVersion;
        returnPrevious?: boolean;
        ttlMilliseconds?: number;
      }
    | undefined,
): Buffer {
  const writer = new BufferWriter();
  writer.writeString16(key);
  writer.writeBytes32(toValueBytes(value));
  if (options?.onlyIfMissing && options?.onlyIfExists) {
    throw new RangeError('SET NX and XX are mutually exclusive');
  }
  if (options?.ifVersion !== undefined && (options?.onlyIfMissing || options?.onlyIfExists)) {
    throw new RangeError('SET IF VERSION cannot be combined with NX or XX');
  }
  writer.writeUInt8(options?.onlyIfMissing ? 1 : options?.onlyIfExists ? 2 : 0);

  if (options?.keepTtl && (options?.ttlSeconds !== undefined || options?.ttlMilliseconds !== undefined)) {
    throw new RangeError('SET KEEPTTL cannot be combined with EX or PX');
  }

  if (options?.ttlSeconds !== undefined && options?.ttlMilliseconds !== undefined) {
    throw new RangeError('SET EX and PX are mutually exclusive');
  }

  if (options?.ttlSeconds !== undefined) {
    writer.writeUInt8(1);
    writer.writeBigUInt64BE(BigInt(options.ttlSeconds));
  } else if (options?.ttlMilliseconds !== undefined) {
    writer.writeUInt8(2);
    writer.writeBigUInt64BE(BigInt(options.ttlMilliseconds));
  } else {
    writer.writeUInt8(0);
  }

  writer.writeUInt8(options?.keepTtl ? 1 : 0);
  writer.writeUInt8(options?.returnPrevious ? 1 : 0);
  if (options?.ifVersion === undefined) {
    writer.writeUInt8(0);
  } else {
    writer.writeUInt8(1);
    writer.writeBigUInt64BE(normalizeU64(options.ifVersion, 'ifVersion'));
  }
  return writer.toBuffer();
}

export function encodeOptionalString(value: string | undefined): Buffer {
  const writer = new BufferWriter();
  if (value === undefined) {
    writer.writeUInt8(0);
  } else {
    writer.writeUInt8(1);
    writer.writeString32(value);
  }
  return writer.toBuffer();
}

function toValueBytes(value: VaylixValue): Uint8Array {
  return typeof value === 'string' ? Buffer.from(value, 'utf8') : value;
}

function normalizePairs(
  entries: Record<string, VaylixValue> | Iterable<readonly [string, VaylixValue]>,
): Array<readonly [string, VaylixValue]> {
  if (isIterablePairs(entries)) {
    return Array.from(entries);
  }
  return Object.entries(entries);
}

function isIterablePairs(
  value: Record<string, VaylixValue> | Iterable<readonly [string, VaylixValue]>,
): value is Iterable<readonly [string, VaylixValue]> {
  return typeof (value as Iterable<readonly [string, VaylixValue]>)[Symbol.iterator] === 'function';
}

function normalizeU64(value: VaylixVersion, field: string): bigint {
  const normalized = typeof value === 'bigint' ? value : normalizeSafeInteger(value, field);
  if (normalized < 0n || normalized > MAX_U64) {
    throw new RangeError(`${field} must fit in an unsigned 64-bit integer`);
  }
  return normalized;
}

function normalizeSafeInteger(value: number, field: string): bigint {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`${field} number must be a safe integer; use bigint for full u64 range`);
  }
  return BigInt(value);
}
