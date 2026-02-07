import { alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

export const SOFT_SURFACE_ALPHA = 0.06;
export const SUBTLE_SURFACE_ALPHA = 0.04;
export const CHIP_SURFACE_ALPHA = 0.12;
export const CHIP_BORDER_ALPHA = 0.25;

export function getSoftSurface(theme: Theme) {
  return alpha(theme.palette.primary.main, SOFT_SURFACE_ALPHA);
}

export function getSubtleSurface(theme: Theme) {
  return alpha(theme.palette.primary.main, SUBTLE_SURFACE_ALPHA);
}

export function getPrimaryChipSx(theme: Theme) {
  return {
    bgcolor: alpha(theme.palette.primary.main, CHIP_SURFACE_ALPHA),
    color: theme.palette.primary.main,
    border: '1px solid',
    borderColor: alpha(theme.palette.primary.main, CHIP_BORDER_ALPHA),
  } as const;
}
