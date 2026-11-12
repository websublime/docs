> **Snapshot.** Inventory written on 2026-11-12 by reading the local checkout (`../vite-open-api-server`), files only; nothing was built or run. The refs that are documented come from D5 and `sync/registry.yaml`. Section 7 is the first input to `sync/reports/vite-open-api-server.md` (D6).

# vite-open-api-server: documentation inventory

**Main points**
- **The written docs describe the old single-spec setup.** The `next` branch, which is checked out (`.git/HEAD`), runs the v1.0 multi-spec plugin, configured as `openApiServer({ specs: SpecConfig[] … })`. All four READMEs still describe the 0.x setup (`spec`/`proxyPath`/`handlersDir` at the top level). Treat the code as the source of truth, not the READMEs.
- **The published versions are prereleases.** The plugin is `0.24.0-next.16`, the latest stable is `0.23.1` (single-spec). The `next` branch publishes to npm under the `next` dist-tag (`.github/workflows/release.yml`).
- **There is no CLI, no MCP server and no OpenAPI spec for the plugin's own endpoints.** The surface users touch is: plugin options, `defineHandlers`/`defineSeeds`, the Store API, the `/_api` HTTP endpoints, the `/_ws` WebSocket protocol, and the DevTools web app.

---

## 1. Identity

| Field | Value |
|---|---|
| Purpose | A Vite plugin that runs a local mock server built from OpenAPI 2.0/3.x specs. It includes fake data generation (Faker), custom handlers, seed data, an in-memory store, error/delay simulation and a Vue DevTools web app. |
| Audience | Frontend developers using Vite (Vue-focused for the DevTools tab) |
| Stack | TypeScript ESM. Hono for the HTTP server, `@hono/node-server` and `@hono/node-ws`, `@scalar/openapi-parser`, `@faker-js/faker`, `chokidar`, `fast-glob`, `picocolors`. The DevTools app uses Vue 3, Pinia, vue-router (hash mode), open-props and lucide. Build: tsup and Vite. Lint/format: Biome. Tests: Vitest. Package manager: pnpm 9.15.0. Node `^20.19.0 \|\| >=22.12.0`. |
| Versions (from each `package.json`) | `@websublime/vite-plugin-open-api-server` **0.24.0-next.16** (main package) · `@websublime/vite-plugin-open-api-core` **0.14.0-next.17** · `@websublime/vite-plugin-open-api-devtools` **0.9.0-next.1** · `petstore-app` 0.2.0-next.1 (private) · root monorepo 0.0.0 (private) |
| Latest stable versions | server 0.23.1, core 0.13.1, devtools 0.8.5. All dated 2026-02-11 (per-package `CHANGELOG.md` headings). |
| Registry | npm, public access. Versions are independent per package (`repo.config.toml [version] strategy="independent"`). |
| Peer dependencies (server) | `vite ^5\|^6\|^7` · `hono ^4.11.4` · `@hono/node-server ^1.14` · `vue ^3` (optional) · `@hono/node-ws ^1.3` (optional) |
| License | MIT © WebSublime (`LICENSE`) |
| Remote | `https://github.com/websublime/vite-open-api-server.git` (`packages/*/package.json` → `repository`) |
| Release flow | Changesets via `workspace` (websublime/workspace-tools), configured in `repo.config.toml` and `.changesets/*.json`. Pushing to `main` publishes `latest`; pushing to `next` publishes the `next` tag (`.github/workflows/release.yml`). Changelogs use keep-a-changelog format. |
| Status signals | CONTRIBUTING.md says `next` is the v1.0.0 multi-spec work and `main` holds 0.x patches. `history/PLAN-V2.md:11-20` lists Epics 1–3 done and 4–6 not started, but the code shows Epic 4 partly done (see §7). In `plugin.ts`, the startup banner is still the v0.x one and has a TODO. |

---

## 2. Public surface

### Install
- `pnpm add -D @websublime/vite-plugin-open-api-server`
- Optional: `@hono/node-ws` (enables the `/_ws` WebSocket; without it the route returns 501) and `@vue/devtools-api` (enables the Vue DevTools tab).
- Source: `README.md` and `packages/server/package.json` (`peerDependencies`/`peerDependenciesMeta`).

### CLI
- **None.** The only scripts are monorepo dev scripts in the root `package.json`: `build`, `dev`, `test`, `test:watch`, `lint`, `lint:fix`, `format`, `typecheck`, `playground`, `changeset`, `release`, `clean`. These belong in a Contributing page only.

### Plugin options
Canonical source: `packages/server/src/types.ts` (interfaces `SpecConfig` and `OpenApiServerOptions`). Defaults are applied in `resolveOptions()` in the same file (lines ~318-340). The spec id, proxy path and default directories are resolved later in `processSpec()` in `packages/server/src/orchestrator.ts`.

**`OpenApiServerOptions` (9 keys)**

| Key | Type | Default |
|---|---|---|
| `specs` | `SpecConfig[]` (required, non-empty) | — |
| `port` | number | 4000 (all specs share this port) |
| `enabled` | boolean | true |
| `timelineLimit` | number | 500 (per spec) |
| `devtools` | boolean | true |
| `cors` | boolean | true |
| `corsOrigin` | string \| string[] | `'*'` (`['*']` is normalised to `'*'`; credentials are allowed only when the origin is not a wildcard) |
| `logger` | `Logger` (log/info/warn/error/debug) | `console` (`orchestrator.ts`); the README says "Vite logger" |
| `silent` | boolean | false |

**`SpecConfig` (6 keys)**

| Key | Type | Default |
|---|---|---|
| `spec` | string (path or URL, YAML or JSON) | required |
| `id` | string | Slugified `info.title` (`spec-id.ts` → `deriveSpecId`/`slugify`) |
| `proxyPath` | string | Path part of `servers[0].url` (`proxy-path.ts` → `deriveProxyPath`/`normalizeProxyPath`). `/` is rejected, and paths are checked for duplicates, overlaps, raw string-prefix collisions, and the reserved `/_devtools`, `/_api`, `/_ws`. |
| `handlersDir` | string | `./mocks/{specId}/handlers` |
| `seedsDir` | string | `./mocks/{specId}/seeds` |
| `idFields` | `Record<schema, field>` | `{}` (the store uses `'id'`) |

**Validation errors.** `ValidationErrorCode` has 9 codes (`types.ts:23-32`): `SPEC_ID_MISSING`, `SPEC_ID_DUPLICATE`, `PROXY_PATH_MISSING`, `PROXY_PATH_TOO_BROAD`, `PROXY_PATH_DUPLICATE`, `PROXY_PATH_OVERLAP`, `PROXY_PATH_PREFIX_COLLISION`, `SPEC_NOT_FOUND`, `SPECS_EMPTY`. They are thrown as `ValidationError` objects with a `.code` field.

**SPEC_COLORS (8)** in `orchestrator.ts`: `#4ade80`, `#60a5fa`, `#f472b6`, `#facc15`, `#a78bfa`, `#fb923c`, `#2dd4bf`, `#f87171`. Colours are assigned to specs by position and wrap around after 8.

### What the plugin does in Vite (`packages/server/src/plugin.ts`)
- Plugin name `vite-plugin-open-api-server`, `apply: 'serve'` (runs in the dev server only).
- `config`: adds `@vue/devtools-api` to `optimizeDeps` when that package can be resolved.
- `resolveId`/`load`: serve the virtual module `virtual:open-api-devtools-tab`, which calls `addCustomTab` for an "OpenAPI Server" iframe pointing at `/_devtools/`.
- `transformIndexHtml`: injects that module into the page `<head>`.
- `configureServer`: runs `createOrchestrator`, `start()`, `configureMultiProxy`, `createPerSpecFileWatchers`, then prints the banner.
- `closeBundle`: tears everything down.

### Proxy (`packages/server/src/multi-proxy.ts`)
- Each spec gets one entry: `proxyPath` → `http://localhost:{port}`. The prefix is stripped and an `x-spec-id: {id}` header is added.
- Shared entries: `/_devtools` and `/_api` (HTTP) and `/_ws` (`ws: true`).
- Exported constants: `DEVTOOLS_PROXY_PATH`, `API_PROXY_PATH`, `WS_PROXY_PATH`.

### Library exports
**Server package** (`packages/server/src/index.ts`): 29 value exports and 24 type exports.
- Plugin: `openApiServer`
- Options: `resolveOptions`, `ValidationError`, `validateSpecs`
- Spec id: `deriveSpecId`, `slugify`, `validateUniqueIds`
- Proxy path: `deriveProxyPath`, `normalizeProxyPath`, `validateUniqueProxyPaths`
- Orchestrator: `createOrchestrator`, `SPEC_COLORS`, `configureMultiProxy`, `API_PROXY_PATH`, `DEVTOOLS_PROXY_PATH`, `WS_PROXY_PATH`
- Loaders: `loadHandlers`, `getHandlerFiles`, `loadSeeds`, `getSeedFiles`
- Hot reload: `createFileWatcher`, `createPerSpecFileWatchers`, `debounce`, `reloadSpecHandlers`, `reloadSpecSeeds`
- DevTools: `registerDevTools`, `getDevToolsUrl`
- Re-exported from core: `defineHandlers`, `defineSeeds`
- Types re-exported from core for authoring: `HandlerContext`, `HandlerDefinition`, `HandlerFn`, `HandlerReturn`, `SecurityContext`, `SeedContext`, `SeedDefinition`, `SeedFn`, `SeedHelper`

**Core package** (`packages/core/src/index.ts`), grouped by module:

| Module | Exports |
|---|---|
| server | `createOpenApiServer` (`OpenApiServerConfig`, `OpenApiServer` in `core/src/server.ts:27-183`) |
| devtools-server | `mountDevToolsRoutes` |
| parser | `processOpenApiDocument`, `ProcessorError` |
| store | `createStore`, `StoreError` |
| router | `buildRegistry`, `buildRoutes`, `convertOpenApiPath`, `createEndpointKey`, `parseEndpointKey`, `updateRegistryHandlers`, `updateRegistrySeeds` |
| generator | `generateFromSchema`, `generateFromFieldName`, `TYPE_FORMAT_MAPPING`, `FIELD_NAME_MAPPING`, `DATE_FORMAT_POST_PROCESSING` |
| handlers | `defineHandlers`, `executeHandler`, `normalizeResponse`, `ExecutorError` |
| websocket | `createWebSocketHub`, `createCommandHandler`, `CLIENT_COMMAND_TYPES` |
| security | `resolveSecuritySchemes`, `validateSecurity` |
| simulation | `createSimulationManager` |
| internal-api | `mountInternalApi` |
| seeds | `defineSeeds`, `executeSeeds`, `executeSeedDefinition`, `createSeedContext`, `createSeedHelper`, `SeedExecutorError` |

**DevTools package** (`packages/devtools-client/src/main.ts`): `bootstrap`, `useTheme`, `useWebSocket`, plus `./style.css`. `useSpecs` is exported from `composables/index.ts` but **not** re-exported from `main.ts`. Build: library entry in `vite.config.ts` (`lib.name: ViteOpenApiDevtools`, es and umd formats); the standalone web app is built by `vite.config.spa.ts` into `dist/spa`, then copied into the server's dist by `packages/server/scripts/copy-devtools-spa.mjs`.

### Handlers API
Canonical files: `core/src/handlers/context.ts` and `define-handlers.ts`. Loader: `server/src/handlers.ts`.
- File glob: `**/*.handlers.{ts,js,mjs}` inside `handlersDir`. Files are loaded with `vite.ssrLoadModule`; the handler object can be `default`, a named `handlers` export, or the module itself.
- `defineHandlers<T extends HandlerDefinition>(h): T` maps each `operationId` to `(ctx) => HandlerReturn | Promise<HandlerReturn>`.
- `HandlerContext` = `{ req: {method, path, params, query: Record<string,string|string[]>, body, headers}, res: {status, headers}, store, faker, logger, security }`.
- `HandlerReturn` is one of three shapes, chosen by `type` (switch in `executor.ts:102-127`):
  - `{type:'raw', data}` — status 200
  - `{type:'status', status, data}`
  - `{type:'full', status, data, headers}`
- `SecurityContext` = `{ authenticated, scheme?, credentials?, scopes[] }` (`core/src/security/types.ts`).

### Seeds API
Canonical files: `core/src/seeds/context.ts` and `define-seeds.ts`. Loader: `server/src/seeds.ts`.
- File glob: `**/*.seeds.{ts,js,mjs}`.
- `defineSeeds` maps a schema name to `(ctx) => unknown[] | Promise<unknown[]>`.
- `SeedContext` = `{ seed: SeedHelper, store, faker, schema: OpenAPIV3_1.SchemaObject, logger }`.
- `SeedHelper` can be called as `seed(array)`, `seed(factory)`, or `seed.count(n, (index) => item)`.
- Seeding happens in two phases: `executeSeeds()`, then `buildSeedMapFromStore()` and `updateSeeds()` (`orchestrator.ts` → `processSpec`).

### Store API (14 methods)
Defined in `core/src/store/store.ts:28-55`: `list`, `get`, `create`, `update`, `delete`, `clear`, `clearAll`, `setIdField`, `getIdField`, `getSchemas`, `getCount`, `hasSchema`, `has`. Errors are thrown as `StoreError`.

### Response priority
Implemented in `core/src/router/route-builder.ts` around lines 240-330:
1. Security check (401 with `WWW-Authenticate`)
2. Simulation (the delay always applies; then a body override, or a status-only override)
3. Custom handler (handler errors return 500)
4. Seed data
5. Spec example
6. Faker-generated data

### Hot reload
In `server/src/hot-reload.ts`:
- chokidar watches each spec's `handlersDir` and `seedsDir`, filtered by the regexes `/\.handlers\.(ts|js|mjs)$/` and `/\.seeds\.(ts|js|mjs)$/`, on add, change and unlink.
- `awaitWriteFinish` waits 100ms; reloads are debounced by 100ms.
- The spec file and the Vite config are **not** watched.

### HTTP endpoints (no OpenAPI document for them)
**Plugin mode** (`server/src/multi-internal-api.ts`) — **9 GET routes**:
- `/_api/specs`
- `/_api/registry`
- `/_api/health`
- `/_api/specs/:specId/{registry, store, store/:schema (?limit&offset, max 1000), document, simulations, timeline (?limit, default 100)}`

There are no POST or DELETE routes in plugin mode: changes are meant to go through WebSocket commands (TODO in the file header).

**Standalone core** (`core/src/internal-api.ts`, `createOpenApiServer`) — 13 routes:
- `GET /_api/{health, document, registry, store, store/:schema, timeline, simulations}`
- `POST /_api/store/:schema`, `POST /_api/simulations`
- `DELETE /_api/store/:schema`, `DELETE /_api/timeline`, `DELETE /_api/simulations/:path`, `DELETE /_api/simulations`

These routes also exist inside each spec instance. [INFERENCE] In plugin mode they can only be reached when the request carries an `X-Spec-Id` header, through the dispatch middleware in `orchestrator.ts` (`createDispatchMiddleware`).

**Other routes:** `/_devtools` serves the web app or a placeholder (`core/src/devtools-server.ts`). `/_ws` is the WebSocket, or returns 501 when `@hono/node-ws` is missing (`orchestrator.ts` → `mountWebSocketRoute`).

### WebSocket protocol
Canonical file: `core/src/websocket/protocol.ts`. Multi-spec routing: `server/src/multi-command.ts`.
- **Client commands (10 in multi-spec mode):**
  - Global, `specId` optional: `get:specs` (orchestrator-only), `get:registry`, `get:timeline`, `clear:timeline`
  - Require `specId`: `get:store`, `set:store`, `clear:store`, `set:simulation`, `clear:simulation`, `reseed`
- **Server events (22 types):**
  - Connection: `connected` (includes `specs: SpecInfo[]`)
  - Traffic: `request`, `response`
  - Hot reload: `handler:reloaded`, `handlers:updated`, `seed:reloaded`, `seeds:updated`
  - Simulations: `simulation:active`, `simulation:added`, `simulation:removed`, `simulations:cleared`, `simulation:set`, `simulation:cleared`
  - Store: `store:updated`, `store`, `store:set`, `store:cleared`
  - Other: `registry`, `timeline`, `timeline:cleared`, `reseeded`, `error`
- In multi-spec mode every event carries `specId`.

### DevTools
- **Pages (4)**, defined in `devtools-client/src/router.ts`: Routes, Timeline, Models, Simulator. Hash routing.
- **Simulation presets (7)** in `devtools-client/src/stores/simulation.ts:~55-111`: slow-network (3000ms), server-error (500), rate-limit (429), not-found (404, line not read but listed in the README), request-timeout (30000ms), empty-response (200, empty body), unauthorized (401).
- **Vue DevTools tab**, two ways to register it:
  - Automatic: the virtual module injected by `plugin.ts` (iconify `carbon:api-1`).
  - Manual: `registerDevTools(app, {port, host, protocol, enabled, label})` in `server/src/devtools.ts`.
- **Theme:** persisted in `localStorage` under `openapi-devtools-theme` (from the DevTools README).

### Environment variables
- None for users. `process.env.CI` is only used in the Vitest configs; `import.meta.env.DEV` only gates console logging in the DevTools app.

---

## 3. Existing doc material (all English; no Portuguese found by grep)

| File | Class | Notes |
|---|---|---|
| `README.md` (657 lines) | PUBLIC-READY but **outdated (0.x config)** | Best prose source: handlers, seeds, store, DevTools, security, response priority, hot reload, internal API, troubleshooting. Its config section and internal-API table do not match the v1 code. The "Built with AI" and Monorepo sections fit an About or Contributing page. |
| `packages/server/README.md` | PUBLIC-READY, **outdated** | Uses the 0.x config and handler returns without `type`. Says the DevTools app "serves a placeholder". Has the banner sample and the `registerDevTools` docs. |
| `packages/core/README.md` | MIXED / outdated | Its export tables are usable. Examples are wrong: handler returns without `type`, the `executeSeeds` signature, `hub.onCommand`, `simulations.set(path, method, …)`. |
| `packages/devtools-client/README.md` | PUBLIC-READY | `bootstrap`, `useTheme`, CSS tokens. Still says `useWebSocket` is a "(TODO)" and does not mention `useWebSocket`/`useSpecs` in the API section. |
| `packages/playground/README.md` | MIXED | Demo walkthrough. Config is 0.x and file names are wrong (`pets.handler.ts`/`pets.seed.ts` vs the actual `pets.handlers.ts`/`pets.seeds.ts`). |
| `CONTRIBUTING.md` | PUBLIC-READY (Contributing) | Its TS example uses a made-up `openApiServerPlugin({openApiPath})`; it links workspace-tools to `nicco-io` instead of websublime. |
| `packages/*/CHANGELOG.md` | PUBLIC-READY source for the Changelog page, needs dedup | Very large (core ~5.1k lines, playground ~13k) with the same `-next` entries repeated many times. |
| `LICENSE` | PUBLIC | MIT |
| `history/PRODUCT-REQUIREMENTS-DOC-V2.md` | INTERNAL (has a reusable section) | §8 "Migration Guide (0.x → 1.0)" at lines 1542-1639 and §6 "Plugin Configuration" at 1254-1466 can be adapted. |
| `history/TECHNICAL-SPECIFICATION-V2.md`, `TECHNICAL-SPECIFICATION.md`, `PRODUCT-REQUIREMENTS-DOC.md`, `PLAN.md`, `PLAN-V2.md`, `PLAN-task-6.2-devtools-integration.md` | INTERNAL | Specs and plans. Do not publish. |
| `history/open-api-devtools-{routes,timeline,models,simulator,console}.png` | Assets (publishable) | DevTools screenshots, linked from the README. |
| `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `.claude/skills/*/SKILL.md` (9), `.claude/agents/*.md` (10), `.beads/README.md`, `.changesets/README-example.yaml` | INTERNAL | Agent and tooling files. |
| `temp/**` | INTERNAL / ignore | Scratch files, an old `.beads`, a BFF spec. |

---

## 4. Brand assets
- **No logo, banner or favicon** anywhere in the repo (glob for `**/*.svg` and `**/*.ico` found nothing; `packages/*/public` does not exist).
- Screenshots: `history/open-api-devtools-*.png` (5 files).
- Vue DevTools tab icons:
  - Automatic tab: `https://api.iconify.design/carbon:api-1.svg?...&color=%2394a3b8` (`#94a3b8`), in `plugin.ts`.
  - Manual tab: inline "cube" SVG with stroke `#4f46e5` (`server/src/devtools.ts`).
- Spec colours: the 8 `SPEC_COLORS` hex values listed in §2.
- DevTools design tokens: `devtools-client/src/assets/main.css:15-120` uses open-props variables. Primary is `var(--blue-6)`; success, warning, error and info are green-6, yellow-6, red-6 and cyan-6. HTTP methods: GET green, POST blue, PUT orange, PATCH yellow, DELETE red, OPTIONS gray, HEAD cyan. Light and dark surfaces use gray-0…9. [INFERENCE] open-props blue-6 is `#228be6`.
- Terminal banner colours: picocolors cyan, green, yellow, blue, magenta (`server/src/banner.ts`).

---

## 5. Proposed Mintlify page tree

| Group | Page | Source files |
|---|---|---|
| **Get started** | Overview | `README.md` (intro, features), `packages/server/package.json` |
| | Installation | `packages/server/package.json` (peers, engines), `README.md` (Installation) |
| | Quickstart | `packages/playground/vite.config.ts`, `packages/playground/mocks/**`, `packages/playground/openapi/petstore.yaml` |
| **Concepts** | How it works (proxy → orchestrator → spec instance) | `server/src/plugin.ts`, `orchestrator.ts`, `multi-proxy.ts` |
| | Multi-spec: spec IDs & proxy paths | `server/src/spec-id.ts`, `proxy-path.ts`, `types.ts` (error codes) |
| | Response priority | `core/src/router/route-builder.ts`, `README.md` (Response Priority) |
| | In-memory store & ID fields | `core/src/store/store.ts`, `README.md` (Store API) |
| | Data generation | `core/src/generator/{schema-generator,field-mapping}.ts` |
| | Security (mock auth) | `core/src/security/{types,resolver,validator}.ts`, `README.md` (Security Handling) |
| **Guides** | Custom handlers | `core/src/handlers/{context,define-handlers,executor}.ts`, `server/src/handlers.ts`, `playground/mocks/handlers/pets.handlers.ts` |
| | Seed data | `core/src/seeds/{context,define-seeds,executor}.ts`, `server/src/seeds.ts`, `playground/mocks/seeds/pets.seeds.ts` |
| | Hot reload | `server/src/hot-reload.ts` |
| | Error & delay simulation | `core/src/simulation/simulator.ts`, `devtools-client/src/stores/simulation.ts` |
| | Using the DevTools (one page per DevTools page) | `devtools-client/src/router.ts`, `pages/*.vue`, `history/*.png`, `server/src/devtools.ts`, `plugin.ts` (virtual tab) |
| | Migrating 0.x → 1.0 | `history/PRODUCT-REQUIREMENTS-DOC-V2.md:1542-1639` (adapt), `server/src/types.ts` |
| | Troubleshooting | `README.md` (Troubleshooting), `orchestrator.ts` (port/WS errors), `proxy-path.ts` errors |
| **Reference** | Plugin options | `server/src/types.ts` |
| | `defineHandlers` / `HandlerContext` / `HandlerReturn` | `core/src/handlers/context.ts`, `define-handlers.ts` |
| | `defineSeeds` / `SeedContext` / `SeedHelper` | `core/src/seeds/context.ts`, `define-seeds.ts` |
| | Store API | `core/src/store/store.ts` |
| | Internal HTTP API | `server/src/multi-internal-api.ts`, `core/src/internal-api.ts` |
| | WebSocket protocol | `core/src/websocket/protocol.ts`, `server/src/multi-command.ts`, `server/src/multi-ws.ts` |
| | Server package exports (advanced) | `server/src/index.ts` |
| | Core package API | `core/src/index.ts`, `core/src/server.ts` |
| | DevTools package API | `devtools-client/src/main.ts`, `composables/{useTheme,useWebSocket,useSpecs}.ts` |
| **Project** | Changelog (server / core / devtools) | `packages/{server,core,devtools-client}/CHANGELOG.md` (dedupe) |
| | Contributing | `CONTRIBUTING.md`, root `package.json` scripts, `repo.config.toml` |

---

## 6. Drift watch-list

| Glob (repo-relative) | Pages to review |
|---|---|
| `packages/server/src/types.ts` | Plugin options, Multi-spec, Migration, Troubleshooting |
| `packages/server/src/{spec-id,proxy-path}.ts` | Multi-spec, Troubleshooting |
| `packages/server/src/{plugin,orchestrator,multi-proxy}.ts` | How it works, Installation, DevTools guide, Troubleshooting |
| `packages/server/src/{handlers,seeds}.ts` | Handlers guide, Seeds guide |
| `packages/server/src/hot-reload.ts` | Hot reload |
| `packages/server/src/{multi-internal-api}.ts`, `packages/core/src/internal-api.ts` | Internal HTTP API |
| `packages/server/src/{multi-ws,multi-command}.ts`, `packages/core/src/websocket/**` (excluding `__tests__`) | WebSocket protocol |
| `packages/server/src/devtools.ts`, `packages/core/src/devtools-server.ts` | DevTools guide, DevTools API |
| `packages/server/src/banner.ts` | Quickstart (banner sample) |
| `packages/server/src/index.ts` | Server exports reference |
| `packages/core/src/index.ts`, `packages/core/src/server.ts` | Core API reference |
| `packages/core/src/handlers/**` | Handlers guide and reference |
| `packages/core/src/seeds/**` | Seeds guide and reference |
| `packages/core/src/store/**` | Store concept and reference |
| `packages/core/src/router/route-builder.ts` | Response priority |
| `packages/core/src/security/**` | Security |
| `packages/core/src/simulation/**`, `packages/devtools-client/src/stores/simulation.ts` | Simulation guide |
| `packages/core/src/generator/**` | Data generation |
| `packages/core/src/parser/**` | Overview (supported spec versions) |
| `packages/devtools-client/src/{router.ts,pages/**,components/**}` | DevTools guide |
| `packages/devtools-client/src/{main.ts,composables/**}`, `packages/devtools-client/src/assets/main.css` | DevTools API (theming tokens) |
| `packages/*/package.json` | Installation (versions, peers, engines), Overview |
| `packages/*/CHANGELOG.md`, `.changesets/*.json` | Changelog |
| `packages/playground/{vite.config.ts,mocks/**,openapi/**}` | Quickstart, guide examples |
| `README.md`, `packages/*/README.md` | Prose source for all guides |
| `CONTRIBUTING.md`, `repo.config.toml`, root `package.json` | Contributing |
| `history/PRODUCT-REQUIREMENTS-DOC-V2.md` | Migration guide only |

---

## 7. Gaps and inconsistencies
1. **Config shape mismatch.** Root, server and playground READMEs document `spec`/`proxyPath`/`handlersDir`/`seedsDir`/`idFields` at the top level with defaults `'/api'` and `./mocks/handlers`. The code requires `specs: SpecConfig[]`, auto-derives `proxyPath` from `servers[0].url`, and defaults to `./mocks/{specId}/{handlers,seeds}` (`server/src/types.ts` vs `README.md`). Multi-spec, spec IDs and proxy auto-detection are not documented anywhere public.
2. **Internal API mismatch.** The README lists `/_api/store` and `/_api/simulations` with POST/DELETE, which is the single-instance core API. Plugin mode actually exposes 9 GET routes under `/_api/specs/:specId/*` plus `/_api/specs`, `/_api/registry` and `/_api/health`.
3. **Likely DevTools Models bug.** `devtools-client/src/stores/models.ts:91-93` calls `/_api/{specId}/store[...]` (GET, POST, DELETE). The server mounts `/_api/specs/{specId}/store` with GET only. [INFERENCE] The Models page probably returns 404 in plugin mode on `next`.
4. **Handler return shape.** The server and core READMEs show plain returns or `{status, data}`. The code requires `{type:'raw'|'status'|'full', …}` (`executor.ts:102`). Core README examples for `executeSeeds`, `hub.onCommand` and `simulations.set` also don't match the real signatures.
5. **Wrong file names.**
   - The playground README and the `defineHandlers`/`defineSeeds` JSDoc examples use `pets.handler.ts`/`pets.seed.ts`. The loader glob requires the plural `.handlers.`/`.seeds.`, so files named that way would not load.
   - CONTRIBUTING shows a made-up `openApiServerPlugin({openApiPath, port: 3456})`.
6. **"Console" page.** The README describes a Console page and links a screenshot of it, but `router.ts` defines only 4 pages.
7. **Banner.** The startup banner is still the v0.x one. It shows only the first spec and reports handler/seed counts as 0 (`plugin.ts` TODO, `banner.ts`). The "API Info" URL `/_api` has no matching route.
8. **Stale plan status.** `PLAN-V2.md` says Epic 4 (DevTools multi-spec UI) has not started. The code has the specs store, `SpecFilter`, `SpecBadge` and multi-spec `useWebSocket` (server CHANGELOG 0.24.0-next.13–16). The planned migration guide (Task 5.3) and README update (Task 6.2) have not been written.
9. **Server README says the DevTools app is a placeholder.** That is out of date: the web app is built and copied by `scripts/copy-devtools-spa.mjs`.
10. **Logger default.** The README says "Vite logger"; the code falls back to `console` (`orchestrator.ts` → `createOrchestrator`).
11. **Two ways to register the DevTools tab.** The automatic virtual-module tab and manual `registerDevTools()` could produce a duplicate tab. The docs should pick one recommendation.
12. **Changelogs.** The same `-next` entries are repeated dozens of times (e.g. `server/CHANGELOG.md:1-450`). They need deduplication before being turned into the Changelog page.
13. **README links internal files.** The root README's "Documentation" section links the `history/` PRD, spec and plan as user docs, and its screenshots live in `history/`. The site should copy the images into the docs repo.
14. **Minor.**
    - The DevTools README marks `useWebSocket` as TODO.
    - `useSpecs` is not exported from the DevTools package entry.
    - `repo.config.toml` workspace patterns include `playground/*`, which does not exist.
    - The `route-builder.ts:110` comment lists Handler before Simulation, but the code checks simulation first.