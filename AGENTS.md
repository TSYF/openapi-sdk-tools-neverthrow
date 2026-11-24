# AGENTS.md - neverthrow

Optional neverthrow integration. Regular workspace package; not a submodule.

## Architecture

- `src/result.ts` — `NeverthrowResult` implements `ResultLike`, wraps a native `ResultAsync`; `toResultAsyncLike()` converts other `ResultLike` values.
- `src/backend.ts` — `neverthrowResultBackend`: `fromPromise` via `ResultAsync.fromPromise`, `ok`/`err` via `okAsync`/`errAsync`.
- `src/plugin.ts` — `neverthrowPlugin()` returns `{ name: "neverthrow", result: neverthrowResultBackend }`.
- `src/convert.ts` — `toResultAsync(sdkResult)`: returns the native `ResultAsync` when already neverthrow-backed; otherwise converts through `.match()`.
- `src/client.ts` — `neverthrowClient(client)`: recursive proxy converting `SdkResultAsync` returns to `ResultAsync`; binds methods to the original target; passes non-result method returns and arrays through unchanged.

`toResultAsync()` works even when the plugin is not registered. The plugin only controls result creation/chaining.

## Packaging

- Peer deps: `@openapi-sdk-tools/core` `^2.0.0`, `neverthrow` `^8.0.0`.
- Dev deps include both for local build/tests.
- Generated SDKs and core never depend on this package.
- Consumers opt in with `plugins: [neverthrowPlugin()]`.

## Verification

```bash
pnpm exec tsc --noEmit
pnpm test
```

Tests: `test/backend.test.ts` (creation, chaining, conversion) and `test/client.test.ts` (proxy behavior, binding, nested clients).
