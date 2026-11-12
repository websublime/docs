---
description: Sync the project pages with each project's documented ref
argument-hint: "[project slug]"
---

Follow `knowledge/sync.md` exactly, for project `$ARGUMENTS`, or for all projects when no slug is given.

Start with `bun scripts/sync.ts --project $ARGUMENTS`, or `bun scripts/sync.ts` when no slug is given, and report what it found before you change anything. The delivery process (`knowledge/process.md`) applies: intent, then decide, then implement (PR), then test/review, then release. CI must stay green, and you never merge.
