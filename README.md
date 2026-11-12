# websublime docs

Source of [docs.websublime.com](https://docs.websublime.com), the documentation hub for websublime's open-source projects. The site is built with [Mintlify](https://mintlify.com).

## Layout

| Path | Contents |
|---|---|
| `docs.json` | Site configuration and navigation. The chrome colours are generated, see `scripts/line-ui.mjs` |
| `index.mdx` | The hub page |
| `<project>/` | The pages of each project |
| `styles/` | The line://ui stylesheets (`line-*.css`, generated) and the site styles (`site.css`) |
| `logo/` | websublime logos and favicons |
| `scripts/` | Repository tooling. Not published |
| `knowledge/` | Decisions, process, research and project inventories. Not published |
| `sync/` | Sync registry (`registry.yaml`) and per-project source reports. Not published |

## Working here

Read [`AGENTS.md`](AGENTS.md) and [`knowledge/process.md`](knowledge/process.md) first. Every change goes through intent → decide → implement (PR) → test/review → release (merge), and CI must be green at every step.

```bash
npx mint@4.3.19 dev            # local preview
npx mint@4.3.19 validate       # checks run in CI
npx mint@4.3.19 broken-links
node scripts/line-ui.mjs       # refresh the line://ui styles and chrome colours after a version bump
```
