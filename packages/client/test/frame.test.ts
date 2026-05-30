import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeFrame, encodeFrame } from '../src/protocol/frame.js';
import { ProtocolError } from '../src/errors/index.js';
import crc32 from 'crc-32';

test('frame round trip without compression', async () => {
  const payload = Buffer.from('hello');
  const frame = await encodeFrame(payload, {
    compression: 'none',
    compressionThresholdBytes: 0,
    maxFrameLen: 1024,
    maxDecompressedFrameLen: 1024,
  });
  const decoded = await decodeFrame(frame, {
    compression: 'none',
    compressionThresholdBytes: 0,
    maxFrameLen: 1024,
    maxDecompressedFrameLen: 1024,
  });
  assert.deepEqual(decoded.payload, payload);
});

test('frame round trip with zstd compression', async () => {
  const payload = Buffer.from('hello hello hello hello hello hello hello');
  const frame = await encodeFrame(payload, {
    compression: 'zstd',
    compressionThresholdBytes: 0,
    maxFrameLen: 1024,
    maxDecompressedFrameLen: 1024,
  });
  const decoded = await decodeFrame(frame, {
    compression: 'zstd',
    compressionThresholdBytes: 0,
    maxFrameLen: 1024,
    maxDecompressedFrameLen: 1024,
  });
  assert.deepEqual(decoded.payload, payload);
});

test('decodeFrame wraps zstd decompression failure as ProtocolError', async () => {
  const corruptedPayload = Buffer.from([0, 0, 0, 0]);
  const corruptedCompressedFrame = Buffer.alloc(14 + corruptedPayload.length);
  corruptedCompressedFrame.writeUInt32BE(Buffer.from('VTP2', 'ascii').readUInt32BE(0), 0);
  corruptedCompressedFrame.writeUInt8(2, 4);
  corruptedCompressedFrame.writeUInt8(0x01, 5);
  corruptedCompressedFrame.writeUInt32BE(corruptedPayload.length, 6);
  corruptedCompressedFrame.writeUInt32BE(crc32.buf(corruptedPayload) >>> 0, 10);
  corruptedPayload.copy(corruptedCompressedFrame, 14);

  await assert.rejects(
    () =>
      decodeFrame(corruptedCompressedFrame, {
        compression: 'zstd',
        compressionThresholdBytes: 0,
        maxFrameLen: 1024,
        maxDecompressedFrameLen: 1024,
      }),
    ProtocolError,
  );
});
