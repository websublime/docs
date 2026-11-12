> **Snapshot.** Inventory written on 2026-11-12 by reading the local checkout (`../line-ui`), files only; nothing was built or run. The refs that are documented come from D5 and `sync/registry.yaml`. Section 7 is the first input to `sync/reports/line-ui.md` (D6).

# line-ui (line://ui) documentation inventory

Repo root: `../line-ui`. All paths below are relative to it.

## 1. Identity

| Field | Value | Evidence |
|---|---|---|
| Purpose | Headless UI primitives as native Web Components. Zag.js state machines handle logic and styling goes through `::part()` and `--line-*` properties. Works with any framework and is ready for AI agents (A2UI) | `README.md`, `docs/MANIFESTO.md` |
| Audience | Frontend developers in any framework or plain HTML/HTMX, plus people building agent UI (A2UI, MCP, AG-UI, A2A) | `docs/PRD.md` §1.5, `docs/MANIFESTO.md` principle 8 |
| Stack | Bun ≥1.4.3, Lit 3, Zag.js 1.47, Vite 8 + Rolldown, PostCSS, TypeScript 7, Biome, Changesets, Storybook 10, Astro 7, Playwright + axe | `package.json`, `README.md` "Tech stack" |
| Version | Root `@websublime/line-ui` **1.0.0** (private). README badge says **0.7.0**. Each package has its own version (see below) | `package.json`, `README.md:17` |
| License | MIT © 2026 Miguel Ramos / websublime | `LICENSE` |
| Remote | `git@github.com:websublime/line-ui.git` | `.git/config` |
| Registry | npm, scope `@websublime`, public. Published by `release.yml` via changesets/action, npm trusted publishing (OIDC) and `scripts/publish.mjs`. Canary builds use the `canary` dist-tag (`snapshot:publish`) | `.github/workflows/release.yml`, `.changeset/config.json` |
| Status | Pre-launch. Phase 0 is closed and Phase 1 "Core Primitives" (target v0.2.0) is in progress. The PRD plans **131 components** by 1.0; **12 have shipped**. The site is a "coming soon" placeholder. `line-genui/a2ui` is **Preview** | `docs/PRD.md:75,439,1184`, `apps/site/src/pages/index.astro` |
| Public site | `https://line-ui.websublime.com`, Cloudflare Pages project `line-ui`, deployed by `deploy-site.yml` | `apps/site/astro.config.mjs`, `apps/site/README.md` |
| Storybook | `https://line-ui-storybook.websublime.com`, Cloudflare Pages (PRD names the project `line-ui-storybook`; the workflow reads `vars.CLOUDFLARE_PAGES_PROJECT`). PR previews go to `pr-<n>` URLs on `*.pages.dev` | `README.md:24`, `docs/PRD.md` §5.4, `.github/workflows/deploy-storybook.yml` |

### Packages: 9 published, 3 private

| Package | Version | Kind | Notes |
|---|---|---|---|
| `@websublime/line-tokens` | 0.1.3 | CSS | 18 token families plus reset |
| `@websublime/line-colors` | 0.1.3 | CSS | 31 Radix hues plus special scales |
| `@websublime/line-themes` | 0.1.2 | CSS | Maps palettes onto roles (accent/gray/semantics/aliases/defaults) and ships the MCP Apps host bridge |
| `@websublime/line-schemas` | 0.1.1 | TS | Zod contracts: hues, steps, roles, aliases, semantic map, contrast table |
| `@websublime/line-utils` | 0.1.0 | TS | `contrast` and `mix` helpers |
| `@websublime/line-core` | 0.2.2 | TS/Lit | `LineElement`, `LineMachineController`, mixins, shadow-DOM reset sheets |
| `@websublime/line-components` | 0.2.4 | TS/Lit | The 12 components; ships `custom-elements.json` |
| `@websublime/line-icons` | 0.2.0 | TS | Icon resolver registry for Lucide and Phosphor; `./a2ui` is Preview |
| `@websublime/line-genui` | 0.1.0 | TS | A2UI catalog, frontend tools and `<line-a2ui-surface>`. It has no CHANGELOG, and the pending changeset `genui-scaffold.md` suggests it has not been published yet [INFERENCE] |
| `@websublime/line-testing` | 0.0.0 | private | Test helpers |
| `@websublime/line-storybook` | 0.0.0 | private | Storybook app |
| `@websublime/line-site` | 0.0.0 | private | Astro site |

Each package manifest is `packages/*/package.json` or `apps/*/package.json`.

## 2. Public surface

### Install
- `bun add @websublime/line-tokens @websublime/line-colors @websublime/line-themes` (`apps/storybook/stories/getting-started.mdx`).
- `bun add @websublime/line-genui @websublime/line-components @websublime/line-icons`. Components and icons are peer dependencies (`packages/line-genui/README.md`).
- Icons need the matching icon set: `bun add @websublime/line-icons lucide-static` or `@phosphor-icons/core`. Both are optional peers (`packages/line-icons/README.md`).
- CDN use: the docs disagree, see §7.

### Components: 12 custom elements plus 1 renderer

Components ship one subpath per component. Importing a subpath registers its tag, for example `import '@websublime/line-components/button'`. The root entry only exports `setIconRegistry` and the `LineIconRegistry` type.

Canonical sources:
- Subpath list: `packages/line-components/package.json` `exports`.
- Component directories: `packages/line-components/src/<name>/`, each with `index.ts`, `<name>.ts` and `<name>.types.ts`. Shared code lives in `src/shared/` (`icon-registry.ts`, `button-machine.ts`).
- Full API (attributes, slots, parts, CSS properties, events, summaries): `packages/line-components/custom-elements.json`, built by `custom-elements-manifest.config.mjs`. This is the best source for a generator.

| # | Tag | Directory | Notes |
|---|---|---|---|
| 1 | `line-alert` | `src/alert/` | |
| 2 | `line-avatar` | `src/avatar/` | |
| 3 | `line-avatar-group` | `src/avatar-group/` | |
| 4 | `line-badge` | `src/badge/` | |
| 5 | `line-button` | `src/button/` | Form-associated |
| 6 | `line-button-group` | `src/button-group/` | Custom roving-focus machine |
| 7 | `line-chip` | `src/chip/` | Uses `@zag-js/toggle` |
| 8 | `line-icon` | `src/icon/` | |
| 9 | `line-icon-button` | `src/icon-button/` | |
| 10 | `line-separator` | `src/separator/` | |
| 11 | `line-stack` | `src/stack/` | |
| 12 | `line-visually-hidden` | `src/visually-hidden/` | |
| + | `line-a2ui-surface` | `packages/line-genui/src/a2ui/surface.ts` | Described in `packages/line-genui/custom-elements.json` |

Events: `line-change` (Button, IconButton, Chip), `line-dismiss` (Alert), `line-a2ui-action` and `line-a2ui-error` (surface). Source: CEM and READMEs.

Planned roadmap (131 components in phases 2–8): `docs/PRD.md` §4 and §7. This is internal and roadmap only.

### Library exports, by package

**`line-core`** (`packages/line-core/package.json`, `src/index.ts`)
- `.`: `LineElement`, `INTERNALS`, `FormAssociated`.
- `./machine`: `LineMachineController`, `VanillaMachine`, `normalizeProps`, `spreadProps`, `mergeProps`.
- `./styles`: 11 reset sheets in `src/styles/reset.*.css`.
- `./mixins/*`: `form-associated`, `inspector`, `direction`, `metadata` (`src/mixins/`).

**`line-icons`** (`src/index.ts`)
- `./registry`: `IconRegistry`, `iconRegistry`.
- `./resolvers/lucide`: `createLucideResolver`.
- `./resolvers/phosphor`: `createPhosphorResolver`.
- `./a2ui`: `a2uiIconMap`, covering 59 A2UI icon names (`src/a2ui/names.ts`, `sets.ts`).

**`line-genui`**: no root export.
- `./catalog` (`src/catalog/index.ts`):
  - 12 descriptors in `src/catalog/descriptors/*.ts`. Eleven are agent-exposed; VisuallyHidden is not.
  - Helpers `defineDescriptor`, `componentSchema`, `commonProp`.
  - Catalog emitters `lineCatalog`, `lineCatalogDocument`, `inlineCatalog`, `lineCapabilities`, with `LINE_CATALOG_ID = https://line-ui.websublime.com/a2ui/catalogs/line/v1/catalog.json` (`src/catalog/line.ts:18`).
  - `basicImplementations` (`basic.ts`).
  - `frontendTools(descriptors, 'openai'|'anthropic'|'gemini')` (`tools.ts`).
- `./catalog.json`: emitted by `scripts/emit-catalog.mjs`.
- `./a2ui`: `Session`, `LineA2uiSurface`, limits, URL policy, error codes (`src/a2ui/*.ts`).

**`line-schemas`**: `.` and `./contrast-table` (`src/{hues,steps,roles,aliases,semantic-map,contrast-table}.ts`).

**`line-utils`**: `.`, `./contrast`, `./mix`.

### CSS packages

**`line-tokens`**: 20 subpaths. The root `index.css` plus 19 files in `src/*.css`:
- 11 primitive families: typography, sizing, shadows, easings, z-index, opacity, motion, radii, border-width, focus-ring, breakpoints.
- 7 decorative families: aspects, animations, gradients, masks, layouts, highlights, svg.
- `reset`.

**`line-colors`**: root, `./special`, and 31 hue files in `src/*.css`: amber, blue, bronze, brown, crimson, cyan, gold, grass, green, indigo, iris, jade, lime, mauve, mint, neutral, olive, orange, pink, plum, purple, red, ruby, sage, sand, sky, slate, teal, tomato, violet, yellow.

**`line-themes`**:
- `./accent/*`: 31 files (`src/accent/`).
- `./gray/*`: 6 files (sand, olive, sage, mauve, slate, neutral; `src/gray/`).
- `./semantics`, `./aliases`, `./defaults`.
- `./hosts/mcp-apps.css`.

All CSS sits in `@layer line` and uses `:where()` selectors.

### Configuration surface (no config files)
- HTML attributes `data-accent="<hue>"` and `data-gray="<hue>"`. The default accent is `indigo` and gray auto-pairs with it (`docs/PRD.md` §9.4–9.5, `stories/theming.mdx`).
- `color-scheme` is the only light/dark switch.
- Inspector: `localStorage['line-ui:inspector'] = 'on'` (`packages/line-core/src/mixins/inspector.ts:12`).

### Not present
- No CLI. The only scripts are root `package.json` scripts for contributors.
- No MCP server, tools, resources or prompts are shipped. `apps/storybook/stories/recipes/mcp-server.ts` is a demo.
- No HTTP endpoints and no OpenAPI spec.

### Environment variables (CI/dev only, none for consumers)
- `LINE_E2E_CDN`, `LINE_VISUAL_OFF_PAIRS`, `CI` (`playwright.config.ts`).
- `GITHUB_ACTIONS` (`scripts/report-size.mjs`).
- `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `NPM_TOKEN` (workflows).
- A `.env` file (48 B) exists. I did not read it.

## 3. Existing doc material

| Path | Class | Lang | Note |
|---|---|---|---|
| `README.md` | MIXED | EN | Hero and architecture are public-ready. Badges are stale and the contributing section is wrong (see §7) |
| `packages/line-components/README.md` (437 lines) | PUBLIC-READY | EN | Per-component reference for 11 components; Button is missing |
| `packages/line-genui/README.md` | PUBLIC-READY | EN | Catalog, tools, renderer. Has internal refs such as "PRD §7.1" |
| `packages/line-icons/README.md` | PUBLIC-READY | EN | Complete guide |
| `packages/line-core/README.md` | PUBLIC-READY | EN | Dense; aimed at component authors |
| `packages/line-themes/README.md` | PUBLIC-READY | EN | Contains a leftover "(wired in B2)" |
| `packages/line-tokens/README.md`, `line-colors/README.md` | PUBLIC-READY | EN | Short |
| `packages/line-schemas/README.md`, `line-utils/README.md` | PUBLIC-READY | EN | One line each |
| `packages/line-testing/README.md` | INTERNAL | EN | Private package |
| `packages/line-core/__experimental__/htmx/README.md` | INTERNAL | EN | Unbuilt spike |
| `packages/line-genui/__tests__/fixtures/a2ui-v0_9_1/SOURCE.md` | INTERNAL | EN | Test fixture |
| `packages/*/CHANGELOG.md` (8 packages; genui has none) | PUBLIC-READY | EN | Changesets with GitHub links |
| `.changeset/*.md` (25 pending) | MIXED | EN | Good material for "Unreleased" notes; `README.md` there is boilerplate |
| `apps/storybook/stories/getting-started.mdx` | PUBLIC-READY | EN | Stale package count and CDN note |
| `apps/storybook/stories/theming.mdx` | PUBLIC-READY | EN | |
| `apps/storybook/stories/customisation.mdx` | PUBLIC-READY | EN | Stale "Phase 00 ships no components" |
| `apps/storybook/stories/htmx.mdx` | PUBLIC-READY | EN | Refers to "ARCHITECTURE §17.2 rule C9" |
| `apps/storybook/stories/recipes/{sse,mcp,mcp-apps-view,ag-ui,a2a}.mdx` | PUBLIC-READY | EN | Transport recipes |
| `apps/storybook/README.md`, `apps/site/README.md` | INTERNAL | EN | Contributor-facing; URLs are useful |
| `docs/MANIFESTO.md` | MIXED | EN | Vision and principles are publishable; governing laws and ledger refs are internal |
| `docs/ARCHITECTURE.md` (125 KB) | MIXED | EN | Concepts such as tiers and the token flow can be adapted; the rest is internal design |
| `docs/PRD.md` (174 KB) | INTERNAL | EN | Mine §1, §9 and Appendices A–D for concepts and roadmap; do not publish |
| `docs/PROCESS.md`, `docs/STYLE.md`, `docs/STYLE-EXEMPLAR.md` | INTERNAL | EN | Workflow and an AI writing-style guide |
| `docs/COMPETITIVE-COMPONENT-ANALYSIS.md` | INTERNAL | EN | |
| `docs/specs/*.md` (15 files: phase specs 00 and 01, template, 0002–0018 component specs) | INTERNAL | EN | Source of truth for behaviour; do not publish |
| `docs/plans/*.md` (4 files) | INTERNAL | EN | |
| `docs/context/*.md` (33 files) | INTERNAL | EN, quotes Miguel's requests in PT | e.g. `01-c11.md` "Inicia a tarefa…" |
| `docs/research/**` (16 files plus `assets/01-r2/spike/README.md`) | INTERNAL | EN | |
| `docs/retrospective/00-phase-00-retro.md` | INTERNAL | EN | |
| `CODE_OF_CONDUCT.md` | PUBLIC-READY | EN | Can be linked |
| `CLAUDE.md`, `AGENTS.md`, `.claude/**`, `.omp/`, `.mcp.json` | INTERNAL | EN | Agent files |

Story sources (`apps/storybook/stories/**/*.stories.ts`) are live demos, not prose: 12 component stories, `agent-ui/a2ui-surface.stories.ts`, `design-system/{palettes,roles}.stories.ts`, `theming.stories.ts`, `customisation.stories.ts`. They are useful as embed/link targets.

## 4. Brand assets

| File | Use | Colours |
|---|---|---|
| `branding/logo-wordmark.svg` (400×80) | For dark backgrounds | Text `#E8E8E8`, `://` `#c8ff00` |
| `branding/logo-wordmark-dark.svg` | For light backgrounds | Text `#1A1A1A`, `://` `#6d8a00` |
| `branding/symbol-mark.svg` (64×64, the `://` mark) | For dark backgrounds | Dots `#c8ff00`, slashes `#E8E8E8` |
| `branding/symbol-mark-dark.svg` | For light backgrounds | Dots `#6d8a00`, slashes `#1A1A1A` |
| `apps/site/public/favicon.svg` | Adaptive symbol, switches with `prefers-color-scheme` | |

- **Fonts:** both wordmarks are `<text>` set in JetBrains Mono 700, loaded with a Google Fonts `@import`. They are not outlined, so they render wrong anywhere the font cannot load. The site uses a monospace stack.
- **Brand accent:** `#c8ff00` on dark, `#6d8a00` on light. Site backgrounds are `#fafafa` (light) and `#111111` (dark), text `#1a1a1a` / `#e8e8e8`. Badge label colour is `#1a1a1a` (`docs/PRD.md` Appendix C, `apps/site/src/pages/index.astro`).
- **Library default accent:** indigo, which is separate from the brand colour (PRD Appendix C).
- **Naming:** always lowercase `line://ui`; never "LineUI" (PRD Appendix C).
- **Mintlify mapping:** use `logo.light = logo-wordmark-dark.svg` and `logo.dark = logo-wordmark.svg`. The `-dark` suffix means dark ink. Set `colors.primary #6d8a00`, `light #c8ff00`, `dark #6d8a00` [INFERENCE].

## 5. Proposed Mintlify page tree

**Get started**
- Introduction ← `README.md` hero and architecture, `docs/MANIFESTO.md` Vision and Principles
- Installation ← `getting-started.mdx` Install, package `package.json` `exports`
- Quickstart (CSS + first component) ← `getting-started.mdx`, `line-components/README.md` intro
- Packages overview (9 packages, dependency layers) ← `packages/*/package.json`, `docs/PRD.md` §6.1/§9.1 (adapt)

**Concepts**
- Headless architecture and component tiers (pre-built Zag / custom machine / static) ← `README.md` Architecture, `docs/ARCHITECTURE.md` (adapt)
- Styling: `::part()`, token tiers, `--line-{component}-{prop}` ← `stories/customisation.mdx`
- Cascade layer `line` ← `customisation.mdx` §Cascade, `line-tokens/README.md`
- Accessibility ← component READMEs, `MANIFESTO.md` law 3
- Inspector ← `docs/PRD.md` Appendix B, `line-core/src/mixins/inspector.ts`

**Design system**
- Tokens (18 families + reset) ← `line-tokens/README.md`, `line-tokens/src/*.css`
- Colours (31 hues, alpha, P3, special) ← `line-colors/README.md`, `line-colors/src/*.css`, `line-schemas/src/hues.ts`
- Theming (`data-accent`/`data-gray`, auto-pairing, light/dark, semantic roles, aliases) ← `stories/theming.mdx`, `line-themes/README.md`, `line-schemas/src/{roles,aliases,semantic-map}.ts`
- Schemas and utils ← `line-schemas/README.md`, `line-utils/README.md`, `src/*.ts`

**Components** (12 pages, one per tag)
- Alert, Avatar, AvatarGroup, Badge, Button, ButtonGroup, Chip, Icon, IconButton, Separator, Stack, VisuallyHidden
- Each page ← `line-components/README.md` section, `custom-elements.json` API tables, `src/<name>/*.types.ts`, plus a Storybook embed link (`apps/storybook/stories/components/<name>.stories.ts`)

**Icons**
- Icon registry and resolvers (Lucide, Phosphor, bundled, CSP) ← `line-icons/README.md`

**Agent UI (GenUI)**
- Overview and tiers ← `line-genui/README.md` intro, `MANIFESTO.md` principle 8, PRD Appendix D (adapt)
- Descriptors and the `line` catalog ← `line-genui/README.md` §Descriptors/§catalog, `src/catalog/*.ts`
- Frontend tools (OpenAI/Anthropic/Gemini) ← `README.md` §Frontend tools, `src/catalog/tools.ts`
- A2UI renderer `<line-a2ui-surface>` (Preview) ← README §renderer, `line-genui/custom-elements.json`, `src/a2ui/*.ts`
- A2UI icon map ← `line-icons/README.md` §A2UI

**Guides / recipes**
- HTMX ← `stories/htmx.mdx`
- SSE / MCP / MCP Apps view / AG-UI / A2A ← `stories/recipes/*.mdx`
- Using with frameworks (React/Vue/…) ← currently missing, see §7

**Reference**
- Package exports (per package) ← `packages/*/package.json`
- `line-core` API (LineElement, LineMachineController, mixins, reset sheets) ← `line-core/README.md`, `src/**`
- CSS custom properties index ← `custom-elements.json` `cssProperties`, `line-tokens/src`, `line-themes/src`
- Events index ← CEM `events`

**Resources**
- Changelog ← `packages/*/CHANGELOG.md`, plus pending `.changeset/*.md` as "Unreleased"
- Roadmap (optional, public subset) ← `docs/PRD.md` §7.12
- Storybook and GitHub links, Code of Conduct

## 6. Drift watch-list

| Glob | Pages affected |
|---|---|
| `packages/line-components/src/*/**`, `packages/line-components/custom-elements.json`, `packages/line-components/README.md` | Components/*, Reference CSS props and events |
| `packages/line-components/package.json` (`exports`) | Components index, Installation, Package exports |
| `packages/line-genui/src/catalog/**`, `packages/line-genui/README.md`, `scripts/emit-catalog.mjs` | Agent UI: descriptors, catalog, tools |
| `packages/line-genui/src/a2ui/**`, `packages/line-genui/custom-elements.json` | Agent UI: renderer |
| `packages/line-icons/src/**`, `packages/line-icons/README.md` | Icons, A2UI icon map, Component Icon |
| `packages/line-core/src/**`, `packages/line-core/README.md` | line-core reference, Inspector, Concepts/architecture |
| `packages/line-tokens/src/*.css`, `packages/line-tokens/README.md` | Tokens, Cascade layer |
| `packages/line-colors/src/*.css`, `packages/line-colors/README.md`, `scripts/generate-palettes.mjs` | Colours |
| `packages/line-themes/src/**`, `packages/line-themes/README.md`, `scripts/generate-role-maps.mjs` | Theming, MCP Apps view recipe |
| `packages/line-schemas/src/*.ts`, `packages/line-utils/src/*.ts` | Schemas and utils, Theming (semantic map) |
| `packages/*/package.json` (`version`, `exports`, `peerDependencies`) | Installation, Packages overview, Package exports |
| `packages/*/CHANGELOG.md`, `.changeset/*.md` | Changelog |
| `apps/storybook/stories/*.mdx`, `apps/storybook/stories/recipes/*.mdx` | Quickstart, Styling, Theming, HTMX, Recipes |
| `apps/storybook/stories/components/*.stories.ts` | Component page embeds and examples |
| `README.md`, `docs/MANIFESTO.md` | Introduction |
| `branding/**`, `apps/site/public/favicon.svg` | Mintlify `docs.json` logo and favicon |
| `docs/specs/00*-*.md` (component specs) | Signals for component pages; review only, never publish |
| `docs/PRD.md` §7 (roadmap), `docs/ARCHITECTURE.md` | Roadmap, Concepts (review only) |

## 7. Gaps and inconsistencies

1. **Version mismatch.** The README badge says **0.7.0**, which is the PRD v0.7.0 era. Root `package.json` says **1.0.0**. Packages range from 0.1.0 to 0.2.4. `docs/PRD.md` §7.1 says 1.0.0 only when all phases are done.
2. **Component count.** The README badge says "components-131" and links the PRD. Only 12 exist; 131 is the plan (`docs/PRD.md:75` "131 (planned)").
3. **Broken changelog link.** The README links `./CHANGELOG.md`, but there is no root changelog, only per-package ones.
4. **Missing dev script.** README contributing says `bun run dev`, but root `package.json` has no `dev` script.
5. **Button undocumented in the README.** `line-components/README.md` has sections for 11 components but none for `<line-button>`, even though Button ships (CEM line 5842, CHANGELOG 0.2.1).
6. **Published vs repo.** 25 pending changesets add Alert, Avatar, AvatarGroup, Badge, ButtonGroup, Chip, Icon, IconButton and VisuallyHidden, plus the whole of genui. So npm `line-components@0.2.4` likely ships only Button, Stack and Separator [INFERENCE from the CHANGELOG], and the docs must say which version introduced each component.
7. **Getting Started is stale.** `getting-started.mdx:7` says the design system "has five packages"; there are 9 published. Line 15 says "CDN delivery … not supported until Phase 1". Meanwhile `recipes/mcp-apps-view.mdx:53` imports from jsDelivr, `line-core/README.md:16` covers unpkg and jsDelivr, and `cdn-check.yml` tests CDNs.
8. **Customisation guide is stale.** `customisation.mdx:12` says "Phase 00 ships the design system and no components" and demos with `<line-demo-button>`.
9. **Internal references leak into public READMEs.** Examples: `line-themes/README.md` "(wired in B2)"; "PRD §7.1" in the genui and icons READMEs; "ARCHITECTURE §17.2 rule C9" in `htmx.mdx`.
10. **Site is a placeholder.** `apps/site` is "coming soon". The PRD §5.3 site (docs, theming showcase, changelog) does not exist yet. If Mintlify replaces it, the domain `line-ui.websublime.com` and the catalog id URL prefix `https://line-ui.websublime.com/a2ui/catalogs/...` need a decision. The id "need not resolve", but it sits on that domain.
11. **Storybook branding is minimal.** `apps/storybook/.storybook/manager.ts` shows a title only and `brandUrl` points to GitHub, not the docs.
12. **genui lacks release history.** It has no CHANGELOG, and its peer ranges `^0.1.0 || ^0.2.0` will need updating.
13. **Missing guides.** There are no framework integration guides (React, Vue, Svelte, Angular, Astro) even though principle 5 promises them, no SSR guidance, and no `line-core` "build your own component" guide.
14. **Inspector is undocumented in public docs.** The `localStorage` flag appears only in the PRD and source.
15. **Wordmark font dependency.** The SVG wordmarks rely on a remote Google Fonts `@import`; they should be outlined for reliable rendering in Mintlify.