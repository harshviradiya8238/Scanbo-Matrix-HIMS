'use client';

import * as React from 'react';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
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
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { CommonTabs, StatTile } from '@/src/ui/components/molecules';
import PatientGlobalHeader from '@/src/ui/components/molecules/PatientGlobalHeader';
import { 
  EnterprisePatientSelection, 
  EnterpriseGlassCard, 
  EnterpriseGradientBox,
  EnterpriseStatusChip
} from '@/src/screens/clinical/components/EnterpriseUi';
import { alpha, useTheme } from '@/src/ui/theme';
import { type GlobalPatient, GLOBAL_PATIENTS } from '@/src/mocks/global-patients';
import {
  Inbox as InboxIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  MedicalServices as MedicalServicesIcon,
  NoteAdd as NoteAddIcon,
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  TrendingDown as TrendingDownIcon,
  Add as AddIcon
} from '@mui/icons-material';

type HyperspaceTab = 'workspace' | 'in-basket' | 'schedule' | 'patients';

const TABS: Array<{ id: HyperspaceTab; label: string }> = [
  { id: 'workspace', label: 'Home View' },
  { id: 'in-basket', label: 'In-Basket (8)' },
  { id: 'schedule', label: "Today's Clinic" },
  { id: 'patients', label: 'My Patients' },
];

const IN_BASKET_ITEMS = [
  { id: 'ib1', type: 'Result', from: 'Lab', title: 'Critical K+ 2.8', patient: 'Ravi Iyer', time: '09:15', urgent: true },
  { id: 'ib2', type: 'Consult', from: 'Cardiology', title: 'Consult requested', patient: 'Aarav Nair', time: '08:50', urgent: false },
  { id: 'ib3', type: 'Refill', from: 'Pharmacy', title: 'Metformin 500mg request', patient: 'Pooja Menon', time: '07:30', urgent: false },
  { id: 'ib4', type: 'Message', from: 'Nurse Priya', title: 'Vitals stable post-op', patient: 'Meera Joshi', time: 'Yesterday', urgent: false },
];

const TODAY_SCHEDULE = [
  { time: '09:00', patient: 'Aarav Nair', mrn: 'MRN-245781', type: 'Routine F/U', status: 'Completed' },
  { time: '09:30', patient: 'Meera Joshi', mrn: 'MRN-245799', type: 'New Patient', status: 'In Progress' },
  { time: '10:00', patient: 'Pooja Menon', mrn: 'MRN-246002', type: 'Procedure Review', status: 'Waiting' },
  { time: '11:00', patient: 'Vikram Bedi', mrn: 'MRN-246003', type: 'Initial Consult', status: 'Scheduled' },
];

export default function HyperspacePage() {
  const theme = useTheme();
  const [tab, setTab] = React.useState<HyperspaceTab>('workspace');
  const [selectedPatient, setSelectedPatient] = React.useState<GlobalPatient | null>(null);

  if (!selectedPatient) {
    return (
      <PageTemplate title="Hyperspace" subtitle="Clinician Dashboard" overline="EMR / Unified">
        <Stack spacing={4}>
          <EnterpriseGlassCard sx={{ p: 4, borderRadius: 5, border: 'none', background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, #fff 100%)` }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.dark', mb: 1 }}>Welcome, Dr. Sharma</Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                  You have <span style={{ fontWeight: 800, color: theme.palette.error.main }}>3 urgent</span> in-basket items and 8 patients scheduled today.
                </Typography>
              </Box>
              <Avatar sx={{ width: 80, height: 80, fontSize: '1.5rem', bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 800, border: '2px solid', borderColor: 'primary.main' }}>
                KS
              </Avatar>
            </Stack>
          </EnterpriseGlassCard>

          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, ml: 1 }}>Active Workspace</Typography>
              <EnterprisePatientSelection 
                title="" 
                subtitle="Select from your worklist or search for any patient in the database"
                onSelect={setSelectedPatient}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, ml: 1 }}>Critical Alerts</Typography>
              <Stack spacing={2}>
                {IN_BASKET_ITEMS.filter(ib => ib.urgent).map(ib => (
                  <Paper key={ib.id} elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.error.main, 0.04), border: '1px solid', borderColor: alpha(theme.palette.error.main, 0.2) }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <NotificationsIcon sx={{ color: 'error.main' }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'error.dark' }}>{ib.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{ib.patient} • {ib.from}</Typography>
                      </Box>
                      <Button variant="outlined" size="small" color="error" sx={{ borderRadius: 2, fontWeight: 700 }}>Act</Button>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Hyperspace"
      subtitle="Unified Workspace"
      overline="EMR / Workspace"
    >
      <Stack spacing={3}>
        {/* ── Premium Header ────────────────────────────────────────── */}
        <EnterpriseGlassCard sx={{ p: 0, overflow: 'hidden', border: 'none' }}>
          <PatientGlobalHeader
            variant="opd"
            patientName={selectedPatient.name}
            mrn={selectedPatient.mrn}
            ageGender={selectedPatient.ageGender}
            primaryContext={`Attending: Dr. Sharma`}
            providerLabel="Last Encounter"
            providerName={selectedPatient.lastVisit}
            summaryItems={[
              { label: 'Status', value: selectedPatient.status },
              { label: 'Problem List', value: 'Hypertension, T2DM' },
              { label: 'Pending Orders', value: '2 Lab, 1 Rx' },
              { label: 'Recent Lab', value: 'HbA1c 7.2' },
            ]}
            actions={
              <Stack direction="row" spacing={1}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => setSelectedPatient(null)}
                  startIcon={<CloseIcon />}
                  sx={{ borderRadius: 2, fontWeight: 700 }}
                >
                  Exit Chart
                </Button>
                <Button 
                  variant="contained" 
                  size="small" 
                  startIcon={<NoteAddIcon />}
                  sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
                >
                  Sign Note
                </Button>
              </Stack>
            }
          />
        </EnterpriseGlassCard>

        {/* ── Workspace Tabs ────────────────────────────────────────── */}
        <Stack spacing={2.5}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <CommonTabs tabs={TABS} value={tab} onChange={setTab} />
          </Box>

          {tab === 'workspace' && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Stack spacing={3}>
                  <EnterpriseGradientBox sx={{ p: 4, minHeight: 300 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Patient Glance (Longitudinal View)</Typography>
                    <Grid container spacing={2}>
                      {[
                        { l: 'BP', v: '142/88', t: 'warning' },
                        { l: 'Glucose', v: '112 mg/dL', t: 'success' },
                        { l: 'SpO2', v: '96%', t: 'success' },
                        { l: 'Weight', v: '78.5 kg', t: 'neutral' },
                      ].map(g => (
                        <Grid item xs={6} md={3} key={g.l}>
                          <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1), textAlign: 'center' }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>{g.l}</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 900, color: g.t === 'warning' ? 'warning.dark' : 'text.primary' }}>{g.v}</Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                    <Box sx={{ mt: 4, p: 3, borderRadius: 4, bgcolor: '#fff', border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>Recent Clinical History</Typography>
                      <Stack spacing={2}>
                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                          "Patient reports compliant medication adherence but complains of persistent fatigue in the mornings. Advised repeat thyroid panel."
                        </Typography>
                        <Divider />
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>Last Note by Dr. Kavita Sharma • Mar 18, 2026</Typography>
                      </Stack>
                    </Box>
                  </EnterpriseGradientBox>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Active Problems</Typography>
                      <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                        <Stack spacing={1}>
                          {['Essential Hypertension', 'Type 2 Diabetes Mellitus', 'Hyperlipidemia', 'Chronic Fatigue'].map(p => (
                            <Chip key={p} label={p} variant="outlined" sx={{ borderRadius: 2, fontWeight: 700, color: 'primary.main', border: '1px solid', borderColor: alpha('#1172BA', 0.2) }} />
                          ))}
                        </Stack>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Current Meds</Typography>
                      <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                        <Stack spacing={1}>
                          {['Metformin 500mg BID', 'Amlodipine 5mg QD', 'Atorvastatin 20mg HS'].map(m => (
                            <Typography key={m} variant="body2" sx={{ fontWeight: 700 }}>• {m}</Typography>
                          ))}
                        </Stack>
                      </Paper>
                    </Grid>
                  </Grid>
                </Stack>
              </Grid>

              <Grid item xs={12} md={4}>
                <Stack spacing={3}>
                  <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>Patient Flags</Typography>
                    <Stack spacing={1}>
                      <Alert severity="error" variant="filled" sx={{ borderRadius: 2, fontWeight: 700 }}>Penicillin Allergy</Alert>
                      <Alert severity="warning" variant="filled" sx={{ borderRadius: 2, fontWeight: 700 }}>High Fall Risk</Alert>
                    </Stack>
                  </Paper>

                  <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>Encounter Actions</Typography>
                    <Stack spacing={1}>
                      <Button fullWidth variant="outlined" startIcon={<AssignmentIcon />} sx={{ borderRadius: 2, fontWeight: 700, justifyContent: 'flex-start' }}>Labs & Diagnostics</Button>
                      <Button fullWidth variant="outlined" startIcon={<MedicalServicesIcon />} sx={{ borderRadius: 2, fontWeight: 700, justifyContent: 'flex-start' }}>Prescriptions (Rx)</Button>
                      <Button fullWidth variant="outlined" startIcon={<HistoryIcon />} sx={{ borderRadius: 2, fontWeight: 700, justifyContent: 'flex-start' }}>Patient History</Button>
                    </Stack>
                  </Paper>
                </Stack>
              </Grid>
            </Grid>
          )}

          {tab === 'in-basket' && (
            <EnterpriseGradientBox sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>Message Center</Typography>
              <Stack spacing={2}>
                {IN_BASKET_ITEMS.map((item) => (
                  <Paper
                    key={item.id}
                    sx={{
                      p: 2.5,
                      borderRadius: 4,
                      border: '1px solid',
                      borderColor: item.urgent ? alpha(theme.palette.error.main, 0.2) : 'divider',
                      boxShadow: item.urgent ? `0 4px 12px ${alpha(theme.palette.error.main, 0.08)}` : 'none',
                      transition: 'transform 0.2s',
                      cursor: 'pointer',
                      '&:hover': { transform: 'translateX(6px)', borderColor: 'primary.main' }
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: item.urgent ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.primary.main, 0.1), color: item.urgent ? 'error.main' : 'primary.main', borderRadius: 2 }}>
                        {item.type === 'Result' ? <AssignmentIcon /> : <InboxIcon />}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: item.urgent ? 'error.dark' : 'text.primary' }}>{item.title}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700 }}>{item.time}</Typography>
                        </Stack>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontWeight: 700 }}>Patient: {item.patient} | From: {item.from}</Typography>
                      </Box>
                      <Button variant="text" size="small" sx={{ fontWeight: 800 }}>Review</Button>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </EnterpriseGradientBox>
          )}

          {tab === 'schedule' && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Clinical Schedule - Today</Typography>
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <Table>
                  <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>TIME</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>PATIENT</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>TYPE</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>STATUS</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>ACTION</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {TODAY_SCHEDULE.map((s, i) => (
                      <TableRow key={i} hover onClick={() => setSelectedPatient(GLOBAL_PATIENTS.find(p => p.mrn === s.mrn) || null)} sx={{ cursor: 'pointer' }}>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'primary.main' }}>{s.time}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>{s.patient}</Typography>
                          <Typography variant="caption" color="text.secondary">{s.mrn}</Typography>
                        </TableCell>
                        <TableCell><Typography variant="body2">{s.type}</Typography></TableCell>
                        <TableCell><EnterpriseStatusChip label={s.status} tone={s.status === 'Completed' ? 'neutral' : s.status === 'In Progress' ? 'active' : 'info'} /></TableCell>
                        <TableCell align="right">
                          <Button size="small" variant="outlined" sx={{ borderRadius: 2, fontWeight: 700 }}>Open Chart</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Stack>
      </Stack>
    </PageTemplate>
  );
}

function TimerIcon(props: any) {
  return <TrendingDownIcon {...props} />;
}
