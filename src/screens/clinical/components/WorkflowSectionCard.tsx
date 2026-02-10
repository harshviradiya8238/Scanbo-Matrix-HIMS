'use client';

import * as React from 'react';
import { SxProps, Theme } from '@mui/material';
import { Box, Divider, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';

interface WorkflowSectionCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

export default function WorkflowSectionCard({
  title,
  subtitle,
  action,
  children,
  sx,
}: WorkflowSectionCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        p: 0,
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        ...sx,
      }}
    >
      <Box sx={{ px: 2, py: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            {subtitle ? (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
        </Stack>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>{children}</Box>
    </Card>
  );
}
