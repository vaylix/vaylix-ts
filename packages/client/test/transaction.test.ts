import assert from 'node:assert/strict';
import test from 'node:test';
import { decodeStrings } from '../src/protocol/response.js';
import { BufferWriter } from '../src/internal/buffer.js';

test('EXEC wire payload decodes as Vaylix string list contract', () => {
  const writer = new BufferWriter();
  writer.writeUInt32BE(3);
  writer.writeUInt8(1);
  writer.writeString32('OK');
  writer.writeUInt8(1);
  writer.writeString32('alpha');
  writer.writeUInt8(1);
  writer.writeString32('true');

  assert.deepEqual(decodeStrings(writer.toBuffer()), ['OK', 'alpha', 'true']);
});
