export const MAGIC_BYTES = Buffer.from('VTP2', 'ascii');
export const MAGIC = MAGIC_BYTES.readUInt32BE(0);
export const VERSION = 2;
export const FLAG_COMPRESSED_ZSTD = 0x01;
export const FLAGS_NONE = 0x00;
export const HEADER_LEN = 14;
export const DEFAULT_MAX_FRAME_LEN = 8 * 1024 * 1024;

export const CAP_ZSTD = 1n << 0n;
export const CAP_REQUEST_DEADLINE = 1n << 1n;
export const CAP_SERVER_METRICS = 1n << 2n;
export const CAP_PIPELINING = 1n << 3n;
export const CAP_TRACE_CONTEXT = 1n << 4n;

export const DEFAULT_CAPABILITIES =
  CAP_ZSTD |
  CAP_REQUEST_DEADLINE |
  CAP_SERVER_METRICS |
  CAP_PIPELINING |
  CAP_TRACE_CONTEXT;
