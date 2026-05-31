import { BufferWriter } from '../internal/buffer.js';

export function encodeKey(key: string): Buffer {
  const writer = new BufferWriter();
  writer.writeString16(key);
  return writer.toBuffer();
}

export function encodeKeyValue(key: string, value: string): Buffer {
  const writer = new BufferWriter();
  writer.writeString16(key);
  writer.writeString32(value);
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

export function encodePairs(entries: Record<string, string>): Buffer {
  const writer = new BufferWriter();
  const pairs = Object.entries(entries);
  if (pairs.length > 0xffff) {
    throw new RangeError('too many key/value pairs for Vaylix transport payload');
  }
  writer.writeUInt16BE(pairs.length);
  for (const [key, value] of pairs) {
    writer.writeString16(key);
    writer.writeString32(value);
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
  value: string,
  options:
    | {
        ttlSeconds?: number;
        keepTtl?: boolean;
        onlyIfExists?: boolean;
        onlyIfMissing?: boolean;
        returnPrevious?: boolean;
        ttlMilliseconds?: number;
      }
    | undefined,
): Buffer {
  const writer = new BufferWriter();
  writer.writeString16(key);
  writer.writeString32(value);
  if (options?.onlyIfMissing && options?.onlyIfExists) {
    throw new RangeError('SET NX and XX are mutually exclusive');
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
