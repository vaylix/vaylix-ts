import test from 'node:test';
import assert from 'node:assert/strict';
import { createClientHello, encodeClientHello } from '../src/protocol/hello.js';

test('client hello encodes', () => {
  const payload = encodeClientHello(createClientHello({ clientName: 'test', clientVersion: '0.1.1' }));
  assert.equal(payload.readUInt8(0), 0xf0);
});
