---
name: verify-changes
description: Run the project's verification chain (lint + typecheck + tests + dev-server preview) after a change. Use before declaring any non-trivial task complete.
---

# Verify changes

Run these in order and stop at the first failure.

## 1. Lint + typecheck

```bash
npm run lint
```

This runs `next lint && tsc --noEmit`. Fix any errors before moving on. Do NOT use `--no-verify` or skip — a TS error means the build will fail.

## 2. Unit tests

```bash
npm run test
```

Vitest runs the full suite. If only one area changed, run targeted tests first for fast feedback:

```bash
npx vitest run src/<area>/
```

## 3. Browser preview (only for UI changes)

When the change is observable in the browser (a new view, a styled component, a hook the UI consumes), use the preview tools:

1. `mcp__Claude_Preview__preview_start` — start the dev server (`npm run dev`).
2. `mcp__Claude_Preview__preview_console_logs` — check for runtime/hydration errors.
3. `mcp__Claude_Preview__preview_snapshot` — confirm content rendered.
4. `mcp__Claude_Preview__preview_screenshot` — share visual proof with the user.
5. Test interactions with `preview_click` / `preview_fill`, then snapshot again.
6. Resize with `preview_resize` to check responsive behavior if layout changed.

Skip the browser preview for changes that are not browser-observable (domain logic, parser internals, test-only code, types).

## 4. i18n drift (only when UI strings changed)

Invoke the `i18n-auditor` agent to confirm `tr.json` and `en.json` stayed in sync and no hardcoded strings slipped in.

## 5. Layer sanity (only when changes crossed folder boundaries)

Invoke the `clean-architecture-reviewer` agent.

## Reporting

After everything passes, summarize in 1–2 sentences: what changed, what verifications ran, and any leftovers (e.g. "skipped browser preview because the change was domain-only"). Be honest about skipped steps — don't claim success for verifications you didn't run.
