'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  List,
  Stack,
  Typography,
} from '@/src/ui/components/atoms';
import { Card, StatTile } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { alpha, useTheme } from '@mui/material';
import { getSoftSurface } from '@/src/core/theme/surfaces';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { useUser } from '@/src/core/auth/UserContext';
import { canAccessRoute } from '@/src/core/navigation/route-access';
import {
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  DirectionsWalk as DirectionsWalkIcon,
  LaptopMac as LaptopMacIcon,
  Person as PersonIcon,
  Print as PrintIcon,
  ReportProblem as ReportProblemIcon,
  Search as SearchIcon,
  TaskAlt as TaskAltIcon,
  TouchApp as TouchAppIcon,
} from '@mui/icons-material';

type StationStatus = 'Online' | 'Offline' | 'Maintenance';
type SessionStatus = 'In Progress' | 'Needs Help' | 'Completed';
type StepStatus = 'Done' | 'Current' | 'Pending';

interface KioskStation {
  id: string;
  name: string;
  location: string;
  status: StationStatus;
  queueCount: number;
  lastSync: string;
}

interface CheckInSession {
  id: string;
  patientName: string;
  mrn: string;
  appointmentTime: string;
  step: string;
  status: SessionStatus;
  waitTime: string;
}

interface IntakeStep {
  id: string;
  label: string;
  status: StepStatus;
}

interface StaffTask {
  id: string;
  label: string;
  due: string;
  priority: 'Routine' | 'Urgent';
}

const STATIONS: KioskStation[] = [
  {
    id: 'ks-1',
    name: 'Kiosk A',
    location: 'Main Lobby',
    status: 'Online',
    queueCount: 3,
    lastSync: '2 min ago',
  },
  {
    id: 'ks-2',
    name: 'Kiosk B',
    location: 'OPD Reception',
    status: 'Online',
    queueCount: 1,
    lastSync: '1 min ago',
  },
  {
    id: 'ks-3',
    name: 'Kiosk C',
    location: 'Tower Entrance',
    status: 'Maintenance',
    queueCount: 0,
    lastSync: '12 min ago',
  },
];

const SESSIONS: CheckInSession[] = [
  {
    id: 'ck-101',
    patientName: 'Aarav Nair',
    mrn: 'MRN-245781',
    appointmentTime: '10:10 AM',
    step: 'Insurance Verification',
    status: 'In Progress',
    waitTime: '04 min',
  },
  {
    id: 'ck-102',
    patientName: 'Meera Joshi',
    mrn: 'MRN-245799',
    appointmentTime: '10:20 AM',
    step: 'Consent Signature',
    status: 'Needs Help',
    waitTime: '07 min',
  },
  {
    id: 'ck-103',
    patientName: 'Ravi Iyer',
    mrn: 'MRN-245802',
    appointmentTime: '10:30 AM',
    step: 'Visit Intake',
    status: 'Completed',
    waitTime: '02 min',
  },
];

const INTAKE_STEPS: IntakeStep[] = [
  { id: 'st-1', label: 'Identify Patient', status: 'Done' },
  { id: 'st-2', label: 'Verify Appointment', status: 'Done' },
  { id: 'st-3', label: 'Insurance & ID', status: 'Current' },
  { id: 'st-4', label: 'Medical Intake', status: 'Pending' },
  { id: 'st-5', label: 'Consent & Signature', status: 'Pending' },
  { id: 'st-6', label: 'Print Tokens', status: 'Pending' },
];

const STAFF_TASKS: StaffTask[] = [
  {
    id: 'tsk-1',
    label: 'Approve insurance document for MRN-245781',
    due: '10:12 AM',
    priority: 'Urgent',
  },
  {
    id: 'tsk-2',
    label: 'Assist patient at Kiosk B (signature)',
    due: '10:14 AM',
    priority: 'Routine',
  },
  {
    id: 'tsk-3',
    label: 'Review new registration for MRN-245804',
    due: '10:18 AM',
    priority: 'Routine',
  },
];

export default function WelcomeKioskPage() {
  const router = useRouter();
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const mrnParam = useMrnParam();
  const { permissions } = useUser();
  const [selectedSessionId, setSelectedSessionId] = React.useState(SESSIONS[0]?.id ?? '');
  const [mrnApplied, setMrnApplied] = React.useState(false);

  const selectedSession = React.useMemo(
    () => SESSIONS.find((session) => session.id === selectedSessionId) ?? SESSIONS[0],
    [selectedSessionId]
  );
  const flowMrn = selectedSession?.mrn ?? mrnParam;
  const pageSubtitle = formatPatientLabel(selectedSession?.patientName, flowMrn);
  const withMrn = React.useCallback(
    (route: string) => (flowMrn ? `${route}?mrn=${flowMrn}` : route),
    [flowMrn]
  );

  React.useEffect(() => {
    if (!mrnParam || mrnApplied) return;
    const match = SESSIONS.find((session) => session.mrn === mrnParam);
    if (match) {
      setSelectedSessionId(match.id);
    }
    setMrnApplied(true);
  }, [mrnParam, mrnApplied]);

  const canNavigate = React.useCallback(
    (route: string) => canAccessRoute(route, permissions),
    [permissions]
  );

  return (
    <PageTemplate title="Welcome Kiosk" subtitle={pageSubtitle} currentPageTitle="Welcome Kiosk">
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
              <Chip size="small" label="Front Office / Self Check-in" variant="outlined" />
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
                  Welcome Kiosk
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Streamline patient self check-in with guided intake, document capture, and
                  real-time staff handoff.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<SearchIcon />}
                  disabled={!canNavigate('/patients/registration')}
                  onClick={() => router.push('/patients/registration')}
                >
                  Open Registration
                </Button>
                <Button
                  variant="contained"
                  endIcon={<DirectionsWalkIcon />}
                  disabled={!canNavigate('/appointments/queue')}
                  onClick={() => router.push(withMrn('/appointments/queue'))}
                >
                  Send to OPD Queue
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Card>

        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6} md={3}>
            <StatTile
              label="Active Stations"
              value="2 / 3"
              subtitle="Online kiosks"
              icon={<LaptopMacIcon />}
              tone="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatTile
              label="Check-ins Today"
              value="46"
              subtitle="12 awaiting verification"
              icon={<TouchAppIcon />}
              tone="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatTile
              label="Avg Completion"
              value="4m 18s"
              subtitle="Last 24 hours"
              icon={<AccessTimeIcon />}
              tone="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatTile
              label="Staff Assists"
              value="5"
              subtitle="Needs help now"
              icon={<ReportProblemIcon />}
              tone="primary"
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
              Check-in Handoff
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Continue the selected check-in into OPD workflows with the same MRN context.
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
                disabled={!canNavigate('/appointments/calendar')}
                onClick={() => router.push(withMrn('/appointments/calendar'))}
              >
                Appointment Calendar
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={!canNavigate('/appointments/queue')}
                onClick={() => router.push(withMrn('/appointments/queue'))}
              >
                OPD Queue
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={!canNavigate('/appointments/visit')}
                onClick={() => router.push(withMrn('/appointments/visit'))}
              >
                Start Visit
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={!canNavigate('/patients/documents')}
                onClick={() => router.push('/patients/documents')}
              >
                Documents
              </Button>
            </Box>
          </Stack>
        </Card>

        <Grid container spacing={1.5} alignItems="stretch">
          <Grid item xs={12} md={7} sx={{ display: 'flex' }}>
            <Card
              elevation={0}
              sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider', flex: 1 }}
            >
              <Stack spacing={1.25}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Live Check-ins
                  </Typography>
                  <Chip size="small" label="Realtime" color="success" variant="outlined" />
                </Stack>
                <Stack spacing={1}>
                  {SESSIONS.map((session) => (
                    <Card
                      key={session.id}
                      variant="outlined"
                      onClick={() => setSelectedSessionId(session.id)}
                      sx={{
                        p: 1.25,
                        borderRadius: 1.5,
                        borderColor: session.id === selectedSessionId ? 'primary.main' : 'divider',
                        backgroundColor:
                          session.id === selectedSessionId
                            ? alpha(theme.palette.primary.main, 0.08)
                            : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} justifyContent="space-between">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.16), color: 'primary.main' }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {session.patientName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {session.mrn} · {session.appointmentTime}
                            </Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            size="small"
                            label={session.step}
                            color={session.status === 'Needs Help' ? 'warning' : 'default'}
                            variant="outlined"
                          />
                          <Chip
                            size="small"
                            label={session.status}
                            color={session.status === 'Completed' ? 'success' : session.status === 'Needs Help' ? 'warning' : 'info'}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {session.waitTime}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Card>
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
                  Intake Flow
                </Typography>
                <Grid container spacing={1}>
                  {INTAKE_STEPS.map((step, index) => (
                    <Grid key={step.id} item xs={12} sm={6}>
                      <Button
                        fullWidth
                        size="small"
                        variant={step.status === 'Current' ? 'contained' : 'outlined'}
                        color="primary"
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          borderStyle: step.status === 'Pending' ? 'dashed' : 'solid',
                          justifyContent: 'center',
                        }}
                      >
                        {index + 1}. {step.label}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
                <Divider />
                <Stack spacing={0.75}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircleIcon fontSize="small" color="success" />
                    <Typography variant="body2">Identity verified for 18 check-ins</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ReportProblemIcon fontSize="small" color="warning" />
                    <Typography variant="body2">5 check-ins need staff assistance</Typography>
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
                  Staff Tasks
                </Typography>
                <Stack spacing={0.9}>
                  {STAFF_TASKS.map((task) => (
                    <Box
                      key={task.id}
                      sx={{
                        p: 1.25,
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: alpha(theme.palette.primary.main, 0.03),
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {task.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Due {task.due}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={task.priority}
                          color={task.priority === 'Urgent' ? 'warning' : 'default'}
                          variant={task.priority === 'Urgent' ? 'filled' : 'outlined'}
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
                  Kiosk Stations
                </Typography>
                <List dense disablePadding>
                  {STATIONS.map((station) => (
                    <Box
                      key={station.id}
                      sx={{
                        p: 0.9,
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        mb: 1,
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {station.name}
                            </Typography>
                            <Chip
                              size="small"
                              label={station.status}
                              color={
                                station.status === 'Online'
                                  ? 'success'
                                  : station.status === 'Maintenance'
                                  ? 'warning'
                                  : 'default'
                              }
                              variant={station.status === 'Online' ? 'filled' : 'outlined'}
                            />
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {station.location} · Queue {station.queueCount} · Sync {station.lastSync}
                          </Typography>
                        </Box>
                        <Button size="small" variant="text">
                          Details
                        </Button>
                      </Stack>
                    </Box>
                  ))}
                </List>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex' }}>
            <Card
              elevation={0}
              sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider', flex: 1 }}
            >
              <Stack spacing={1.25}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Quick Actions
                </Typography>
                <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }}>
                  <Button variant="outlined" startIcon={<TaskAltIcon />} fullWidth>
                    Verify Documents
                  </Button>
                  <Button variant="outlined" startIcon={<TouchAppIcon />} fullWidth>
                    Send Intake Link
                  </Button>
                  <Button variant="outlined" startIcon={<PrintIcon />} fullWidth>
                    Print Token Slip
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </PageTemplate>
  );
}
