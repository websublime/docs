# AGENTS.md: websublime docs

This file is the operating contract for any agent or human working in this repository. Keep it short. The detail lives in `knowledge/`.

## What this is

This is the documentation hub for websublime's open-source projects: one Mintlify site (OSS Program, Pro) at `docs.websublime.com` (D1, D14). The sources live in this repository. Pages are written by reading each project's own sources (D2), not by editing the projects themselves.

Projects documented: delta, trunks, vite-open-api-server, unblock, workspace-tools, line-ui, focus. Their checkouts sit next to this repository under `../<project>`.

## Read before working

1. `knowledge/decisions.md`: every decision, with D-ids. Do not reopen a decision without a new intent.
2. `knowledge/process.md`: how every change is delivered.
3. `knowledge/projects/<slug>.md`: what a project offers, which of its files are public, and which are internal.
4. `knowledge/research/`: platform facts (Mintlify) and design-system facts (line://ui).

## Hard rules

- **Process (D15).** intent (GitHub issue) → decide (Miguel confirms; record D-ids) → implement (branch + PR) → test/review → release (merge).
- **CI is the gate** (with the D18 exception for skipped Mintlify deployments).
  - When a check fails, stop, fix the cause in the same PR, and wait for green.
  - Never skip, disable or weaken a check, and never move on to other work while CI is red.
  - If you cannot fix the failure, stop and report it with the log.
- **Agents never merge.** A merge needs Miguel's explicit approval.
- **Never make a solution simpler just to make progress.** If you reach that point, stop and ask Miguel.
- **Record decisions.** Any new or changed decision goes into `knowledge/decisions.md` in the same PR (D16).
- **No internal material on the site (D3).** That means:
  - PRDs, plans, specs, spikes, context and research notes;
  - agent files;
  - `temp/`;
  - Portuguese design docs;
  - internal ids (`FR-*`, `D*`, `NFR-*`) and links into internal folders.
- **The code is the truth (D2).** When a project's README contradicts its code, document what the code does. Record the contradiction in `sync/reports/<slug>.md` (D6). Never edit the project repositories from here.
- **Documented version (D5).** Latest stable release. Exceptions: trunks uses its latest RC tag, focus uses `main`, line-ui uses only what is published on npm.
- **English only** on the site (D4).
- **Styling (D9 to D11).**
  - Every custom component declares `data-accent`.
  - No `line-` class prefixes on markup that is not from line.
  - Static parts are HTML in MDX; JSX is for interactive parts only.
  - Chrome hex values come from the line `sand` scale.

## Checks

Run these locally before pushing; CI runs the same:

```bash
npx mint@4.3.19 validate
npx mint@4.3.19 broken-links
```

For visual changes, preview with `npx mint@4.3.19 dev` in both light and dark mode.

## Mintlify

- Pages are MDX with YAML frontmatter. Configuration lives in `docs.json`.
- Mintlify's agent workflow instructions are available through `npx mint@latest instructions`.
- `knowledge/` is excluded from the site through `.mintignore`.

## Writing style

- Use active voice and second person ("you").
- Keep sentences short, with one idea per sentence.
- Use sentence case for headings.
- Use bold for UI elements: Click **Settings**.
- Use code formatting for file names, commands, paths and code references.
