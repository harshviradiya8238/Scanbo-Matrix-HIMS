'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Snackbar,
  Alert,
  Stack,
  Divider,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import { Card, CommonDialog, StatTile } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { alpha, useTheme } from '@/src/ui/theme';
import { getSoftSurface } from '@/src/core/theme/surfaces';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { useUser } from '@/src/core/auth/UserContext';
import { usePermission } from '@/src/core/auth/usePermission';
import { canAccessRoute } from '@/src/core/navigation/route-access';
import {
  AddCircle as AddCircleIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  BugReport as BugReportIcon,
  Campaign as CampaignIcon,
  CheckCircle as CheckCircleIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  History as HistoryIcon,
  ReportProblem as ReportProblemIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';

type CaseStatus = 'Active' | 'Monitoring' | 'Closed';
type IsolationStatus = 'Active' | 'Review' | 'Cleared';
type AlertSeverity = 'High' | 'Medium' | 'Low';
type ActionStatus = 'Open' | 'In Progress' | 'Done';

interface InfectionCase {
  id: string;
  patientName: string;
  mrn: string;
  organism: string;
  unit: string;
  status: CaseStatus;
  risk: 'High' | 'Moderate' | 'Low';
  lastUpdate: string;
}

interface IsolationRoom {
  id: string;
  room: string;
  unit: string;
  type: 'Contact' | 'Droplet' | 'Airborne';
  status: IsolationStatus;
  startedAt: string;
}

interface AuditRecord {
  id: string;
  ward: string;
  compliance: number;
  lead: string;
  lastAudit: string;
}

interface AlertItem {
  id: string;
  title: string;
  details: string;
  severity: AlertSeverity;
  acknowledged: boolean;
}

interface ActionItem {
  id: string;
  label: string;
  owner: string;
  due: string;
  status: ActionStatus;
  priority: 'Urgent' | 'Routine';
}

interface CaseTimelineItem {
  id: string;
  label: string;
  time: string;
  status: 'Done' | 'Pending';
}

interface UnitRiskItem {
  id: string;
  unit: string;
  risk: 'High' | 'Moderate' | 'Low';
  activeCases: number;
  trend: 'Up' | 'Flat' | 'Down';
}

interface LabTriggerItem {
  id: string;
  test: string;
  patient: string;
  organism: string;
  collected: string;
  status: 'New' | 'Reviewed';
}

const FLOW_STEPS = ['Detect', 'Isolate', 'Notify', 'Audit', 'Close'];
const FLOW_STEP_DETAILS = [
  'Detect new infections from lab triggers, alerts, and active case lists.',
  'Place patients in isolation and track room status.',
  'Notify teams with alerts and action assignments.',
  'Run compliance audits and review results.',
  'Close cases once actions are complete and isolation is cleared.',
];

function FlowTabPanel({
  value,
  index,
  children,
}: {
  value: number;
  index: number;
  children: React.ReactNode;
}) {
  if (value !== index) {
    return null;
  }

  return <Box sx={{ pt: 2 }}>{children}</Box>;
}

const INITIAL_CASES: InfectionCase[] = [
  {
    id: 'ic-1',
    patientName: 'Aarav Nair',
    mrn: 'MRN-245781',
    organism: 'MRSA',
    unit: 'Ward 3A',
    status: 'Active',
    risk: 'High',
    lastUpdate: '30 min ago',
  },
  {
    id: 'ic-2',
    patientName: 'Meera Joshi',
    mrn: 'MRN-245799',
    organism: 'C. diff',
    unit: 'Ward 1B',
    status: 'Monitoring',
    risk: 'Moderate',
    lastUpdate: '1 hr ago',
  },
  {
    id: 'ic-3',
    patientName: 'Ravi Iyer',
    mrn: 'MRN-245802',
    organism: 'COVID-19',
    unit: 'Isolation Ward',
    status: 'Closed',
    risk: 'Low',
    lastUpdate: 'Yesterday',
  },
];

const INITIAL_ISOLATIONS: IsolationRoom[] = [
  {
    id: 'iso-1',
    room: 'B-12',
    unit: 'Ward 3A',
    type: 'Contact',
    status: 'Active',
    startedAt: '09:30 AM',
  },
  {
    id: 'iso-2',
    room: 'ICU-03',
    unit: 'ICU',
    type: 'Airborne',
    status: 'Review',
    startedAt: '08:10 AM',
  },
  {
    id: 'iso-3',
    room: 'C-05',
    unit: 'Ward 1B',
    type: 'Droplet',
    status: 'Active',
    startedAt: '10:00 AM',
  },
];

const INITIAL_AUDITS: AuditRecord[] = [
  { id: 'au-1', ward: 'Ward 3A', compliance: 92, lead: 'Nurse Priya', lastAudit: 'Today, 9:00 AM' },
  { id: 'au-2', ward: 'ICU', compliance: 88, lead: 'Dr. Alia', lastAudit: 'Yesterday, 4:30 PM' },
  { id: 'au-3', ward: 'Ward 1B', compliance: 95, lead: 'Nurse Kavya', lastAudit: 'Today, 8:15 AM' },
];

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'al-1',
    title: 'Cluster detected in Ward 3A',
    details: 'Two patients screened positive for MRSA within 24 hours.',
    severity: 'High',
    acknowledged: false,
  },
  {
    id: 'al-2',
    title: 'Isolation review pending',
    details: 'Airborne isolation in ICU-03 requires consultant review.',
    severity: 'Medium',
    acknowledged: false,
  },
  {
    id: 'al-3',
    title: 'Hand hygiene dip',
    details: 'Compliance dropped to 84% in Ward 1B.',
    severity: 'Low',
    acknowledged: true,
  },
];

const INITIAL_ACTIONS: ActionItem[] = [
  {
    id: 'ac-1',
    label: 'Escalate cluster review for Ward 3A',
    owner: 'Dr. Nisha Rao',
    due: 'Today 2:00 PM',
    status: 'In Progress',
    priority: 'Urgent',
  },
  {
    id: 'ac-2',
    label: 'Send isolation checklist to Ward 1B',
    owner: 'Nurse Priya',
    due: 'Today 4:00 PM',
    status: 'Open',
    priority: 'Routine',
  },
  {
    id: 'ac-3',
    label: 'Close resolved COVID-19 case',
    owner: 'Dr. Anand',
    due: 'Tomorrow 9:00 AM',
    status: 'Open',
    priority: 'Routine',
  },
];

const CASE_TIMELINES: Record<string, CaseTimelineItem[]> = {
  'ic-1': [
    { id: 'tl-1', label: 'MRSA positive culture', time: 'Today, 08:20 AM', status: 'Done' },
    { id: 'tl-2', label: 'Isolation initiated', time: 'Today, 09:30 AM', status: 'Done' },
    { id: 'tl-3', label: 'Contact tracing scheduled', time: 'Today, 12:00 PM', status: 'Pending' },
  ],
  'ic-2': [
    { id: 'tl-4', label: 'C. diff confirmation', time: 'Today, 07:45 AM', status: 'Done' },
    { id: 'tl-5', label: 'Environmental cleaning audit', time: 'Today, 03:30 PM', status: 'Pending' },
  ],
  'ic-3': [
    { id: 'tl-6', label: 'COVID-19 retest negative', time: 'Yesterday, 02:10 PM', status: 'Done' },
    { id: 'tl-7', label: 'Isolation cleared', time: 'Yesterday, 04:00 PM', status: 'Done' },
  ],
};

const UNIT_RISK_OVERVIEW: UnitRiskItem[] = [
  { id: 'ur-1', unit: 'Ward 3A', risk: 'High', activeCases: 3, trend: 'Up' },
  { id: 'ur-2', unit: 'ICU', risk: 'Moderate', activeCases: 2, trend: 'Flat' },
  { id: 'ur-3', unit: 'Ward 1B', risk: 'Low', activeCases: 1, trend: 'Down' },
];

const LAB_TRIGGERS: LabTriggerItem[] = [
  { id: 'lb-1', test: 'Blood Culture', patient: 'Aarav Nair', organism: 'MRSA', collected: '08:10 AM', status: 'New' },
  { id: 'lb-2', test: 'Stool Toxin', patient: 'Meera Joshi', organism: 'C. diff', collected: '07:30 AM', status: 'Reviewed' },
  { id: 'lb-3', test: 'PCR Panel', patient: 'Ravi Iyer', organism: 'COVID-19', collected: 'Yesterday', status: 'Reviewed' },
];

export default function InfectionControlPage() {
  const router = useRouter();
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const mrnParam = useMrnParam();
  const { permissions } = useUser();
  const can = usePermission();
  const [cases, setCases] = React.useState<InfectionCase[]>(INITIAL_CASES);
  const [isolations, setIsolations] = React.useState<IsolationRoom[]>(INITIAL_ISOLATIONS);
  const [audits, setAudits] = React.useState<AuditRecord[]>(INITIAL_AUDITS);
  const [alerts, setAlerts] = React.useState<AlertItem[]>(INITIAL_ALERTS);
  const [actions, setActions] = React.useState<ActionItem[]>(INITIAL_ACTIONS);
  const [selectedCaseId, setSelectedCaseId] = React.useState<string>(INITIAL_CASES[0]?.id ?? '');
  const [activeTab, setActiveTab] = React.useState(0);
  const [caseDialogOpen, setCaseDialogOpen] = React.useState(false);
  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
  const [mrnApplied, setMrnApplied] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [caseForm, setCaseForm] = React.useState({
    patientName: '',
    mrn: '',
    organism: '',
    unit: '',
    risk: 'Moderate',
  });

  const [auditForm, setAuditForm] = React.useState({
    ward: '',
    compliance: '90',
    lead: '',
  });

  const selectedCase = cases.find((item) => item.id === selectedCaseId) ?? cases[0];
  const caseTimeline = CASE_TIMELINES[selectedCase?.id ?? ''] ?? [];
  const closedCases = cases.filter((item) => item.status === 'Closed');
  const flowMrn = selectedCase?.mrn ?? mrnParam;
  const pageSubtitle = formatPatientLabel(selectedCase?.patientName, flowMrn);
  const withMrn = React.useCallback(
    (route: string) => (flowMrn ? `${route}?mrn=${flowMrn}` : route),
    [flowMrn]
  );

  React.useEffect(() => {
    if (!mrnParam || mrnApplied) return;
    const match = cases.find((item) => item.mrn === mrnParam);
    if (match) {
      setSelectedCaseId(match.id);
    }
    setMrnApplied(true);
  }, [mrnParam, mrnApplied, cases]);

  const handleResolveCase = (caseId: string) => {
    setCases((prev) =>
      prev.map((item) => (item.id === caseId ? { ...item, status: 'Closed', lastUpdate: 'Just now' } : item))
    );
    setSnackbar({ open: true, message: 'Case marked as closed.', severity: 'success' });
  };

  const handleToggleIsolation = (roomId: string) => {
    setIsolations((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? { ...room, status: room.status === 'Cleared' ? 'Active' : 'Cleared' }
          : room
      )
    );
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert))
    );
    setSnackbar({ open: true, message: 'Alert acknowledged.', severity: 'info' });
  };

  const handleCompleteAction = (actionId: string) => {
    setActions((prev) =>
      prev.map((action) => (action.id === actionId ? { ...action, status: 'Done' } : action))
    );
    setSnackbar({ open: true, message: 'Action completed.', severity: 'success' });
  };

  const handleCreateCase = () => {
    const newCase: InfectionCase = {
      id: `ic-${Date.now()}`,
      patientName: caseForm.patientName || 'New Patient',
      mrn: caseForm.mrn || 'MRN-NEW',
      organism: caseForm.organism || 'Unknown organism',
      unit: caseForm.unit || 'General Ward',
      status: 'Active',
      risk: caseForm.risk as InfectionCase['risk'],
      lastUpdate: 'Just now',
    };
    setCases((prev) => [newCase, ...prev]);
    setSelectedCaseId(newCase.id);
    setCaseDialogOpen(false);
    setCaseForm({ patientName: '', mrn: '', organism: '', unit: '', risk: 'Moderate' });
    setSnackbar({ open: true, message: 'New case created.', severity: 'success' });
  };

  const handleLogAudit = () => {
    const newAudit: AuditRecord = {
      id: `au-${Date.now()}`,
      ward: auditForm.ward || 'General Ward',
      compliance: Number(auditForm.compliance) || 90,
      lead: auditForm.lead || 'Team Lead',
      lastAudit: 'Just now',
    };
    setAudits((prev) => [newAudit, ...prev]);
    setAuditDialogOpen(false);
    setAuditForm({ ward: '', compliance: '90', lead: '' });
    setSnackbar({ open: true, message: 'Audit logged successfully.', severity: 'success' });
  };

  const canNavigate = React.useCallback(
    (route: string) => canAccessRoute(route, permissions),
    [permissions]
  );
  const canWrite = can('clinical.infection_control.write');

  const handlePrevTab = () => setActiveTab((prev) => Math.max(0, prev - 1));
  const handleNextTab = () => setActiveTab((prev) => Math.min(prev + 1, FLOW_STEPS.length - 1));
  const isFirstTab = activeTab === 0;
  const isLastTab = activeTab === FLOW_STEPS.length - 1;

  return (
    <PageTemplate title="Infection Control" subtitle={pageSubtitle} currentPageTitle="Infection Control">
      <Stack spacing={1.5}>
        <Card
          elevation={0}
          sx={{
            p: 1.75,
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: softSurface,
          }}
        >
          <Stack spacing={1.25}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip size="small" label="Clinical" color="primary" />
              <Chip size="small" label="Infection Prevention" variant="outlined" />
              <Chip size="small" label="Implemented" color="success" variant="filled" />
            </Stack>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
            >
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Infection Control
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Track cases, manage isolation, run audits, and coordinate safety actions.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<AssignmentTurnedInIcon />}
                  disabled={!canWrite}
                  onClick={() => setAuditDialogOpen(true)}
                >
                  Log Audit
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddCircleIcon />}
                  disabled={!canWrite}
                  onClick={() => setCaseDialogOpen(true)}
                >
                  New Case
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Card>

        <Card
          elevation={0}
          sx={{
            p: 1.75,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack spacing={1.25}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.25}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Infection Control Flow
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Step {activeTab + 1} of {FLOW_STEPS.length}: {FLOW_STEPS[activeTab]} · {FLOW_STEP_DETAILS[activeTab]}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button variant="text" onClick={() => setActiveTab(0)}>
                  Start
                </Button>
                <Button variant="outlined" onClick={handlePrevTab} disabled={isFirstTab}>
                  Previous
                </Button>
                <Button variant="contained" onClick={handleNextTab} disabled={isLastTab}>
                  Next
                </Button>
              </Stack>
            </Stack>
            <Tabs
              value={activeTab}
              onChange={(_, value: number) => setActiveTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                minHeight: 44,
                '& .MuiTab-root': {
                  minHeight: 44,
                  textTransform: 'none',
                  fontWeight: 600,
                },
              }}
            >
              <Tab icon={<BugReportIcon fontSize="small" />} iconPosition="start" label="Detect" />
              <Tab icon={<HealthAndSafetyIcon fontSize="small" />} iconPosition="start" label="Isolate" />
              <Tab icon={<CampaignIcon fontSize="small" />} iconPosition="start" label="Notify" />
              <Tab icon={<AssignmentTurnedInIcon fontSize="small" />} iconPosition="start" label="Audit" />
              <Tab icon={<CheckCircleIcon fontSize="small" />} iconPosition="start" label="Close" />
            </Tabs>
          </Stack>
        </Card>

        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6} md={3}>
            <StatTile
              label="Active Cases"
              value={cases.filter((item) => item.status === 'Active').length}
              subtitle="Under investigation"
              icon={<BugReportIcon />}
              tone="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatTile
              label="Isolation Rooms"
              value={isolations.filter((room) => room.status === 'Active').length}
              subtitle="Currently active"
              icon={<HealthAndSafetyIcon />}
              tone="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatTile
              label="Alerts"
              value={alerts.filter((alert) => !alert.acknowledged).length}
              subtitle="Need attention"
              icon={<WarningAmberIcon />}
              tone="error"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatTile
              label="Compliance"
              value="92%"
              subtitle="Last 7 days"
              icon={<CheckCircleIcon />}
              tone="success"
            />
          </Grid>
        </Grid>

        <Card
          elevation={0}
          sx={{
            p: 1.75,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack spacing={1.25}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Connected Clinical Links
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Jump to related patient workflows while reviewing infections and isolation status.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                disabled={!canNavigate('/patients/profile')}
                onClick={() => router.push(withMrn('/patients/profile'))}
              >
                Patient Profile
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={!canNavigate('/diagnostics/lab/results')}
                onClick={() => router.push(withMrn('/diagnostics/lab/results'))}
              >
                Lab Results
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={!canNavigate('/ipd/beds')}
                onClick={() => router.push(withMrn('/ipd/beds'))}
              >
                IPD Bed Board
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={!canNavigate('/ipd/rounds')}
                onClick={() => router.push(withMrn('/ipd/rounds'))}
              >
                IPD Rounds
              </Button>
            </Box>
          </Stack>
        </Card>

        <FlowTabPanel value={activeTab} index={0}>
          <Stack spacing={1.5}>
            <Card
              elevation={0}
              sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
            >
              <Stack spacing={1.25}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Active Cases
                </Typography>
                <TableContainer
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1.5,
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Patient</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Organism</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Unit</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Risk</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Updated</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cases.map((item) => (
                        <TableRow
                          key={item.id}
                          hover
                          onClick={() => setSelectedCaseId(item.id)}
                          sx={{
                            cursor: 'pointer',
                            backgroundColor:
                              item.id === selectedCaseId ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {item.patientName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.mrn}
                            </Typography>
                          </TableCell>
                          <TableCell>{item.organism}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={item.risk}
                              color={item.risk === 'High' ? 'error' : item.risk === 'Moderate' ? 'warning' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={item.status}
                              color={item.status === 'Closed' ? 'default' : item.status === 'Monitoring' ? 'info' : 'warning'}
                            />
                          </TableCell>
                          <TableCell>{item.lastUpdate}</TableCell>
                          <TableCell align="right">
                            {item.status !== 'Closed' ? (
                              <Button
                                size="small"
                                variant="text"
                                disabled={!canWrite}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleResolveCase(item.id);
                                }}
                              >
                                Close
                              </Button>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {selectedCase ? (
                  <Box
                    sx={{
                      p: 1.25,
                      borderRadius: 1.5,
                      border: '1px dashed',
                      borderColor: 'divider',
                      backgroundColor: alpha(theme.palette.primary.main, 0.03),
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Case Snapshot
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedCase.patientName} · {selectedCase.organism} · {selectedCase.unit}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.75 }} flexWrap="wrap">
                      <Chip size="small" icon={<HistoryIcon />} label={`Updated ${selectedCase.lastUpdate}`} />
                      <Chip size="small" label={`${selectedCase.risk} risk`} variant="outlined" />
                      <Chip size="small" label={`Status: ${selectedCase.status}`} variant="outlined" />
                    </Stack>
                  </Box>
                ) : null}
                <Divider />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Case Timeline
                </Typography>
                <TableContainer
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1.5,
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Event</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {caseTimeline.map((event) => (
                        <TableRow key={event.id} hover>
                          <TableCell>{event.label}</TableCell>
                          <TableCell>{event.time}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={event.status}
                              color={event.status === 'Done' ? 'success' : 'warning'}
                              variant={event.status === 'Done' ? 'filled' : 'outlined'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                      {caseTimeline.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3}>
                            <Typography variant="caption" color="text.secondary">
                              No timeline events logged.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Stack>
            </Card>

            <Grid container spacing={1.5} alignItems="stretch">
              <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
                <Card
                  elevation={0}
                  sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider', flex: 1 }}
                >
                  <Stack spacing={1.25}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Lab Triggers
                    </Typography>
                    <TableContainer
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1.5,
                      }}
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Test</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Patient</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Organism</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Collected</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {LAB_TRIGGERS.map((item) => (
                            <TableRow key={item.id} hover>
                              <TableCell>{item.test}</TableCell>
                              <TableCell>{item.patient}</TableCell>
                              <TableCell>{item.organism}</TableCell>
                              <TableCell>{item.collected}</TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={item.status}
                                  color={item.status === 'New' ? 'warning' : 'success'}
                                  variant={item.status === 'New' ? 'filled' : 'outlined'}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Stack>
                </Card>
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
                <Card
                  elevation={0}
                  sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider', flex: 1 }}
                >
                  <Stack spacing={1.25}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Unit Risk Overview
                    </Typography>
                    <TableContainer
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1.5,
                      }}
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Unit</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Active Cases</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Trend</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Risk</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {UNIT_RISK_OVERVIEW.map((unit) => (
                            <TableRow key={unit.id} hover>
                              <TableCell>{unit.unit}</TableCell>
                              <TableCell>{unit.activeCases}</TableCell>
                              <TableCell>{unit.trend}</TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={unit.risk}
                                  color={unit.risk === 'High' ? 'error' : unit.risk === 'Moderate' ? 'warning' : 'default'}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          </Stack>
        </FlowTabPanel>

        <FlowTabPanel value={activeTab} index={1}>
          <Card
            elevation={0}
            sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
          >
            <Stack spacing={1.25}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Isolation Tracker
              </Typography>
              <TableContainer
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Room</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Unit</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Started</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isolations.map((room) => (
                      <TableRow key={room.id} hover>
                        <TableCell>{room.room}</TableCell>
                        <TableCell>{room.unit}</TableCell>
                        <TableCell>{room.type}</TableCell>
                        <TableCell>{room.startedAt}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={room.status}
                            color={room.status === 'Active' ? 'warning' : room.status === 'Review' ? 'info' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="text"
                            disabled={!canWrite}
                            onClick={() => handleToggleIsolation(room.id)}
                          >
                            {room.status === 'Cleared' ? 'Reopen' : 'Clear'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          </Card>
        </FlowTabPanel>

        <FlowTabPanel value={activeTab} index={2}>
          <Grid container spacing={1.5} alignItems="stretch">
            <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
              <Card
                elevation={0}
                sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider', flex: 1 }}
              >
                <Stack spacing={1.25}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Alerts
                  </Typography>
                  <TableContainer
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1.5,
                    }}
                  >
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Alert</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Severity</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="right">
                            Action
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {alerts.map((alert) => (
                          <TableRow key={alert.id} hover>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {alert.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {alert.details}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={alert.severity}
                                color={alert.severity === 'High' ? 'error' : alert.severity === 'Medium' ? 'warning' : 'default'}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={alert.acknowledged ? 'Acknowledged' : 'Open'}
                                color={alert.acknowledged ? 'success' : 'warning'}
                                variant={alert.acknowledged ? 'filled' : 'outlined'}
                              />
                            </TableCell>
                            <TableCell align="right">
                              {!alert.acknowledged ? (
                                <Button
                                  size="small"
                                  variant="text"
                                  disabled={!canWrite}
                                  onClick={() => handleAcknowledgeAlert(alert.id)}
                                >
                                  Acknowledge
                                </Button>
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  -
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
              <Card
                elevation={0}
                sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider', flex: 1 }}
              >
                <Stack spacing={1.25}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Action Queue
                  </Typography>
                  <TableContainer
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1.5,
                    }}
                  >
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Owner</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Due</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="right">
                            Action
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {actions.map((action) => (
                          <TableRow key={action.id} hover>
                            <TableCell>{action.label}</TableCell>
                            <TableCell>{action.owner}</TableCell>
                            <TableCell>{action.due}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={action.priority}
                                color={action.priority === 'Urgent' ? 'warning' : 'default'}
                                variant={action.priority === 'Urgent' ? 'filled' : 'outlined'}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={action.status}
                                color={action.status === 'Done' ? 'success' : action.status === 'In Progress' ? 'info' : 'default'}
                              />
                            </TableCell>
                            <TableCell align="right">
                              {action.status !== 'Done' ? (
                                <Button
                                  size="small"
                                  variant="text"
                                  disabled={!canWrite}
                                  onClick={() => handleCompleteAction(action.id)}
                                >
                                  Done
                                </Button>
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  -
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" startIcon={<CampaignIcon />} disabled={!canWrite}>
                      Send Update
                    </Button>
                    <Button variant="outlined" startIcon={<ReportProblemIcon />} disabled={!canWrite}>
                      Escalate
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </FlowTabPanel>

        <FlowTabPanel value={activeTab} index={3}>
          <Card
            elevation={0}
            sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
          >
            <Stack spacing={1.25}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Audit Compliance
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  disabled={!canWrite}
                  onClick={() => setAuditDialogOpen(true)}
                >
                  Add Audit
                </Button>
              </Stack>
              <Stack spacing={0.9}>
                <TableContainer
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1.5,
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Ward</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Lead</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Last Audit</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Compliance</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {audits.map((audit) => (
                        <TableRow key={audit.id} hover>
                          <TableCell>{audit.ward}</TableCell>
                          <TableCell>{audit.lead}</TableCell>
                          <TableCell>{audit.lastAudit}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={`${audit.compliance}%`}
                              color={audit.compliance >= 90 ? 'success' : 'warning'}
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Stack>
            </Stack>
          </Card>
        </FlowTabPanel>

        <FlowTabPanel value={activeTab} index={4}>
          <Grid container spacing={1.5} alignItems="stretch">
            <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
              <Card
                elevation={0}
                sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider', flex: 1 }}
              >
                <Stack spacing={1.25}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Close Case
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Resolve the selected case once isolation and actions are complete.
                  </Typography>
                  {selectedCase ? (
                    <Box
                      sx={{
                        p: 1.25,
                        borderRadius: 1.5,
                        border: '1px dashed',
                        borderColor: 'divider',
                        backgroundColor: alpha(theme.palette.success.main, 0.05),
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selectedCase.patientName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {selectedCase.organism} · {selectedCase.unit}
                      </Typography>
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mt: 0.75 }}>
                        <Chip size="small" label={`${selectedCase.risk} risk`} variant="outlined" />
                        <Chip
                          size="small"
                          label={selectedCase.status}
                          color={selectedCase.status === 'Closed' ? 'default' : 'warning'}
                        />
                      </Stack>
                    </Box>
                  ) : null}
                  <Button
                    variant="contained"
                    disabled={!canWrite || !selectedCase || selectedCase.status === 'Closed'}
                    onClick={() => {
                      if (selectedCase) {
                        handleResolveCase(selectedCase.id);
                      }
                    }}
                  >
                    Close Case
                  </Button>
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} md={7} sx={{ display: 'flex' }}>
              <Card
                elevation={0}
                sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider', flex: 1 }}
              >
                <Stack spacing={1.25}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Closed Cases
                  </Typography>
                  <TableContainer
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1.5,
                    }}
                  >
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Patient</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Organism</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Unit</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Updated</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {closedCases.map((item) => (
                          <TableRow key={item.id} hover>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.patientName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.mrn}
                              </Typography>
                            </TableCell>
                            <TableCell>{item.organism}</TableCell>
                            <TableCell>{item.unit}</TableCell>
                            <TableCell>{item.lastUpdate}</TableCell>
                          </TableRow>
                        ))}
                        {closedCases.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4}>
                              <Typography variant="caption" color="text.secondary">
                                No closed cases yet.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </FlowTabPanel>
      </Stack>

      <CommonDialog
        open={caseDialogOpen}
        onClose={() => setCaseDialogOpen(false)}
        title="New Infection Case"
        maxWidth="sm"
        content={
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              label="Patient Name"
              value={caseForm.patientName}
              onChange={(event) => setCaseForm((prev) => ({ ...prev, patientName: event.target.value }))}
            />
            <TextField
              label="MRN"
              value={caseForm.mrn}
              onChange={(event) => setCaseForm((prev) => ({ ...prev, mrn: event.target.value }))}
            />
            <TextField
              label="Organism"
              value={caseForm.organism}
              onChange={(event) => setCaseForm((prev) => ({ ...prev, organism: event.target.value }))}
            />
            <TextField
              label="Unit / Ward"
              value={caseForm.unit}
              onChange={(event) => setCaseForm((prev) => ({ ...prev, unit: event.target.value }))}
            />
            <TextField
              select
              label="Risk Level"
              value={caseForm.risk}
              onChange={(event) => setCaseForm((prev) => ({ ...prev, risk: event.target.value }))}
            >
              {['High', 'Moderate', 'Low'].map((risk) => (
                <MenuItem key={risk} value={risk}>
                  {risk}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        }
        actions={
          <>
            <Button variant="text" onClick={() => setCaseDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" disabled={!canWrite} onClick={handleCreateCase}>
              Create Case
            </Button>
          </>
        }
      />

      <CommonDialog
        open={auditDialogOpen}
        onClose={() => setAuditDialogOpen(false)}
        title="Log Audit"
        maxWidth="sm"
        content={
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              label="Ward / Unit"
              value={auditForm.ward}
              onChange={(event) => setAuditForm((prev) => ({ ...prev, ward: event.target.value }))}
            />
            <TextField
              label="Audit Lead"
              value={auditForm.lead}
              onChange={(event) => setAuditForm((prev) => ({ ...prev, lead: event.target.value }))}
            />
            <TextField
              label="Compliance %"
              value={auditForm.compliance}
              onChange={(event) => setAuditForm((prev) => ({ ...prev, compliance: event.target.value }))}
            />
          </Stack>
        }
        actions={
          <>
            <Button variant="text" onClick={() => setAuditDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" disabled={!canWrite} onClick={handleLogAudit}>
              Save Audit
            </Button>
          </>
        }
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageTemplate>
  );
}
