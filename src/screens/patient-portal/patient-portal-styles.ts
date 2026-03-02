/**
 * Shared style tokens for the Patient Portal module.
 * Mirrors the Clinical Care Workspace card/section pattern.
 */
import type { Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

/** Outer section card — same as IPD sectionCardSx */
export const ppSectionCard = (theme: Theme) => ({
  p: 0,
  border: '1px solid',
  borderColor: alpha(theme.palette.primary.main, 0.14),
  borderRadius: 2.5,
  boxShadow: 'none',
  overflow: 'hidden',
} as const);

/** Tinted header row inside a section card */
export const ppSectionHeader = (theme: Theme) => ({
  px: 2,
  py: 1.5,
  borderBottom: '1px solid',
  borderColor: 'divider',
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
} as const);

/** Inner data row / nested card */
export const ppInnerCard = () => ({
  p: 1.5,
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: 'none',
} as const);

/** Table head cell */
export const ppHeadCell = (theme: Theme) => ({
  py: 1,
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: 0.4,
  textTransform: 'uppercase' as const,
  color: 'text.secondary',
  borderBottom: '1px solid',
  borderColor: alpha(theme.palette.primary.main, 0.14),
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
} as const);

/** Subtle tinted block used for schedule / history cells */
export const ppTintedBlock = (theme: Theme) => ({
  p: 2,
  borderRadius: 2,
  bgcolor: alpha(theme.palette.primary.main, 0.04),
  border: '1px solid',
  borderColor: alpha(theme.palette.primary.main, 0.1),
} as const);
