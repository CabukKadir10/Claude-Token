# `application/`

**Use cases — single-purpose async functions that orchestrate domain logic.**

Each use case takes inputs, calls into `domain/` for any computation, and
returns a result. Infrastructure dependencies (storage, file reading) come in
through **ports** (interfaces) so adapters are swappable.

## Subfolders

- `use-cases/` — one file per use case
  - `parse-jsonl-files.ts` — `File[] → UsageEvent[]`
  - `aggregate-events.ts` — `UsageEvent[] + Pricing + DateRange → Aggregation`
  - `filter-by-date.ts` — date-range filter
  - `load-pricing.ts` / `save-pricing.ts` — depend on `KeyValueStore` port

## Rules

1. May import from `domain/`. **Must not** import from `infrastructure/` or `presentation/`.
2. Define ports as TypeScript interfaces colocated with the use case that needs them.
3. No React, no `window`. Receive everything you need as arguments.
4. Use cases are unit-tested with Vitest using fake adapters.
