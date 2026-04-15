'use client';

import { Box } from '@/src/ui/components/atoms';
import { AppLoaderVisual } from '@/src/ui/components/loaders/LoaderPrimitives';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ message, fullScreen = false }: LoadingSpinnerProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullScreen ? '100vh' : 140,
        width: '100%',
      }}
    >
      <AppLoaderVisual message={message} size={fullScreen ? 'regular' : 'compact'} />
    </Box>
  );
}
