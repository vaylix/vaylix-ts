import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AuthenticationError,
  AuthorizationError,
  FollowerWriteRejectedError,
  RemoteCommandError,
  ReplicationAckTimeoutError,
  ReplicationAckUnavailableError,
  ReplicationPromotionDeniedError,
} from '../src/errors/index.js';
import { classifyRemoteError } from '../src/net/connection.js';

test('classifyRemoteError maps authentication and authorization failures', () => {
  assert.ok(
    classifyRemoteError({
      code: 'SRV-008',
      name: 'Authentication Failed',
      message: 'bad credentials',
    }) instanceof AuthenticationError,
  );

  assert.ok(
    classifyRemoteError({
      code: 'SRV-017',
      name: 'Permission Denied',
      message: 'not allowed',
    }) instanceof AuthorizationError,
  );
});

test('classifyRemoteError maps replication failures', () => {
  assert.ok(
    classifyRemoteError({
      code: 'SRV-035',
      name: 'Replication Acknowledgement Timeout',
      message: 'timed out waiting for followers',
    }) instanceof ReplicationAckTimeoutError,
  );

  assert.ok(
    classifyRemoteError({
      code: 'SRV-036',
      name: 'Replication Acknowledgement Unavailable',
      message: 'no eligible followers',
    }) instanceof ReplicationAckUnavailableError,
  );

  assert.ok(
    classifyRemoteError({
      code: 'SRV-037',
      name: 'Follower Write Rejected',
      message: 'writes are leader-only',
    }) instanceof FollowerWriteRejectedError,
  );

  assert.ok(
    classifyRemoteError({
      code: 'SRV-038',
      name: 'Replication Promotion Denied',
      message: 'maintenance mode required',
    }) instanceof ReplicationPromotionDeniedError,
  );
});

test('classifyRemoteError falls back to RemoteCommandError', () => {
  const error = classifyRemoteError({
    code: 'SRV-999',
    name: 'Unknown Server Error',
    message: 'unexpected',
  });

  assert.ok(error instanceof RemoteCommandError);
  assert.equal((error as RemoteCommandError).code, 'SRV-999');
});
