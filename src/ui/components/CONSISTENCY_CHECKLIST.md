# UI Consistency Checklist

- Spacing: use `theme.spacing` scale (e.g., `1`, `1.5`, `2`, `3`) via layout components (`PageLayout`, `Section`, `Stack`).
- Typography: use `Text`/`Typography` variants (`h1`–`h6`, `subtitle*`, `body*`, `caption`) instead of ad-hoc sizes.
- Color: use `theme.palette` tokens only; avoid new hex values in UI components.
- Interactive states: include hover/focus-visible styles on clickable elements.
- Disabled/loading: show disabled styles and use `Spinner`/`Skeleton` for loading states.
- Error states: show inline helper/error text via `Field` or `HelperText`.

## Validation (This Refactor)

- Applied `PageLayout` and `Section` to standardize spacing and headers.
- Replaced ad-hoc KPI cards with `StatTile` (tokenized colors).
- Centralized form error/label rendering via `Field` in form components.
- Standardized empty/loading states via `EmptyState` and `Skeleton`.
- Replaced page-level `Paper` usage with `Card` for consistent surfaces.
