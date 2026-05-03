---
name: port-from-dashboard-html
description: Port a specific feature from the legacy dashboard.html (vanilla JS reference) into the layered Next.js codebase. Use when the user names a feature to bring over ("port the timeline", "bring sessions view across").
---

# Port a feature from dashboard.html

`dashboard.html` (~2900 lines) is the behavior reference. It mixes parsing, aggregation, formatting, and DOM rendering. Your job: re-express the same behavior across `domain → application → infrastructure → presentation`.

## Steps

1. **Locate the feature in `dashboard.html`** — Grep for section comments, function names, DOM ids, or render-function names. Read only the relevant slice with Read offset/limit; do NOT load the whole file.

2. **Extract data flow** — write down (in your head or a note):
   - Input data shape (what events/buckets it consumes)
   - Transformation steps
   - Output rendering structure

3. **Check what already exists.** Read:
   - `src/domain/entities/` and `src/domain/services/` — entities and pure services may already cover what you need
   - `src/application/use-cases/` — `aggregate-events`, `filter-by-date`, etc. already aggregate everything in one pass
   - `src/shared/utils/` — `format-cost`, `format-date`, `format-number`, `short-sid` are ready

4. **Map to layers** (create only what's missing):
   - Pure transform → `domain/services/<name>.ts` + `<name>.test.ts`
   - Multi-entity orchestration → `application/use-cases/<name>.ts` + `<name>.test.ts`
   - External I/O → port in `application/ports/` + adapter in `infrastructure/`
   - Stateful selection/derivation → hook in `presentation/hooks/use-<name>.ts`
   - Visual atom → `presentation/components/<area>/<name>.tsx`
   - Page → `presentation/views/<name>-view.tsx`, then mount under `src/app/`

5. **Write i18n keys first** — `tr.json` and `en.json`. Don't hardcode strings (use the `add-i18n-string` skill).

6. **Implement bottom-up:** domain → application → infrastructure → presentation. Add Vitest tests at every layer except presentation (use the `add-vitest-test` skill).

7. **Verify** with the `verify-changes` skill (lint + tsc + vitest + dev server).

## Anti-patterns to avoid

- Fat React components doing parsing + math + rendering. Push parsing/math down to use-cases.
- Importing from `infrastructure/` inside `domain/` or `application/`. Use ports.
- Duplicating `aggregate-events` logic — extend or call it.
- Hardcoded TR/EN strings.
- Reading `dashboard.html` from end to end. Always Grep first, Read narrowly.

## Plan-first option

If the feature is large or unclear, invoke the `dashboard-feature-porter` agent first to produce a written plan, confirm with the user, then implement.
