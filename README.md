# Vaylix TypeScript SDK

Node-focused TypeScript workspace for Vaylix protocol `0.2.x`.

## Workspace Layout

- `packages/client`
  - published SDK package: `@vaylix/client`
- `apps/playground`
  - internal manual test app; not published

## Versioning

This repository uses Semantic Versioning.

- workspace version source of truth: root [package.json](./package.json)
- published package version: [packages/client/package.json](./packages/client/package.json)
- playground version is kept aligned with the workspace version for internal consistency

Validate version consistency with:

```sh
npm run version:check
```

The script enforces:

- valid semver versions for root, client, and playground
- root, client, and playground versions must match
- `apps/playground` must depend on the exact current `@vaylix/client` version

## Development

Install dependencies:

```sh
npm install
```

Build the workspace:

```sh
npm run build
```

Typecheck:

```sh
npm run check
```

Run tests:

```sh
npm run test
```

Run the playground:

```sh
npm run playground
```

The playground and default client config read `DATABASE_URL` from `.env` or the process environment.

Example:

```env
DATABASE_URL=vaylix://vaylix:vaylix@192.168.29.10:9173
```

## Package Output

`@vaylix/client` is built with:

- `tsup` for JavaScript emission
- `tsc` for declaration emission

Output characteristics:

- dual ESM + CJS
- preserved module/file structure in `dist/`
- public API exposed through factory functions only

## Current Scope

Implemented foundation:

- config and `DATABASE_URL` resolution
- startup negotiation
- frame encode/decode
- TCP/TLS connection layer
- basic string commands
- metrics/info methods
- explicit transaction object

Not yet validated end-to-end enough to claim production stability:

- full integration coverage against a live Vaylix server
- TLS/mTLS integration coverage
- maintenance-mode behavior coverage
- exhaustive transaction `EXEC` response validation
