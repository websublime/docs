# Mintlify platform facts

These facts were checked against Mintlify's own documentation (`https://www.mintlify.com/docs/*.md`) on 2026-11-12, and with `mint` CLI 4.3.19. Check them again before relying on them for a new decision, because the platform changes.

## Plan

- **OSS Program:** non-commercial open-source projects get **Pro free, forever**. That includes custom domains and branding, advanced analytics, the API playground and **Autopilot** (blog post "Mintlify Pro for Startups and Open Source Projects").
- **Credits:**
  - Each Pro project adds 10,000 credits a month to the organization's pool, and unused credits roll over.
  - Autopilot costs 250 credits for each pull request it opens or updates on its own.
  - A pull request you ask Autopilot for costs 0, and a run that finds nothing to change costs 0.
- **Enterprise only:** Automations (prompts that run on triggers), multi-repository projects and static export.
- **`mintlify/multirepo-action`** (free) copies a docs folder from each child repository into a parent repository and merges each child's `docs.json` navigation. Not used here (D1).

## Navigation (`docs.json`)

- **`navigation.products`** gives a product switcher. Each entry takes:
  - `product` (required);
  - `description`;
  - `icon`;
  - `groups` or `pages`, or a `menu`;
  - `href`.

  **There is no `tag` field on a product.**
- **Page frontmatter `tag`** shows a label next to the page title in the sidebar.
- **`navigation.global.products`** is a different feature: a global switcher with `color` and `href`.
- **Colours:** `colors.primary`, `colors.light` (emphasis in dark mode) and `colors.dark` (buttons in both modes) accept **hex only**. Background colours are set through `background.color`.
- **Fonts:** Google Fonts or self-hosted fonts, through `fonts`.

## Page modes

| Mode | Sidebar | Table of contents / `<Panel>` | Use |
|---|---|---|---|
| default | yes | yes | normal pages; `<Panel>` replaces the table of contents |
| `wide` | yes | no | pages without headings that need width (hub) |
| `custom` | no | no | full-canvas landing pages; no default typography |
| `frame` | yes | no | custom content that keeps the sidebar |

`<Panel>` is suppressed in the `wide`, `center` and `custom` modes.

## Customisation

- **CSS:** every `.css` file in the content directory is loaded on every page.
- **Custom JavaScript:** every `.js` file is loaded on every page, after the page becomes interactive, in no guaranteed order. It cannot be limited to one page.
- **Tailwind:** Tailwind v3 classes work in MDX, and class names must be written out in full.
- **Hooks:** IDs, classes and `data-component-part` attributes are documented, but Mintlify warns they may change.
- **Native cascade layers:** Mintlify's CSS uses `properties, theme, base, components, utilities`. A layer declared later in an included stylesheet, such as line's `line` layer, comes after them and wins conflicts (checked in the spike).
- **React snippets:** hooks are pre-injected. No JSON imports, no `React.lazy` and no dynamic `import()`.
  - Snippets imported by name **render in the browser only**, so they flash on load and are not in the server-rendered HTML.
  - Plain HTML in MDX renders on the server.
- **npm packages:** turned on by `packages` in `docs.json`, with a `package.json` and an **npm or pnpm lockfile**. Bun and Yarn lockfiles are not supported.
  - No install scripts.
  - Limits: 1,000 files, 8 MB per file, 40 MB in total, 5 MB gzipped.
  - Each component must render on the server within 3 seconds.
  - `packages.css` lists package stylesheets, but **these did not load in `mint dev`** (spike, 2026-11-12); production was not tested.
  - Package stylesheets cannot load remote fonts.
  - Search and the assistant index the MDX source, not what a component renders.
- **`.mintignore`** excludes paths from the site. These are always ignored: `.git`, `.github`, `.claude`, `.agents`, `.idea`, `node_modules`, `README.md`, `LICENSE.md`, `CHANGELOG.md`, `CONTRIBUTING.md`.

## GitHub App checks

On pull requests in `websublime/docs`, the Mintlify GitHub App reports `Mintlify Deployment` (a preview build), `Mintlify Validation - link-rot` and `Mintlify Validation - vale-spellcheck`. All three passed on PR #2 (2026-11-12).

## CLI (`mint` 4.3.19)

| Command | Purpose |
|---|---|
| `mint validate` | content and OpenAPI checks, then a strict build. Exits 0 with no errors, 1 with errors, 2 when the check itself could not run |
| `mint broken-links` | checks internal links; exits 1 when it finds broken links |
| `mint a11y` | accessibility checks |
| `mint dev` | local preview |
| `mint agent setup --agent <claude-code\|codex\|cursor>` | installs Mintlify skills and the admin MCP server |
