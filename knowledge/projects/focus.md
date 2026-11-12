> **Snapshot.** Inventory written on 2026-11-12 by reading the local checkout (`../focus`), files only; nothing was built or run. The refs that are documented come from D5 and `sync/registry.yaml`. Section 7 is the first input to `sync/reports/focus.md` (D6).

# Focus inventory (`../focus`)

**Summary:** Focus is a Rust port and fork of `awslabs/aidlc-workflows`, frozen at upstream v2.11.0, commit `2a555f7`. It is pre-release: version 0.1.0, no git tags, no published binaries, and no way yet to install the harness files into a project. The command surface lives entirely under `focus engine <noun> <verb>`. The help text is written by hand as `const HELP` strings in `crates/focus-cli/src/*.rs`, and that is the canonical source for the CLI reference. The method content (33 stages, 11 scopes, 14 agents, 6 sensors) is upstream Markdown renamed to Focus's names under `fixtures/upstream/`. Its YAML frontmatter can generate reference tables, but its body text still calls `bun …/focus-utility.ts` and `engine orchestrate`, which Focus does not provide yet. Status statements contradict each other across README, plan and code; see section 7.

## 1. Identity
- **Purpose:** "A Rust engine for AI-DLC (AI-Driven Development Life Cycle), targeting Claude Code, Cursor and GitHub Copilot." AI-DLC is described as "stages grouped into phases, selected by scopes, with human approval gates and an audit trail" (`README.md:1-8`).
- **Audience:** developers who run an AI coding assistant with AI-DLC, plus contributors to the port and parity tooling.
- **Stack:** Rust edition 2024. MSRV 1.89 (`Cargo.toml` `rust-version`). Pinned toolchain 1.97.0 (`rust-toolchain.toml`). 13 crates in `crates/*`, with `unsafe_code = "forbid"`. Arguments are parsed by hand (no clap): `crates/focus-cli/src/args.rs`.
- **Version:** `0.1.0` (`Cargo.toml` `[workspace.package]`). `publish = false`, so nothing goes to crates.io.
- **License:** MIT, "Copyright (c) 2026 Websublime" (`LICENSE`). The upstream-derived fixtures are MIT-0 (`fixtures/upstream/LICENSE`, `fixtures/upstream/PIN`).
- **Package and binary:** the cargo package is `focus` and builds the binary `focus` (`crates/focus-cli/Cargo.toml`, `[package.metadata.dist] dist = true`). Not published to crates.io or npm.
- **Remote:** `git@github.com:websublime/focus.git` (`.git/config`). `repository = "https://github.com/websublime/focus"`.
- **Status signals:**
  - README: "the stage graph and the audit ledger are complete (milestones M0 to M2)… State, guards, hooks and the orchestrator are not written yet."
  - Plan `docs/plano-de-migracao.md` §14–15: M3 done, M4 in progress (slices 4e-ii and 4f "Por fazer"), M5–M8 not started.
  - No tags in `.git/refs/tags/` and no `packed-refs` tags, so nothing has been released.
- **Former name:** "Sulca" until 2026-10-09 (plan line 3).

## 2. Public surface

### Install methods
1. **From source** (the only working path today): `cargo build --release`, which produces `target/release/focus` (`README.md` "What works").
2. **cargo-dist releases** (configured, never run). Source: `dist-workspace.toml`.
   - `cargo-dist-version = "0.32.0"`, `ci = "github"`, `pr-run-mode = "plan"`.
   - `installers = ["shell","powershell"]`.
   - `targets = [aarch64-apple-darwin, aarch64-unknown-linux-gnu, x86_64-apple-darwin, x86_64-unknown-linux-gnu, x86_64-pc-windows-msvc]` (5 targets).
   - `install-path = "CARGO_HOME"`, `install-updater = false` ("updating an engine mid-workflow is the engine's own job").
   - Workflow `.github/workflows/release.yml` (dist-generated) runs on a tag matching `**[0-9]+.[0-9]+.[0-9]+*` and publishes with `gh release create`. On pull requests it runs `dist plan` only.
   - `[profile.dist]` inherits release with `lto = "thin"` (`Cargo.toml`).
3. **Harness install into a project** (`.claude/`, `.cursor/`, `.focus/`): **does not exist.** It is milestone M8 ("Projeção e instalação"). The only installed tree is the fixture `fixtures/upstream/installed/claude/`.

### CLI
- **Root:** `crates/focus-cli/src/main.rs`.
  - `USAGE` const: lines 26-63.
  - Dispatch: lines 96-130.
  - Top-level flags: `--help`/`-h` and `--version`/`-V` (prints `focus <ver>`).
  - Hidden: `focus dev oracle <cases.ndjson>`, a parity-corpus aid, internal only.
- **Engine nouns (7):** `audit, graph, hook, jump, runtime, state, utility`.
- **Verbs per noun.** The canonical list for each noun is the source constant named in the table.

| Noun | Source (const) | Verbs | Count |
|---|---|---|---|
| `engine graph` | `src/graph.rs:30` `VERBS`, `HELP` 32-77 | compile (`--check`; out-of-project: `--harness --core\|--installed --out\|--check\|--print --rules-dir`), topo, cycles `[--scope]`, scope `<name>`, artifacts, producers `<a>`, consumers `<a>`, validate-scope `<name>`, validate-grid (`--proposal --strict --project-type --keywords --report --matched\|--custom --guard-policy --space --intent`), ars (`--iae --csu --ve --r --ua [--completed] [--project-type]`), resolve `<scope> [--stdout]` (needs `FOCUS_GRAPH_RESOLVE=1`), export `[--check <file>]`; `--graph <file>` for read-only verbs | 12 |
| `engine audit` | `src/audit.rs:34-55` `HELP`/`VERBS` | append `<EVENT> [--field k=v]…`, append-batch `<json>`, append-raw `<heading> <body>`, history `[--stage] [--event]… [--limit]` | 4 |
| `engine runtime` | `src/runtime.rs:53-68` | compile, read `<stage-slug>`, summary `[--json]` | 3 |
| `engine state` | `src/state.rs:54-106` `HELP`, `VERBS[15]`, `ENGINE_OWNED[11]` | get, set (`NOW`, `+1`, `-1`), checkbox, count, advance, finalize, complete-workflow, gate-start (`--artifacts --recovered --approves-together`), approve (`--user-input`), reject (`--feedback`), revise, skip (`--reason --route`), resume, park, unpark | 15 |
| `engine jump` | `src/jump.rs:16-25` | resolve (`--stage\|--phase [--scope] [--allow-skipped]`), execute (`--target --direction forward\|backward\|redo [--scope]`), reopen (refused as not ported) | 2+1 |
| `engine utility` | `src/utility.rs:35-50` `HELP`, `VERBS[4]`, `NOT_PORTED[30]`, `INTENT_CREATE_USAGE` | detect `[--json]`; intent-create (`--scope --arguments --label --depth --test-strategy --review --guard-policy --sensors --learnings --summary-confirmation --collaborators --skip --add --repos --project-type --space --project-dir`, plus `--request --change-control --plan-name`; see `INTENT_CREATE_VALUE_FLAGS[19]`); now; status `[--intent] [--space]` | 4 (+30 refused by name) |
| `engine hook <name>` | `src/hook.rs`; names in `crates/focus-hooks/src/lib.rs:34-62` `HOOKS[11]`, `NOT_PORTED[5]` | session-start, validate-state, session-end, log-subagent, sync-workflow-state, write-audit-log, rebuild-stage-graph, review-freeze, reviewer-scope, state-transition-guard, record-human-turn | 11 (+5 refused: guard-tool-call, plan-approval-guard, continue-workflow, deliver-stage-rules, fold-usage) |

- **Total working verbs:** 51.
- **Common flags:** `--project-dir`, `--harness <claude|cursor|copilot>`.
- **Output and errors:**
  - Most answers are JSON on stdout.
  - On refusal, `{"error":…}` goes to stderr with exit code 1, plus an `ERROR_LOGGED` row in the audit ledger (`src/report.rs`, `src/state.rs:18-24`).
  - A hook that exits 2 is converted into a Claude `PreToolUse` `permissionDecision: deny` JSON answer (`src/hook.rs:85-100`).
- **Project resolution order** (`crates/focus-workspace/src/project.rs:17-39`): `--project-dir` → `FOCUS_PROJECT_DIR` → `CLAUDE_PROJECT_DIR` → the nearest directory at or above the current one with a harness installed → the current directory.
- **Harness resolution order** (`project.rs:106-120`): `--harness` → `FOCUS_HARNESS` → the only installed harness.
- **Hook exception:** hooks resolve the project from env first (`FOCUS_PROJECT_DIR` → `CLAUDE_PROJECT_DIR` → `--project-dir`), per `focus-hooks/src/engine.rs:126-133`.

### Config files and keys
Parsed in `crates/focus-workspace/src/settings.rs`; file names come from `names.rs`.

- **Three layers, nearest wins:**
  - Machine: `<install root>/focus.settings.json`.
  - Project: `<project>/focus.settings.json`, committed.
  - Local: `<project>/focus.settings.local.json`, never committed.
- **Exception to "nearest wins":** `flags.bypasses` is the union of all three layers.
- **Strict parsing:** an unknown key or a value of the wrong kind is an error that names the file.
- **Install root** (`settings.rs:511-520`): `FOCUS_INSTALL_ROOT`, else `%LOCALAPPDATA%\focus` on Windows, else `$XDG_DATA_HOME/focus`, else `~/.local/share/focus`.
- **Top-level keys** (`TOP_LEVEL_KEYS`, 8): `$schema, schemaVersion, models, flags, update-check, offline, release-base-url, ca-bundle`. The last 4 are allowed only in the machine file (`MACHINE_KEYS`).
- **`flags.*`** (`FLAG_KEYS`): `schemaVersion, defaultScope, swarm, hookDebug, sensorTimeoutMs, questionRetentionDays, bypasses`. The first five value fields map to env vars through `FLAG_FIELDS` (lines 53-59).
- **`flags.bypasses[]`:** only the 12 names in `RECORDABLE_BYPASSES` (lines 37-50) are accepted.
- **`models.*`:**
  - Keys: `schemaVersion, preset, groups, agents, profiles`.
  - Presets: `thorough|balanced|minimal`.
  - Groups: `deciding|reviewing|writing-up`.
  - Efforts: `low|medium|high|xhigh|max`.
  - Harness names: 7, including codex, kiro and opencode, kept for upstream compatibility.
- **Harness data files** (`project.rs:162-212`): `<harness>/tools/data/{harness.json, stage-graph.json, scope-grid.json, ars-priors.json}`.
- **Hook registration files** (`focus-harness/src/lib.rs`): `.claude/settings.json`, `.cursor/hooks.json`, `.github/hooks/focus.json`.
- **Debug marker:** `focus/.focus-hook-debug` (`focus-hooks/src/health.rs:105`).

### Library API, MCP, HTTP
- **Library:** nothing is published (`publish=false`), so the crates are internal. The table of responsibilities is in `README.md` "Layout".
- **MCP:** none.
- **HTTP/OpenAPI:** none. `FOCUS_METRICS_ENDPOINT` exists only so the ledger can refuse to write while it is set.

### Environment variables (37)
Every Focus-owned variable is read through `crates/focus-workspace/src/env.rs` (`var/path/is_on`, prefix from `names.rs` `ENV_PREFIX`). A generator can re-derive the list by grepping `env::(var|path|is_on)\("` together with `FOCUS_[A-Z_]+` literals.

| Group | Variables | Source |
|---|---|---|
| Resolution (4) | `FOCUS_PROJECT_DIR`, `FOCUS_HARNESS`, `FOCUS_HARNESS_DIR`, `FOCUS_INSTALL_ROOT` (non-Focus: `CLAUDE_PROJECT_DIR`, `TERM_PROGRAM`, `CODEX_THREAD_ID`) | `project.rs`, `focus-guards/src/integrity/mod.rs:90-98`, `settings.rs:512` |
| Authority / fences (7) | `FOCUS_ALLOW_DIRECT_STATE_TRANSITIONS`, `FOCUS_STATE_TRANSITION_OWNER`, `FOCUS_ALLOW_DIRECT_AUDIT_EVENTS`, `FOCUS_UNATTENDED`, `FOCUS_SESSION_OVERRIDE`, `FOCUS_SESSION_OVERRIDE_SOURCE`, `FOCUS_INTERNAL_HUMAN_TURN_TOKEN` | `focus-cli/src/state.rs:485-500`, `focus-audit/src/events.rs:172`, `focus-guards/src/integrity/shell.rs:52-62`, `records.rs:49-66` |
| Kill switches, recordable (12) | `FOCUS_SKIP_{ARTIFACT_GUARD, REVISION_BACKSTOP, SUMMARY_CONFIRMATION_GUARD, HUMAN_PRESENCE_GUARD}`, `FOCUS_DISABLE_{ENSEMBLE_EVIDENCE, PLAN_APPROVAL_GUARD, REVIEWER_SCOPE_HOOK, REVIEW_FREEZE_HOOK, USAGE_TRACKING, SENSORS, LEARNINGS, SUMMARY_CONFIRMATION}` | `settings.rs:37-50`; labels in `focus-hooks/src/switches.rs:27-43`; fence map in `focus-guards/src/fences.rs:98-104` |
| Other switches (2) | `FOCUS_DISABLE_COLLABORATORS`, `FOCUS_SKIP_REVIEWER_GATE_GUARD` | `focus-cli/src/graph.rs:352-357`, `focus-lifecycle/src/admission.rs:82` |
| Flag fields (5) | `FOCUS_DEFAULT_SCOPE`, `FOCUS_USE_SWARM`, `FOCUS_HOOK_DEBUG`, `FOCUS_SENSOR_TIMEOUT_MS`, `FOCUS_QUESTION_RETENTION_DAYS` | `settings.rs:53-59` |
| Operational (5) | `FOCUS_LOCK_TIMEOUT_MS` (default 30 s), `FOCUS_GRAPH_RESOLVE` (rollout gate), `FOCUS_PLAN_PATH`, `FOCUS_METRICS_ENDPOINT` (a non-empty value makes audit refuse), `FOCUS_HOOK_TRACE_DIR` (absolute dir, writes `hook-<pid>.ndjson`) | `focus-workspace/src/lock.rs:37,66`, `graph.rs:583,618`, `focus-audit/src/append.rs:124`, `focus-hooks/src/trace.rs:3,19` |
| Test-only (2, do not document) | `FOCUS_TEST_RAW_LINE_ENDINGS`, `FOCUS_TEST_CONFIG_TTY` | `focus-lifecycle/src/validity.rs:72`, `focus-workspace/src/terminal.rs:47` |

### Concepts: phases, stages, scopes, harnesses, state
- **Phases (5)** and their stage counts (total 33), from the directories under `fixtures/upstream/core/focus-common/stages/<phase>/`:
  - initialization: 3
  - ideation: 7
  - inception: 9
  - construction: 7
  - operation: 7
- **Stage frontmatter** (example: `stages/ideation/intent-capture.md:1-30`): `slug, name, phase, execution, condition, lead_agent, support_agents, mode, summary_confirmation, reviewer, review_artifact, reviewer_max_iterations, review_class, produces, consumes, requires_stage, sensors, scopes, inputs, outputs`. The schema is in `crates/focus-graph/src/stage_schema.rs`.
- **Scopes (11)** in `fixtures/upstream/core/scopes/focus-*.md`: bugfix, classic, enterprise, express, feature, infra, mvp, poc, refactor, security-patch, workshop.
  - Frontmatter keys: `name, depth (Minimal|Standard|Comprehensive), keywords, description, skeleton, existing_code, runner, review_cap, guard_policy (off|strict…), sensors, learnings, summary_confirmation, plan_approval, collaborators, testStrategy`.
  - Composed scopes live in `focus/scopes/<name>.md` (`crates/focus-graph/src/composed.rs`).
- **Agents (14)**, `focus-*-agent.md`: architect, architecture-reviewer, aws-platform, compliance, composer, delivery, design, developer, devsecops, operations, pipeline-deploy, product, product-lead, quality.
- **Sensors (6):** claim-sources, linter, required-sections, traceability, type-check, upstream-coverage.
- **Memory:** `org.md`, `team.md`, `project.md`, plus `phases/{ideation,inception,construction,operation}.md`.
- **Harnesses (3)** (`crates/focus-harness/src/lib.rs`): claude (`.claude`, called directly, has a statusline), cursor (`.cursor`, via adapter), copilot (`.focus`, via adapter, `directiveMaxBytes` 19000). The per-harness host event lists are in the same file.
- **Stage states** (`state.rs` HELP): pending, in-progress, awaiting-approval, revising, completed, skipped.
- **Guard Policy and fences** (`focus-guards/src/{policy,fences}.rs`): plan-approval, review-freeze, reviewer-scope, human-presence, state-transition.
- **Audit ledger:** 117 event types (plan §6 M2), defined in `crates/focus-audit/src/events.rs`. Each clone writes its own shard at `<record>/audit/<host>-<token>.md`.
- **ARS:** plan-tailoring arithmetic, inputs `--iae --csu --ve --r --ua` (`focus-graph/src/ars.rs`).

### Workspace layout
Sources: `crates/focus-workspace/src/names.rs`, `project.rs:162-280`, `records.rs:1-20`.
```
<project>/
  focus.settings.json  focus.settings.local.json
  .claude|.cursor|.focus/               # harness tree
    tools/data/{harness,stage-graph,scope-grid,ars-priors}.json, memory-seed/
    focus-common/stages/<phase>/<slug>.md  agents/  sensors/  scopes/  rules/focus.md
  focus/                                # team workspace (committed)
    active-space  scopes/<composed>.md  active-memory/ (git-ignored copy)
    .focus-lock .focus-lock.owner .focus-clone-id .focus-unit-scope.json .focus-sessions/  (never committed)
    spaces/<space>/memory/{org,team,project}.md, phases/*.md, templates/; codekb/<repo>/
      intents/intents.json  active-intent  .focus-engine/composer-proposal.json  audit/
      intents/<YYMMDD-slug>/focus-state.md  audit/<host>-<token>.md  runtime-graph.json  .focus-engine/  <phase>/<stage>/…
```
- **Record selection order** (`records.rs`): `--space`/`--intent` → session binding → the `active-space`/`active-intent` cursors → the only live record in the space.

## 3. Existing doc material
| File | Class | Lang | Notes |
|---|---|---|---|
| `README.md` | MIXED | EN | Public parts: intro, "What works" command examples, resolution order, Platforms and releases, License. Contributor parts: Layout crate table, "How parity is checked", Contributing. The status line is stale. |
| `CLAUDE.md` | INTERNAL | EN | Agent rules and contributor workflow. The rules and commands could seed a contributing page, but the file itself must not be published. |
| `docs/plano-de-migracao.md` (260 KB) | INTERNAL | PT | Architecture, milestones M0–M8, deviations, risks. A good fact source for "Roadmap/Status" and for settings semantics (§13 slice 4), but do not publish it. |
| `fixtures/upstream/core/**/*.md` (stages 33, scopes 11, agents 14, sensors 6, memory 7) and the mirror copies `installed/claude/.claude/**`, `installed/claude/focus/spaces/default/memory/**` | MIXED (source data) | EN | Agent prompts written by upstream (MIT-0). Use the frontmatter and the short "why" sections of scopes to generate Concepts/Reference pages. Do not copy the bodies, which reference `bun …ts` and `{{INVOKE}} engine orchestrate`. |
| `fixtures/upstream/PIN`, `fixtures/upstream/LICENSE` | INTERNAL | EN | Provenance; can be cited in an "Upstream / attribution" page. |
| `tools/oracle/**` | INTERNAL | — | Parity tooling. |

There is no CHANGELOG and no `docs/` site content.

## 4. Brand assets
None. No png, svg, ico or jpg files in the repo, and no colour definitions. The only branding is the name "Focus" and the rename rule "every name is `focus`". The docs repo will have to supply logo and colours.

## 5. Proposed Mintlify page tree (`focus/`)
- **Overview**
  - `introduction`: README §1–2 and the plan §1 summary, translated.
  - `status-and-roadmap`: the plan §6 milestone list, §14–15 status tables, and README "Status".
  - `upstream-and-attribution`: `fixtures/upstream/PIN`, README "License".
- **Get started**
  - `installation`: `dist-workspace.toml`, `release.yml`, README "Platforms and releases", and `cargo build`. Flag that there are no releases yet.
  - `quickstart`: README "What works"; compiling outside a project with `--core`.
  - `project-and-harness-resolution`: `focus-workspace/src/project.rs`, `src/hook.rs` HELP.
- **Concepts**
  - `ai-dlc-workflow`: phases → stages → scopes, gates, audit.
  - `phases-and-stages`: generated from `core/focus-common/stages/*/*.md` frontmatter.
  - `scopes`: generated from `core/scopes/focus-*.md` frontmatter and their "Why these stages" sections.
  - `agents-and-sensors`: `core/agents`, `core/sensors`.
  - `workspace-layout`: `names.rs`, `project.rs`, `records.rs`.
  - `intents-spaces-records`: `focus-intent/src/*`, `records.rs`.
  - `audit-ledger-and-runtime-graph`: `focus-audit/src/{events,ledger,runtime_graph}.rs`.
  - `guard-policy-and-fences`: `focus-guards/src/{policy,fences}.rs`, `settings.rs` bypasses.
  - `harnesses`: `focus-harness/src/lib.rs`.
- **Guides**
  - `create-an-intent`: `utility.rs` `INTENT_CREATE_USAGE`.
  - `move-through-stages-and-gates`: `state.rs` HELP, `focus-lifecycle/src/{transitions,gates}.rs`.
  - `park-and-jump`: `jump.rs`, `focus-lifecycle/src/{park,jump}.rs`.
  - `register-hooks-in-claude-code`: `hook.rs`, `focus-hooks/src/lib.rs`, the harness `hook_events`.
  - `validate-and-tailor-a-plan`: graph `validate-grid`, `ars`.
- **Reference**
  - `cli/overview`: `main.rs` USAGE.
  - `cli/graph`, `cli/audit`, `cli/runtime`, `cli/state`, `cli/jump`, `cli/utility`, `cli/hook`: the per-file `HELP` consts listed in §2.
  - `configuration/settings-files`: `settings.rs`.
  - `environment-variables`: `env.rs`, `settings.rs`, and the grep sites in §2.
  - `audit-events`: `focus-audit/src/events.rs`.
  - `stage-and-scope-schema`: `focus-graph/src/{stage_schema,scopes}.rs`.
- **Changelog**: GitHub Releases, which do not exist yet. Until then, base it on the milestone history in plan §9–15.

## 6. Drift watch-list
| Glob | Pages to review |
|---|---|
| `crates/focus-cli/src/main.rs` | cli/overview, quickstart |
| `crates/focus-cli/src/{graph,audit,runtime,state,jump,utility,hook}.rs` | the matching cli/* page and the related guides |
| `crates/focus-hooks/src/lib.rs`, `crates/focus-hooks/src/hooks/*.rs` | cli/hook, register-hooks guide |
| `crates/focus-harness/src/lib.rs` | harnesses, register-hooks |
| `crates/focus-workspace/src/{names,project,records}.rs` | workspace-layout, resolution, intents |
| `crates/focus-workspace/src/settings.rs`, `crates/focus-workspace/src/env.rs` | settings-files, environment-variables |
| `crates/**/src/**/*.rs` (pattern `env::(var\|path\|is_on)\(\|FOCUS_[A-Z_]+`) | environment-variables |
| `crates/focus-guards/src/{policy,fences,authority}.rs`, `crates/focus-hooks/src/switches.rs` | guard-policy-and-fences, env vars |
| `crates/focus-audit/src/events.rs`, `crates/focus-audit/src/{ledger,runtime_graph,summary}.rs` | audit-events, audit concept |
| `crates/focus-lifecycle/src/**`, `crates/focus-intent/src/**` | stages/gates guides, create-an-intent |
| `crates/focus-graph/src/{stage_schema,scopes,composed,ars,proposal}.rs` | stage-and-scope-schema, validate/tailor guide |
| `fixtures/upstream/core/focus-common/stages/**/*.md`, `fixtures/upstream/core/scopes/*.md`, `fixtures/upstream/core/agents/*.md`, `fixtures/upstream/core/sensors/*.md`, `fixtures/upstream/core/memory/**` | phases-and-stages, scopes, agents-and-sensors |
| `fixtures/upstream/PIN` | upstream-and-attribution |
| `dist-workspace.toml`, `.github/workflows/release.yml`, `Cargo.toml` (`version`, `rust-version`), `rust-toolchain.toml` | installation, status |
| `README.md`, `docs/plano-de-migracao.md` (§6, §13–15) | introduction, status-and-roadmap |
| `LICENSE` | introduction/attribution |

## 7. Gaps and inconsistencies
1. **README status is stale.** It says "M0 to M2… State, guards, hooks and the orchestrator are not written yet". The same README demonstrates `state`, `jump`, `hook` and `utility`, and the plan says M3 is done and M4 is in progress. The plan's own header (line 5, "Estado em 2026-10-13, M0–M2") and §1 ("Estado, guards, hooks e orchestrator ainda não existem") are also stale.
2. **Top-level `--help` is incomplete** (`main.rs` USAGE).
   - It omits `engine utility status`.
   - It collapses 8 state verbs into "advance …" and "gate-start …".
   - Its closing "Run …--help" list omits `focus engine hook --help`. The README lists that command.
3. **Resolution order differs.** The `hook` help text says env comes before `--project-dir`. Graph, README and `project.rs` say `--project-dir` comes first. The hook behaviour is intentional (`focus-hooks/src/engine.rs`), but it is documented in only one place.
4. **`jump --help` omits `--harness`**, although `jump.rs` parses it.
5. **No release exists.** cargo-dist and installers are configured, but there are no tags. A docs install page cannot point at real installer URLs yet.
6. **No harness installer or projection (M8).** Users cannot obtain `.claude/`, `.cursor/` or `.focus/` trees.
   - The authored stage Markdown still references `bun {{HARNESS_DIR}}/tools/focus-utility.ts` (e.g. `stages/ideation/intent-capture.md:41-42`) and `{{INVOKE}} engine orchestrate report` (the orchestrator is M5).
   - The fixture `harness.json` text mentions `/focus --doctor` and "AI-DLC"; `doctor` is not ported.
7. **Cursor and Copilot are adapter-entry harnesses** (`engine adapter …`), but the adapters do not exist (M6). In practice only Claude Code hooks work today.
8. **Many verbs are refused by name.** These have to be marked as unavailable, not documented as working:
   - 30 `utility` verbs, `jump reopen`, and 5 hooks (`guard-tool-call`, `plan-approval-guard`, …).
   - `graph resolve` only runs behind `FOCUS_GRAPH_RESOLVE=1`.
   - Audit refuses to write while `FOCUS_METRICS_ENDPOINT` is set.
9. **Undocumented features.** Of the 37 env vars, the README mentions only 3 (`FOCUS_PROJECT_DIR`, `FOCUS_HARNESS`, `FOCUS_ALLOW_DIRECT_STATE_TRANSITIONS`). The settings files and keys, the install root, the lock timeout and the hook tracing are documented only in code and the PT plan.
10. **Settings carry upstream harness names.** The `models` schema accepts 7 harness names (`codex`, `kiro`, `opencode`…) while Focus supports 3.
11. **No CHANGELOG, no brand assets.** The only design and status doc is in Portuguese; the public docs must be in English.
12. **Open decision:** `.gitignore` handling for `focus/.focus-lock` (plan §11 "Em aberto"). Users must currently add it by hand, and this is worth a note on the workspace-layout page.