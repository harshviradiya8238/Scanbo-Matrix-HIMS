# Design System Components

This folder contains the reusable UI system built on top of MUI, organized with Atomic Design:

- **Atoms**: `Button`, `Input`, `Select`, `Checkbox`, `Radio`, `Switch`, `Text`, `Icon`, `Badge`, `Divider`, `Spinner`, `Skeleton`, etc.
- **Molecules**: `Field`, `SearchBar`, `Card`, `StatTile`, `AvatarWithName`, `EmptyState`, `Pagination`.
- **Organisms**: `AppHeader`, `Sidebar`, `DataTable`, `FiltersPanel`, `AuthForm`, `SettingsPanel`.
- **Layouts/Templates**: `PageLayout`, `PageHeader`, `Section`, `Grid`, `Stack`, `Container`.

Use the single entry points to keep imports consistent:

```tsx
import { Button, TextField } from '@/src/ui/components/atoms';
import { Field, StatTile } from '@/src/ui/components/molecules';
import { PageLayout, Section } from '@/src/ui/components/layout';
import { DataTable } from '@/src/ui/components/organisms';
```

See `CONSISTENCY_CHECKLIST.md` for the UI quality checklist.
