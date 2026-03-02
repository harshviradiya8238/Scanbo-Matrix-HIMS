'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Stack, Typography } from '@/src/ui/components/atoms';
import { Card, WorkspaceHeaderCard } from '@/src/ui/components/molecules';
import { useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Add as AddIcon } from '@mui/icons-material';
import LabModuleTabs, { type LabModuleTabId } from './LabModuleTabs';

export interface LabWorkspaceCardProps {
  current: LabModuleTabId;
  children: React.ReactNode;
  /** Optional actions (e.g. "Add Sample") shown in the header card */
  actions?: React.ReactNode;
}

export default function LabWorkspaceCard({ current, children, actions }: LabWorkspaceCardProps) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Stack spacing={0}>
      {/* Header card – same pattern as Clinical Care Workspace */}
      <WorkspaceHeaderCard
        sx={{
          p: { xs: 1.5, md: 2 },
          borderRadius: '10px 10px 0 0',
          borderBottom: 'none',
        }}
      >
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', lg: 'center' }}
          spacing={1.25}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.1 }}>
              Laboratory
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Samples, worksheets, results, test catalog, instruments, and reports.
            </Typography>
          </Box>

          {actions ?? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon fontSize="small" />}
                onClick={() => router.push('/lab/samples')}
              >
                Add Sample
              </Button>
            </Stack>
          )}
        </Stack>
      </WorkspaceHeaderCard>

      {/* Tabs card – attached to header, no gap */}
      <Card
        elevation={0}
        sx={{
          p: 0,
          borderRadius: '0 0 10px 10px',
          border: '1px solid',
          borderTop: 'none',
          borderColor: alpha(theme.palette.primary.main, 0.16),
        }}
      >
        <Box sx={{ px: 0.75, py: 0.75 }}>
          <LabModuleTabs current={current} embedded />
        </Box>
      </Card>

      {/* Page content below the card */}
      <Box sx={{ pt: 1.5 }}>{children}</Box>
    </Stack>
  );
}
