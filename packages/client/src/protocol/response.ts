import { stringify } from 'uuid';
import { ProtocolError } from '../errors/index.js';
import { BufferReader } from '../internal/buffer.js';
import type { ErrorPayload } from '../types/public.js';
import { responseStatus } from './status.js';

export interface DecodedExecScanResult {
  nextCursor: number;
  keys: string[];
}

export type DecodedExecResult =
  | { kind: 'ok' }
  | { kind: 'not_found' }
  | { kind: 'value'; value: string }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'count'; value: number }
  | { kind: 'integer'; value: number }
  | { kind: 'entries'; value: Array<[string, string]> }
  | { kind: 'strings'; value: Array<string | null> }
  | { kind: 'scan'; value: DecodedExecScanResult };

export interface DecodedResponse {
  requestId: string;
  status: 'OK' | 'ERROR' | 'NOT_FOUND';
  payload: Buffer;
}

export function decodeResponseBody(payload: Buffer): DecodedResponse {
  const reader = new BufferReader(payload);
  const requestId = stringify(reader.readBytes(16));
  const statusByte = reader.readUInt8();
  const status =
    statusByte === responseStatus.Ok
      ? 'OK'
      : statusByte === responseStatus.Error
        ? 'ERROR'
        : statusByte === responseStatus.NotFound
          ? 'NOT_FOUND'
          : (() => {
              throw new ProtocolError(`unknown status byte: 0x${statusByte.toString(16)}`);
            })();
  const body = reader.readBytes(reader.remaining());
  return { requestId, status, payload: body };
}

export function decodeString32(payload: Buffer): string {
  const reader = new BufferReader(payload);
  const value = reader.readString32();
  reader.ensureFullyRead();
  return value;
}

export function decodeBoolean(payload: Buffer): boolean {
  if (payload.length !== 1) {
    throw new ProtocolError('invalid boolean payload');
  }
  if (payload[0] === 0) return false;
  if (payload[0] === 1) return true;
  throw new ProtocolError('invalid boolean payload');
}

export function decodeInteger(payload: Buffer): number {
  if (payload.length !== 8) {
    throw new ProtocolError('invalid integer payload');
  }
  return Number(payload.readBigInt64BE(0));
}

export function decodeCount(payload: Buffer): number {
  if (payload.length !== 8) {
    throw new ProtocolError('invalid count payload');
  }
  return Number(payload.readBigUInt64BE(0));
}

export function decodeEntries(payload: Buffer): Array<[string, string]> {
  const reader = new BufferReader(payload);
  const count = reader.readUInt32BE();
  const entries: Array<[string, string]> = [];
  for (let index = 0; index < count; index += 1) {
    entries.push([reader.readString16(), reader.readString32()]);
  }
  reader.ensureFullyRead();
  return entries;
}

export function decodeStrings(payload: Buffer): Array<string | null> {
  const reader = new BufferReader(payload);
  const count = reader.readUInt32BE();
  const values: Array<string | null> = [];
  for (let index = 0; index < count; index += 1) {
    const flag = reader.readUInt8();
    if (flag === 0) {
      values.push(null);
    } else if (flag === 1) {
      values.push(reader.readString32());
    } else {
      throw new ProtocolError('invalid optional string flag');
    }
  }
  reader.ensureFullyRead();
  return values;
}

export function decodeErrorPayload(payload: Buffer): ErrorPayload {
  const reader = new BufferReader(payload);
  const code = reader.readString16();
  const name = reader.readString16();
  const message = reader.readString32();
  reader.ensureFullyRead();
  return { code, name, message };
}

export function decodeExecResults(payload: Buffer): DecodedExecResult[] {
  const reader = new BufferReader(payload);
  const count = reader.readUInt32BE();
  const results: DecodedExecResult[] = [];
  for (let index = 0; index < count; index += 1) {
    results.push(decodeExecResult(reader));
  }
  reader.ensureFullyRead();
  return results;
}

function decodeExecResult(reader: BufferReader): DecodedExecResult {
  const kind = reader.readUInt8();
  switch (kind) {
    case 0x00:
      return { kind: 'ok' };
    case 0x01:
      return { kind: 'not_found' };
    case 0x02:
      return { kind: 'value', value: reader.readString32() };
    case 0x03: {
      const value = reader.readUInt8();
      if (value !== 0 && value !== 1) {
        throw new ProtocolError('invalid EXEC boolean payload');
      }
      return { kind: 'boolean', value: value === 1 };
    }
    case 0x04:
      return { kind: 'count', value: Number(reader.readBigUInt64BE()) };
    case 0x05:
      return { kind: 'integer', value: Number(reader.readBigInt64BE()) };
    case 0x06: {
      const count = reader.readUInt32BE();
      const entries: Array<[string, string]> = [];
      for (let index = 0; index < count; index += 1) {
        entries.push([reader.readString16(), reader.readString32()]);
      }
      return { kind: 'entries', value: entries };
    }
    case 0x07: {
      const count = reader.readUInt32BE();
      const values: Array<string | null> = [];
      for (let index = 0; index < count; index += 1) {
        const flag = reader.readUInt8();
        if (flag === 0) {
          values.push(null);
          continue;
        }
        if (flag !== 1) {
          throw new ProtocolError('invalid EXEC optional string flag');
        }
        values.push(reader.readString32());
      }
      return { kind: 'strings', value: values };
    }
    case 0x08: {
      const nextCursor = Number(reader.readBigUInt64BE());
      const count = reader.readUInt32BE();
      const keys: string[] = [];
      for (let index = 0; index < count; index += 1) {
        keys.push(reader.readString16());
      }
      return { kind: 'scan', value: { nextCursor, keys } };
    }
    default:
      throw new ProtocolError(`unknown EXEC result kind: 0x${kind.toString(16)}`);
  }
}
