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
import { alpha, Divider, useTheme } from '@mui/material';
import { getSoftSurface } from '@/src/core/theme/surfaces';
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

const FLOW_STEPS = [
  'Enroll Patient',
  'Configure Plan',
  'Schedule Check-ins',
  'Monitor Responses',
  'Close Plan',
];

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

export default function CareCompanionPage() {
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const [activeStep, setActiveStep] = React.useState(2);
  const [plans, setPlans] = React.useState<CarePlan[]>(INITIAL_PLANS);
  const [checkIns, setCheckIns] = React.useState<CheckInItem[]>(INITIAL_CHECKINS);
  const [selectedPlanId, setSelectedPlanId] = React.useState<string>(INITIAL_PLANS[0]?.id ?? '');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? plans[0];

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

  return (
    <PageTemplate title="Care Companion" currentPageTitle="Care Companion">
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
              <Chip size="small" label="Patient Engagement" variant="outlined" />
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
                  Care Companion
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Automate patient check-ins, reminders, and follow-ups with guided care plans.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" startIcon={<CampaignIcon />} onClick={handleSendReminder}>
                  Send Reminder
                </Button>
                <Button variant="contained" startIcon={<AddCircleIcon />} onClick={() => setDialogOpen(true)}>
                  Create Care Plan
                </Button>
              </Stack>
            </Stack>
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

        <Grid container spacing={1.5} alignItems="stretch">
          <Grid item xs={12} md={7} sx={{ display: 'flex' }}>
            <Card
              elevation={0}
              sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider', flex: 1 }}
            >
              <Stack spacing={1.25}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Care Plans
                </Typography>
                <Stack spacing={1}>
                  {plans.map((plan) => (
                    <Card
                      key={plan.id}
                      variant="outlined"
                      sx={{
                        p: 1.25,
                        borderRadius: 1.5,
                        borderColor: plan.id === selectedPlanId ? 'primary.main' : 'divider',
                        backgroundColor:
                          plan.id === selectedPlanId ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                      }}
                      onClick={() => setSelectedPlanId(plan.id)}
                    >
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {plan.patientName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {plan.mrn} · {plan.condition}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Coach: {plan.coach} · Next check-in {plan.nextCheckIn}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            size="small"
                            label={`${plan.completion}%`}
                            variant="outlined"
                            color={plan.completion > 70 ? 'success' : 'default'}
                          />
                          <Chip
                            size="small"
                            label={plan.status}
                            color={plan.status === 'Active' ? 'success' : plan.status === 'Paused' ? 'warning' : 'default'}
                          />
                          {plan.status !== 'Completed' ? (
                            <Button size="small" variant="text" onClick={() => handleTogglePlan(plan.id)}>
                              {plan.status === 'Active' ? 'Pause' : 'Resume'}
                            </Button>
                          ) : null}
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
                  Plan Flow
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
                <Divider />
                <Stack spacing={0.75}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircleIcon fontSize="small" color="success" />
                    <Typography variant="body2">15 patients are currently in monitoring</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ScheduleIcon fontSize="small" color="warning" />
                    <Typography variant="body2">8 check-ins scheduled in the next 2 hours</Typography>
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
                  Upcoming Check-ins
                </Typography>
                <Stack spacing={0.9}>
                  {checkIns.map((checkIn) => (
                    <Box
                      key={checkIn.id}
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
                            {checkIn.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Channel: {checkIn.channel} · Due {checkIn.due}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            size="small"
                            label={checkIn.status}
                            color={checkIn.status === 'Completed' ? 'success' : 'default'}
                            variant={checkIn.status === 'Completed' ? 'filled' : 'outlined'}
                          />
                          {checkIn.status !== 'Completed' ? (
                            <Button size="small" variant="text" onClick={() => handleCompleteCheckIn(checkIn.id)}>
                              Mark Done
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

          <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
            <Card
              elevation={0}
              sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider', flex: 1 }}
            >
              <Stack spacing={1.25}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Message Center
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Send a quick update or wellness reminder to the active plan.
                </Typography>
                <TextField
                  multiline
                  minRows={3}
                  placeholder="Type a supportive message..."
                />
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" startIcon={<MessageIcon />}>
                    Save Draft
                  </Button>
                  <Button variant="contained" endIcon={<TaskAltIcon />} onClick={handleSendReminder}>
                    Send Now
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Stack>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Care Plan</DialogTitle>
        <DialogContent>
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
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreatePlan}>
            Create Plan
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
