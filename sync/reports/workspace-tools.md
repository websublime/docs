# workspace-tools: source report

Places where this project's own documentation or help text disagrees with its code at the documented ref. Under D6 they are recorded here and not fixed in the project. Pages follow the code (D2).

- **Ref:** `sublime_cli_tools-v0.0.37` (`c8ecda8dcd95`)
- **Checked:** 2026-11-12

## Open

| # | Where | The source says | The code at the ref | Page handling |
|---|---|---|---|---|
| 1 | `crates/cli/README.md:1272-1284`, `crates/pkg/examples/basic-config.toml:5`, `crates/pkg/src/config/types.rs:59-84` | Config sections sit under `[package_tools.*]` | `PackageToolsConfig::from_str` deserializes the struct directly (`types.rs:368-383`); `rename` adds no wrapper (`:90`), its own doc test uses top-level `[changeset]` (`:360`), `init` writes top-level tables (`init.rs:614`). With `serde(default)` and no `deny_unknown_fields`, a `[package_tools.*]` file loads as defaults (static reading, not run) | not on any page yet |
| 2 | `crates/cli/src/cli/mod.rs:178` | `--config` default: auto-detect `.changesets.{toml,json,yaml,yml}` | Loader searches `repo.config.{toml,json,yaml,yml}` (`commands/mod.rs:66,107-110`) | not on any page yet |
| 3 | `crates/cli/src/main.rs:56`, `crates/cli/src/cli/mod.rs:94` | Usage shows `workspace changeset add` | Subcommand is `create`, no alias (`cli/commands.rs:249-253`) | `workspace-tools/overview` follows the code |
| 4 | `crates/node/src/lib.rs:8,60`, `crates/node/README.md:8` | 23 NAPI functions | 17 re-exported (`lib.rs:134-174`); the rest are unimplemented placeholders (`lib.rs:175-177`) | not on any page yet |
| 5 | `packages/workspace-tools/README.md:280` | `changesetAdd` takes `env?: string` | `environments?: Vec<String>` (`crates/node/src/types/changeset.rs:235`) | not on any page yet |
| 6 | `packages/workspace-tools/README.md:183` | `InitParams.defaultEnv?: string` | `default_env: Option<Vec<String>>` (`crates/node/src/types/init.rs:215`) | not on any page yet |
| 7 | `crates/node/src/lib.rs:96` | Example passes `bumpType` | Field is `bump` (`types/changeset.rs:225`) | not on any page yet |
| 8 | `packages/workspace-tools/README.md:104,136` | Function tables list `configShow` twice and omit `configValidate`, `upgradeCheck` | Both exported (`crates/node/src/lib.rs:170,174`) | not on any page yet |
| 9 | `packages/workspace-tools/README.md:3` | Badge for a `CI` workflow | No such workflow; names are Pull Request, Pull Request Node.js Bindings, Release Crates, Release Binaries, Release Node.js Bindings (`.github/workflows/`) | not on any page yet |
| 10 | `README.md:598-606`, `RELEASE.md:4-12` | Releases run through Release Please | release-plz with git-cliff (`release-plz.toml`, `cliff.toml`) and cargo-dist (`.github/workflows/release.yml`) | not on any page yet |
| 11 | `README.md:375,575` | Crate `sublime_package_tools` | Crate is `sublime_pkg_tools` (`crates/pkg/Cargo.toml`) | not on any page yet |
| 12 | `README.md:698-699` | Links `crates/cli/STORY_MAP.md`, `crates/cli/PLAN.md` | Neither file exists at that path; the targets are internal planning material | not on any page yet |
| 13 | `README.md:666,668` | Config also read from `SUBLIME_*`/`WORKSPACE_*` env vars and `~/.config/sublime/config.toml` | Loader reads only `--config` or `repo.config.*` (`crates/cli/src/commands/mod.rs:66,107-110,153`) | not on any page yet |
| 14 | `crates/cli/src/commands/config.rs:17` | `config` "applies environment variable overrides" | No env lookup in `config.rs`; config comes from `from_str` only (`commands/mod.rs:153`) | not on any page yet |
| 15 | `scripts/git-hooks/README.md:178` | `[git_hooks]` section in `.workspace.toml` | Not a `PackageToolsConfig` field (`crates/pkg/src/config/types.rs:91-150`) | not on any page yet |
| 16 | `scripts/git-hooks/README.md:312` | `changeset update --remove-commit` | No such flag (`crates/cli/src/cli/commands.rs`) | not on any page yet |
| 17 | `scripts/git-hooks/README.md:546` | License "MIT or Apache-2.0" | `license = "MIT"` (`Cargo.toml:30`), only `LICENSE-MIT` | `workspace-tools/overview` follows the code |
| 18 | `crates/pkg/README.md:231` | Rust 1.70 or later | `rust-version = "1.90.0"` (`Cargo.toml:29`) | `workspace-tools/overview` follows the code |
| 19 | `packages/workspace-tools/package.json:54` | `engines.node` `>= 10` | Root `package.json:8` requires `>=18.20.3`; binding built with `napi9` (`crates/node/Cargo.toml:68`) | not on any page yet |
| 20 | `crates/node/Cargo.toml:72-74` | Pins `sublime_cli_tools` 0.0.31, `sublime_git_tools` 0.0.15, `sublime_pkg_tools` 0.0.22 | Path crates are 0.0.37, 0.0.18, 0.0.27 (`crates/{cli,git,pkg}/Cargo.toml`) | not on any page yet |
| 21 | `README.md:37,40,51-67` | Install from `releases/latest/download/...` | `release.yml:44-45` publishes a GitHub release for every crate's version tag, so "latest" need not be a CLI release | `workspace-tools/overview` pins the `sublime_cli_tools-v0.0.37` assets |
| 22 | `CONTRIBUTING.md:32-36` | Add your changes by hand to `CHANGELOG.md` under Unreleased | Changelogs are generated per crate by release-plz and git-cliff (`release-plz.toml`, `CONTRIBUTING.md:24`) | not on any page yet |
| 23 | `justfile:36` | `--exclude workspace_binding` | Node crate is `sublime_node_tools` (`crates/node/Cargo.toml:2`); no `workspace_binding` package exists | not on any page yet |
| 24 | `crates/cli/Cargo.toml:4` | `documentation = https://docs.rs/sublime_cli` | Crate name is `sublime_cli_tools` (`crates/cli/Cargo.toml:2`) | `workspace-tools/overview` follows the code |

## Not reproduced at this ref

- Inventory #8, pkg configuration guide part: the guide lives in internal material excluded under D3; not checked as a public source. The public part (`config.rs:17`) is row 14.
- Inventory #9: the file that claims four flags are unimplemented is internal material (D3). The flags exist (`cli/commands.rs:172,323,517`; `commands/upgrade/apply.rs:186`), so no public contradiction remains.
- Inventory #11, changelog parts (npm `CHANGELOG.md` stops at 1.0.2; root `CHANGELOG.md` tracks node-binding work): stale or misplaced history, not a false claim about the code.
- Inventory #11, pkg README "[License information to be added]": missing documentation, not a contradiction.
