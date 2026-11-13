# Decisions log

This file records every decision that shapes the websublime documentation hub. Each decision has a D-id and the reason behind it.
Agents and humans read it before they change anything in this repository.

## Rules for this log

- **New decision.** A new decision gets the next D-id. Add it in the same pull request as the change it allows.
- **Amendment.** A refinement of an existing decision is an amendment on that decision's own entry. Date it, and do not give it a new D-id.
- **Superseding.** A new decision that replaces an older one gets a new D-id and cross-references in both entries: "Supersedes Dnn" and "Superseded by Dnn". Never overwrite an entry without a trace.
- **Status values.** `accepted` (in force), `superseded`, `proposed` (needs Miguel's confirmation before anyone acts on it).
- **Source.** Every entry says where the decision was taken: a conversation, an issue or a pull request.

---

## D1: One Mintlify project hosts every project

- **Status:** accepted (2026-11-12, conversation, issue #1)
- **Decision:**
  - The websublime open-source projects share one Mintlify project, granted through the Mintlify OSS Program (Pro plan).
  - All published content lives in this repository (`websublime/docs`).
  - The site does not use Mintlify multi-repo projects (Enterprise only) or `mintlify/multirepo-action`.
- **Why:** The OSS grant covers one project. Miguel chose to stay inside what the grant offers.
- **Consequences:**
  - Project repositories never hold the site's pages.
  - This repository reproduces their content (D2).
  - Adding a project means adding it here (D17).

## D2: Content is produced by reading each project's sources

- **Status:** accepted (2026-11-12, conversation)
- **Decision:** Pages are written from each project's documentation, READMEs and code, at the ref chosen by D5. Content comes in three kinds:
  - **Generated:** a deterministic script reads a structured artifact and writes the page. Examples: the clap-generated CLI reference, MCP contract snapshots, `custom-elements.json`, `.d.ts` files, stage frontmatter, `CHANGELOG.md` files.
  - **Adapted:** an agent rewrites prose such as overviews, quickstarts, concepts and guides, under the rules in D3.
  - **Linked:** content that is better served elsewhere, such as Storybook, docs.rs and GitHub Releases.
- **Code is the source of truth.** When a README contradicts the code, the page describes what the code does. The contradiction goes into the project's report (D6).
- **Why:** The inventory in `knowledge/projects/` found README-versus-code contradictions in every project. A plain copy of the prose would publish them.

## D3: Internal material is never published

- **Status:** accepted (2026-11-12, conversation)
- **Decision:** The following are never copied, quoted or linked on the site:
  - PRDs, plans, specs, spikes, context files and research notes.
  - Agent files (`CLAUDE.md`, `AGENTS.md`, `.claude/`, `.agents/`, `.knowledge/`, `.beads/`).
  - `temp/`.
  - Portuguese design documents.
  - Internal identifiers such as `FR-20`, `D35`, `NFR-12` and `spine §5`, and links into `docs/plans`, `history/` and similar folders.
- Each project's entry in `sync/registry.yaml` lists its exclusions. The inventories in `knowledge/projects/*.md` (section 3) classify every file as PUBLIC-READY, INTERNAL or MIXED.
- A lint step that fails CI when this material shows up is part of the sync tooling.
- **Why:**
  - Several repositories keep internal design work next to public docs (`trunks/docs/0X-*.md`, `unblock/docs/PRD.md`, `line-ui/docs/context/`).
  - `unblock/temp/` holds a secrets file, which is gitignored but still present on disk.

## D4: The site is in English

- **Status:** accepted (2026-11-12, conversation)
- **Decision:** Every published page is in English. Portuguese sources are translated, never published as they are. This knowledge base is also in English.
- **Why:** The projects' READMEs and public guides are in English.

## D5: Which version is documented

- **Status:** accepted (2026-11-12, conversation)
- **Decision:** Each project is documented at its **latest stable release**, with these exceptions:

  | Project | Ref documented | Why |
  |---|---|---|
  | trunks | latest release-candidate tag (`v0.1.0-rc.2` at decision time) | only release candidates exist |
  | focus | `main` | no release or tag exists |
  | line-ui | the versions published on npm | many more components exist, but their release is blocked. Update the docs when they are released |
  | unblock | latest release tag (`v1.0.2` at decision time) | `main` holds unreleased v1.1 features |
  | vite-open-api-server | latest stable release (`0.23.1`, branch `main`) | the `next` branch (v1 multi-spec) is prerelease |
  | delta, workspace-tools | latest release | — |

- The live ref of each project is stored in `sync/registry.yaml`. The values above are a snapshot from the day of the decision.
- **Amendment (2026-11-12, issue #3):** the refs were checked against the registries and releases before the Overview pages were written. They were:
  - vite-open-api-server: `@websublime/vite-plugin-open-api-server@0.23.3` (npm `latest`), not 0.23.1. The 0.23.1 figure came from the `next` branch's changelog.
  - workspace-tools: `sublime_cli_tools-v0.0.37` (crates.io and the latest GitHub release), not 0.0.36.
  - delta: `@websublime/delta@0.2.0`.
  - trunks: `v0.1.0-rc.2`.
  - unblock: `v1.0.2`.
  - focus: `origin/main`.
- **Why:** Readers install releases. Documenting unreleased behaviour sends them after features they cannot use.

## D6: Source inconsistencies are recorded, not fixed

- **Status:** accepted (2026-11-12, conversation)
- **Decision:**
  - Every contradiction found while reading a project (README versus code, stale versions, wrong names) is recorded in `sync/reports/<slug>.md`.
  - The docs repository does not change project repositories and does not open issues on them.
- **Why:** This repository's job is to document. Fixing the projects is Miguel's decision, project by project.
- The first set of inconsistencies is in `knowledge/projects/*.md` (section 7).

## D7: The sync runs locally, driven by a manifest

- **Status:** accepted (2026-11-12, conversation)
- **Decision:**
  - An agent command in this repository runs the sync against local checkouts under `../<project>`. A CI runner and Mintlify Autopilot were considered and not chosen as the primary path.
  - `sync/registry.yaml` holds, for each project:
    - repository, local path and ref (D5);
    - `lastSynced` commit;
    - status badge (D8) and accent (D10);
    - exclusions (D3);
    - the page-to-source map and the generators.
  - **Flow:**
    1. Run `git diff lastSynced..ref` on the watched paths.
    2. Map the changed files to the pages they affect.
    3. Regenerate the generated pages and adapt the affected prose.
    4. Validate.
    5. Open a pull request, following D15.
    6. Update `lastSynced`.
- **Why:**
  - Every repository is already checked out next to this one, including WIP branches.
  - Autopilot costs 250 credits per pull request it opens on its own (10,000 credits a month on Pro).
  - Autopilot cannot follow the exclusions or the page map.

## D8: Status badges

- **Status:** accepted (2026-11-12, conversation)
- **Decision:**

  | Project | Badge |
  |---|---|
  | trunks | RC |
  | unblock, line-ui, focus | WIP |
  | delta, vite-open-api-server, workspace-tools | none (stable) |

- The badge appears in the page frontmatter `tag`, the project hero, the hub card and the product description. Mintlify products have no `tag` field, so the badge cannot go on the product itself.
- unblock is WIP by Miguel's call, although its README says GA 1.0.0.

## D9: Visual foundation is the line://ui design system with the websublime brand

- **Status:** superseded by D25 for brand colour, chrome colours and fonts (2026-11-12). The use of the line://ui packages stands.
- **Decision:**
  - The site uses `@websublime/line-tokens`, `@websublime/line-colors` and `@websublime/line-themes`.
  - The websublime brand (logos in `../websublime-site/design/Logo/`, ink `#242320`) maps onto the line `sand` scale. `sand-12` is `#21201c`, practically the same as the brand ink.
  - **Site chrome colours** (`docs.json` accepts hex only):

    | Setting | Value | Source |
    |---|---|---|
    | `colors.primary` | `#21201c` | sand-12, light |
    | `colors.light` | `#eeeeec` | sand-12, dark |
    | background, light | `#fdfdfc` | sand-1 |
    | background, dark | `#111110` | sand-1 |

  - `colors.dark` (used for buttons in both modes) is chosen while building the site, after checking it in both modes.
  - **Fonts:** the line tokens `--line-font-sans` and `--line-font-mono`, which are system font stacks.
- **Why:** Miguel asked to use the design system line://ui offers. The brand fits it without a custom palette.

## D10: Accent colour of each project

- **Status:** accepted (2026-11-12, conversation). Amended by D25: the hues stand, but lines, borders and buttons use step 10 and text uses step 11.
- **Decision:** Each project section uses one line hue as its accent, through `data-accent`. The green, amber, red and blue hues are kept for the success, warning, danger and info roles and are never used as a project accent.

  | Project | Hue | Step 9 | Auto-paired gray | Reason |
  |---|---|---|---|---|
  | hub (websublime) | sand (superseded by D25: the hub uses the line://ui brand lime) | `#21201c` (sand-12) | sand | brand ink |
  | trunks | teal | `#12a594` | sage | matches its favicon gradient |
  | line-ui | lime | `#bdee63` | olive | closest to its brand `#c8ff00`, which is off the scale |
  | unblock | orange | `#f76b15` | sand | its palette is orange (`#b95f14`, off the scale); amber is reserved for warnings |
  | delta | indigo | `#3e63dd` | slate | neutral and technical; avoids the red and green of diffs |
  | vite-open-api-server | purple | `#8e4ec6` | mauve | Vite's purple |
  | workspace-tools | cyan | `#00a2c7` | slate | its CLI already uses cyan (`crates/cli/src/cli/branding.rs`) |
  | focus | crimson | `#e93d82` | mauve | no brand of its own |

- Cyan (workspace-tools) and teal (trunks) sit close together. Plum (`#ab4aba`) is the agreed fallback for workspace-tools if the two read as the same colour.

## D11: How line://ui is wired into Mintlify

- **Status:** accepted (2026-11-12, spike with `mint dev` 4.3.19; see `knowledge/research/line-ui-design-system.md`)
- **Decision:**
  1. **CSS is copied into the repository** from the pinned published versions, as `styles/line-{tokens,colors,themes}.css`. The spike showed `packages.css` not loading in `mint dev`, while any `.css` file in the content directory loads.
  2. **Colour scheme:** a site stylesheet sets `html { color-scheme: light }` and `html.dark { color-scheme: dark }`. line colours use `light-dark()`, which follows `color-scheme`.
  3. **Accent scope:** every custom component declares `data-accent` (and `data-gray` when needed). Without it, line falls back to indigo (`html:not([data-accent])`).
  4. **Class names:** never use class names that start with `line-` on markup that is not a line component. The line reset targets those classes, and the `line` cascade layer comes after Mintlify's layers, so it wins any conflict.
  5. **Chrome colours** in `docs.json` are generated from `line-colors` by a script, so they cannot drift from the scale.
  6. **Server rendering:** static parts (hero, cards) are plain HTML in MDX with `data-accent`, so they reach the server-rendered HTML. JSX snippets are for interactive parts only, because they render in the browser.
  7. **line components:** published components (today `button`, `separator`, `stack`) may be used through Mintlify `packages` (`package.json` plus an npm or pnpm lockfile; Bun lockfiles are not supported). They render in the browser only.
- **Why:** Verified behaviour of Mintlify and line://ui together (see the research note).

## D12: Navigation and layout

- **Status:** accepted (2026-11-12, conversation). Amended by D25: the Hub and the project overviews are full-width custom pages, and the overviews no longer use `<Panel>`.
- **Decision:**
  - **Navigation:** `navigation.products` has one product for the hub and one per project. Inside a project, groups follow the project's page tree (`knowledge/projects/<slug>.md`, section 5).
  - **Hub** (`index`, `mode: wide`) contains:
    - a websublime hero;
    - project cards with accent, status badge, stack and version;
    - a featured project;
    - "Guidelines & Resources".
  - **Project overview** (default mode) contains:
    - a hero with badge, stats and buttons for GitHub and installing;
    - the right rail through `<Panel>`, holding "Install" and "Contribute" (`<Steps>`, `<Tip>`). `<Panel>` only shows in the default mode.
  - **All other pages** use the standard documentation layout.
- **Why:**
  - The reference is the portal layout Miguel shared: sidebar, hero with stats, cards and a right "contribute" rail.
  - The portal style helps when browsing projects but gets in the way of reading reference pages.

## D13: line-ui keeps its own Storybook and site

- **Status:** accepted (2026-11-12, conversation)
- **Decision:**
  - The line-ui section links to Storybook (`https://line-ui-storybook.websublime.com`) and to the site (`https://line-ui.websublime.com`). It does not replace them.
  - Live component demos stay in Storybook.

## D14: Domain

- **Status:** accepted (2026-11-12, conversation)
- **Decision:** The site is served at `docs.websublime.com`.

## D15: Delivery process

- **Status:** accepted (2026-11-12, conversation, issue #1)
- **Decision:** Every change follows **intent → decide → implement (PR) → test/review → release (merge)**, as described in `knowledge/process.md`.
  - CI gates every step. When CI fails, work stops until it is fixed. Nobody moves past a red check by skipping, disabling or weakening it.
  - Agents never merge. Release (merge) needs Miguel's explicit approval.
- **Why:** Miguel asked for a fixed process that always follows CI and never moves on after a failure.

## D16: The knowledge base lives in `knowledge/`

- **Status:** accepted (2026-11-12, conversation, issue #1)
- **Decision:**
  - `knowledge/` holds this log, the process, research notes and project inventories. `.mintignore` keeps it off the published site.
  - Every pull request that makes or changes a decision updates this log in the same pull request.
- **Why:** Later iterations, by any agent or human, must not lose context that so far existed only in conversations.

## D17: Adding a new project

- **Status:** accepted (2026-11-12, conversation)
- **Decision:** A new project goes through the same steps as the first seven:
  1. An inventory, following the template in `knowledge/projects/README.md`.
  2. A `sync/registry.yaml` entry (ref per D5, badge per D8, accent per D10, exclusions per D3).
  3. Its pages.
  4. A hub card.
  5. A `navigation.products` entry.

  Each step goes through D15.
- **Why:** Miguel asked that every new project be added and kept up to date.

## D18: Mintlify App checks count only when Mintlify deployed the commit

- **Status:** accepted (2026-11-12, conversation, PR #2). Amends the gate in D15.
- **Decision:**
  - When `Mintlify Deployment` ran for the head commit, all of the Mintlify GitHub App's validation checks (`link-rot`, `vale-spellcheck`) must be green.
  - When `Mintlify Deployment` is **skipped**, the app's validation checks do not gate the pull request. The gate is the `CI` workflow (`mint validate`, `mint broken-links`). Deployment is skipped when a commit touches only paths excluded by `.mintignore`, such as `knowledge/`.
  - A failed or cancelled deployment is never skipped. It blocks the pull request.
- **Why:**
  - On PR #2, the commit `80b2c97` changed published pages, and the deployment and every check passed.
  - The commit `a3daeef` changed only `knowledge/`. Its deployment was skipped, and `link-rot` and `vale-spellcheck` failed with "An unknown error occurred". The Mintlify dashboard shows no preview for that commit.
  - Only the app can re-run its checks: GitHub's rerequest API returns 404 for us, and Redeploy in the Mintlify dashboard rebuilds the preview, not the checks.
  - Without this rule, every pull request that only changes the knowledge base would stay blocked.
- **Follow-up:** reported to Mintlify through `mint feedback` on 2026-11-12. Drop this exception if Mintlify fixes the behaviour.
- **Amendment (2026-11-12, PR #2):** commit `4398aca` also touched only `.mintignore` paths and its deployment was skipped, but `link-rot` and `vale-spellcheck` both passed. The failure is therefore intermittent, not caused by every ignored-only commit. The rule stays as it is; only this rationale is corrected.

## D19: An internal error in a Mintlify App check does not block when the equivalent CI check passes

- **Status:** accepted (2026-11-12, conversation, PR #2). Amends the gate in D15, alongside D18.
- **Decision:** A Mintlify GitHub App check does not block a pull request when all of these hold:
  1. Its conclusion is `failure` with the summary "An unknown error occurred".
  2. Its own output shows no finding.
  3. The equivalent check in our `CI` workflow passed on the same commit. `link-rot` maps to `mint broken-links`; `vale-spellcheck` has no CI equivalent, so this rule never covers it.
- Every time this rule is used, record in the pull request:
  - the check-run id;
  - the line of its output that shows no finding;
  - the `mint feedback` report sent to Mintlify.
- A Mintlify check that reports actual findings always blocks.
- **Why:**
  - On commit `8dacf0b`, `link-rot` (check run 131275741168) failed with "An unknown error occurred", while its output said "Checked for broken links and found none in 276.91ms".
  - `mint broken-links` passed in CI and locally.
  - Only the Mintlify app can re-run its checks: Redeploy in the dashboard rebuilt the preview but did not re-run the check.
- **Follow-up:** reported through `mint feedback` on 2026-11-12. Drop this exception if Mintlify fixes the behaviour.

## D20: Site foundation choices

- **Status:** accepted (2026-11-12, issue #3)
- **Decision:**
  1. **Overview pages.** Every project gets a minimal Overview page now, at `<slug>/overview`, written from its sources at the D5 ref. The page covers identity, install, a quick example when verified, status for RC and WIP projects, and links. This means every `navigation.products` entry exists from the start. Fuller pages arrive with each project's sync intent.
  2. **Featured project:** the hub features **trunks**.
  3. **Logo** (superseded by D25.5, which uses the "websublime ://docs" wordmark): the `websublime` wordmark (`logo/websublime-black.svg` and `logo/websublime-white.svg`, from `websublime-site/design/Logo/`). The favicon is the `ws` mark (`logo/ws-black.svg` and `logo/ws-white.svg`). The white variants originally had a dark `#242320` background plate and border rectangle (Sketch `Fill-1` and `Stroke-2`). Both were removed from the copies, so the mark sits on the site's own dark background.
  4. **Stats:** heroes and cards show static data for now: version, license and stack. Stars and downloads come with the sync tooling.
  5. **Generated assets** (amended by D25: the colours now come from the brand lime and `neutral-1`): `scripts/line-ui.mjs` copies the pinned stylesheets (`scripts/line-ui.versions.json`) into `styles/line-*.css` and writes `docs.json` `colors`/`background` from the sand scale:
     - `primary` = sand-12 light;
     - `light` = sand-12 dark;
     - `dark` = sand-11 light, which is visible as a button colour in both modes;
     - backgrounds = sand-1.

     CI runs `--check`. This settles the `colors.dark` choice that D9 left open.
  6. **Custom markup** (amended by D25: the full-width pages no longer use `not-prose` wrappers, and the content sits in a `prose` column): classes use the `ws-` prefix and live in `styles/site.css`. Wrappers carry `not-prose`, so Mintlify typography leaves them alone. Status badges use the warning role for WIP and the info role for RC (D8).
  7. **Product order:** the Hub first, then the projects in alphabetical order.
- **Why:** Miguel's choices on issue #3.

## D21: Vale configuration lives in the repository

- **Status:** accepted (2026-11-12, PR #4)
- **Decision:**
  - `.vale.ini` copies Mintlify's default Vale config with two changes:
    - `StylesPath = .vale`, because `styles/` holds the site CSS;
    - two vocabularies, `Mintlify` (Mintlify's default word list, copied) and `websublime`, in `.vale/config/vocabularies/<name>/accept.txt`.
  - Correct technical terms flagged by `vale-spellcheck` go into the `websublime` vocabulary, one regex per line. Never reword correct content just to quiet the linter.
  - Real misspellings get fixed in the page.
- **Amendment (2026-11-12, issue #9):** the `{…}` **block** ignore now matches a single line (`(?m)^(\{[^\n]*\})$`). Mintlify's `(?sm)^({.+.*})` matched from any line that starts with `{`, such as a JSON code block, to the end of the file. That broke code-fence detection and sent code to the speller (for example `session_mode` inside a JSON sample). The token ignores are unchanged.
- **Amendment (2026-11-12, PR #10):** a local `vale` run is not a full stand-in for Mintlify's check. Mintlify's dictionary flagged words that local Vale 3.26 accepts, such as distroless, loopback and userinfo. When `vale-spellcheck` reports correct terms, add them to the `websublime` vocabulary in the same pull request. The vocabulary file is kept sorted.
- **Why:** On PR #4, `vale-spellcheck` reported 37 findings. All of them were correct technical terms: changesets, monorepos, Hono, Vitest, glibc, musl, Streamable and similar. Mintlify's built-in vocabulary cannot be extended without a repository config.

## D22: Images and design previews

- **Status:** accepted (2026-11-12, issue #6)
- **Decision:**
  - **Location and format.** Images for a project live in `images/<slug>/`, as WebP 1600 px wide (quality 88). Source archives dropped into `knowledge/` (for example `*.zip`) are git-ignored, and only the converted images are committed. Only images a page actually uses are committed.
  - **Light and dark.** When a design comes in both versions, the page shows the one that matches the site theme (`block dark:hidden` and `hidden dark:block`).
  - **Designs versus the documented version.** A design that shows a version other than the documented one (D5) is published only with a `<Note>` saying it is a design and that the documented release may look different.
  - **Design-system sheets are not published.** Component specs, patterns and tokens are internal design material (D3).
  - **Accessibility.** Every image has alt text describing what the screen shows, and a caption.
- **First use:** the Trunks web-console designs (version 0.4.0 in the mockups) on `trunks/overview`. They are the Overview screen (after the hero; since D25, after the Overview paragraph), plus Servers, Register, Tools, Tool groups, MCP clients and Diagnostics in a "Web console" section. The New components, Patterns and Tokens sheets were left out.

## D23: Sync tooling

- **Status:** accepted (2026-11-12, issue #5). Amends D7, which named the registry but did not define its schema, its runtime or what happens when a newer release appears.
- **Decision:**
  1. **Registry:** `sync/registry.yaml`, read by Bun (`Bun.YAML`) scripts, so the repository needs no npm dependencies. CI installs Bun 1.4.3.
     - Each project has `slug`, `name`, `repo`, `checkout`, `status` (D8), `accent` (D10), `exclude` (D3) and `sources`.
     - A source has:
       - `name`;
       - `channel` (`stable`, `stable-else-prerelease`, `branch`);
       - `tagPattern`, with one capture group for the version;
       - `branch`;
       - `ref` (D5);
       - `lastSynced`, a full commit sha;
       - `watch`, mapping each page to the globs it depends on.
     - Projects with independently released packages (line-ui) have one source per package.
  2. **`scripts/sync.ts`:** reports, per source:
     - any newer release;
     - the files changed in `lastSynced..ref`, minus exclusions;
     - the pages those files affect;
     - the unmapped files.

     `--mark-synced <slug>` moves `lastSynced` to the resolved ref, in the same pull request as the page updates. It never fetches, and `--at <sha>` records the exact commit read on a single-source project (needed for branch-tracked projects). The diff uses `--no-renames`, so a moved file also reports its old path. `--validate` checks the structure in CI, including that every source watches at least one page.
  3. **Newer releases are reported, never applied.** Moving `ref` needs an intent and Miguel's confirmation (D5).
  4. **The procedure** lives in `knowledge/sync.md`, which any agent can follow. `.claude/commands/docs-sync.md` points to it.
  5. **`scripts/leak-lint.ts`** (CI) fails on internal ids, internal-doc paths, agent-file names and Portuguese text in published `.mdx` files and `docs.json`.
     - The rules cover the agent folders (`.agents/`, `.beads/`) and spikes. The Portuguese rule uses Unicode-aware boundaries. `.mintignore` is read with gitignore semantics, and negations fail the lint.
     - An intended exception carries `{/* leak-lint: allow <reason> */}` on the same line, and applies to that line only. It cannot be used inside fenced code (knowledge/sync.md).
     - A marker without a reason is a finding.
  6. **Reports:** `sync/reports/<slug>.md` lists the open contradictions at the ref, with file:line evidence, and the inventory items not reproduced at the ref.
     - The header sha is the **commit** the ref resolves to (`<ref>^{commit}`), not the tag object. Projects with several sources list each one.
     - Reports describe internal material without naming internal files.
     - `sync/` is excluded from the site.
- **Why:** Miguel's choices on issue #5.

## D24: Generated pages

- **Status:** accepted (2026-11-12, issue #9). Puts the "generated" content kind from D2 into practice.
- **Decision:**
  - A registry source may declare `generated:` entries, each with `page`, `generator`, `from`, `title`, optional `sidebarTitle`, and `description`. `scripts/gen.ts` builds the page from `from`, read at the source's `lastSynced` commit:
    - the local checkout when it exists;
    - otherwise the GitHub API, which is how CI reads it.
  - **Generators:**
    - `markdown`: an upstream Markdown document. Its H1 is dropped, HTML comments (maintainer notes) are dropped, and `{`, `}` and `<` are escaped for MDX outside code.
    - `keep-a-changelog`: a Keep a Changelog file becomes one `<Update>` per released version. `[Unreleased]` and the preamble are left out (D5).
  - A generated page starts with a comment naming the generator, the source and the commit. **Never edit it by hand.**
  - The `from` file must be in the page's `watch` list (`--validate`).
  - **CI** runs `bun scripts/gen.ts --check`.
  - **Sync order:** update the pages, then `--mark-synced`, then `bun scripts/gen.ts --project <slug>`.
- **First use:** `trunks/reference/cli` (from `docs/guide/reference/cli.md`, which Trunks generates from its binary) and `trunks/changelog`.
- **Amendment (2026-11-12, PR #10 review):** the MDX conversion follows CommonMark structure:
  - Fences open and close with the same character and length.
  - Inline code spans may wrap across lines.
  - Outside code: every `<` becomes `&lt;`, except autolinks, which become links. `{` and `}` are escaped. Existing backslash escapes are kept. HTML comments are dropped.
  - `keep-a-changelog` ignores headings inside code fences, reads linked headings, en-dash dates and `[YANKED]`, and removes only the version link definitions.
  - `--project` with an unknown slug fails. A full `--check` also fails on an orphan generated page, meaning one that has the generated header but no registry entry.
  - Tested by compiling edge cases with `@mdx-js/mdx`.

## D25: Redesign: dark-first, full-width, animated, on line://ui

- **Status:** accepted (2026-11-12, issue #11).
  - Supersedes D9 (brand and fonts).
  - Amends D10 (which step is used), D12 (layout) and D20.3 (logo).
- **Source:** `knowledge/research/websublime docs — redesign.html` (Hub and Trunks overview mockups), and Miguel's answers on issue #11.
- **Decision:**
  1. **Brand.**
     - The line://ui brand lime is the site accent: `#c8ff00` on dark, `#6d8a00` on light. These are the line-ui `branding/` inks.
     - In `docs.json`, `colors.primary` is `#5a7300`, `light` is `#c8ff00` and `dark` is `#5a7300`. Mintlify uses `primary` as a text colour in light mode, and `#6d8a00` reaches only 3.87:1 there. Miguel chose the AA-compliant darker ink on PR #12. `#6d8a00` stays for brand fills and lines in our own CSS. The page background is line `neutral-1` (`#fcfcfc` / `#111`). `scripts/line-ui.mjs` generates these values.
     - Site greys come from the line `neutral` scale (`data-gray="neutral"`).
  2. **Modes.** Dark is the default (`appearance.default: dark`). Light mode is also supported, through line `light-dark()` tokens. All custom CSS uses tokens, never fixed per-mode hex values. The exceptions are the brand inks, which are not palette steps, and the label colour on a step-10 fill.
  3. **Project colours.** The hue stays per D10. Lines, borders, buttons and dots use **step 10** (`--line-accent-10`, the alias `solid-hover`). On dark, step 10 is closest to the mockup.
     - **Coloured text** uses step 11 on dark and step 12 on light, which keeps it above 4.5:1 (WCAG AA).
     - **Labels on step-10 buttons** are black, except indigo and purple in light mode, which are white. Every combination is at least 4.8:1.
     - **Brand-lime text** in light mode uses the darker ink `#5a7300` (5.27:1 on neutral-1). `#6d8a00` is kept for fills and lines.
  4. **Fonts.**
     - Space Grotesk 700 for headings, via `docs.json` `fonts.heading`.
     - Inter for body text, via `fonts.body`.
     - JetBrains Mono for labels and code, via `@import` in `styles/site.css`, set as `--line-font-mono`.
  5. **Wordmark.** `logo/wordmark-{dark,light}.svg` reads "websublime ://docs", with every glyph outlined (no font dependency).
     - "web" is Space Grotesk 700 and "sublime" is Space Grotesk 500, both 22 px with -0.02em tracking.
     - "://docs" is JetBrains Mono 400 at 13 px, 8 px after "sublime", on the same baseline.
     - Ink is `#EEEEEE` / `#202020`, and lime is `#C8FF00` / `#6D8A00`.
     - The outlines were made with fontTools from the Google Fonts variable TTFs. The favicon is still the `ws` mark.
  6. **Hub** (`index`, `mode: custom`):
     - a full-width hero with seven animated lines, one per project hue;
     - the featured project (Trunks) with a terminal panel;
     - a bento grid with one animated SVG illustration per project;
     - a footer that also links "Contribute to these docs" and "Report a docs problem".
  7. **Project overviews** (`mode: custom`):
     - a full-width hero with five animated lines in the project's shades, a breadcrumb, the title and badge, the description as lede, stats, and Install/GitHub buttons;
     - a three-column body: the navigation snippet, the content (`prose`), and an "On this page" index;
     - Install, Contribute (the former `<Panel>` content) and Links as sections. Headings carry explicit ids, because custom mode does not generate them.
  8. **Project navigation** is generated from `docs.json` by `scripts/nav.ts` into `snippets/nav/<slug>.mdx`. CI runs `--check`, which also fails on orphan snippets.
  9. **All other pages** keep the standard Mintlify layout, themed by `docs.json` and `styles/site.css`.
  10. **Motion** is CSS only: `stroke-dashoffset` on SVG paths, plus hover transitions. It is switched off under `prefers-reduced-motion`.
- **Mintlify constraints found while building:**
  - `<nav>`, `<main>`, `<article>` and `<footer>` are dropped from MDX. Use `<div>` instead. Add `role="navigation"` to navigation blocks only: Mintlify already wraps the page in `<main>`, so a second `main` or a nested `contentinfo` landmark breaks the landmark structure (axe).
  - SVG `<circle>` is dropped. Use a two-arc `<path>`.
  - A `$` in MDX prose or JSX text starts KaTeX. Write `{"$"}`.
  - Custom mode keeps the navbar, search and product switcher, but drops the sidebar, the table of contents, `<Panel>`, the footer and the heading ids.
  - The `prose` class restores the standard typography inside a custom page.
- **Why:** Miguel asked for this redesign while keeping line://ui. The mockup's own hex colours and fonts were mapped onto line tokens wherever a token exists.
