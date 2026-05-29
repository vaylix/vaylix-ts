import crc32 from 'crc-32';
import { FLAG_COMPRESSED_ZSTD, FLAGS_NONE, HEADER_LEN, MAGIC, VERSION } from './constants.js';
import { ProtocolError } from '../errors/index.js';
import { compressZstd, decompressZstd } from './compression.js';
import type { CompressionMode } from '../config/types.js';

export interface FrameCodecOptions {
  compression: CompressionMode;
  compressionThresholdBytes: number;
  maxFrameLen: number;
  maxDecompressedFrameLen: number;
}

export interface DecodedFrame {
  payload: Buffer;
  flags: number;
}

export async function encodeFrame(body: Buffer, options: FrameCodecOptions): Promise<Buffer> {
  if (body.length > options.maxDecompressedFrameLen) {
    throw new ProtocolError(`frame too large: ${body.length} > ${options.maxDecompressedFrameLen}`);
  }

  let flags = FLAGS_NONE;
  let payload = body;
  if (options.compression === 'zstd' && body.length >= options.compressionThresholdBytes) {
    payload = await compressZstd(body);
    flags = FLAG_COMPRESSED_ZSTD;
  }

  if (payload.length > options.maxFrameLen) {
    throw new ProtocolError(`frame too large: ${payload.length} > ${options.maxFrameLen}`);
  }

  const header = Buffer.allocUnsafe(HEADER_LEN);
  header.writeUInt32BE(MAGIC, 0);
  header.writeUInt8(VERSION, 4);
  header.writeUInt8(flags, 5);
  header.writeUInt32BE(payload.length, 6);
  header.writeUInt32BE(crc32.buf(payload) >>> 0, 10);
  return Buffer.concat([header, payload]);
}

export async function decodeFrame(frame: Buffer, options: FrameCodecOptions): Promise<DecodedFrame> {
  if (frame.length < HEADER_LEN) {
    throw new ProtocolError('truncated frame');
  }
  const magic = frame.readUInt32BE(0);
  const version = frame.readUInt8(4);
  const flags = frame.readUInt8(5);
  const length = frame.readUInt32BE(6);
  const checksum = frame.readUInt32BE(10);

  if (magic !== MAGIC) {
    throw new ProtocolError('invalid frame magic');
  }
  if (version !== VERSION) {
    throw new ProtocolError(`protocol version mismatch: expected ${VERSION}, got ${version}`);
  }
  if ((flags & ~FLAG_COMPRESSED_ZSTD) !== 0) {
    throw new ProtocolError(`unsupported frame flags: 0x${flags.toString(16)}`);
  }
  if (length > options.maxFrameLen) {
    throw new ProtocolError(`frame too large: ${length} > ${options.maxFrameLen}`);
  }
  if (frame.length !== HEADER_LEN + length) {
    throw new ProtocolError('frame length mismatch');
  }
  const payload = frame.subarray(HEADER_LEN);
  if ((crc32.buf(payload) >>> 0) !== checksum) {
    throw new ProtocolError('frame checksum mismatch');
  }

  if ((flags & FLAG_COMPRESSED_ZSTD) === 0) {
    if (payload.length > options.maxDecompressedFrameLen) {
      throw new ProtocolError(`decompressed frame too large: ${payload.length} > ${options.maxDecompressedFrameLen}`);
    }
    return { payload, flags };
  }

  const decompressed = await decompressZstd(payload);
  if (decompressed.length > options.maxDecompressedFrameLen) {
    throw new ProtocolError(
      `decompressed frame too large: ${decompressed.length} > ${options.maxDecompressedFrameLen}`,
    );
  }
  return { payload: decompressed, flags };
}
