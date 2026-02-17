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
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { useUser } from '@/src/core/auth/UserContext';
import { usePermission } from '@/src/core/auth/usePermission';
import { canAccessRoute } from '@/src/core/navigation/route-access';
import ModuleHeaderCard from '@/src/screens/clinical/components/ModuleHeaderCard';
import {
  AddCircle as AddCircleIcon,
  Campaign as CampaignIcon,
  CheckCircle as CheckCircleIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Message as MessageIcon,
  Schedule as ScheduleIcon,
  TaskAlt as TaskAltIcon,
} from '@mui/icons-material';

type PlanStatus = 'Active' | 'Paused' | 'Completed';
type CheckInStatus = 'Pending' | 'Sent' | 'Completed';
type Channel = 'App' | 'SMS' | 'Call';
type ResponseStatus = 'New' | 'Reviewed' | 'Escalated';
type EscalationPriority = 'High' | 'Medium';

interface CarePlan {
  id: string;
  patientName: string;
  mrn: string;
  condition: string;
  coach: string;
  nextCheckIn: string;
  completion: number;
  status: PlanStatus;
}

interface CheckInItem {
  id: string;
  title: string;
  channel: Channel;
  due: string;
  status: CheckInStatus;
}

interface ResponseItem {
  id: string;
  patientName: string;
  mrn: string;
  channel: Channel;
  received: string;
  summary: string;
  status: ResponseStatus;
}

interface EscalationItem {
  id: string;
  patientName: string;
  mrn: string;
  reason: string;
  priority: EscalationPriority;
  owner: string;
  due: string;
}

const FLOW_STEPS = [
  'Enroll Patient',
  'Configure Plan',
  'Schedule Check-ins',
  'Monitor Responses',
  'Close Plan',
];
const FLOW_STEP_DETAILS = [
  'Register a patient into a care program and assign an owner.',
  'Set goals, check-in frequency, and plan milestones.',
  'Line up check-ins across app, SMS, or call channels.',
  'Review incoming responses and escalate when needed.',
  'Mark the plan complete when goals are achieved.',
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

const INITIAL_PLANS: CarePlan[] = [
  {
    id: 'cp-1',
    patientName: 'Aarav Nair',
    mrn: 'MRN-245781',
    condition: 'Diabetes Management',
    coach: 'Nurse Priya',
    nextCheckIn: 'Today, 4:30 PM',
    completion: 78,
    status: 'Active',
  },
  {
    id: 'cp-2',
    patientName: 'Meera Joshi',
    mrn: 'MRN-245799',
    condition: 'Post-surgery Recovery',
    coach: 'Coach Anil',
    nextCheckIn: 'Tomorrow, 9:00 AM',
    completion: 52,
    status: 'Active',
  },
  {
    id: 'cp-3',
    patientName: 'Ravi Iyer',
    mrn: 'MRN-245802',
    condition: 'Hypertension Follow-up',
    coach: 'Nurse Kavya',
    nextCheckIn: 'Friday, 11:00 AM',
    completion: 100,
    status: 'Completed',
  },
];

const INITIAL_CHECKINS: CheckInItem[] = [
  { id: 'ci-1', title: 'Medication adherence', channel: 'App', due: 'Today, 5:00 PM', status: 'Pending' },
  { id: 'ci-2', title: 'Blood pressure log', channel: 'SMS', due: 'Tomorrow, 8:00 AM', status: 'Sent' },
  { id: 'ci-3', title: 'Diet plan follow-up', channel: 'Call', due: 'Friday, 10:30 AM', status: 'Pending' },
];

const INITIAL_RESPONSES: ResponseItem[] = [
  {
    id: 'rs-1',
    patientName: 'Aarav Nair',
    mrn: 'MRN-245781',
    channel: 'App',
    received: '15 min ago',
    summary: 'Logged glucose above target for last 2 days.',
    status: 'New',
  },
  {
    id: 'rs-2',
    patientName: 'Meera Joshi',
    mrn: 'MRN-245799',
    channel: 'SMS',
    received: '1 hr ago',
    summary: 'Reports pain score 6/10 post-surgery.',
    status: 'Escalated',
  },
  {
    id: 'rs-3',
    patientName: 'Ravi Iyer',
    mrn: 'MRN-245802',
    channel: 'Call',
    received: 'Yesterday',
    summary: 'Confirmed BP log and medication adherence.',
    status: 'Reviewed',
  },
];

const INITIAL_ESCALATIONS: EscalationItem[] = [
  {
    id: 'es-1',
    patientName: 'Meera Joshi',
    mrn: 'MRN-245799',
    reason: 'Pain score high after discharge',
    priority: 'High',
    owner: 'Coach Anil',
    due: 'Today, 5:00 PM',
  },
  {
    id: 'es-2',
    patientName: 'Aarav Nair',
    mrn: 'MRN-245781',
    reason: 'Glucose trend above target',
    priority: 'Medium',
    owner: 'Nurse Priya',
    due: 'Tomorrow, 10:00 AM',
  },
];

export default function CareCompanionPage() {
  const router = useRouter();
  const theme = useTheme();
  const mrnParam = useMrnParam();
  const { permissions } = useUser();
  const can = usePermission();
  const [activeTab, setActiveTab] = React.useState(0);
  const [plans, setPlans] = React.useState<CarePlan[]>(INITIAL_PLANS);
  const [checkIns, setCheckIns] = React.useState<CheckInItem[]>(INITIAL_CHECKINS);
  const [responses, setResponses] = React.useState<ResponseItem[]>(INITIAL_RESPONSES);
  const [escalations, setEscalations] = React.useState<EscalationItem[]>(INITIAL_ESCALATIONS);
  const [selectedPlanId, setSelectedPlanId] = React.useState<string>(INITIAL_PLANS[0]?.id ?? '');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [mrnApplied, setMrnApplied] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? plans[0];
  const completedPlans = plans.filter((plan) => plan.status === 'Completed');
  const flowMrn = selectedPlan?.mrn ?? mrnParam;
  const pageSubtitle = formatPatientLabel(selectedPlan?.patientName, flowMrn);
  const withMrn = React.useCallback(
    (route: string) => (flowMrn ? `${route}?mrn=${flowMrn}` : route),
    [flowMrn]
  );

  React.useEffect(() => {
    if (!mrnParam || mrnApplied) return;
    const match = plans.find((plan) => plan.mrn === mrnParam);
    if (match) {
      setSelectedPlanId(match.id);
    }
    setMrnApplied(true);
  }, [mrnParam, mrnApplied, plans]);

  const handleTogglePlan = (planId: string) => {
    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.id !== planId || plan.status === 'Completed') return plan;
        return { ...plan, status: plan.status === 'Active' ? 'Paused' : 'Active' };
      })
    );
  };

  const handleCompleteCheckIn = (checkInId: string) => {
    setCheckIns((prev) =>
      prev.map((checkIn) =>
        checkIn.id === checkInId ? { ...checkIn, status: 'Completed' } : checkIn
      )
    );
    setSnackbar({ open: true, message: 'Check-in marked as completed.', severity: 'success' });
  };

  const handleCreatePlan = () => {
    setDialogOpen(false);
    setSnackbar({ open: true, message: 'Care plan created and assigned.', severity: 'success' });
  };

  const handleSendReminder = () => {
    setSnackbar({ open: true, message: 'Reminder sent to selected patients.', severity: 'info' });
  };

  const handleReviewResponse = (responseId: string) => {
    setResponses((prev) =>
      prev.map((response) =>
        response.id === responseId ? { ...response, status: 'Reviewed' } : response
      )
    );
    setSnackbar({ open: true, message: 'Response marked as reviewed.', severity: 'success' });
  };

  const handleEscalationResolved = (escalationId: string) => {
    setEscalations((prev) => prev.filter((item) => item.id !== escalationId));
    setSnackbar({ open: true, message: 'Escalation resolved.', severity: 'success' });
  };

  const handleClosePlan = (planId: string) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId ? { ...plan, status: 'Completed', completion: 100, nextCheckIn: 'Completed' } : plan
      )
    );
    setSnackbar({ open: true, message: 'Plan marked as completed.', severity: 'success' });
  };

  const handlePrevTab = () => setActiveTab((prev) => Math.max(0, prev - 1));
  const handleNextTab = () => setActiveTab((prev) => Math.min(prev + 1, FLOW_STEPS.length - 1));
  const isFirstTab = activeTab === 0;
  const isLastTab = activeTab === FLOW_STEPS.length - 1;

  const canNavigate = React.useCallback(
    (route: string) => canAccessRoute(route, permissions),
    [permissions]
  );
  const canWrite = can('clinical.care_companion.write');

  return (
    <PageTemplate title="Care Companion" subtitle={pageSubtitle} currentPageTitle="Care Companion">
      <Stack spacing={1.5}>
        <ModuleHeaderCard
          title="Care Companion"
          description="Automate patient check-ins, reminders, and follow-ups with guided care plans."
          chips={[
            { label: 'Clinical', color: 'primary' },
            { label: 'Patient Engagement', variant: 'outlined' },
            { label: 'Implemented', color: 'success', variant: 'filled' },
          ]}
          actions={
            <>
              <Button
                variant="outlined"
                startIcon={<CampaignIcon />}
                disabled={!canWrite}
                onClick={handleSendReminder}
              >
                Send Reminder
              </Button>
              <Button
                variant="contained"
                startIcon={<AddCircleIcon />}
                disabled={!canWrite}
                onClick={() => setDialogOpen(true)}
              >
                Create Care Plan
              </Button>
            </>
          }
        />

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
                  Care Companion Flow
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
              <Tab icon={<AddCircleIcon fontSize="small" />} iconPosition="start" label="Enroll Patient" />
              <Tab icon={<TaskAltIcon fontSize="small" />} iconPosition="start" label="Configure Plan" />
              <Tab icon={<ScheduleIcon fontSize="small" />} iconPosition="start" label="Schedule Check-ins" />
              <Tab icon={<MessageIcon fontSize="small" />} iconPosition="start" label="Monitor Responses" />
              <Tab icon={<CheckCircleIcon fontSize="small" />} iconPosition="start" label="Close Plan" />
            </Tabs>
          </Stack>
        </Card>

        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6} md={3}>
            <StatTile
              label="Active Plans"
              value={plans.filter((plan) => plan.status === 'Active').length}
              subtitle="Patients enrolled"
              icon={<FavoriteBorderIcon />}
              tone="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatTile
              label="Pending Check-ins"
              value={checkIns.filter((checkIn) => checkIn.status === 'Pending').length}
              subtitle="Due in 24 hrs"
              icon={<ScheduleIcon />}
              tone="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatTile
              label="Engagement"
              value="82%"
              subtitle="Last 7 days"
              icon={<MessageIcon />}
              tone="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatTile
              label="Completed Plans"
              value={plans.filter((plan) => plan.status === 'Completed').length}
              subtitle="Discharged"
              icon={<CheckCircleIcon />}
              tone="success"
            />
          </Grid>
        </Grid>

        <FlowTabPanel value={activeTab} index={0}>
          <Card
            elevation={0}
            sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
          >
            <Stack spacing={1.25}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Care Plans
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
                      <TableCell sx={{ fontWeight: 700 }}>Condition</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Coach</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Next Check-in</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Progress</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {plans.map((plan) => (
                      <TableRow
                        key={plan.id}
                        hover
                        onClick={() => setSelectedPlanId(plan.id)}
                        sx={{
                          cursor: 'pointer',
                          backgroundColor:
                            plan.id === selectedPlanId ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {plan.patientName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {plan.mrn}
                          </Typography>
                        </TableCell>
                        <TableCell>{plan.condition}</TableCell>
                        <TableCell>{plan.coach}</TableCell>
                        <TableCell>{plan.nextCheckIn}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={`${plan.completion}%`}
                            variant="outlined"
                            color={plan.completion > 70 ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={plan.status}
                            color={plan.status === 'Active' ? 'success' : plan.status === 'Paused' ? 'warning' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {plan.status !== 'Completed' ? (
                            <Button
                              size="small"
                              variant="text"
                              disabled={!canWrite}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleTogglePlan(plan.id);
                              }}
                            >
                              {plan.status === 'Active' ? 'Pause' : 'Resume'}
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
        </FlowTabPanel>

        <FlowTabPanel value={activeTab} index={1}>
          <Grid container spacing={1.5} alignItems="stretch">
            <Grid item xs={12} md={7} sx={{ display: 'flex' }}>
              <Card
                elevation={0}
                sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider', flex: 1 }}
              >
                <Stack spacing={1.25}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Plan Summary
                  </Typography>
                  {selectedPlan ? (
                    <Box
                      sx={{
                        p: 1.25,
                        borderRadius: 1.5,
                        border: '1px dashed',
                        borderColor: 'divider',
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selectedPlan.condition}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {selectedPlan.patientName} · {selectedPlan.mrn}
                      </Typography>
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mt: 0.75 }}>
                        <Chip size="small" label={`Coach: ${selectedPlan.coach}`} variant="outlined" />
                        <Chip size="small" label={`Next: ${selectedPlan.nextCheckIn}`} variant="outlined" />
                        <Chip
                          size="small"
                          label={`${selectedPlan.completion}% complete`}
                          color={selectedPlan.completion > 70 ? 'success' : 'default'}
                        />
                        <Chip
                          size="small"
                          label={selectedPlan.status}
                          color={selectedPlan.status === 'Active' ? 'success' : selectedPlan.status === 'Paused' ? 'warning' : 'default'}
                        />
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
                    Connected Care Actions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use the current plan MRN to continue care across OPD workflows and patient records.
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
                      Schedule Follow-up
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={!canNavigate('/appointments/visit')}
                      onClick={() => router.push(withMrn('/appointments/visit'))}
                    >
                      OPD Visit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={!canNavigate('/clinical/prescriptions')}
                      onClick={() => router.push(withMrn('/clinical/prescriptions'))}
                    >
                      Prescriptions
                    </Button>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </FlowTabPanel>

        <FlowTabPanel value={activeTab} index={2}>
          <Card
            elevation={0}
            sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
          >
            <Stack spacing={1.25}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Upcoming Check-ins
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
                      <TableCell sx={{ fontWeight: 700 }}>Check-in</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Channel</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Due</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {checkIns.map((checkIn) => (
                      <TableRow key={checkIn.id} hover>
                        <TableCell>{checkIn.title}</TableCell>
                        <TableCell>{checkIn.channel}</TableCell>
                        <TableCell>{checkIn.due}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={checkIn.status}
                            color={checkIn.status === 'Completed' ? 'success' : 'default'}
                            variant={checkIn.status === 'Completed' ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {checkIn.status !== 'Completed' ? (
                            <Button
                              size="small"
                              variant="text"
                              disabled={!canWrite}
                              onClick={() => handleCompleteCheckIn(checkIn.id)}
                            >
                              Mark Done
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
        </FlowTabPanel>

        <FlowTabPanel value={activeTab} index={3}>
          <Grid container spacing={1.5} alignItems="stretch">
            <Grid item xs={12} md={7} sx={{ display: 'flex' }}>
              <Card
                elevation={0}
                sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider', flex: 1 }}
              >
                <Stack spacing={1.25}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Response Inbox
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
                          <TableCell sx={{ fontWeight: 700 }}>Channel</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Received</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Summary</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="right">
                            Action
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {responses.map((response) => (
                          <TableRow key={response.id} hover>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {response.patientName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {response.mrn}
                              </Typography>
                            </TableCell>
                            <TableCell>{response.channel}</TableCell>
                            <TableCell>{response.received}</TableCell>
                            <TableCell>{response.summary}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={response.status}
                                color={
                                  response.status === 'Escalated'
                                    ? 'error'
                                    : response.status === 'New'
                                    ? 'warning'
                                    : 'success'
                                }
                                variant={response.status === 'Reviewed' ? 'outlined' : 'filled'}
                              />
                            </TableCell>
                            <TableCell align="right">
                              {response.status !== 'Reviewed' ? (
                                <Button
                                  size="small"
                                  variant="text"
                                  disabled={!canWrite}
                                  onClick={() => handleReviewResponse(response.id)}
                                >
                                  Mark Reviewed
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
                  <Divider />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Message Center
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Send a quick update or wellness reminder to the active plan.
                  </Typography>
                  <TextField multiline minRows={3} placeholder="Type a supportive message..." />
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" startIcon={<MessageIcon />} disabled={!canWrite}>
                      Save Draft
                    </Button>
                    <Button variant="contained" endIcon={<TaskAltIcon />} disabled={!canWrite} onClick={handleSendReminder}>
                      Send Now
                    </Button>
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
                    Escalations
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
                          <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Owner</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Due</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="right">
                            Action
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {escalations.map((item) => (
                          <TableRow key={item.id} hover>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.patientName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.mrn}
                              </Typography>
                            </TableCell>
                            <TableCell>{item.reason}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={item.priority}
                                color={item.priority === 'High' ? 'error' : 'warning'}
                              />
                            </TableCell>
                            <TableCell>{item.owner}</TableCell>
                            <TableCell>{item.due}</TableCell>
                            <TableCell align="right">
                              <Button
                                size="small"
                                variant="text"
                                disabled={!canWrite}
                                onClick={() => handleEscalationResolved(item.id)}
                              >
                                Resolve
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {escalations.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6}>
                              <Typography variant="caption" color="text.secondary">
                                No active escalations.
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

        <FlowTabPanel value={activeTab} index={4}>
          <Grid container spacing={1.5} alignItems="stretch">
            <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
              <Card
                elevation={0}
                sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider', flex: 1 }}
              >
                <Stack spacing={1.25}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Close Plan
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Complete the plan once goals are met and check-ins are finished.
                  </Typography>
                  {selectedPlan ? (
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
                        {selectedPlan.condition}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {selectedPlan.patientName} · {selectedPlan.mrn}
                      </Typography>
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mt: 0.75 }}>
                        <Chip size="small" label={`Coach: ${selectedPlan.coach}`} variant="outlined" />
                        <Chip
                          size="small"
                          label={`${selectedPlan.completion}% complete`}
                          color={selectedPlan.completion > 70 ? 'success' : 'default'}
                        />
                        <Chip
                          size="small"
                          label={selectedPlan.status}
                          color={selectedPlan.status === 'Active' ? 'success' : selectedPlan.status === 'Paused' ? 'warning' : 'default'}
                        />
                      </Stack>
                    </Box>
                  ) : null}
                  <Button
                    variant="contained"
                    disabled={!canWrite || !selectedPlan || selectedPlan.status === 'Completed'}
                    onClick={() => {
                      if (selectedPlan) {
                        handleClosePlan(selectedPlan.id);
                      }
                    }}
                  >
                    Close Plan
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
                    Completed Plans
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
                          <TableCell sx={{ fontWeight: 700 }}>Condition</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Coach</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Completion</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {completedPlans.map((plan) => (
                          <TableRow key={plan.id} hover>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {plan.patientName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {plan.mrn}
                              </Typography>
                            </TableCell>
                            <TableCell>{plan.condition}</TableCell>
                            <TableCell>{plan.coach}</TableCell>
                            <TableCell>
                              <Chip size="small" label={`${plan.completion}%`} color="success" variant="outlined" />
                            </TableCell>
                          </TableRow>
                        ))}
                        {completedPlans.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4}>
                              <Typography variant="caption" color="text.secondary">
                                No completed plans yet.
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
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Create Care Plan"
        maxWidth="sm"
        content={
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField label="Patient Name" placeholder="Enter patient name" />
            <TextField label="Program" placeholder="e.g., Diabetes Support" />
            <TextField select label="Channel" defaultValue="App">
              {['App', 'SMS', 'Call'].map((channel) => (
                <MenuItem key={channel} value={channel}>
                  {channel}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Start Date" placeholder="Select start date" />
          </Stack>
        }
        actions={
          <>
            <Button variant="text" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" disabled={!canWrite} onClick={handleCreatePlan}>
              Create Plan
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
