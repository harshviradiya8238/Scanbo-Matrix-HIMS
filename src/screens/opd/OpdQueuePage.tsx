'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Button,
  Chip,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import CommonTable, {
  CommonTableColumn,
  CommonTableFilter,
  CommonTableFilterOption,
} from '@/src/ui/components/molecules/CommonTable';
import { CommonDialog } from '@/src/ui/components/molecules';
import {
  Add as AddIcon,
  AssignmentInd as AssignmentIndIcon,
  Bolt as BoltIcon,
  FileDownload as FileDownloadIcon,
  History as HistoryIcon,
  LocalHospital as LocalHospitalIcon,
  PlayArrow as PlayArrowIcon,
  SwapHoriz as SwapHorizIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import {
  EncounterStatus,
  OpdEncounterCase,
} from './opd-mock-data';
import { AdmissionPriority } from '@/src/screens/ipd/ipd-mock-data';
import {
  ENCOUNTER_STATUS_LABEL,
  buildEncounterRoute,
} from './opd-encounter';
import { useUser } from '@/src/core/auth/UserContext';
import { useAppDispatch } from '@/src/store/hooks';
import { updateEncounter } from '@/src/store/slices/opdSlice';
import { useOpdData } from '@/src/store/opdHooks';
import { usePermission } from '@/src/core/auth/usePermission';
import OpdLayout from './components/OpdLayout';
import ActionBar from './components/ActionBar';
import {
  IpdMetricCard,
  IpdSectionCard,
  ipdFormStylesSx,
} from '@/src/screens/ipd/components/ipd-ui';
import { useIpdEncounters } from '@/src/screens/ipd/ipd-encounter-context';
import { getOpdRoleFlowProfile } from './opd-role-flow';
import {
  buildDefaultTransferPayload,
  upsertOpdToIpdTransferLead,
} from '@/src/screens/ipd/ipd-transfer-store';

type QueueStage = 'Waiting' | 'In Progress';

interface QueueItem extends OpdEncounterCase {
  token: string;
  waitMinutes: number;
  stage: QueueStage;
}

interface QueueTransferDraft {
  priority: AdmissionPriority;
  preferredWard: string;
  provisionalDiagnosis: string;
  admissionReason: string;
  requestNote: string;
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

const statusRank: Record<EncounterStatus, number> = {
  BOOKED: 0,
  ARRIVED: 1,
  IN_QUEUE: 2,
  IN_PROGRESS: 3,
  COMPLETED: 0,
  CANCELLED: 0,
};

function normalizeMrn(mrn: string): string {
  return mrn.trim().toUpperCase();
}

function pickPreferredEncounter(current: OpdEncounterCase, incoming: OpdEncounterCase): OpdEncounterCase {
  const currentRank = statusRank[current.status] ?? 0;
  const incomingRank = statusRank[incoming.status] ?? 0;
  if (incomingRank > currentRank) return incoming;
  if (incomingRank < currentRank) return current;
  if (incoming.appointmentTime >= current.appointmentTime) return incoming;
  return current;
}

function buildQueue(encounters: OpdEncounterCase[], excludedMrnSet: Set<string>): QueueItem[] {
  const activeCandidates = encounters
    .filter((item) => ACTIVE_QUEUE_STATUSES.includes(item.status))
    .filter((item) => !excludedMrnSet.has(normalizeMrn(item.mrn)));

  const activeByMrn = new Map<string, OpdEncounterCase>();
  activeCandidates.forEach((item) => {
    const key = normalizeMrn(item.mrn);
    const existing = activeByMrn.get(key);
    if (!existing) {
      activeByMrn.set(key, item);
      return;
    }
    activeByMrn.set(key, pickPreferredEncounter(existing, item));
  });

  const active = Array.from(activeByMrn.values())
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
  const permissionGate = usePermission();
  const ipdEncounters = useIpdEncounters();
  const dispatch = useAppDispatch();
  const {
    appointments,
    encounters,
    status: opdStatus,
    error: opdError,
  } = useOpdData();

  const activeIpdMrnSet = React.useMemo(
    () =>
      new Set(
        ipdEncounters
          .filter((record) => record.workflowStatus !== 'discharged')
          .map((record) => normalizeMrn(record.mrn))
      ),
    [ipdEncounters]
  );

  const queue = React.useMemo(() => buildQueue(encounters, activeIpdMrnSet), [encounters, activeIpdMrnSet]);
  const roleProfile = React.useMemo(() => getOpdRoleFlowProfile(role), [role]);
  const canStartConsult = roleProfile.capabilities.canStartConsult;
  const canViewHistory = roleProfile.capabilities.canViewClinicalHistory;
  const canCreateRegistration = roleProfile.capabilities.canManageCalendar;
  const canTransferToIpd =
    roleProfile.capabilities.canTransferToIpd && permissionGate('ipd.transfer.write');
  const [transferDialogOpen, setTransferDialogOpen] = React.useState(false);
  const [selectedTransferItem, setSelectedTransferItem] = React.useState<QueueItem | null>(null);
  const [transferDraft, setTransferDraft] = React.useState<QueueTransferDraft>({
    priority: 'Routine',
    preferredWard: 'Medical Ward - 1',
    provisionalDiagnosis: '',
    admissionReason: '',
    requestNote: '',
  });
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  const withMrn = React.useCallback(
    (route: string, mrn?: string) => {
      if (!mrn) return route;
      const joiner = route.includes('?') ? '&' : '?';
      return `${route}${joiner}mrn=${encodeURIComponent(mrn)}`;
    },
    []
  );

  const waitingCount = queue.filter((item) => item.stage === 'Waiting').length;
  const inProgressCount = queue.filter((item) => item.stage === 'In Progress').length;
  const completedCount = encounters.filter((item) => item.status === 'COMPLETED').length;
  const emergencyCount = queue.filter((item) => item.queuePriority === 'Urgent').length;

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
      router.push(withMrn('/appointments/visit?tab=notes', item.mrn));
    },
    [canViewHistory, roleProfile.label, router, withMrn]
  );

  const handleOpenTransferDialog = React.useCallback(
    (item: QueueItem) => {
      if (!canTransferToIpd) {
        setSnackbar({
          open: true,
          message: `${roleProfile.label} does not have permission to move patient to IPD.`,
          severity: 'warning',
        });
        return;
      }

      const appointment = appointments.find((row) => row.id === item.appointmentId);
      const defaults = buildDefaultTransferPayload(item, {
        payerType: appointment?.payerType,
        phone: appointment?.phone,
        requestedBy: roleProfile.label,
        requestedByRole: role,
      });

      setSelectedTransferItem(item);
      setTransferDraft({
        priority: defaults.priority,
        preferredWard: defaults.preferredWard,
        provisionalDiagnosis: defaults.provisionalDiagnosis ?? '',
        admissionReason: defaults.admissionReason,
        requestNote: '',
      });
      setTransferDialogOpen(true);
    },
    [appointments, canTransferToIpd, role, roleProfile.label]
  );

  const handleSubmitTransfer = React.useCallback(() => {
    if (!selectedTransferItem) return;
    if (!canTransferToIpd) {
      setSnackbar({
        open: true,
        message: `${roleProfile.label} does not have permission to move patient to IPD.`,
        severity: 'warning',
      });
      return;
    }

    if (!transferDraft.preferredWard.trim()) {
      setSnackbar({
        open: true,
        message: 'Preferred ward is required for IPD transfer.',
        severity: 'error',
      });
      return;
    }

    if (!transferDraft.admissionReason.trim()) {
      setSnackbar({
        open: true,
        message: 'Admission reason is required for IPD transfer.',
        severity: 'error',
      });
      return;
    }

    const appointment = appointments.find((row) => row.id === selectedTransferItem.appointmentId);
    const defaults = buildDefaultTransferPayload(selectedTransferItem, {
      payerType: appointment?.payerType,
      phone: appointment?.phone,
      requestedBy: roleProfile.label,
      requestedByRole: role,
    });

    const result = upsertOpdToIpdTransferLead({
      ...defaults,
      priority: transferDraft.priority,
      preferredWard: transferDraft.preferredWard.trim(),
      provisionalDiagnosis: transferDraft.provisionalDiagnosis.trim() || defaults.provisionalDiagnosis,
      admissionReason: transferDraft.admissionReason.trim(),
      requestNote: transferDraft.requestNote.trim(),
    });

    dispatch(
      updateEncounter({
        id: selectedTransferItem.id,
        changes: { status: 'COMPLETED' },
      })
    );

    setTransferDialogOpen(false);
    setSelectedTransferItem(null);
    setSnackbar({
      open: true,
      message:
        result.status === 'created'
          ? `IPD transfer created for ${result.lead.patientName}.`
          : `IPD transfer updated for ${result.lead.patientName}.`,
      severity: 'success',
    });
    router.push(`/ipd/admissions?mrn=${encodeURIComponent(result.lead.mrn)}`);
  }, [
    appointments,
    canTransferToIpd,
    dispatch,
    role,
    roleProfile.label,
    router,
    selectedTransferItem,
    transferDraft.admissionReason,
    transferDraft.preferredWard,
    transferDraft.priority,
    transferDraft.provisionalDiagnosis,
    transferDraft.requestNote,
  ]);

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
        minWidth: 360,
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
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              startIcon={<SwapHorizIcon />}
              disabled={!canTransferToIpd}
              onClick={() => handleOpenTransferDialog(row)}
            >
              Move to IPD
            </Button>
          </Stack>
        ),
      },
    ],
    [
      canStartConsult,
      canTransferToIpd,
      canViewHistory,
      handleOpenTransferDialog,
      handleStartConsult,
      handleViewHistory,
    ]
  );

  if (!isHydrated) {
    return (
      <OpdLayout title="OPD Dashboard" currentPageTitle="Queue" showRoleGuide={false}>
        <Stack spacing={2}>
          <Alert severity="info">Loading OPD queue...</Alert>
        </Stack>
      </OpdLayout>
    );
  }

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

      <CommonDialog
        open={transferDialogOpen}
        onClose={() => {
          setTransferDialogOpen(false);
          setSelectedTransferItem(null);
        }}
        title="Move Patient to IPD"
        subtitle={
          selectedTransferItem
            ? `${selectedTransferItem.patientName} (${selectedTransferItem.mrn})`
            : undefined
        }
        maxWidth="sm"
        content={
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <Alert severity="info">
              Create an IPD admission request from OPD. This patient will appear in IPD Admission Queue.
            </Alert>
            <TextField
              select
              label="Priority"
              value={transferDraft.priority}
              onChange={(event) =>
                setTransferDraft((prev) => ({
                  ...prev,
                  priority: event.target.value as AdmissionPriority,
                }))
              }
              fullWidth
            >
              {['Routine', 'Urgent', 'Emergency'].map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Preferred Ward"
              value={transferDraft.preferredWard}
              onChange={(event) =>
                setTransferDraft((prev) => ({
                  ...prev,
                  preferredWard: event.target.value,
                }))
              }
              fullWidth
            >
              {['Medical Ward - 1', 'Medical Ward - 2', 'Surgical Ward - 1', 'ICU', 'HDU'].map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Provisional Diagnosis"
              value={transferDraft.provisionalDiagnosis}
              onChange={(event) =>
                setTransferDraft((prev) => ({
                  ...prev,
                  provisionalDiagnosis: event.target.value,
                }))
              }
              fullWidth
            />
            <TextField
              label="Admission Reason"
              value={transferDraft.admissionReason}
              onChange={(event) =>
                setTransferDraft((prev) => ({
                  ...prev,
                  admissionReason: event.target.value,
                }))
              }
              minRows={2}
              multiline
              fullWidth
            />
            <TextField
              label="Internal Note (Optional)"
              value={transferDraft.requestNote}
              onChange={(event) =>
                setTransferDraft((prev) => ({
                  ...prev,
                  requestNote: event.target.value,
                }))
              }
              minRows={2}
              multiline
              fullWidth
            />
          </Stack>
        }
        actions={
          <>
            <Button
              variant="outlined"
              onClick={() => {
                setTransferDialogOpen(false);
                setSelectedTransferItem(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SwapHorizIcon />}
              onClick={handleSubmitTransfer}
              disabled={!canTransferToIpd || !selectedTransferItem}
            >
              Move to IPD
            </Button>
          </>
        }
      />

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
