import * as React from 'react';
import { Box, Stack } from '@/src/ui/components/atoms';
import Paper from '@/src/ui/components/atoms/Paper';
import Text from '@/src/ui/components/atoms/Text';

interface SectionProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  variant?: 'default' | 'outlined';
  padding?: number;
}

export default function Section({
  title,
  subtitle,
  actions,
  children,
  variant = 'default',
  padding = 2,
}: SectionProps) {
  return (
    <Paper
      variant={variant === 'outlined' ? 'outlined' : undefined}
      sx={{ p: padding, display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      {(title || subtitle || actions) && (
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
          {actions ? <Box sx={{ flexShrink: 0 }}>{actions}</Box> : null}
        </Stack>
      )}
      {children}
    </Paper>
  );
}
