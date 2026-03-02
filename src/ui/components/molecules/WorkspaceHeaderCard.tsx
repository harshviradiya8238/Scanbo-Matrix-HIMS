import * as React from 'react';
import { alpha, useTheme } from '@/src/ui/theme';
import { cardShadow } from '@/src/core/theme/tokens';
import { Card } from './Card';
import type { CardProps } from './Card';

export type WorkspaceHeaderCardProps = CardProps;

export default function WorkspaceHeaderCard({ sx, ...props }: WorkspaceHeaderCardProps) {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 1.5, md: 2 },
        borderRadius: 2.5,
       
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
        // backgroundColor: "rgba(17, 114, 186, 0.08)",

        boxShadow: cardShadow,
        ...sx,
      }}
      {...props}
    />
  );
}
