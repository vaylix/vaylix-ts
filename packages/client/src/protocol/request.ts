import { parse } from 'uuid';
import { BufferWriter } from '../internal/buffer.js';

export interface RequestMetadata {
  deadlineMs?: bigint;
  traceId?: string;
  sequence?: bigint;
}

export interface EncodedRequest {
  requestId: string;
  opcode: number;
  metadata: RequestMetadata;
  payload: Buffer;
}

export function encodeRequestBody(request: EncodedRequest): Buffer {
  const writer = new BufferWriter();
  let metadataFlags = 0;
  if (request.metadata.deadlineMs !== undefined) metadataFlags |= 0x01;
  if (request.metadata.traceId !== undefined) metadataFlags |= 0x02;
  if (request.metadata.sequence !== undefined) metadataFlags |= 0x04;
  writer.writeUInt8(metadataFlags);
  writer.writeBytes(parse(request.requestId));
  writer.writeUInt8(request.opcode);
  if (request.metadata.deadlineMs !== undefined) writer.writeBigUInt64BE(request.metadata.deadlineMs);
  if (request.metadata.traceId !== undefined) writer.writeBytes(parse(request.metadata.traceId));
  if (request.metadata.sequence !== undefined) writer.writeBigUInt64BE(request.metadata.sequence);
  writer.writeBytes(request.payload);
  return writer.toBuffer();
}
