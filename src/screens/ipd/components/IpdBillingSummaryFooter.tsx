'use client';

import * as React from 'react';
import { Box, Button, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import { useSidebarState } from '@/src/core/navigation/useSidebarState';
import { useMediaQuery } from '@mui/material';

interface IpdBillingSummaryFooterProps {
  totalCharges: React.ReactNode;
  insuranceAmount: React.ReactNode;
  outstandingAmount: React.ReactNode;
  onGenerateInvoice: () => void;
  onProcessPayment: () => void;
  generateInvoiceLabel?: React.ReactNode;
  processPaymentLabel?: React.ReactNode;
}

export default function IpdBillingSummaryFooter({
  totalCharges,
  insuranceAmount,
  outstandingAmount,
  onGenerateInvoice,
  onProcessPayment,
  generateInvoiceLabel = 'Generate Invoice',
  processPaymentLabel = 'Process Payment',
}: IpdBillingSummaryFooterProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isExpanded } = useSidebarState();
  const sidebarOffset = isMobile ? 0 : isExpanded ? 260 : 96;
  const barHeight = isMobile ? 92 : 88;

  return (
    <>
      <Box sx={{ height: `${barHeight}px` }} />
      <Card
        elevation={0}
        sx={{
          borderTop: '1px solid',
          borderBottom: 0,
          borderLeft: 0,
          borderRight: 0,
          borderColor: alpha(theme.palette.primary.main, 0.2),
          borderRadius: 0,
          position: 'fixed',
          left: `${sidebarOffset}px`,
          right: 0,
          bottom: 0,
          zIndex: theme.zIndex.appBar + 2,
          boxShadow: `0 -8px 18px ${alpha(theme.palette.primary.main, 0.08)}`,
          transition: theme.transitions.create(['left'], {
            duration: 220,
            easing: theme.transitions.easing.sharp,
          }),
        }}
      >
        <Box sx={{ px: 2, py: 1.2 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.25}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
          >
            <Stack direction="row" spacing={2.2} useFlexGap flexWrap="wrap">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total Charges
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {totalCharges}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Insurance
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'success.main', fontWeight: 800 }}>
                  {insuranceAmount}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Outstanding
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'warning.main', fontWeight: 800 }}>
                  {outstandingAmount}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={onGenerateInvoice}>
                {generateInvoiceLabel}
              </Button>
              <Button variant="contained" onClick={onProcessPayment}>
                {processPaymentLabel}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Card>
    </>
  );
}
