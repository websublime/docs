#!/usr/bin/env bun
// Fails when published content carries internal material (D3): internal ids,
// internal-doc paths, agent files or Portuguese text.
//
//   bun scripts/leak-lint.ts
//
// A finding that is intended (for example a product that writes its own
// AGENTS.md) is allowed by a marker on THE SAME LINE, with a reason (D23):
//   {/* leak-lint: allow <reason> */}

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

const root = join(dirname(new URL(import.meta.url).pathname), "..");

type Rule = { id: string; pattern: RegExp; why: string };
const rules: Rule[] = [
  { id: "internal-id", pattern: /\b(?:FR|NFR|AC|MF|FORK)-\d+/, why: "internal requirement id" },
  { id: "decision-id", pattern: /\bD\d{1,3}\b/, why: "internal decision id" },
  { id: "section-ref", pattern: /§\s*\d|\bspine\b/i, why: "reference into an internal design document" },
  {
    id: "internal-path",
    pattern: /docs\/(?:plans|specs|spikes|context|research|retrospective)\b|(?:^|[\s`'"(/])spikes\/|\bhistory\/|\.knowledge\/|plano-de-migracao|\bPRD\b|\bPROCESS\.md\b|\bSTYLE\.md\b|docs\/0\d-/,
    why: "path or name of internal project documentation",
  },
  { id: "agent-file", pattern: /\bCLAUDE\.md\b|\bAGENTS\.md\b|\.claude\/|\.agents\/|\.beads\//, why: "agent instruction file or folder" },
  { id: "temp-dir", pattern: /(?:^|[\s`'"(/])temp\//, why: "scratch directory" },
  // Accented letters are not word characters for \b, so use Unicode-aware lookarounds.
  {
    id: "portuguese",
    pattern: /ção|ções|ões(?![\p{L}\d])|(?<![\p{L}\d])(?:não|também|está|então|você)(?![\p{L}\d])/iu,
    why: "Portuguese text (the site is English, D4)",
  },
];

const marker = /\{\/\*\s*leak-lint:\s*allow\b(.*?)\*\/\}/;

// Published files: every .mdx outside the paths excluded by .mintignore, plus docs.json.
// .mintignore follows gitignore rules: a pattern with no inner slash matches at any
// depth; a trailing slash matches directories only. Negations are not supported.
const ignored = existsSync(join(root, ".mintignore"))
  ? readFileSync(join(root, ".mintignore"), "utf8")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"))
      .map((line) => {
        if (line.startsWith("!")) {
          console.error(`leak-lint: .mintignore negation "${line}" is not supported; list what is ignored instead`);
          process.exit(1);
        }
        const dirOnly = line.endsWith("/");
        const core = line.replace(/^\/|\/$/g, "");
        return { glob: new Bun.Glob(core), dirOnly, anchored: line.startsWith("/") || core.includes("/") };
      })
  : [];
const files = [...new Bun.Glob("**/*.mdx").scanSync({ cwd: root, dot: false })]
  .filter((rel) => {
    const parts = rel.split("/");
    if (parts.some((part) => part.startsWith(".")) || parts[0] === "node_modules") return false;
    return !ignored.some(({ glob, dirOnly, anchored }) => {
      // Candidate paths: every directory prefix, plus the file itself unless dirOnly.
      const prefixes = parts.slice(0, dirOnly ? -1 : undefined).map((_, i) => parts.slice(0, i + 1).join("/"));
      return anchored ? prefixes.some((p) => glob.match(p)) : prefixes.some((p) => glob.match(p.split("/").pop()!));
    });
  })
  .sort();
files.push("docs.json");

let findings = 0;
for (const rel of files) {
  const lines = readFileSync(join(root, rel), "utf8").split("\n");
  lines.forEach((line, i) => {
    const allow = marker.exec(line);
    if (allow) {
      if (!allow[1].trim()) {
        console.error(`${rel}:${i + 1}  marker  leak-lint allow marker without a reason`);
        findings++;
      }
      return;
    }
    for (const rule of rules) {
      const m = rule.pattern.exec(line);
      if (m) {
        console.error(`${rel}:${i + 1}  ${rule.id}  ${rule.why}: "${m[0]}"`);
        findings++;
      }
    }
  });
}

if (findings) {
  console.error(`\nleak-lint: ${findings} finding(s) in ${files.length} published files.`);
  console.error("Remove the internal material, or, when it is intended, add {/* leak-lint: allow <reason> */} on that line.");
  process.exit(1);
}
console.log(`leak-lint: ${files.length} published files clean`);
