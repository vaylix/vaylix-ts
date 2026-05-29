import { compress, decompress, init } from '@bokuweb/zstd-wasm';
import { ProtocolError } from '../errors/index.js';

let initialized: Promise<void> | undefined;

async function ensureInit(): Promise<void> {
  initialized ??= init();
  await initialized;
}

export async function compressZstd(data: Uint8Array): Promise<Buffer> {
  await ensureInit();
  return Buffer.from(compress(data));
}

export async function decompressZstd(data: Uint8Array): Promise<Buffer> {
  await ensureInit();
  try {
    return Buffer.from(decompress(data));
  } catch (error) {
    throw new ProtocolError('zstd decompression failed', { cause: error });
  }
}
