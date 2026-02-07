'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import { Alert, Avatar, Box, Button, Chip, Divider, InputAdornment, List, ListItemButton, ListItemText, MenuItem, Snackbar, Stack, TextField, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import {
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  MonitorHeart as MonitorHeartIcon,
  Search as SearchIcon,
  Send as SendIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import OpdFlowHeader from './components/OpdFlowHeader';
import {
  AppointmentStatus,
  OPD_ENCOUNTERS,
  OPD_PROVIDERS,
  OpdEncounterCase,
} from './opd-mock-data';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { getPatientByMrn } from '@/src/mocks/global-patients';

interface QueueItem extends OpdEncounterCase {
  token: string;
  waitMinutes: number;
  triageLevel: 'Low' | 'Moderate' | 'High';
  nurseAssigned: string;
}

interface QueueTriageForm {
  bp: string;
  hr: string;
  rr: string;
  temp: string;
  spo2: string;
  weightKg: string;
  bmi: string;
  triageNote: string;
  triageLevel: 'Low' | 'Moderate' | 'High';
  assignedDoctor: string;
}

const queueStatusColor: Record<AppointmentStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  Scheduled: 'default',
  'Checked-In': 'info',
  'In Triage': 'warning',
  'In Consultation': 'warning',
  Completed: 'success',
  'No Show': 'error',
};

function buildQueueData(): QueueItem[] {
  return OPD_ENCOUNTERS.map((encounter, index) => ({
    ...encounter,
    token: `Q-${String(index + 1).padStart(3, '0')}`,
    waitMinutes: encounter.status === 'Completed' ? 0 : 7 + index * 6,
    triageLevel: encounter.queuePriority === 'Urgent' ? 'High' : index % 2 === 0 ? 'Moderate' : 'Low',
    nurseAssigned: index % 2 === 0 ? 'Nurse Priya' : 'Nurse Kavya',
  }));
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

function getQueueForm(item: QueueItem): QueueTriageForm {
  return {
    bp: item.vitals.bp,
    hr: item.vitals.hr,
    rr: item.vitals.rr,
    temp: item.vitals.temp,
    spo2: item.vitals.spo2,
    weightKg: item.vitals.weightKg,
    bmi: item.vitals.bmi,
    triageNote: item.triageNote,
    triageLevel: item.triageLevel,
    assignedDoctor: item.doctor,
  };
}

export default function OpdQueuePage() {
  const router = useRouter();
  const mrnParam = useMrnParam();
  const [queue, setQueue] = React.useState<QueueItem[]>(buildQueueData());
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'All' | AppointmentStatus>('All');
  const [selectedId, setSelectedId] = React.useState(queue[0]?.id ?? '');
  const [mrnApplied, setMrnApplied] = React.useState(false);
  const [triageForm, setTriageForm] = React.useState<QueueTriageForm>(() =>
    queue[0] ? getQueueForm(queue[0]) : {
      bp: '',
      hr: '',
      rr: '',
      temp: '',
      spo2: '',
      weightKg: '',
      bmi: '',
      triageNote: '',
      triageLevel: 'Low',
      assignedDoctor: OPD_PROVIDERS[0],
    }
  );
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
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesQuery =
        query.length === 0 ||
        [item.patientName, item.mrn, item.chiefComplaint, item.doctor, item.department]
          .join(' ')
          .toLowerCase()
          .includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [queue, search, statusFilter]);

  React.useEffect(() => {
    if (!selectedId && filteredQueue.length > 0) {
      setSelectedId(filteredQueue[0].id);
      return;
    }

    const exists = filteredQueue.some((item) => item.id === selectedId);
    if (!exists && filteredQueue.length > 0) {
      setSelectedId(filteredQueue[0].id);
    }
  }, [filteredQueue, selectedId]);

  const selectedItem = React.useMemo(
    () => queue.find((item) => item.id === selectedId),
    [queue, selectedId]
  );

  const flowMrn = selectedItem?.mrn ?? mrnParam;
  const seededPatient = getPatientByMrn(flowMrn);
  const flowName = selectedItem?.patientName || seededPatient?.name;
  const pageSubtitle = formatPatientLabel(flowName, flowMrn);
  const withMrn = React.useCallback(
    (route: string) => (flowMrn ? `${route}?mrn=${flowMrn}` : route),
    [flowMrn]
  );

  React.useEffect(() => {
    if (!selectedItem) {
      return;
    }
    setTriageForm(getQueueForm(selectedItem));
  }, [selectedItem?.id]);

  React.useEffect(() => {
    if (!mrnParam || mrnApplied) return;
    const match = queue.find((item) => item.mrn === mrnParam);
    if (match) {
      setSelectedId(match.id);
      setSearch(mrnParam);
    }
    setMrnApplied(true);
  }, [mrnParam, mrnApplied, queue]);

  const checkedInCount = queue.filter((item) => item.status === 'Checked-In').length;
  const triageCount = queue.filter((item) => item.status === 'In Triage').length;
  const consultCount = queue.filter((item) => item.status === 'In Consultation').length;
  const completedCount = queue.filter((item) => item.status === 'Completed').length;

  const updateTriageField = <K extends keyof QueueTriageForm>(
    field: K,
    value: QueueTriageForm[K]
  ) => {
    setTriageForm((prev) => ({ ...prev, [field]: value }));
  };

  const persistSelectedQueueItem = (nextStatus?: AppointmentStatus) => {
    if (!selectedItem) return;

    setQueue((prev) =>
      prev.map((item) => {
        if (item.id !== selectedItem.id) {
          return item;
        }
        return {
          ...item,
          status: nextStatus ?? item.status,
          triageNote: triageForm.triageNote,
          triageLevel: triageForm.triageLevel,
          doctor: triageForm.assignedDoctor,
          waitMinutes: nextStatus === 'Completed' ? 0 : item.waitMinutes,
          vitals: {
            bp: triageForm.bp,
            hr: triageForm.hr,
            rr: triageForm.rr,
            temp: triageForm.temp,
            spo2: triageForm.spo2,
            weightKg: triageForm.weightKg,
            bmi: triageForm.bmi,
          },
        };
      })
    );
  };

  const handleSaveTriage = () => {
    persistSelectedQueueItem();
    setSnackbar({
      open: true,
      message: 'Triage details saved.',
      severity: 'info',
    });
  };

  const handleMoveStatus = (nextStatus: AppointmentStatus, message: string) => {
    persistSelectedQueueItem(nextStatus);
    setSnackbar({
      open: true,
      message,
      severity: 'success',
    });
  };

  return (
    <PageTemplate title="Appointments Queue" subtitle={pageSubtitle} currentPageTitle="Queue">
      <Stack spacing={2}>
        <OpdFlowHeader
          activeStep="queue"
          title="OPD Front Desk and Triage Queue"
          description="Track arrivals, capture triage data, and route patients to consulting doctors."
          patientMrn={flowMrn}
          patientName={flowName}
          primaryAction={{ label: 'Open Visit Workspace', route: '/appointments/visit' }}
        />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Checked-In
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {checkedInCount}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                In Triage
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {triageCount}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                In Consultation
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.dark' }}>
                {consultCount}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Completed
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {completedCount}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} lg={3.5}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <Stack spacing={1.3}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Live Queue
                </Typography>

                <TextField
                  size="small"
                  placeholder="Search MRN, complaint, doctor..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  size="small"
                  select
                  label="Status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as 'All' | AppointmentStatus)}
                >
                  {['All', 'Scheduled', 'Checked-In', 'In Triage', 'In Consultation', 'Completed', 'No Show'].map(
                    (status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    )
                  )}
                </TextField>

                <List sx={{ p: 0 }}>
                  {filteredQueue.map((item) => (
                    <ListItemButton
                      key={item.id}
                      selected={item.id === selectedId}
                      onClick={() => setSelectedId(item.id)}
                      sx={{
                        mb: 1,
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: item.id === selectedId ? 'primary.main' : 'divider',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Stack direction="row" spacing={1.25} sx={{ width: '100%' }}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 13 }}>
                          {getInitials(item.patientName)}
                        </Avatar>
                        <Box sx={{ width: '100%' }}>
                          <ListItemText
                            primary={<Typography variant="body2" sx={{ fontWeight: 700 }}>{item.patientName}</Typography>}
                            secondary={<Typography variant="caption" color="text.secondary">{item.token} · {item.mrn}</Typography>}
                          />
                          <Stack direction="row" spacing={0.75} flexWrap="wrap">
                            <Chip size="small" variant="outlined" label={`${item.waitMinutes} min`} icon={<AccessTimeIcon />} />
                            <Chip size="small" color={queueStatusColor[item.status]} label={item.status} />
                          </Stack>
                        </Box>
                      </Stack>
                    </ListItemButton>
                  ))}
                </List>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} lg={5.5}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              {!selectedItem ? (
                <Typography variant="body2" color="text.secondary">
                  Select a queue patient to start triage.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                  >
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Triage Workspace
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedItem.patientName} · {selectedItem.chiefComplaint}
                      </Typography>
                    </Box>
                    <Chip label={selectedItem.token} color="primary" />
                  </Stack>

                  <Divider />

                  <Grid container spacing={1.2}>
                    <Grid item xs={12} sm={4}>
                      <TextField fullWidth label="BP" value={triageForm.bp} onChange={(event) => updateTriageField('bp', event.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField fullWidth label="HR" value={triageForm.hr} onChange={(event) => updateTriageField('hr', event.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField fullWidth label="RR" value={triageForm.rr} onChange={(event) => updateTriageField('rr', event.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField fullWidth label="Temp" value={triageForm.temp} onChange={(event) => updateTriageField('temp', event.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField fullWidth label="SpO2" value={triageForm.spo2} onChange={(event) => updateTriageField('spo2', event.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField fullWidth label="Wt" value={triageForm.weightKg} onChange={(event) => updateTriageField('weightKg', event.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField fullWidth label="BMI" value={triageForm.bmi} onChange={(event) => updateTriageField('bmi', event.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label="Assigned Doctor"
                        value={triageForm.assignedDoctor}
                        onChange={(event) => updateTriageField('assignedDoctor', event.target.value)}
                      >
                        {OPD_PROVIDERS.map((provider) => (
                          <MenuItem key={provider} value={provider}>
                            {provider}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label="Triage Level"
                        value={triageForm.triageLevel}
                        onChange={(event) =>
                          updateTriageField(
                            'triageLevel',
                            event.target.value as 'Low' | 'Moderate' | 'High'
                          )
                        }
                      >
                        {['Low', 'Moderate', 'High'].map((level) => (
                          <MenuItem key={level} value={level}>
                            {level}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>

                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="Triage Note"
                    value={triageForm.triageNote}
                    onChange={(event) => updateTriageField('triageNote', event.target.value)}
                  />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
                    <Button variant="outlined" onClick={handleSaveTriage}>
                      Save Triage
                    </Button>
                    <Button
                      variant="outlined"
                      color="info"
                      onClick={() =>
                        handleMoveStatus(
                          'In Triage',
                          `${selectedItem.patientName} moved to In Triage state.`
                        )
                      }
                    >
                      Mark In Triage
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SendIcon />}
                      onClick={() =>
                        handleMoveStatus(
                          'In Consultation',
                          `${selectedItem.patientName} sent to doctor consultation.`
                        )
                      }
                    >
                      Send to Doctor
                    </Button>
                  </Stack>
                </Stack>
              )}
            </Card>
          </Grid>

          <Grid item xs={12} lg={3}>
            <Stack spacing={2}>
              <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Queue Alerts
                  </Typography>
                  {queue
                    .filter((item) => item.triageLevel === 'High' && item.status !== 'Completed')
                    .map((item) => (
                      <Stack key={item.id} direction="row" spacing={1} alignItems="flex-start">
                        <WarningAmberIcon color="error" fontSize="small" sx={{ mt: 0.1 }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.patientName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.chiefComplaint}
                          </Typography>
                        </Box>
                      </Stack>
                    ))}
                </Stack>
              </Card>

              <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Continue OPD Flow
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<MonitorHeartIcon />}
                    onClick={() => router.push(withMrn('/clinical/vitals'))}
                  >
                    Capture Vitals
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => router.push(withMrn('/appointments/visit'))}
                  >
                    Open Visit UI
                  </Button>
                  <Button variant="text" onClick={() => router.push(withMrn('/clinical/orders'))}>
                    Go to Orders
                  </Button>
                </Stack>
              </Card>
            </Stack>
          </Grid>
        </Grid>

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
      </Stack>
    </PageTemplate>
  );
}
