# Architecture

> Türkçe özet en altta — *Türkçe için "Mimari özeti" bölümüne bakın.*

## Goals

1. **Pure, testable business logic.** Parsing JSONL, mapping models to pricing tiers, aggregating events, computing cost — none of this should know about React, Next.js, or the DOM.
2. **Replaceable infrastructure.** Today the input source is `webkitdirectory` + `File.text()`. Tomorrow it could be a CLI piping JSONL into a WASM build, or a Node script reading `~/.claude/projects` directly. The domain shouldn't care.
3. **A UI that is mostly glue.** React components should compose primitives and wire user actions to use cases. They should not contain math or parsing.

## Layers

```
┌──────────────────────────────────────────────────────────────────┐
│  presentation/    React components, hooks, pages, design tokens  │
│         │                                                         │
│         ▼  (calls)                                                │
│  application/    Use cases (parseFiles, aggregate, filterByDate) │
│         │                                                         │
│         ▼  (uses)                                                 │
│  domain/         Entities, value objects, pure services          │
│         ▲                                                         │
│         │  (implements ports defined in domain/application)      │
│  infrastructure/ JSONL reader, localStorage adapter, file API    │
└──────────────────────────────────────────────────────────────────┘
```

**Dependency rule:** arrows only point inward. `domain/` imports nothing from the other layers. `application/` imports from `domain/` only. `infrastructure/` and `presentation/` may import from `domain/` and `application/`.

### `domain/`

Pure functions and types. No imports from React, Next, Tailwind, or any browser API.

- `entities/` — `UsageEvent`, `Project`, `Session`, `DailyBucket`.
- `value-objects/` — `Tokens`, `Cost`, `ModelTier`, `DateRange`.
- `services/` — `modelTier(modelName)`, `computeCost(tokens, tier, pricing)`, `totalTokens(t)`.

### `application/`

Use cases — single-purpose async functions that orchestrate domain logic. They receive ports (interfaces) so infrastructure can be swapped.

- `parse-jsonl-files.ts` — input: `File[]`, output: `UsageEvent[]`.
- `aggregate-events.ts` — input: `UsageEvent[] + Pricing + DateRange`, output: `Aggregation { projects, sessions, daily, hourly, byModel, totals }`.
- `filter-by-date.ts` — pure date-range filter.
- `load-pricing.ts` / `save-pricing.ts` — depend on a `KeyValueStore` port.

Ports (interfaces) live next to the use case that defines them.

### `infrastructure/`

Adapters that fulfill the ports.

- `parsing/jsonl-line-parser.ts` — pure line→`UsageEvent` (also reused by domain tests).
- `parsing/file-reader.ts` — wraps `File.text()` and `webkitRelativePath`.
- `storage/local-storage.ts` — `KeyValueStore` impl on top of `window.localStorage`.
- `i18n/dictionary-loader.ts` — loads `tr.json` / `en.json` for `next-intl`.

### `presentation/`

Next.js App Router pages plus React building blocks.

- `app/` — route entries (`layout.tsx`, `page.tsx`, etc.).
- `components/ui/` — shadcn primitives (button, card, dialog, table…).
- `components/charts/` — `Donut`, `BarChart`, `LineChart`, `HourHistogram`. Each takes a normalized `domain` model — never raw events.
- `components/views/` — top-level view shells: `OverviewView`, `ProjectsView`, etc.
- `hooks/` — `useEvents()`, `useAggregation()`, `usePricing()`, `useFilters()`. Hooks own React state and call into use cases; they never parse files themselves.

## Folder layout

```
src/
├── app/                          # Next.js App Router (presentation entry)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── providers.tsx             # i18n + theme + state providers
├── domain/
│   ├── entities/
│   ├── value-objects/
│   └── services/
├── application/
│   └── use-cases/
├── infrastructure/
│   ├── parsing/
│   ├── storage/
│   └── i18n/
├── presentation/
│   ├── components/
│   │   ├── ui/                   # shadcn
│   │   ├── charts/
│   │   ├── layout/
│   │   └── views/
│   └── hooks/
└── shared/
    ├── types/
    ├── utils/                    # formatters: bytes, numbers, dates
    └── constants/
```

## Data flow (parse → render)

1. User drops a folder. `presentation/components/Dropzone.tsx` collects `FileList`.
2. The component calls `useEvents().ingest(files)`.
3. The hook delegates to `application/use-cases/parse-jsonl-files.ts`.
4. The use case streams files through `infrastructure/parsing/jsonl-line-parser.ts` and returns `UsageEvent[]`.
5. The hook stores events in React state.
6. `useAggregation(events, pricing, filters)` calls `application/use-cases/aggregate-events.ts` (memoized).
7. View components subscribe and render.

## Testing strategy

| Layer | Tool | Notes |
|---|---|---|
| `domain/` | Vitest | Pure functions, table-driven tests. 100% covered. |
| `application/` | Vitest | Mock ports; verify orchestration only. |
| `infrastructure/` | Vitest + jsdom | Storage adapter, parser fixtures. |
| `presentation/` | Playwright | Critical journey: drop folder → see overview → switch view → switch language → edit pricing. |

## Naming conventions

- Files: `kebab-case.ts`. Test files: `*.test.ts` colocated.
- Types: `PascalCase`. Functions: `camelCase`. React components: `PascalCase`.
- One default export per React component file. Plain `.ts` files use named exports.
- No barrel `index.ts` re-exports across layers — keeps dependency direction explicit and grep-friendly.

## i18n contract

- `presentation/` only ever reads strings via `useTranslations()` (next-intl).
- `domain/` and `application/` never speak human language — they emit data; UI labels it.
- Dictionary keys are dot-namespaced: `overview.cards.totalTokens`, `nav.projects`.
- New strings: add to BOTH `tr.json` and `en.json` in the same change; CI fails on missing keys.

## Theming contract

- Tailwind theme tokens live in `globals.css` as CSS variables (`--color-bg`, `--color-fg`, `--color-accent`, etc.).
- Both light and dark modes are defined as variable overrides under `:root` and `.dark`.
- Components consume tokens via Tailwind classes (`bg-background`, `text-foreground`); no raw hex codes outside `globals.css`.

---

## Mimari özeti (Türkçe)

- **4 katman:** `domain → application → infrastructure → presentation`. Bağımlılıklar yalnızca içe doğru.
- **`domain/`** saf TypeScript: parsing/aggregation/cost hesabı; React veya tarayıcı API'si bilmez.
- **`application/`** use case'ler: tek amaçlı fonksiyonlar; portlar (arayüzler) üzerinden infrastructure'a yaslanır.
- **`infrastructure/`** portları gerçekleştirir: localStorage, dosya okuma, sözlük yükleme.
- **`presentation/`** Next.js + React + Tailwind + shadcn: hook'lar use case'leri çağırır; bileşenler sadece veriyi gösterir.
- **i18n-first:** her metin sözlükten gelir; bileşende sabit metin yasak.
- **Test:** domain ve application Vitest ile %100; UI için Playwright kritik akışlar.
