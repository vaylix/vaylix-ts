import { compress, decompress } from '@mongodb-js/zstd';
import { ProtocolError } from '../errors/index.js';

export async function compressZstd(data: Uint8Array): Promise<Buffer> {
  return compress(Buffer.from(data), 3);
}

export async function decompressZstd(data: Uint8Array): Promise<Buffer> {
  try {
    return await decompress(Buffer.from(data));
  } catch (error) {
    throw new ProtocolError('zstd decompression failed', { cause: error });
  }
}
