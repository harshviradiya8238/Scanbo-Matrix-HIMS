import * as React from 'react';
import { Box, Stack } from '@/src/ui/components/atoms';
import Paper, { PaperProps } from '@/src/ui/components/atoms/Paper';
import Text from '@/src/ui/components/atoms/Text';

export interface CardProps extends PaperProps {
  padding?: number;
}

export function Card({ padding = 0, sx, ...props }: CardProps) {
  return <Paper {...props} sx={{ p: padding, ...sx }} />;
}

interface CardHeaderProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  divider?: boolean;
  padding?: number;
}

export function CardHeader({
  title,
  subtitle,
  action,
  divider = true,
  padding = 2,
}: CardHeaderProps) {
  if (!title && !subtitle && !action) return null;

  return (
    <Box
      sx={{
        px: padding,
        pt: padding,
        pb: padding - 0.5,
        borderBottom: divider ? '1px solid' : 'none',
        borderColor: divider ? 'divider' : undefined,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
        <Box sx={{ minWidth: 0 }}>
          {title ? (
            <Text variant="subtitle1" sx={{ fontWeight: 700 }}>
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Text>
          ) : null}
        </Box>
        {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
      </Stack>
    </Box>
  );
}

interface CardBodyProps {
  children: React.ReactNode;
  padding?: number;
}

export function CardBody({ children, padding = 2 }: CardBodyProps) {
  return <Box sx={{ px: padding, pb: padding }}>{children}</Box>;
}

interface CardFooterProps {
  children: React.ReactNode;
  divider?: boolean;
  padding?: number;
}

export function CardFooter({ children, divider = true, padding = 2 }: CardFooterProps) {
  return (
    <Box
      sx={{
        px: padding,
        py: padding - 0.5,
        borderTop: divider ? '1px solid' : 'none',
        borderColor: divider ? 'divider' : undefined,
      }}
    >
      {children}
    </Box>
  );
}
