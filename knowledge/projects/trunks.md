> **Snapshot.** Inventory written on 2026-11-12 by reading the local checkout (`../trunks`), files only; nothing was built or run. The refs that are documented come from D5 and `sync/registry.yaml`. Section 7 is the first input to `sync/reports/trunks.md` (D6).

# Trunks: documentation inventory

**Summary.** Trunks is a Rust MCP gateway and registry. Its `docs/guide/` folder is an English user guide that is ready to publish and maps almost one-to-one onto Mintlify pages. The numbered `docs/0X-*.md` files and `docs/spikes/` are internal design documents in Portuguese (pt-PT). There is **no OpenAPI spec and no OpenAPI tooling** (no utoipa, aide or schemars on the API types). The project chose this on purpose: decision W6 in `docs/08-web-app.md:248` uses ts-rs to generate TypeScript types instead of keeping an OpenAPI document. The hand-written `docs/guide/reference/api.md` covers every route in the router (I checked it against the code). `docs/guide/reference/cli.md` is generated from the binary, and a test fails when it drifts.

---

## 1. Identity

| Field | Value | Evidence |
|---|---|---|
| Purpose | "Run all your MCP servers behind one endpoint": a self-hosted MCP gateway and registry | `README.md:5-11`, `crates/trunks/Cargo.toml:3` |
| Audience | Developers (one person, development mode) and platform teams (shared server, enterprise mode with SSO) | `docs/guide/concepts.md:70-80`, `docs/guide/operations.md:3` |
| Stack | Rust edition 2024, MSRV 1.94. Uses axum 0.8, rmcp 3.9 (Streamable HTTP), sqlx 0.9 (SQLite or PostgreSQL), clap 4. Web console uses Astro 7, Lit and the `line://ui` packages `@websublime/line-*` | `Cargo.toml:1-110`, `web/app/package.json` |
| Version | `0.1.0-rc.1` (workspace) | `Cargo.toml:8`; `CHANGELOG.md` `[0.1.0-rc.1] - 2026-11-11`. Local git tags are `v0.1.0-rc.1` and **`v0.1.0-rc.2`** (`.git/refs/tags/`) |
| License | MPL-2.0 | `Cargo.toml:11`, `LICENSE`. `docs/01-produto.md:3` still calls it "provisória, D12" |
| Packages | None on crates.io: `publish = false` for the whole workspace (`Cargo.toml:15`). Release assets are 8 target triples, made by cargo-dist 0.34 with shell and PowerShell installers (`dist-workspace.toml`). Container images are `ghcr.io/websublime/trunks:<v>` (distroless) and `:<v>-stdio` (adds Node 24 and uv/Python 3.13), with `latest` / `latest-stdio` tags (`docs/guide/operations.md:21-40`, `.github/workflows/docker.yml`). Source install: `cargo install --locked --git …` | |
| Crates | `trunks` (binary), `trunks-types`, `trunks-core`, `trunks-db`, `trunks-api`, `trunks-client` (HTTP SDK), `trunks-dashboard`, `trunks-testing` (binaries `fake-upstream` and `fake-http-upstream`), `xtask` | `crates/*/Cargo.toml` |
| Remote | `git@github.com:websublime/trunks.git` (branch `main`) | `.git/config` |
| Status | README says "**pre-alpha** … The first tagged release is still to come". CHANGELOG says rc.1 is "Release candidate of the first public version" | `README.md:17-20`, `CHANGELOG.md:12-14` |

## 2. Public surface

### Install methods
There are 5: the shell installer, the PowerShell installer, `cargo install --git`, the Docker images, and two compose files (`docker-compose.yaml` for development, `docker-compose.prod.yaml` for enterprise on PostgreSQL with `.env.example`). They are described in `docs/guide/quickstart.md:8-30` and `docs/guide/operations.md:6-48`.

### CLI
One binary, `trunks`.
- **Canonical source:** `crates/trunks/src/main.rs:51-96` (`enum Command`). The arguments are defined in `crates/trunks/src/commands/{start,register,manage,access,list,usage,invoke,auth,identities}.rs`.
- **Generated doc:** `docs/guide/reference/cli.md` (1321 lines), produced by `crates/trunks/src/cli_reference.rs` (`TRUNKS_UPDATE_DOCS=1 cargo test -p trunks cli_reference`).
- **Global flag:** `--registry` (env `TRUNKS_REGISTRY`).
- **21 top-level commands:** `start`, `register`, `deregister`, `enable`, `disable`, `get`, `export`, `oauth-complete`, `add-team-member`, `remove-team-member`, `grant`, `revoke`, `list`, `usage`, `invoke`, `init-server`, `login`, `create`, `update`, `delete`, `version`.
- **31 leaf subcommands:**
  - `enable` and `disable` each take {server, tool, prompt, resource}
  - `get` takes {group, prompt, resource}
  - `list` takes {servers, tools, groups, prompts, resources, users, mcp-clients, teams, grants}
  - `create` takes {group, team, user, mcp-client}
  - `update` takes {group, user, mcp-client}
  - `delete` takes {group, team, user, mcp-client}
- `cli.md` therefore has 52 sections.

### Configuration
- **Server:** flags or env vars only; there is no server config file. A `.env` file is loaded through `dotenvy` (`main.rs:101`).
  - Parsed in `crates/trunks/src/commands/start.rs:35-126` (clap `Args`).
  - Documented in `docs/guide/reference/configuration.md`.
- **CLI config file:** `config.toml` with keys `registry_url` and `access_token`.
  - Parsed in `crates/trunks/src/config.rs`. The path comes from `TRUNKS_CONFIG`, otherwise `dirs::config_dir()/trunks/config.toml`. The file is written with mode 0600 by `init-server` and `login`.
- **JSON definition files** (`-c`, with `${VAR}` expansion via `crates/trunks/src/envsubst.rs`):
  - Server definition: type `RegisterServerInput` in `crates/trunks-types/src/api.rs:133-165`; documented in `docs/guide/upstreams.md#from-a-file`.
  - Tool group: type `ToolGroup`; documented in `docs/guide/tool-groups.md#define-a-group`.

### Environment variables
There are 24 that users touch.
- **20 on `start`:** `TRUNKS_PORT`, `_BIND_HOST`, `_MODE`, `_DATABASE_URL`, `_DATABASE_URL_FILE`, `_METRICS_ENABLED`, `_UPSTREAM_INIT_TIMEOUT_SEC`, `_REQUEST_TIMEOUT_SEC`, `_SESSION_IDLE_TIMEOUT_SEC`, `_ALLOWED_HOSTS`, `_PUBLIC_URL`, `_SESSION_TTL_HOURS`, `_OIDC_ISSUER`, `_OIDC_CLIENT_ID`, `_OIDC_CLIENT_SECRET`, `_OIDC_SCOPES`, `_OIDC_GROUPS_CLAIM`, `_OIDC_ADMIN_GROUP`, `_OIDC_SYNC_TEAMS`, `_OIDC_TEAM_PREFIX`.
- **Other 4:**
  - `TRUNKS_LOG` (falls back to `RUST_LOG`), `start.rs:435`
  - `TRUNKS_IGNORE_SSE_SERVERS`, `start.rs:425`
  - `TRUNKS_REGISTRY`, `main.rs:43`
  - `TRUNKS_CONFIG`, `config.rs:17`
- **Development and build only:** `TRUNKS_UPDATE_DOCS`, `TRUNKS_BUILD_METADATA` (set by `crates/trunks/build.rs`).
- **Compose only:** `POSTGRES_PASSWORD` (`.env.example`).

### Library API
- **`trunks-client`** (`crates/trunks-client/src/lib.rs`): `Client::new(base_url, token, reqwest::Client)` plus about 40 async methods that mirror `/api/v0`, such as `list_servers`, `invoke_tool`, `register_server`, `grant` and `create_client`. AGENTS.md calls it "public, wire-compatible", but it is not published.
- **`trunks-types`** (`crates/trunks-types/src/{api,enums,names,error}.rs`) holds the wire types.
- The other crates are internal.

### MCP
Trunks has **no built-in tools, prompts or resources**. It re-exports what the upstreams provide:
- tools and prompts as `<server>__<name>`
- resources as `trunks://res/<server>/<encoded-uri>`

The handler is `crates/trunks-core/src/gateway.rs:221-360` (`GatewayHandler`). Its `serverInfo` name is `"Trunks MCP Gateway"`, or `"Trunks gateway for tool group: {g}"` on a group endpoint. The supported methods are `tools/list|call`, `prompts/list|get` and `resources/list|read`.

The endpoints are mounted in `crates/trunks-api/src/mcp.rs:104-109`:
- `/mcp`
- `/v0/groups/{name}/mcp`

### HTTP endpoints
- **Router assembly:** `crates/trunks-api/src/lib.rs:84-150`
- **Per-group route files:** `crates/trunks-api/src/routes/*.rs`
- **Documentation:** `docs/guide/reference/api.md`, which is complete as of this check.

There are about 71 method + path pairs:

| Group | File | Count |
|---|---|---|
| Public: `GET /health`, `GET /metadata`, `POST /init`, `GET /metrics` (only when enabled) | `routes/public.rs:15-18`, `lib.rs:131` | 4 |
| Auth: `/auth/{config,login,callback,token,logout}` | `routes/auth.rs:25-30` | 5 |
| `/api/v0` read: `servers`, `tools`, `tool`, `prompts`, `prompt`, `resources` | `routes/registry.rs:21-27` | 6 |
| `/api/v0/users/whoami` (enterprise) | `routes/registry.rs:32` | 1 |
| `/api/v0/tool-groups` read (3) and write (3) | `routes/groups.rs:19-29` | 6 |
| `/api/v0` invoke: `tools/invoke`, `prompts/render`, `resources/get`, `resources/read` | `routes/invoke.rs:18-22` | 4 |
| `/api/v0` admin: servers, enable/disable, `server_configs`, `upstream_oauth` | `routes/admin.rs:22-34` | 12 |
| `/api/v0/grants`, `servers/{n}/access`, `tool-groups/{n}/access` | `routes/access.rs:31-34` | 5 |
| `/api/v0/users*` (admin and enterprise), `/api/v0/clients*` | `routes/identities.rs:25-34` | 8 |
| `/api/v0/teams*` | `routes/access.rs:22-26` | 7 |
| `/api/dashboard/*` (8 read, 2 admin, `oauth/callback`) | `routes/dashboard.rs:28-46` | 11 |
| MCP (any method) | `mcp.rs` | 2 |
| Fallback: static web-console pages | `routes/web.rs`, `trunks-dashboard` | — |

**Middleware layers** (`crates/trunks-api/src/middleware.rs`): `user_auth`, `require_admin`, `require_enterprise`, `require_initialized`, `mcp_client_auth`, `deadline`.

**OpenAPI.**
- **What exists:** none. A grep for `utoipa|openapi|aide|schemars|JsonSchema` in `crates/` found nothing; the only mention anywhere is the decision W6 that rejected OpenAPI (`docs/08-web-app.md:248`).
- **Closest source of truth:** `cargo xtask gen-types` writes `web/app/src/api/types.gen.ts`. The list of types is in `xtask/src/ts_types.rs:37-62` (about 65 API and dashboard types), and a test fails when the file drifts.
- **Ways to get one:**
  - **(a) Generate it in Trunks.** Add an optional `openapi` feature that derives `utoipa::ToSchema` on `trunks-types::api` and `trunks-core::dashboard`, following the existing `ts` feature pattern (`#[cfg_attr(feature="ts", …)]`). Then annotate about 60 handlers with `#[utoipa::path]` and add an `xtask gen-openapi` task. This means changing the Trunks repo and reversing W6.
  - **(b) Build it in the docs repo.** Hand-write `openapi.yaml` from `api.md` plus `types.gen.ts`, using a TS→JSON Schema converter for the components.
  - **(c) Skip it.** Keep api.md as MDX tables and don't use Mintlify's OpenAPI playground.

## 3. Existing doc material

| File | Class | Lang | Notes |
|---|---|---|---|
| `README.md` | MIXED | EN | Hero, quickstart and layout are public. The dev, release and design-doc table is internal |
| `CHANGELOG.md` | PUBLIC-READY | EN | Keep a Changelog format |
| `docs/guide/README.md` | PUBLIC-READY | EN | Guide index |
| `docs/guide/quickstart.md` | PUBLIC-READY | EN | |
| `docs/guide/concepts.md` | PUBLIC-READY | EN | |
| `docs/guide/upstreams.md` | PUBLIC-READY | EN | |
| `docs/guide/tool-groups.md` | PUBLIC-READY | EN | |
| `docs/guide/enterprise.md` | PUBLIC-READY | EN | |
| `docs/guide/clients.md` | PUBLIC-READY | EN | |
| `docs/guide/operations.md` | PUBLIC-READY | EN | |
| `docs/guide/reference/cli.md` | PUBLIC-READY (generated) | EN | Regenerate, don't hand-edit |
| `docs/guide/reference/configuration.md` | PUBLIC-READY | EN | |
| `docs/guide/reference/api.md` | PUBLIC-READY | EN | |
| `docs/01-produto.md` | INTERNAL | PT | Product doc, decisions D1–D12 |
| `docs/02-especificacao.md` | INTERNAL | PT | 70 KB technical spec, contracts |
| `docs/03-plano.md` | INTERNAL | PT | Execution plan |
| `docs/04-arquitectura.md` | MIXED | PT | C4/arc42 Mermaid diagrams could be adapted for an "Architecture" page; ADRs stay internal |
| `docs/05-roadmap.md` | MIXED | PT | Horizons v1.x, v2 (OIDC for MCP clients), v2.x (orgs), v3 (governance) could become a public roadmap; open questions stay internal |
| `docs/06-analise-db.md` | INTERNAL | PT | Analysis behind the sqlx decision |
| `docs/07-desempenho.md` | MIXED | PT | Benchmark tables (gateway overhead ≈0.4 ms) are publishable as "Performance"; reproduction steps are dev-facing |
| `docs/08-web-app.md` | INTERNAL | PT | Web app definition, decisions W1–W9 |
| `docs/spikes/S1-rmcp-principal.md`, `S3-upstream-oauth.md` | INTERNAL | PT | |
| `spikes/*/README.md` | INTERNAL | EN | |
| `AGENTS.md`, `CLAUDE.md` (empty) | INTERNAL | EN | Agent files |
| `web/README.md` | INTERNAL | EN | |
| `tests/fixtures/README.md`, `crates/trunks-testing/src/fixtures/README.md` | INTERNAL | EN | |

## 4. Brand assets

| Asset | Path | Notes |
|---|---|---|
| Logo (raster) | `docs/assets/logo.jpg` | 594 KB. A shield containing a tree, teal and violet on a dark navy background, with the text "TRUNKS / HUB & PROXY" |
| Banner | `docs/assets/banner.jpg` | 830 KB. Alt text: "gateway and registry: one endpoint in front of all your MCP servers" |
| Mark (SVG) | `web/app/public/favicon.svg`, `web/app/src/components/Logo.astro` | 24×24 line-art shield and tree with a linear gradient |
| Colors | Same SVGs | Gradient `#12a594` (teal) → `#6e56cf` (violet) |
| Theme | `web/app/src/layouts/Base.astro:13` | `data-accent="teal"`, `data-gray="slate"`, using `@websublime/line-themes`, `line-tokens` and `line-colors` |

There is no dark or light SVG wordmark; only JPGs exist. The navy background colour is not defined anywhere in the repo (I only saw it in the image).

## 5. Proposed Mintlify page tree (tab "Trunks")

- **Get started**
  - Overview ← `README.md:1-20`, `docs/guide/README.md`, `banner.jpg`
  - Quickstart ← `docs/guide/quickstart.md`
  - Installation ← `docs/guide/operations.md#install`, `dist-workspace.toml`, `docker-compose*.yaml`, `.env.example`
- **Concepts**
  - Core concepts (names, transports, session modes, enabled state) ← `docs/guide/concepts.md`
  - Modes and identities ← `concepts.md#modes`, `#identities`
  - Architecture (optional) ← `README.md#layout`, adapted from the diagrams in `docs/04-arquitectura.md`
- **Guides**
  - Upstream servers (stdio, HTTP, OAuth, from file, export) ← `docs/guide/upstreams.md`
  - Tool groups ← `docs/guide/tool-groups.md`
  - Enterprise mode (users, teams, grants, MCP clients) ← `docs/guide/enterprise.md`
  - Single sign-on (OIDC) ← `enterprise.md#single-sign-on-oidc`, `configuration.md#single-sign-on-oidc`
  - Connecting clients ← `docs/guide/clients.md`
  - Web console ← "In the web console" sections of upstreams and enterprise, `api.md#web-console`, CHANGELOG "Web console"
  - Operations (database, network, observe, upgrade, troubleshooting) ← `docs/guide/operations.md`
- **Reference**
  - CLI (one page, or one per top-level command) ← `docs/guide/reference/cli.md`, `crates/trunks/src/main.rs`
  - Configuration and env vars ← `docs/guide/reference/configuration.md`, `commands/start.rs`, `config.rs`
  - HTTP API: conventions, service, REST read, REST admin, identities, browser auth, dashboard ← `docs/guide/reference/api.md`, `crates/trunks-api/src/routes/*.rs`, `types.gen.ts`
  - MCP endpoints ← `api.md#mcp-endpoints`, `crates/trunks-api/src/mcp.rs`, `crates/trunks-core/src/gateway.rs`
  - Metrics ← CHANGELOG "Operations", `crates/trunks-core/src/metrics.rs`
  - Rust SDK (`trunks-client`, optional) ← `crates/trunks-client/src/lib.rs`
- **Project**
  - Performance (optional) ← translated from `docs/07-desempenho.md`
  - Roadmap (optional) ← translated sections 4–7 of `docs/05-roadmap.md`
  - Changelog ← `CHANGELOG.md`

## 6. Drift watch-list

| Glob | Pages affected |
|---|---|
| `docs/guide/**/*.md` | The mirrored page, 1:1 |
| `CHANGELOG.md` | Changelog, Overview status |
| `README.md` | Overview, Quickstart |
| `Cargo.toml` (`[workspace.package] version`, `rust-version`, `license`) | Overview, Installation |
| `crates/trunks/src/main.rs`, `crates/trunks/src/commands/**` | CLI reference, Quickstart, Guides (command examples) |
| `crates/trunks/src/commands/start.rs` | Configuration reference, Operations, SSO |
| `crates/trunks/src/config.rs`, `crates/trunks/src/envsubst.rs` | Configuration reference (CLI config, `-c` files) |
| `crates/trunks-api/src/lib.rs`, `crates/trunks-api/src/routes/**`, `crates/trunks-api/src/mcp.rs`, `crates/trunks-api/src/middleware.rs` | HTTP API reference, MCP endpoints, Concepts (endpoints) |
| `crates/trunks-types/src/**` (`api.rs`, `enums.rs`, `names.rs`, `error.rs`) | HTTP API shapes, Concepts (names), upstream and group file formats |
| `web/app/src/api/types.gen.ts` | HTTP API shapes (generated proxy for the types) |
| `crates/trunks-core/src/gateway.rs`, `crates/trunks-core/src/upstream.rs`, `crates/trunks-core/src/sessions.rs` | MCP endpoints, Concepts (sessions, transports), Upstream servers |
| `crates/trunks-core/src/oauth.rs`, `crates/trunks-core/src/oidc.rs`, `crates/trunks-core/src/login.rs` | Upstream OAuth, SSO |
| `crates/trunks-core/src/access.rs`, `crates/trunks-core/src/identity.rs` | Enterprise mode ("Who can do what") |
| `crates/trunks-core/src/metrics.rs` | Metrics reference, Operations (observe) |
| `crates/trunks-core/src/dashboard.rs` | Dashboard API |
| `crates/trunks-db/migrations/**`, `crates/trunks-db/src/migrate.rs` (path assumed from crate layout; not opened) | Operations (database, upgrades) |
| `web/app/src/pages/**`, `web/app/src/elements/**` | Web console guide, `api.md#web-console` page table |
| `Dockerfile`, `docker-compose*.yaml`, `.env.example`, `.github/workflows/docker.yml` | Installation (containers), Operations |
| `dist-workspace.toml`, `.github/workflows/release.yml` | Installation (binaries, targets) |
| `docs/assets/**`, `web/app/public/favicon.svg`, `web/app/src/components/Logo.astro` | Branding (logo, favicon, colors) |
| `docs/05-roadmap.md`, `docs/07-desempenho.md` | Roadmap, Performance (if published) |

## 7. Gaps and inconsistencies

1. **Version and status don't agree.**
   - The manifest and CHANGELOG are at `0.1.0-rc.1`, but a local tag `v0.1.0-rc.2` exists and has no CHANGELOG entry.
   - README calls the project "pre-alpha" and says "first tagged release is still to come", while CHANGELOG says "release candidate" and the quickstart cites `download/v0.1.0-rc.1`.
   - Installer `latest/download` links only follow final releases, and none exists yet. As written, the quickstart one-liner would fail today. **[INFERENCE]**
2. **Config file path is wrong on macOS and Windows.** The docs say `~/.config/trunks/config.toml` (`configuration.md`, `AGENTS.md`, comment in `config.rs:1`). The code uses `dirs::config_dir()`, which on macOS resolves to `~/Library/Application Support/trunks/config.toml` and on Windows to `%APPDATA%`. **[INFERENCE: standard behaviour of the dirs crate]**
3. **CLI help strings are stale, and they feed the generated `cli.md`.**
   - `create` and `delete` say "a tool group, a user or an MCP client" but also handle `team`.
   - `list` says "servers, tools, prompts or resources" but has 9 subcommands.
   - `main.rs:54-95`.
4. **REST and CLI don't fully match.** `PUT /api/v0/teams/{name}` (change a team's description) has no `trunks update team`. The `/api/dashboard/*` routes have no CLI equivalent, which is by design.
5. **`docs/guide/README.md` lists design docs "01 to 07"**, but `08-web-app.md` exists.
6. **The `trunks-dashboard` crate description says "Embedded dashboard SPA assets"**, but the console is now a static Astro site (`docs/08-web-app.md` replaced the "SPA em Lit + Vite" definition).
7. **Taglines differ.** The logo says "HUB & PROXY"; README and Cargo.toml say "gateway and registry".
8. **Claimed clients without a section.** README names Codex and Copilot, but `clients.md` only covers Claude Code, Cursor, VS Code (Copilot) and Claude Desktop. Codex has no section.
9. **No OpenAPI**, by decision W6. An API playground would need one of the options in §2.
10. **Internal relative links.** The guide pages use links like `../concepts.md#names` and `reference/api.md`, and the README links to `docs/03-plano.md`. These must be rewritten to Mintlify routes, and no link to a PT internal doc may appear in published content.
11. **The SDK is undocumented.** `trunks-client` is called "public, wire-compatible" in `AGENTS.md`, but it is unpublished and has no guide.
12. **Metrics have no reference page.** The metric names exist only in CHANGELOG; operations.md mentions `/metrics` without a full metric table. Worth checking against `crates/trunks-core/src/metrics.rs`, which I didn't open.