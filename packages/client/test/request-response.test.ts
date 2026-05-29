import assert from 'node:assert/strict';
import test from 'node:test';
import { stringify } from 'uuid';
import { ProtocolError, RemoteCommandError } from '../src/errors/index.js';
import { BufferWriter } from '../src/internal/buffer.js';
import { encodeKeys, encodeOptionalString, encodePairs, encodeSet } from '../src/commands/encoding.js';
import { encodeRequestBody } from '../src/protocol/request.js';
import { decodeErrorPayload, decodeResponseBody } from '../src/protocol/response.js';
import { responseStatus } from '../src/protocol/status.js';

test('encodeRequestBody preserves metadata flags and request id', () => {
  const requestId = '018f0f6f-758d-70c9-b2de-2b9f1cb3c111';
  const traceId = '018f0f6f-758d-70c9-b2de-2b9f1cb3c222';
  const encoded = encodeRequestBody({
    requestId,
    opcode: 0x09,
    metadata: {
      deadlineMs: 50n,
      traceId,
      sequence: 9n,
    },
    payload: Buffer.from('payload'),
  });

  assert.equal(encoded.readUInt8(0), 0x07);
  assert.equal(stringify(encoded.subarray(1, 17)), requestId);
  assert.equal(encoded.readUInt8(17), 0x09);
  assert.equal(encoded.readBigUInt64BE(18), 50n);
  assert.equal(stringify(encoded.subarray(26, 42)), traceId);
  assert.equal(encoded.readBigUInt64BE(42), 9n);
  assert.equal(encoded.subarray(50).toString('utf8'), 'payload');
});

test('decodeResponseBody decodes ok responses', () => {
  const writer = new BufferWriter();
  const requestId = '018f0f6f-758d-70c9-b2de-2b9f1cb3c333';
  writer.writeBytes(Buffer.from(requestId.replaceAll('-', ''), 'hex'));
  writer.writeUInt8(responseStatus.Ok);
  writer.writeBytes(Buffer.from('ok-body'));

  const decoded = decodeResponseBody(writer.toBuffer());
  assert.equal(decoded.requestId, requestId);
  assert.equal(decoded.status, 'OK');
  assert.equal(decoded.payload.toString('utf8'), 'ok-body');
});

test('decodeResponseBody rejects unknown status bytes', () => {
  const writer = new BufferWriter();
  writer.writeBytes(Buffer.alloc(16));
  writer.writeUInt8(0xff);

  assert.throws(() => decodeResponseBody(writer.toBuffer()), ProtocolError);
});

test('decodeErrorPayload decodes structured server errors', () => {
  const writer = new BufferWriter();
  writer.writeString16('AUTH_INVALID_CREDENTIALS');
  writer.writeString16('AuthenticationFailed');
  writer.writeString32('invalid credentials');

  assert.deepEqual(decodeErrorPayload(writer.toBuffer()), {
    code: 'AUTH_INVALID_CREDENTIALS',
    name: 'AuthenticationFailed',
    message: 'invalid credentials',
  });
});

test('RemoteCommandError exposes structured payload', () => {
  const error = new RemoteCommandError('ERROR', {
    code: 'AUTH_INVALID_CREDENTIALS',
    name: 'AuthenticationFailed',
    message: 'invalid credentials',
  });

  assert.equal(error.code, 'AUTH_INVALID_CREDENTIALS');
  assert.equal(error.payload.name, 'AuthenticationFailed');
  assert.match(error.message, /invalid credentials/);
});

test('encodeOptionalString uses the Vaylix optional-string wire format', () => {
  assert.deepEqual(encodeOptionalString(undefined), Buffer.from([0]));

  const encoded = encodeOptionalString('hello');
  assert.equal(encoded.readUInt8(0), 1);
  assert.equal(encoded.readUInt32BE(1), 5);
  assert.equal(encoded.subarray(5).toString('utf8'), 'hello');
});

test('encodeKeys and encodePairs use u16 collection counts', () => {
  const keys = encodeKeys(['alpha', 'beta']);
  assert.equal(keys.readUInt16BE(0), 2);

  const pairs = encodePairs({ alpha: '1', beta: '2' });
  assert.equal(pairs.readUInt16BE(0), 2);
});

test('encodeSet matches the Rust transport wire layout', () => {
  const encoded = encodeSet('alpha', 'bravo', {
    ttlSeconds: 60,
    keepTtl: false,
    returnPrevious: true,
    onlyIfMissing: true,
  });

  let offset = 0;
  assert.equal(encoded.readUInt16BE(offset), 5);
  offset += 2;
  assert.equal(encoded.subarray(offset, offset + 5).toString('utf8'), 'alpha');
  offset += 5;
  assert.equal(encoded.readUInt32BE(offset), 5);
  offset += 4;
  assert.equal(encoded.subarray(offset, offset + 5).toString('utf8'), 'bravo');
  offset += 5;
  assert.equal(encoded.readUInt8(offset), 1);
  offset += 1;
  assert.equal(encoded.readUInt8(offset), 1);
  offset += 1;
  assert.equal(encoded.readBigUInt64BE(offset), 60n);
  offset += 8;
  assert.equal(encoded.readUInt8(offset), 0);
  offset += 1;
  assert.equal(encoded.readUInt8(offset), 1);
  offset += 1;
  assert.equal(offset, encoded.length);
});
