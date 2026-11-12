# line://ui design system: analysis and Mintlify spike

Analysed on 2026-11-12 from `../line-ui/packages/{line-tokens,line-colors,line-themes,line-schemas}` and the npm registry. These notes support D9, D10 and D11.

## Published versions (npm, 2026-11-12)

| Package | Version | Notes |
|---|---|---|
| `@websublime/line-tokens` | 0.1.3 | the root barrel includes a reset scoped to `[class^=line-]` |
| `@websublime/line-colors` | 0.1.3 | 31 hues |
| `@websublime/line-themes` | 0.1.2 | exports `.`, `./accent/*`, `./gray/*`, `./semantics`, `./aliases`, `./defaults` |
| `@websublime/line-components` | 0.2.4 | exports only `button`, `separator`, `stack`. More components exist in the repository, but their release is blocked (D5) |
| `@websublime/line-core` | 0.2.2 | — |

## Structure

- **Colours** are Radix Colors: 31 hues, 12 steps each, plus alpha steps.
  - Each step is one `light-dark(light, dark)` value.
  - `display-p3` variants are provided.
  - The Radix `gray` hue is named `neutral`.
- **Roles:**
  - `accent` and `gray` can be swapped per scope through `data-accent` and `data-gray`.
  - `success`, `warning`, `danger` and `info` are fixed at the root, mapped to green, amber, red and blue.
- **Aliases**, for every role:

  | Alias | Step |
  |---|---|
  | `surface` | 2 |
  | `bg` | 3 |
  | `bg-hover` | 4 |
  | `bg-active` | 5 |
  | `border` | 7 |
  | `solid` | 9 |
  | `solid-hover` | 10 |
  | `text-low` | 11 |
  | `text` | 12 |

- **Contrast:** `--line-*-contrast` is the text colour to use on step 9. It is black for amber, cyan, lime, mint, sky and yellow, and white for every other hue.
- **Auto-pairing:** an accent without an explicit `data-gray` gets a matched gray:
  - **sand:** amber, bronze, brown, gold, orange, sand, yellow
  - **slate:** blue, cyan, indigo, iris, sky, slate, violet
  - **sage:** green, jade, mint, sage, teal
  - **olive:** grass, lime, olive
  - **mauve:** crimson, mauve, pink, plum, purple, red, ruby, tomato
  - **neutral:** neutral
- **Default accent:** `html:not([data-accent])` falls back to **indigo**.
- **Cascade:** every rule sits in `@layer line` with `:where()` selectors, so specificity is zero.
- **Fonts:** `--line-font-sans`, `--line-font-serif` and `--line-font-mono` are system font stacks.
- **Shadows:** they compute to `none` until `line-themes` (or `--line-shadow-color`) supplies a colour.
- **Weight of the root barrels:** about 212 KB uncompressed, about 33 KB gzipped (colours 123 KB, themes 73 KB, tokens 16 KB).

## Step-9 value of every hue (light and dark are identical unless both are shown)

| Hue | 9 | 11 (light / dark) | Contrast |
|---|---|---|---|
| amber | `#ffc53d` | `#ab6400` / `#ffca16` | black |
| blue | `#0090ff` | `#0d74ce` / `#70b8ff` | white |
| bronze | `#a18072` | `#7d5e54` / `#d4b3a5` | white |
| brown | `#ad7f58` | `#815e46` / `#dbb594` | white |
| crimson | `#e93d82` | `#cb1d63` / `#ff92ad` | white |
| cyan | `#00a2c7` | `#107d98` / `#4ccce6` | black |
| gold | `#978365` | `#71624b` / `#cbb99f` | white |
| grass | `#46a758` | `#2a7e3b` / `#71d083` | white |
| green | `#30a46c` | `#218358` / `#3dd68c` | white |
| indigo | `#3e63dd` | `#3a5bc7` / `#9eb1ff` | white |
| iris | `#5b5bd6` | `#5753c6` / `#b1a9ff` | white |
| jade | `#29a383` | `#208368` / `#1fd8a4` | white |
| lime | `#bdee63` | `#5c7c2f` / `#bde56c` | black |
| mauve | `#8e8c99` / `#6f6d78` | `#65636d` / `#b5b2bc` | white |
| mint | `#86ead4` | `#027864` / `#58d5ba` | black |
| neutral | `#8d8d8d` / `#6e6e6e` | `#646464` / `#b4b4b4` | white |
| olive | `#898e87` / `#687066` | `#60655f` / `#afb5ad` | white |
| orange | `#f76b15` | `#cc4e00` / `#ffa057` | white |
| pink | `#d6409f` | `#c2298a` / `#ff8dcc` | white |
| plum | `#ab4aba` | `#953ea3` / `#e796f3` | white |
| purple | `#8e4ec6` | `#8145b5` / `#d19dff` | white |
| red | `#e5484d` | `#ce2c31` / `#ff9592` | white |
| ruby | `#e54666` | `#ca244d` / `#ff949d` | white |
| sage | `#868e8b` / `#63706b` | `#5f6563` / `#adb5b2` | white |
| sand | `#8d8d86` / `#6f6d66` | `#63635e` / `#b5b3ad` | white |
| sky | `#7ce2fe` | `#00749e` / `#75c7f0` | black |
| slate | `#8b8d98` / `#696e77` | `#60646c` / `#b0b4ba` | white |
| teal | `#12a594` | `#008573` / `#0bd8b6` | white |
| tomato | `#e54d2e` | `#d13415` / `#ff977d` | white |
| violet | `#6e56cf` | `#6550b9` / `#baa7ff` | white |
| yellow | `#ffe629` | `#9e6c00` / `#f5e147` | black |

**Sand extremes** (websublime brand, D9):

| Step | Light | Dark |
|---|---|---|
| sand-1 | `#fdfdfc` | `#111110` |
| sand-12 | `#21201c` | `#eeeeec` |

The brand ink `#242320` is practically the same as sand-12.

## Mintlify spike (2026-11-12, `mint dev` 4.3.19, headless Chromium)

**Setup:**
- A throwaway project used the published packages above.
- The page held a JSX snippet with a `data-accent="teal"` scope and a `<line-button>`, plus a plain HTML `data-accent="lime"` block written in the MDX.

**Results:**

| Check | Result |
|---|---|
| `packages.css` with `@websublime/line-*/dist/index.css` | **not loaded**: `--line-teal-9` was empty |
| The same CSS copied into the content directory | loaded: `--line-*` defined |
| `data-accent="teal"` → `var(--line-accent-solid)` / `var(--line-accent-contrast)` | `rgb(18,165,148)` / white |
| `data-accent="lime"`, same properties | `rgb(189,238,99)` / black |
| Light and dark | correct, but only with `html { color-scheme: light } html.dark { color-scheme: dark }` |
| `<line-button>` imported in a snippet | defined, shadow DOM rendered, styled (gray role: `rgb(32,34,33)` in dark mode, `rgb(238,241,240)` in light mode, radius 5px) |
| Server-rendered HTML | the plain-HTML block was present; the JSX snippet and `<line-button>` were not (browser-only) |
| Cascade layer order | `properties, theme, base, components, utilities, line`. `line` wins conflicts |

## Assessment

**Strengths:**
- Mature colour scales that have been tested for accessibility.
- A clear role and alias vocabulary.
- Automatic contrast colour for text on solid fills.
- Auto-paired grays.
- Accent switching per scope, which suits the docs: each project section gets its own hue with no custom CSS.
- Zero-specificity rules that sit alongside Mintlify's CSS.

**Risks and constraints** (handled in D11):
- `light-dark()` depends on `color-scheme`.
- The indigo default applies whenever no `data-accent` is set.
- The `line-` class reset.
- Mintlify's chrome cannot read CSS variables.
- Pre-1.0 versions: pin them and update deliberately.
- Only 3 components are published.

**Brand gaps found in line://ui itself:**
- The brand colour `#c8ff00` is not on the lime scale (lime-9 is `#bdee63`).
- The SVG wordmarks use JetBrains Mono through a Google Fonts `@import`, and their text is not outlined, so they cannot be used as a Mintlify logo.
