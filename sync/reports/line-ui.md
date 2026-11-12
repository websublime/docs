# line://ui: source report

Places where this project's own documentation or help text disagrees with its code at the documented ref. Under D6 they are recorded here and not fixed in the project. Pages follow the code (D2).

- **Ref:** the npm-published versions, one source each:
  - `@websublime/line-tokens@0.1.3` (`f14dcb68b7ab`)
  - `@websublime/line-colors@0.1.3` (`f14dcb68b7ab`)
  - `@websublime/line-themes@0.1.2` (`c92cabe48560`)
  - `@websublime/line-schemas@0.1.1` (`a3ee3088c0f1`)
  - `@websublime/line-utils@0.1.0` (`10efd04c477b`)
  - `@websublime/line-core@0.2.2` (`d1c542d542da`)
  - `@websublime/line-components@0.2.4` (`a4f021dc5cb8`), which also covers the root `README.md`
  - `@websublime/line-icons@0.2.0` (`28cd062dbbd2`)
- **Checked:** 2026-11-12

## Open

| # | Where | The source says | The code at the ref | Page handling |
|---|---|---|---|---|
| 1 | `README.md:19` | Version badge says 0.7.0 | Root `package.json:16` is 1.0.0; published packages are 0.1.0 to 0.2.4 | `line-ui/overview` lists the per-package npm versions |
| 2 | `README.md:20` | Badge says 131 components | `packages/line-components/src/` has only `button`, `separator` and `stack` | `line-ui/overview` says three published components |
| 3 | `README.md:24` | Links `./CHANGELOG.md` | No root `CHANGELOG.md`; only per-package ones | `line-ui/overview` links `packages/line-components/CHANGELOG.md` |
| 4 | `README.md:86` | Contributing runs `bun run dev` | Root `package.json` `scripts` has no `dev` | `line-ui/overview` uses `lint`, `build`, `test` and `changeset` |
| 5 | `README.md:80` | Contributing points to a spec template in an internal folder | That folder is internal material (D3); no `CONTRIBUTING` file exists | `line-ui/overview` gives its own contribute steps |
| 6 | `README.md:73` | "28-palette colour system" and `tokens.css` | `packages/line-colors/src/` at `line-colors@0.1.3` has 31 hue files (plus `index.css`, `special.css`); `line-tokens@0.1.3` `package.json` exports `.` and per-group subpaths, no `tokens.css` | `line-ui/overview` says 31 palettes and `@import '@websublime/line-tokens'` |
| 7 | `README.md:15` | "Zero visual opinion" | `packages/line-components/src/button/button.ts:117-139` sets themed default background and text colours per variant | `line-ui/overview` says components ship themed defaults that you can restyle; the absolute claim is not repeated |
| 8 | `packages/line-components/README.md:5-10` | Lists `<line-button>` but documents only Stack and Separator sections | `button` ships (`src/button/button.ts`; CHANGELOG 0.2.1) | `line-ui/overview` describes Button from the code |
| 9 | `apps/storybook/stories/getting-started.mdx:7` | Design system "has five packages" | Eight packages are published at this ref | `line-ui/overview` lists the eight packages |
| 10 | `apps/storybook/stories/getting-started.mdx:15` | CDN delivery is not supported yet | `packages/line-core/README.md:16` at `line-core@0.2.2` documents unpkg and jsDelivr use | not on any page yet |
| 11 | `apps/storybook/stories/customisation.mdx:12` | No components ship; demo uses `<line-demo-button>` | `<line-button>`, `<line-stack>`, `<line-separator>` ship at `line-components@0.2.4` | not on any page yet |
| 12 | `packages/line-themes/README.md:3` at `line-themes@0.1.2` | Dependency on `line-schemas` is still to be wired, citing an internal milestone | `packages/line-themes/package.json:28-31` already depends on `@websublime/line-schemas` | not on any page yet |

## Not reproduced at this ref

- Inventory 7.6 (pending changesets add components and genui): at `line-components@0.2.4` only `button`, `separator` and `stack` exist, matching the CHANGELOG; nothing contradicts.
- Inventory 7.7 (`recipes/mcp-apps-view.mdx` jsDelivr import): the file does not exist at the ref; the CDN part is kept as #10.
- Inventory 7.9 (internal references in READMEs and `htmx.mdx`): an internal-reference leak, not a docs-versus-code contradiction; handled by D3. The stale `line-themes` claim is kept as #12.
- Inventory 7.10, 7.11, 7.13, 7.14, 7.15 (placeholder site, Storybook branding, missing guides, Inspector undocumented, wordmark fonts): missing documentation or planning gaps, no false claim.
- Inventory 7.12 (genui release history): `line-genui` is not published at this ref.
