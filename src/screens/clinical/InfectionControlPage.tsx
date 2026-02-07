'use client';

import * as React from 'react';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Snackbar,
  Alert,
  Stack,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import { Card, StatTile } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { alpha, useTheme } from '@mui/material';
import { getSoftSurface } from '@/src/core/theme/surfaces';
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

const FLOW_STEPS = ['Detect', 'Isolate', 'Notify', 'Audit', 'Close'];

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

export default function InfectionControlPage() {
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const [cases, setCases] = React.useState<InfectionCase[]>(INITIAL_CASES);
  const [isolations, setIsolations] = React.useState<IsolationRoom[]>(INITIAL_ISOLATIONS);
  const [audits, setAudits] = React.useState<AuditRecord[]>(INITIAL_AUDITS);
  const [alerts, setAlerts] = React.useState<AlertItem[]>(INITIAL_ALERTS);
  const [actions, setActions] = React.useState<ActionItem[]>(INITIAL_ACTIONS);
  const [selectedCaseId, setSelectedCaseId] = React.useState<string>(INITIAL_CASES[0]?.id ?? '');
  const [activeStep, setActiveStep] = React.useState(1);
  const [caseDialogOpen, setCaseDialogOpen] = React.useState(false);
  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
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

  return (
    <PageTemplate title="Infection Control" currentPageTitle="Infection Control">
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
                <Button variant="outlined" startIcon={<AssignmentTurnedInIcon />} onClick={() => setAuditDialogOpen(true)}>
                  Log Audit
                </Button>
                <Button variant="contained" startIcon={<AddCircleIcon />} onClick={() => setCaseDialogOpen(true)}>
                  New Case
                </Button>
              </Stack>
            </Stack>
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

        <Grid container spacing={1.5} alignItems="stretch">
          <Grid item xs={12} md={7} sx={{ display: 'flex' }}>
            <Card
              elevation={0}
              sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider', flex: 1 }}
            >
              <Stack spacing={1.25}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Active Cases
                </Typography>
                <Stack spacing={1}>
                  {cases.map((item) => (
                    <Card
                      key={item.id}
                      variant="outlined"
                      sx={{
                        p: 1.25,
                        borderRadius: 1.5,
                        borderColor: item.id === selectedCaseId ? 'primary.main' : 'divider',
                        backgroundColor:
                          item.id === selectedCaseId ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                      }}
                      onClick={() => setSelectedCaseId(item.id)}
                    >
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.patientName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.mrn} · {item.organism} · {item.unit}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            size="small"
                            label={item.risk}
                            color={item.risk === 'High' ? 'error' : item.risk === 'Moderate' ? 'warning' : 'default'}
                          />
                          <Chip
                            size="small"
                            label={item.status}
                            color={item.status === 'Closed' ? 'default' : item.status === 'Monitoring' ? 'info' : 'warning'}
                          />
                          {item.status !== 'Closed' ? (
                            <Button size="small" variant="text" onClick={() => handleResolveCase(item.id)}>
                              Close
                            </Button>
                          ) : null}
                        </Stack>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Updated {item.lastUpdate}
                      </Typography>
                    </Card>
                  ))}
                </Stack>
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
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
            <Card
              elevation={0}
              sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider', flex: 1 }}
            >
              <Stack spacing={1.25}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Response Flow
                </Typography>
                <Grid container spacing={1}>
                  {FLOW_STEPS.map((step, index) => (
                    <Grid key={step} item xs={12} sm={6}>
                      <Button
                        fullWidth
                        size="small"
                        variant={index === activeStep ? 'contained' : 'outlined'}
                        color="primary"
                        onClick={() => setActiveStep(index)}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          borderStyle: index < activeStep ? 'solid' : index === activeStep ? 'solid' : 'dashed',
                        }}
                      >
                        {index + 1}. {step}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
                <Stack spacing={0.75}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircleIcon fontSize="small" color="success" />
                    <Typography variant="body2">4 cases advanced to audit stage today</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CampaignIcon fontSize="small" color="warning" />
                    <Typography variant="body2">2 teams need escalation notifications</Typography>
                  </Stack>
                </Stack>
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
                  Isolation Tracker
                </Typography>
                <Stack spacing={0.9}>
                  {isolations.map((room) => (
                    <Box
                      key={room.id}
                      sx={{
                        p: 1.25,
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: alpha(theme.palette.primary.main, 0.03),
                      }}
                    >
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Room {room.room} · {room.unit}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {room.type} isolation · Started {room.startedAt}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            size="small"
                            label={room.status}
                            color={room.status === 'Active' ? 'warning' : room.status === 'Review' ? 'info' : 'default'}
                          />
                          <Button size="small" variant="text" onClick={() => handleToggleIsolation(room.id)}>
                            {room.status === 'Cleared' ? 'Reopen' : 'Clear'}
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
            <Card
              elevation={0}
              sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider', flex: 1 }}
            >
              <Stack spacing={1.25}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Alerts
                </Typography>
                <Stack spacing={0.9}>
                  {alerts.map((alert) => (
                    <Box
                      key={alert.id}
                      sx={{
                        p: 1.25,
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Stack spacing={0.5}>
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <ReportProblemIcon fontSize="small" color={alert.severity === 'High' ? 'error' : 'warning'} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {alert.title}
                            </Typography>
                          </Stack>
                          <Chip
                            size="small"
                            label={alert.severity}
                            color={alert.severity === 'High' ? 'error' : alert.severity === 'Medium' ? 'warning' : 'default'}
                            variant="outlined"
                          />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {alert.details}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            size="small"
                            label={alert.acknowledged ? 'Acknowledged' : 'Open'}
                            color={alert.acknowledged ? 'success' : 'warning'}
                            variant={alert.acknowledged ? 'filled' : 'outlined'}
                          />
                          {!alert.acknowledged ? (
                            <Button size="small" variant="text" onClick={() => handleAcknowledgeAlert(alert.id)}>
                              Acknowledge
                            </Button>
                          ) : null}
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} md={7} sx={{ display: 'flex' }}>
            <Card
              elevation={0}
              sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider', flex: 1 }}
            >
              <Stack spacing={1.25}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Audit Compliance
                  </Typography>
                  <Button size="small" variant="text" onClick={() => setAuditDialogOpen(true)}>
                    Add Audit
                  </Button>
                </Stack>
                <Stack spacing={0.9}>
                  {audits.map((audit) => (
                    <Box
                      key={audit.id}
                      sx={{
                        p: 1.25,
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: alpha(theme.palette.primary.main, 0.03),
                      }}
                    >
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {audit.ward}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Lead: {audit.lead} · {audit.lastAudit}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={`${audit.compliance}%`}
                          color={audit.compliance >= 90 ? 'success' : 'warning'}
                          variant="outlined"
                        />
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
            <Card
              elevation={0}
              sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider', flex: 1 }}
            >
              <Stack spacing={1.25}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Action Queue
                </Typography>
                <Stack spacing={0.9}>
                  {actions.map((action) => (
                    <Box
                      key={action.id}
                      sx={{
                        p: 1.25,
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {action.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Owner: {action.owner} · Due {action.due}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            size="small"
                            label={action.priority}
                            color={action.priority === 'Urgent' ? 'warning' : 'default'}
                            variant={action.priority === 'Urgent' ? 'filled' : 'outlined'}
                          />
                          <Chip
                            size="small"
                            label={action.status}
                            color={action.status === 'Done' ? 'success' : action.status === 'In Progress' ? 'info' : 'default'}
                          />
                          {action.status !== 'Done' ? (
                            <Button size="small" variant="text" onClick={() => handleCompleteAction(action.id)}>
                              Done
                            </Button>
                          ) : null}
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" startIcon={<CampaignIcon />}>
                    Send Update
                  </Button>
                  <Button variant="outlined" startIcon={<ReportProblemIcon />}>
                    Escalate
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Stack>

      <Dialog open={caseDialogOpen} onClose={() => setCaseDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Infection Case</DialogTitle>
        <DialogContent>
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
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setCaseDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreateCase}>
            Create Case
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={auditDialogOpen} onClose={() => setAuditDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Log Audit</DialogTitle>
        <DialogContent>
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
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setAuditDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleLogAudit}>
            Save Audit
          </Button>
        </DialogActions>
      </Dialog>

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
