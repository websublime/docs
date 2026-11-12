> **Snapshot.** Inventory written on 2026-11-12 by reading the local checkout (`../unblock`), files only; nothing was built or run. The refs that are documented come from D5 and `sync/registry.yaml`. Section 7 is the first input to `sync/reports/unblock.md` (D6).

# unblock: documentation inventory

`unblock` is at `../unblock`. Everything below comes from reading files only; I built and ran nothing.

## 1. Identity

| Field | Value | Evidence |
|---|---|---|
| Purpose | "Agent-first issue tracker — MCP-first." It is a local-first, dependency-aware issue store for agent swarms. Every domain feature is an MCP tool, resource or prompt over stdio. The `unblock` binary only handles lifecycle and operations. | `README.md:1-30` |
| Audience | Developers wiring AI agents (Claude Code, Claude Desktop, VS Code, Cursor) to a shared issue and dependency store | `README.md` Quickstart |
| Stack | Rust 1.96 stable, edition 2024. 12 workspace crates plus `xtask`. Key libraries: rmcp 1.7 (MCP), libsql 0.9.30 `core` (embedded SQLite), clap 4, petgraph, axoupdater, cargo-dist 0.32.0 | `Cargo.toml`, `rust-toolchain.toml`, `dist-workspace.toml` |
| Version | `1.0.2` (`[workspace.package]`). Git tags are `v1.0.2` and `v1.0.2-rc.1`. | `Cargo.toml:41`, `.git/refs/tags/` |
| MCP contract id | `unblock.mcp.v1.12`, with `CONTRACT_HASH` `845456ec…8ee2` | `crates/unblock-mcp/src/options.rs:145,166` |
| License | `MIT OR Apache-2.0` | `LICENSE-MIT`, `LICENSE-APACHE` |
| Packages | One binary, `unblock`, from the `unblock-cli` package. Every crate is `publish = false`, so nothing goes to crates.io. Releases use dist installers (shell + PowerShell) for 5 targets: x86_64/aarch64 Linux gnu, x86_64/aarch64 macOS, x86_64 Windows msvc. Artifacts are named `unblock-cli-installer.{sh,ps1}`. | `crates/unblock-cli/Cargo.toml`, `dist-workspace.toml` |
| Remote | `git@github.com:websublime/unblock.git` | `.git/config` |
| Status signals | The README says "GA 1.0.0 — semver stability applies (D35)". The roadmap marks v1 and v1.1 LOCKED and v1.0.1/v1.0.2 released. Main already contains v1.1 features that are not released yet (see §7). | `README.md:11-13`, `docs/plans/00-roadmap.md:3` |

## 2. Public surface

### Install methods (`README.md` §Install)
1. Shell: `curl … releases/latest/download/unblock-cli-installer.sh | sh`
2. PowerShell: `irm …/unblock-cli-installer.ps1 | iex`
3. From source: `cargo build --release`
4. `cargo install` is **not** available. The README says so explicitly.

### CLI: 7 subcommands
- Canonical sources: the `Command` enum in `crates/unblock-cli/src/cli.rs:96-117`, the handlers in `crates/unblock-cli/src/commands/*.rs`, and the help goldens in `crates/unblock-cli/tests/snapshots/help_snapshots__help_*.snap` (8 snapshots).

| Command | Flags | Handler |
|---|---|---|
| `mcp` | none | `commands/mcp.rs` |
| `migrate` | none | `commands/migrate.rs` |
| `doctor` | none | `commands/doctor.rs` |
| `version` | `--short` | `commands/version.rs` |
| `init` | `--prefix <PREFIX>`, `--force`, `--agents` (v1.1) | `commands/init.rs` |
| `agents` | none | `commands/agents.rs` |
| `update` | `--dry-run` | `commands/update.rs` |

- `update` only exists with the default-on `self-update` Cargo feature.
- Global flags (`GlobalArgs`, `cli.rs:46-75`):
  - `--dir <DIR>`, also read from `UNBLOCK_DIR`
  - `--actor <ACTOR>`, also read from `UNBLOCK_ACTOR`
  - `-o/--output json|robot|plain|csv|markdown`
  - `-v…` (verbosity) and `-q` (quiet)
  - `-h`, `-V`
- Output formats are defined in `crates/unblock-model/src/output.rs`. A `toon` format is reserved behind a feature and has no encoder in v1.
- Report shape goldens: `crates/unblock-cli/src/snapshots/unblock_cli__output__tests__lifecycle_*.snap` (5) and `crates/unblock-cli/tests/snapshots/{init_agents__*,migrate_doctor__*}.snap`.

### Exit codes: a stable 0–8 contract, 36 error codes
- Canonical golden: `crates/unblock-error/tests/snapshots/exit_code_table__golden_exit_code_table.snap`, as `[code, exit, retryable, hint_shape]`.
- Source: `crates/unblock-error/src/code.rs`.
- CLI mapping: `crates/unblock-cli/src/exit.rs`.

| Exit | Meaning | Codes |
|---|---|---|
| 0 | ok | none |
| 1 | internal | `INTERNAL_ERROR` |
| 2 | workspace/db | `DATABASE_NOT_FOUND`, `DATABASE_LOCKED`ᴿ, `SCHEMA_MISMATCH`, `DATABASE_ERROR`, `NOT_INITIALIZED`, `ALREADY_INITIALIZED`, `RATE_LIMITED`ᴿ |
| 3 | not-found/id | `ISSUE_NOT_FOUND`, `AMBIGUOUS_ID`ᴿ, `ID_COLLISION`, `INVALID_ID`, `NOTHING_TO_DO`, `ALREADY_CLAIMED`ᴿ |
| 4 | validation | `VALIDATION_FAILED`ᴿ, `INVALID_STATUS`ᴿ, `INVALID_TYPE`ᴿ, `INVALID_PRIORITY`ᴿ, `REQUIRED_FIELD`ᴿ, `POLICY_VIOLATION` |
| 5 | dependency | `CYCLE_DETECTED`, `DEPENDENCY_NOT_FOUND`, `HAS_DEPENDENTS`, `SELF_DEPENDENCY`, `DUPLICATE_DEPENDENCY` |
| 6 | sync/path | `JSONL_PARSE_ERROR`, `PREFIX_MISMATCH`, `IMPORT_COLLISION`, `SYNC_CONFLICT`, `CONFLICT_MARKERS`, `PATH_TRAVERSAL` |
| 7 | config | `CONFIG_ERROR`, `CONFIG_NOT_FOUND`, `CONFIG_PARSE_ERROR` |
| 8 | io/json | `IO_ERROR`, `JSON_ERROR` |

- ᴿ marks a code that is retryable.
- Stream rules (D48, `exit.rs:1-40`):
  - In `json`/`robot` mode, errors go to stdout.
  - In `plain`/`csv`/`markdown` mode, errors go to stderr.
  - `unblock mcp` sends structured errors to stderr, because its stdout carries the JSON-RPC protocol.
- Usage errors from clap also exit 2 (`cli.rs` tests).

### MCP surface: 8 tools, 5 resources, 3 prompts

**Canonical sources:**
- Tools: the `#[tool(name=…)]` attributes in `crates/unblock-mcp/src/tools/{issue,claim,defer,query,dep,sync,diagnostics,comment}.rs`.
- Descriptor document: `crates/unblock-mcp/src/resources/capabilities.rs`.
- Full JSON Schema for every tool: `crates/unblock-mcp/tests/snapshots/contract_suite__schema_bundle.snap`.
- Descriptors: `…/contract_suite__capabilities.snap`.
- Prompt goldens: `…/contract_suite__prompt_*.snap` (3).
- Resource URI parser: `crates/unblock-mcp/src/resources/mod.rs:43-82`.
- Prompts: `crates/unblock-mcp/src/prompts/mod.rs`.
- **Best generator input:** the `unblock agents` block. It is rendered from `unblock_mcp::agents_digest()` by `crates/unblock-cli/src/commands/agents.rs`, with golden `crates/unblock-cli/tests/snapshots/init_agents__agents_managed_block.snap`. The live copy is repo-root `AGENTS.md:1-137`, which has 43 action rows with required and optional params.

**Tools.** The discriminant key is `action` unless noted.

| Tool | Discriminant values |
|---|---|
| `issue` (11) | `create`, `create_bulk`, `show`, `update`, `close`, `reopen`, `delete`, `restore`, `relabel`, `close_eligible`, `config` (`op: get/set/unset/list`) |
| `claim` | flat (no discriminant): needs `id` and `assignee` |
| `defer` | `defer`, `undefer` |
| `query` (key is **`kind`**) | `list`, `ready`, `blocked`, `search`, `count`, `stale`, `labels`, `epics` |
| `dep` | `add`, `remove`, `list`, `tree`, `cycles`, `graph` |
| `sync` | `export`, `import`, `import_bd` |
| `diagnostics` (key is **`kind`**) | `stats`, `info`, `where`, `version`, `lint`, `changelog`, `orphans`, `dangling` |
| `comment` | `add`, `list`, `update`, `delete` (soft-redact) |

**Resources:**
- `unblock://issues/{id}`
- `unblock://issues/ready`
- `unblock://issues/blocked`
- `unblock://capabilities`
- `unblock://schema`

**Prompts:**
- `triage`
- `plan_next_work`
- `close_with_suggestions`

**Quotas** (`Quotas::default`, `options.rs:187-232`):
- 256 KiB per request
- 10,000-element arrays
- 64 KiB strings and object keys
- batch of 100
- 64 concurrent requests

**Concurrency model:** each client spawns its own server process (D31). Writers across processes are serialized by the advisory lock `.unblock/.write.lock`.

**Exported library API** (`crates/unblock-mcp/src/lib.rs`): `run_mcp_server`, `McpServerOptions`, `Quotas`, `CONTRACT_VERSION`, `CONTRACT_HASH`, `capabilities`, `schema_bundle`, `agents_digest`, plus their DTOs. This API is internal: the crates are not published, so these exports should not be documented as a public API.

### Config
- **Precedence, six layers, highest first** (`crates/unblock-config/src/lib.rs:4-12`):
  1. CLI flags
  2. `UNBLOCK_*` environment variables
  3. Project file `.unblock/config.toml`
  4. User file `$XDG_CONFIG_HOME/unblock/config.toml`, or `~/.config/unblock/config.toml` on every OS (`user_config.rs:43-56`)
  5. The database `config` table, written by `issue {action:"config"}`
  6. Defaults
- **Project file:** parsed in `crates/unblock-config/src/schema.rs`, struct `ProjectConfig`.
  - Unknown keys produce a warning.
  - A known key with the wrong type is a hard error.
  - `auth_token` and `[remote].auth_token` are rejected.
- **Keys** (`crates/unblock-config/src/keys.rs`):
  - Startup keys: `db_filename`, `jsonl_filename` (spelled `jsonl_export_filename` in TOML), `id_prefix`, `write_lock_timeout_ms`, `backend`, `deletions_retention_days`.
  - Runtime keys: `actor`, `output_format`, `jsonl_export`, `search_cap`.
  - Layer keys (allowed in the user file and the DB table): `actor`, `output_format`, `search_cap`.
- **Defaults** (`src/snapshots/unblock_config__config__tests__default_workspace_config.snap`):

  | Key | Default |
  |---|---|
  | `actor` | `"unblock"` |
  | `output_format` | `json` |
  | `jsonl_export` | `false` |
  | `search_cap` | `50` |
  | `db_filename` | `unblock.db` |
  | `jsonl_filename` | `issues.jsonl` |
  | `id_prefix` | `ub` |
  | `write_lock_timeout_ms` | `30000` |

- **Workspace discovery** (`crates/unblock-config/src/discovery.rs`), in order: `--db`, then `--dir`/`UNBLOCK_DIR`, then `CLAUDE_PROJECT_DIR`, then a walk-up from the working directory looking for `.unblock` or the monorepo alias `_unblock`.

### Environment variables

| Variable | Status | Where read |
|---|---|---|
| `UNBLOCK_DIR` | Active | clap, `cli.rs:49` |
| `UNBLOCK_ACTOR` | Active | `cli.rs:53`, `env.rs:82` |
| `UNBLOCK_OUTPUT_FORMAT` | Active | `env.rs:87`, `cli/src/output.rs:27` |
| `UNBLOCK_JSONL` | Parsed, but nothing consumes it yet (`keys.rs:68-71`, ub-p1h) | `env.rs:83` |
| `UNBLOCK_REMOTE_URL`, `UNBLOCK_AUTH_TOKEN` | Reserved for v1.3; parsed but unused | `env.rs:91-92` |
| `CLAUDE_PROJECT_DIR` | Active | `discovery.rs:133` |
| `XDG_CONFIG_HOME` / `HOME` / `USERPROFILE` | Active (user file location) | `user_config.rs` |
| `AXOUPDATER_GITHUB_TOKEN` | Active (`update` command) | `commands/update.rs:37` |
| `UNBLOCK_BUILD_*` | Build-time only | `commands/version.rs:30-35` |

- Legacy `BD_`, `BR_` and `BEADS_` variables are deliberately ignored.

### HTTP and OpenAPI
None. The only network access is `unblock update`, which talks to the GitHub releases API.

## 3. Existing doc material (all English, no Portuguese found)

| File | Class | Notes |
|---|---|---|
| `README.md` | **PUBLIC-READY** | Main source: pitch, install, quickstart for 4 MCP clients, MCP tables, CLI table, exit codes, self-update. Strip the internal FR/D/NFR ids. |
| `AGENTS.md` (repo root) | **PUBLIC-READY (generated)** | The managed block only. Best source for the MCP reference. |
| `crates/README.md` | MIXED | Architecture and layering table is usable for an Architecture page; the links to PRD/plans are internal. |
| `RELEASING.md` | INTERNAL | Maintainer runbook. Usable later as a contributor page. |
| `LICENSE-*` | PUBLIC | |
| `docs/PRD.md` (664 KB) | INTERNAL | |
| `docs/PROCESS.md`, `docs/STYLE.md` | INTERNAL | STYLE.md is an AI response-style guide. |
| `docs/roadmap.html` | INTERNAL | Contains the brand palette. |
| `docs/plans/**` (00-roadmap, 01-design-spine, implementation-plan, ci-cd-and-distribution, STATUS (retired stub), README, `crates/*.md` ×12, `templates/*.md` ×3) | INTERNAL | The spine §5 is the interface SSOT. Mine it for concepts only. |
| `CLAUDE.md`, `crates/*/CLAUDE.md` (12) | INTERNAL | Agent files |
| `.claude/agents/*.md` (12) | INTERNAL | |
| `.knowledge/**` (wiki runs and topics, memories ~50) | INTERNAL | |
| `crates/unblock-fuzz/fuzz/README.md` | INTERNAL (contributor) | |
| `temp/**` | INTERNAL. **Never sync.** It contains `temp/secrets.txt`. | |

There is no CHANGELOG file. The `diagnostics changelog` kind is the issue-event log, not a product changelog.

## 4. Brand assets
- **Banner:** `docs/assets/unblock-readme-banner.png` (1600×656, dark navy background with a cyan→blue→magenta gradient hexagon/lock logo). It looks AI-generated: there is a sparkle watermark in the bottom-right, and it shows commands that don't exist ("unblock sync", "mcp run"). No standalone logo, icon or favicon exists.
- **Palette** (`docs/roadmap.html:3-42`):
  - Light: accent `#b95f14`, accent-soft `#d5843b`, ink `#1b2430`, ground `#e9ecf0`, panel `#f6f7f9`, done `#2b8d57`, alert `#ad463f`.
  - Dark: accent `#eb9b4d`, ground `#0f131a`, panel `#161b23`, ink `#e6e9ef`, done `#54b57f`, alert `#d1706a`.
- The banner's cyan/magenta tones don't match the orange accent in the palette, so a primary brand color needs to be chosen.

## 5. Proposed Mintlify page tree (`unblock/`)

**Get started**
- `overview`: what it is, the two modes, why. Source: `README.md:1-60`.
- `installation`: shell, PowerShell, source build, the PATH note, no `cargo install`. Source: README §Install, `dist-workspace.toml`.
- `quickstart`: init, agents, register the client, spawn. Source: README §Quickstart.
- `mcp-clients`: tabs for Claude Code, VS Code, Cursor and Claude Desktop, plus the `${…}` pitfall. Source: README Quickstart step 3.

**Concepts**
- `workspace-and-discovery`: `.unblock/`, the `_unblock` alias, discovery precedence. Source: `config/src/discovery.rs`, README step 4.
- `local-vs-remote-mode`: remote mode is not shipped yet. Source: README, `docs/plans/00-roadmap.md` (concepts only).
- `issues-and-ids`: id prefix, types, status, priority, tombstones. Source: `crates/unblock-model/src/*`, schema snapshot.
- `dependencies-and-ready-work`: ready/blocked, cycles, dangling edges. Source: `tools/dep.rs`, `tools/query.rs`, `crates/unblock-policy`.
- `atomic-claim-and-concurrency`: claim, write lock, one server per client. Source: `tools/claim.rs`, README.
- `output-and-streams`: formats, the stdout/stderr rules. Source: `exit.rs`, `crates/unblock-render`.

**Guides**
- `agent-workflow`: triage, plan, claim, close. Source: `prompts/*.rs`, prompt snapshots.
- `jsonl-export-import`: includes the `bd` migration. Source: `tools/sync.rs`, `crates/unblock-sync`.
- `epics-and-labels`: v1.1. Source: `tools/query.rs`, `tools/issue.rs` (`relabel`, `close_eligible`).
- `configuration-layers`: v1.1. Source: `config/src/{lib,keys,user_config}.rs`.
- `upgrading-and-migrations`: `migrate`, `doctor`, `update`, `SCHEMA_MISMATCH`. Source: `cli.rs:101-108`, README §Self-update.

**Reference**
- `cli`: one section per subcommand. Source: `help_snapshots__*.snap`, `cli.rs`.
- `mcp/tools`, one page per tool (8): params from the `AGENTS.md` table and `contract_suite__schema_bundle.snap`.
- `mcp/resources`: source `resources/mod.rs`, `contract_suite__capabilities.snap`.
- `mcp/prompts`: source `prompts/mod.rs`, `contract_suite__prompt_*.snap`.
- `mcp/contract-and-discovery`: contract id and hash. Source: `options.rs`.
- `configuration`: keys, defaults, file locations. Source: `keys.rs`, `schema.rs`, default-config snapshot.
- `environment-variables`: source `env.rs`, `cli.rs`, `discovery.rs`, `update.rs`.
- `error-codes-and-exit-codes`: source the exit-code golden, `code.rs`.
- `quotas-and-limits`: source `options.rs:167-232`.

**Project**
- `architecture`: crate layering. Source: `crates/README.md`.
- `changelog`: there is no source file. Generate it from git tags and GitHub releases, plus the dated contract-bump history in the `options.rs:20-144` doc comment.
- `license`

## 6. Drift watch-list

| Glob | Pages affected |
|---|---|
| `README.md` | overview, installation, quickstart, mcp-clients, upgrading |
| `AGENTS.md`, `crates/unblock-cli/tests/snapshots/init_agents__agents_managed_block.snap` | mcp/* reference, errors |
| `crates/unblock-mcp/src/options.rs` (`CONTRACT_VERSION`/`HASH`) | contract-and-discovery, changelog. **Primary trigger for all MCP pages.** |
| `crates/unblock-mcp/tests/snapshots/contract_suite__*.snap` | mcp/tools/*, resources, prompts |
| `crates/unblock-mcp/src/tools/**/*.rs` | mcp/tools/*, concept pages |
| `crates/unblock-mcp/src/resources/**`, `crates/unblock-mcp/src/prompts/**` | mcp/resources, mcp/prompts, agent-workflow |
| `crates/unblock-cli/src/cli.rs`, `crates/unblock-cli/src/commands/**`, `crates/unblock-cli/tests/snapshots/help_snapshots__*.snap` | cli, quickstart, upgrading |
| `crates/unblock-cli/src/exit.rs`, `crates/unblock-error/src/code.rs`, `crates/unblock-error/tests/snapshots/exit_code_table__*.snap` | error-codes, output-and-streams |
| `crates/unblock-config/src/{keys,schema,env,user_config,discovery}.rs`, `crates/unblock-config/src/snapshots/*.snap`, `crates/unblock-config/tests/snapshots/*.snap` | configuration, environment-variables, workspace-and-discovery, configuration-layers |
| `crates/unblock-cli/src/commands/init.rs` | quickstart, configuration (the scaffold text) |
| `crates/unblock-model/src/output.rs` | output-and-streams, cli |
| `Cargo.toml` (`[workspace.package].version`), `dist-workspace.toml`, `crates/unblock-cli/Cargo.toml` (`[features]`) | installation, changelog, upgrading |
| `crates/README.md` | architecture |
| `docs/plans/00-roadmap.md` | Review-only signal for the remote-mode and roadmap mentions. Do not publish it. |
| `docs/assets/**` | brand |

## 7. Gaps and inconsistencies
1. **Main is ahead of the latest release.** The newest tag and manifest version are `v1.0.2`, but main exposes contract `v1.12`. `options.rs` attributes v1.11 and v1.12 to v1.1 (D56/D57). That means `relabel`, `close_eligible`, `issue config`, `query labels/epics`, `init --agents`, the six-layer config and the user config file are unreleased. The README mixes "from v1.1" notes into otherwise current text. The docs need a version badge or callout on each of these features. [INFERENCE] v1.0.2 most likely ships contract `v1.10`.
2. **`--db` is documented but not exposed.** The README says precedence is "`--db` > `--dir`". `CliOverrides::with_db` exists, but `GlobalArgs` (`cli.rs:46-75`) has no `--db` flag.
3. **Prompt descriptions differ between the wire and the descriptor.** The live `prompts/list` text (`prompts/mod.rs:20-41`, e.g. "Guided triage of blocked, unassigned, and deferred work.") differs from the `unblock://capabilities` and `AGENTS.md` text ("A guided triage workflow over… ", "Drive the ready -> claim selection (FR-20)").
4. **Internal ids leak into user-facing strings.** CLI `--help` contains "FR-20", "MF-2", "FORK-4" and "spine §5b". Prompt descriptors contain "(FR-11)". Strip these when adapting.
5. **The scaffolded `config.toml` points to an internal doc.** It says to see `docs/plans/crates/unblock-config.md` (`commands/init.rs:321`), which won't exist in a user's repo. It should point to the public config page.
6. **The README links to internal plans.** "Documentation" points to `docs/PRD.md` and `docs/plans/`, and the "Why" section cites `ci-cd-and-distribution.md`.
7. **Inert and reserved settings.** `UNBLOCK_JSONL` and `jsonl_export` are accepted but nothing reads them (ub-p1h). `UNBLOCK_REMOTE_URL`, `UNBLOCK_AUTH_TOKEN` and `[remote]` are reserved for v1.3. Remote mode is described in the README but not shipped (`remote` is a non-default feature). Each needs a "not yet available" callout.
8. **Attribution fields are discarded.** `agent_name`, `harness` and `model` are accepted on 5 tools and thrown away (D52). The docs should say so.
9. **No changelog file, and no release notes in the repo.**
10. **The banner is not usable as a brand asset.** It shows commands that don't exist ("unblock sync") and carries an AI-generator watermark. There is no logo, icon or favicon file, and its colors don't match the `roadmap.html` palette.
11. **Undocumented details.** The `_unblock` alias, the quota limits, the user config path and the rate-limit behaviour of `update` are missing from the README or only partly there. The help text names `CLAUDE_PROJECT_DIR`, but `--help` does not.
12. **Exit code 2 is overloaded.** Clap usage errors also exit 2, sharing the workspace/db band. The 0–8 table doesn't mention this.
13. **`temp/secrets.txt` exists** in the working tree. The docs sync must exclude `temp/**`.