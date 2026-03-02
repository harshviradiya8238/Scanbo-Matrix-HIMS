'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import { Box, Button, Chip, List, ListItem, Snackbar, Alert, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@/src/ui/components/atoms';
import { useTheme } from '@mui/material';
import { Add as AddIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { addTest } from '@/src/store/slices/limsSlice';
import AddTestModal from '../modals/AddTestModal';
import { useLabTheme } from '../lab-theme';
import LabWorkspaceCard from '../components/LabWorkspaceCard';

export default function LabTestCatalogPage() {
  const theme = useTheme();
  const lab = useLabTheme(theme);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { tests } = useAppSelector((state) => state.lims);
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const selectedCode = searchParams.get('id');
  const selectedTest = tests.find((t) => t.code === selectedCode);

  if (selectedTest) {
    return (
      <PageTemplate title="Test Catalog" currentPageTitle="Test Detail">
        <LabWorkspaceCard current="tests">
          <Stack spacing={2}>
            <Box>
            <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/lab/tests')} size="small" sx={{ mb: 2 }}>Back</Button>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedTest.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{selectedTest.code} · {selectedTest.dept} · {selectedTest.method}</Typography>
            <Typography variant="overline" sx={{ color: 'primary.main' }}>Analytes</Typography>
            <List dense>
              {selectedTest.analytes.map((a) => (
                <ListItem key={a} sx={{ py: 0.5 }}>{a}</ListItem>
              ))}
            </List>
            </Box>
          </Stack>
        </LabWorkspaceCard>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Test Catalog"
      subtitle={`${tests.length} tests configured`}
      currentPageTitle="Test Catalog"
    >
      <LabWorkspaceCard
        current="tests"
        actions={<Button variant="contained" startIcon={<AddIcon />} size="small" onClick={() => setAddModalOpen(true)}>Add Test</Button>}
      >
        <Stack spacing={2}>
          <Box sx={lab.cardSx}>
          <TableContainer sx={lab.tableContainerSx}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Test Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Method</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>TAT</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tests.map((t) => (
                  <TableRow key={t.code} hover sx={{ cursor: 'pointer' }} onClick={() => router.push(`/lab/tests?id=${t.code}`)}>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{t.code}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t.name}</TableCell>
                    <TableCell>
                      <Chip size="small" label={t.dept} sx={lab.chipSx(theme.palette.secondary.main)} />
                    </TableCell>
                    <TableCell>{t.method}</TableCell>
                    <TableCell>{t.tat}</TableCell>
                    <TableCell sx={{ color: 'success.main' }}>₹{t.price}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button size="small" variant="outlined" color="info" onClick={() => router.push(`/lab/tests?id=${t.code}`)}>View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        </Stack>
      </LabWorkspaceCard>
      <AddTestModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onSubmit={(form) => { dispatch(addTest(form)); setSnackbar({ open: true, message: 'Test added.' }); }} />
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </PageTemplate>
  );
}
