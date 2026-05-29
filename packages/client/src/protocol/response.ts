import { stringify } from 'uuid';
import { ProtocolError } from '../errors/index.js';
import { BufferReader } from '../internal/buffer.js';
import type { ErrorPayload } from '../types/public.js';
import { responseStatus } from './status.js';

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
