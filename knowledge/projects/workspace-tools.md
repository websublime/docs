> **Snapshot.** Inventory written on 2026-11-12 by reading the local checkout (`../workspace-node-tools`), files only; nothing was built or run. The refs that are documented come from D5 and `sync/registry.yaml`. Section 7 is the first input to `sync/reports/workspace-tools.md` (D6).

# workspace-tools (`websublime/workspace-tools`): inventory for the Mintlify docs

All paths below are relative to `../workspace-node-tools`. Everything comes from reading files; nothing was built or run. Claims marked [INFERENCE] are not runtime-checked.

---

## 1. Identity

| Field | Value (evidence) |
|---|---|
| Purpose | Changeset-based version management for JS/TS single-package repos and monorepos: changesets, version bumps, changelogs, dependency upgrades, health audit, running commands across packages (`README.md:7-11`). |
| Audience | JS/TS monorepo maintainers and CI/CD pipelines (CLI); Node/TS tool authors (npm bindings); Rust developers (library crates). |
| Stack | Rust edition 2024, `rust-version` 1.90.0 (`Cargo.toml` `[workspace.package]`). CLI uses clap 4, tokio, dialoguer, indicatif, comfy-table. Node bindings use napi-rs 3 (`crates/node/Cargo.toml`). The npm package uses TypeScript, rolldown/unbuild and ava. |
| License | MIT (`Cargo.toml`, `LICENSE-MIT`, `packages/workspace-tools/LICENSE`). |
| Repo remote | `https://github.com/websublime/workspace-tools` (`Cargo.toml`, `package.json`). The local folder is named `workspace-node-tools`. |
| Status signals | All crates are 0.0.x. The npm package is 2.0.24. The CLI CHANGELOG's latest entry is 0.0.36 (2026-01-14). `crates/pkg/README.md:245-253` says "under active development" with Epics 3–5 "Planned" (stale). |

**Published artifacts**

| Name | Kind | Version | Registry / channel | Manifest |
|---|---|---|---|---|
| `sublime_cli_tools` (binary `workspace`) | Rust crate + binary | 0.0.36 | crates.io; GitHub Releases via cargo-dist (shell + powershell installers) | `crates/cli/Cargo.toml` (`[[bin]] name="workspace"`), `dist-workspace.toml` |
| `sublime_pkg_tools` | Rust library | 0.0.27 | crates.io | `crates/pkg/Cargo.toml` |
| `sublime_git_tools` | Rust library (libgit2) | 0.0.18 | crates.io | `crates/git/Cargo.toml` |
| `sublime_standard_tools` | Rust library | 0.0.15 | crates.io | `crates/standard/Cargo.toml` |
| `sublime_node_tools` | cdylib, `publish = false` | 0.0.4 | not published; built by napi into the npm package | `crates/node/Cargo.toml` |
| `@websublime/workspace-tools` | npm (napi bindings) | 2.0.24 | npmjs (public) | `packages/workspace-tools/package.json` |
| `@websublime/workspace-tools-{darwin-arm64,darwin-x64,linux-x64-gnu,linux-x64-musl,linux-arm64-gnu,linux-arm64-musl,win32-x64-msvc,win32-arm64-msvc}` | npm platform packages (8) | workspace:* | npmjs | `packages/workspace-tools/npm/*/package.json` |

- **Binary targets (cargo-dist):** aarch64/x86_64 apple-darwin, aarch64/x86_64 linux-gnu, x86_64 linux-musl, x86_64 windows-msvc (`dist-workspace.toml`).
- **Release tooling:**
  - Crates: release-plz with git-cliff (`release-plz.toml`, `cliff.toml`, `.github/workflows/release-crates.yml`).
  - Binaries: `.github/workflows/release.yml`.
  - npm: `.github/workflows/release-node.yml`, manual `workflow_dispatch`.
- **`crates/audit/`** contains only an empty `src/` and is not a workspace member. It is dead.

---

## 2. Public surface

### 2.1 Install methods
`README.md:33-80` and `crates/cli/README.md:25-56`:
- Shell installer: `sublime_cli_tools-installer.sh`
- PowerShell installer: `sublime_cli_tools-installer.ps1`
- `cargo install sublime_cli_tools`
- Manual `.tar.xz` / `.zip` download from GitHub Releases
- From source: `cargo install --path crates/cli`
- npm bindings: `npm|pnpm|yarn add @websublime/workspace-tools` (`packages/workspace-tools/README.md`)

### 2.2 `workspace` CLI: 11 top-level commands, 23 leaf commands

- **Canonical source:** `crates/cli/src/cli/commands.rs` (the `Commands` enum plus `*Args` and `*Commands` enums).
- **Root struct and global flags:** `crates/cli/src/cli/mod.rs`.
- **Routing:** `crates/cli/src/cli/dispatch.rs`.
- **Handlers:** `crates/cli/src/commands/**`.
- There are no clap aliases or hidden commands. A generator can re-derive everything with `Cli::command()` (clap `CommandFactory`). There is also an existing generator: `crates/cli/scripts/generate-command-docs.sh` and `generate_command_docs.rs`.

**Global flags (8)** (`cli/mod.rs:123-197`):
- `-r/--root <PATH>`
- `-l/--log-level <silent|error|warn|info|debug|trace>` (default `info`)
- `-f/--format <human|json|json-compact|quiet>` (default `human`)
- `--no-color`
- `-c/--config <PATH>`
- `-q/--quiet` (conflicts with log-level, format, verbose)
- `-v/--verbose`
- clap's automatic `--help` / `--version`

| Command | Flags / args (defaults) | Handler |
|---|---|---|
| `init` | `--changeset-path` (.changesets), `--environments`, `--default-env`, `--strategy`, `--registry` (https://registry.npmjs.org), `--config-format json\|toml\|yaml`, `--force`, `--non-interactive` | `commands/init.rs` |
| `config show` | — | `commands/config.rs` |
| `config validate` | — | `commands/config.rs` |
| `changeset create` | `--bump`, `--env`, `--branch`, `--message`, `--packages`, `--non-interactive`, `--force` | `commands/changeset/add.rs` |
| `changeset update [ID]` | `--commit`, `--packages`, `--bump`, `--env` | `changeset/update.rs` |
| `changeset list` | `--filter-package`, `--filter-bump`, `--filter-env`, `--sort date\|bump\|branch` (date) | `changeset/list.rs` |
| `changeset show <BRANCH>` | — | `changeset/show.rs` |
| `changeset edit [BRANCH]` | — (uses `$VISUAL` / `$EDITOR`) | `changeset/edit.rs` |
| `changeset delete <BRANCH>` | `--force` | `changeset/remove.rs` |
| `changeset history` | `--filter-package`, `--filter-env`, `--filter-bump`, `--since`, `--until`, `--limit` | `changeset/history.rs` |
| `changeset check` | `--branch` | `changeset/check.rs` |
| `bump` | `--dry-run` (default mode), `--execute`, `--snapshot`, `--snapshot-format`, `--prerelease <TAG>`, `--packages`, `--git-tag`, `--git-push` (requires git-tag), `--git-commit`, `--no-changelog`, `--no-archive`, `--always-archive`, `--force`, `--show-diff` | `commands/bump/{preview,execute,snapshot}.rs` |
| `upgrade check` | `--no-major`, `--no-minor`, `--no-patch`, `--no-dev`, `--peer`, `--packages`, `--registry` | `upgrade/check.rs` |
| `upgrade apply` | `--dry-run`, `--patch-only`, `--minor-and-patch`, `--packages`, `--auto-changeset`, `--changeset-bump` (patch), `--no-backup`, `--force` | `upgrade/apply.rs` |
| `upgrade backups list` | — | `upgrade/rollback.rs` |
| `upgrade backups restore <ID>` | `--force` | `upgrade/rollback.rs` |
| `upgrade backups clean` | `--keep` (5), `--force` | `upgrade/rollback.rs` |
| `audit` | `--sections all\|upgrades\|dependencies\|version-consistency\|breaking-changes`, `--output`, `--min-severity` (info), `--verbosity` (normal), `--no-health-score`, `--export` + `--export-file` | `commands/audit/*.rs` |
| `changes` | `--since`, `--until`, `--branch`, `--staged` / `--unstaged`, `--packages` | `commands/changes.rs` |
| `version` | — (global `--verbose`) | `commands/version.rs` |
| `clone <URL> [DEST]` | `--changeset-path`, `--environments`, `--default-env`, `--strategy`, `--registry`, `--config-format`, `--non-interactive`, `--skip-validation`, `--force`, `--depth` | `commands/clone.rs` |
| `status` | — | `commands/status.rs` |
| `execute` | `--cmd` (required; `npm:<script>` or a system command), `--filter-package` (conflicts with `--affected`), `--affected` with `--since` / `--until` / `--branch`, `--parallel`, `-- <args>` | `commands/execute.rs` |

- **Exit codes** follow sysexits: OK=0, USAGE=64, DATAERR=65, NOINPUT=66, NOUSER=67, NOHOST=68, UNAVAILABLE=69, SOFTWARE=70, OSERR=71, OSFILE=72, CANTCREAT=73, IOERR=74, TEMPFAIL=75, PROTOCOL=76, NOPERM=77, CONFIG=78 (`crates/cli/src/error/exit_codes.rs`).
- **Shell completions:** `generate_completions` exists (`crates/cli/src/cli/completions.rs`) but no subcommand exposes it.
- **Output:** strict stream separation; logs go to stderr and command output to stdout (`cli/mod.rs:79-87`, `crates/cli/src/output/`).

### 2.3 Config file
- **File names**, searched in this order: `repo.config.toml` → `.json` → `.yaml` → `.yml` in the root. `--config` overrides the search.
  - Discovery code is duplicated in four places: `crates/cli/src/commands/mod.rs:85-170` (`find_and_load_config`), `crates/cli/src/commands/config.rs:124,326`, `crates/cli/src/commands/init.rs:341`, and `crates/node/src/commands/config.rs:112`.
- **Writer:** `init` serializes `PackageToolsConfig` as `repo.config.<fmt>` (`init.rs:568-628`). It also creates `.changesets/`, `.changesets/history/`, `.workspace-backups` and `.gitignore` entries (`init.rs:10-14`).
- **Schema:** `PackageToolsConfig` in `crates/pkg/src/config/types.rs:89-149`. Parsing is `from_str` (`types.rs:368`) and validation is in `crates/pkg/src/config/validation.rs`. The 9 sections each have a file in `crates/pkg/src/config/`:

  | Section | File |
  |---|---|
  | `changeset` | `changeset.rs` |
  | `version` | `version.rs` |
  | `dependency` | `dependency.rs` |
  | `upgrade` (with `registry`, `registry.scoped`, `backup`) | `upgrade.rs` |
  | `changelog` (with `conventional`, `exclude`, `template`) | `changelog.rs` |
  | `git` | `git.rs` |
  | `audit` (with `sections`, `upgrades`, `dependencies`, `breaking_changes`, `version_consistency`) | `audit.rs` |
  | `execute` | `execute.rs` |
  | optional `workspace.patterns` | `workspace.rs` |

- **Example with every key and its default:** `crates/pkg/examples/basic-config.toml`. Also `minimal-config.toml` and `monorepo-config.toml`.
- **Section namespace:** see gap #1. The docs show `[package_tools.*]`, but the parser and `init` use top-level `[changeset]`, `[version]`, ….
- **Standard-layer config** (package managers, monorepo detection, commands, fs) lives in `crates/standard/src/config/standard.rs`. It is documented in `crates/standard/README.md:872+`.

### 2.4 Node binding API (`@websublime/workspace-tools`)

- **Native functions:** `#[napi]` functions in `crates/node/src/commands/*.rs`, re-exported in `crates/node/src/lib.rs`.
- **Generated types:** `packages/workspace-tools/src/binding.d.ts`.
- **Public entry:** `packages/workspace-tools/src/index.ts`, built to `dist/{esm,cjs,types}` (`package.json` `exports`).

17 functions: 16 async plus `getVersion()`, which is sync. Every function takes a `{ root, configPath?, ... }` object and returns `Promise<{ success, data?, error?: ErrorInfo }>`.

| JS function | CLI equivalent | Source |
|---|---|---|
| `getVersion()` | — | `node/src/lib.rs` |
| `status` | `status` | `commands/status.rs:453` |
| `init` | `init` | `commands/init.rs:508` |
| `changesetAdd` | `changeset create` | `commands/changeset.rs:465` |
| `changesetUpdate` | `changeset update` | `changeset.rs:860` |
| `changesetList` | `changeset list` | `changeset.rs:1239` |
| `changesetShow` | `changeset show` | `changeset.rs:1578` |
| `changesetRemove` | `changeset delete` | `changeset.rs:1934` |
| `changesetHistory` | `changeset history` | `changeset.rs:2394` |
| `changesetCheck` | `changeset check` | `changeset.rs:2722` |
| `bumpPreview` | `bump --dry-run` | `commands/bump.rs:990` |
| `bumpApply` | `bump --execute` | `bump.rs:1147` |
| `bumpSnapshot` | `bump --snapshot` | `bump.rs:1284` |
| `execute` | `execute` (adds `timeoutSecs` / `perPackageTimeoutSecs`) | `commands/execute.rs:623` |
| `configShow` | `config show` | `commands/config.rs:589` |
| `configValidate` | `config validate` | `config.rs:926` |
| `upgradeCheck` | `upgrade check` | `commands/upgrade.rs:526` |

- **Not bound:** `upgradeApply`, `backupList`, `backupRestore`, `backupClean`, `audit`, `changes` and `clone` exist only as commented-out stubs (`upgrade.rs:585-640`, `audit.rs:78`, `changes.rs:81`, `clone.rs:73`). `changeset edit` and `version` are also not bound.
- **Types without functions:** `index.ts` exports the types for the unbound upgrade and backup functions anyway.
- **`ErrorInfo.code`** values (`crates/node/src/error.rs:61-136`): `ECONFIG`, `EVALIDATION`, `EEXEC`, `EGIT`, `EPKG`, `ENOENT`, `EIO`, `ENETWORK`, `EUSER`, `ETIMEOUT`.
- **Platforms:** 8 napi targets. A WASI/browser build also exists (`build-binding:wasi`, `src/*.wasi*.{cjs,mjs,js}`, `"browser": "browser.js"`).

### 2.5 Rust library entry points (`src/lib.rs`)
- `sublime_cli_tools`: modules `cli`, `commands`, `error`, `output`, `interactive`. Re-exports `Cli`, `Commands`, `LogLevel`, `OutputFormatArg`, `CliError`, `Result`, `prompts`, `JsonResponse`, `MultiProgress`, `OutputFormat`, `ProgressBar`, `Spinner`.
- `sublime_pkg_tools`: modules `audit`, `changelog`, `changes`, `changeset`, `config`, `error`, `types`, `upgrade`, `version`. The API spec is `crates/pkg/SPEC.md`.
- `sublime_git_tools`: `Repo`, `RepoCommit`, `RepoError`, `RepoTags`, `GitChangedFile`, `GitDiffStats`, `GitFileStatus`, `EnvProvider`, `SystemEnvProvider` (`crates/git/src/lib.rs:123-128`). Spec: `crates/git/SPEC.md`.
- `sublime_standard_tools`: modules `command`, `config`, `error`, `filesystem`, `monorepo`, `node`, `project`. Spec: `crates/standard/SPEC.md`.

### 2.6 MCP / HTTP / OpenAPI
None.

### 2.7 Environment variables (all read in code)

| Variable | Where read |
|---|---|
| `NO_COLOR` | `cli/mod.rs:318`, `output/style.rs:95`, `output/table.rs:665`, `interactive/theme.rs:452` |
| `RUST_LOG` (overrides `--log-level`) | `output/logger.rs:125` |
| `VISUAL`, `EDITOR` (`changeset edit`) | `utils/editor.rs:159-167` |
| `GH_TOKEN`, `GITHUB_TOKEN`, `GIT_TOKEN`, `GIT_USERNAME`, `GIT_PASSWORD`, `USER`, `USERNAME` (git auth) | `crates/git/src/repo.rs:3735-3866` |
| `${VAR}` interpolation inside `.npmrc` | `crates/pkg/src/upgrade/registry/npmrc.rs:465` |
| 16 `SUBLIME_*` variables: `SUBLIME_PACKAGE_MANAGER_ORDER`, `SUBLIME_PACKAGE_MANAGER`, `SUBLIME_WORKSPACE_PATTERNS`, `SUBLIME_PACKAGE_DIRECTORIES`, `SUBLIME_EXCLUDE_PATTERNS`, `SUBLIME_MAX_SEARCH_DEPTH`, `SUBLIME_COMMAND_TIMEOUT`, `SUBLIME_BUFFER_SIZE`, `SUBLIME_MAX_CONCURRENT`, `SUBLIME_IGNORE_PATTERNS`, `SUBLIME_ASYNC_BUFFER_SIZE`, `SUBLIME_MAX_CONCURRENT_IO`, `SUBLIME_IO_TIMEOUT`, `SUBLIME_CUSTOM_WORKSPACE_FIELDS`, `SUBLIME_COLLECTION_WINDOW_MS`, `SUBLIME_COLLECTION_SLEEP_US`, `SUBLIME_IDLE_SLEEP_MS` | `crates/standard/src/config/standard.rs:548-847` (ranges are validated there) |
| `WORKSPACE_SKIP_HOOKS` (git hook) | `scripts/git-hooks/pre-push:33` |

---

## 3. Existing doc material

| File | Class | Lang | Notes |
|---|---|---|---|
| `README.md` | MIXED | EN | Good overview, quickstart, workflows, CI. Stale on release tooling, crate names and global config (see §7). |
| `crates/cli/README.md` (~1940 lines) | PUBLIC-READY | EN | Primary CLI reference: commands, global options, config reference (`:1255-1868`). Drop the "Planning Documents (Historical)" links at `:1931+`. |
| `packages/workspace-tools/README.md` | PUBLIC-READY (has errors) | EN | npm API reference. Several parameter names are wrong (see §7). |
| `crates/node/README.md` | MIXED | EN | Usage, error codes, dev build. Says "23 functions". |
| `crates/pkg/README.md` | MIXED | EN | Library intro is OK. Status and license sections are stale. |
| `crates/git/README.md`, `crates/standard/README.md` | PUBLIC-READY | EN | Rust library guides. |
| `crates/{pkg,git,standard}/SPEC.md` | MIXED | EN | Detailed API specs, written partly for agent consultation. Usable as a Rust API reference source. |
| `crates/pkg/examples/README.md`, `crates/pkg/examples/*.toml` | PUBLIC-READY | EN | Config examples. |
| `crates/pkg/docs/guides/configuration.md` | MIXED / stale | EN | Uses `package-tools.toml` and unimplemented `SUBLIME_PKG_*` variables. |
| `crates/pkg/docs/type_relationships.md` | MIXED | EN | Architecture of pkg types. Possible "Concepts" source. |
| `scripts/git-hooks/README.md` | PUBLIC-READY (has stale bits) | EN | Git hooks guide. |
| `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` | PUBLIC (community) | EN | |
| `CHANGELOG.md`, `crates/*/CHANGELOG.md` | PUBLIC-READY | EN | git-cliff output. |
| `packages/workspace-tools/CHANGELOG.md` | stale | EN | Last entry 1.0.2 (2024-09), but the package is 2.0.24. |
| `packages/workspace-tools/npm/*/README.md` | INTERNAL (napi boilerplate) | EN | |
| `RELEASE.md` | INTERNAL / stale | EN | Describes Release Please. |
| `scripts/TESTING.md`, `crates/node/docs/BUILD_SCRIPTS.md`, `crates/cli/scripts/README.md`, `crates/pkg/tests/README.md`, `crates/pkg/tests/AUDIT_INTEGRATION_TESTS.md`, `.github/MERGE_STRATEGY.md` | INTERNAL (contributor/dev) | EN | |
| `crates/cli/docs/{PRD,PLAN,STORY_MAP,STORY_MAP_CLI_PATTERNS,PRE-RELEASE-PLAN,PACKAGES-FILTER-PLAN,REGISTRY-OVERRIDE-PLAN,BACKUP-CONTROL-PLAN,README}.md` | INTERNAL | EN | |
| `crates/cli/docs/{CLI,CLI_PATTERN_PLAN,CLI_PLAN_PARAMS,PLAN_STATUS_EXECUTE}.md` | INTERNAL | PT | |
| `crates/pkg/docs/{CONCEPT,PLAN,STORY_MAP,AUDIT_REPORT,IMPLEMENTATION_*,INTEGRATION_TEST_ANALYSIS}.md`, `STORY*` files (~20) | INTERNAL | EN | |
| `crates/pkg/docs/RESUMO_FASE1_2.md` | INTERNAL | PT | |
| `crates/node/docs/{NAPI_RESEARCH,PARAMETER_ANALYSIS,PLAN_NODE,STORY_MAP_NODE}.md` | INTERNAL | EN | |
| `docs/{AI_RESEARCH,PRODUCT_RESEARCH,PROMPT}.md` | INTERNAL | EN | |
| `docs/PLAN_CONFIG_DECOUPLING.md` | INTERNAL | PT | |
| `CLAUDE.md`, `AGENTS.md`, `.claude/**`, `.agents/**`, `.beads/**`, `temp/**`, `.worktrees/**` | INTERNAL (agent/tooling) | — | Never publish. |

---

## 4. Brand assets
- **Image files:** none anywhere in the repo (no png/svg/ico/jpg/gif/webp).
- **ASCII logo:** "WORKSPACE" in block glyphs, `ASCII_LOGO` at `crates/cli/src/cli/branding.rs:60-63`.
- **Names:** `FULL_NAME = "Workspace Tools"`, `SHORT_NAME = "workspace"` (`branding.rs:81-84`). Clap author string: "Sublime Labs" (`cli/mod.rs:116`). Footer: "Made with ❤️ by WebSublime".
- **Colors:** ANSI named colors only, no hex values. Headers/usage are bold Cyan; literals and valid values Green; placeholders Yellow; errors and invalid values Red (`branding.rs:87-94`).

---

## 5. Proposed Mintlify page tree

- **Overview**
  - Introduction ← `README.md:1-30`, `crates/cli/README.md:11-24`
  - Why Workspace Tools / features ← `README.md` "Key Features"
- **Get Started**
  - Installation (CLI: installer, cargo, binaries, source) ← `README.md:33-80`, `dist-workspace.toml`
  - Installation (Node bindings) ← `packages/workspace-tools/README.md` "Install", `package.json` `napi.targets`
  - Quickstart: 5-minute workflow ← `README.md` "5-Minute Workflow"
- **Concepts**
  - Changesets (lifecycle, active vs history, environments) ← `crates/pkg/docs/type_relationships.md`, `crates/pkg/src/changeset/`, `crates/cli/README.md:156-370`
  - Versioning strategies (independent / unified, dependency propagation) ← `README.md` "Core Concepts", `crates/pkg/src/config/{version,dependency}.rs`, `crates/pkg/src/version/`
  - Snapshots and prereleases ← `crates/cli/README.md:371-508`, `crates/cli/src/commands/bump/snapshot.rs`
  - Monorepo and package detection ← `crates/standard/README.md`, `crates/pkg/src/config/workspace.rs`
  - Output and logging model (stdout/stderr, JSON) ← `crates/cli/src/cli/mod.rs:63-87`, `crates/cli/README.md:1887-1903`
- **Guides**
  - Feature development / hotfix / onboarding ← `README.md` "Example Workflows"
  - Releasing (`bump`, git tag/commit/push, changelogs) ← `crates/cli/README.md` bump section, `crates/pkg/src/config/{changelog,git}.rs`
  - Dependency upgrades and backups ← `crates/cli/README.md:509-628`
  - Health audit ← `crates/cli/README.md:629-669`, `crates/pkg/src/config/audit.rs`
  - Running commands across packages (`execute`, `--affected`) ← `crates/cli/README.md:767-910`
  - CI/CD integration ← `README.md` "CI/CD Integration" and "CI/CD Pipeline"
  - Git hooks ← `scripts/git-hooks/README.md`, `scripts/install-hooks.sh`
  - Private registries and `.npmrc` ← `crates/cli/README.md:1560-1590`, `crates/pkg/src/upgrade/registry/`
  - Using from Node.js ← `packages/workspace-tools/README.md`, `crates/node/src/lib.rs` docs
- **CLI Reference** (one page per top-level command)
  - Global options ← `crates/cli/src/cli/mod.rs`
  - `init`, `config`, `changeset`, `bump`, `upgrade`, `audit`, `changes`, `status`, `execute`, `clone`, `version` ← `crates/cli/src/cli/commands.rs`, `crates/cli/README.md:79-1191`
  - Exit codes ← `crates/cli/src/error/exit_codes.rs`
- **Configuration Reference**
  - File discovery and formats ← `crates/cli/src/commands/mod.rs:85-170`
  - One section per config block: changeset, version, dependency, upgrade (registry, backup), changelog, git, audit, execute, workspace ← `crates/pkg/src/config/*.rs`, `crates/pkg/examples/*.toml`
  - Environment variables ← `crates/standard/src/config/standard.rs`, `crates/cli/src/**` env reads, `crates/git/src/repo.rs`
  - Standard-tools settings ← `crates/standard/README.md:872+`
- **Node API Reference**
  - Response and errors (`ApiResponse`, `ErrorInfo`, codes) ← `crates/node/src/{response,error}.rs`
  - Status and init; Changesets (7 functions); Bump (3); Execute; Config (2); Upgrade (`upgradeCheck`) ← `packages/workspace-tools/src/binding.d.ts`, `crates/node/src/types/*.rs`
- **Rust Libraries** (optional; or link out to docs.rs)
  - `sublime_pkg_tools` ← `crates/pkg/README.md`, `crates/pkg/SPEC.md`
  - `sublime_git_tools` ← `crates/git/README.md`, `crates/git/SPEC.md`
  - `sublime_standard_tools` ← `crates/standard/README.md`, `crates/standard/SPEC.md`
- **Changelog**
  - CLI ← `crates/cli/CHANGELOG.md`
  - Libraries ← `crates/{pkg,git,standard}/CHANGELOG.md`
  - Node bindings ← GitHub releases or `CHANGELOG.md` (root, which actually tracks node changes)
- **Contributing** ← `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`

---

## 6. Drift watch-list

| Glob | Pages affected |
|---|---|
| `crates/cli/src/cli/commands.rs`, `crates/cli/src/cli/mod.rs`, `crates/cli/src/cli/args.rs` | CLI Reference (all), Global options |
| `crates/cli/src/cli/dispatch.rs` | CLI Reference (mode routing, e.g. bump preview/execute/snapshot) |
| `crates/cli/src/commands/**/*.rs` (excluding `tests.rs`) | the matching CLI command page, Guides |
| `crates/cli/src/error/exit_codes.rs`, `crates/cli/src/error/cli_error.rs` | Exit codes |
| `crates/cli/src/output/**` | Output model, CI/CD guide |
| `crates/cli/src/utils/editor.rs`, `crates/cli/src/output/logger.rs` | Env vars |
| `crates/cli/src/commands/{mod,init,config}.rs` | Config discovery, `init`, `config` |
| `crates/pkg/src/config/*.rs`, `crates/pkg/examples/*.toml` | Configuration Reference (all sections) |
| `crates/pkg/src/{changeset,version,changelog,upgrade,audit,changes}/**` | Concepts, Guides |
| `crates/standard/src/config/standard.rs` | Env vars, Standard-tools settings |
| `crates/git/src/repo.rs` (credential section) | Env vars (git auth), CI/CD guide |
| `crates/node/src/lib.rs`, `crates/node/src/commands/*.rs`, `crates/node/src/types/*.rs`, `crates/node/src/{error,response}.rs` | Node API Reference |
| `packages/workspace-tools/src/index.ts`, `packages/workspace-tools/src/binding.d.ts` | Node API Reference (public exports) |
| `packages/workspace-tools/package.json` (`version`, `napi.targets`, `exports`, `engines`) | Node install |
| `Cargo.toml`, `crates/*/Cargo.toml` (`version`, `name`, `rust-version`) | Overview, Installation, library pages |
| `dist-workspace.toml`, `.github/workflows/release*.yml` | Installation (artifacts and targets) |
| `scripts/git-hooks/**`, `scripts/install-hooks.sh`, `scripts/uninstall-hooks.sh` | Git hooks guide |
| `README.md`, `crates/cli/README.md`, `packages/workspace-tools/README.md`, `crates/{pkg,git,standard,node}/README.md`, `crates/*/SPEC.md` | the pages adapted from them |
| `CHANGELOG.md`, `crates/*/CHANGELOG.md` | Changelog |
| `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` | Contributing |

---

## 7. Gaps / inconsistencies

1. **Config namespace mismatch [INFERENCE, not run].**
   - The docs use `[package_tools.changeset]` etc.: `crates/cli/README.md:1267-1435`, `crates/pkg/examples/basic-config.toml`, and the pkg rustdoc.
   - But `PackageToolsConfig::from_str` deserializes the struct directly (`crates/pkg/src/config/types.rs:368-383`). Its own doc example uses top-level `[changeset]`, and `init` serializes the struct directly (`init.rs:607-617`).
   - `#[serde(rename = "package_tools")]` does not add a wrapper table. With `#[serde(default)]`, a `[package_tools.*]` file probably loads silently as all defaults.
   - This needs a runtime check before any config page is written.
2. **`--config` help text** says the default is "Auto-detect (.changesets.{toml,json,yaml,yml})" (`cli/mod.rs:174`). The actual files are `repo.config.*`.
3. **`changeset add` does not exist.** It is referenced in `crates/cli/src/main.rs:55`, `cli/mod.rs:94` and `crates/cli/docs/STORY_MAP.md`. The command is `changeset create`; there are no aliases. The Node naming differs too: `changesetAdd` / `changesetRemove` versus CLI `create` / `delete`.
4. **Node binding count:** `crates/node/src/lib.rs` and `crates/node/README.md` claim "23 functions". 17 exist. Upgrade apply, backups, audit, changes and clone are only commented-out stubs, yet `index.ts` exports their types.
5. **npm README parameters are wrong:**
   - It shows `ChangesetAddParams.env?: string`; actual is `environments?: string[]`.
   - It shows `InitParams.defaultEnv?: string`; actual is `string[]`.
   - `crates/node/src/lib.rs` example uses `bumpType`; actual is `bump`.
   - Its Core Functions table lists `configShow` twice, and `configValidate` and `upgradeCheck` are missing from its tables.
   - Its badge points at a "CI" workflow that does not exist (workflow names: "Pull Request", "Pull Request Node.js Bindings", "Release Crates (crates.io)", "Release Binaries (GitHub Release)", "Release Node.js Bindings (npm)").
6. **Release docs are stale.** `README.md` "Release Process" and `RELEASE.md` describe Release Please and `.github/workflows/release-please.yml`. The actual setup is release-plz with git-cliff and cargo-dist (`release-plz.toml`, `release-crates.yml`, `CONTRIBUTING.md:24`).
7. **Wrong crate name and links in the root README.** It uses `sublime_package_tools` (`README.md` "Library Documentation" and `cargo test -p sublime_package_tools`); the real name is `sublime_pkg_tools`. It links `./crates/cli/STORY_MAP.md` and `./crates/cli/PLAN.md`, but those live in `crates/cli/docs/`. It claims a global config `~/.config/sublime/config.toml` and `WORKSPACE_*` env vars as config sources; the CLI loader only reads `--config` or `repo.config.*` (`commands/mod.rs`).
8. **The pkg configuration guide is stale.** `crates/pkg/docs/guides/configuration.md` uses `package-tools.toml` and `.config/package-tools.toml`, and documents `SUBLIME_PKG_*` env overrides. None of these is implemented (no match in `crates/pkg/src`). `crates/cli/src/commands/config.rs:17` also claims "Applies environment variable overrides", which the code does not do.
9. **`crates/cli/docs/README.md` is outdated.** It says `--prerelease`, `bump --packages`, `upgrade check --registry` and `upgrade apply --no-backup` are "Not Implemented". All four are now implemented (`commands/bump/execute.rs:268,627`, `upgrade/check.rs:127`, `upgrade/apply.rs:186`).
10. **Git-hooks README errors.** It documents a `[git_hooks]` config section, which is not a field of `PackageToolsConfig`. It uses `changeset update --remove-commit`, which does not exist. It states "MIT or Apache-2.0", but the repo is MIT only.
11. **Version drift.**
    - The npm package is 2.0.24, but `packages/workspace-tools/CHANGELOG.md` stops at 1.0.2 (2024).
    - `crates/node` is 0.0.4 and pins `sublime_cli_tools` 0.0.31, `pkg` 0.0.22, `git` 0.0.15, while the workspace is at 0.0.36 / 0.0.27 / 0.0.18.
    - The root `CHANGELOG.md` (0.0.1–0.0.4) actually tracks node-binding work.
    - The pkg README says "Rust 1.70 or later" while the workspace requires 1.90.0. Its license section reads "[License information to be added]".
    - npm `engines.node` is `>= 10`; the root package requires `>=18.20.3`.
12. **Undocumented features:** shell completions exist but are unreachable; `changes` and `audit --export` are covered only lightly; the WASI/browser build of the npm package is not documented; the `-q` / `-v` global flags are missing from the root README.
13. **Dead code:** `crates/audit/` is an empty directory.
14. **Branding inconsistency:** "Sublime Labs" (clap author) versus "WebSublime" (manifests and README). There are no visual assets, so a logo and colors must be created for the docs site.