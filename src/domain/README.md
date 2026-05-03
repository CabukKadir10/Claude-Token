# `domain/`

**Pure business logic. No framework, no React, no browser APIs.**

This layer is the source of truth for what the app *means*: what a usage event
is, how a model maps to a pricing tier, how cost is computed, how tokens add up.

## Subfolders

- `entities/` — `UsageEvent`, `Project`, `Session`, `DailyBucket`
- `value-objects/` — `Tokens`, `Cost`, `ModelTier`, `DateRange`
- `services/` — pure functions (`modelTier`, `computeCost`, `totalTokens`, `aggregateBy`)

## Rules

1. **No imports** from `application/`, `infrastructure/`, `presentation/`, React, Next, or `window`.
2. Every function pure (deterministic, no side effects).
3. Every public function unit-tested with Vitest. Coverage target: **100%**.
4. No string formatting for the user — domain returns numbers, presentation labels them.
