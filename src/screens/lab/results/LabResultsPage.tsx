'use client';

import React from 'react';
import PageTemplate from '@/src/ui/components/PageTemplate';
import { Alert, Box, Button, Chip, Snackbar, Stack, Tab, Tabs, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@/src/ui/components/atoms';
import { useTheme } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { verifyResult, refFromLowHigh } from '@/src/store/slices/limsSlice';
import { getFlagColor } from '../lab-status-config';
import { useLabTheme } from '../lab-theme';
import LabWorkspaceCard from '../components/LabWorkspaceCard';

export default function LabResultsPage() {
  const theme = useTheme();
  const lab = useLabTheme(theme);
  const dispatch = useAppDispatch();
  const { results } = useAppSelector((state) => state.lims);
  const [tab, setTab] = React.useState(0);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const pending = results.filter((r) => r.status === 'pending');
  const verified = results.filter((r) => r.status === 'verified');
  const flagged = results.filter((r) => r.flag !== 'NORMAL');

  const handleVerify = (resultId: string) => {
    dispatch(verifyResult({ resultId, verifiedBy: 'Supervisor' }));
    setSnackbar({ open: true, message: 'Result verified.', severity: 'success' });
  };

  const handleVerifyAllPending = () => {
    pending.forEach((r) => dispatch(verifyResult({ resultId: r.id, verifiedBy: 'Supervisor' })));
    setSnackbar({ open: true, message: `Verified ${pending.length} result(s).`, severity: 'success' });
  };

  const rows = tab === 0 ? pending : tab === 1 ? verified : flagged;

  return (
    <PageTemplate
      title="Results Entry"
      subtitle="Manage and verify test results"
      currentPageTitle="Results"
    >
      <LabWorkspaceCard
        current="results"
        actions={
          tab === 0 && pending.length > 0 ? (
            <Button variant="contained" color="success" size="small" onClick={handleVerifyAllPending}>
              Verify All Pending
            </Button>
          ) : undefined
        }
      >
        <Stack spacing={2}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}>
          <Tab label={`Pending (${pending.length})`} />
          <Tab label={`Verified (${verified.length})`} />
          <Tab label={`Flagged (${flagged.length})`} />
        </Tabs>
        <Box sx={lab.cardSx}>
          <TableContainer sx={lab.tableContainerSx}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Sample ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Test</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Analyte</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Result</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Unit</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Ref Range</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Flag</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Analyst</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{r.sampleId}</TableCell>
                    <TableCell>{r.test}</TableCell>
                    <TableCell>{r.analyte}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: r.flag !== 'NORMAL' ? 'error.main' : 'success.main' }}>{r.result}</TableCell>
                    <TableCell>{r.unit || '—'}</TableCell>
                    <TableCell>{refFromLowHigh(r.refLow, r.refHigh)}</TableCell>
                    <TableCell>
                      <Chip size="small" label={r.flag} sx={lab.chipSx(getFlagColor(r.flag, theme))} />
                    </TableCell>
                    <TableCell>{r.analyst}</TableCell>
                    <TableCell>
                      {r.status === 'pending' && (
                        <Button size="small" variant="outlined" color="success" onClick={() => handleVerify(r.id)}>Verify</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {rows.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No results in this category.</Typography>
            </Box>
          )}
        </Box>
        </Stack>
      </LabWorkspaceCard>
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </PageTemplate>
  );
}
