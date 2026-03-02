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
  TextField,
  Tabs,
  Tab,
  Typography,
} from '@/src/ui/components/atoms';
import { useTheme } from '@mui/material';
import { useLabTheme } from '../lab-theme';
import { Add as AddIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import {
  addSample,
  addResults,
  assignAnalyst,
  updateSampleStatus,
  verifyAllPendingForSample,
  publishSample as publishSampleAction,
  appendAudit,
  refFromLowHigh,
} from '@/src/store/slices/limsSlice';
import type { LabSample, LabResultRow, LabAuditLogEntry, LabTestCatalogItem } from '../lab-types';
import { useLabStatusConfig, getFlagColor } from '../lab-status-config';
import { WORKFLOW_STEPS, ANALYSTS } from '../lab-types';
import AddSampleModal from '../modals/AddSampleModal';
import EnterResultsModal from '../modals/EnterResultsModal';
import LabWorkspaceCard from '../components/LabWorkspaceCard';

const SAMPLE_STATUSES: LabSample['status'][] = ['registered', 'received', 'assigned', 'analysed', 'verified', 'published'];

function SampleDetailView({
  sample,
  clientName,
  results,
  auditLog,
  tests,
  onBack,
  onAssignAnalyst,
  onMarkReceived,
  onEnterResults,
  onVerify,
  onPublish,
}: {
  sample: LabSample;
  clientName: string;
  results: LabResultRow[];
  auditLog: LabAuditLogEntry[];
  tests: LabTestCatalogItem[];
  onBack: () => void;
  onAssignAnalyst: (analyst: string) => void;
  onMarkReceived: () => void;
  onEnterResults: (testCode: string) => void;
  onVerify: () => void;
  onPublish: () => void;
}) {
  const theme = useTheme();
  const lab = useLabTheme(theme);
  const { sampleStatus } = useLabStatusConfig();
  const [tab, setTab] = React.useState(0);
  const [analystSelect, setAnalystSelect] = React.useState(sample.analyst || '');
  const sampleResults = results.filter((r) => r.sampleId === sample.id);
  const sampleAudit = auditLog.filter((e) => e.sampleId === sample.id);
  const cfg = sampleStatus[sample.status];
  const stepIndex = WORKFLOW_STEPS.indexOf(sample.status);

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} size="small" variant="outlined">
          Back
        </Button>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {sample.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {sample.patient} · {sample.type} · {clientName}
          </Typography>
        </Box>
        <Chip label={cfg.label} sx={lab.chipSx(cfg.color)} />
      </Stack>

      <Box sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          {WORKFLOW_STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <Chip
                size="small"
                label={sampleStatus[s].label}
                sx={{
                  bgcolor: i <= stepIndex ? lab.softSurface : 'action.hover',
                  color: i <= stepIndex ? sampleStatus[s].color : 'text.secondary',
                }}
              />
              {i < WORKFLOW_STEPS.length - 1 && <Typography variant="caption" color="text.secondary">→</Typography>}
            </React.Fragment>
          ))}
        </Stack>
        <LinearProgress variant="determinate" value={((stepIndex + 1) / WORKFLOW_STEPS.length) * 100} sx={{ height: 4, borderRadius: 2 }} />
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tab label="Info" />
        <Tab label="Analyses" />
        <Tab label="Results" />
        <Tab label="Log" />
      </Tabs>

      {tab === 0 && (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          <Box sx={{ ...lab.cardSx, p: 2 }}>
            <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: 1.5, mb: 1.5, display: 'block' }}>
              Sample Details
            </Typography>
            {[
              ['Sample ID', sample.id],
              ['Sample Type', sample.type],
              ['Collection Date', sample.date],
              ['Priority', sample.priority],
              ['Client', clientName],
              ['Status', sample.status],
            ].map(([k, v]) => (
              <Stack key={String(k)} direction="row" justifyContent="space-between" sx={{ py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">{k}</Typography>
                <Typography variant="body2" fontWeight={600}>{String(v)}</Typography>
              </Stack>
            ))}
          </Box>
          <Box sx={{ ...lab.cardSx, p: 2 }}>
            <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: 1.5, mb: 1.5, display: 'block' }}>
              Patient / Client
            </Typography>
            {[
              ['Patient Name', sample.patient],
              ['Client', clientName],
              ['Requested Tests', sample.tests.join(', ')],
            ].map(([k, v]) => (
              <Stack key={String(k)} direction="row" justifyContent="space-between" sx={{ py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">{k}</Typography>
                <Typography variant="body2" fontWeight={600}>{String(v)}</Typography>
              </Stack>
            ))}
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Analyst</InputLabel>
                <Select value={analystSelect} label="Analyst" onChange={(e) => setAnalystSelect(e.target.value as string)}>
                  {ANALYSTS.map((a) => (
                    <MenuItem key={a} value={a}>{a}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" size="small" onClick={() => analystSelect && onAssignAnalyst(analystSelect)} disabled={!analystSelect}>
                Assign
              </Button>
              <Button variant="outlined" color="info" size="small" onClick={onMarkReceived} disabled={sample.status !== 'registered'}>
                Mark Received
              </Button>
              <Button variant="outlined" color="success" size="small" onClick={onVerify} disabled={sample.status === 'published' || sampleResults.length === 0 || sampleResults.every((r) => r.status === 'verified')}>
                Verify
              </Button>
              <Button variant="outlined" color="info" size="small" onClick={onPublish} disabled={sample.status !== 'verified'}>
                Publish
              </Button>
            </Stack>
          </Box>
        </Box>
      )}

      {tab === 1 && (
        <Box sx={{ ...lab.cardSx, p: 2 }}>
          <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: 1.5, mb: 1.5, display: 'block' }}>
            Requested Analyses
          </Typography>
          {sample.tests.map((t) => {
            const testDef = tests.find((x) => x.code === t);
            const hasResults = sampleResults.some((r) => r.test === t);
            return (
              <Stack key={t} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2">{testDef?.name ?? t}</Typography>
                <Stack direction="row" spacing={1}>
                  <Chip size="small" label={hasResults ? 'Analysed' : 'Pending'} color={hasResults ? 'success' : 'default'} />
                  <Button variant="outlined" size="small" onClick={() => onEnterResults(t)}>Enter Results</Button>
                </Stack>
              </Stack>
            );
          })}
        </Box>
      )}

      {tab === 2 && (
        <Box sx={lab.cardSx}>
          {sampleResults.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No results entered yet for this sample.</Typography>
            </Box>
          ) : (
            <TableContainer sx={lab.tableContainerSx}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Test</TableCell>
                    <TableCell>Analyte</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Result</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Unit</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Ref Range</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Flag</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Analyst</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sampleResults.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.test}</TableCell>
                      <TableCell>{r.analyte}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: r.flag !== 'NORMAL' ? 'error.main' : 'success.main' }}>{r.result}</TableCell>
                      <TableCell>{r.unit || '—'}</TableCell>
                      <TableCell>{refFromLowHigh(r.refLow, r.refHigh)}</TableCell>
                      <TableCell>
                        <Chip size="small" label={r.flag} sx={lab.chipSx(getFlagColor(r.flag, theme))} />
                      </TableCell>
                      <TableCell>{r.analyst}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {tab === 3 && (
        <Box sx={{ ...lab.cardSx, p: 2 }}>
          <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: 1.5, mb: 1.5, display: 'block' }}>
            Audit Log
          </Typography>
          {sampleAudit.length === 0 ? (
            <Typography color="text.secondary">No audit entries for this sample.</Typography>
          ) : (
            sampleAudit.map((log, i) => (
              <Stack key={i} direction="row" alignItems="center" spacing={2} sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ color: 'primary.main', minWidth: 140 }}>{log.ts}</Typography>
                <Typography variant="body2" color="text.secondary">{log.event}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>{log.user}</Typography>
              </Stack>
            ))
          )}
        </Box>
      )}
    </Box>
  );
}

export default function LabSamplesPage() {
  const theme = useTheme();
  const lab = useLabTheme(theme);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { sampleStatus } = useLabStatusConfig();
  const { samples, clients, tests, results, auditLog } = useAppSelector((state) => state.lims);

  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<string>('all');
  const [view, setView] = React.useState<'list' | 'board'>('list');
  const [selected, setSelected] = React.useState<LabSample | null>(null);
  const [addSampleOpen, setAddSampleOpen] = React.useState(false);
  const [enterResultsTestCode, setEnterResultsTestCode] = React.useState<string | null>(null);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });

  const selectedId = searchParams.get('id');
  const selectedSample = selected ?? samples.find((s) => s.id === selectedId) ?? null;
  const clientNameFor = (clientId: string) => clients.find((c) => c.id === clientId)?.name ?? clientId;
  const timestamp = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

  React.useEffect(() => {
    if (selectedId && !selected) {
      const s = samples.find((s) => s.id === selectedId);
      if (s) setSelected(s);
    }
  }, [selectedId, samples, selected]);

  const filtered = React.useMemo(() => {
    return samples.filter((s) => {
      const name = clientNameFor(s.client);
      const matchSearch =
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.patient.toLowerCase().includes(search.toLowerCase()) ||
        name.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'all' || s.status === filter;
      return matchSearch && matchFilter;
    });
  }, [samples, search, filter, clients]);

  const handleAddSample = (form: Omit<LabSample, 'id' | 'status' | 'analyst' | 'worksheetId'>) => {
    dispatch(addSample(form));
    dispatch(appendAudit({ ts: timestamp(), event: 'New sample received', user: 'Lab Tech' }));
    setSnackbar({ open: true, message: 'Sample added and received.', severity: 'success' });
  };

  const handleAssignAnalyst = (analyst: string) => {
    if (!selectedSample) return;
    dispatch(assignAnalyst({ sampleId: selectedSample.id, analyst }));
    dispatch(appendAudit({ ts: timestamp(), event: `Sample ${selectedSample.id} assigned to ${analyst}`, user: analyst, sampleId: selectedSample.id }));
    setSnackbar({ open: true, message: 'Analyst assigned.', severity: 'success' });
  };

  const handleMarkReceived = () => {
    if (!selectedSample) return;
    dispatch(updateSampleStatus({ sampleId: selectedSample.id, status: 'received' }));
    dispatch(appendAudit({ ts: timestamp(), event: `Sample ${selectedSample.id} marked received`, user: 'Lab Tech', sampleId: selectedSample.id }));
    setSnackbar({ open: true, message: 'Sample marked received.', severity: 'success' });
  };

  const handleEnterResults = (testCode: string) => setEnterResultsTestCode(testCode);

  const handleResultsSubmit = (rows: LabResultRow[]) => {
    if (!selectedSample) return;
    dispatch(addResults(rows));
    dispatch(appendAudit({ ts: timestamp(), event: `Results entered for ${enterResultsTestCode}`, user: selectedSample.analyst || 'User', sampleId: selectedSample.id }));
    setEnterResultsTestCode(null);
    setSnackbar({ open: true, message: 'Results saved.', severity: 'success' });
  };

  const handleVerify = () => {
    if (!selectedSample) return;
    const sampleResults = results.filter((r) => r.sampleId === selectedSample.id);
    if (sampleResults.length === 0) {
      setSnackbar({ open: true, message: 'No results found for this sample.', severity: 'error' });
      return;
    }
    dispatch(verifyAllPendingForSample({ sampleId: selectedSample.id, verifiedBy: 'Supervisor' }));
    dispatch(appendAudit({ ts: timestamp(), event: `Sample ${selectedSample.id} verified`, user: 'Supervisor', sampleId: selectedSample.id }));
    setSnackbar({ open: true, message: 'Sample verified.', severity: 'success' });
  };

  const handlePublish = () => {
    if (!selectedSample) return;
    if (selectedSample.status !== 'verified') {
      setSnackbar({ open: true, message: 'Only verified samples can be published.', severity: 'error' });
      return;
    }
    dispatch(publishSampleAction({ sampleId: selectedSample.id }));
    dispatch(appendAudit({ ts: timestamp(), event: `Sample ${selectedSample.id} published`, user: 'Lab Manager', sampleId: selectedSample.id }));
    setSnackbar({ open: true, message: 'Sample published.', severity: 'success' });
  };

  const handleReceiveQueue = () => {
    const registered = samples.filter((s) => s.status === 'registered');
    if (registered.length === 0) {
      setSnackbar({ open: true, message: 'No registered samples pending receipt.', severity: 'info' });
      return;
    }
    registered.forEach((sample) => {
      dispatch(updateSampleStatus({ sampleId: sample.id, status: 'received' }));
      dispatch(appendAudit({ ts: timestamp(), event: `Sample ${sample.id} marked received`, user: 'Lab Tech', sampleId: sample.id }));
    });
    setSnackbar({ open: true, message: `${registered.length} sample(s) moved to received.`, severity: 'success' });
  };

  const handleQuickReceive = (sample: LabSample) => {
    dispatch(updateSampleStatus({ sampleId: sample.id, status: 'received' }));
    dispatch(appendAudit({ ts: timestamp(), event: `Sample ${sample.id} marked received`, user: 'Lab Tech', sampleId: sample.id }));
    setSnackbar({ open: true, message: `Sample ${sample.id} received.`, severity: 'success' });
  };

  const handleQuickVerify = (sample: LabSample) => {
    const sampleRows = results.filter((r) => r.sampleId === sample.id);
    if (sampleRows.length === 0) {
      setSnackbar({ open: true, message: `No results to verify for ${sample.id}.`, severity: 'error' });
      return;
    }
    dispatch(verifyAllPendingForSample({ sampleId: sample.id, verifiedBy: 'Supervisor' }));
    dispatch(appendAudit({ ts: timestamp(), event: `Sample ${sample.id} verified`, user: 'Supervisor', sampleId: sample.id }));
    setSnackbar({ open: true, message: `Sample ${sample.id} verified.`, severity: 'success' });
  };

  const handleQuickPublish = (sample: LabSample) => {
    if (sample.status !== 'verified') {
      setSnackbar({ open: true, message: `Sample ${sample.id} is not verified yet.`, severity: 'error' });
      return;
    }
    dispatch(publishSampleAction({ sampleId: sample.id }));
    dispatch(appendAudit({ ts: timestamp(), event: `Sample ${sample.id} published`, user: 'Lab Manager', sampleId: sample.id }));
    setSnackbar({ open: true, message: `Sample ${sample.id} published.`, severity: 'success' });
  };

  const enterResultsTest = enterResultsTestCode ? tests.find((t) => t.code === enterResultsTestCode) : null;

  if (selectedSample) {
    return (
      <PageTemplate title="Samples" currentPageTitle="Sample Detail">
        <LabWorkspaceCard current="samples">
          <Stack spacing={2}>
            <SampleDetailView
          sample={selectedSample}
          clientName={clientNameFor(selectedSample.client)}
          results={results}
          auditLog={auditLog}
          tests={tests}
          onBack={() => { setSelected(null); router.push('/lab/samples'); }}
          onAssignAnalyst={handleAssignAnalyst}
          onMarkReceived={handleMarkReceived}
          onEnterResults={handleEnterResults}
          onVerify={handleVerify}
          onPublish={handlePublish}
        />
        {enterResultsTest && (
          <EnterResultsModal
            open={!!enterResultsTestCode}
            onClose={() => setEnterResultsTestCode(null)}
            onSubmit={handleResultsSubmit}
            sampleId={selectedSample.id}
            testCode={enterResultsTest.code}
            testName={enterResultsTest.name}
            analytes={enterResultsTest.analytes}
            analyst={selectedSample.analyst || ANALYSTS[0]}
          />
        )}
          </Stack>
        </LabWorkspaceCard>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Samples"
      subtitle={`${samples.length} total samples in system`}
      currentPageTitle="Samples"
    >
      <LabWorkspaceCard
        current="samples"
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<AddIcon />} size="small" onClick={handleReceiveQueue}>
              Receive Queue
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} size="small" onClick={() => setAddSampleOpen(true)}>
              New Sample
            </Button>
          </Stack>
        }
      >
        <Stack spacing={2}>
          <Tabs value={view} onChange={(_, v) => setView(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="List view" value="list" />
          <Tab label="Board view" value="board" />
        </Tabs>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search by ID, patient, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ maxWidth: 280 }}
          />
          <TextField
            select
            size="small"
            SelectProps={{ native: true }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ minWidth: 140 }}
          >
            <option value="all">All Status</option>
            {SAMPLE_STATUSES.map((s) => (
              <option key={s} value={s}>{sampleStatus[s].label}</option>
            ))}
          </TextField>
          <Typography variant="caption" color="text.secondary">
            {filtered.length} results
          </Typography>
        </Stack>

        {view === 'list' ? (
          <Box sx={lab.cardSx}>
            <TableContainer sx={lab.tableContainerSx}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Sample ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Patient</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Client</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tests</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((s) => {
                    const cfg = sampleStatus[s.status];
                    return (
                      <TableRow key={s.id} hover sx={{ cursor: 'pointer' }} onClick={() => router.push(`/lab/samples?id=${s.id}`)}>
                        <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{s.id}</TableCell>
                        <TableCell>{s.patient}</TableCell>
                        <TableCell>{clientNameFor(s.client)}</TableCell>
                        <TableCell>{s.type}</TableCell>
                        <TableCell>{s.date}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            {s.tests.map((t) => (
                              <Chip key={t} size="small" label={t} sx={lab.chipSx(theme.palette.info.main)} />
                            ))}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={s.priority}
                            color={s.priority === 'URGENT' || s.priority === 'STAT' ? 'error' : s.priority === 'NORMAL' ? 'default' : 'warning'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={cfg.label} sx={lab.chipSx(cfg.color)} />
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Stack direction="row" spacing={0.75}>
                            {s.status === 'registered' && (
                              <Button size="small" variant="outlined" color="info" onClick={() => handleQuickReceive(s)}>
                                Receive
                              </Button>
                            )}
                            {s.status === 'analysed' && (
                              <Button size="small" variant="outlined" color="success" onClick={() => handleQuickVerify(s)}>
                                Verify
                              </Button>
                            )}
                            {s.status === 'verified' && (
                              <Button size="small" variant="outlined" color="primary" onClick={() => handleQuickPublish(s)}>
                                Publish
                              </Button>
                            )}
                            <Button size="small" variant="outlined" onClick={() => router.push(`/lab/samples?id=${s.id}`)}>
                              View
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' } }}>
            {SAMPLE_STATUSES.map((status) => {
              const cfg = sampleStatus[status];
              const list = samples.filter((s) => s.status === status);
              return (
                <Box key={status} sx={{ ...lab.cardSx, p: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Chip size="small" label={cfg.label} sx={lab.chipSx(cfg.color)} />
                    <Typography variant="caption" color="text.secondary">{list.length}</Typography>
                  </Stack>
                  {list.map((s) => (
                    <Box
                      key={s.id}
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        mb: 1,
                        cursor: 'pointer',
                        '&:hover': { borderColor: 'primary.main' },
                      }}
                      onClick={() => router.push(`/lab/samples?id=${s.id}`)}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>{s.id}</Typography>
                      <Typography variant="caption" display="block" color="text.secondary">{s.patient}</Typography>
                      <Typography variant="caption" color="text.secondary">{s.type}</Typography>
                    </Box>
                  ))}
                </Box>
              );
            })}
          </Box>
        )}
        </Stack>
      </LabWorkspaceCard>
      <AddSampleModal
        open={addSampleOpen}
        onClose={() => setAddSampleOpen(false)}
        onSubmit={handleAddSample}
        clients={clients}
        tests={tests}
      />
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageTemplate>
  );
}
