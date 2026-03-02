'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import { Box, Button, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@/src/ui/components/atoms';
import { useTheme } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Download as DownloadIcon, Email as EmailIcon } from '@mui/icons-material';
import { useAppSelector } from '@/src/store/hooks';
import { refFromLowHigh } from '@/src/store/slices/limsSlice';
import { useLabTheme } from '../lab-theme';
import LabWorkspaceCard from '../components/LabWorkspaceCard';

const REPORT_TYPES = [
  { title: 'Certificate of Analysis', desc: 'Generate CoA PDF for verified samples', color: 'primary' as const, icon: '◱' },
  { title: 'Turnaround Time Report', desc: 'TAT analysis by department & analyst', color: 'info' as const, icon: '◔' },
  { title: 'Sample Statistics', desc: 'Volume, types and trends over time', color: 'secondary' as const, icon: '◎' },
  { title: 'Client Report', desc: 'Per-client sample and billing summary', color: 'success' as const, icon: '◇' },
  { title: 'QC Summary', desc: 'Quality control results and failures', color: 'warning' as const, icon: '◉' },
  { title: 'Pending Samples Report', desc: 'Samples awaiting analysis or verification', color: 'error' as const, icon: '◈' },
];

function CoAView({ sampleId, onBack }: { sampleId: string; onBack: () => void }) {
  const theme = useTheme();
  const lab = useLabTheme(theme);
  const { samples, clients, results, settings } = useAppSelector((state) => state.lims);
  const sample = samples.find((s) => s.id === sampleId);
  const client = sample ? clients.find((c) => c.id === sample.client) : null;
  const sampleResults = results.filter((r) => r.sampleId === sampleId && r.status === 'verified');

  if (!sample) return <Typography color="text.secondary">Sample not found.</Typography>;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} size="small" variant="outlined" sx={{ mb: 2 }}>Back</Button>
      <Box sx={{ ...lab.cardSx, p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Certificate of Analysis</Typography>
        <Stack direction="row" spacing={4} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Patient</Typography>
            <Typography variant="body1" fontWeight={600}>{sample.patient}</Typography>
            <Typography variant="body2" color="text.secondary">{sample.dob || '—'} · {sample.gender || '—'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Sample ID</Typography>
            <Typography variant="body1" fontWeight={600}>{sample.id}</Typography>
            <Typography variant="body2" color="text.secondary">{sample.type} · {sample.date}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Client</Typography>
            <Typography variant="body1" fontWeight={600}>{client?.name ?? sample.client}</Typography>
          </Box>
        </Stack>
        <TableContainer sx={{ ...lab.tableContainerSx, mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Test</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Analyte</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Result</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Unit</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ref Range</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Flag</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sampleResults.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.test}</TableCell>
                  <TableCell>{r.analyte}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{r.result}</TableCell>
                  <TableCell>{r.unit || '—'}</TableCell>
                  <TableCell>{refFromLowHigh(r.refLow, r.refHigh)}</TableCell>
                  <TableCell>{r.flag}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
          {settings.footer || `${settings.labName} · ${settings.city} · ${settings.phone}`}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button size="small" variant="contained" startIcon={<DownloadIcon />}>Download PDF</Button>
          <Button size="small" variant="outlined" startIcon={<EmailIcon />}>Email to Client</Button>
        </Stack>
      </Box>
    </Box>
  );
}

export default function LabReportsPage() {
  const theme = useTheme();
  const lab = useLabTheme(theme);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { samples, clients } = useAppSelector((state) => state.lims);
  const reportId = searchParams.get('id');
  const published = samples.filter((s) => s.status === 'published');
  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? id;

  if (reportId) {
    return (
      <PageTemplate title="Reports" currentPageTitle="Certificate of Analysis">
        <LabWorkspaceCard current="reports">
          <Stack spacing={2}>
            <CoAView sampleId={reportId} onBack={() => router.push('/lab/reports')} />
          </Stack>
        </LabWorkspaceCard>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title="Reports" subtitle="Generate and manage lab reports & certificates" currentPageTitle="Reports">
      <LabWorkspaceCard current="reports">
        <Stack spacing={2}>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
        {REPORT_TYPES.map((r) => (
          <Box
            key={r.title}
            sx={{ ...lab.cardSx, p: 2, cursor: 'pointer', borderTop: '2px solid', borderTopColor: `${r.color}.main` }}
            onClick={() => r.title === 'Certificate of Analysis' && published.length > 0 && router.push(`/lab/reports?id=${published[0].id}`)}
          >
              <Typography variant="h5" sx={{ mb: 1 }}>{r.icon}</Typography>
              <Typography variant="subtitle2" sx={{ color: `${r.color}.main`, fontWeight: 700, mb: 0.5 }}>{r.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{r.desc}</Typography>
              <Button size="small" variant="outlined" color={r.color}>Generate</Button>
          </Box>
        ))}
      </Box>
        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: 1, mt: 2, display: 'block' }}>Published reports</Typography>
        <Box sx={{ ...lab.cardSx }}>
          <TableContainer sx={lab.tableContainerSx}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Sample ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Patient</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Client</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {published.map((s) => (
                  <TableRow key={s.id} hover sx={{ cursor: 'pointer' }} onClick={() => router.push(`/lab/reports?id=${s.id}`)}>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{s.id}</TableCell>
                    <TableCell>{s.patient}</TableCell>
                    <TableCell>{clientName(s.client)}</TableCell>
                    <TableCell>{s.date}</TableCell>
                    <TableCell><Button size="small" variant="outlined" onClick={() => router.push(`/lab/reports?id=${s.id}`)}>View CoA</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        </Stack>
      </LabWorkspaceCard>
    </PageTemplate>
  );
}
