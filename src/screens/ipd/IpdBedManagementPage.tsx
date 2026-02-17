'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { alpha } from '@/src/ui/theme';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import {
  Bed as BedIcon,
  CheckCircle as CheckCircleIcon,
  CleaningServices as CleaningServicesIcon,
  Hotel as HotelIcon,
  Search as SearchIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import {
  ADMISSION_LEADS,
  BedStatus,
  INITIAL_BED_BOARD,
  INPATIENT_STAYS,
  WardBed,
} from './ipd-mock-data';
import {
  IPD_COLORS,
  IpdMetricCard,
  IpdSectionCard,
  ipdFormStylesSx,
} from './components/ipd-ui';
import IpdModuleTabs from './components/IpdModuleTabs';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { getPatientByMrn } from '@/src/mocks/global-patients';
import { assignIpdEncounterBed } from './ipd-encounter-context';

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

type BedCensusTab = 'bed-board' | 'waiting' | 'inpatient-list' | 'transfers' | 'isolation';

const BED_CENSUS_TABS: Array<{ id: BedCensusTab; label: string }> = [
  { id: 'bed-board', label: 'Bed Board' },
  { id: 'waiting', label: 'Waiting for Bed' },
  { id: 'inpatient-list', label: 'Inpatient List' },
  { id: 'transfers', label: 'Transfers' },
  { id: 'isolation', label: 'Isolation' },
];

function isBedCensusTab(value: string | null): value is BedCensusTab {
  return value !== null && BED_CENSUS_TABS.some((tab) => tab.id === value);
}

const bedStatusColorMap: Record<BedStatus, string> = {
  Available: IPD_COLORS.success,
  Occupied: IPD_COLORS.danger,
  Cleaning: IPD_COLORS.warning,
  Reserved: IPD_COLORS.warning,
  Blocked: IPD_COLORS.primary,
};

const bedStatusBackgroundMap: Record<BedStatus, string> = {
  Available: alpha(IPD_COLORS.success, 0.06),
  Occupied: alpha(IPD_COLORS.danger, 0.05),
  Cleaning: alpha(IPD_COLORS.warning, 0.08),
  Reserved: alpha(IPD_COLORS.warning, 0.08),
  Blocked: alpha(IPD_COLORS.primary, 0.08),
};

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
  const searchParams = useSearchParams();
  const mrnParam = useMrnParam();
  const [bedBoard, setBedBoard] = React.useState<WardBed[]>(INITIAL_BED_BOARD);
  const [activeTab, setActiveTab] = React.useState<BedCensusTab>('bed-board');
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

  React.useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (isBedCensusTab(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

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

  const waitingForBedRows = React.useMemo(() => {
    return ADMISSION_LEADS.filter((lead) => {
      const alreadyAllocated = bedBoard.some((bed) => bed.mrn === lead.mrn && bed.status === 'Occupied');
      return !alreadyAllocated;
    });
  }, [bedBoard]);

  const inpatientRows = React.useMemo(() => {
    return INPATIENT_STAYS.map((patient) => {
      const bed = bedBoard.find((entry) => entry.patientId === patient.id);
      return {
        ...patient,
        currentBed: bed?.bedNumber ?? patient.bed,
        currentWard: bed?.ward ?? patient.ward,
        status: bed?.status ?? 'Occupied',
      };
    });
  }, [bedBoard]);

  const isolationRows = React.useMemo(
    () => bedBoard.filter((bed) => bed.isolation || bed.ward === 'ICU'),
    [bedBoard]
  );

  const updateTabInRoute = React.useCallback(
    (nextTab: BedCensusTab) => {
      setActiveTab(nextTab);
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', nextTab);
      if (displayMrn) {
        params.set('mrn', displayMrn);
      }
      const query = params.toString();
      router.replace(query ? `/ipd/beds?${query}` : '/ipd/beds', { scroll: false });
    },
    [displayMrn, router, searchParams]
  );

  const openClinicalCare = React.useCallback(
    (mrn?: string, tab: string = 'rounds') => {
      const params = new URLSearchParams();
      const contextMrn = mrn || displayMrn;
      if (contextMrn) params.set('mrn', contextMrn);
      params.set('tab', tab);
      const query = params.toString();
      router.push(query ? `/ipd/rounds?${query}` : '/ipd/rounds');
    },
    [displayMrn, router]
  );

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
    assignIpdEncounterBed(
      selectedPatient.id,
      targetBed.bedNumber,
      targetBed.ward,
      selectedPatient.diagnosis
    );

    setSnackbar({
      open: true,
      message: `${logEntry.action} completed for ${selectedPatient.patientName}.`,
      severity: 'success',
    });
  };

  return (
    <PageTemplate title="Bed & Census" subtitle={pageSubtitle} currentPageTitle="Bed & Census">
      <Stack spacing={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <IpdMetricCard
              label="Occupancy"
              value={`${occupancyPercent}%`}
              trend={`${occupiedBeds} of ${totalBeds} beds occupied`}
              tone="info"
              icon={<HotelIcon sx={{ fontSize: 32 }} />}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <IpdMetricCard
              label="Available Beds"
              value={availableBeds}
              trend="Ready for new admissions"
              tone="success"
              icon={<CheckCircleIcon sx={{ fontSize: 32 }} />}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <IpdMetricCard
              label="Occupied Beds"
              value={occupiedBeds}
              trend="Inpatient census"
              tone="warning"
              icon={<BedIcon sx={{ fontSize: 32 }} />}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <IpdMetricCard
              label="Blocked / Cleaning"
              value={blockedBeds}
              trend="Temporarily unavailable"
              tone="danger"
              icon={<CleaningServicesIcon sx={{ fontSize: 32 }} />}
            />
          </Grid>
        </Grid>

        <IpdSectionCard
          title="Bed & Census Workspace"
          subtitle="Manage bed board, waiting queue, inpatient list, transfers, and isolation workflow."
          action={
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" onClick={() => openClinicalCare(undefined, 'rounds')}>
                Open Clinical Care
              </Button>
            </Stack>
          }
        >
          <IpdModuleTabs
            tabs={BED_CENSUS_TABS}
            value={activeTab}
            onChange={(value) => updateTabInRoute(value as BedCensusTab)}
          />
        </IpdSectionCard>

        {activeTab === 'bed-board' ? (
          <Grid container spacing={2}>
          <Grid item xs={12} lg={8}>
            <IpdSectionCard
              title="Bed Management"
              subtitle="Monitor occupancy, filter wards, and assign the right bed."
              bodySx={ipdFormStylesSx}
            >
              <Stack spacing={1.5}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1.2}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                >
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
                    const statusColor = bedStatusColorMap[bed.status];
                    return (
                      <Box key={bed.id} sx={{ display: 'flex', minWidth: 0, width: '100%' }}>
                        <Card
                          elevation={0}
                          onClick={() => updateAllocationField('targetBedId', bed.id)}
                          sx={{
                            p: 1.4,
                            borderRadius: 1.6,
                            border: '2px solid',
                            borderColor: isSelected ? IPD_COLORS.primary : statusColor,
                            cursor: 'pointer',
                            backgroundColor: isSelected
                              ? alpha(IPD_COLORS.accent, 0.09)
                              : bedStatusBackgroundMap[bed.status],
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
                              <Typography variant="body2" sx={{ fontWeight: 700, color: IPD_COLORS.primary }}>
                                {bed.bedNumber}
                              </Typography>
                              <Chip
                                size="small"
                                label={bed.status}
                                sx={{
                                  fontWeight: 700,
                                  color: statusColor,
                                  border: '1px solid',
                                  borderColor: alpha(statusColor, 0.55),
                                  bgcolor: alpha(statusColor, 0.1),
                                }}
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
            </IpdSectionCard>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Stack spacing={2}>
              <IpdSectionCard
                title="Allocation / Transfer"
                subtitle="Assign beds for new admissions and clinical moves."
                bodySx={ipdFormStylesSx}
              >
                <Stack spacing={1.2}>
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
                    sx={{
                      background: `linear-gradient(135deg, ${IPD_COLORS.primary} 0%, ${IPD_COLORS.primaryLight} 100%)`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${IPD_COLORS.primaryLight} 0%, ${IPD_COLORS.primary} 100%)`,
                      },
                    }}
                  >
                    Confirm Allocation
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => openClinicalCare(selectedPatient?.mrn, 'rounds')}
                  >
                    Continue to Rounds
                  </Button>
                </Stack>
              </IpdSectionCard>

              <IpdSectionCard
                title="Bed Movement Log"
                subtitle="Latest patient allocations and transfers."
              >
                <Stack spacing={1}>
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
              </IpdSectionCard>
            </Stack>
          </Grid>
          </Grid>
        ) : null}

        {activeTab === 'waiting' ? (
          <IpdSectionCard
            title="Waiting for Bed"
            subtitle="Admission leads pending bed assignment."
          >
            <Stack spacing={1}>
              {waitingForBedRows.length === 0 ? (
                <Alert severity="success">All current admission leads are already mapped to beds.</Alert>
              ) : (
                waitingForBedRows.map((lead) => (
                  <Card key={lead.id} variant="outlined" sx={{ p: 1.2, borderRadius: 1.6 }}>
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      justifyContent="space-between"
                      spacing={1}
                      alignItems={{ xs: 'flex-start', md: 'center' }}
                    >
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {lead.patientName} ({lead.mrn})
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {lead.preferredWard} · {lead.consultant}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {lead.admissionReason}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.8} alignItems="center">
                        <Chip
                          size="small"
                          color={
                            lead.priority === 'Emergency'
                              ? 'error'
                              : lead.priority === 'Urgent'
                              ? 'warning'
                              : 'default'
                          }
                          label={lead.priority}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            const matchedPatient = INPATIENT_STAYS.find((item) => item.mrn === lead.mrn);
                            if (matchedPatient) {
                              updateAllocationField('patientId', matchedPatient.id);
                            }
                            updateTabInRoute('bed-board');
                          }}
                        >
                          Assign Bed
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>
                ))
              )}
            </Stack>
          </IpdSectionCard>
        ) : null}

        {activeTab === 'inpatient-list' ? (
          <IpdSectionCard title="Inpatient List" subtitle="Current census with bed and ward mapping.">
            <Stack spacing={1}>
              {inpatientRows.map((row) => (
                <Card key={row.id} variant="outlined" sx={{ p: 1.2, borderRadius: 1.6 }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {row.patientName} ({row.mrn})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {row.currentWard} · {row.currentBed} · {row.consultant}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.diagnosis}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <Chip size="small" label={row.status} color={row.status === 'Occupied' ? 'warning' : 'default'} />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => openClinicalCare(row.mrn, 'rounds')}
                      >
                        Clinical Care
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </IpdSectionCard>
        ) : null}

        {activeTab === 'transfers' ? (
          <IpdSectionCard title="Transfers" subtitle="Bed movement log and transfer workflow status.">
            <Stack spacing={1}>
              {movementLog.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No bed movement recorded.
                </Typography>
              ) : (
                movementLog.map((entry) => (
                  <Card key={entry.id} variant="outlined" sx={{ p: 1.2, borderRadius: 1.6 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {entry.patientName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {entry.fromBed} {'>'} {entry.toBed} · {entry.time}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Handled by {entry.operator}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        color={entry.action === 'Transfer' ? 'warning' : 'success'}
                        label={entry.action}
                      />
                    </Stack>
                  </Card>
                ))
              )}
            </Stack>
          </IpdSectionCard>
        ) : null}

        {activeTab === 'isolation' ? (
          <IpdSectionCard title="Isolation Beds" subtitle="Isolation and ICU status view for infection-control readiness.">
            <Stack spacing={1}>
              {isolationRows.length === 0 ? (
                <Alert severity="info">No isolation-designated beds are active right now.</Alert>
              ) : (
                isolationRows.map((bed) => (
                  <Card key={bed.id} variant="outlined" sx={{ p: 1.2, borderRadius: 1.6 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {bed.bedNumber} · {bed.ward}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {bed.patientName ?? 'No active patient'} {bed.mrn ? `(${bed.mrn})` : ''}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {bed.diagnosis ?? 'No diagnosis captured'} · {bed.status}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.8} alignItems="center">
                        <Chip
                          size="small"
                          color={bed.isolation ? 'warning' : 'default'}
                          label={bed.isolation ? 'Isolation' : 'ICU Monitor'}
                        />
                        {bed.mrn ? (
                          <Button size="small" variant="outlined" onClick={() => openClinicalCare(bed.mrn, 'rounds')}>
                            Clinical Care
                          </Button>
                        ) : null}
                      </Stack>
                    </Stack>
                  </Card>
                ))
              )}
            </Stack>
          </IpdSectionCard>
        ) : null}

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
