---
name: add-use-case
description: Add a new application-layer use-case. Use when orchestration is needed across domain entities or when introducing a new operation that depends on a port. Creates the use-case file, its sibling Vitest, and (if needed) a port interface.
---

# Add an application use-case

Use-cases live under `src/application/use-cases/<verb-noun>.ts` and follow these conventions (see existing examples like `aggregate-events.ts`, `filter-by-date.ts`, `parse-jsonl-files.ts`).

## Steps

1. **Name the use-case in verb-noun form** (kebab-case file, camelCase export): `aggregate-events.ts → aggregateEvents`, `filter-by-date.ts → filterByDate`.

2. **Define the input/output as readonly types** at the top of the file:
   ```ts
   export interface FooBarInput {
     readonly events: ReadonlyArray<UsageEvent>;
     readonly range?: DateRange;
   }
   export interface FooBarOutput {
     readonly result: ...;
   }
   ```

3. **Import only from `domain/` and other `application/`** files. Never import `infrastructure/` or `presentation/`. If you need I/O, define or reuse a port in `application/ports/` and accept it as a parameter:
   ```ts
   export async function loadFoo(source: FileSource): Promise<...> { ... }
   ```

4. **Implement as a pure function** when possible (no module-level state). Reuse domain services — don't duplicate cost or tier logic; call `computeCostBreakdown`, `resolveModelTier`, etc.

5. **Add a sibling `<name>.test.ts`** with Vitest. Cover at minimum: happy path, empty input, one edge case (missing field, boundary date, etc.). See `aggregate-events.test.ts` for style.

6. **Wire the use-case into a presentation hook** under `src/presentation/hooks/use-<name>.ts` if a UI consumes it. Hooks should `useMemo` the result to avoid recomputation.

7. **Verify** with `npm run test` (or run just this file: `npx vitest run src/application/use-cases/<name>.test.ts`).

## Checklist before declaring done

- [ ] No `infrastructure/` or `presentation/` imports
- [ ] Inputs/outputs are `readonly` typed
- [ ] Reuses existing domain services (no duplicated math)
- [ ] Sibling `.test.ts` covers happy + edge case
- [ ] `npm run lint && npm run test` pass
