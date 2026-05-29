import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeFrame, encodeFrame } from '../src/protocol/frame.js';

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
