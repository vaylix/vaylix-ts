import { stringify } from 'uuid';
import type { CompressionMode } from '../config/types.js';
import { ProtocolError } from '../errors/index.js';
import { BufferReader, BufferWriter } from '../internal/buffer.js';
import {
  CAP_PIPELINING,
  CAP_REQUEST_DEADLINE,
  CAP_SERVER_METRICS,
  CAP_TRACE_CONTEXT,
  CAP_ZSTD,
  DEFAULT_CAPABILITIES,
  DEFAULT_MAX_FRAME_LEN,
  VERSION,
} from './constants.js';
import { responseStatus } from './status.js';

const CLIENT_HELLO = 0xf0;
const SERVER_HELLO = 0xf1;

export interface ClientHello {
  protocolVersion: number;
  clientName: string;
  clientVersion: string;
  supportedCapabilities: bigint;
  desiredCompression: CompressionMode;
  maxFrameLen: number;
  authIntent: boolean;
}

export interface ServerHello {
  protocolVersion: number;
  acceptedCapabilities: bigint;
  compression: CompressionMode;
  maxFrameLen: number;
  serverId: string;
  status: 'OK' | 'ERROR';
  errorCode?: string;
  errorName?: string;
  errorMessage?: string;
}

export const defaultHelloCapabilities =
  CAP_ZSTD | CAP_REQUEST_DEADLINE | CAP_SERVER_METRICS | CAP_PIPELINING | CAP_TRACE_CONTEXT;

export function createClientHello(input: Pick<ClientHello, 'clientName' | 'clientVersion'> & Partial<ClientHello>): ClientHello {
  return {
    protocolVersion: VERSION,
    supportedCapabilities: DEFAULT_CAPABILITIES,
    desiredCompression: 'zstd',
    maxFrameLen: DEFAULT_MAX_FRAME_LEN,
    authIntent: true,
    ...input,
  };
}

export function encodeClientHello(hello: ClientHello): Buffer {
  const writer = new BufferWriter();
  writer.writeUInt8(CLIENT_HELLO);
  writer.writeUInt8(hello.protocolVersion);
  writer.writeString16(hello.clientName);
  writer.writeString16(hello.clientVersion);
  writer.writeBigUInt64BE(hello.supportedCapabilities);
  writer.writeUInt8(hello.desiredCompression === 'zstd' ? 1 : 0);
  writer.writeUInt32BE(hello.maxFrameLen);
  writer.writeUInt8(hello.authIntent ? 1 : 0);
  return writer.toBuffer();
}

export function decodeServerHello(payload: Buffer): ServerHello {
  const reader = new BufferReader(payload);
  const marker = reader.readUInt8();
  if (marker !== SERVER_HELLO) {
    throw new ProtocolError('expected server hello');
  }
  const protocolVersion = reader.readUInt8();
  const acceptedCapabilities = reader.readBigUInt64BE();
  const compression = readCompressionMode(reader.readUInt8());
  const maxFrameLen = reader.readUInt32BE();
  const serverId = stringify(reader.readBytes(16));
  const statusByte = reader.readUInt8();
  const status = statusByte === responseStatus.Ok ? 'OK' : statusByte === responseStatus.Error ? 'ERROR' : (() => {
    throw new ProtocolError(`unknown startup status: 0x${statusByte.toString(16)}`);
  })();
  const errorCode = reader.readOptionalString();
  const errorName = reader.readOptionalString();
  const errorMessage = reader.readOptionalString();
  reader.ensureFullyRead();
  const hello: ServerHello = {
    protocolVersion,
    acceptedCapabilities,
    compression,
    maxFrameLen,
    serverId,
    status,
  };
  if (errorCode !== undefined) {
    hello.errorCode = errorCode;
  }
  if (errorName !== undefined) {
    hello.errorName = errorName;
  }
  if (errorMessage !== undefined) {
    hello.errorMessage = errorMessage;
  }
  return hello;
}

function readCompressionMode(value: number): CompressionMode {
  if (value === 0) {
    return 'none';
  }
  if (value === 1) {
    return 'zstd';
  }
  throw new ProtocolError(`unknown compression mode: ${value}`);
}
