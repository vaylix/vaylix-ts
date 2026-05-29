# Changelog

All notable changes to this repository will be documented in this file.

The format is based on Keep a Changelog and the versioning policy follows Semantic Versioning.

## [0.2.0] - 2026-05-30

### Added

- workspace layout with publishable code in `packages/client`
- internal playground app in `apps/playground`
- `@vaylix/client` package foundation targeting Vaylix protocol `0.2.x`
- direct VTP2 startup negotiation, frame, request, and response primitives
- `DATABASE_URL`-based default configuration resolution
- factory-led public API via `createClient()` and `createPool()`
- dual ESM + CJS package output with declaration files
- unit tests for config resolution, frame handling, hello encoding, request encoding, and response/error decoding
- semver validation script via `npm run version:check`

### Changed

### Notes

- this release is an SDK foundation release, not a fully integration-hardened production driver
