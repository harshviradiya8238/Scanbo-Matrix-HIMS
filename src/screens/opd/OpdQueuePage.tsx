'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { alpha, useTheme } from '@mui/material';
import {
  Add as AddIcon,
  Bolt as BoltIcon,
  FileDownload as FileDownloadIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  PlayArrow as PlayArrowIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { getSoftSurface } from '@/src/core/theme/surfaces';
import {
  EncounterStatus,
  OpdEncounterCase,
} from './opd-mock-data';
import {
  ENCOUNTER_STATUS_LABEL,
  buildEncounterRoute,
} from './opd-encounter';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { getPatientByMrn } from '@/src/mocks/global-patients';
import { useAppDispatch } from '@/src/store/hooks';
import { updateEncounter } from '@/src/store/slices/opdSlice';
import { useOpdData } from '@/src/store/opdHooks';
import OpdLayout from './components/OpdLayout';
import OpdTable from './components/OpdTable';
import ActionBar from './components/ActionBar';

type QueueFilter = 'All' | 'Waiting' | 'In Progress' | 'Emergency';
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

const FILTER_OPTIONS: QueueFilter[] = ['All', 'Waiting', 'In Progress', 'Emergency'];

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

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

export default function OpdQueuePage() {
  const router = useRouter();
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const mrnParam = useMrnParam();
  const dispatch = useAppDispatch();
  const {
    appointments,
    encounters,
    status: opdStatus,
    error: opdError,
  } = useOpdData();

  const queue = React.useMemo(() => buildQueue(encounters), [encounters]);
  const [search, setSearch] = React.useState('');
  const [queueFilter, setQueueFilter] = React.useState<QueueFilter>('All');
  const [selectedId, setSelectedId] = React.useState(queue[0]?.id ?? '');
  const [mrnApplied, setMrnApplied] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const filteredQueue = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    return queue.filter((item) => {
      const matchesFilter =
        queueFilter === 'All' ||
        (queueFilter === 'Waiting' && item.stage === 'Waiting') ||
        (queueFilter === 'In Progress' && item.stage === 'In Progress') ||
        (queueFilter === 'Emergency' && item.queuePriority === 'Urgent');

      const matchesSearch =
        query.length === 0 ||
        [item.patientName, item.mrn, item.chiefComplaint, item.doctor, item.department]
          .join(' ')
          .toLowerCase()
          .includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [queue, queueFilter, search]);

  React.useEffect(() => {
    if (!selectedId && filteredQueue.length > 0) {
      setSelectedId(filteredQueue[0].id);
      return;
    }

    const stillPresent = filteredQueue.some((item) => item.id === selectedId);
    if (!stillPresent && filteredQueue.length > 0) {
      setSelectedId(filteredQueue[0].id);
    }
  }, [filteredQueue, selectedId]);

  React.useEffect(() => {
    if (!mrnParam || mrnApplied) return;
    const match = queue.find((item) => item.mrn === mrnParam);
    if (match) {
      setSelectedId(match.id);
      setSearch(mrnParam);
    }
    setMrnApplied(true);
  }, [mrnApplied, mrnParam, queue]);

  const selectedItem = React.useMemo(
    () => queue.find((item) => item.id === selectedId),
    [queue, selectedId]
  );

  const flowMrn = selectedItem?.mrn ?? mrnParam;
  const seededPatient = getPatientByMrn(flowMrn);
  const flowName = selectedItem?.patientName || seededPatient?.name;
  const pageSubtitle = formatPatientLabel(flowName, flowMrn);
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

  const handleStartConsult = (item: QueueItem) => {
    dispatch(
      updateEncounter({
        id: item.id,
        changes: { status: 'IN_PROGRESS' },
      })
    );
    router.push(withMrn(buildEncounterRoute(item.id), item.mrn));
  };

  const handleViewHistory = (item: QueueItem) => {
    router.push(withMrn('/clinical/notes', item.mrn));
  };

  return (
    <OpdLayout title="OPD Dashboard" subtitle={pageSubtitle} currentPageTitle="Queue">
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

        <Card
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            boxShadow: '0 12px 24px rgba(15, 23, 42, 0.06)',
            backgroundColor: softSurface,
          }}
        >
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={1.2}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', lg: 'center' }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                OPD Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Real-time overview of outpatient consultation flow.
              </Typography>
            </Box>
            <ActionBar>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
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
          </Stack>
        </Card>

        <Grid container spacing={2}>
          {[
            {
              label: 'Patients Today',
              value: appointments.length,
              hint: `${averageWaitMinutes} min avg wait`,
              icon: <PersonIcon fontSize="small" />,
              color: theme.palette.primary.main,
            },
            {
              label: 'In Queue',
              value: waitingCount,
              hint: `${queue.filter((item) => item.queuePriority === 'Urgent').length} priority cases`,
              icon: <BoltIcon fontSize="small" />,
              color: theme.palette.warning.main,
            },
            {
              label: 'Completed',
              value: completedCount,
              hint: `${inProgressCount} currently in consult`,
              icon: <HistoryIcon fontSize="small" />,
              color: theme.palette.success.main,
            },
            {
              label: 'Emergency Cases',
              value: emergencyCount,
              hint: 'Immediate attention',
              icon: <BoltIcon fontSize="small" />,
              color: theme.palette.error.main,
            },
          ].map((item) => (
            <Grid key={item.label} item xs={12} sm={6} lg={3}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  boxShadow: '0 12px 24px rgba(15, 23, 42, 0.06)',
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: alpha(item.color, 0.22),
                  height: '100%',
                }}
              >
                <Stack spacing={1.1}>
                  <Chip
                    size="small"
                    icon={item.icon}
                    label={item.label}
                    sx={{
                      alignSelf: 'flex-start',
                      color: item.color,
                      border: `1px solid ${alpha(item.color, 0.36)}`,
                      backgroundColor: alpha(item.color, 0.08),
                    }}
                  />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {item.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.hint}
                  </Typography>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            boxShadow: '0 12px 24px rgba(15, 23, 42, 0.06)',
            backgroundColor: 'background.paper',
          }}
        >
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={1.25}
            sx={{ p: 2, borderBottom: '1px solid', borderBottomColor: 'divider' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', lg: 'center' }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Active Patient Queue
            </Typography>

            <ActionBar>
              <TextField
                size="small"
                placeholder="Search patient, MRN, complaint..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: { xs: '100%', sm: 280 } }}
              />
              <Stack direction="row" spacing={0.7} flexWrap="wrap">
                {FILTER_OPTIONS.map((filter) => (
                  <Button
                    key={filter}
                    size="small"
                    variant={queueFilter === filter ? 'contained' : 'outlined'}
                    onClick={() => setQueueFilter(filter)}
                  >
                    {filter}
                  </Button>
                ))}
              </Stack>
            </ActionBar>
          </Stack>

          <Box sx={{ p: 2 }}>
            <OpdTable
              variant="plain"
              rows={filteredQueue}
              emptyMessage="No patients in queue for the selected filter."
              rowKey={(row) => row.id}
              columns={[
                {
                  id: 'token',
                  label: 'Token',
                  render: (row) => (
                    <Typography
                      variant="h6"
                      sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}
                    >
                      {row.token}
                    </Typography>
                  ),
                },
                {
                  id: 'patient',
                  label: 'Patient',
                  render: (row) => (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', color: 'primary.dark', fontWeight: 700 }}>
                        {getInitials(row.patientName)}
                      </Avatar>
                      <Stack spacing={0.15}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {row.patientName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.mrn} · {row.ageGender}
                        </Typography>
                      </Stack>
                    </Stack>
                  ),
                },
                {
                  id: 'complaint',
                  label: 'Chief Complaint',
                  render: (row) => (
                    <Typography variant="body2" color="text.secondary">
                      {row.chiefComplaint}
                    </Typography>
                  ),
                },
                {
                  id: 'status',
                  label: 'Status',
                  render: (row) => (
                    <Stack direction="row" spacing={0.6} flexWrap="wrap">
                      <Chip label={row.stage} color={row.stage === 'In Progress' ? 'info' : 'warning'} size="small" />
                      <Chip
                        label={ENCOUNTER_STATUS_LABEL[row.status]}
                        color={queueStatusColor[row.status]}
                        variant="outlined"
                        size="small"
                      />
                      {row.queuePriority === 'Urgent' ? (
                        <Chip size="small" color="error" label="Emergency" icon={<BoltIcon fontSize="small" />} />
                      ) : null}
                    </Stack>
                  ),
                },
                {
                  id: 'wait',
                  label: 'Wait',
                  render: (row) => (
                    <Typography variant="body2" color="text.secondary">
                      {row.stage === 'Waiting' ? `${row.waitMinutes} min` : '--'}
                    </Typography>
                  ),
                },
                {
                  id: 'actions',
                  label: 'Actions',
                  align: 'right',
                  render: (row) => (
                    <Stack direction="row" spacing={0.7} justifyContent="flex-end">
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<PlayArrowIcon />}
                        onClick={() => handleStartConsult(row)}
                      >
                        {row.stage === 'In Progress' ? 'Open Consult' : 'Start Consult'}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<HistoryIcon />}
                        onClick={() => handleViewHistory(row)}
                      >
                        View History
                      </Button>
                    </Stack>
                  ),
                },
              ]}
            />
          </Box>
        </Card>
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
