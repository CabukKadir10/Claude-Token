# `presentation/`

**React + Next.js UI layer.** Thin glue between user actions and use cases.

## Subfolders

- `components/ui/` — shadcn primitives (button, card, dialog, table, …)
- `components/charts/` — `Donut`, `BarChart`, `LineChart`, `HourHistogram`. Each takes a *normalized* domain model as props — never raw events.
- `components/layout/` — App shell, sidebar, top bar, theme toggle, language switcher
- `components/views/` — `OverviewView`, `ProjectsView`, `SessionsView`, `TimelineView`, `ByDateView`
- `hooks/` — `useEvents`, `useAggregation`, `usePricing`, `useFilters`, `useLanguage`

## Rules

1. May import from any layer. Hooks call `application/` use cases; components do not parse or compute.
2. **No hardcoded user-facing text.** Every string resolves through `next-intl` (`useTranslations`).
3. No raw hex colors outside `app/globals.css` — use Tailwind tokens (`bg-card`, `text-accent`).
4. No business math in components — push it to `domain/` or `application/` and import.
5. UI flows tested end-to-end with Playwright (drop folder → see overview → switch view → switch language).
