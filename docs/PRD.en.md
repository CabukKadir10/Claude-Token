# Product Requirements Document (PRD)

**Product:** Claude Token Dashboard
**Version:** 0.1.0 (rewrite)
**Owner:** Strateji Bilişim
**Last updated:** 2026-04-26
**Language:** English (Turkish source: [`PRD.md`](./PRD.md))

---

## 1. Vision

Give Claude Code users a fast, calm, easy-on-the-eyes analytics dashboard that visualizes token usage and cost from local session logs (`.jsonl`) **without ever sending data outside the browser**.

## 2. Problem

Claude Code writes a raw usage log per session at `~/.claude/projects/<project>/<session>.jsonl`. Today the user has no way to:

- See which project/session burned how many tokens.
- Understand cache read/write share of the bill.
- Compare cost across model tiers (Opus/Sonnet/Haiku).
- Track daily/weekly/monthly trend.

The Anthropic Console invoice page does not expose project/session breakdown, and existing third-party tools usually require uploading the files — unacceptable from a privacy standpoint.

## 3. Target users

| Persona | Need |
|---|---|
| **Solo developer** | See which project/session is burning money; track monthly budget. |
| **Team lead** | Analyze model-selection habits and the effectiveness of the team's caching strategy. |
| **Consultant / freelancer** | Produce per-session cost evidence for client billing. |

## 4. Success criteria

- **K1** — Parses an entire `~/.claude/projects` folder in **under 5 s** for up to 10k lines.
- **K2** — All computation in the browser; **zero network calls** beyond the CDN.
- **K3** — Lighthouse performance score ≥ 95 on desktop.
- **K4** — Turkish and English fully supported; adding a third language is one dictionary file.
- **K5** — Adding a new view costs < 1 day; UI built on a single component library (shadcn/ui).

## 5. Scope (MVP — v0.1)

### 5.1 Data input
- Folder drag-and-drop (`webkitdirectory`) — recursively scans for `.jsonl`.
- Pick individual `.jsonl` files (Shift+click for multiple).
- "Reload" — re-parses the last source.
- "Clear" — wipes in-memory data; pricing settings preserved.

### 5.2 Views
1. **Overview** — KPI cards (total, input, output, cache-r, cache-w, $ cost), token-distribution donut, top 5 projects, top 5 sessions, model-cost breakdown.
2. **Projects** — Stacked bar chart + sortable/searchable table (project row → expandable list of sessions).
3. **Sessions** — Flat sessions table; row-click opens a session detail modal (model breakdown, usage, cost, duration).
4. **Timeline** — Daily line chart (total / cost / split modes), top busiest days, hourly distribution (0–23).
5. **By date** — Daily/weekly/monthly grouping table with sorting.

### 5.3 Filters
- Date range: custom + quick pills (Today, 7d, 30d, This month, Last month, All).
- Text search inside tables (project / session id).
- Sortable column headers (asc/desc).

### 5.4 Pricing
- Anthropic official list as defaults; separate rows for Opus 4.x, Sonnet 4.x, Haiku 4.x and legacy versions.
- Each row editable; persisted in `localStorage`.
- Columns: input / output / cache read / 5m cache write / 1h cache write (USD per 1M tokens).
- "Default" row for unknown models.

### 5.5 Design
- **Default theme:** light — readable, whitespace-first.
- **Dark theme:** optional toggle, follows OS preference.
- **Typography:** Geist Sans (UI) + Geist Mono (numbers/paths).
- **Palette:** zinc neutrals + a single accent (warm amber — Claude brand hint); 4 token-type colors (input/output/cache-r/cache-w).
- Generous spacing, soft borders, 120–200ms transitions.
- Mobile/tablet collapse to single-column grid.

### 5.6 i18n
- TR (default) + EN.
- No URL prefix; user picks language via `localStorage`, `<html lang>` is updated.
- All strings in dictionary files (`tr.json`, `en.json`); no hardcoded text in components.

### 5.7 Privacy
- No file/log ever leaves the browser. No telemetry.
- `localStorage` only stores: theme, language, pricing overrides.
- README and app footer make this guarantee explicit.

## 6. Out of scope (not in v0.1)

- Direct Anthropic API integration (sign-in, invoice fetch).
- Multi-user / account sync.
- Server-side persistence, database.
- PDF/CSV export (target v0.2).
- Budget alerts / email notifications.

## 7. Technical requirements

| Area | Decision |
|---|---|
| Framework | Next.js 15+ (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 + shadcn/ui |
| i18n | `next-intl` |
| Charts | Small in-house SVG components (donut, bar, line, hist) — no chart library |
| Tests | Vitest (domain + use-case unit tests); Playwright (critical user flows) |
| Browsers | Last 2 of Chromium, Firefox, Safari |
| Deploy | Vercel by default; static export for GitHub Pages alternative |
| License | MIT |

## 8. Architectural principles

See: [`ARCHITECTURE.md`](./ARCHITECTURE.md)

- **Layered (clean architecture):** `domain → application → infrastructure → presentation`.
- **Inward-only dependencies.** UI depends on domain; domain depends on nothing.
- **Pure domain:** parsing/aggregation/cost is framework-agnostic and unit-testable.
- **i18n-first:** no raw strings; every label resolved through a key.

## 9. Roadmap

| Version | Goal |
|---|---|
| v0.1 | MVP (scope above) |
| v0.2 | CSV/JSON export, simple budget gauge |
| v0.3 | Side-by-side comparison (project A vs B), tagging |
| v0.4 | Optional PWA mode (offline) |
| v1.0 | Stable API contract, full docs, first public release |

## 10. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Very large `.jsonl` sets (>100MB) | Browser memory pressure | Stream parsing, batch with `requestIdleCallback` |
| Anthropic price changes | Wrong cost numbers | User-editable pricing table + release-note warnings |
| New model naming schemes | Wrong tier mapping | Pure `modelTier()` in domain + dedicated unit tests |
| Browser API differences (`webkitdirectory`) | Firefox quirks | Fallback: multi-file picker + reading drag-drop `entries` |

## 11. Acceptance criteria (MVP)

- [ ] Dropping `~/.claude/projects` populates all 5 views.
- [ ] Editing pricing re-renders all KPIs and charts in a single pass.
- [ ] Switching language updates every label without page reload.
- [ ] Date filter applies coherently across all views.
- [ ] Light/dark theme transitions remain readable (contrast).
- [ ] On mobile, sidebar collapses to a top banner; tables scroll horizontally.
- [ ] Static-exported `dist/` runs by double-clicking `index.html`.
