---
name: add-jsonl-parser-rule
description: Extend the .jsonl line parser to handle a new field, line type, or edge case. Use when adding support for a new Claude Code log shape, a new model family, or fixing a parser bug for malformed lines.
---

# Add a JSONL parser rule

The parser is the heart of this app. Touch it carefully.

## Files involved

- `src/application/services/parse-jsonl-line.ts` — single-line parser; takes a string, returns `UsageEvent | null`.
- `src/application/services/parse-jsonl-line.test.ts` — sibling tests.
- `src/application/use-cases/parse-jsonl-files.ts` — file-level orchestration (calls the line parser).
- `src/domain/entities/usage-event.ts` — output shape.
- `src/domain/services/resolve-model-tier.ts` — maps raw model name → pricing tier.
- `src/infrastructure/parsing/browser-file-source.ts` — browser file I/O adapter (rarely needs touching).

## Steps

1. **Read the current parser** — `parse-jsonl-line.ts` and its test file.

2. **Identify the change**:
   - New field on the log line → extend `UsageEvent` (use the `add-domain-entity` skill if the field is structured) and read it in the parser.
   - New model name → update `resolve-model-tier.ts` (and its test) only. The parser does not need to change.
   - Malformed line case → wrap parsing in try/catch and return `null` on failure. NEVER throw; lines without `usage` blocks are silently skipped.
   - New line type (e.g. `tool_result`) → only handle it if it has `usage`. Otherwise skip.

3. **Add a fixture** under `src/application/services/__fixtures__/` (use the `jsonl-fixture-generator` agent). Include both the new shape and a malformed counter-example.

4. **Add tests** in `parse-jsonl-line.test.ts` for:
   - Happy path with the new field/shape
   - Malformed line returns `null`
   - Missing optional field still parses (don't over-require)
   - Backwards compatibility: old line shapes still parse

5. **Performance check** — the parser runs over potentially thousands of lines. Avoid:
   - `JSON.parse` more than once per line
   - Regex on every line for things you can check with a property access
   - Allocating new arrays/objects per line beyond the returned `UsageEvent`

6. **Verify** the full chain:
   ```bash
   npx vitest run src/application/services/
   npx vitest run src/application/use-cases/parse-jsonl-files.test.ts
   ```

## Invariants the parser must preserve

- Lines without a usage block return `null` (caller filters).
- Malformed JSON returns `null`, never throws.
- `ts` and `day` may be `null` together when the line has no parseable timestamp.
- `model` may be `null`; `tier` then falls back to the unknown tier.
- No DOM, no `fetch`, no `window` — pure string-in / object-out.
