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
| 10 | `docs/guide/reference/configuration.md:45` | Setting an OIDC issuer in development mode is a start-up error | `crates/trunks/src/commands/start.rs:143-147` only logs a warning and starts | `trunks/guides/single-sign-on`, `trunks/reference/configuration` follow the code |
| 11 | `docs/guide/reference/api.md:173` | Grants are enterprise-only and answer 403 in development mode | `crates/trunks-api/src/lib.rs:92` mounts the grants routes behind `require_admin` only; `require_enterprise` (lines 98, 104) covers users, `whoami`, clients and teams | `trunks/reference/http-api` follows the code |
| 12 | `docs/guide/reference/api.md:93` | An unknown group returns `tool group not found: <name>` | `crates/trunks-api/src/mcp.rs:92,95` with `crates/trunks-core/src/error.rs:12` returns `tool group: <name> not found` | `trunks/reference/mcp-endpoints` follows the code |
| 13 | `docs/guide/reference/api.md:37` | `/metrics` is Prometheus text format | `crates/trunks-api/src/routes/public.rs:47` sends `application/openmetrics-text; version=1.0.0` | `trunks/guides/operations`, `trunks/reference/http-api` follow the code |
| 14 | `docker-compose.yaml:10`, `docker-compose.prod.yaml:12` | Use the `:latest-stdio` and `:latest` images | `.github/workflows/docker.yml:133-137` publishes `latest*` only for tags without `-`; neither tag exists at this release | `trunks/installation` warns to change the `image:` line |
| 15 | `docs/guide/quickstart.md:28`, `README.md` | `cargo install --git …` installs Trunks | Without `--tag` it builds `main`, not the release | `trunks/installation` pins `--tag v0.1.0-rc.2` |
| 16 | `docs/guide/quickstart.md` | The web console is served at `/` | Only release binaries and images embed it: `crates/trunks-dashboard/dist/` holds `.gitkeep` and is filled by the build setup (`.github/build-setup.yml`), so `cargo install --git` builds a binary without the console | `trunks/installation` explains it in a note |
| 17 | `crates/trunks-types/src/names.rs:7` (comment) | Resource URIs use base64url without padding | `names.rs:14,180,205` use the standard alphabet without padding (`STANDARD_NO_PAD`) | `trunks/concepts/core-concepts`, `trunks/reference/mcp-endpoints` follow the code |

## Not reproduced at this ref

- Manifest/CHANGELOG at `0.1.0-rc.1` with no entry for rc.2: at the ref `Cargo.toml:8` is `0.1.0-rc.2` and `CHANGELOG.md:10` has the entry.
- Node 22 vs Node 24: `README.md:98` is about building the console from source, which `Dockerfile:13` does with Node 22; Node 24 is the runtime of the `-stdio` image (`Dockerfile:42`, `operations.md:26`). No contradiction.
- No `trunks update team` for `PUT /api/v0/teams/{name}`: a missing command, not a false claim.
- Logo tagline "HUB & PROXY" vs "gateway and registry": no text source at the ref says "HUB & PROXY"; the README banner alt text (`README.md:1`) and `Cargo.toml` agree.
- Codex named in the README without a section in `clients.md`: missing documentation; `clients.md:102` covers other clients generically.
- No OpenAPI, undocumented SDK, no metrics reference: missing documentation, not a false claim.
- Internal relative links in the guide and README: a publishing concern, not a contradiction with the code.
