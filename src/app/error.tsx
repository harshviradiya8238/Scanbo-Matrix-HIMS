'use client';

import { useEffect } from 'react';
import { Box, Button, Paper, Typography } from '@/src/ui/components/atoms';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3,
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Something went wrong!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {error.message || 'An unexpected error occurred'}
        </Typography>
        <Button variant="contained" onClick={reset}>
          Try again
        </Button>
      </Paper>
    </Box>
  );
}
