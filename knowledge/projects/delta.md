> **Snapshot.** Inventory written on 2026-11-12 by reading the local checkout (`../delta`), files only; nothing was built or run. The refs that are documented come from D5 and `sync/registry.yaml`. Section 7 is the first input to `sync/reports/delta.md` (D6).

# @websublime/delta: documentation inventory (repo `../delta`)

The package is a small, ESM-only TypeScript library at version 0.2.0. It has no CLI, MCP, HTTP or environment-variable surface. All the public material is in one 311-line English `README.md`, the TSDoc in `src/`, and `CHANGELOG.md`. Several parts of the README and the CHANGELOG are out of date compared with `src/` (see §7).

## 1. Identity

| Field | Value | Evidence |
|---|---|---|
| Purpose | "delta:// — Powerful, typed JSON model diffing for TypeScript". It diffs JSON values, then offers patch/unpatch, a sparse snapshot of changes and RFC 6902 export | `package.json` `description`; `README.md:1-23` |
| Audience | TypeScript/JS developers who need structural diffs: PATCH payloads, audit logs, form dirty tracking | `README.md:89` |
| Stack | TypeScript 5.9, ESM only (`"type":"module"`, exports have only `import`/`types`, no `require`), target ES2022 with NodeNext. Uses Biome, Vitest and fast-check. No runtime dependencies | `package.json`, `tsconfig.json` |
| Version | **0.2.0**. Git tags `@websublime/delta@0.1.1` and `@websublime/delta@0.2.0` | `package.json`; `.git/refs/tags/@websublime/` |
| License | MIT, © 2026 websublime | `LICENSE` |
| Package / registry | npm `@websublime/delta`, published with `--access public`. The tarball ships `dist`, `README.md` and `LICENSE` | `package.json` `files`; `.github/workflows/release.yml` |
| Subpath exports | `.` maps to `dist/index.js`; `./rfc6902` maps to `dist/rfc6902.js` | `package.json` `exports` |
| Engines | `node >=18.0.0`; developers pin Node `22.12.0` | `package.json`, `.node-version` |
| Remote | `git@github.com:websublime/delta.git`; homepage `https://github.com/websublime/delta#readme` | `.git/config`, `package.json` |
| Status | Pre-1.0. Releases run through `websublime/workspace-tools` changesets (`repo.config.toml`, `.changesets/history/*.json`): CI runs on PRs and non-main pushes, and a push to main runs `workspace bump` and then `npm publish`. That the package is live on npm is [INFERENCE]; I did not check the registry | `.github/workflows/{ci,release}.yml` |

## 2. Public surface

- **Install**: `npm install @websublime/delta` is the only documented method (`README.md:40-46`).
- **CLI**: none (0). There is no `bin` in `package.json`.
- **Config files/keys**: none for users (0). `repo.config.toml`, `biome.json`, `tsconfig.json` and `.changesets/` are maintainer tooling only.
- **Runtime options**: `DiffOptions` has **6 keys**. Canonical source is `src/types.ts:163-228`; normalisation is in `resolveOptions()` at `src/diff.ts:~60-98`.
  - `arrayIdentity`: `Identity | Record<string, Identity>`. Forms: string key, composite `string[]`, `IdentityFn(item, index)`, or a per-path map.
  - `equal`: `(a, b) => boolean`. Defaults to structural deep-equal.
  - `detectMoves`: default `true`.
  - `maxDepth`: default `Infinity`.
  - `ignore`: `string[]`. Takes exact paths, plus `/*` prefixes. A prefix also matches the bare path itself (`src/diff.ts:114-119`).
  - `cloneValues`: default `true`.
- **Library API**: canonical source is `src/index.ts`.
  - **Runtime exports (7)**:
    - `diff(before, after, options?) → DiffResult` (`src/diff.ts:164`)
    - `patch(before, result) → JsonValue` (`src/patch.ts:442`)
    - `unpatch(after, result) → JsonValue` (`src/patch.ts:503`)
    - `snapshot(result) → JsonValue | null` (`src/snapshot.ts:54`)
    - `toRFC6902(result) → RFC6902Patch` (`src/rfc6902.ts:73`)
    - `toRFC6902JSON(result, indent = 2) → string` (`src/rfc6902.ts:131`)
    - `class DeltaError { code; path }` (`src/errors.ts:9`)
  - **Type exports (23)**:
    - `DeltaErrorCode`
    - RFC 6902 types (6): `RFC6902Add`, `RFC6902Remove`, `RFC6902Replace`, `RFC6902Move`, `RFC6902Op`, `RFC6902Patch`
    - Model types (16): `DiffOp`, `DiffOptions`, `DiffResult`, `DiffSummary`, `Identity`, `IdentityFn`, `IdentityKey`, `JsonArray`, `JsonObject`, `JsonPrimitive`, `JsonValue`, `OpAdd`, `OpMove`, `OpRemove`, `OpReplace`
  - **`./rfc6902` subpath** (`src/rfc6902.ts`): `toRFC6902`, `toRFC6902JSON`, and all 8 RFC types. That includes `RFC6902Copy` and `RFC6902Test`, which the main entry does **not** re-export.
  - **Error codes (6)**, from `src/errors.ts:40-52`: `CIRCULAR_REFERENCE`, `INVALID_DIFF_RESULT`, `INVALID_OPERATION`, `PATH_NOT_FOUND`, `UNSUPPORTED_VALUE`, `ARRAY_TOO_LARGE`. The last is thrown at `src/lcs.ts:46` when `m*n > MAX_LCS_ENTRIES = 25_000_000` (`src/lcs.ts:15`).
  - **`OpMove.nestedDiff?: DiffResult`** gives a field-level diff for moved items, with item-relative paths. It is not affected by `ignore`. Defined in `src/types.ts:46-86` and emitted at `src/diff.ts:455`.
  - **Internal, not exported**: `src/utils.ts` (`deepEqual`, `joinPath`, `splitPath`, `safeSet`, `cloneDeep`) and `src/lcs.ts` (`computeLCS`, `lcsArrayDiff`).
- **MCP tools/resources/prompts**: none (0).
- **HTTP/OpenAPI**: none (0).
- **Env vars**: none at runtime. Only CI/release use them: `CI` and `GITHUB_ACTIONS` in `.githooks/pre-push`; secrets `GH_TOKEN`, `NPM_TOKEN` and `NODE_AUTH_TOKEN` in `release.yml`.

## 3. Existing doc material

| File | Class | Lang | Notes |
|---|---|---|---|
| `README.md` (311 lines) | **PUBLIC-READY** | EN | Sections: Intro 1-23, Features 25-38, Install 40, Usage 48-246 (basic diff 50, patch/unpatch 71, snapshot 87, identity arrays 131, options 178, RFC 6902 204, errors 226), Types 248, Semantics & edge cases 284-307, License 309 |
| `CHANGELOG.md` | **MIXED** | EN | Generated by workspace-tools. Usable as a changelog source but needs cleanup (§7) |
| `src/**/*.ts` TSDoc | **PUBLIC-READY** (reference source) | EN | Full JSDoc on public types and functions: `src/types.ts`, `src/diff.ts:122-163`, `src/patch.ts:433-503`, `src/snapshot.ts:15-53`, `src/rfc6902.ts:60-131`, `src/errors.ts` |
| `.changesets/README-example.yaml` | INTERNAL | EN | workspace-tools template using `@myorg/*` placeholders |
| `.changesets/history/*.json` (3) | INTERNAL | — | Release records |
| `repo.config.toml`, `.githooks/pre-push`, `.github/workflows/*.yml` | INTERNAL | EN | Maintainer and release process only |
| `tests/*.test.ts` (7) | INTERNAL, but useful as an example source | EN | Covers diff, patch, snapshot, rfc6902, rfc6902-conformance, properties and edge-cases. Good source of verified examples for the guides |

There are no PRDs, plans, specs or agent files in the repo, and no PT content.

## 4. Brand assets

None found: the repo has no svg, png, ico or jpg files. The only brand element is the text wordmark **"delta://"** (`README.md:3`, `src/index.ts:2`). No colours are defined anywhere.

## 5. Proposed Mintlify page tree (`delta/`)

- **Get started**
  - `overview`: `README.md:1-38` (intro and features)
  - `installation`: `README.md:40-46`, `package.json` (`engines`, `exports`, ESM-only)
  - `quickstart`: `README.md:5-23`, `README.md:50-85`
- **Concepts**
  - `operations-and-paths`: `src/types.ts:21-104` (op shapes, RFC 6901 paths), `README.md:300-301`
  - `array-diffing`: LCS vs identity, duplicate ids, moves, `nestedDiff`. Sources: `README.md:131-176`, `README.md:292-296`, `src/types.ts:46-86`, `src/lcs.ts`, `src/diff.ts:~400-460`
  - `semantics-and-safety`: determinism, equality, `undefined`, cycles, prototype safety. Sources: `README.md:284-305`, `src/utils.ts`
- **Guides**
  - `patch-and-unpatch`: `README.md:71-85`, `src/patch.ts:433-503`
  - `sparse-snapshots`: `README.md:87-129`, `src/snapshot.ts`, `tests/snapshot.test.ts` (array output becomes string-keyed objects)
  - `rfc6902-export`: `README.md:204-224`, `src/rfc6902.ts:60-72` (move is decomposed into remove + add; ordering), `tests/rfc6902-conformance.test.ts`
  - `error-handling`: `README.md:226-246`, `src/errors.ts`, `src/patch.ts:25-102`
  - `large-arrays-and-performance`: `README.md:298`, `src/lcs.ts:15,46`, `cloneValues` in `src/types.ts:208-224`
- **API reference**
  - `diff`, `patch`, `unpatch`, `snapshot`, `toRFC6902` / `toRFC6902JSON`, `DeltaError`: `src/index.ts` plus the defining files listed in §2
  - `diff-options`: `src/types.ts:150-228`
  - `types` (DiffResult, DiffSummary, ops, Json*, Identity*, RFC6902*): `src/types.ts`, `src/rfc6902.ts:9-57`
- **Changelog**
  - `changelog`: `CHANGELOG.md`

## 6. Drift watch-list

| Glob | Pages affected |
|---|---|
| `src/index.ts` | All of API reference; overview |
| `src/types.ts` | diff-options, types, operations-and-paths, array-diffing |
| `src/diff.ts` | `diff` reference, diff-options, array-diffing, semantics |
| `src/lcs.ts` | array-diffing, large-arrays-and-performance, error-handling |
| `src/patch.ts` | `patch`/`unpatch` reference, patch-and-unpatch, error-handling |
| `src/snapshot.ts` | `snapshot` reference, sparse-snapshots |
| `src/rfc6902.ts` | `toRFC6902` reference, rfc6902-export, types |
| `src/errors.ts` | `DeltaError` reference, error-handling |
| `src/utils.ts` | semantics-and-safety, operations-and-paths (escaping) |
| `README.md` | overview, quickstart, every guide |
| `package.json` (`version`, `exports`, `engines`, `description`) | installation, overview, changelog |
| `CHANGELOG.md`, `.changesets/history/*.json` | changelog |
| `tests/**/*.test.ts` | Guides, as the source of verified examples (low-priority trigger) |

## 7. Gaps and inconsistencies

1. **The README contradicts `nestedDiff`.** `README.md:294` says "There is no separate `replace` op emitted for the nested change — the move op is the full story… consumers see 'the whole moved item changed', not 'field X…'". But `OpMove.nestedDiff` exists (`src/types.ts:67-86`, `src/diff.ts:455`) and the CHANGELOG lists it in 0.2.0. Neither `README.md:248-262` (the Types section) nor `README.md:292-296` mentions it.
2. **`ARRAY_TOO_LARGE` is missing from the README.** The error-handling list at `README.md:240-242` names 5 codes; the source has 6 (`src/errors.ts:52`).
3. **The LCS size-budget text is stale.** `README.md:298` says arrays of 10 000 items need about 400 MB. In fact the guard throws above 25M comparisons, which is about 5000×5000 (`src/lcs.ts:15,46`; `tests/edge-cases.test.ts:234-237`). The README never mentions the hard limit.
4. **The CHANGELOG refers to a renamed API.** 0.2.0 lists "add changes() and changesFromDiff()" and "document changes()…", while the shipped API is `snapshot()` (renamed in commit f4d1821). Other problems in the CHANGELOG:
   - 0.2.0 repeats every 0.1.1 entry.
   - The `# Changelog` header from the template in `repo.config.toml` is missing.
   - Entries are only hashes; there are no commit links, even though `include_commit_links = true`.
5. **The local `dist/` is stale.** It is gitignored and not authoritative, but it still has `changes.js` / `changesFromDiff` / `ChangesResult` and no `snapshot`. Docs generators must read `src/`, never `dist/`.
6. **The README mentions only the subpath import for the RFC adapter.** `README.md:210` imports from `@websublime/delta/rfc6902`, but `toRFC6902` and `toRFC6902JSON` are also exported from the main entry (`src/index.ts:14`). It also does not say that `RFC6902Copy`/`RFC6902Test` are only on the subpath.
7. **Undocumented details:**
   - The `toRFC6902JSON` `indent` parameter.
   - The `index` argument passed to `IdentityFn`.
   - That `snapshot` represents arrays as string-keyed objects (`src/snapshot.ts:88-95`).
   - The ordering rule for RFC exports (removes descending, then adds ascending, then replaces).
   - That an `ignore` `/*` entry also matches the bare prefix path.
   - That `ignore` is not applied inside `nestedDiff`.
   - That the package is ESM-only (no CommonJS `require`).
8. **The README's `equal` example would not typecheck.** `equal: (a, b) => Math.abs(a - b) < 0.001` (`README.md:190`) does arithmetic on `JsonValue` operands under `strict`.
9. **No brand assets** and no docs folder exist; logo and colours must come from the central docs repo.