# `shared/`

**Cross-cutting helpers used by multiple layers. Zero business logic.**

## Subfolders

- `types/` — Generic TS utility types (`Brand`, `DeepReadonly`, `Result`)
- `utils/` — Pure formatters (number, currency, date, byte, duration)
- `constants/` — App-wide constants (storage keys, default ranges, route names)

## Rules

1. **Must not** import from `domain/`, `application/`, `infrastructure/`, or `presentation/`.
2. Everything pure. No React, no `window`, no I/O.
3. If something starts looking like business logic, move it to `domain/`.
