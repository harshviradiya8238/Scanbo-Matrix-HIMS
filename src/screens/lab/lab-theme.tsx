/**
 * Lab module UI – consistent with app (centralized card shadow, no border)
 */
import { alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { getSoftSurface, getSubtleSurface } from '@/src/core/theme/surfaces';
import { cardShadow } from '@/src/core/theme/tokens';

export const LAB_CARD_BORDER_RADIUS = 2;

export function getLabCardSx(theme: Theme) {
  return {
    borderRadius: LAB_CARD_BORDER_RADIUS,
    border: 'none',
    bgcolor: 'transparent',
    boxShadow: cardShadow,
    overflow: 'hidden',
  } as const;
}

export function getLabStatCardSx(theme: Theme, tone: 'primary' | 'success' | 'warning' | 'error' | 'info' = 'primary') {
  const color = theme.palette[tone].main;
  return {
    borderRadius: LAB_CARD_BORDER_RADIUS,
    border: 'none',
    bgcolor: 'transparent',
    boxShadow: cardShadow,
    p: 2,
  } as const;
}

export function getLabChipSx(theme: Theme, color: string) {
  return {
    bgcolor: alpha(color, 0.12),
    color,
    border: 'none',
    fontWeight: 600,
    borderRadius: 1,
  } as const;
}

export function getLabTableContainerSx(theme: Theme) {
  return {
    '& .MuiTableHead-root .MuiTableCell-head': {
      backgroundColor: getSubtleSurface(theme),
      fontWeight: 700,
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: theme.palette.text.secondary,
      borderBottom: '1px solid',
      borderColor: 'divider',
    },
    '& .MuiTableBody-root .MuiTableRow-root:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
  } as const;
}

export function useLabTheme(theme: Theme) {
  return {
    cardSx: getLabCardSx(theme),
    statCardSx: (tone?: 'primary' | 'success' | 'warning' | 'error' | 'info') => getLabStatCardSx(theme, tone),
    chipSx: (color: string) => getLabChipSx(theme, color),
    tableContainerSx: getLabTableContainerSx(theme),
    softSurface: getSoftSurface(theme),
    subtleSurface: getSubtleSurface(theme),
  };
}
