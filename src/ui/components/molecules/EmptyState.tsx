import * as React from 'react';
import { Box, Stack } from '@/src/ui/components/atoms';
import Button from '@/src/ui/components/atoms/Button';
import Text from '@/src/ui/components/atoms/Text';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Stack spacing={1.5} alignItems="center">
        {icon ? <Box>{icon}</Box> : null}
        <Box>
          <Text variant="subtitle1" sx={{ fontWeight: 600 }}>
            {title}
          </Text>
          {description ? (
            <Text variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {description}
            </Text>
          ) : null}
        </Box>
        {actionLabel && onAction ? (
          <Button variant="contained" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
}
