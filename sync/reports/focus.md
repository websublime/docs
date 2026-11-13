# Focus: source report

Places where this project's own documentation or help text disagrees with its code at the documented ref. Under D6 they are recorded here and not fixed in the project. Pages follow the code (D2).

- **Ref:** `origin/main` (`c0fc99eac466`)
- **Checked:** 2026-11-13

## Open

| # | Where | The source says | The code at the ref | Page handling |
|---|---|---|---|---|
| 1 | `README.md:18-20` | Status: "the guards and the harness hooks are ported (milestones M0 to M4)". | `crates/focus-hooks/src/lib.rs:36-56`: 12 hooks plus the `guard-tool-call` group run; `continue-workflow`, `deliver-stage-rules` and `fold-usage` are refused as not ported (`lib.rs:54-56`). | `focus/overview` follows the code |
| 2 | `crates/focus-cli/src/main.rs:27-62` | Top-level `--help` lists `utility detect`, `intent-create` and `now`, and folds the state verbs into "advance ..." and "gate-start ..." (`main.rs:54-55`). | `crates/focus-cli/src/utility.rs:100` also accepts `status`; `crates/focus-cli/src/state.rs` has `skip`, `finalize`, `complete-workflow`, `resume`, `approve`, `reject`, `revise` as their own verbs. | `focus/overview` follows the code |
| 3 | `crates/focus-cli/src/main.rs:64-67` | The closing "Run ... --help" list names graph, audit, runtime, state, jump and utility. | `crates/focus-cli/src/hook.rs:17-34` and `crates/focus-cli/src/log.rs:18-35` have their own `--help`; `README.md:85-89` lists `focus engine hook --help` and `focus engine log --help`. | not on any page yet |
| 4 | `crates/focus-cli/src/hook.rs:20-22` vs `README.md:116-119` | README: the project is `--project-dir`, then `FOCUS_PROJECT_DIR`, then `CLAUDE_PROJECT_DIR`, then discovery. Hook help: env first, `--project-dir` third. | Commands follow the README (`crates/focus-workspace/src/project.rs:17-36`); hooks follow their help (`crates/focus-hooks/src/engine.rs:126-131`, `crates/focus-cli/src/hook.rs:59-63`). The README states one order for both. | not on any page yet |
| 5 | `crates/focus-cli/src/jump.rs:17` | `jump --help`: `Usage: focus engine jump <verb> [--project-dir <dir>]`, no `--harness`; `README.md:85-89` says each `--help` lists every flag. | `crates/focus-cli/src/jump.rs:38` parses `--harness`. | not on any page yet |
| 6 | `fixtures/upstream/core/focus-common/stages/ideation/intent-capture.md:42,64,80` | The stage tells the agent to run `bun {{HARNESS_DIR}}/tools/focus-utility.ts ...`. | No such tool exists at the ref; the utility is `focus engine utility`, and `project-description` / `document-input` are not among its 4 verbs (`crates/focus-cli/src/utility.rs:100`). | not on any page yet |
| 7 | `fixtures/upstream/core/focus-common/stages/construction/build-and-test.md:261`, `ci-pipeline.md:90`, `code-generation.md:524` | The stages tell the agent to run `{{INVOKE}} engine orchestrate report ...`. | `crates/focus-cli/src/main.rs:110-124` has no `orchestrate` command: "Valid: audit, graph, hook, jump, log, runtime, state, utility" (`main.rs:119`). | `focus/overview` follows the code (orchestrator listed as not yet) |
| 8 | `crates/focus-cli/src/main.rs:27-62` | Top-level `--help` lists no `engine log` line. | `crates/focus-cli/src/main.rs:114` dispatches `log` (`decision`, `answer`, `answers`; `crates/focus-cli/src/log.rs:121-147`); `README.md:72-75` shows four `focus engine log` examples. | not on any page yet |
| 9 | `crates/focus-cli/src/log.rs:19` | `log --help`: `Usage: focus engine log <verb> [--project-dir <dir>]`, no `--harness`; `README.md:85-89` says each `--help` lists every flag. | `crates/focus-cli/src/log.rs:55-60` takes `--harness`. | not on any page yet |
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
- New at this ref: the README's `log` examples (`README.md:72-75`) were checked against the code: every flag shown (`--stage`, `--decision`, `--options`, `--details`, `--details-file`) is read by the verb (`crates/focus-cli/src/log.rs:22-34`), and the `--details-file` path matches the folder the engine reads (`crates/focus-log/src/answer_text.rs:24-35`). The `focus-log` and `focus-evidence` Layout rows (`README.md:140,145`) match the crates and the `link` / `review` refusals (`crates/focus-cli/src/log.rs:131-135`). No contradiction.
