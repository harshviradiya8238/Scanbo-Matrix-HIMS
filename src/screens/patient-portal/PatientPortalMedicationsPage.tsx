'use client';

import * as React from 'react';
import { Box, Button, Chip, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import { cardShadow } from '@/src/core/theme/tokens';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import type { Theme } from '@mui/material/styles';
import {
  AccessTime as AccessTimeIcon,
  AutorenewOutlined as RefillIcon,
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Medication as MedicationIcon,
  NoteAlt as NoteAltIcon,
  Person as PersonIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  Send as SendIcon,
  Share as ShareIcon,
  TaskAlt as TaskAltIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';
import PatientPortalWorkspaceCard from './components/PatientPortalWorkspaceCard';
import { PATIENT } from './patient-portal-mock-data';

/* ─── Enriched medication data ──────────────────────────────────────────── */
interface MedRecord {
  id: string;
  name: string;
  brand: string;
  dose: string;
  frequency: string;
  times: string[];
  category: string;
  prescriber: string;
  refillDate: string;
  daysUntilRefill: number;
  status: 'Active' | 'Completed';
  instructions: string;
  sideEffects: string[];
  dotColor: string;
  emoji: string;
}

const MED_DATA: MedRecord[] = [
  {
    id: 'm-1', name: 'Metoprolol Succinate', brand: 'Betaloc ZOK', dose: '50mg',
    frequency: 'Once daily', times: ['7:00 AM'], category: 'Cardiac',
    prescriber: 'Dr. Priya Sharma', refillDate: 'Mar 10, 2026', daysUntilRefill: 14,
    status: 'Active',
    instructions: 'Take one tablet every morning with or without food. Do not crush or chew. Do not stop abruptly — taper as advised.',
    sideEffects: ['Dizziness', 'Fatigue', 'Bradycardia', 'Cold extremities'],
    dotColor: '#ef4444', emoji: '❤️',
  },
  {
    id: 'm-2', name: 'Metformin HCl', brand: 'Glycomet 500', dose: '500mg',
    frequency: 'Twice daily', times: ['8:00 AM', '8:00 PM'], category: 'Diabetes',
    prescriber: 'Dr. Sneha Rao', refillDate: 'Mar 18, 2026', daysUntilRefill: 22,
    status: 'Active',
    instructions: 'Take one tablet twice daily with meals. Swallow whole. Monitor blood glucose regularly.',
    sideEffects: ['Nausea', 'Diarrhea', 'Lactic acidosis (rare)'],
    dotColor: '#3b82f6', emoji: '💊',
  },
  {
    id: 'm-3', name: 'Atorvastatin', brand: 'Lipitor 20', dose: '20mg',
    frequency: 'Once daily', times: ['9:00 PM'], category: 'Cholesterol',
    prescriber: 'Dr. Priya Sharma', refillDate: 'Mar 10, 2026', daysUntilRefill: 14,
    status: 'Active',
    instructions: 'Take one tablet in the evening. Avoid grapefruit juice. Report any muscle pain immediately.',
    sideEffects: ['Myalgia', 'Liver enzyme elevation', 'Headache', 'Nausea'],
    dotColor: '#8b5cf6', emoji: '🩹',
  },
  {
    id: 'm-4', name: 'Vitamin D3', brand: 'Calcirol 60K', dose: '60,000 IU',
    frequency: 'Once weekly', times: ['Sunday morning'], category: 'Supplement',
    prescriber: 'Dr. Arvind Mehta', refillDate: 'Apr 5, 2026', daysUntilRefill: 40,
    status: 'Active',
    instructions: 'Take one sachet dissolved in water once every week after breakfast. Course is 8 weeks.',
    sideEffects: ['Hypercalcaemia (excess dose)', 'Nausea'],
    dotColor: '#f59e0b', emoji: '🌿',
  },
];

/* ─── Rich prescription data ─────────────────────────────────────────────── */
interface RxRecord {
  id: string;
  date: string;
  med: string;
  doctor: string;
  department: string;
  qty: string;
  refills: number;
  instructions: string;
  status: 'Active' | 'Completed' | 'Expired';
  pharmacy: string;
  expiry: string;
  dx: string;
}

const RX_DATA: RxRecord[] = [
  {
    id: 'RX-2026-001', date: 'Feb 18, 2026',
    med: 'Metformin HCl 500mg', doctor: 'Dr. Sneha Rao', department: 'General Medicine',
    qty: '60 tablets', refills: 5,
    instructions: 'Take one tablet twice daily with meals. Swallow whole — do not crush.',
    status: 'Active', pharmacy: 'Apollo Pharmacy — Station Road',
    expiry: 'Feb 18, 2027', dx: 'Type 2 Diabetes Mellitus (E11.9)',
  },
  {
    id: 'RX-2026-002', date: 'Jan 10, 2026',
    med: 'Metoprolol Succinate 50mg', doctor: 'Dr. Priya Sharma', department: 'Cardiology',
    qty: '30 tablets', refills: 11,
    instructions: 'Take one tablet once daily in the morning. Do not stop abruptly.',
    status: 'Active', pharmacy: 'MedPlus — MG Road',
    expiry: 'Jan 10, 2027', dx: 'Hypertension (I10)',
  },
  {
    id: 'RX-2026-003', date: 'Jan 10, 2026',
    med: 'Atorvastatin 20mg', doctor: 'Dr. Priya Sharma', department: 'Cardiology',
    qty: '30 tablets', refills: 11,
    instructions: 'Take one tablet once daily in the evening. Avoid grapefruit juice.',
    status: 'Active', pharmacy: 'Apollo Pharmacy — Station Road',
    expiry: 'Jan 10, 2027', dx: 'Hypercholesterolaemia (E78.5)',
  },
  {
    id: 'RX-2025-004', date: 'Dec 5, 2025',
    med: 'Vitamin D3 60,000 IU', doctor: 'Dr. Arvind Mehta', department: 'Endocrinology',
    qty: '8 sachets', refills: 0,
    instructions: 'Take one sachet once weekly after breakfast for 8 weeks.',
    status: 'Completed', pharmacy: 'Wellness Pharmacy — Civil Hospital Rd',
    expiry: 'Jun 5, 2026', dx: 'Vitamin D Deficiency (E55.9)',
  },
  {
    id: 'RX-2025-005', date: 'Sep 15, 2025',
    med: 'Amoxicillin + Clavulanate 625mg', doctor: 'Dr. Sneha Rao', department: 'General Medicine',
    qty: '21 tablets', refills: 0,
    instructions: 'Take one tablet three times daily for 7 days. Complete full course.',
    status: 'Expired', pharmacy: 'MedPlus — MG Road',
    expiry: 'Sep 22, 2025', dx: 'Acute Sinusitis (J01.90)',
  },
];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const rxStatusColor = (s: RxRecord['status'], t: Theme) =>
  s === 'Active'
    ? { bg: alpha(t.palette.success.main, 0.12), color: t.palette.success.dark }
    : s === 'Expired'
    ? { bg: alpha(t.palette.error.main, 0.1), color: t.palette.error.main }
    : { bg: alpha(t.palette.text.secondary, 0.1), color: t.palette.text.secondary };

const scrollbar = {
  '&::-webkit-scrollbar': { width: 5 },
  '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
  '&::-webkit-scrollbar-thumb': { borderRadius: 99, bgcolor: 'divider' },
};

/* ════════════════════════════════════════════════════════════════════════════ */
export default function PatientPortalMedicationsPage() {
  const theme = useTheme();

  /* shared state */
  const [tab, setTab] = React.useState(0);
  const [snack, setSnack] = React.useState<{ open: boolean; msg: string; severity: 'success' | 'info' | 'warning' }>({ open: false, msg: '', severity: 'success' });

  /* medications tab state */
  const [medFilter, setMedFilter] = React.useState<'All' | 'Active' | 'Completed'>('All');
  const [medSearch, setMedSearch] = React.useState('');
  const [selectedMed, setSelectedMed] = React.useState<MedRecord>(MED_DATA[0]);
  const [taken, setTaken] = React.useState<Record<string, boolean>>({});
  const [refillDone, setRefillDone] = React.useState<Record<string, boolean>>({});
  const [refillDialog, setRefillDialog] = React.useState<MedRecord | null>(null);

  /* prescriptions tab state */
  const [rxFilter, setRxFilter] = React.useState<'All' | 'Active' | 'Completed' | 'Expired'>('All');
  const [rxSearch, setRxSearch] = React.useState('');
  const [selectedRx, setSelectedRx] = React.useState<RxRecord>(RX_DATA[0]);
  const [rxRefillDone, setRxRefillDone] = React.useState<Record<string, boolean>>({});
  const [sendingPharmacy, setSendingPharmacy] = React.useState(false);

  /* ── Computed lists ── */
  const filteredMeds = MED_DATA.filter((m) => {
    const matchFilter = medFilter === 'All' || m.status === medFilter;
    const matchSearch = m.name.toLowerCase().includes(medSearch.toLowerCase()) || m.brand.toLowerCase().includes(medSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  const filteredRx = RX_DATA.filter((r) => {
    const matchFilter = rxFilter === 'All' || r.status === rxFilter;
    const matchSearch = r.med.toLowerCase().includes(rxSearch.toLowerCase()) || r.doctor.toLowerCase().includes(rxSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  /* ── Stat counts ── */
  const activeMeds = MED_DATA.filter((m) => m.status === 'Active').length;
  const takenToday = Object.values(taken).filter(Boolean).length;
  const adherence = activeMeds > 0 ? Math.round((takenToday / activeMeds) * 100) : 0;
  const refillDue = MED_DATA.filter((m) => m.daysUntilRefill <= 15).length;

  const activeRx = RX_DATA.filter((r) => r.status === 'Active').length;
  const expiredRx = RX_DATA.filter((r) => r.status === 'Expired').length;

  /* ── Actions ── */
  const handleMarkTaken = (id: string) => {
    setTaken((p) => ({ ...p, [id]: true }));
    setSnack({ open: true, msg: 'Medication marked as taken for today!', severity: 'success' });
  };

  const handleRefillRequest = () => {
    if (!refillDialog) return;
    setRefillDone((p) => ({ ...p, [refillDialog.id]: true }));
    setRefillDialog(null);
    setSnack({ open: true, msg: 'Refill request sent to your doctor!', severity: 'success' });
  };

  const handleSendPharmacy = () => {
    setSendingPharmacy(true);
    setTimeout(() => {
      setSendingPharmacy(false);
      setSnack({ open: true, msg: `Prescription sent to ${selectedRx.pharmacy}!`, severity: 'success' });
    }, 1200);
  };

  const handleRxRefill = () => {
    setRxRefillDone((p) => ({ ...p, [selectedRx.id]: true }));
    setSnack({ open: true, msg: 'Refill request sent to prescribing doctor!', severity: 'success' });
  };

  /* ── Colours ── */
  const pr = theme.palette.primary;

  /* ── Panel heights: app header + patient bar (~138px) + tab bar (46px) + pb:3 (24px) + buffer ── */
  const PANEL_H = 'calc(100vh - 240px)';

  return (
    <PatientPortalWorkspaceCard current="medications" hidePatientBar>
      {/* ── Tab Bar — negative mx so it bleeds to card edges despite WorkspaceCard padding ── */}
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 0, bgcolor: 'background.paper', mx: { xs: -2, sm: -3 }, px: { xs: 0, sm: 0 } }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            px: 2,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 13.5, minHeight: 44 },
            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
          }}
        >
          <Tab label="My Medications" icon={<MedicationIcon sx={{ fontSize: 17 }} />} iconPosition="start" />
          <Tab label="Prescriptions (℞)" icon={<NoteAltIcon sx={{ fontSize: 17 }} />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* ════════════════ TAB 0 — MY MEDICATIONS ════════════════ */}
      {tab === 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '340px 1fr' }, height: PANEL_H, overflow: 'hidden', gap: 0, mx: { xs: -2, sm: -3 } }}>

          {/* ── Left panel ── */}
          <Box sx={{ borderRight: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Fixed top: stat tiles + search + filter */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', flexShrink: 0 }}>
              {/* Stat tiles */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.25, mb: 1.5 }}>
                {[
                  { label: 'Active', value: activeMeds, color: pr.main },
                  { label: 'Taken Today', value: `${takenToday}/${activeMeds}`, color: theme.palette.success.main },
                  { label: 'Refill Due', value: refillDue, color: theme.palette.warning.main },
                ].map((s) => (
                  <Card key={s.label} elevation={0} sx={{ boxShadow: cardShadow, border: 'none', p: 1.25, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 19, color: s.color, lineHeight: 1.1 }}>{s.value}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: 10.5 }}>{s.label}</Typography>
                  </Card>
                ))}
              </Box>
              {/* Search */}
              <TextField
                size="small" placeholder="Search medications…" fullWidth
                value={medSearch} onChange={(e) => setMedSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: 'text.disabled' }} /></InputAdornment> }}
                sx={{ mb: 1.25, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 } }}
              />
              {/* Filter chips */}
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                {(['All', 'Active', 'Completed'] as const).map((f) => (
                  <Chip key={f} label={f} size="small" onClick={() => setMedFilter(f)}
                    variant={medFilter === f ? 'filled' : 'outlined'}
                    color={medFilter === f ? 'primary' : 'default'}
                    sx={{ fontWeight: 600, fontSize: 11.5, cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Scrollable list */}
            <Box sx={{ flex: 1, overflowY: 'auto', ...scrollbar }}>
              {filteredMeds.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">No medications found.</Typography>
                </Box>
              ) : (
                <Stack spacing={0}>
                  {filteredMeds.map((med) => {
                    const isSelected = selectedMed.id === med.id;
                    const isTaken = taken[med.id] ?? false;
                    return (
                      <Box
                        key={med.id}
                        onClick={() => setSelectedMed(med)}
                        sx={{
                          px: 2, py: 1.75,
                          borderBottom: '1px solid', borderColor: 'divider',
                          cursor: 'pointer',
                          bgcolor: isSelected ? alpha(pr.main, 0.06) : 'background.paper',
                          borderLeft: isSelected ? `3px solid ${pr.main}` : '3px solid transparent',
                          '&:hover': { bgcolor: isSelected ? alpha(pr.main, 0.06) : alpha(pr.main, 0.03) },
                          transition: 'background 0.15s',
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                          {/* Color dot */}
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: med.dotColor, mt: 0.7, flexShrink: 0 }} />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>{med.name}</Typography>
                              <Chip size="small" label={med.status}
                                sx={{ fontWeight: 700, fontSize: 10, ml: 0.5, flexShrink: 0,
                                  bgcolor: med.status === 'Active' ? alpha(theme.palette.success.main, 0.12) : alpha(theme.palette.text.secondary, 0.1),
                                  color: med.status === 'Active' ? 'success.main' : 'text.secondary' }}
                              />
                            </Stack>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{med.dose} · {med.frequency}</Typography>
                            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.75 }}>
                              <Chip size="small" label={med.category}
                                sx={{ fontWeight: 600, fontSize: 10, bgcolor: alpha(pr.main, 0.08), color: pr.main }} />
                              {isTaken && <Chip size="small" label="Taken ✓"
                                sx={{ fontWeight: 600, fontSize: 10, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }} />}
                            </Stack>
                            {/* Refill progress */}
                            {med.status === 'Active' && (
                              <Box sx={{ mt: 1 }}>
                                <Stack direction="row" justifyContent="space-between">
                                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>Refill in {med.daysUntilRefill}d</Typography>
                                  <Typography variant="caption" sx={{ fontSize: 10, color: med.daysUntilRefill <= 15 ? 'warning.main' : 'text.disabled' }}>
                                    {med.refillDate}
                                  </Typography>
                                </Stack>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.max(0, 100 - (med.daysUntilRefill / 90) * 100)}
                                  color={med.daysUntilRefill <= 15 ? 'warning' : 'success'}
                                  sx={{ height: 4, borderRadius: 99, mt: 0.5 }}
                                />
                              </Box>
                            )}
                          </Box>
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Box>

            {/* Today's adherence footer */}
            <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: alpha(pr.main, 0.02), flexShrink: 0 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>Today's Adherence</Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: adherence >= 75 ? 'success.main' : 'warning.main' }}>{adherence}%</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={adherence} color={adherence >= 75 ? 'success' : 'warning'} sx={{ borderRadius: 99, height: 5 }} />
            </Box>
          </Box>

          {/* ── Right panel — detail ── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: alpha(pr.main, 0.01) }}>
            {/* Fixed header */}
            <Box sx={{
              px: 2.5, py: 1.75, borderBottom: '1px solid', borderColor: 'divider',
              bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
            }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 10.5 }}>
                  {selectedMed.category}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.25, fontSize: 16 }}>{selectedMed.name} {selectedMed.dose}</Typography>
                <Typography variant="caption" color="text.secondary">{selectedMed.brand} · {selectedMed.prescriber}</Typography>
              </Box>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Chip size="small" label={selectedMed.status}
                  sx={{ fontWeight: 700, fontSize: 11,
                    bgcolor: selectedMed.status === 'Active' ? alpha(theme.palette.success.main, 0.12) : alpha(theme.palette.text.secondary, 0.1),
                    color: selectedMed.status === 'Active' ? 'success.main' : 'text.secondary' }}
                />
                <Tooltip title="Print"><Button size="small" sx={{ minWidth: 32, p: 0.5 }}><PrintIcon sx={{ fontSize: 17 }} /></Button></Tooltip>
              </Stack>
            </Box>

            {/* Scrollable content */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5, ...scrollbar }}>

              {/* Overview row */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 1.5, mb: 2.5 }}>
                {[
                  { icon: <RefillIcon sx={{ fontSize: 16 }} />, label: 'Frequency', value: selectedMed.frequency },
                  { icon: <AccessTimeIcon sx={{ fontSize: 16 }} />, label: 'Time(s)', value: selectedMed.times.join(', ') },
                  { icon: <PersonIcon sx={{ fontSize: 16 }} />, label: 'Prescriber', value: selectedMed.prescriber },
                  { icon: <LocalPharmacyIcon sx={{ fontSize: 16 }} />, label: 'Refill Date', value: selectedMed.refillDate },
                ].map((item) => (
                  <Card key={item.label} elevation={0} sx={{ boxShadow: cardShadow, border: 'none', p: 1.75, borderRadius: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Box sx={{ color: pr.main }}>{item.icon}</Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 13 }}>{item.value}</Typography>
                  </Card>
                ))}
              </Box>

              {/* Instructions */}
              <Card elevation={0} sx={{ boxShadow: cardShadow, border: 'none', borderRadius: 2, p: 2, mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: 'text.secondary', fontSize: 10.5, display: 'block', mb: 1 }}>
                  Instructions
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.75, color: 'text.primary', fontSize: 13.5 }}>
                  {selectedMed.instructions}
                </Typography>
              </Card>

              {/* Side effects */}
              <Card elevation={0} sx={{ boxShadow: cardShadow, border: 'none', borderRadius: 2, p: 2, mb: 2 }}>
                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1 }}>
                  <WarningIcon sx={{ fontSize: 15, color: 'warning.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: 'text.secondary', fontSize: 10.5 }}>
                    Possible Side Effects
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  {selectedMed.sideEffects.map((se) => (
                    <Chip key={se} label={se} size="small"
                      sx={{ fontWeight: 600, fontSize: 11, bgcolor: alpha(theme.palette.warning.main, 0.08), color: theme.palette.warning.dark }}
                    />
                  ))}
                </Stack>
              </Card>

              {/* Mark taken status */}
              {taken[selectedMed.id] && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.08), border: '1px solid', borderColor: alpha(theme.palette.success.main, 0.2) }}>
                  <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main', fontSize: 13 }}>Marked as taken today</Typography>
                </Box>
              )}
            </Box>

            {/* Fixed footer — actions */}
            <Box sx={{
              px: 2.5, py: 1.75, borderTop: '1px solid', borderColor: 'divider',
              bgcolor: 'background.paper', display: 'flex', gap: 1, flexWrap: 'wrap', flexShrink: 0,
            }}>
              <Button variant="contained" disableElevation size="small"
                disabled={taken[selectedMed.id]}
                onClick={() => handleMarkTaken(selectedMed.id)}
                startIcon={<TaskAltIcon sx={{ fontSize: 15 }} />}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12.5, borderRadius: 2 }}>
                {taken[selectedMed.id] ? 'Taken Today ✓' : 'Mark as Taken'}
              </Button>
              <Button variant="outlined" size="small"
                disabled={refillDone[selectedMed.id]}
                onClick={() => setRefillDialog(selectedMed)}
                startIcon={<RefillIcon sx={{ fontSize: 15 }} />}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12.5, borderRadius: 2,
                  color: refillDone[selectedMed.id] ? 'success.main' : undefined,
                  borderColor: refillDone[selectedMed.id] ? 'success.main' : undefined }}>
                {refillDone[selectedMed.id] ? 'Refill Requested' : 'Request Refill'}
              </Button>
              <Button variant="outlined" size="small"
                startIcon={<SendIcon sx={{ fontSize: 15 }} />}
                onClick={() => setSnack({ open: true, msg: 'Message sent to ' + selectedMed.prescriber, severity: 'info' })}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12.5, borderRadius: 2 }}>
                Ask Doctor
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* ════════════════ TAB 1 — PRESCRIPTIONS ════════════════ */}
      {tab === 1 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '340px 1fr' }, height: PANEL_H, overflow: 'hidden', gap: 0, mx: { xs: -2, sm: -3 } }}>

          {/* ── Left panel ── */}
          <Box sx={{ borderRight: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Fixed top */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', flexShrink: 0 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.25, mb: 1.5 }}>
                {[
                  { label: 'Total', value: RX_DATA.length, color: pr.main },
                  { label: 'Active', value: activeRx, color: theme.palette.success.main },
                  { label: 'Expired', value: expiredRx, color: theme.palette.error.main },
                ].map((s) => (
                  <Card key={s.label} elevation={0} sx={{ boxShadow: cardShadow, border: 'none', p: 1.25, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 19, color: s.color, lineHeight: 1.1 }}>{s.value}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: 10.5 }}>{s.label}</Typography>
                  </Card>
                ))}
              </Box>
              <TextField
                size="small" placeholder="Search prescriptions…" fullWidth
                value={rxSearch} onChange={(e) => setRxSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: 'text.disabled' }} /></InputAdornment> }}
                sx={{ mb: 1.25, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 } }}
              />
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                {(['All', 'Active', 'Completed', 'Expired'] as const).map((f) => (
                  <Chip key={f} label={f} size="small" onClick={() => setRxFilter(f)}
                    variant={rxFilter === f ? 'filled' : 'outlined'}
                    color={rxFilter === f ? 'primary' : 'default'}
                    sx={{ fontWeight: 600, fontSize: 11.5, cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Scrollable list */}
            <Box sx={{ flex: 1, overflowY: 'auto', ...scrollbar }}>
              {filteredRx.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">No prescriptions found.</Typography>
                </Box>
              ) : (
                <Stack spacing={0}>
                  {filteredRx.map((rx) => {
                    const isSelected = selectedRx.id === rx.id;
                    const sc = rxStatusColor(rx.status, theme);
                    return (
                      <Box
                        key={rx.id}
                        onClick={() => setSelectedRx(rx)}
                        sx={{
                          px: 2, py: 1.75,
                          borderBottom: '1px solid', borderColor: 'divider',
                          cursor: 'pointer',
                          bgcolor: isSelected ? alpha(pr.main, 0.06) : 'background.paper',
                          borderLeft: isSelected ? `3px solid ${pr.main}` : '3px solid transparent',
                          '&:hover': { bgcolor: isSelected ? alpha(pr.main, 0.06) : alpha(pr.main, 0.03) },
                          transition: 'background 0.15s',
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3, flex: 1, mr: 1 }}>{rx.med}</Typography>
                          <Chip size="small" label={rx.status}
                            sx={{ fontWeight: 700, fontSize: 10, bgcolor: sc.bg, color: sc.color, flexShrink: 0 }} />
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>{rx.doctor} · {rx.department}</Typography>
                        <Stack direction="row" spacing={1.5} sx={{ mt: 0.75 }}>
                          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10.5 }}>📅 {rx.date}</Typography>
                          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10.5 }}>Qty: {rx.qty}</Typography>
                          <Typography variant="caption" sx={{ fontSize: 10.5, color: rx.refills > 0 ? 'success.main' : 'text.disabled', fontWeight: 600 }}>
                            Refills: {rx.refills}
                          </Typography>
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Box>
          </Box>

          {/* ── Right panel — ℞ detail ── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: alpha(theme.palette.grey[100], 0.5) }}>

            {/* Fixed header */}
            <Box sx={{
              px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider',
              bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
            }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{
                  width: 34, height: 34, borderRadius: 2, flexShrink: 0,
                  background: `linear-gradient(135deg, ${pr.dark}, ${pr.main})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 14, lineHeight: 1 }}>℞</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>{selectedRx.med}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11.5 }}>{selectedRx.id} · {selectedRx.department}</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Chip size="small" label={selectedRx.status}
                  sx={{ fontWeight: 700, fontSize: 10.5, bgcolor: rxStatusColor(selectedRx.status, theme).bg, color: rxStatusColor(selectedRx.status, theme).color }}
                />
                <Tooltip title="Print">
                  <Button size="small" sx={{ minWidth: 30, p: 0.5, color: 'text.secondary' }}><PrintIcon sx={{ fontSize: 16 }} /></Button>
                </Tooltip>
              </Stack>
            </Box>

            {/* Scrollable content */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2, gap: 1.5, display: 'flex', flexDirection: 'column', ...scrollbar }}>

              {/* ── ℞ Prescription Card ── */}
              <Box sx={{
                borderRadius: 2.5,
                background: `linear-gradient(135deg, ${pr.dark} 0%, ${pr.main} 55%, ${theme.palette.secondary.main} 100%)`,
                color: '#fff', position: 'relative', overflow: 'hidden',
              }}>
                {/* Watermark ℞ */}
                <Typography sx={{
                  position: 'absolute', right: -4, bottom: -20, fontSize: 130,
                  fontWeight: 900, opacity: 0.06, color: '#fff', lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
                }}>
                  ℞
                </Typography>

                {/* Header row */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start"
                  sx={{ px: 2.5, pt: 2, pb: 1.5, borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                  <Box>
                    <Typography sx={{ fontSize: 9.5, fontWeight: 700, opacity: 0.65, letterSpacing: 1, textTransform: 'uppercase' }}>Patient</Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: 14.5, lineHeight: 1.2 }}>{PATIENT.name}</Typography>
                    <Typography sx={{ fontSize: 11, opacity: 0.75 }}>ID: {PATIENT.pid} · {PATIENT.age} yrs · {PATIENT.gender}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: 9.5, fontWeight: 700, opacity: 0.65, letterSpacing: 1, textTransform: 'uppercase' }}>Rx ID</Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>{selectedRx.id}</Typography>
                    <Typography sx={{ fontSize: 11, opacity: 0.75 }}>{selectedRx.date}</Typography>
                  </Box>
                </Stack>

                {/* Medication body */}
                <Box sx={{ px: 2.5, pt: 1.75, pb: 2 }}>
                  <Typography sx={{ fontSize: 9.5, fontWeight: 700, opacity: 0.65, letterSpacing: 1, textTransform: 'uppercase', mb: 0.4 }}>Medication</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: 18, lineHeight: 1.25, mb: 0.5 }}>{selectedRx.med}</Typography>
                  <Typography sx={{ fontSize: 12.5, opacity: 0.88, lineHeight: 1.65, mb: 2 }}>{selectedRx.instructions}</Typography>

                  {/* Stats row */}
                  <Stack direction="row" spacing={0} sx={{ borderTop: '1px solid rgba(255,255,255,0.15)', pt: 1.5 }}>
                    {[
                      { label: 'Quantity', value: selectedRx.qty },
                      { label: 'Refills Left', value: `${selectedRx.refills}` },
                      { label: 'Valid Until', value: selectedRx.expiry },
                    ].map((item, i) => (
                      <Box key={item.label} sx={{
                        flex: 1, pl: i === 0 ? 0 : 2,
                        borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.15)' : 'none',
                      }}>
                        <Typography sx={{ fontSize: 9.5, opacity: 0.65, letterSpacing: 0.5, textTransform: 'uppercase', mb: 0.2 }}>{item.label}</Typography>
                        <Typography sx={{ fontWeight: 800, fontSize: 13.5 }}>{item.value}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Box>

              {/* ── Expired / Inactive warning ── */}
              {selectedRx.status !== 'Active' && (
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 1.25, px: 2, py: 1.25, borderRadius: 2,
                  bgcolor: selectedRx.status === 'Expired'
                    ? alpha(theme.palette.error.main, 0.07)
                    : alpha(theme.palette.text.secondary, 0.06),
                  border: '1px solid',
                  borderColor: selectedRx.status === 'Expired'
                    ? alpha(theme.palette.error.main, 0.2)
                    : alpha(theme.palette.text.secondary, 0.15),
                }}>
                  <WarningIcon sx={{ fontSize: 17, color: selectedRx.status === 'Expired' ? 'error.main' : 'text.secondary', flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 12.5, color: selectedRx.status === 'Expired' ? 'error.main' : 'text.secondary' }}>
                    {selectedRx.status === 'Expired'
                      ? `This prescription expired on ${selectedRx.expiry}. Please consult your doctor for a renewal.`
                      : 'This prescription has been completed.'}
                  </Typography>
                </Box>
              )}

              {/* ── Info grid ── */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25 }}>
                {[
                  { icon: <NoteAltIcon sx={{ fontSize: 15 }} />, label: 'Diagnosis', value: selectedRx.dx, fullWidth: true },
                  { icon: <PersonIcon sx={{ fontSize: 15 }} />, label: 'Prescriber', value: selectedRx.doctor },
                  { icon: <MedicationIcon sx={{ fontSize: 15 }} />, label: 'Department', value: selectedRx.department },
                  { icon: <AccessTimeIcon sx={{ fontSize: 15 }} />, label: 'Issued', value: selectedRx.date },
                  { icon: <AccessTimeIcon sx={{ fontSize: 15 }} />, label: 'Valid Until', value: selectedRx.expiry },
                ].map((item) => (
                  <Card key={item.label} elevation={0} sx={{
                    boxShadow: cardShadow, border: 'none', borderRadius: 2, p: 1.5,
                    gridColumn: item.fullWidth ? '1 / -1' : undefined,
                  }}>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <Box sx={{
                        width: 28, height: 28, borderRadius: 1.5, flexShrink: 0,
                        bgcolor: alpha(pr.main, 0.08), color: pr.main,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {item.icon}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.4, display: 'block' }}>
                          {item.label}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 12.5, lineHeight: 1.4 }}>{item.value}</Typography>
                      </Box>
                    </Stack>
                  </Card>
                ))}
              </Box>

              {/* ── Pharmacy card ── */}
              <Card elevation={0} sx={{ boxShadow: cardShadow, border: 'none', borderRadius: 2, p: 1.75 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{
                    width: 36, height: 36, borderRadius: 2, flexShrink: 0,
                    bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <LocalPharmacyIcon sx={{ fontSize: 19 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.4, display: 'block' }}>
                      Preferred Pharmacy
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 13 }}>{selectedRx.pharmacy}</Typography>
                  </Box>
                  <Chip size="small" label="Preferred"
                    sx={{ fontWeight: 700, fontSize: 10, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', flexShrink: 0 }} />
                </Stack>
              </Card>

            </Box>

            {/* Fixed footer */}
            <Box sx={{
              px: 2, py: 1.25, borderTop: '1px solid', borderColor: 'divider',
              bgcolor: 'background.paper', display: 'flex', gap: 1, flexWrap: 'wrap', flexShrink: 0, alignItems: 'center',
            }}>
              <Button variant="contained" disableElevation size="small"
                disabled={sendingPharmacy || selectedRx.status !== 'Active'}
                onClick={handleSendPharmacy}
                startIcon={<SendIcon sx={{ fontSize: 14 }} />}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12, borderRadius: 2, px: 1.75 }}>
                {sendingPharmacy ? 'Sending…' : 'Send to Pharmacy'}
              </Button>
              <Button variant="outlined" size="small"
                onClick={() => setSnack({ open: true, msg: 'PDF downloaded!', severity: 'success' })}
                startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12, borderRadius: 2, px: 1.75 }}>
                Download PDF
              </Button>
              <Button variant="outlined" size="small"
                onClick={() => setSnack({ open: true, msg: 'Share link copied!', severity: 'info' })}
                startIcon={<ShareIcon sx={{ fontSize: 14 }} />}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12, borderRadius: 2, px: 1.75 }}>
                Share
              </Button>
              <Box sx={{ flex: 1 }} />
              <Button variant="outlined" size="small"
                disabled={rxRefillDone[selectedRx.id] || selectedRx.status !== 'Active'}
                onClick={handleRxRefill}
                startIcon={<RefillIcon sx={{ fontSize: 14 }} />}
                sx={{
                  textTransform: 'none', fontWeight: 700, fontSize: 12, borderRadius: 2, px: 1.75,
                  color: rxRefillDone[selectedRx.id] ? 'success.main' : undefined,
                  borderColor: rxRefillDone[selectedRx.id] ? 'success.main' : undefined,
                }}>
                {rxRefillDone[selectedRx.id] ? 'Requested ✓' : 'Refill Request'}
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* ── Refill Dialog ── */}
      <Dialog open={!!refillDialog} onClose={() => setRefillDialog(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 0.5 }}>Request Refill</DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Send a refill request to your prescribing doctor for:
          </Typography>
          {refillDialog && (
            <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: alpha(pr.main, 0.2), bgcolor: alpha(pr.main, 0.04) }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{refillDialog.name} {refillDialog.dose}</Typography>
              <Typography variant="caption" color="text.secondary">{refillDialog.brand} · {refillDialog.prescriber}</Typography>
            </Box>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
            Your doctor will review and approve the refill within 24-48 hours.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button onClick={() => setRefillDialog(null)} sx={{ textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" disableElevation onClick={handleRefillRequest} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
            Send Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} variant="filled" sx={{ fontWeight: 600 }} onClose={() => setSnack((p) => ({ ...p, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </PatientPortalWorkspaceCard>
  );
}
