'use client';

import { Box } from '@/src/ui/components/atoms';
import Spinner from '@/src/ui/components/atoms/Spinner';
import Text from '@/src/ui/components/atoms/Text';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ message, fullScreen = false }: LoadingSpinnerProps) {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        ...(fullScreen && {
          minHeight: '100vh',
        }),
      }}
    >
      <Spinner size={48} />
      {message && (
        <Text variant="body2" color="text.secondary">
          {message}
        </Text>
      )}
    </Box>
  );

  return content;
}
