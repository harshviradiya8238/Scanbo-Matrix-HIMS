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
  BedStatus,
  DISCHARGE_CANDIDATES,
  INPATIENT_STAYS,
  INITIAL_BED_BOARD,
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
import { getPatientByMrn } from '@/src/mocks/global-patients';
import { usePermission } from '@/src/core/auth/usePermission';
import IpdPatientTopBar, { IpdPatientOption, IpdPatientTopBarField } from './components/IpdPatientTopBar';
import { assignIpdEncounterBed, useIpdEncounters } from './ipd-encounter-context';

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

interface BedPatient {
  id: string;
  mrn: string;
  patientName: string;
  consultant: string;
  diagnosis: string;
  ward: string;
  bed: string;
}

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

const INSURANCE_BY_PATIENT_ID: Record<string, string> = {
  'ipd-1': 'Star Health',
  'ipd-2': 'HDFC Ergo',
  'ipd-3': 'New India Assurance',
  'ipd-4': 'No Insurance',
};

const TOTAL_BILL_BY_PATIENT_ID: Record<string, number> = {
  'ipd-1': 67000,
  'ipd-2': 52000,
  'ipd-3': 182000,
  'ipd-4': 48000,
};

const INR_CURRENCY = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

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
  const patientIdParam = searchParams.get('patientId')?.trim() ?? '';
  const permissionGate = usePermission();
  const ipdEncounters = useIpdEncounters();
  const canManageBeds = permissionGate('ipd.beds.write');
  const [bedBoard, setBedBoard] = React.useState<WardBed[]>(INITIAL_BED_BOARD);
  const [activeTab, setActiveTab] = React.useState<BedCensusTab>('bed-board');
  const [wardFilter, setWardFilter] = React.useState<'All' | string>('All');
  const [statusFilter, setStatusFilter] = React.useState<'All' | BedStatus>('All');
  const [search, setSearch] = React.useState('');
  const [allocation, setAllocation] = React.useState<BedAllocationForm>({
    patientId: '',
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
  const appliedPatientIdRef = React.useRef<string>('');
  const appliedMrnRef = React.useRef<string>('');

  React.useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (isBedCensusTab(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const ipdPatients = React.useMemo<BedPatient[]>(
    () =>
      ipdEncounters
        .filter((record) => record.workflowStatus !== 'discharged')
        .map((record) => ({
          id: record.patientId,
          mrn: record.mrn,
          patientName: record.patientName,
          consultant: record.consultant,
          diagnosis: record.diagnosis,
          ward: record.ward,
          bed: record.bed,
        }))
        .sort((left, right) => left.patientName.localeCompare(right.patientName)),
    [ipdEncounters]
  );

  React.useEffect(() => {
    if (!allocation.patientId) return;
    if (ipdPatients.some((patient) => patient.id === allocation.patientId)) return;
    setAllocation((prev) => ({ ...prev, patientId: '', targetBedId: '' }));
  }, [allocation.patientId, ipdPatients]);

  const selectedPatient = React.useMemo(
    () => ipdPatients.find((patient) => patient.id === allocation.patientId),
    [allocation.patientId, ipdPatients]
  );

  const currentBed = React.useMemo(
    () => bedBoard.find((bed) => bed.patientId === allocation.patientId),
    [bedBoard, allocation.patientId]
  );

  const seededPatient = getPatientByMrn(selectedPatient?.mrn ?? mrnParam);
  const displayMrn = selectedPatient?.mrn || seededPatient?.mrn || mrnParam;

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
    return ipdPatients.filter((patient) => {
      const alreadyAllocated = bedBoard.some(
        (bed) => bed.patientId === patient.id && bed.status === 'Occupied'
      );
      return !alreadyAllocated;
    });
  }, [bedBoard, ipdPatients]);

  const inpatientRows = React.useMemo(() => {
    return ipdPatients.map((patient) => {
      const bed = bedBoard.find((entry) => entry.patientId === patient.id);
      return {
        ...patient,
        currentBed: bed?.bedNumber ?? patient.bed ?? 'Not assigned',
        currentWard: bed?.ward ?? patient.ward ?? '--',
        status: bed?.status ?? 'Occupied',
      };
    });
  }, [bedBoard, ipdPatients]);

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
      if (allocation.patientId) {
        params.set('patientId', allocation.patientId);
      }
      const query = params.toString();
      router.replace(query ? `/ipd/beds?${query}` : '/ipd/beds', { scroll: false });
    },
    [allocation.patientId, displayMrn, router, searchParams]
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

  const topBarPatientOptions = React.useMemo<IpdPatientOption[]>(() => {
    return ipdPatients.map((patient) => {
      const globalPatient = getPatientByMrn(patient.mrn);
      const stay = INPATIENT_STAYS.find((row) => row.id === patient.id || row.mrn === patient.mrn);
      const candidate = DISCHARGE_CANDIDATES.find((row) => row.patientId === patient.id);
      const bed = bedBoard.find((row) => row.patientId === patient.id);
      const status = patient.ward.toLowerCase().includes('icu')
        ? 'ICU'
        : candidate
        ? 'Discharge Due'
        : 'Admitted';
      const tags = ['Admitted'];
      if (candidate) tags.push('Discharge Due');
      if (patient.ward.toLowerCase().includes('icu') || patient.bed.toLowerCase().includes('icu')) tags.push('ICU');

      return {
        patientId: patient.id,
        name: patient.patientName,
        mrn: patient.mrn,
        ageGender: stay?.ageGender ?? globalPatient?.ageGender ?? '--',
        ward: bed?.ward ?? patient.ward ?? '--',
        bed: bed?.bedNumber ?? patient.bed ?? '--',
        consultant: patient.consultant || '--',
        diagnosis: patient.diagnosis || '--',
        status,
        statusTone: status === 'ICU' ? 'info' : status === 'Discharge Due' ? 'warning' : 'success',
        insurance: INSURANCE_BY_PATIENT_ID[patient.id] ?? '--',
        totalBill: TOTAL_BILL_BY_PATIENT_ID[patient.id] ?? 0,
        tags,
      };
    });
  }, [bedBoard, ipdPatients]);

  const selectedTopBarPatient = React.useMemo(
    () =>
      selectedPatient
        ? topBarPatientOptions.find((row) => row.patientId === selectedPatient.id) ?? null
        : topBarPatientOptions[0] ?? null,
    [selectedPatient, topBarPatientOptions]
  );

  const topBarFields = React.useMemo<IpdPatientTopBarField[]>(() => {
    const activePatient = selectedTopBarPatient;
    if (!activePatient) return [];
    const stay = INPATIENT_STAYS.find((row) => row.id === activePatient.patientId || row.mrn === activePatient.mrn);
    const candidate = DISCHARGE_CANDIDATES.find((row) => row.patientId === activePatient.patientId);
    const globalPatient = getPatientByMrn(activePatient.mrn);
    const allergies = globalPatient?.tags?.join(', ') || 'No known';
    const status = activePatient.status ?? 'Admitted';

    return [
      { id: 'age-sex', label: 'Age / Sex', value: stay?.ageGender ?? globalPatient?.ageGender ?? '--' },
      { id: 'ward-bed', label: 'Ward / Bed', value: `${activePatient.ward ?? '--'} · ${activePatient.bed ?? '--'}` },
      { id: 'admitted', label: 'Admitted', value: stay?.admissionDate ?? '--' },
      { id: 'los', label: 'LOS', value: candidate ? `Day ${candidate.losDays}` : '--' },
      { id: 'diagnosis', label: 'Diagnosis', value: activePatient.diagnosis || '--' },
      { id: 'consultant', label: 'Consultant', value: activePatient.consultant || '--' },
      { id: 'blood-group', label: 'Blood Group', value: '--' },
      { id: 'allergies', label: 'Allergies', value: allergies, tone: allergies === 'No known' ? 'success' : 'warning' },
      { id: 'insurance', label: 'Insurance', value: INSURANCE_BY_PATIENT_ID[activePatient.patientId] ?? '--', tone: 'info' },
      { id: 'status', label: 'Status', value: status, tone: status === 'Discharge Due' ? 'warning' : 'success' },
      {
        id: 'total-bill',
        label: 'Total Bill',
        value: INR_CURRENCY.format(TOTAL_BILL_BY_PATIENT_ID[activePatient.patientId] ?? 0),
        tone: 'info',
      },
    ];
  }, [selectedTopBarPatient]);

  const onTopBarSelectPatient = React.useCallback(
    (patientId: string) => {
      const patient = ipdPatients.find((row) => row.id === patientId);
      if (!patient) return;
      setAllocation((prev) => ({ ...prev, patientId, targetBedId: '' }));
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', activeTab);
      params.set('patientId', patientId);
      params.set('mrn', patient.mrn);
      const query = params.toString();
      router.replace(query ? `/ipd/beds?${query}` : '/ipd/beds', { scroll: false });
    },
    [activeTab, ipdPatients, router, searchParams]
  );

  const topBarHeader = (
    <IpdPatientTopBar
      moduleTitle="IPD Bed & Census"
      sectionLabel="IPD"
      pageLabel="Bed & Census"
      patient={selectedTopBarPatient}
      fields={topBarFields}
      patientOptions={topBarPatientOptions}
      onSelectPatient={onTopBarSelectPatient}
    />
  );

  const updateAllocationField = <K extends keyof BedAllocationForm>(
    field: K,
    value: BedAllocationForm[K]
  ) => {
    setAllocation((prev) => ({ ...prev, [field]: value }));
  };

  React.useEffect(() => {
    if (!patientIdParam) return;
    if (appliedPatientIdRef.current === patientIdParam) return;
    const patient = ipdPatients.find((item) => item.id === patientIdParam);
    if (!patient) return;

    setAllocation((prev) => ({ ...prev, patientId: patient.id }));
    appliedPatientIdRef.current = patientIdParam;
  }, [patientIdParam, ipdPatients]);

  React.useEffect(() => {
    if (!mrnParam) return;
    const normalizedMrn = mrnParam.trim().toUpperCase();
    if (!normalizedMrn || appliedMrnRef.current === normalizedMrn) return;

    const patient = ipdPatients.find((item) => item.mrn.trim().toUpperCase() === normalizedMrn);
    const bed = bedBoard.find((item) => item.mrn === mrnParam);

    if (!patient && !bed) {
      // Keep waiting until encounter/bed state is ready for this MRN.
      return;
    }

    if (patient && !patientIdParam) {
      setAllocation((prev) => ({ ...prev, patientId: patient.id }));
    }
    if (bed) {
      setSearch(mrnParam);
      setWardFilter('All');
      setStatusFilter('All');
    }
    appliedMrnRef.current = normalizedMrn;
  }, [mrnParam, patientIdParam, ipdPatients, bedBoard]);

  const handleAssignBed = () => {
    if (!canManageBeds) {
      setSnackbar({
        open: true,
        message: 'You do not have permission to allocate or transfer beds.',
        severity: 'error',
      });
      return;
    }

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
    <PageTemplate title="Bed & Census" header={topBarHeader} currentPageTitle="Bed & Census">
      <Stack spacing={2}>
        {!canManageBeds ? (
          <Alert severity="warning">
            You are in read-only mode for bed allocation. Contact admin for `ipd.beds.write` access.
          </Alert>
        ) : null}

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

        <Box sx={{ px: 1 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1}
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent="space-between"
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <IpdModuleTabs
                tabs={BED_CENSUS_TABS}
                value={activeTab}
                onChange={(value) => updateTabInRoute(value as BedCensusTab)}
              />
            </Box>
            <Button
              size="small"
              variant="outlined"
              onClick={() => openClinicalCare(undefined, 'rounds')}
              sx={{ alignSelf: { xs: 'flex-end', md: 'center' }, flexShrink: 0, mb: { xs: 0.5, md: 0 } }}
            >
              Open Clinical Care
            </Button>
          </Stack>
        </Box>

        {activeTab === 'bed-board' ? (
          <Grid container spacing={1}>
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
                          onClick={() => {
                            if (!canManageBeds) return;
                            updateAllocationField('targetBedId', bed.id);
                          }}
                          sx={{
                            p: 1.4,
                            borderRadius: 1.6,
                            border: '2px solid',
                            borderColor: isSelected ? IPD_COLORS.primary : statusColor,
                            cursor: canManageBeds ? 'pointer' : 'default',
                            backgroundColor: isSelected
                              ? alpha(IPD_COLORS.accent, 0.09)
                              : bedStatusBackgroundMap[bed.status],
                            transition: 'all 0.15s ease-in-out',
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            // aspectRatio: '4 / 3',
                            overflow: 'hidden',
                            '&:hover': canManageBeds
                              ? {
                                  transform: 'translateY(-1px)',
                                  boxShadow: 2,
                                }
                              : undefined,
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
                    disabled={!canManageBeds}
                  >
                    <MenuItem value="" disabled>
                      Select patient
                    </MenuItem>
                    {ipdPatients.map((patient) => (
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
                    disabled={!canManageBeds}
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
                    disabled={!canManageBeds}
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
                    disabled={!canManageBeds}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={allocation.isolation}
                        onChange={(event) => updateAllocationField('isolation', event.target.checked)}
                        disabled={!canManageBeds}
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
                    disabled={!canManageBeds}
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
            subtitle="Admitted patients pending bed assignment."
          >
            <Stack spacing={1}>
              {waitingForBedRows.length === 0 ? (
                <Alert severity="success">All admitted patients are already mapped to beds.</Alert>
              ) : (
                waitingForBedRows.map((patient) => (
                  <Card key={patient.id} variant="outlined" sx={{ p: 1.2, borderRadius: 1.6 }}>
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      justifyContent="space-between"
                      spacing={1}
                      alignItems={{ xs: 'flex-start', md: 'center' }}
                    >
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {patient.patientName} ({patient.mrn})
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {patient.ward || 'Ward pending'} · {patient.consultant}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {patient.diagnosis || 'Admission created. Awaiting bed allocation.'}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.8} alignItems="center">
                        <Chip size="small" color="warning" label="Bed Pending" />
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={!canManageBeds}
                          onClick={() => {
                            updateAllocationField('patientId', patient.id);
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
