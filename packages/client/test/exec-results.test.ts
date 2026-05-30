import assert from 'node:assert/strict';
import test from 'node:test';
import { BufferWriter } from '../src/internal/buffer.js';
import { decodeExecResults } from '../src/protocol/response.js';

test('decodeExecResults decodes structured Vaylix EXEC payloads', () => {
  const writer = new BufferWriter();
  writer.writeUInt32BE(8);

  writer.writeUInt8(0x00);
  writer.writeUInt8(0x02);
  writer.writeString32('alpha');
  writer.writeUInt8(0x03);
  writer.writeUInt8(1);
  writer.writeUInt8(0x04);
  writer.writeBigUInt64BE(7n);
  writer.writeUInt8(0x05);
  writer.writeBytes(Buffer.from('fffffffffffffffe', 'hex'));
  writer.writeUInt8(0x06);
  writer.writeUInt32BE(1);
  writer.writeString16('name');
  writer.writeString32('alice');
  writer.writeUInt8(0x07);
  writer.writeUInt32BE(2);
  writer.writeUInt8(1);
  writer.writeString32('one');
  writer.writeUInt8(0);
  writer.writeUInt8(0x08);
  writer.writeBigUInt64BE(22n);
  writer.writeUInt32BE(2);
  writer.writeString16('k1');
  writer.writeString16('k2');

  assert.deepEqual(decodeExecResults(writer.toBuffer()), [
    { kind: 'ok' },
    { kind: 'value', value: 'alpha' },
    { kind: 'boolean', value: true },
    { kind: 'count', value: 7 },
    { kind: 'integer', value: -2 },
    { kind: 'entries', value: [['name', 'alice']] },
    { kind: 'strings', value: ['one', null] },
    { kind: 'scan', value: { nextCursor: 22, keys: ['k1', 'k2'] } },
  ]);
});
