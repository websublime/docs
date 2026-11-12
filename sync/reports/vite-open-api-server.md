# vite-open-api-server: source report

Places where this project's own documentation or help text disagrees with its code at the documented ref. Under D6 they are recorded here and not fixed in the project. Pages follow the code (D2).

- **Ref:** `@websublime/vite-plugin-open-api-server@0.23.3` (`830558cd36b8`)
- **Checked:** 2026-11-12

## Open

| # | Where | The source says | The code at the ref | Page handling |
|---|---|---|---|---|
| 1 | `README.md:89,109`, `packages/server/src/types.ts:150-153` | `logger` defaults to the Vite logger | `plugin.ts:239` passes `options.logger` through unchanged; `packages/core/src/server.ts:207` falls back to `console` | not on any page yet |
| 2 | `README.md:367,378` | DevTools has a Console page (screenshot and table row) | `packages/devtools-client/src/router.ts:26-54` defines only Routes, Timeline, Models and Simulator | `vite-open-api-server/overview` follows the code (lists four views) |
| 3 | `CONTRIBUTING.md:191-199` | Example `openApiServerPlugin({ openApiPath, port: 3456 })` | `packages/server/src/index.ts:15` exports `openApiServer`; options use `spec` (`types.ts:45`) | `vite-open-api-server/overview` follows the code |
| 4 | `packages/server/README.md:52-63,151-161`, `packages/core/README.md:118-119` | Handlers return plain data or `{ status, data }` | `packages/core/src/handlers/executor.ts:89-127` requires `{ type: 'raw' \| 'status' \| 'full', … }` | `vite-open-api-server/overview` follows the code |
| 5 | `packages/core/README.md:144,164,177` | `executeSeeds(seeds, { store, faker, schemas })`, `hub.onCommand(...)`, `simulations.set(path, method, {...})` | `seeds/executor.ts:279-283` takes `(seeds, store, document, options)`; `onCommand` is a hub option (`websocket/hub.ts:76`); `set(simulation)` takes one object (`simulation/simulator.ts:68`) | not on any page yet |
| 6 | `packages/playground/README.md:51,53,63,73,121,142`; JSDoc in `core/src/handlers/define-handlers.ts:33`, `core/src/seeds/define-seeds.ts:33` | Files named `pets.handler.ts` / `pets.seed.ts` | `packages/server/src/handlers.ts:32` loads only `*.handlers.{ts,js,mjs}` (seeds: `*.seeds.*`) | `vite-open-api-server/overview` follows the code (Tip on plural suffix) |
| 7 | `packages/server/README.md:109,244`; `packages/server/src/banner.ts:100` | "API Info" at `/_api` (server info and stats) | `packages/core/src/internal-api.ts:92-352` has no `/_api` route, only `/_api/health`, `/_api/registry` and others | not on any page yet |
| 8 | `packages/server/README.md:238` | Standalone DevTools serves a placeholder page; full SPA is future work | `packages/server/scripts/copy-devtools-spa.mjs` ships the built SPA; `plugin.ts:223` serves it | not on any page yet |
| 9 | `packages/devtools-client/README.md:63` | `useWebSocket.ts` is TODO | `packages/devtools-client/src/composables/useWebSocket.ts` is implemented and exported (`composables/index.ts`) | not on any page yet |
| 10 | `packages/core/src/router/route-builder.ts:111-112` | Priority comment: handler before simulation | `route-builder.ts:270-292` checks the simulation first | not on any page yet |
| 11 | `repo.config.toml:152` | Workspace pattern `playground/*` | No root `playground/` directory; the playground is `packages/playground` | not on any page yet |

## Not reproduced at this ref

- Inventory 7.1 (config shape): at 0.23.3 the code uses top-level `spec`, `proxyPath` (default `'/api'`) and `handlersDir` (`types.ts:45-79,204-207`), matching the README; `specs[]` exists only on `next`.
- Inventory 7.2 (internal API): the README routes `README.md:503-515` match `packages/core/src/internal-api.ts:92-352`; `/_api/specs/*` exists only on `next`.
- Inventory 7.3 (Models bug): `stores/models.ts:150-287` calls `/_api/store[...]`, which the server mounts with GET, POST and DELETE.
- Inventory 7.7 (banner counts / first spec only): `plugin.ts:255-268` passes real handler and seed counts; there is one spec at this ref. The `/_api` part holds (Open #7).
- Inventory 7.8 (plan status): internal planning material, not a source contradiction; excluded under D3.
- Inventory 7.11 (two DevTools tab registrations): a documentation choice, not a contradiction.
- Inventory 7.12 (duplicated changelog entries): `packages/server/CHANGELOG.md` has 14 unique headings at this ref.
- Inventory 7.13 (README links internal files): the README links internal planning documents and keeps screenshots in an internal folder; that is a D3 exclusion, not a code contradiction.
- Inventory 7.14 (`useSpecs` not exported): no `useSpecs` exists at this ref.
