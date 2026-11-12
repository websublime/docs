# Contributing

Thank you for helping improve the websublime docs.

1. **Open an intent.** Use the **Intent** issue template to describe what you want to change and why. A maintainer confirms the open choices before work starts.
2. **Open a pull request.** Branch from `main`, keep the change limited to the intent, and fill in the pull request checklist.
3. **Keep CI green.** `mint validate`, `mint broken-links` and the line://ui asset check must pass. Run them locally first:
   ```bash
   npx mint@4.3.19 validate
   npx mint@4.3.19 broken-links
   node scripts/line-ui.mjs --check
   ```
4. **Review and merge.** A maintainer reviews the change and merges it.

The full process and the decisions behind the site are in [`knowledge/`](knowledge/README.md). Pages describe each project's latest stable release, in English, from the project's own sources.
