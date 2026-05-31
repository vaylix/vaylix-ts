# `@vaylix/client`

Official TypeScript client for Vaylix.

## Install

```sh
npm install @vaylix/client
```

## Runtime

- Node.js only
- Node.js `>= 20.19.0`
- ESM and CommonJS supported
- speaks the Vaylix wire protocol directly over TCP/TLS
- zstd compression uses a native Node addon with prebuilt binaries

This package reads `process.env.DATABASE_URL` when no explicit `url` is provided.
It does **not** load `.env` files by itself.

If your app uses `.env`, load it in the application entrypoint:

```ts
import 'dotenv/config';
import { createClient } from '@vaylix/client';
```

## Connection

### Explicit URL

```ts
import { createClient } from '@vaylix/client';

const client = createClient({
  url: 'vaylix://vaylix:vaylix@127.0.0.1:9173',
});

await client.connect();
```

### `DATABASE_URL`

```env
DATABASE_URL=vaylix://vaylix:vaylix@127.0.0.1:9173
```

```ts
import { createClient } from '@vaylix/client';

const client = createClient();
await client.connect();
```

### TLS

```ts
import { createClient } from '@vaylix/client';

const client = createClient({
  url: 'vaylix://user:password@db.example.com:9173?ssl=true',
  tls: {
    enabled: true,
    caFile: '/path/to/ca.pem',
    certFile: '/path/to/client.crt',
    keyFile: '/path/to/client.key',
  },
});
```

## Basic Usage

```ts
import { createClient } from '@vaylix/client';

const client = createClient({
  url: 'vaylix://vaylix:vaylix@127.0.0.1:9173',
});

await client.connect();

try {
  await client.set('app:greeting', 'hello');
  const value = await client.get('app:greeting');
  console.log(value); // "hello"
} finally {
  await client.close();
}
```

## Supported Operations

### Ping

```ts
await client.ping(); // "PONG"
```

### Get / Set

```ts
await client.set('user:1', 'alice'); // "OK"
await client.get('user:1'); // "alice"
await client.get('user:missing'); // null
```

### `SET` options

```ts
await client.set('key', 'value', { onlyIfMissing: true }); // boolean
await client.set('key', 'value', { onlyIfExists: true }); // boolean
await client.set('key', 'next', { returnPrevious: true }); // previous value or null
await client.set('key', 'value', { ttlSeconds: 60 }); // "OK"
await client.set('key', 'value', { ttlMilliseconds: 5000 }); // "OK"
await client.set('key', 'value', { keepTtl: true }); // "OK"
```

### Batch operations

```ts
await client.mset({
  'user:1': 'alice',
  'user:2': 'bob',
});

const values = await client.mget(['user:1', 'user:2', 'user:3']);
// ["alice", "bob", null]
```

### Existence and deletion

```ts
await client.exists('user:1'); // true | false
await client.del('user:1', 'user:2'); // number of removed keys
```

### Expiration

```ts
await client.expire('session:1', 60); // true | false
await client.ttl('session:1'); // integer TTL semantics from server
await client.persist('session:1'); // true | false
```

### Info and metrics

```ts
const info = await client.info();
const health = await client.health();
const cluster = await client.showCluster();
const replication = await client.showReplication();
const metrics = await client.metrics();
const prom = await client.metricsProm();
```

`info()` returns `Record<string, string>`.

`health()` returns `Record<string, string>`.

`showCluster()` returns `Record<string, string>`.

`showReplication()` returns `Record<string, string>`.

`metrics()` returns `Record<string, number>`.

`metricsProm()` returns Prometheus exposition text.

### Replication and health operations

```ts
const health = await client.health();
const cluster = await client.showCluster();
const replication = await client.showReplication();
```

Vaylix v0.5.0 cluster membership commands:

```ts
await client.clusterJoin('node-2', 'node-2.internal:9173');
await client.clusterRemove('node-2');
```

Leader-only and operator replication commands:

```ts
await client.promoteFollower();
await client.pauseReplication();
await client.resumeReplication();
```

These commands are intended for operator workflows. The server may reject them
when the current node role or safety conditions do not allow the operation.
Followers may serve stale reads; route reads to the current leader when your
application requires linearizable read-after-write behavior.

## Transactions

Transactions are explicit.

```ts
const tx = await client.transaction();

tx.set('tx:key', 'alpha');
tx.get('tx:key');
tx.exists('tx:key');

const result = await tx.exec();
```

Example result:

```ts
[
  { status: 'OK' },
  { status: 'OK', value: 'alpha' },
  { status: 'OK', boolean: true },
];
```

Discarding a transaction:

```ts
const tx = await client.transaction();
tx.set('tx:key', 'value');
await tx.discard();
```

## Pooling

```ts
import { createPool } from '@vaylix/client';

const pool = createPool({
  url: 'vaylix://vaylix:vaylix@127.0.0.1:9173',
  max: 4,
});

await pool.connect();

try {
  await pool.set('pool:key', 'value');
  console.log(await pool.get('pool:key'));
} finally {
  await pool.close();
}
```

## Errors

The client exports typed errors:

- `VaylixError`
- `ConnectionError`
- `TimeoutError`
- `ProtocolError`
- `AuthenticationError`
- `AuthorizationError`
- `ReplicationAckTimeoutError`
- `ReplicationAckUnavailableError`
- `FollowerWriteRejectedError`
- `ReplicationPromotionDeniedError`
- `RemoteCommandError`

Example:

```ts
import { AuthenticationError, createClient } from '@vaylix/client';

const client = createClient({
  url: 'vaylix://user:wrong-password@127.0.0.1:9173',
});

try {
  await client.connect();
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('authentication failed');
  }
}
```

## Configuration

Supported client config fields:

- `url`
- `host`
- `port`
- `username`
- `password`
- `tls`
- `compression`
- `connectTimeoutMs`
- `requestTimeoutMs`
- `maxFrameSize`
- `clientName`
- `clientVersion`
- `logger`

## Notes

- This package is application-facing. It is not a wrapper around the Rust CLI.
- The library reads `process.env.DATABASE_URL` if present, but environment bootstrapping remains the application’s responsibility.
- Compatibility details for specific releases belong in the changelog and release notes, not in this README.
