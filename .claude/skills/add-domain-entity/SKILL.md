---
name: add-domain-entity
description: Add a new domain entity or value-object. Use when modeling a new concept (e.g. "weekly bucket", "model family", "rate-limited window") that doesn't fit into the existing entities.
---

# Add a domain entity or value-object

The domain layer is pure TypeScript. NO React, Next.js, browser APIs, file I/O, or infrastructure imports.

## Decide: entity or value-object?

- **Entity** (`src/domain/entities/`) — has identity (a UUID, a key, a position) and may aggregate other things. Examples: `UsageEvent`, `Project`, `Session`, `DailyBucket`.
- **Value-object** (`src/domain/value-objects/`) — defined entirely by its values, no identity, immutable. Examples: `Tokens`, `ModelTier`, `Pricing`, `DateRange`.

## Steps

1. **Read a sibling file first** to mirror the style:
   - For entities: `src/domain/entities/usage-event.ts`
   - For value-objects: `src/domain/value-objects/tokens.ts`

2. **Define the type as `readonly` interface** with JSDoc explaining: meaning, identity (or "no identity"), and any invariants.
   ```ts
   /**
    * One <thing>. Identity: <key> | "no identity (value-object)".
    * Invariants: <list>.
    */
   export interface FooBar {
     readonly id: string;
     readonly value: number;
   }
   ```

3. **For value-objects**, add helpers in the same file:
   - A constructor (`emptyTokens()`, `unboundedRange()`)
   - Pure operations (`accumulateTokens(a, b)`, `isInRange(date, range)`)
   All return new objects; never mutate.

4. **For entities** that aggregate other entities, add buckets/breakdowns as separate files (`daily-bucket.ts`, `hourly-bucket.ts`) — don't bloat one file.

5. **Add a domain service** under `src/domain/services/` only if there's pure logic over multiple entities/value-objects (e.g. `compute-cost.ts`, `resolve-model-tier.ts`). Service files are stateless functions, not classes.

6. **Add a sibling `<name>.test.ts`** with Vitest. Cover construction, invariants, and at least one edge case.

7. **DO NOT** reference `domain/entities/*` from value-objects (one-way: entities may use value-objects, not the reverse).

## Verify

```bash
npx vitest run src/domain/<entities|value-objects|services>/<name>.test.ts
```

Then run the `clean-architecture-reviewer` agent to confirm no leaky imports.
