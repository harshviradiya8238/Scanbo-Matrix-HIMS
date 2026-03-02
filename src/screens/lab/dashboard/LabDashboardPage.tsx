'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Box,
  Chip,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@/src/ui/components/atoms';
import { useTheme } from '@mui/material';
import { useAppSelector } from '@/src/store/hooks';
import { useLabStatusConfig } from '../lab-status-config';
import { useLabTheme, LAB_CARD_BORDER_RADIUS } from '../lab-theme';
import type { LabWorksheet } from '../lab-types';
import LabWorkspaceCard from '../components/LabWorkspaceCard';

function worksheetProgress(w: LabWorksheet, results: { sampleId: string; status: string }[]): number {
  if (w.samples.length === 0) return 0;
  const sampleIds = new Set(w.samples);
  const relevant = results.filter((r) => sampleIds.has(r.sampleId));
  if (relevant.length === 0) return 0;
  const verified = relevant.filter((r) => r.status === 'verified').length;
  return Math.round((verified / relevant.length) * 100);
}

export default function LabDashboardPage() {
  const theme = useTheme();
  const router = useRouter();
  const lab = useLabTheme(theme);
  const { sampleStatus, instrumentStatus } = useLabStatusConfig();
  const { samples, worksheets, results, instruments, clients, inventory } = useAppSelector((state) => state.lims);

  const pendingAnalysis = samples.filter((s) => s.status === 'received' || s.status === 'assigned').length;
  const resultsPending = samples.filter((s) => s.status === 'analysed').length;
  const publishedToday = samples.filter((s) => s.status === 'published').length;
  const activeClients = clients.filter((c) => c.active).length;
  const toVerify = worksheets.filter((w) => w.status === 'to_be_verified').length;
  const lowStock = inventory.filter((item) => item.onHand <= item.reorderLevel).length;

  const stats: { label: string; value: number; tone: 'primary' | 'success' | 'warning' | 'error' | 'info' }[] = [
    { label: 'Total samples', value: samples.length, tone: 'primary' },
    { label: 'Pending analysis', value: pendingAnalysis, tone: 'warning' },
    { label: 'Results pending', value: resultsPending, tone: 'error' },
    { label: 'Published today', value: publishedToday, tone: 'success' },
    { label: 'Active clients', value: activeClients, tone: 'info' },
    { label: 'Worksheets', value: worksheets.length, tone: 'primary' },
    { label: 'To verify', value: toVerify, tone: 'warning' },
    { label: 'Low stock', value: lowStock, tone: lowStock > 0 ? 'error' : 'success' },
  ];

  return (
    <PageTemplate
      title="Laboratory"
     
      subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
      currentPageTitle="Dashboard"
    >
      <LabWorkspaceCard current="dashboard">
        <Stack spacing={2}>
          <Box
            sx={{
              display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)', lg: 'repeat(8, 1fr)' },
          }}
        >
          {stats.map((s) => (
            <Box
              key={s.label}
              sx={{
                ...lab.statCardSx(s.tone),
                cursor: 'default',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {s.value}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {s.label}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' } }}>
          <Box sx={lab.cardSx}>
            <Box sx={{ px: 2, pt: 2, pb: 1 }}>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: 1 }}>
                Recent samples
              </Typography>
            </Box>
            <TableContainer sx={lab.tableContainerSx}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {samples.slice(0, 6).map((s) => {
                    const cfg = sampleStatus[s.status];
                    return (
                      <TableRow
                        key={s.id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => router.push(`/lab/samples?id=${s.id}`)}
                      >
                        <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{s.id}</TableCell>
                        <TableCell>{s.patient}</TableCell>
                        <TableCell>{s.type}</TableCell>
                        <TableCell>
                          <Chip size="small" label={cfg.label} sx={lab.chipSx(cfg.color)} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box sx={lab.cardSx}>
            <Box sx={{ px: 2, pt: 2, pb: 1 }}>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: 1 }}>
                Worksheets
              </Typography>
            </Box>
            <Stack spacing={1.5} sx={{ px: 2, pb: 2 }}>
              {worksheets.slice(0, 4).map((w) => {
                const progress = worksheetProgress(w, results);
                return (
                  <Box
                    key={w.id}
                    onClick={() => router.push(`/lab/worksheets?id=${w.id}`)}
                    sx={{
                      p: 1.25,
                      borderRadius: LAB_CARD_BORDER_RADIUS,
                      border: '1px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: lab.softSurface },
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {w.id}
                      </Typography>
                      <Chip
                        size="small"
                        label={w.status === 'open' ? 'Open' : w.status === 'to_be_verified' ? 'To verify' : w.status === 'verified' ? 'Verified' : 'Closed'}
                        color={w.status === 'to_be_verified' ? 'warning' : w.status === 'open' ? 'info' : w.status === 'verified' ? 'success' : 'default'}
                        sx={{ fontWeight: 600 }}
                      />
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{ height: 6, borderRadius: 1 }}
                      color={progress === 100 ? 'success' : 'primary'}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {w.analyst} · {w.samples.length} samples
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Box>

        <Box sx={lab.cardSx}>
          <Box sx={{ px: 2, pt: 2, pb: 1 }}>
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: 1 }}>
              Instruments
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              px: 2,
              pb: 2,
            }}
          >
            {instruments.map((inst) => {
              const cfg = instrumentStatus[inst.status];
              return (
                <Box
                  key={inst.id}
                  sx={{
                    p: 1.5,
                    borderRadius: LAB_CARD_BORDER_RADIUS,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {inst.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {inst.dept}
                  </Typography>
                  <Chip size="small" label={cfg.label} sx={{ ...lab.chipSx(cfg.color), mt: 1 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Calib: {inst.nextCalib}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
        </Stack>
      </LabWorkspaceCard>
    </PageTemplate>
  );
}
