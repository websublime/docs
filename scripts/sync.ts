#!/usr/bin/env bun
// Sync status for the documented projects (D5, D7). Reads sync/registry.yaml.
//
//   bun scripts/sync.ts [--project <slug>] [--offline] [--json]
//       Per source: newer stable release (reported only, never applied), the
//       files changed in lastSynced..ref, and the pages they affect.
//   bun scripts/sync.ts --mark-synced <slug> [--at <sha>]
//       Set lastSynced to the locally resolved ref of every source of <slug>
//       (no fetch), or to <sha> for a single-source project. Run it in the same
//       pull request that updates the pages (knowledge/sync.md).
//   bun scripts/sync.ts --validate
//       Registry structure and page files only; no checkouts needed (CI).

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

type Channel = "stable" | "stable-else-prerelease" | "branch";
type Source = {
  name: string;
  channel: Channel;
  tagPattern: string | null;
  branch: string | null;
  ref: string;
  lastSynced: string;
  watch: Record<string, string[]>;
};
type Project = {
  slug: string;
  name: string;
  repo: string;
  checkout: string;
  status: "stable" | "rc" | "wip";
  accent: string;
  exclude: string[];
  sources: Source[];
};
type Registry = { projects: Project[] };

const root = join(dirname(new URL(import.meta.url).pathname), "..");
const registryPath = join(root, "sync/registry.yaml");
const registry = Bun.YAML.parse(readFileSync(registryPath, "utf8")) as Registry;

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
// Value of `--name <value>`; exits when the value is missing or is another flag.
const option = (name: string) => {
  const i = args.indexOf(name);
  if (i < 0) return undefined;
  const value = args[i + 1];
  if (!value || value.startsWith("--")) {
    console.error(`${name} needs a value`);
    process.exit(1);
  }
  return value;
};

function git(checkout: string, ...rest: string[]): string {
  const proc = Bun.spawnSync(["git", "-C", checkout, ...rest], { stdout: "pipe", stderr: "pipe" });
  if (proc.exitCode !== 0) throw new Error(`git ${rest.join(" ")} (in ${checkout}): ${proc.stderr.toString().trim()}`);
  return proc.stdout.toString().trim();
}

// Semver order, with a final release ranked above its prereleases.
function compareVersions(a: string, b: string): number {
  const [coreA, preA] = a.includes("-") ? [a.slice(0, a.indexOf("-")), a.slice(a.indexOf("-") + 1)] : [a, ""];
  const [coreB, preB] = b.includes("-") ? [b.slice(0, b.indexOf("-")), b.slice(b.indexOf("-") + 1)] : [b, ""];
  const partsA = coreA.split(".").map(Number);
  const partsB = coreB.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (partsA[i] !== partsB[i]) return partsA[i] - partsB[i];
  if (!preA || !preB) return preA ? -1 : preB ? 1 : 0;
  return preA.localeCompare(preB, "en", { numeric: true });
}

function latestRelease(checkout: string, source: Source): string | null {
  if (source.channel === "branch" || !source.tagPattern) return null;
  const pattern = new RegExp(source.tagPattern);
  const releases = git(checkout, "tag", "-l")
    .split("\n")
    .map((tag) => ({ tag, version: pattern.exec(tag)?.[1] }))
    .filter((r): r is { tag: string; version: string } => Boolean(r.version));
  const stable = releases.filter((r) => !r.version.includes("-"));
  const pool = source.channel === "stable" || stable.length ? stable : releases;
  pool.sort((x, y) => compareVersions(x.version, y.version));
  return pool.at(-1)?.tag ?? null;
}

if (flag("--validate")) {
  const problems: string[] = [];
  const slugs = new Set<string>();
  for (const p of registry.projects) {
    if (slugs.has(p.slug)) problems.push(`${p.slug}: duplicate slug`);
    slugs.add(p.slug);
    for (const key of ["name", "repo", "checkout", "status", "accent"] as const)
      if (!p[key]) problems.push(`${p.slug}: missing ${key}`);
    if (!["stable", "rc", "wip"].includes(p.status)) problems.push(`${p.slug}: status must be stable, rc or wip`);
    if (!Array.isArray(p.exclude)) problems.push(`${p.slug}: exclude must be a list`);
    if (!p.sources?.length) problems.push(`${p.slug}: no sources`);
    for (const s of p.sources ?? []) {
      const at = `${p.slug}/${s.name}`;
      if (!["stable", "stable-else-prerelease", "branch"].includes(s.channel)) problems.push(`${at}: bad channel`);
      if (s.channel === "branch" ? !s.branch : !s.tagPattern) problems.push(`${at}: channel ${s.channel} needs ${s.channel === "branch" ? "branch" : "tagPattern"}`);
      if (s.tagPattern && !new RegExp(s.tagPattern).exec(s.ref)?.[1]) problems.push(`${at}: tagPattern does not capture a version from ref ${s.ref}`);
      if (!/^[0-9a-f]{40}$/.test(s.lastSynced ?? "")) problems.push(`${at}: lastSynced must be a full commit sha`);
      const watch = s.watch ?? {};
      if (!Object.keys(watch).length) problems.push(`${at}: watch must map at least one page`);
      for (const [page, globs] of Object.entries(watch)) {
        if (!existsSync(join(root, `${page}.mdx`))) problems.push(`${at}: watched page ${page}.mdx does not exist`);
        if (!Array.isArray(globs) || !globs.length || globs.some((g) => typeof g !== "string" || !g))
          problems.push(`${at}: watch for ${page} must be a non-empty list of globs`);
      }
    }
  }
  if (problems.length) {
    console.error(problems.join("\n"));
    process.exit(1);
  }
  console.log(`sync registry: ${registry.projects.length} projects valid`);
  process.exit(0);
}

// --mark-synced never fetches: it records what the local checkout resolves the
// ref to, which is what the agent read. For a branch-tracked source, pass the
// exact sha that was read with --at <sha> (single-source projects only).
const markSlug = option("--mark-synced");
const markAt = option("--at");
const only = markSlug ?? option("--project");
const projects = registry.projects.filter((p) => !only || p.slug === only);
if (only && !projects.length) {
  console.error(`unknown project: ${only}`);
  process.exit(1);
}
if (markAt && (!markSlug || projects[0].sources.length !== 1)) {
  console.error("--at needs --mark-synced <slug> for a project with exactly one source");
  process.exit(1);
}

const report = [];
for (const project of projects) {
  const checkout = resolve(root, project.checkout);
  if (!existsSync(checkout)) throw new Error(`${project.slug}: checkout ${project.checkout} not found`);
  if (!flag("--offline") && !markSlug) git(checkout, "fetch", "--quiet", "--tags", "origin");
  const excluded = project.exclude.map((g) => new Bun.Glob(g));

  for (const source of project.sources) {
    const refSha = git(checkout, "rev-parse", `${markAt ?? source.ref}^{commit}`);
    if (markSlug) {
      source.lastSynced = refSha;
      continue;
    }
    const latest = latestRelease(checkout, source);
    const changed =
      refSha === source.lastSynced
        ? []
        : git(checkout, "diff", "--name-only", "--no-renames", source.lastSynced, refSha)
            .split("\n")
            .filter((f) => f && !excluded.some((g) => g.match(f)));
    const pages: Record<string, string[]> = {};
    const watched = new Set<string>();
    for (const [page, globs] of Object.entries(source.watch)) {
      const matchers = globs.map((g) => new Bun.Glob(g));
      const hits = changed.filter((f) => matchers.some((m) => m.match(f)));
      hits.forEach((f) => watched.add(f));
      if (hits.length) pages[page] = hits;
    }
    report.push({
      project: project.slug,
      source: source.name,
      ref: source.ref,
      refSha,
      lastSynced: source.lastSynced,
      upToDate: refSha === source.lastSynced,
      newerRelease: latest && latest !== source.ref ? latest : null,
      changedFiles: changed.length,
      pages,
      unmapped: changed.filter((f) => !watched.has(f)),
    });
  }
}

if (markSlug) {
  writeFileSync(registryPath, Bun.YAML.stringify(registry, null, 2) + "\n");
  console.log(`${markSlug}: lastSynced set to the resolved ref of every source`);
} else if (flag("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else {
  for (const r of report) {
    const state = r.upToDate ? "up to date" : `${r.changedFiles} changed file(s) since ${r.lastSynced.slice(0, 12)}`;
    console.log(`${r.project}/${r.source}  ${r.ref} (${r.refSha.slice(0, 12)})  ${state}`);
    if (r.newerRelease) console.log(`  newer release: ${r.newerRelease} (moving the ref needs an intent, D5)`);
    for (const [page, files] of Object.entries(r.pages)) console.log(`  page ${page}: ${files.join(", ")}`);
    if (r.unmapped.length) console.log(`  unmapped: ${r.unmapped.length} file(s), e.g. ${r.unmapped.slice(0, 5).join(", ")}`);
  }
}
