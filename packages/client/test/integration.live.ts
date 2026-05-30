import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createClient, createPool } from '../src/index.js';
import {
  AuthenticationError,
  FollowerWriteRejectedError,
  ReplicationPromotionDeniedError,
} from '../src/errors/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../..');
const databaseUrl = resolveDatabaseUrl();

test('live integration against configured Vaylix server', async (t) => {
  const client = createClient({ url: databaseUrl });
  const prefix = `sdk:test:${Date.now()}:${process.pid}`;
  const key = `${prefix}:key`;
  const missingKey = `${prefix}:missing`;
  const msetA = `${prefix}:a`;
  const msetB = `${prefix}:b`;
  const txKey = `${prefix}:tx`;
  let serverVersion = 'unknown';

  await client.connect();
  try {
    await t.test('ping', async () => {
      assert.equal(await client.ping(), 'PONG');
    });

    await t.test('get and set', async () => {
      assert.equal(await client.get(missingKey), null);
      assert.equal(await client.set(key, 'value-1'), 'OK');
      assert.equal(await client.get(key), 'value-1');
    });

    await t.test('set options', async () => {
      assert.equal(await client.set(`${prefix}:set-nx`, 'alpha', { onlyIfMissing: true }), true);
      assert.equal(await client.set(`${prefix}:set-nx`, 'bravo', { onlyIfMissing: true }), false);
      assert.equal(await client.set(key, 'value-2', { onlyIfExists: true }), true);
      assert.equal(await client.set(`${prefix}:set-xx-missing`, 'charlie', { onlyIfExists: true }), false);
      assert.equal(await client.set(key, 'value-3', { returnPrevious: true }), 'value-2');
      assert.equal(await client.get(key), 'value-3');
    });

    await t.test('mset and mget', async () => {
      assert.equal(await client.mset({ [msetA]: '1', [msetB]: '2' }), 'OK');
      assert.deepEqual(await client.mget([msetA, msetB, `${prefix}:unset`]), ['1', '2', null]);
    });

    await t.test('exists and del', async () => {
      assert.equal(await client.exists(key), true);
      assert.equal(await client.del(`${prefix}:unset`, key), 1);
      assert.equal(await client.exists(key), false);
    });

    await t.test('expire ttl persist', async () => {
      assert.equal(await client.set(`${prefix}:ttl`, 'ttl-value'), 'OK');
      assert.equal(await client.expire(`${prefix}:ttl`, 60), true);
      const ttl = await client.ttl(`${prefix}:ttl`);
      assert.equal(typeof ttl, 'number');
      assert.ok(ttl > 0, `expected positive ttl, received ${ttl}`);
      assert.equal(await client.persist(`${prefix}:ttl`), true);
      assert.equal(await client.ttl(`${prefix}:ttl`), -1);
    });

    await t.test('info metrics and metricsProm', async () => {
      const info = await client.info();
      serverVersion = info['server.version'] ?? 'unknown';
      assert.equal(info['transport.protocol_magic'], 'VTP2');

      const metrics = await client.metrics();
      assert.equal(typeof metrics['vaylix.server.request.count'], 'number');
      assert.ok(Number.isFinite(metrics['vaylix.server.request.count']));

      const prom = await client.metricsProm();
      assert.match(prom, /# HELP vaylix_server_request_count/);
      assert.match(prom, /# TYPE vaylix_server_request_count counter/);
    });

    await t.test('health and replication inspection', async () => {
      if (!supports040(serverVersion)) {
        return;
      }

      const health = await client.health();
      assert.equal(typeof health.status, 'string');
      assert.equal(typeof health.ready, 'string');
      assert.equal(typeof health.reason, 'string');
      assert.equal(typeof health.role, 'string');

      const replication = await client.showReplication();
      assert.equal(typeof replication.role, 'string');
      assert.equal(typeof replication.health, 'string');
    });

    await t.test('transaction exec', async () => {
      const tx = await client.transaction();
      tx.set(txKey, 'alpha');
      tx.get(txKey);
      tx.exists(txKey);
      const result = await tx.exec();
      assert.deepEqual(result, [
        { status: 'OK' },
        { status: 'OK', value: 'alpha' },
        { status: 'OK', boolean: true },
      ]);
      assert.equal(await client.get(txKey), 'alpha');
    });

    await t.test('transaction typed result variants', async () => {
      const ttlKey = `${prefix}:tx-ttl`;
      await client.set(ttlKey, 'ttl-live');
      const tx = await client.transaction();
      tx.exists(ttlKey);
      tx.ttl(ttlKey);
      tx.del(ttlKey);
      const result = await tx.exec();
      assert.deepEqual(result, [
        { status: 'OK', boolean: true },
        { status: 'OK', integer: -1 },
        { status: 'OK', integer: 1 },
      ]);
    });

    await t.test('transaction discard', async () => {
      const discardKey = `${prefix}:discard`;
      const tx = await client.transaction();
      tx.set(discardKey, 'should-not-commit');
      await tx.discard();
      assert.equal(await client.get(discardKey), null);
    });
  } finally {
    await client.close();
  }
});

test('pool integration', async () => {
  const pool = createPool({ url: databaseUrl, max: 2 });
  const key = `sdk:test:pool:${Date.now()}:${process.pid}`;
  await pool.connect();
  try {
    assert.equal(await pool.ping(), 'PONG');
    assert.equal(await pool.set(key, 'pool-value'), 'OK');
    assert.equal(await pool.get(key), 'pool-value');
  } finally {
    await pool.close();
  }
});

test('authentication failure maps to AuthenticationError', async () => {
  const invalidUrl = withInvalidPassword(databaseUrl);
  const client = createClient({ url: invalidUrl });
  try {
    await assert.rejects(() => client.connect(), AuthenticationError);
  } finally {
    await client.close();
  }
});

test('leader-only replication commands surface typed errors when denied', async () => {
  const client = createClient({ url: databaseUrl });
  await client.connect();
  try {
    const info = await client.info();
    if (!supports040(info['server.version'] ?? 'unknown')) {
      return;
    }
    await assert.rejects(() => client.promoteFollower(), ReplicationPromotionDeniedError);
  } finally {
    await client.close();
  }
});

test('follower write rejection is typed when a follower URL is configured', async () => {
  const followerUrl = process.env.FOLLOWER_DATABASE_URL;
  if (!followerUrl) {
    return;
  }

  const client = createClient({ url: followerUrl });
  await client.connect();
  try {
    await assert.rejects(
      () => client.set(`sdk:test:follower:${Date.now()}:${process.pid}`, 'value'),
      FollowerWriteRejectedError,
    );
  } finally {
    await client.close();
  }
});

function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const envPath = path.join(repoRoot, '.env');
  if (!existsSync(envPath)) {
    throw new Error('DATABASE_URL is not set and .env was not found');
  }

  const contents = readFileSync(envPath, 'utf8');
  for (const rawLine of contents.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#')) {
      continue;
    }
    const [key, ...rest] = line.split('=');
    if (key === 'DATABASE_URL') {
      const value = rest.join('=').trim();
      if (value !== '') {
        return value;
      }
    }
  }

  throw new Error('DATABASE_URL is not set in process.env or .env');
}

function withInvalidPassword(urlString: string): string {
  const url = new URL(urlString);
  if (url.username === '') {
    throw new Error('DATABASE_URL does not contain credentials; cannot run auth failure test');
  }
  url.password = `${url.password}-invalid`;
  return url.toString();
}

function supports040(version: string): boolean {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    return false;
  }
  const [, majorText, minorText] = match;
  const major = Number(majorText);
  const minor = Number(minorText);
  return major > 0 || minor >= 4;
}
