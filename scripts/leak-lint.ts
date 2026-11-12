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
    pattern: /docs\/(?:plans|specs|context|research|retrospective)\b|\bhistory\/|\.knowledge\/|plano-de-migracao|\bPRD\b|\bPROCESS\.md\b|\bSTYLE\.md\b|docs\/0\d-/,
    why: "path or name of internal project documentation",
  },
  { id: "agent-file", pattern: /\bCLAUDE\.md\b|\bAGENTS\.md\b|\.claude\//, why: "agent instruction file" },
  { id: "temp-dir", pattern: /(?:^|[\s`'"(/])temp\//, why: "scratch directory" },
  { id: "portuguese", pattern: /ção|ções|ões\b|\bnão\b|também|está\b|então|você/i, why: "Portuguese text (the site is English, D4)" },
];

const marker = /\{\/\*\s*leak-lint:\s*allow\b(.*?)\*\/\}/;

// Published files: every .mdx outside the paths excluded by .mintignore, plus docs.json.
const ignored = existsSync(join(root, ".mintignore"))
  ? readFileSync(join(root, ".mintignore"), "utf8")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"))
  : [];
const files = [...new Bun.Glob("**/*.mdx").scanSync({ cwd: root, dot: false })]
  .filter(
    (rel) =>
      !rel.split("/").some((part) => part.startsWith(".")) &&
      !rel.startsWith("node_modules/") &&
      !ignored.some((p) => (p.endsWith("/") ? rel.startsWith(p) : rel === p || new Bun.Glob(p).match(rel))),
  )
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
