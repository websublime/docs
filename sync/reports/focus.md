# Focus: source report

Places where this project's own documentation or help text disagrees with its code at the documented ref. Under D6 they are recorded here and not fixed in the project. Pages follow the code (D2).

- **Ref:** `origin/main` (`ce229fc444c8`)
- **Checked:** 2026-11-12

## Open

| # | Where | The source says | The code at the ref | Page handling |
|---|---|---|---|---|
| 1 | `README.md:18-19` | Status: "the guards and the harness hooks are ported (milestones M0 to M4)". | `crates/focus-hooks/src/lib.rs:37-57`: 12 hooks plus the `guard-tool-call` group run; `continue-workflow`, `deliver-stage-rules` and `fold-usage` are refused as not ported. | `focus/overview` follows the code |
| 2 | `crates/focus-cli/src/main.rs:53-60` | Top-level `--help` lists `utility detect`, `intent-create` and `now`, and folds the state verbs into "advance ..." and "gate-start ...". | `crates/focus-cli/src/utility.rs:100` also accepts `status`; `crates/focus-cli/src/state.rs` has `skip`, `finalize`, `complete-workflow`, `resume`, `approve`, `reject`, `revise` as their own verbs. | `focus/overview` follows the code |
| 3 | `crates/focus-cli/src/main.rs:63-66` | The closing "Run ... --help" list names graph, audit, runtime, state, jump and utility. | `crates/focus-cli/src/hook.rs:17-34` has its own `--help`; `README.md:77-79` lists `focus engine hook --help`. | not on any page yet |
| 4 | `crates/focus-cli/src/hook.rs:20-22` vs `README.md:107-110` | README: the project is `--project-dir`, then `FOCUS_PROJECT_DIR`, then `CLAUDE_PROJECT_DIR`, then discovery. Hook help: env first, `--project-dir` third. | Commands follow the README (`crates/focus-workspace/src/project.rs:17-36`); hooks follow their help (`crates/focus-hooks/src/engine.rs:129-133`, `crates/focus-cli/src/hook.rs:59-63`). The README states one order for both. | not on any page yet |
| 5 | `crates/focus-cli/src/jump.rs:17` | `jump --help`: `Usage: focus engine jump <verb> [--project-dir <dir>]`, no `--harness`; `README.md:77-79` says each `--help` lists every flag. | `crates/focus-cli/src/jump.rs:38` parses `--harness`. | not on any page yet |
| 6 | `fixtures/upstream/core/focus-common/stages/ideation/intent-capture.md:42,64,80` | The stage tells the agent to run `bun {{HARNESS_DIR}}/tools/focus-utility.ts ...`. | No such tool exists at the ref; the utility is `focus engine utility`, and `project-description` / `document-input` are not among its 4 verbs (`crates/focus-cli/src/utility.rs:54-100`). | not on any page yet |
| 7 | `fixtures/upstream/core/focus-common/stages/construction/build-and-test.md:261`, `ci-pipeline.md:90` | The stages tell the agent to run `{{INVOKE}} engine orchestrate report ...`. | `crates/focus-cli/src/main.rs:108-123` has no `orchestrate` command: "Valid: audit, graph, hook, jump, runtime, state, utility". | `focus/overview` follows the code (orchestrator listed as not yet) |

## Not reproduced at this ref

- 7.1 (stale README status): the README now says M0 to M4 and matches the commands it demonstrates; only the hook overclaim remains (Open #1). The plan's own stale header is internal material (D3), not recorded.
- 7.5 (no release): no tags exist, but the README only says releases are built when a tag is pushed (`README.md:203-207`); no false claim.
- 7.6 (`harness.json` mentions `/focus --doctor` and "AI-DLC"): the file is the frozen installed-tree test fixture (`fixtures/upstream/installed/...`), not text Focus ships; no harness installer exists to project it.
- 7.7 (Cursor and Copilot adapters missing): a missing feature, not a docs claim; the README makes no claim they work.
- 7.8 (verbs refused by name): code behaviour, consistently labelled (`jump.rs:25` marks `reopen` "(not ported)"; `graph.rs:61` notes `FOCUS_GRAPH_RESOLVE=1`; `focus-audit/src/append.rs:433` names `FOCUS_METRICS_ENDPOINT`). The hook count is now 12 ported and 3 not ported.
- 7.9 (undocumented env vars and settings): missing documentation, no false claim.
- 7.10 (settings accept 7 upstream harness names, `crates/focus-workspace/src/settings.rs:86`): no source claims otherwise.
- 7.11 (no CHANGELOG, Portuguese-only plan): missing documentation, not a contradiction.
- 7.12 (`.focus-lock` gitignore handling): an open internal planning decision, not a contradiction.
- New: the README contributing section says `CLAUDE.md` lists the rules a change keeps (`README.md:213-214`); the file exists at the ref, so the claim holds.
