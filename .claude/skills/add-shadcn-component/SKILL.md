---
name: add-shadcn-component
description: Add a shadcn/ui primitive to the project. Use when the user wants a new shadcn component (button, dialog, dropdown, table, etc.) or asks how to bring one in — installs it under presentation/components/ui and wires the import alias.
---

# Add a shadcn/ui component

The project uses shadcn/ui with files vendored under `src/presentation/components/ui/`. Existing primitives: `button.tsx`, `card.tsx`, `input.tsx`, `separator.tsx`.

## Steps

1. **Confirm the primitive isn't already vendored** — `ls src/presentation/components/ui/`.

2. **Install via the shadcn CLI:**
   ```bash
   npx shadcn@latest add <component>
   ```
   When prompted for component path, target `src/presentation/components/ui/`. The project's `tsconfig.json` `paths` alias is `@/* → src/*`.

3. **Adjust the imports** in the generated file if the CLI uses a different alias (`@/lib/utils` vs `@/shared/utils/cn`). The project's `cn` helper lives at `src/shared/utils/cn.ts`.

4. **Style direction** — the project's design goal is *lighter palette, more whitespace* than the legacy `dashboard.html`'s heavy dark/terminal theme. When choosing variants:
   - Prefer `variant="ghost"` or `"outline"` over `"default"` for secondary actions.
   - Use generous padding (`p-6`, `gap-6`) on cards.
   - Favor neutral borders over heavy backgrounds.
   - Dark mode is optional — light mode is the primary target.

5. **Use the new primitive from a feature component** under `src/presentation/components/<area>/` or a view under `src/presentation/views/`. Never re-vendor or duplicate the primitive.

6. **Verify** with `npm run lint` and start the dev server (`npm run dev` or the `verify-changes` skill) to confirm rendering.

## Notes

- Class composition: always use `cn(...)` from `@/shared/utils/cn` — it merges Tailwind classes and resolves conflicts.
- Lucide icons (`lucide-react`) are already a dependency — pair them with shadcn primitives directly.
- Don't add Radix packages by hand; the shadcn CLI handles them.
