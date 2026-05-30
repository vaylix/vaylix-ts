# Changelog

All notable changes to this repository will be documented in this file.

The format is based on Keep a Changelog and the versioning policy follows Semantic Versioning.

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
