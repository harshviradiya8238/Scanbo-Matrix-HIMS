'use client';

import * as React from 'react';
import { Box, Button, Chip, Stack, Typography } from '@/src/ui/components/atoms';
import { alpha, useTheme } from '@/src/ui/theme';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import {
  AutorenewOutlined as RefillIcon,
  CheckCircle as CheckCircleIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Search as SearchIcon,
  Send as SendIcon,
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
const rxStatusCfg = (s: RxRecord['status']) =>
  s === 'Active'
    ? { bg: '#DCFCE7', color: '#166534', border: '#86EFAC' }
    : s === 'Expired'
    ? { bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5' }
    : { bg: 'rgba(100,116,139,0.1)', color: '#64748b', border: 'transparent' };

const CAT_COLOR: Record<string, { bg: string; color: string }> = {
  Cardiac:    { bg: '#FEE2E2', color: '#991B1B' },
  Diabetes:   { bg: '#DCFCE7', color: '#166534' },
  Cholesterol:{ bg: '#EDE9FE', color: '#5B21B6' },
  Supplement: { bg: '#FEF3C7', color: '#92400E' },
};

const scrollbar = {
  '&::-webkit-scrollbar': { width: 3 },
  '&::-webkit-scrollbar-thumb': { borderRadius: 3, bgcolor: 'divider' },
};

/* ════════════════════════════════════════════════════════════════════════════ */
export default function PatientPortalMedicationsPage() {
  const theme = useTheme();
  const pr = theme.palette.primary;

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

  /* ── Stats config ── */
  const medStats = [
    { value: activeMeds,                    label: 'Active',      color: pr.main },
    { value: `${takenToday}/${activeMeds}`, label: 'Taken Today', color: theme.palette.text.secondary },
    { value: refillDue,                     label: 'Refill Due',  color: theme.palette.warning.main },
  ];
  const rxStats = [
    { value: RX_DATA.length, label: 'Total',   color: pr.main },
    { value: activeRx,       label: 'Active',  color: theme.palette.success.main },
    { value: expiredRx,      label: 'Expired', color: theme.palette.error.main },
  ];
  const currentStats = tab === 0 ? medStats : rxStats;

  return (
    <PatientPortalWorkspaceCard current="medications" hidePatientBar>
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, gap: '10px', overflow: 'hidden' }}>

        {/* ════ LEFT PANEL (280px) ════ */}
        <Box sx={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '10px', overflow: 'hidden' }}>

          {/* 1 ── Pill tab switcher */}
          <Box sx={{
            bgcolor: 'background.paper', borderRadius: '16px',
            border: '1px solid', borderColor: 'divider',
            p: '6px', display: 'flex', gap: '3px', flexShrink: 0,
          }}>
            {[
              { idx: 0, label: 'My Medications' },
              { idx: 1, label: 'Prescriptions', count: RX_DATA.length },
            ].map(({ idx, label, count }) => (
              <Box key={idx} onClick={() => setTab(idx)} sx={{
                flex: 1, py: '9px', px: 1.25, borderRadius: '12px',
                fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
                textAlign: 'center', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '6px',
                bgcolor: tab === idx ? 'primary.main' : 'transparent',
                color: tab === idx ? '#fff' : 'text.secondary',
                transition: 'all 0.15s',
                '&:hover': { bgcolor: tab === idx ? 'primary.main' : alpha(pr.main, 0.06) },
              }}>
                {label}
                {count !== undefined && (
                  <Box sx={{
                    width: 18, height: 18, borderRadius: '50%',
                    fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: tab === idx ? 'rgba(255,255,255,0.25)' : alpha(theme.palette.text.secondary, 0.1),
                    color: tab === idx ? '#fff' : 'text.disabled',
                  }}>
                    {count}
                  </Box>
                )}
              </Box>
            ))}
          </Box>

          {/* 2 ── Stats mini bar */}
          <Box sx={{
            bgcolor: 'background.paper', borderRadius: '16px',
            border: '1px solid', borderColor: 'divider',
            p: '14px 16px', display: 'flex', flexShrink: 0,
          }}>
            {currentStats.map((s, i) => (
              <Box key={s.label} sx={{
                flex: 1, textAlign: 'center',
                borderLeft: i > 0 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}>
                <Typography sx={{ fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                <Typography sx={{ fontSize: 10.5, color: 'text.disabled', mt: '3px', fontWeight: 500 }}>{s.label}</Typography>
              </Box>
            ))}
          </Box>

          {/* 3 ── Search bar */}
          <Box sx={{
            bgcolor: 'background.paper', borderRadius: '16px',
            border: '1px solid', borderColor: 'divider',
            px: '14px', py: '8px',
            display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0,
          }}>
            <SearchIcon sx={{ fontSize: 13, color: 'text.disabled', flexShrink: 0 }} />
            <Box
              component="input"
              placeholder={tab === 0 ? 'Search medications...' : 'Search prescriptions...'}
              value={tab === 0 ? medSearch : rxSearch}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                tab === 0 ? setMedSearch(e.target.value) : setRxSearch(e.target.value)
              }
              sx={{
                border: 'none', background: 'transparent', outline: 'none',
                fontFamily: 'inherit', fontSize: '12.5px', color: 'text.primary', width: '100%',
                '&::placeholder': { color: '#9AAFBF' },
              }}
            />
          </Box>

          {/* 4 ── Filter pills */}
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ flexShrink: 0 }}>
            {(tab === 0
              ? (['All', 'Active', 'Completed'] as const)
              : (['All', 'Active', 'Completed', 'Expired'] as const)
            ).map((f) => {
              const isOn = (tab === 0 ? medFilter : rxFilter) === f;
              return (
                <Box key={f}
                  onClick={() => tab === 0 ? setMedFilter(f as 'All' | 'Active' | 'Completed') : setRxFilter(f as 'All' | 'Active' | 'Completed' | 'Expired')}
                  sx={{
                    px: '14px', py: '5px', borderRadius: '20px',
                    fontSize: '11.5px', fontWeight: 600, cursor: 'pointer',
                    border: '1.5px solid',
                    borderColor: isOn ? pr.dark : 'divider',
                    bgcolor: isOn ? pr.dark : alpha(theme.palette.grey[100], 0.8),
                    color: isOn ? '#fff' : 'text.secondary',
                    transition: 'all 0.15s',
                    '&:hover': { borderColor: isOn ? pr.dark : pr.main, color: isOn ? '#fff' : pr.main },
                  }}>
                  {f}
                </Box>
              );
            })}
          </Stack>

          {/* 5 ── Scrollable item list */}
          <Box sx={{
            flex: 1, overflowY: 'auto',
            bgcolor: 'background.paper', borderRadius: '22px',
            border: '1px solid', borderColor: 'divider',
            display: 'flex', flexDirection: 'column',
            ...scrollbar,
          }}>
            {tab === 0 ? (
              filteredMeds.length === 0 ? (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                  <Typography variant="body2" color="text.secondary">No medications found.</Typography>
                </Box>
              ) : filteredMeds.map((med) => {
                const isSelected = selectedMed.id === med.id;
                const isTaken = taken[med.id] ?? false;
                const catColor = CAT_COLOR[med.category] ?? { bg: alpha(pr.main, 0.1), color: pr.main };
                return (
                  <Box key={med.id} onClick={() => setSelectedMed(med)} sx={{
                    px: 2, py: '14px',
                    borderBottom: '1px solid #F3F7FB',
                    cursor: 'pointer',
                    bgcolor: isSelected ? alpha(pr.main, 0.06) : 'background.paper',
                    borderLeft: isSelected ? `3px solid ${pr.main}` : '3px solid transparent',
                    transition: 'background 0.12s',
                    '&:hover': { bgcolor: isSelected ? alpha(pr.main, 0.06) : '#F8FBFF' },
                    '&:last-child': { borderBottom: 'none' },
                  }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: '4px' }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: isSelected ? pr.main : 'text.primary' }}>
                        {med.name}
                      </Typography>
                      <Chip size="small" label={med.status} sx={{
                        fontWeight: 700, fontSize: 10.5, flexShrink: 0,
                        bgcolor: med.status === 'Active' ? '#DCFCE7' : alpha(theme.palette.text.secondary, 0.1),
                        color: med.status === 'Active' ? '#166534' : 'text.secondary',
                        border: med.status === 'Active' ? '1.5px solid #86EFAC' : '1.5px solid transparent',
                      }} />
                    </Stack>
                    <Typography sx={{ fontSize: '11.5px', color: 'text.secondary', mb: '6px' }}>
                      {med.dose} · {med.frequency}
                    </Typography>
                    <Box sx={{
                      display: 'inline-block', px: '9px', py: '2px',
                      borderRadius: '5px', fontSize: '10.5px', fontWeight: 600, mb: '8px',
                      bgcolor: catColor.bg, color: catColor.color,
                    }}>
                      {med.category}
                    </Box>
                    {med.status === 'Active' && (
                      <>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: '6px' }}>
                          <Typography sx={{ fontSize: '10.5px', color: 'text.disabled' }}>Refill in {med.daysUntilRefill}d</Typography>
                          <Typography sx={{ fontSize: '10.5px', color: pr.main, fontWeight: 600 }}>{med.refillDate}</Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={Math.max(0, 100 - (med.daysUntilRefill / 90) * 100)}
                          color={med.daysUntilRefill <= 15 ? 'warning' : 'success'}
                          sx={{ height: 4, borderRadius: 99 }}
                        />
                      </>
                    )}
                    {isTaken && (
                      <Chip size="small" label="Taken ✓" sx={{ mt: 0.75, fontWeight: 600, fontSize: 10, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }} />
                    )}
                  </Box>
                );
              })
            ) : (
              filteredRx.length === 0 ? (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                  <Typography variant="body2" color="text.secondary">No prescriptions found.</Typography>
                </Box>
              ) : filteredRx.map((rx) => {
                const isSelected = selectedRx.id === rx.id;
                const sc = rxStatusCfg(rx.status);
                return (
                  <Box key={rx.id} onClick={() => setSelectedRx(rx)} sx={{
                    px: 2, py: '14px',
                    borderBottom: '1px solid #F3F7FB',
                    cursor: 'pointer',
                    bgcolor: isSelected ? alpha(pr.main, 0.06) : 'background.paper',
                    borderLeft: isSelected ? `3px solid ${pr.main}` : '3px solid transparent',
                    transition: 'background 0.12s',
                    '&:hover': { bgcolor: isSelected ? alpha(pr.main, 0.06) : '#F8FBFF' },
                    '&:last-child': { borderBottom: 'none' },
                  }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: '4px' }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: isSelected ? pr.main : 'text.primary', flex: 1, mr: 1 }} noWrap>
                        {rx.med}
                      </Typography>
                      <Chip size="small" label={rx.status} sx={{
                        fontWeight: 700, fontSize: 10.5, flexShrink: 0,
                        bgcolor: sc.bg, color: sc.color,
                        border: `1.5px solid ${sc.border}`,
                      }} />
                    </Stack>
                    <Typography sx={{ fontSize: '11px', color: 'text.disabled', mb: '4px' }}>
                      {rx.doctor} · {rx.department}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Typography sx={{ fontSize: '10.5px', color: 'text.disabled' }}>📅 {rx.date}</Typography>
                      <Typography sx={{ fontSize: '10.5px', color: 'text.disabled' }}>Qty: {rx.qty}</Typography>
                      <Typography sx={{ fontSize: '10.5px', fontWeight: 600, color: rx.refills > 0 ? 'success.main' : 'text.disabled' }}>
                        Refills: {rx.refills}
                      </Typography>
                    </Stack>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>

        {/* ════ RIGHT PANEL ════ */}
        <Box sx={{
          flex: 1, minWidth: 0,
          bgcolor: 'background.paper', borderRadius: '22px',
          border: '1px solid', borderColor: 'divider',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>

          {tab === 0 ? (
            /* ── Medication Detail ── */
            <>
              {/* Header */}
              <Box sx={{
                px: 3, py: 2.5,
                borderBottom: '1px solid', borderColor: 'divider',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                flexShrink: 0,
              }}>
                <Box>
                  <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'text.disabled', mb: '6px' }}>
                    {selectedMed.category}
                  </Typography>
                  <Typography sx={{ fontSize: 20, fontWeight: 700, color: 'text.primary' }}>
                    {selectedMed.name} {selectedMed.dose}
                  </Typography>
                  <Typography sx={{ fontSize: '12.5px', color: 'text.disabled', mt: '4px' }}>
                    {selectedMed.brand} · {selectedMed.prescriber}
                  </Typography>
                </Box>
                <Chip size="small" label={selectedMed.status} sx={{
                  fontWeight: 700, fontSize: 11,
                  bgcolor: selectedMed.status === 'Active' ? '#DCFCE7' : alpha(theme.palette.text.secondary, 0.1),
                  color: selectedMed.status === 'Active' ? '#166534' : 'text.secondary',
                  border: selectedMed.status === 'Active' ? '1.5px solid #86EFAC' : '1.5px solid transparent',
                }} />
              </Box>

              {/* Body */}
              <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: '14px', ...scrollbar }}>
                {/* 4-col info grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '10px' }}>
                  {[
                    { label: 'Frequency', value: selectedMed.frequency },
                    { label: 'Time(s)',    value: selectedMed.times.join(', ') },
                    { label: 'Prescriber', value: selectedMed.prescriber },
                    { label: 'Refill Date', value: selectedMed.refillDate },
                  ].map((item) => (
                    <Box key={item.label} sx={{
                      bgcolor: alpha(theme.palette.grey[100], 0.7),
                      borderRadius: '10px', border: '1px solid', borderColor: 'divider',
                      p: '14px 16px',
                    }}>
                      <Typography sx={{ fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: 'text.disabled', mb: '6px' }}>
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary' }}>{item.value}</Typography>
                    </Box>
                  ))}
                </Box>

                {/* Instructions */}
                <Box sx={{ bgcolor: alpha(theme.palette.grey[100], 0.7), borderRadius: '10px', border: '1px solid', borderColor: 'divider', p: 2 }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: 'text.disabled', mb: '8px' }}>
                    📋 Instructions
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: 'text.primary', lineHeight: 1.6 }}>
                    {selectedMed.instructions}
                  </Typography>
                </Box>

                {/* Side effects */}
                <Box sx={{ bgcolor: alpha(theme.palette.grey[100], 0.7), borderRadius: '10px', border: '1px solid', borderColor: 'divider', p: 2 }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: 'text.disabled', mb: '8px' }}>
                    ⚠️ Possible Side Effects
                  </Typography>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    {selectedMed.sideEffects.map((se) => (
                      <Box key={se} sx={{
                        px: '13px', py: '5px', borderRadius: '20px',
                        fontSize: 12, fontWeight: 600,
                        border: '1.5px solid', borderColor: 'divider',
                        color: 'text.secondary', bgcolor: 'background.paper',
                      }}>
                        {se}
                      </Box>
                    ))}
                  </Stack>
                </Box>

                {/* Taken banner */}
                {taken[selectedMed.id] && (
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    p: 1.5, borderRadius: 2,
                    bgcolor: alpha(theme.palette.success.main, 0.08),
                    border: '1px solid', borderColor: alpha(theme.palette.success.main, 0.2),
                  }}>
                    <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main', fontSize: 13 }}>
                      Marked as taken today
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Footer */}
              <Box sx={{
                px: 3, py: 2,
                borderTop: '1px solid', borderColor: 'divider',
                display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0,
              }}>
                <Button variant="contained" disableElevation size="small"
                  disabled={taken[selectedMed.id]}
                  onClick={() => handleMarkTaken(selectedMed.id)}
                  startIcon={<TaskAltIcon sx={{ fontSize: 15 }} />}
                  sx={{ textTransform: 'none', fontWeight: 700, fontSize: 13, py: '11px', px: '22px', borderRadius: '12px' }}>
                  {taken[selectedMed.id] ? 'Taken Today ✓' : 'Mark as Taken'}
                </Button>
                <Button variant="outlined" size="small"
                  disabled={refillDone[selectedMed.id]}
                  onClick={() => setRefillDialog(selectedMed)}
                  startIcon={<RefillIcon sx={{ fontSize: 15 }} />}
                  sx={{
                    textTransform: 'none', fontWeight: 700, fontSize: 13, py: '11px', px: '22px', borderRadius: '12px',
                    color: refillDone[selectedMed.id] ? 'success.main' : undefined,
                    borderColor: refillDone[selectedMed.id] ? 'success.main' : undefined,
                  }}>
                  {refillDone[selectedMed.id] ? 'Refill Requested' : 'Request Refill'}
                </Button>
              </Box>
            </>
          ) : (
            /* ── Prescription Detail ── */
            <>
              {/* Dark hero header */}
              <Box sx={{ background: pr.dark, px: 3, py: 2.5, flexShrink: 0 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', mb: '4px' }}>
                      Patient
                    </Typography>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{PATIENT.name}</Typography>
                    <Typography sx={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.5)', mt: '2px' }}>
                      ID: {PATIENT.pid} · {PATIENT.age} yrs · {PATIENT.gender}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', mb: '3px' }}>
                      RX ID
                    </Typography>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{selectedRx.id}</Typography>
                    <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', mt: '2px' }}>{selectedRx.date}</Typography>
                  </Box>
                </Stack>
                <Box>
                  <Typography sx={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', mb: '4px' }}>
                    Medication
                  </Typography>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{selectedRx.med}</Typography>
                  <Typography sx={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.6)', mt: '5px', lineHeight: 1.5 }}>
                    {selectedRx.instructions}
                  </Typography>
                </Box>
                {/* Stats row */}
                <Box sx={{
                  display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
                  gap: '1px', bgcolor: 'rgba(255,255,255,0.1)',
                  borderRadius: '10px', overflow: 'hidden', mt: 2,
                }}>
                  {[
                    { label: 'Quantity',    value: selectedRx.qty },
                    { label: 'Refills Left', value: `${selectedRx.refills}` },
                    { label: 'Valid Until', value: selectedRx.expiry },
                  ].map((item) => (
                    <Box key={item.label} sx={{ bgcolor: 'rgba(255,255,255,0.07)', p: '12px 16px' }}>
                      <Typography sx={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', mb: '4px' }}>
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{item.value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Body */}
              <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: '12px', ...scrollbar }}>
                {/* Diagnosis */}
                <Box sx={{ bgcolor: alpha(theme.palette.grey[100], 0.7), borderRadius: '10px', border: '1px solid', borderColor: 'divider', p: '14px 16px' }}>
                  <Typography sx={{ fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: 'text.disabled', mb: '5px' }}>
                    Diagnosis
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary' }}>{selectedRx.dx}</Typography>
                </Box>

                {/* 2-col info grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { label: 'Prescriber',  value: selectedRx.doctor },
                    { label: 'Department',  value: selectedRx.department },
                    { label: 'Issued',      value: selectedRx.date },
                    { label: 'Valid Until', value: selectedRx.expiry },
                  ].map((item) => (
                    <Box key={item.label} sx={{ bgcolor: alpha(theme.palette.grey[100], 0.7), borderRadius: '10px', border: '1px solid', borderColor: 'divider', p: '14px 16px' }}>
                      <Typography sx={{ fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: 'text.disabled', mb: '5px' }}>
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary' }}>{item.value}</Typography>
                    </Box>
                  ))}
                </Box>

                {/* Pharmacy card */}
                <Box sx={{
                  bgcolor: alpha(theme.palette.grey[100], 0.7),
                  borderRadius: '10px', border: '1px solid', borderColor: 'divider',
                  p: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <LocalPharmacyIcon sx={{ fontSize: 18, color: '#16A34A' }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: 'text.disabled', mb: '3px' }}>
                        Preferred Pharmacy
                      </Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary' }}>{selectedRx.pharmacy}</Typography>
                    </Box>
                  </Stack>
                  <Chip size="small" label="Preferred" sx={{ fontWeight: 700, fontSize: 11, bgcolor: '#DCFCE7', border: '1.5px solid #86EFAC', color: '#166534' }} />
                </Box>

                {/* Expired / completed warning */}
                {selectedRx.status !== 'Active' && (
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1.25,
                    px: 2, py: 1.25, borderRadius: 2,
                    bgcolor: selectedRx.status === 'Expired' ? alpha(theme.palette.error.main, 0.07) : alpha(theme.palette.text.secondary, 0.06),
                    border: '1px solid',
                    borderColor: selectedRx.status === 'Expired' ? alpha(theme.palette.error.main, 0.2) : alpha(theme.palette.text.secondary, 0.15),
                  }}>
                    <WarningIcon sx={{ fontSize: 17, color: selectedRx.status === 'Expired' ? 'error.main' : 'text.secondary', flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 12.5, color: selectedRx.status === 'Expired' ? 'error.main' : 'text.secondary' }}>
                      {selectedRx.status === 'Expired'
                        ? `This prescription expired on ${selectedRx.expiry}. Please consult your doctor for a renewal.`
                        : 'This prescription has been completed.'}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Footer */}
              <Box sx={{
                px: 3, py: 2,
                borderTop: '1px solid', borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexShrink: 0,
              }}>
                <Button variant="contained" disableElevation size="small"
                  disabled={sendingPharmacy || selectedRx.status !== 'Active'}
                  onClick={handleSendPharmacy}
                  startIcon={<SendIcon sx={{ fontSize: 14 }} />}
                  sx={{ textTransform: 'none', fontWeight: 700, fontSize: 13, py: '11px', px: '22px', borderRadius: '12px' }}>
                  {sendingPharmacy ? 'Sending…' : 'Send to Pharmacy'}
                </Button>
                <Button variant="outlined" size="small"
                  disabled={rxRefillDone[selectedRx.id] || selectedRx.status !== 'Active'}
                  onClick={handleRxRefill}
                  startIcon={<RefillIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    textTransform: 'none', fontWeight: 700, fontSize: 13, py: '11px', px: '22px', borderRadius: '12px',
                    color: rxRefillDone[selectedRx.id] ? 'success.main' : undefined,
                    borderColor: rxRefillDone[selectedRx.id] ? 'success.main' : undefined,
                  }}>
                  {rxRefillDone[selectedRx.id] ? 'Requested ✓' : 'Refill Request'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>

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
