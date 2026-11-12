# Project inventories

There is one file per documented project. Each file is a snapshot of what the project offers to users, written before its pages are built (D17). The sync (D7) keeps the pages current. The inventory is a starting point and is not kept in sync: write a new snapshot when a project changes shape.

| Project | Inventory | Repository | Local checkout |
|---|---|---|---|
| delta | [delta.md](delta.md) | `websublime/delta` | `../delta` |
| trunks | [trunks.md](trunks.md) | `websublime/trunks` | `../trunks` |
| vite-open-api-server | [vite-open-api-server.md](vite-open-api-server.md) | `websublime/vite-open-api-server` | `../vite-open-api-server` |
| unblock | [unblock.md](unblock.md) | `websublime/unblock` | `../unblock` |
| workspace-tools | [workspace-tools.md](workspace-tools.md) | `websublime/workspace-tools` | `../workspace-node-tools` |
| line-ui | [line-ui.md](line-ui.md) | `websublime/line-ui` | `../line-ui` |
| focus | [focus.md](focus.md) | `websublime/focus` | `../focus` |

## Template for a new project

Read the project's files only; do not build or run anything. Give evidence as file paths with line numbers. Mark every claim you did not check as `[INFERENCE]`. Ignore `node_modules`, `target`, `dist` and `temp`.

1. **Identity.** Cover:
   - purpose, audience and stack;
   - version, taken from the manifest;
   - license;
   - packages and the registries they are published to;
   - repository remote;
   - status signals.
2. **Public surface.** Cover:
   - install methods;
   - CLI commands;
   - configuration files and keys;
   - library exports;
   - MCP tools, resources and prompts;
   - HTTP endpoints and any OpenAPI spec;
   - environment variables.

   For each list, give a count and the canonical source file a generator could re-derive it from.
3. **Existing documentation.** Classify every documentation file as PUBLIC-READY, INTERNAL or MIXED, and note its language (D3, D4).
4. **Brand assets.** Logos, icons and colours, with paths and hex values.
5. **Proposed page tree.** Groups and their pages, with the source files that feed each page.
6. **Drift watch-list.** Path globs mapped to the pages they affect. This becomes the page map in `sync/registry.yaml`.
7. **Gaps and inconsistencies.** Places where the README and the code disagree, stale versions, wrong names. This is the first input to `sync/reports/<slug>.md` (D6).
