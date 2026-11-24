# CLAUDE.md - neverthrow plugin

Optional neverthrow integration for `@openapi-sdk-tools/core`.

## Exports

- `neverthrowPlugin()` — `SdkPlugin` providing the neverthrow `ResultBackend`
- `neverthrowResultBackend` — raw `ResultBackend` implementation
- `NeverthrowResult` — `ResultLike` adapter wrapping a native `ResultAsync`
- `toResultAsync(result)` — converts any `SdkResultAsync` to `ResultAsync`
- `neverthrowClient(client)` — recursive typed proxy returning `ResultAsync` from generated methods
- `NeverthrowClient<T>` — mapped proxy type

## Usage

```ts
const client = new TicketResultClient({
  baseUrl: "https://api.example.com",
  plugins: [neverthrowPlugin()],
});

const native = neverthrowClient(client);
native.ticket.getAll().map(...);
```

`toResultAsync` works without the plugin: it converts through `.match()`.
The plugin only changes how results are created and chained internally.

## Dependencies

- peer: `@openapi-sdk-tools/core` `^2.0.0`, `neverthrow` `^8.0.0`
- generated SDKs do not depend on this package unless the app opts in

## Tests

```bash
pnpm test   # vitest: backend, conversion, proxy
```
