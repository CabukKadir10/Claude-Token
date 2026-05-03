---
name: add-i18n-string
description: Add a new translatable UI string. Use whenever the user wants to add or change visible text in a component, view, or hook — to ensure the string lives in BOTH tr.json and en.json and is consumed via next-intl.
---

# Add an i18n string

Use this whenever a new piece of user-visible text needs to appear in the UI.

## Steps

1. **Pick a key path** under an existing namespace in `src/infrastructure/i18n/locales/tr.json`. Reuse `common.*`, `nav.*`, `views.<view>.*`, `topbar.*`, etc. Don't invent a new top-level namespace unless the feature genuinely needs one.

2. **Add the key to BOTH locale files** with matching shape:
   - `src/infrastructure/i18n/locales/tr.json` — Turkish text
   - `src/infrastructure/i18n/locales/en.json` — English text

   Read both files first; insert the key in the same position in both so diffs stay clean.

3. **Consume the key in the component:**
   - Client component: `const t = useTranslations('namespace');` then `t('keyName')`.
   - Server component: `const t = await getTranslations('namespace');` then `t('keyName')`.
   - For interpolation: `t('greeting', { name })` and use `{name}` placeholders in the JSON values.

4. **Never** hardcode TR or EN literals in JSX, hook return values, or component prop defaults. Brand names (`Claude`) and technical identifiers are the only exceptions.

5. **Verify** the change with `npm run lint` (catches TS errors from missing keys if `next-intl` is configured strictly) and a quick TR/EN drift scan with the `i18n-auditor` agent.

## Common namespaces (current)

- `common.*` — generic labels (footer, app name, "coming soon")
- `nav.*` — sidebar items
- `topbar.*` — header controls (theme, language)
- `views.<viewName>.title|subtitle` — per-view headings
- `dropzone.*` — file picker UI
- `kpi.*`, `models.*`, `projects.*`, `sessions.*` — feature widgets

Add a new namespace only when the feature is clearly distinct from all the above.
