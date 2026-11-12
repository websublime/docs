# Knowledge base

This is the memory of the websublime documentation hub. It holds the decisions, the process and the research behind them. `.mintignore` keeps it off the published site (D16). Read it before you change this repository, and update it in the same pull request as any change it describes.

| File | Contents |
|---|---|
| [decisions.md](decisions.md) | Decisions log (D-ids): what was decided, why, and its status |
| [process.md](process.md) | Delivery process: intent → decide → implement (PR) → test/review → release (merge), with CI as the gate |
| [research/mintlify-platform.md](research/mintlify-platform.md) | Checked facts about the Mintlify plan, navigation, page modes, customisation, packages and CLI |
| [research/line-ui-design-system.md](research/line-ui-design-system.md) | Analysis of the line://ui design system, the hue table, and the Mintlify spike results |
| [projects/](projects/README.md) | One inventory per documented project, plus the template for adding a project |

## Not built yet

These pieces are described by the decisions but do not exist yet. Each one arrives through its own intent (D15):

- `sync/registry.yaml`, `sync/reports/` and the local sync command (D7, D6);
- the leak lint for internal material (D3);
- the `docs.json` restructure, the hub, project pages and styles (D9 to D12);
- removal of the Mintlify starter template content.
