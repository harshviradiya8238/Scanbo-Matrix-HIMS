'use client';

import * as React from 'react';
import { Box, Button, Chip, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import { cardShadow } from '@/src/core/theme/tokens';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Store as StoreIcon,
  TaskAlt as TaskAltIcon,
} from '@mui/icons-material';
import PatientPortalWorkspaceCard from './components/PatientPortalWorkspaceCard';
import { PATIENT } from './patient-portal-mock-data';
import { ppSectionCard } from './patient-portal-styles';
import { useRouter } from 'next/navigation';

/* ─── Rich prescription data ─────────────────────────────────── */
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

const STATUS_CFG = {
  Active:    { color: '#2FA77A', bg: 'rgba(47,167,122,0.1)',  border: 'rgba(47,167,122,0.25)'  },
  Completed: { color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.25)' },
  Expired:   { color: '#E77B7B', bg: 'rgba(231,123,123,0.1)', border: 'rgba(231,123,123,0.25)' },
};

const FILTERS = ['All', 'Active', 'Completed', 'Expired'] as const;
type FilterType = typeof FILTERS[number];

const fmt = (d: string) => d;

export default function PatientPortalPrescriptionsPage() {
  const theme = useTheme();
  const router = useRouter();
  const [selected, setSelected] = React.useState<string>(RX_DATA[0].id);
  const [filter, setFilter] = React.useState<FilterType>('All');
  const [sentToPharmacy, setSentToPharmacy] = React.useState<Record<string, boolean>>({});
  const [snack, setSnack] = React.useState<{ open: boolean; msg: string; severity: 'success' | 'info' }>({ open: false, msg: '', severity: 'success' });

  const sectionCard = ppSectionCard(theme);

  const filtered = filter === 'All' ? RX_DATA : RX_DATA.filter((r) => r.status === filter);
  const rx = RX_DATA.find((r) => r.id === selected) ?? null;

  const activeCount = RX_DATA.filter((r) => r.status === 'Active').length;

  const scrollbar = {
    '&::-webkit-scrollbar': { width: 4 },
    '&::-webkit-scrollbar-thumb': { bgcolor: alpha(theme.palette.primary.main, 0.18), borderRadius: 99 },
  };

  const handleSendToPharmacy = (id: string) => {
    setSentToPharmacy((p) => ({ ...p, [id]: true }));
    setSnack({ open: true, msg: 'Prescription sent to pharmacy!', severity: 'success' });
  };

  return (
    <PatientPortalWorkspaceCard current="prescriptions">
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '360px 1fr' },
        gap: 2,
        height: 'calc(100vh - 162px)',
        overflow: 'hidden',
      }}>

        {/* ══ LEFT PANEL ══ */}
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

          {/* Fixed top: stats + filters */}
          <Stack spacing={1.5} sx={{ flexShrink: 0, pb: 1.5 }}>
            {/* Stat tiles */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.25 }}>
              {[
                { label: 'Total',     value: RX_DATA.length,  color: theme.palette.primary.main },
                { label: 'Active',    value: activeCount,     color: theme.palette.success.main },
                { label: 'Expired',   value: RX_DATA.filter((r) => r.status === 'Expired').length, color: theme.palette.error.main },
              ].map((s) => (
                <Card key={s.label} elevation={0} sx={{ p: 1.75, borderRadius: 2, boxShadow: cardShadow, border: 'none', bgcolor: 'background.paper' }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: s.color, lineHeight: 1.1, mb: 0.25 }}>{s.value}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: 11 }}>{s.label}</Typography>
                </Card>
              ))}
            </Box>

            {/* Filter chips */}
            <Box sx={{ display: 'flex', gap: 0.75 }}>
              {FILTERS.map((f) => {
                const active = filter === f;
                return (
                  <Chip key={f} label={f} size="small" onClick={() => setFilter(f)}
                    sx={{
                      fontWeight: 700, fontSize: 12, cursor: 'pointer',
                      bgcolor: active ? alpha(theme.palette.primary.main, 0.14) : 'background.paper',
                      color: active ? 'primary.main' : 'text.secondary',
                      border: '1px solid',
                      borderColor: active ? alpha(theme.palette.primary.main, 0.35) : 'divider',
                    }} />
                );
              })}
            </Box>
          </Stack>

          {/* Scrollable list */}
          <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5, ...scrollbar }}>
            <Stack spacing={1}>
              {filtered.length === 0 && (
                <Box sx={{ py: 5, textAlign: 'center' }}>
                  <LocalPharmacyIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">No prescriptions found</Typography>
                </Box>
              )}
              {filtered.map((r) => {
                const s = STATUS_CFG[r.status];
                const isActive = selected === r.id;
                return (
                  <Box key={r.id} onClick={() => setSelected(r.id)}
                    sx={{
                      p: 2, borderRadius: 2.5, border: '1px solid', cursor: 'pointer',
                      borderColor: isActive ? 'primary.main' : 'divider',
                      bgcolor: isActive ? alpha(theme.palette.primary.main, 0.04) : 'background.paper',
                      transition: 'all 0.15s',
                      '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.03), transform: 'translateX(2px)' },
                    }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                      <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.25 }} noWrap>{r.med}</Typography>
                        <Typography variant="caption" color="text.secondary">{r.doctor}</Typography>
                      </Box>
                      <Chip size="small" label={r.status}
                        sx={{ fontWeight: 700, fontSize: 11, flexShrink: 0, bgcolor: s.bg, color: s.color, border: `1px solid ${s.border}` }} />
                    </Stack>
                    <Stack direction="row" spacing={2}>
                      {[
                        { l: 'Date',    v: fmt(r.date) },
                        { l: 'Qty',     v: r.qty },
                        { l: 'Refills', v: `${r.refills} left` },
                      ].map((x) => (
                        <Box key={x.l}>
                          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10, fontWeight: 600, display: 'block' }}>{x.l}</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: 12 }}>{x.v}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Box>

        {/* ══ RIGHT PANEL ══ */}
        {rx && (
          <Box sx={{
            ...sectionCard,
            bgcolor: 'background.paper',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeSlideIn 0.2s ease',
            '@keyframes fadeSlideIn': { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
          }}>

            {/* Fixed header */}
            <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5, flexShrink: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 1.2, textTransform: 'uppercase' }}>
                    {rx.department}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3, mt: 0.25 }}>{rx.med}</Typography>
                  <Typography variant="caption" color="text.secondary">{rx.doctor}</Typography>
                </Box>
                <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0, mt: 0.5 }} alignItems="center">
                  <Chip size="small" label={rx.status}
                    sx={{ fontWeight: 700, fontSize: 11, bgcolor: STATUS_CFG[rx.status].bg, color: STATUS_CFG[rx.status].color, border: `1px solid ${STATUS_CFG[rx.status].border}` }} />
                  <Tooltip title="Print">
                    <Button size="small" variant="outlined" startIcon={<PrintIcon sx={{ fontSize: 13 }} />}
                      onClick={() => typeof window !== 'undefined' && window.print()}
                      sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12 }}>Print</Button>
                  </Tooltip>
                  <Tooltip title="Close">
                    <Button size="small" variant="text"
                      onClick={() => setSelected('')}
                      sx={{ minWidth: 34, width: 34, height: 34, borderRadius: '50%', p: 0, color: 'text.secondary' }}>
                      <CloseIcon sx={{ fontSize: 18 }} />
                    </Button>
                  </Tooltip>
                </Stack>
              </Stack>
            </Box>

            {/* Scrollable body */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2, ...scrollbar }}>

              {/* ── Prescription Card (℞ styled) ── */}
              <Box sx={{
                p: 2.5, borderRadius: 2.5, mb: 2.5, position: 'relative', overflow: 'hidden',
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                color: 'white',
              }}>
                {/* Decorative circle */}
                <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
                <Box sx={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

                {/* Patient + Rx ID row */}
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.6, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 9, fontWeight: 700 }}>Patient</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'white', mt: 0.1 }}>{PATIENT.name}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ opacity: 0.6, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 9, fontWeight: 700 }}>Rx ID</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'white', fontFamily: 'monospace', mt: 0.1 }}>{rx.id}</Typography>
                  </Box>
                </Stack>

                <Box sx={{ height: '1px', bgcolor: 'rgba(255,255,255,0.15)', mb: 1.75 }} />

                {/* ℞ Medication */}
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'white', mb: 0.5, fontSize: 17 }}>
                  ℞ {rx.med}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, lineHeight: 1.7, mb: 2, fontSize: 13 }}>
                  {rx.instructions}
                </Typography>

                {/* Quick stats */}
                <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                  {[
                    { l: 'Quantity',  v: rx.qty },
                    { l: 'Refills',   v: `${rx.refills} remaining` },
                    { l: 'Expires',   v: rx.expiry },
                  ].map((x) => (
                    <Box key={x.l}>
                      <Typography variant="caption" sx={{ opacity: 0.55, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{x.l}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'white', mt: 0.15 }}>{x.v}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>

              {/* Detail rows */}
              <Stack spacing={0}>
                {[
                  { l: 'Diagnosis',  v: rx.dx },
                  { l: 'Pharmacy',   v: rx.pharmacy },
                  { l: 'Prescriber', v: `${rx.doctor} · ${rx.department}` },
                  { l: 'Issued',     v: rx.date },
                  { l: 'Valid Until', v: rx.expiry },
                ].map((row, i, arr) => (
                  <Stack key={row.l} direction="row" justifyContent="space-between" alignItems="flex-start"
                    sx={{ py: 1.25, borderBottom: i < arr.length - 1 ? '1px solid' : 'none', borderColor: 'rgba(15,23,42,0.06)' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12.5, flexShrink: 0, mr: 2 }}>{row.l}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'right', fontSize: 12.5 }}>{row.v}</Typography>
                  </Stack>
                ))}
              </Stack>

              {/* Pharmacy info banner */}
              <Box sx={{ mt: 2, p: 1.75, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.04), border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.15) }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <StoreIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', fontSize: 11 }}>Preferred Pharmacy</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.1 }}>{rx.pharmacy}</Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>

            {/* Fixed footer actions */}
            <Box sx={{ px: 2.5, py: 1.75, flexShrink: 0, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 1 }}>
                <Button variant="contained" disableElevation size="small"
                  disabled={rx.status !== 'Active' || sentToPharmacy[rx.id]}
                  startIcon={sentToPharmacy[rx.id] ? <TaskAltIcon sx={{ fontSize: 14 }} /> : <StoreIcon sx={{ fontSize: 14 }} />}
                  onClick={() => handleSendToPharmacy(rx.id)}
                  sx={{ textTransform: 'none', fontWeight: 700, py: 1.1, ...(sentToPharmacy[rx.id] && { bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }) }}>
                  {sentToPharmacy[rx.id] ? 'Sent!' : 'Send to Pharmacy'}
                </Button>
                <Button variant="outlined" size="small"
                  startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
                  onClick={() => setSnack({ open: true, msg: `Downloaded: ${rx.id}`, severity: 'success' })}
                  sx={{ textTransform: 'none', fontWeight: 700, py: 1.1 }}>
                  Download PDF
                </Button>
                <Tooltip title="Share with doctor">
                  <Button variant="outlined" size="small"
                    onClick={() => setSnack({ open: true, msg: 'Prescription shared!', severity: 'info' })}
                    sx={{ minWidth: 40, width: 40, height: 40, p: 0, borderRadius: 1.5 }}>
                    <ShareIcon sx={{ fontSize: 17 }} />
                  </Button>
                </Tooltip>
                <Tooltip title="Refill request">
                  <Button variant="outlined" size="small"
                    disabled={rx.status !== 'Active'}
                    onClick={() => { router.push('/patient-portal/medications'); }}
                    sx={{ minWidth: 40, width: 40, height: 40, p: 0, borderRadius: 1.5 }}>
                    <LocalPharmacyIcon sx={{ fontSize: 17 }} />
                  </Button>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} variant="filled" sx={{ fontWeight: 600 }} onClose={() => setSnack((p) => ({ ...p, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </PatientPortalWorkspaceCard>
  );
}
