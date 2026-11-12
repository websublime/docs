#!/usr/bin/env node
// Copies the pinned line://ui stylesheets into styles/ and derives the
// docs.json chrome colours from the line `sand` scale (D9, D11).
//
//   node scripts/line-ui.mjs          write styles/line-*.css and docs.json colours
//   node scripts/line-ui.mjs --check  exit 1 if either is out of date (CI)

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const versions = JSON.parse(readFileSync(join(root, "scripts/line-ui.versions.json"), "utf8"));

const work = mkdtempSync(join(tmpdir(), "line-ui-"));
const expected = new Map(); // repo-relative path -> content
let colorsCss = "";

try {
  for (const [pkg, version] of Object.entries(versions)) {
    const tarball = execFileSync(
      "npm",
      ["pack", `${pkg}@${version}`, "--pack-destination", work, "--silent"],
      { encoding: "utf8" },
    ).trim().split("\n").pop();
    const dest = join(work, pkg.replace("@websublime/", ""));
    mkdirSync(dest, { recursive: true });
    execFileSync("tar", ["-xzf", join(work, tarball), "-C", dest]);
    const css = readFileSync(join(dest, "package/dist/index.css"), "utf8");
    const name = pkg.replace("@websublime/", "");
    const header = `/* ${pkg}@${version}: copied by scripts/line-ui.mjs. Do not edit (D11). */\n`;
    expected.set(`styles/${name}.css`, header + css);
    if (name === "line-colors") colorsCss = css;
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

// Base sRGB steps are declared as `--line-sand-N:light-dark(#light,#dark)`.
function step(n) {
  const m = colorsCss.match(new RegExp(`--line-sand-${n}:\\s*light-dark\\((#[0-9a-fA-F]{6}),\\s*(#[0-9a-fA-F]{6})\\)`));
  if (!m) throw new Error(`sand-${n} not found in line-colors`);
  return { light: m[1].toLowerCase(), dark: m[2].toLowerCase() };
}
const sand1 = step(1);
const sand11 = step(11);
const sand12 = step(12);

// docs.json: only `colors` and `background.color` are generated (D11.5, D20.5).
// Compare parsed values, and on write replace just those two objects, so the
// rest of the file keeps its hand-written formatting.
const docsPath = join(root, "docs.json");
let docsText = readFileSync(docsPath, "utf8");
const docs = JSON.parse(docsText);
const generated = {
  colors: { primary: sand12.light, light: sand12.dark, dark: sand11.light },
  background: { ...(docs.background ?? {}), color: { light: sand1.light, dark: sand1.dark } },
};

// Replace the value of a top-level `"key": { ... }` object, keeping its indentation.
function replaceObject(text, key, value) {
  const match = new RegExp(`^([ \\t]*)"${key}"\\s*:\\s*\\{`, "m").exec(text);
  if (!match) throw new Error(`docs.json has no top-level "${key}" object; add one, then rerun`);
  const open = match.index + match[0].length - 1;
  let depth = 0;
  let end = open;
  for (let i = open; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}" && --depth === 0) { end = i; break; }
  }
  const indent = match[1];
  const body = JSON.stringify(value, null, 2).replace(/\n/g, `\n${indent}`);
  return text.slice(0, open) + body + text.slice(end + 1);
}

const stale = [];
for (const [rel, content] of expected) {
  const path = join(root, rel);
  const current = existsSync(path) ? readFileSync(path, "utf8") : null;
  if (current === content) continue;
  if (check) stale.push(rel);
  else writeFileSync(path, content);
}

const docsStale = Object.entries(generated).some(([key, value]) => JSON.stringify(docs[key]) !== JSON.stringify(value));
if (docsStale) {
  if (check) stale.push("docs.json (colors/background)");
  else {
    for (const [key, value] of Object.entries(generated)) docsText = replaceObject(docsText, key, value);
    writeFileSync(docsPath, docsText);
  }
}

if (check && stale.length) {
  console.error(`line-ui assets are out of date: ${stale.join(", ")}\nRun: node scripts/line-ui.mjs`);
  process.exit(1);
}
console.log(check ? "line-ui assets are up to date" : "line-ui assets written");
