# Sync procedure (`docs-sync`)

This is how an agent, or a human, keeps the project pages in step with each project's documented ref. Any agent can follow it. `.claude/commands/docs-sync.md` points here. Decisions D2 to D7, D15 and D23 apply.

## Tools

| Command | What it does |
|---|---|
| `bun scripts/sync.ts` | For every project: whether a newer release exists, the files changed between `lastSynced` and the ref, and the pages those files affect |
| `bun scripts/sync.ts --project <slug> --json` | The same for one project, as JSON |
| `bun scripts/sync.ts --mark-synced <slug>` | Sets `lastSynced` to the resolved ref of every source of `<slug>` |
| `bun scripts/sync.ts --validate` | Checks the registry structure and that every watched page exists (runs in CI) |
| `bun scripts/leak-lint.ts` | Fails on internal material in published files (D3; runs in CI) |

`sync/registry.yaml` describes each project:
- `checkout`: the local clone, next to this repository;
- `status`: the badge (D8);
- `accent`: the hue (D10);
- `exclude`: internal globs that never feed pages (D3);
- `sources`, one per release line. A source has:
  - `channel`: `stable`, `stable-else-prerelease` or `branch`;
  - `tagPattern`: a regex with one capture group for the version;
  - `branch`;
  - `ref`: the documented ref (D5);
  - `lastSynced`: the commit the pages were last written from;
  - `watch`: each page mapped to the source globs its facts depend on.

The script rewrites the whole file when it marks a project as synced, so edit the registry in the same YAML style that `Bun.YAML.stringify` produces.

## Procedure

1. **Run `bun scripts/sync.ts`.** Nothing changes yet.
2. **Newer release reported.** Moving the ref is a decision (D5, D23). Open an intent proposing the new ref, and wait for Miguel. Never edit `ref` without one.
3. **Affected pages listed.** Open a `sync` intent for the project, naming the ref range, then:
   1. Read the changed files **at the ref only**, with `git -C <checkout> show <ref>:<path>`, never the working tree.
   2. Update every affected page. The code is the truth (D2). Use English (D4) and no internal material (D3).
   3. **Unmapped** files (changed but not watched by any page) may hold new public features. Check them. If one deserves documentation, either add it to a page and extend that page's `watch` globs, or propose a new page in the intent.
   4. Update `sync/reports/<slug>.md`:
      - add the contradictions you found;
      - move rows the ref has fixed to "Not reproduced at this ref";
      - update the header's ref and sha.
   5. When the pages state what the ref says, run `bun scripts/sync.ts --mark-synced <slug>` in the same pull request (process stage 5).
4. **Check locally:** `bun scripts/leak-lint.ts`, `bun scripts/sync.ts --validate`, `npx mint@4.3.19 validate`, `npx mint@4.3.19 broken-links`, `vale *.mdx */*.mdx`. Then open the pull request and follow D15 to the end.

## Leak-lint exceptions

When a published line needs a word the lint flags, and it is not internal material, add this marker on **that same line**, with the reason:

```mdx
Write the wiring block into `AGENTS.md`. {/* leak-lint: allow unblock itself writes this file in the user's project */}
```

A marker without a reason is itself a finding.
