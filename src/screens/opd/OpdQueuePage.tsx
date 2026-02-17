'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Button,
  Chip,
  Snackbar,
  Stack,
  Typography,
} from '@/src/ui/components/atoms';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import CommonTable, {
  CommonTableColumn,
  CommonTableFilter,
  CommonTableFilterOption,
} from '@/src/ui/components/molecules/CommonTable';
import {
  Add as AddIcon,
  AssignmentInd as AssignmentIndIcon,
  Bolt as BoltIcon,
  FileDownload as FileDownloadIcon,
  History as HistoryIcon,
  LocalHospital as LocalHospitalIcon,
  PlayArrow as PlayArrowIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import {
  EncounterStatus,
  OpdEncounterCase,
} from './opd-mock-data';
import {
  ENCOUNTER_STATUS_LABEL,
  buildEncounterRoute,
} from './opd-encounter';
import { useUser } from '@/src/core/auth/UserContext';
import { useAppDispatch } from '@/src/store/hooks';
import { updateEncounter } from '@/src/store/slices/opdSlice';
import { useOpdData } from '@/src/store/opdHooks';
import OpdLayout from './components/OpdLayout';
import ActionBar from './components/ActionBar';
import {
  IpdMetricCard,
  IpdSectionCard,
  ipdFormStylesSx,
} from '@/src/screens/ipd/components/ipd-ui';
import { getOpdRoleFlowProfile } from './opd-role-flow';

type QueueStage = 'Waiting' | 'In Progress';

interface QueueItem extends OpdEncounterCase {
  token: string;
  waitMinutes: number;
  stage: QueueStage;
}

const ACTIVE_QUEUE_STATUSES: EncounterStatus[] = ['ARRIVED', 'IN_QUEUE', 'IN_PROGRESS'];

const queueStatusColor: Record<EncounterStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  BOOKED: 'default',
  ARRIVED: 'warning',
  IN_QUEUE: 'warning',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

function buildFilterOptions(values: string[], allLabel: string): CommonTableFilterOption[] {
  const uniqueValues = Array.from(new Set(values.filter(Boolean)));
  return [{ label: allLabel, value: 'all' }, ...uniqueValues.map((value) => ({ label: value, value }))];
}

function buildQueue(encounters: OpdEncounterCase[]): QueueItem[] {
  const active = encounters
    .filter((item) => ACTIVE_QUEUE_STATUSES.includes(item.status))
    .sort((left, right) => left.appointmentTime.localeCompare(right.appointmentTime));

  return active.map((item, index) => {
    const isInProgress = item.status === 'IN_PROGRESS';
    const waitMinutes = isInProgress ? 0 : 8 + index * 4;

    return {
      ...item,
      token: String(index + 1).padStart(2, '0'),
      waitMinutes,
      stage: isInProgress ? 'In Progress' : 'Waiting',
    };
  });
}

export default function OpdQueuePage() {
  const router = useRouter();
  const { role } = useUser();
  const dispatch = useAppDispatch();
  const {
    appointments,
    encounters,
    status: opdStatus,
    error: opdError,
  } = useOpdData();

  const queue = React.useMemo(() => buildQueue(encounters), [encounters]);
  const roleProfile = React.useMemo(() => getOpdRoleFlowProfile(role), [role]);
  const canStartConsult = roleProfile.capabilities.canStartConsult;
  const canViewHistory = roleProfile.capabilities.canViewClinicalHistory;
  const canCreateRegistration = roleProfile.capabilities.canManageCalendar;
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const withMrn = React.useCallback(
    (route: string, mrn?: string) => (mrn ? `${route}?mrn=${encodeURIComponent(mrn)}` : route),
    []
  );

  const waitingCount = encounters.filter((item) => item.status === 'ARRIVED' || item.status === 'IN_QUEUE').length;
  const inProgressCount = encounters.filter((item) => item.status === 'IN_PROGRESS').length;
  const completedCount = encounters.filter((item) => item.status === 'COMPLETED').length;
  const emergencyCount = encounters.filter(
    (item) => item.queuePriority === 'Urgent' && ACTIVE_QUEUE_STATUSES.includes(item.status)
  ).length;

  const averageWaitMinutes = React.useMemo(() => {
    const waitingRows = queue.filter((item) => item.stage === 'Waiting');
    if (waitingRows.length === 0) return 0;
    const total = waitingRows.reduce((sum, item) => sum + item.waitMinutes, 0);
    return Math.round(total / waitingRows.length);
  }, [queue]);

  const queueStageOptions = React.useMemo(
    () => buildFilterOptions(queue.map((item) => item.stage), 'All Stage'),
    [queue]
  );
  const queuePriorityOptions = React.useMemo(
    () => buildFilterOptions(queue.map((item) => item.queuePriority), 'All Priority'),
    [queue]
  );
  const queueDepartmentOptions = React.useMemo(
    () => buildFilterOptions(queue.map((item) => item.department), 'All Department'),
    [queue]
  );

  const queueFilters = React.useMemo<CommonTableFilter<QueueItem>[]>(
    () => [
      {
        id: 'stage',
        label: 'Stage',
        options: queueStageOptions,
        getValue: (row) => row.stage,
        allValue: 'all',
        minWidth: 150,
      },
      {
        id: 'priority',
        label: 'Priority',
        options: queuePriorityOptions,
        getValue: (row) => row.queuePriority,
        allValue: 'all',
        minWidth: 150,
      },
      {
        id: 'department',
        label: 'Department',
        options: queueDepartmentOptions,
        getValue: (row) => row.department,
        allValue: 'all',
        minWidth: 190,
      },
    ],
    [queueStageOptions, queuePriorityOptions, queueDepartmentOptions]
  );

  const handleStartConsult = React.useCallback(
    (item: QueueItem) => {
      if (!canStartConsult) {
        setSnackbar({
          open: true,
          message: `${roleProfile.label} cannot start consultation. Please assign to a doctor.`,
          severity: 'warning',
        });
        return;
      }
      dispatch(
        updateEncounter({
          id: item.id,
          changes: { status: 'IN_PROGRESS' },
        })
      );
      router.push(withMrn(buildEncounterRoute(item.id), item.mrn));
    },
    [canStartConsult, dispatch, roleProfile.label, router, withMrn]
  );

  const handleViewHistory = React.useCallback(
    (item: QueueItem) => {
      if (!canViewHistory) {
        setSnackbar({
          open: true,
          message: `${roleProfile.label} cannot open clinical history.`,
          severity: 'warning',
        });
        return;
      }
      router.push(withMrn('/clinical/notes', item.mrn));
    },
    [canViewHistory, roleProfile.label, router, withMrn]
  );

  const queueColumns = React.useMemo<CommonTableColumn<QueueItem>[]>(
    () => [
      {
        id: 'token',
        label: 'Token',
        minWidth: 90,
        renderCell: (row) => (
          <Typography
            variant="body1"
            sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}
          >
            {row.token}
          </Typography>
        ),
      },
      {
        id: 'patient',
        label: 'Patient',
        minWidth: 220,
        renderCell: (row) => (
          <Stack spacing={0.2}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {row.patientName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.mrn} · {row.ageGender}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'complaint',
        label: 'Chief Complaint',
        minWidth: 220,
        renderCell: (row) => (
          <Typography variant="body2" color="text.secondary">
            {row.chiefComplaint}
          </Typography>
        ),
      },
      {
        id: 'doctor',
        label: 'Consultant',
        minWidth: 170,
        renderCell: (row) => row.doctor,
      },
      {
        id: 'status',
        label: 'Status',
        minWidth: 230,
        renderCell: (row) => (
          <Stack direction="row" spacing={0.6} flexWrap="wrap">
            <Chip label={row.stage} color={row.stage === 'In Progress' ? 'info' : 'warning'} size="small" />
            <Chip
              label={ENCOUNTER_STATUS_LABEL[row.status]}
              color={queueStatusColor[row.status]}
              variant="outlined"
              size="small"
            />
            {row.queuePriority === 'Urgent' ? (
              <Chip
                size="small"
                color="error"
                label="Emergency"
                icon={<WarningAmberIcon fontSize="small" />}
              />
            ) : null}
          </Stack>
        ),
      },
      {
        id: 'wait',
        label: 'Wait',
        minWidth: 90,
        renderCell: (row) => (
          <Typography variant="body2" color="text.secondary">
            {row.stage === 'Waiting' ? `${row.waitMinutes} min` : '--'}
          </Typography>
        ),
      },
      {
        id: 'actions',
        label: 'Action',
        align: 'right',
        minWidth: 230,
        renderCell: (row) => (
          <Stack direction="row" spacing={0.7} justifyContent="flex-end">
            <Button
              size="small"
              variant="outlined"
              startIcon={<PlayArrowIcon />}
              disabled={!canStartConsult}
              onClick={() => handleStartConsult(row)}
            >
              {row.stage === 'In Progress' ? 'Open Consult' : 'Start Consult'}
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<HistoryIcon />}
              disabled={!canViewHistory}
              onClick={() => handleViewHistory(row)}
            >
              View History
            </Button>
          </Stack>
        ),
      },
    ],
    [canStartConsult, canViewHistory, handleStartConsult, handleViewHistory]
  );

  return (
    <OpdLayout title="OPD Dashboard" currentPageTitle="Queue" showRoleGuide={false}>
      <Stack spacing={2}>
        {opdStatus === 'loading' ? (
          <Alert severity="info">Loading OPD data from the local JSON server.</Alert>
        ) : null}
        {opdStatus === 'error' ? (
          <Alert severity="warning">
            OPD JSON server not reachable. Showing fallback data.
            {opdError ? ` (${opdError})` : ''}
          </Alert>
        ) : null}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} lg={3}>
            <IpdMetricCard
              label="Patients Today"
              value={appointments.length}
              trend={`${averageWaitMinutes} min avg wait`}
              tone="info"
              icon={<AssignmentIndIcon sx={{ fontSize: 28 }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <IpdMetricCard
              label="In Queue"
              value={waitingCount}
              trend={`${emergencyCount} emergency cases`}
              tone="warning"
              icon={<BoltIcon sx={{ fontSize: 28 }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <IpdMetricCard
              label="In Consultation"
              value={inProgressCount}
              trend={`${queue.length} active encounter(s)`}
              tone="primary"
              icon={<LocalHospitalIcon sx={{ fontSize: 28 }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <IpdMetricCard
              label="Completed"
              value={completedCount}
              trend="Visits closed today"
              tone="success"
              icon={<HistoryIcon sx={{ fontSize: 28 }} />}
            />
          </Grid>
        </Grid>

        <IpdSectionCard
          title="OPD Queue"
          subtitle="Track, filter, and launch OPD consultations."
          action={
            <ActionBar>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                disabled={!canCreateRegistration}
                onClick={() => router.push('/patients/registration')}
              >
                New Patient Registration
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={() =>
                  setSnackbar({
                    open: true,
                    message: 'Report export started.',
                    severity: 'info',
                  })
                }
              >
                Export Reports
              </Button>
            </ActionBar>
          }
          bodySx={ipdFormStylesSx}
        >
          <CommonTable
            rows={queue}
            columns={queueColumns}
            getRowId={(row) => row.id}
            emptyMessage="No patients in queue for the selected filter."
            searchBy={(row) =>
              [
                row.token,
                row.patientName,
                row.mrn,
                row.chiefComplaint,
                row.doctor,
                row.department,
                row.queuePriority,
              ].join(' ')
            }
            searchPlaceholder="Search patient, MRN, complaint..."
            filters={queueFilters}
            initialRowsPerPage={10}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </IpdSectionCard>
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3200}
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
    </OpdLayout>
  );
}
