# `infrastructure/`

**Adapters that fulfill the ports defined in `application/`.**

This is where the app touches the outside world: the file system (via the
File API), `localStorage`, the i18n loader. Anything that talks to a browser
or Node API lives here, behind an interface so the rest of the app stays
testable.

## Subfolders

- `parsing/` — JSONL line parser, file reader (wraps `File.text()` and `webkitRelativePath`)
- `storage/` — `KeyValueStore` impl over `window.localStorage`
- `i18n/` — `next-intl` request config and dictionary loader

## Rules

1. May import from `domain/` and `application/`. **Must not** import from `presentation/`.
2. Each adapter implements an interface from `application/` — never invent a new one here.
3. Browser-only code is allowed; mark it with `'use client'` if it needs to be importable from React.
4. Tested with Vitest + jsdom (or fixtures) at the adapter boundary.
