# unblock: source report

Places where this project's own documentation or help text disagrees with its code at the documented ref. Under D6 they are recorded here and not fixed in the project. Pages follow the code (D2).

- **Ref:** `v1.0.2` (`842cdff3909a`)
- **Checked:** 2026-11-12

## Open

| # | Where | The source says | The code at the ref | Page handling |
|---|---|---|---|---|
| 1 | `README.md:104-106`, `README.md:118`, `README.md:265` | `init --agents` arrives "from v1.1"; release 1.0.x rejects `--agents` as a usage error | `crates/unblock-cli/src/cli.rs:181-184` defines `InitArgs.agents`; `help_snapshots__help_init.snap:14` lists `--agents` | `unblock/overview` follows the code: it uses `init` then `agents` and makes no 1.0.x claim about `--agents` |
| 2 | `README.md:74-76` | `releases/latest` links resolve "once the maintainer cuts the first published release"; pins `v1.0.0` as the example | Tags `v1.0.0`, `v1.0.1` and `v1.0.2` exist; `Cargo.toml:42` is `1.0.2` | `unblock/overview` pins the installers to `v1.0.2` |
| 3 | `README.md:11-12` | "GA **1.0.0**" | `Cargo.toml:42` `version = "1.0.2"` | `unblock/overview` shows 1.0.2 |
| 4 | `README.md:210`, `README.md:274-275` | Workspace precedence starts with an explicit `--db` (`--db` > `--dir`) | `GlobalArgs` (`crates/unblock-cli/src/cli.rs:47-75`) has no `--db` flag; only `CliOverrides::with_db` exists (`crates/unblock-config/src/cli.rs:49`); no help snapshot lists `--db` | `unblock/overview` follows the code (`CLAUDE_PROJECT_DIR` or walk-up, no `--db`) |
| 5 | `crates/unblock-mcp/src/resources/capabilities.rs:155-163`, `AGENTS.md:88-89` | Prompt descriptions: "A guided triage workflow over…", "Drive the ready -> claim selection" | The wire `prompts/list` text differs, e.g. "Guided triage of blocked, unassigned, and deferred work." (`crates/unblock-mcp/src/prompts/mod.rs:21`, `:30`, `:39`) | Not on any page yet |
| 6 | `crates/unblock-cli/src/cli.rs:48-68`, `:100-119`; every `help_snapshots__help_*.snap` | `--help` text carries internal requirement ids; prompt descriptors in `capabilities.rs:159-163` do too | Those ids are defined only in internal planning material that the user never receives | Not on any page yet; strip the ids when adapting help text |
| 7 | `crates/unblock-cli/src/commands/init.rs:300` | The scaffolded `config.toml` comment points to a document under the internal plans folder for the full key set | That file is internal and does not exist in a user's repository | Not on any page yet |

## Not reproduced at this ref

- Inventory 7.1 (main ahead of the release): does not apply at `v1.0.2`; contract is `unblock.mcp.v1.10` (`crates/unblock-mcp/src/options.rs:117`). The one release-scoped README error it covers is row 1.
- Inventory 7.6 (README links internal plans): holds (`README.md:40`, `:325`, `:329-332`), but the links resolve; it is a D3 exclusion, not a contradiction.
- Inventory 7.7 (inert and reserved settings): the README does not claim they work; remote mode is described as not shipped (`README.md:20`). Not a contradiction.
- Inventory 7.8 (attribution fields discarded): no project source claims they are stored. Not a contradiction.
- Inventory 7.9 (no changelog): missing documentation, not a false claim.
- Inventory 7.10 (banner): a brand-asset issue, not a docs-versus-code claim.
- Inventory 7.11 (undocumented details): missing documentation, not a false claim.
- Inventory 7.12 (exit code 2 overloaded): the README table does not claim exit 2 is exclusive. Not a contradiction.
- Inventory 7.13 (`temp/secrets.txt`): not tracked at the ref; handled by the `temp/**` exclusion.
