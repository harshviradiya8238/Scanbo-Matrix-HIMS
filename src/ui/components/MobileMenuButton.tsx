'use client';

import IconButton from '@/src/ui/components/atoms/IconButton';
import { useTheme } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

interface MobileMenuButtonProps {
  onClick: () => void;
}

export default function MobileMenuButton({ onClick }: MobileMenuButtonProps) {
  const theme = useTheme();
  return (
    <IconButton
      color="inherit"
      aria-label="open menu"
      onClick={onClick}
      sx={{
        mr: 1,
        color: theme.palette.text.primary,
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      }}
    >
      <MenuIcon />
    </IconButton>
  );
}
