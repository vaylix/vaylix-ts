import assert from 'node:assert/strict';
import test from 'node:test';
import { createClient, createPool } from '../src/index.js';

test('public factories expose current server-aware operations', () => {
  const client = createClient({ url: 'vaylix://user:pass@127.0.0.1:9173' });
  assert.equal(typeof client.getBytes, 'function');
  assert.equal(typeof client.setBytes, 'function');
  assert.equal(typeof client.mgetBytes, 'function');
  assert.equal(typeof client.msetBytes, 'function');
  assert.equal(typeof client.health, 'function');
  assert.equal(typeof client.showCluster, 'function');
  assert.equal(typeof client.clusterJoin, 'function');
  assert.equal(typeof client.clusterRemove, 'function');
  assert.equal(typeof client.showReplication, 'function');
  assert.equal(typeof client.promoteFollower, 'function');
  assert.equal(typeof client.pauseReplication, 'function');
  assert.equal(typeof client.resumeReplication, 'function');

  const pool = createPool({ url: 'vaylix://user:pass@127.0.0.1:9173' });
  assert.equal(typeof pool.getBytes, 'function');
  assert.equal(typeof pool.setBytes, 'function');
  assert.equal(typeof pool.mgetBytes, 'function');
  assert.equal(typeof pool.msetBytes, 'function');
  assert.equal(typeof pool.health, 'function');
  assert.equal(typeof pool.showCluster, 'function');
  assert.equal(typeof pool.clusterJoin, 'function');
  assert.equal(typeof pool.clusterRemove, 'function');
  assert.equal(typeof pool.showReplication, 'function');
  assert.equal(typeof pool.promoteFollower, 'function');
  assert.equal(typeof pool.pauseReplication, 'function');
  assert.equal(typeof pool.resumeReplication, 'function');
});
