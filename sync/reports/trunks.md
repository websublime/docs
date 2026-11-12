# Trunks: source report

Places where this project's own documentation or help text disagrees with its code at the documented ref. Under D6 they are recorded here and not fixed in the project. Pages follow the code (D2).

- **Ref:** `v0.1.0-rc.2` (`d111e0d96b0b`)
- **Checked:** 2026-11-12

## Open

| # | Where | The source says | The code at the ref | Page handling |
|---|---|---|---|---|
| 1 | `README.md:17-20` | Status is "pre-alpha"; "the first tagged release is still to come" (and points to an internal planning document) | `Cargo.toml:8` is `0.1.0-rc.2`; `CHANGELOG.md:10` has `[0.1.0-rc.2]`; tags `v0.1.0-rc.1` and `v0.1.0-rc.2` exist | `trunks/overview` follows the code (RC badge, Status section) |
| 2 | `README.md:27`, `docs/guide/operations.md:15` | Install with `releases/latest/download/trunks-installer.sh` | Only prerelease tags exist; `latest/download` only resolves to a final release | `trunks/overview` follows the code (tag pinned in URLs) |
| 3 | `docs/guide/operations.md:39` | Example runs `ghcr.io/websublime/trunks:latest-stdio` | `.github/workflows/docker.yml:133-137` adds `latest`/`latest-stdio` only for tags without `-`; no final tag exists | `trunks/overview` follows the code (`v0.1.0-rc.2-stdio`) |
| 4 | `docs/guide/operations.md:25-26` | Image tags are `<version>` and `<version>-stdio` | `.github/workflows/docker.yml:107,131` uses `$GITHUB_REF_NAME`, so tags keep the `v` (`v0.1.0-rc.2-stdio`) | `trunks/overview` follows the code |
| 5 | `crates/trunks/src/config.rs:1`, `docs/guide/reference/configuration.md:72`, `docs/guide/operations.md:74`, `docs/guide/enterprise.md:22` | CLI config is `~/.config/trunks/config.toml` | `crates/trunks/src/config.rs:19` uses `dirs::config_dir()`: `~/Library/Application Support` on macOS, `%APPDATA%` on Windows [INFERENCE: dirs crate behaviour] | not on any page yet |
| 6 | `crates/trunks/src/main.rs:86,90` | `create`/`delete` help: "a tool group, a user or an MCP client" | `crates/trunks/src/commands/identities.rs:22,93,230,238` also handle `team` | not on any page yet |
| 7 | `crates/trunks/src/main.rs:76` | `list` help: "servers, tools, prompts or resources" | `crates/trunks/src/commands/list.rs:16-47` has 9 subcommands (also groups, users, mcp-clients, teams, grants) | not on any page yet |
| 8 | `docs/guide/README.md:27` | Design documents run from the first to the seventh | An eighth design document exists at the ref (`git ls-tree`) | not on any page yet |
| 9 | `crates/trunks-dashboard/Cargo.toml:3` | "Embedded dashboard SPA assets" | Console is a static Astro site (`web/app/astro.config.mjs`) | not on any page yet |

## Not reproduced at this ref

- Manifest/CHANGELOG at `0.1.0-rc.1` with no entry for rc.2: at the ref `Cargo.toml:8` is `0.1.0-rc.2` and `CHANGELOG.md:10` has the entry.
- Node 22 vs Node 24: `README.md:98` is about building the console from source, which `Dockerfile:13` does with Node 22; Node 24 is the runtime of the `-stdio` image (`Dockerfile:42`, `operations.md:26`). No contradiction.
- No `trunks update team` for `PUT /api/v0/teams/{name}`: a missing command, not a false claim.
- Logo tagline "HUB & PROXY" vs "gateway and registry": no text source at the ref says "HUB & PROXY"; the README banner alt text (`README.md:1`) and `Cargo.toml` agree.
- Codex named in the README without a section in `clients.md`: missing documentation; `clients.md:102` covers other clients generically.
- No OpenAPI, undocumented SDK, no metrics reference: missing documentation, not a false claim.
- Internal relative links in the guide and README: a publishing concern, not a contradiction with the code.
