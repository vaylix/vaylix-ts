import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveClientConfig } from '../src/config/resolve.js';

test('resolveClientConfig reads DATABASE_URL when no explicit url is provided', () => {
  process.env.DATABASE_URL = 'vaylix://alice:secret@db.internal:9180?ssl=true&compression=none';
  try {
    const resolved = resolveClientConfig();
    assert.equal(resolved.databaseUrl, process.env.DATABASE_URL);
    assert.equal(resolved.host, 'db.internal');
    assert.equal(resolved.port, 9180);
    assert.equal(resolved.username, 'alice');
    assert.equal(resolved.password, 'secret');
    assert.equal(resolved.compression, 'none');
    assert.equal(resolved.tls.enabled, true);
    assert.equal(resolved.tls.servername, 'db.internal');
  } finally {
    delete process.env.DATABASE_URL;
  }
});

test('explicit config overrides DATABASE_URL fields', () => {
  process.env.DATABASE_URL = 'vaylix://alice:secret@db.internal:9180?ssl=true&compression=none';
  try {
    const resolved = resolveClientConfig({
      host: '127.0.0.1',
      port: 9173,
      username: 'root',
      password: 'override',
      compression: 'zstd',
      tls: false,
    });
    assert.equal(resolved.host, '127.0.0.1');
    assert.equal(resolved.port, 9173);
    assert.equal(resolved.username, 'root');
    assert.equal(resolved.password, 'override');
    assert.equal(resolved.compression, 'zstd');
    assert.equal(resolved.tls.enabled, false);
  } finally {
    delete process.env.DATABASE_URL;
  }
});

test('resolveClientConfig rejects unsupported url protocol', () => {
  assert.throws(
    () => resolveClientConfig({ url: 'postgres://user:pass@localhost:5432/db' }),
    /unsupported DATABASE_URL protocol/,
  );
});
