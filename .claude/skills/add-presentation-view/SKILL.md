---
name: add-presentation-view
description: Add a new top-level view (page-level component) to the dashboard. Use when introducing a new sidebar entry like "Sessions", "Timeline", "Pricing" — wires the view file, hook(s), i18n strings, and sidebar nav.
---

# Add a presentation view

A view is a page-level composition under `src/presentation/views/<name>-view.tsx`. Existing example: `overview-view.tsx`.

## Steps

1. **Plan the data flow** — what use-case from `application/` does this view consume?
   - Aggregations → `useAggregation` (hook) → `aggregateEvents` (use-case)
   - Events → `useEvents` (hook) → `parseJsonlFiles` (use-case)
   - Pricing → `usePricing`
   If you need a new shape, add a use-case first (see `add-use-case` skill) and a hook in `src/presentation/hooks/use-<name>.ts`.

2. **Add i18n keys** under `views.<viewName>.title` and `views.<viewName>.subtitle` (and any feature-specific keys) in BOTH `tr.json` and `en.json`. Use the `add-i18n-string` skill.

3. **Create the view file** at `src/presentation/views/<name>-view.tsx`:
   - Mark `'use client'` if it uses hooks or interactivity.
   - Compose existing `presentation/components/` widgets — don't reinvent KPI cards, charts, tables.
   - Use `useTranslations('views.<name>')` for headings and `useTranslations('<feature>')` for widget-specific strings.
   - Layout: `<AppShell>` is already the outer chrome from `src/app/layout.tsx` — the view itself is just the content.

4. **Add the route**:
   - Either mount under an existing page in `src/app/` (if it's a tab/section)
   - Or create `src/app/<slug>/page.tsx` that imports and renders the view.

5. **Add the sidebar entry** in `src/presentation/components/layout/sidebar.tsx`. The label comes from `nav.<key>` — add the i18n key in step 2.

6. **Style direction** — keep it lighter than `dashboard.html`:
   - More whitespace, generous gaps (`gap-6`, `space-y-6`).
   - Cards over backgrounds; subtle borders.
   - Lucide icons for nav and actions.

7. **Verify** in the browser via the `verify-changes` skill. Confirm:
   - Page renders in both TR and EN (use the language switcher)
   - Sidebar navigation reaches the view
   - No hydration warnings in the browser console

## Anti-patterns

- Doing parsing or aggregation inside the view component. Push it to a hook + use-case.
- Hardcoded TR/EN text.
- Inline `aggregateEvents(events, pricing)` in JSX — wrap it with `useAggregation` and `useMemo`.
- Re-creating widgets that already exist under `presentation/components/data/`.
