'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Snackbar,
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
import { Add as AddIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { addWorksheet, updateWorksheetStatus, addSampleToWorksheet } from '@/src/store/slices/limsSlice';
import { useLabStatusConfig } from '../lab-status-config';
import { useLabTheme } from '../lab-theme';
import AddWorksheetModal from '../modals/AddWorksheetModal';
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

function WorksheetDetailView({
  worksheet,
  samples,
  results,
  onBack,
  onAddSample,
  onSubmitForVerification,
  onVerify,
}: {
  worksheet: LabWorksheet;
  samples: { id: string; patient: string; status: string; worksheetId?: string | null }[];
  results: { sampleId: string; status: string }[];
  onBack: () => void;
  onAddSample: (sampleId: string) => void;
  onSubmitForVerification: () => void;
  onVerify: () => void;
}) {
  const theme = useTheme();
  const lab = useLabTheme(theme);
  const { worksheetStatus } = useLabStatusConfig();
  const cfg = worksheetStatus[worksheet.status];
  const progress = worksheetProgress(worksheet, results);
  const worksheetSamples = samples.filter((s) => worksheet.samples.includes(s.id));
  const unassigned = samples.filter((s) => !s.worksheetId && (s.status === 'received' || s.status === 'assigned'));
  const [addSampleId, setAddSampleId] = React.useState('');

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} size="small" variant="outlined">Back</Button>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{worksheet.id}</Typography>
          <Typography variant="body2" color="text.secondary">{worksheet.template} · {worksheet.dept}</Typography>
        </Box>
        <Chip label={cfg.label} sx={lab.chipSx(cfg.color)} />
      </Stack>
      <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 1, mb: 2 }} color={progress === 100 ? 'success' : 'primary'} />
      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Add unassigned sample</InputLabel>
          <Select value={addSampleId} label="Add unassigned sample" onChange={(e) => setAddSampleId(e.target.value as string)}>
            <MenuItem value="">Select sample</MenuItem>
            {unassigned.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.id} — {s.patient}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="outlined" size="small" onClick={() => addSampleId && onAddSample(addSampleId)} disabled={!addSampleId}>Add</Button>
        <Button variant="outlined" color="warning" size="small" onClick={onSubmitForVerification} disabled={worksheet.status !== 'open'}>Submit for Verification</Button>
        <Button variant="outlined" color="success" size="small" onClick={onVerify} disabled={worksheet.status !== 'to_be_verified'}>Verify Worksheet</Button>
      </Stack>
      <Box sx={lab.cardSx}>
        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: 1, px: 2, pt: 2, display: 'block' }}>Samples in worksheet</Typography>
        <TableContainer sx={lab.tableContainerSx}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Sample ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Patient</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {worksheetSamples.map((s) => (
                <TableRow key={s.id}>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{s.id}</TableCell>
                  <TableCell>{s.patient}</TableCell>
                  <TableCell>{s.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

export default function LabWorksheetsPage() {
  const theme = useTheme();
  const lab = useLabTheme(theme);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { worksheetStatus } = useLabStatusConfig();
  const { worksheets, samples, results } = useAppSelector((state) => state.lims);

  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'info' }>({ open: false, message: '', severity: 'success' });
  const selectedId = searchParams.get('id');
  const selectedWs = worksheets.find((w) => w.id === selectedId);

  const samplesForDetail = samples.map((s) => ({ id: s.id, patient: s.patient, status: s.status, worksheetId: s.worksheetId }));

  if (selectedWs) {
    return (
      <PageTemplate title="Worksheets" currentPageTitle="Worksheet Detail">
        <LabWorkspaceCard current="worksheets">
          <Stack spacing={2}>
            <WorksheetDetailView
          worksheet={selectedWs}
          samples={samplesForDetail}
          results={results}
          onBack={() => router.push('/lab/worksheets')}
          onAddSample={(sampleId) => {
            dispatch(addSampleToWorksheet({ worksheetId: selectedWs.id, sampleId }));
            setSnackbar({ open: true, message: 'Sample added to worksheet.', severity: 'success' });
          }}
          onSubmitForVerification={() => {
            dispatch(updateWorksheetStatus({ worksheetId: selectedWs.id, status: 'to_be_verified' }));
            setSnackbar({ open: true, message: 'Submitted for verification.', severity: 'success' });
          }}
          onVerify={() => {
            dispatch(updateWorksheetStatus({ worksheetId: selectedWs.id, status: 'verified' }));
            setSnackbar({ open: true, message: 'Worksheet verified.', severity: 'success' });
          }}
        />
        <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>{snackbar.message}</Alert>
        </Snackbar>
          </Stack>
        </LabWorkspaceCard>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Worksheets"
      subtitle={`${worksheets.length} worksheets`}
      currentPageTitle="Worksheets"
    >
      <LabWorkspaceCard
        current="worksheets"
        actions={<Button variant="contained" startIcon={<AddIcon />} size="small" onClick={() => setAddModalOpen(true)}>New Worksheet</Button>}
      >
        <Stack spacing={2}>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
        {worksheets.map((w) => {
          const cfg = worksheetStatus[w.status];
          const progress = worksheetProgress(w, results);
          return (
            <Box key={w.id} sx={{ ...lab.cardSx, p: 2, cursor: 'pointer' }} onClick={() => router.push(`/lab/worksheets?id=${w.id}`)}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>{w.id}</Typography>
                    <Typography variant="body2" color="text.secondary">{w.template}</Typography>
                  </Box>
                  <Chip size="small" label={cfg.label} sx={lab.chipSx(cfg.color)} />
                </Stack>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 1, mb: 1 }} color={progress === 100 ? 'success' : 'primary'} />
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">{progress}% complete</Typography>
                  <Typography variant="caption" color="text.secondary">{w.samples.length} samples</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">👤 {w.analyst}</Typography>
                <Button size="small" variant="outlined" color="info" onClick={(e) => { e.stopPropagation(); router.push(`/lab/worksheets?id=${w.id}`); }}>Manage</Button>
              </Stack>
            </Box>
          );
        })}
        </Box>
        </Stack>
      </LabWorkspaceCard>
      <AddWorksheetModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onSubmit={(form) => { dispatch(addWorksheet(form)); setSnackbar({ open: true, message: 'Worksheet created.', severity: 'success' }); }} />
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </PageTemplate>
  );
}
