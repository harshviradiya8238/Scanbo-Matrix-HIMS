# UI/Frontend Rules (Scanbo HIMS)

1. Do not add custom CSS files, inline `<style>`, or ad‑hoc class names for one‑off styling.
2. Use shared/common components for repeated UI patterns. If a new pattern is reused, create a common component under `src/ui/components` and refactor callers to use it.
3. Colors must come from the theme only. Do not hardcode color values (`#...`, `rgb(...)`, `rgba(...)`, named colors). Use `theme.palette.*` or `theme.vars.*`.
4. Single source of truth for theming is `src/core/theme/theme.ts`. Do not create additional theme files.
5. Spacing must use theme spacing. Use `theme.spacing(n)` or MUI `sx` with numeric spacing values (e.g. `p: 2`, `gap: 1.5`).
6. Typography must use theme typography variants and the global font. Do not set custom font families locally.
7. Prefer MUI `sx` (theme‑aware) and component props over custom styling.
8. If a design requires new tokens (colors, spacing, shadows), add them to the theme and reuse them across the app.
