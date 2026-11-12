# delta://: source report

Places where this project's own documentation or help text disagrees with its code at the documented ref. Under D6 they are recorded here and not fixed in the project. Pages follow the code (D2).

- **Ref:** `@websublime/delta@0.2.0` (`4a696c037371`)
- **Checked:** 2026-11-12

## Open

| # | Where | The source says | The code at the ref | Page handling |
|---|---|---|---|---|
| 1 | `README.md:295` | A moved-and-changed item gets no field-level detail; "the move op is the full story". | `OpMove.nestedDiff` carries the field changes (`src/types.ts:86`, set at `src/diff.ts:455`). | `delta/overview` follows the code |
| 2 | `README.md:239-241` | `err.code` is one of 5 codes. | `DeltaErrorCode` has 6; `ARRAY_TOO_LARGE` is missing (`src/errors.ts:42-52`). | not on any page yet |
| 3 | `README.md:299` | LCS memory budget is `4 × N²` bytes, 400 MB at `N=10 000`; only advice is to use `arrayIdentity`. | LCS throws `ARRAY_TOO_LARGE` above 25M cells, about 5000×5000 (`src/lcs.ts:15,46`). | not on any page yet |
| 4 | `CHANGELOG.md:13,29` | 0.2.0 features and docs list `changes()` and `changesFromDiff()`. | Those were renamed; the shipped API is `snapshot()` (`src/index.ts`, `src/snapshot.ts`; rename noted at `CHANGELOG.md:67`). | `delta/overview` follows the code |
| 5 | `README.md:190` | `equal: (a, b) => Math.abs(a - b) < 0.001` as an options example. | `equal` takes `JsonValue` operands (`src/types.ts:185`); arithmetic on them fails under `strict` (`tsconfig.json:7`). | not on any page yet |

## Not reproduced at this ref

- Inventory 4 (other CHANGELOG issues: 0.1.1 entries repeated, missing `# Changelog` header, no commit links): formatting faults, not claims that contradict the code.
- Inventory 5 (stale local `dist/`): `dist/` is gitignored and not in the ref tree.
- Inventory 6 (README imports the RFC adapter only from the subpath): the subpath import at `README.md:210` is valid; omission only.
- Inventory 7 (undocumented details): missing documentation, no false claim.
- Inventory 9 (no brand assets or docs folder): not a contradiction.
- New: README tagline versus `package.json:4` description ("Powerful, typed…"): wording only, no factual conflict.
