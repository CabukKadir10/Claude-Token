---
name: add-vitest-test
description: Add a Vitest test for domain, application, infrastructure, or shared code. Use whenever you add or change non-presentation logic — every new pure function or use-case gets a sibling .test.ts.
---

# Add a Vitest test

The project uses Vitest (`vitest.config.ts` at the root). Tests live as siblings: `foo.ts` → `foo.test.ts`.

## Steps

1. **Pick the right home for the test** — always next to the code it tests:
   - `src/domain/**/*.test.ts`
   - `src/application/**/*.test.ts`
   - `src/infrastructure/**/*.test.ts`
   - `src/shared/utils/*.test.ts`
   - Presentation (React) — usually skip; rely on dev-server verification instead.

2. **Read a sibling test** for style. Good references:
   - Pure function: `src/shared/utils/format-cost.test.ts`
   - Use-case: `src/application/use-cases/aggregate-events.test.ts`
   - Parser: `src/application/services/parse-jsonl-line.test.ts`

3. **Structure the test:**
   ```ts
   import { describe, it, expect } from 'vitest';
   import { fooBar } from './foo-bar';

   describe('fooBar', () => {
     it('returns X for the happy path', () => {
       expect(fooBar(input)).toEqual(expected);
     });

     it('handles empty input', () => { ... });

     it('handles <edge case>', () => { ... });
   });
   ```

4. **What to cover** (in order of importance):
   - Happy path (the main contract)
   - Empty / zero / null input
   - One realistic edge case (boundary date, missing field, multi-model mix, etc.)
   - Invariants (e.g. result is sorted, totals add up)

5. **What NOT to do:**
   - Don't snapshot-test computed numbers — use explicit `expect(...).toBe(<n>)`.
   - Don't mock pure functions — call them directly.
   - Don't import `react`, `next`, or browser globals in tests for non-presentation code.
   - Don't load real files from disk in tests; use inline fixtures or files under `__fixtures__/`.

6. **Run the new test:**
   ```bash
   npx vitest run <path-to-test>
   ```

7. **Run the full suite before declaring done:**
   ```bash
   npm run test
   ```
