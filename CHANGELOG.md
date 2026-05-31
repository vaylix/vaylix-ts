# Changelog

All notable changes to this repository will be documented in this file.

The format is based on Keep a Changelog and the versioning policy follows Semantic Versioning.

## [0.3.0] - 2026-05-31

### Added

- added Vaylix `0.5.0` server awareness to `@vaylix/client`
- added `showCluster()` for cluster term, leader, quorum, sync policy, and member diagnostics
- added `clusterJoin()` and `clusterRemove()` operator methods for v0.5.0 cluster membership commands
- added public `ClusterInfoMap` type export
- added opcode compatibility tests for the v0.5.0 cluster and replication command range
- expanded JSDoc coverage for public configuration, `SET` options, cluster operations, and transaction result fields

### Changed

- bumped the workspace, client package, and playground package versions to `0.3.0`
- corrected replication command opcodes to match the v0.5.0 Rust transport surface
- updated live integration coverage to verify `health()`, `showCluster()`, and `showReplication()` against a v0.5.0 server

## [0.2.0] - 2026-05-30

### Added

- added `0.4.0` server awareness to `@vaylix/client`
- added `health()` and `showReplication()` inspection methods
- added `promoteFollower()`, `pauseReplication()`, and `resumeReplication()` operational methods
- added typed replication error classes for follower write rejection, acknowledgement failures, and promotion denial
- added JSDoc across the public API surface for editor and generated type-hint documentation

### Changed

- bumped the default client version string to `0.2.0`
- aligned live integration coverage with a Vaylix `0.4.0` server
- corrected request timeout failures to throw `TimeoutError` instead of `ProtocolError`
- normalized pool method signatures so optional command metadata remains available through the pool facade

## [0.1.2] - 2026-05-30

### Changed

- replaced `@bokuweb/zstd-wasm` with the Node-native `@mongodb-js/zstd` binding
- documented Node `>= 20.19.0` as the required runtime floor for native zstd support

## [0.1.1] - 2026-05-30

### Changed

- bumped the package version to `0.1.1` for the GitHub Actions release path
- kept the SDK surface unchanged from `0.1.0`

## [0.1.0] - 2026-05-30

### Added

- workspace layout with publishable code in `packages/client`
- internal playground app in `apps/playground`
- `@vaylix/client` package foundation targeting Vaylix protocol `0.3.x`
- direct VTP2 startup negotiation, frame, request, and response primitives
- `DATABASE_URL`-based default configuration resolution
- factory-led public API via `createClient()` and `createPool()`
- dual ESM + CJS package output with declaration files
- unit tests for config resolution, frame handling, hello encoding, request encoding, and response/error decoding
- live integration coverage for the current SDK command surface against a Vaylix `0.3.0` server
- semver validation script via `npm run version:check`

### Changed

- `EXEC` decoding now follows Vaylix `0.3.x` structured transaction result payloads instead of the older stringified response shape
- `.env` loading moved out of the library and into the playground application
- package metadata and publish flow were prepared for npm release with provenance

### Notes

- this is the first npm package release for `@vaylix/client`
