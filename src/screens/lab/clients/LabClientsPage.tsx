'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Box,
  Button,
  Chip,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import { useTheme } from '@mui/material';
import { Add as AddIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { addClient, toggleClient } from '@/src/store/slices/limsSlice';
import AddClientModal from '../modals/AddClientModal';
import { useLabTheme } from '../lab-theme';
import type { LabClient } from '../lab-types';
import LabWorkspaceCard from '../components/LabWorkspaceCard';

function ClientDetailView({
  client,
  samples,
  onBack,
  onToggleActive,
}: {
  client: LabClient;
  samples: { id: string; patient: string; status: string; date: string }[];
  onBack: () => void;
  onToggleActive: () => void;
}) {
  const theme = useTheme();
  const lab = useLabTheme(theme);
  const total = samples.length;
  const published = samples.filter((s) => s.status === 'published').length;
  const pending = samples.filter((s) => s.status !== 'published' && s.status !== 'verified').length;

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} size="small" variant="outlined">Back</Button>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{client.name}</Typography>
          <Typography variant="body2" color="text.secondary">{client.contact} · {client.city}</Typography>
        </Box>
        <Chip label={client.active ? 'Active' : 'Inactive'} color={client.active ? 'success' : 'default'} />
        <Button variant="outlined" size="small" color={client.active ? 'warning' : 'success'} onClick={onToggleActive}>
          {client.active ? 'Deactivate' : 'Activate'}
        </Button>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Box sx={{ ...lab.statCardSx('primary'), minWidth: 120 }}>
          <Typography variant="overline" color="primary.main">Total samples</Typography>
          <Typography variant="h5" fontWeight={700}>{total}</Typography>
        </Box>
        <Box sx={{ ...lab.statCardSx('success'), minWidth: 120 }}>
          <Typography variant="overline" color="primary.main">Published</Typography>
          <Typography variant="h5" fontWeight={700} color="success.main">{published}</Typography>
        </Box>
        <Box sx={{ ...lab.statCardSx('warning'), minWidth: 120 }}>
          <Typography variant="overline" color="primary.main">Pending</Typography>
          <Typography variant="h5" fontWeight={700} color="warning.main">{pending}</Typography>
        </Box>
      </Stack>
      <Box sx={lab.cardSx}>
        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: 1, px: 2, pt: 2, display: 'block' }}>Recent samples</Typography>
        <TableContainer sx={lab.tableContainerSx}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Sample ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Patient</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {samples.slice(0, 10).map((s) => (
                <TableRow key={s.id}>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{s.id}</TableCell>
                  <TableCell>{s.patient}</TableCell>
                  <TableCell>{s.date}</TableCell>
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

export default function LabClientsPage() {
  const theme = useTheme();
  const lab = useLabTheme(theme);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { clients, samples } = useAppSelector((state) => state.lims);
  const [search, setSearch] = React.useState('');
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'info' }>({ open: false, message: '', severity: 'success' });

  const selectedId = searchParams.get('id');
  const selectedClient = clients.find((c) => c.id === selectedId);

  const filtered = React.useMemo(
    () => clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || (c.city || '').toLowerCase().includes(search.toLowerCase())),
    [clients, search]
  );

  const clientSamples = (clientId: string) =>
    samples.filter((s) => s.client === clientId).map((s) => ({ id: s.id, patient: s.patient, status: s.status, date: s.date }));
  const sampleCount = (clientId: string) => samples.filter((s) => s.client === clientId).length;

  if (selectedClient) {
    return (
      <PageTemplate title="Clients" currentPageTitle="Client Detail">
        <LabWorkspaceCard current="clients">
          <Stack spacing={2}>
            <ClientDetailView
            client={selectedClient}
            samples={clientSamples(selectedClient.id)}
            onBack={() => router.push('/lab/clients')}
            onToggleActive={() => {
              dispatch(toggleClient(selectedClient.id));
              setSnackbar({ open: true, message: selectedClient.active ? 'Client deactivated.' : 'Client activated.', severity: 'success' });
            }}
          />
          </Stack>
        </LabWorkspaceCard>
        <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>{snackbar.message}</Alert>
        </Snackbar>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Clients"
      subtitle={`${clients.length} registered clients`}
      currentPageTitle="Clients"
    >
      <LabWorkspaceCard
        current="clients"
        actions={<Button variant="contained" startIcon={<AddIcon />} size="small" onClick={() => setAddModalOpen(true)}>Add Client</Button>}
      >
        <Stack spacing={2}>
          <TextField size="small" placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} sx={{ maxWidth: 300 }} />
        <Box sx={lab.cardSx}>
          <TableContainer sx={lab.tableContainerSx}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>City</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Samples</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} hover sx={{ cursor: 'pointer' }} onClick={() => router.push(`/lab/clients?id=${c.id}`)}>
                    <TableCell sx={{ color: 'primary.main' }}>{c.id}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{c.name}</TableCell>
                    <TableCell>{c.contact}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.city}</TableCell>
                    <TableCell sx={{ color: 'primary.main' }}>{sampleCount(c.id)}</TableCell>
                    <TableCell>
                      <Chip size="small" label={c.active ? 'Active' : 'Inactive'} color={c.active ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button size="small" variant="outlined" color="info" onClick={() => router.push(`/lab/clients?id=${c.id}`)}>Manage</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        </Stack>
      </LabWorkspaceCard>
      <AddClientModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onSubmit={(form) => { dispatch(addClient(form)); setSnackbar({ open: true, message: 'Client added.', severity: 'success' }); }} />
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </PageTemplate>
  );
}
