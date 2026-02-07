'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import { Alert, Box, Button, Checkbox, Chip, FormControlLabel, InputAdornment, MenuItem, Snackbar, Stack, TextField, Typography } from '@/src/ui/components/atoms';
import { Card, StatTile } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import {
  Bed as BedIcon,
  CheckCircle as CheckCircleIcon,
  CleaningServices as CleaningServicesIcon,
  Hotel as HotelIcon,
  Search as SearchIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import IpdFlowHeader from './components/IpdFlowHeader';
import {
  BedStatus,
  INITIAL_BED_BOARD,
  INPATIENT_STAYS,
  WardBed,
} from './ipd-mock-data';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { getPatientByMrn } from '@/src/mocks/global-patients';

interface BedAllocationForm {
  patientId: string;
  targetBedId: string;
  transferReason: string;
  notes: string;
  isolation: boolean;
}

interface BedMovementLog {
  id: string;
  patientName: string;
  action: 'Allocation' | 'Transfer';
  fromBed: string;
  toBed: string;
  time: string;
  operator: string;
}

const statusColorMap: Record<BedStatus, 'success' | 'info' | 'warning' | 'error'> = {
  Available: 'success',
  Occupied: 'info',
  Cleaning: 'warning',
  Reserved: 'warning',
  Blocked: 'error',
};

function getBedCardBorderColor(status: BedStatus): string {
  if (status === 'Available') return 'success.main';
  if (status === 'Occupied') return 'info.main';
  if (status === 'Cleaning') return 'warning.main';
  if (status === 'Reserved') return 'warning.main';
  return 'error.main';
}

function formatNowTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function clearPatientData(bed: WardBed): WardBed {
  return {
    ...bed,
    patientId: undefined,
    patientName: undefined,
    mrn: undefined,
    diagnosis: undefined,
    isolation: false,
  };
}

export default function IpdBedManagementPage() {
  const router = useRouter();
  const mrnParam = useMrnParam();
  const [bedBoard, setBedBoard] = React.useState<WardBed[]>(INITIAL_BED_BOARD);
  const [wardFilter, setWardFilter] = React.useState<'All' | string>('All');
  const [statusFilter, setStatusFilter] = React.useState<'All' | BedStatus>('All');
  const [search, setSearch] = React.useState('');
  const [allocation, setAllocation] = React.useState<BedAllocationForm>({
    patientId: INPATIENT_STAYS[0]?.id ?? '',
    targetBedId: '',
    transferReason: 'New Admission',
    notes: '',
    isolation: false,
  });
  const [movementLog, setMovementLog] = React.useState<BedMovementLog[]>([
    {
      id: 'log-1',
      patientName: 'Sneha Patil',
      action: 'Allocation',
      fromBed: '-',
      toBed: 'A-04',
      time: '08:35 AM',
      operator: 'Ward Desk',
    },
    {
      id: 'log-2',
      patientName: 'Rahul Menon',
      action: 'Transfer',
      fromBed: 'ER-OBS-02',
      toBed: 'B-12',
      time: '09:12 AM',
      operator: 'Bed Control',
    },
  ]);

  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [mrnApplied, setMrnApplied] = React.useState(false);

  const selectedPatient = React.useMemo(
    () => INPATIENT_STAYS.find((patient) => patient.id === allocation.patientId),
    [allocation.patientId]
  );

  const currentBed = React.useMemo(
    () => bedBoard.find((bed) => bed.patientId === allocation.patientId),
    [bedBoard, allocation.patientId]
  );

  const seededPatient = getPatientByMrn(selectedPatient?.mrn ?? mrnParam);
  const displayName = selectedPatient?.patientName || seededPatient?.name;
  const displayMrn = selectedPatient?.mrn || seededPatient?.mrn || mrnParam;
  const pageSubtitle = formatPatientLabel(displayName, displayMrn);

  const wardOptions = React.useMemo(() => {
    const wards = new Set<string>();
    bedBoard.forEach((bed) => wards.add(bed.ward));
    return ['All', ...Array.from(wards).sort((a, b) => a.localeCompare(b))];
  }, [bedBoard]);

  const filteredBedBoard = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    return bedBoard.filter((bed) => {
      const matchesWard = wardFilter === 'All' || bed.ward === wardFilter;
      const matchesStatus = statusFilter === 'All' || bed.status === statusFilter;
      const matchesSearch =
        query.length === 0 ||
        [
          bed.ward,
          bed.room,
          bed.bedNumber,
          bed.patientName ?? '',
          bed.mrn ?? '',
          bed.status,
          bed.bedType,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query);

      return matchesWard && matchesStatus && matchesSearch;
    });
  }, [bedBoard, wardFilter, statusFilter, search]);

  const allocatableBeds = React.useMemo(
    () =>
      bedBoard.filter(
        (bed) =>
          (bed.status === 'Available' || bed.status === 'Reserved') ||
          bed.patientId === allocation.patientId
      ),
    [bedBoard, allocation.patientId]
  );

  const totalBeds = bedBoard.length;
  const occupiedBeds = bedBoard.filter((bed) => bed.status === 'Occupied').length;
  const availableBeds = bedBoard.filter((bed) => bed.status === 'Available').length;
  const blockedBeds = bedBoard.filter(
    (bed) => bed.status === 'Blocked' || bed.status === 'Cleaning'
  ).length;

  const occupancyPercent = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const updateAllocationField = <K extends keyof BedAllocationForm>(
    field: K,
    value: BedAllocationForm[K]
  ) => {
    setAllocation((prev) => ({ ...prev, [field]: value }));
  };

  React.useEffect(() => {
    if (!mrnParam || mrnApplied) return;
    const stay = INPATIENT_STAYS.find((patient) => patient.mrn === mrnParam);
    if (stay) {
      setAllocation((prev) => ({ ...prev, patientId: stay.id }));
    }
    const bed = bedBoard.find((item) => item.mrn === mrnParam);
    if (bed) {
      setSearch(mrnParam);
      setWardFilter('All');
      setStatusFilter('All');
    }
    setMrnApplied(true);
  }, [mrnParam, mrnApplied, bedBoard]);

  const handleAssignBed = () => {
    if (!selectedPatient) {
      setSnackbar({
        open: true,
        message: 'Select a patient to allocate a bed.',
        severity: 'error',
      });
      return;
    }

    if (!allocation.targetBedId) {
      setSnackbar({
        open: true,
        message: 'Select a target bed for allocation or transfer.',
        severity: 'error',
      });
      return;
    }

    const targetBed = bedBoard.find((bed) => bed.id === allocation.targetBedId);
    if (!targetBed) {
      setSnackbar({
        open: true,
        message: 'Selected bed was not found.',
        severity: 'error',
      });
      return;
    }

    if (currentBed?.id === targetBed.id) {
      setSnackbar({
        open: true,
        message: `${selectedPatient.patientName} is already in ${targetBed.bedNumber}.`,
        severity: 'info',
      });
      return;
    }

    if (targetBed.status === 'Blocked' || targetBed.status === 'Cleaning') {
      setSnackbar({
        open: true,
        message: `${targetBed.bedNumber} is currently ${targetBed.status.toLowerCase()}.`,
        severity: 'error',
      });
      return;
    }

    if (targetBed.status === 'Occupied' && targetBed.patientId !== selectedPatient.id) {
      setSnackbar({
        open: true,
        message: `${targetBed.bedNumber} is occupied by another patient.`,
        severity: 'error',
      });
      return;
    }

    setBedBoard((prev) =>
      prev.map((bed) => {
        if (bed.id === targetBed.id) {
          return {
            ...bed,
            status: 'Occupied',
            patientId: selectedPatient.id,
            patientName: selectedPatient.patientName,
            mrn: selectedPatient.mrn,
            diagnosis: selectedPatient.diagnosis,
            isolation: allocation.isolation,
          };
        }

        if (bed.patientId === selectedPatient.id && bed.id !== targetBed.id) {
          return {
            ...clearPatientData(bed),
            status: 'Cleaning',
          };
        }

        return bed;
      })
    );

    const logEntry: BedMovementLog = {
      id: `log-${Date.now()}`,
      patientName: selectedPatient.patientName,
      action: currentBed ? 'Transfer' : 'Allocation',
      fromBed: currentBed?.bedNumber ?? '-',
      toBed: targetBed.bedNumber,
      time: formatNowTime(),
      operator: 'Bed Control Desk',
    };

    setMovementLog((prev) => [logEntry, ...prev]);
    setAllocation((prev) => ({ ...prev, targetBedId: '', notes: '' }));

    setSnackbar({
      open: true,
      message: `${logEntry.action} completed for ${selectedPatient.patientName}.`,
      severity: 'success',
    });
  };

  return (
    <PageTemplate title="Bed / Ward Management" subtitle={pageSubtitle} currentPageTitle="Beds">
      <Stack spacing={2}>
        <IpdFlowHeader
          activeStep="beds"
          title="Bed Allocation and Ward Operations"
          description="Track occupancy, assign available beds, and process intra-ward transfers before physician rounds."
          patientMrn={displayMrn}
          patientName={displayName}
          primaryAction={{
            label: 'Go to Rounds',
            route: '/ipd/rounds',
          }}
        />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <StatTile
              label="Occupancy"
              value={`${occupancyPercent}%`}
              tone="info"
              icon={<HotelIcon sx={{ fontSize: 32 }} />}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <StatTile
              label="Available Beds"
              value={availableBeds}
              tone="success"
              icon={<CheckCircleIcon sx={{ fontSize: 32 }} />}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <StatTile
              label="Occupied Beds"
              value={occupiedBeds}
              tone="warning"
              icon={<BedIcon sx={{ fontSize: 32 }} />}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <StatTile
              label="Blocked / Cleaning"
              value={blockedBeds}
              tone="error"
              icon={<CleaningServicesIcon sx={{ fontSize: 32 }} />}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} lg={8}>
            <Card
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack spacing={1.5}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1.2}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Bed Board
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      size="small"
                      placeholder="Search bed, patient, ward..."
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
                      label="Ward"
                      value={wardFilter}
                      onChange={(event) => setWardFilter(event.target.value)}
                      sx={{ minWidth: 170 }}
                    >
                      {wardOptions.map((ward) => (
                        <MenuItem key={ward} value={ward}>
                          {ward}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      size="small"
                      select
                      label="Status"
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value as 'All' | BedStatus)}
                      sx={{ minWidth: 170 }}
                    >
                      {['All', 'Available', 'Occupied', 'Cleaning', 'Reserved', 'Blocked'].map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                </Stack>

                <Box
                  sx={{
                    display: 'grid',
                    gap: 1.2,
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, minmax(0, 1fr))',
                      md: 'repeat(3, minmax(0, 1fr))',
                    },
                    alignItems: 'stretch',
                  }}
                >
                  {filteredBedBoard.map((bed) => {
                    const isSelected = allocation.targetBedId === bed.id;
                    const statusColor = getBedCardBorderColor(bed.status);
                    return (
                      <Box key={bed.id} sx={{ display: 'flex', minWidth: 0, width: '100%' }}>
                        <Card
                          elevation={0}
                          onClick={() => updateAllocationField('targetBedId', bed.id)}
                          sx={{
                            p: 1.4,
                            borderRadius: 1.6,
                            border: '1.5px solid',
                            borderColor: isSelected ? 'primary.main' : statusColor,
                            cursor: 'pointer',
                            backgroundColor: isSelected ? 'primary.50' : 'background.paper',
                            transition: 'all 0.15s ease-in-out',
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            // aspectRatio: '4 / 3',
                            overflow: 'hidden',
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: 2,
                            },
                          }}
                        >
                          <Stack spacing={0.8} sx={{ height: '100%' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {bed.bedNumber}
                              </Typography>
                              <Chip
                                size="small"
                                color={statusColorMap[bed.status]}
                                label={bed.status}
                              />
                            </Stack>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            >
                              {bed.ward} · {bed.room} · {bed.bedType}
                            </Typography>

                            <Box sx={{ flex: 1, minHeight: 0 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  minHeight: '1.4em',
                                  color: bed.patientName ? 'text.primary' : 'text.secondary',
                                }}
                              >
                                {bed.patientName ?? 'No patient assigned'}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  minHeight: '2.8em',
                                  visibility: bed.patientName ? 'visible' : 'hidden',
                                }}
                              >
                                {bed.mrn} · {bed.diagnosis}
                              </Typography>
                            </Box>

                            <Box sx={{ minHeight: 22 }}>
                              {bed.isolation ? (
                                <Chip size="small" label="Isolation" color="warning" variant="outlined" />
                              ) : null}
                            </Box>
                          </Stack>
                        </Card>
                      </Box>
                    );
                  })}
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Stack spacing={2}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack spacing={1.2}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Allocation / Transfer
                  </Typography>

                  <TextField
                    select
                    label="Patient"
                    value={allocation.patientId}
                    onChange={(event) => updateAllocationField('patientId', event.target.value)}
                  >
                    {INPATIENT_STAYS.map((patient) => (
                      <MenuItem key={patient.id} value={patient.id}>
                        {patient.patientName} ({patient.mrn})
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Target Bed"
                    value={allocation.targetBedId}
                    onChange={(event) => updateAllocationField('targetBedId', event.target.value)}
                  >
                    {allocatableBeds.map((bed) => (
                      <MenuItem key={bed.id} value={bed.id}>
                        {bed.bedNumber} · {bed.ward} ({bed.status})
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Reason"
                    value={allocation.transferReason}
                    onChange={(event) => updateAllocationField('transferReason', event.target.value)}
                  >
                    {['New Admission', 'Clinical Transfer', 'Infection Isolation', 'Patient Preference'].map(
                      (reason) => (
                        <MenuItem key={reason} value={reason}>
                          {reason}
                        </MenuItem>
                      )
                    )}
                  </TextField>

                  <TextField
                    multiline
                    minRows={3}
                    label="Notes"
                    value={allocation.notes}
                    onChange={(event) => updateAllocationField('notes', event.target.value)}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={allocation.isolation}
                        onChange={(event) => updateAllocationField('isolation', event.target.checked)}
                      />
                    }
                    label="Mark as isolation bed"
                  />

                  {selectedPatient ? (
                    <Card variant="outlined" sx={{ p: 1.2, borderRadius: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Selected patient
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {selectedPatient.patientName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Current bed: {currentBed?.bedNumber ?? 'Not assigned'}
                      </Typography>
                    </Card>
                  ) : null}

                  <Button
                    variant="contained"
                    startIcon={<SwapHorizIcon />}
                    onClick={handleAssignBed}
                  >
                    Confirm Allocation
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() =>
                      router.push(
                        selectedPatient?.mrn
                          ? `/ipd/rounds?mrn=${selectedPatient.mrn}`
                          : mrnParam
                          ? `/ipd/rounds?mrn=${mrnParam}`
                          : '/ipd/rounds'
                      )
                    }
                  >
                    Continue to Rounds
                  </Button>
                </Stack>
              </Card>

              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack spacing={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Bed Movement Log
                  </Typography>

                  {movementLog.slice(0, 6).map((entry) => (
                    <Stack key={entry.id} spacing={0.25} sx={{ py: 0.65, borderBottom: '1px dashed', borderColor: 'divider' }}>
                      <Stack direction="row" justifyContent="space-between" spacing={1}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {entry.patientName}
                        </Typography>
                        <Chip
                          size="small"
                          color={entry.action === 'Transfer' ? 'warning' : 'success'}
                          label={entry.action}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {entry.fromBed} {'>'} {entry.toBed} · {entry.time} · {entry.operator}
                      </Typography>
                    </Stack>
                  ))}

                  {movementLog.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No bed movement recorded.
                    </Typography>
                  ) : null}
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
