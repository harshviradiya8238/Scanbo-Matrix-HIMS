'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Box,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { alpha, useTheme, Theme } from '@/src/ui/theme';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Bed as BedIcon,
  CheckCircle as CheckCircleIcon,
  LocalHospital as LocalHospitalIcon,
  Medication as MedicationIcon,
  MonitorHeart as MonitorHeartIcon,
  NotificationsActive as NotificationsActiveIcon,
  Science as ScienceIcon,
  WarningAmber as WarningAmberIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import {
  INITIAL_BED_BOARD,
  INPATIENT_STAYS,
} from './ipd-mock-data';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { getPatientByMrn } from '@/src/mocks/global-patients';
import { useUser } from '@/src/core/auth/UserContext';
import { canAccessRoute } from '@/src/core/navigation/route-access';
import { IpdMetricCard } from './components/ipd-ui';
import { useIpdEncounters } from './ipd-encounter-context';

type DashboardStatus = 'critical' | 'watch' | 'stable';
type AlertTone = 'error' | 'warning' | 'info' | 'success';

interface DashboardPatient {
  id: string;
  mrn: string;
  patientName: string;
  diagnosis: string;
  bed: string;
  dayOfStay: number;
  status: DashboardStatus;
}

interface QuickModule {
  id: string;
  short: string;
  label: string;
  route: string;
  tab?: string;
}

interface DashboardAlert {
  id: string;
  title: string;
  detail: string;
  tone: AlertTone;
  actionLabel: string;
  route: string;
  tab?: string;
  mrn?: string;
}

const DEFAULT_STATUS_BY_PATIENT_ID: Record<string, DashboardStatus> = {
  'ipd-1': 'watch',
  'ipd-2': 'stable',
  'ipd-3': 'critical',
  'ipd-4': 'stable',
};

const DAY_OF_STAY_BY_PATIENT_ID: Record<string, number> = {
  'ipd-1': 3,
  'ipd-2': 2,
  'ipd-3': 4,
  'ipd-4': 1,
};

const QUICK_MODULES: QuickModule[] = [
  { id: 'orders', short: 'OR', label: 'Orders', route: '/ipd/rounds', tab: 'orders' },
  { id: 'lab', short: 'LB', label: 'Lab Results', route: '/ipd/rounds', tab: 'orders' },
  { id: 'radiology', short: 'RA', label: 'Radiology', route: '/ipd/rounds', tab: 'procedures' },
  { id: 'pharmacy', short: 'RX', label: 'Drug Review', route: '/ipd/charges', tab: 'drug' },
  { id: 'careteam', short: 'CT', label: 'Care Team', route: '/ipd/rounds', tab: 'rounds' },
  { id: 'flowsheet', short: 'FS', label: 'Flowsheets', route: '/ipd/rounds', tab: 'vitals' },
  { id: 'problems', short: 'PL', label: 'Problem List', route: '/ipd/rounds', tab: 'rounds' },
  { id: 'medrec', short: 'MR', label: 'Med Rec', route: '/ipd/rounds', tab: 'medications' },
  { id: 'inbasket', short: 'IB', label: 'InBasket', route: '/ipd/rounds', tab: 'notes' },
  { id: 'handoff', short: 'HF', label: 'I-PASS', route: '/ipd/rounds', tab: 'nursing' },
  { id: 'risk', short: 'RS', label: 'Risk Scores', route: '/ipd/rounds', tab: 'rounds' },
  { id: 'infection', short: 'IC', label: 'Infection', route: '/ipd/rounds', tab: 'nursing' },
  { id: 'casemgmt', short: 'CM', label: 'Case Mgmt', route: '/ipd/discharge', tab: 'all' },
  { id: 'patientedu', short: 'PE', label: 'Patient Edu', route: '/ipd/discharge', tab: 'avs' },
  { id: 'codestatus', short: 'CS', label: 'Code Status', route: '/ipd/rounds', tab: 'rounds' },
  { id: 'smartforms', short: 'SF', label: 'SmartForms', route: '/ipd/rounds', tab: 'notes' },
  { id: 'billing', short: 'DR', label: 'Charges / DRG', route: '/ipd/charges', tab: 'charges' },
  { id: 'discharge', short: 'DC', label: 'Discharge', route: '/ipd/discharge', tab: 'pending' },
  { id: 'adt', short: 'AD', label: 'ADT', route: '/ipd/admissions' },
  { id: 'bedmap', short: 'BM', label: 'Bed Map', route: '/ipd/beds' },
  { id: 'clinical', short: 'CC', label: 'Clinical Care', route: '/ipd/rounds', tab: 'rounds' },
  { id: 'avs', short: 'AV', label: 'AVS Preview', route: '/ipd/discharge', tab: 'avs' },
];

export default function IpdDashboardPage() {
  const theme = useTheme();
  const router = useRouter();
  const mrnParam = useMrnParam();
  const encounterRows = useIpdEncounters();
  const { permissions } = useUser();

  const patientFromMrn = getPatientByMrn(mrnParam);
  const pageSubtitle = formatPatientLabel(
    patientFromMrn?.name,
    patientFromMrn?.mrn || mrnParam
  );

  const activeEncounterRows = React.useMemo(
    () => encounterRows.filter((record) => record.workflowStatus !== 'discharged'),
    [encounterRows]
  );

  const inpatientRows = React.useMemo<DashboardPatient[]>(() => {
    if (activeEncounterRows.length > 0) {
      return activeEncounterRows.map((record) => ({
        id: record.patientId,
        mrn: record.mrn,
        patientName: record.patientName,
        diagnosis: record.diagnosis,
        bed: record.bed || '--',
        dayOfStay: DAY_OF_STAY_BY_PATIENT_ID[record.patientId] ?? 1,
        status: record.clinicalStatus,
      }));
    }

    return INPATIENT_STAYS.map((stay) => ({
      id: stay.id,
      mrn: stay.mrn,
      patientName: stay.patientName,
      diagnosis: stay.diagnosis,
      bed: stay.bed,
      dayOfStay: DAY_OF_STAY_BY_PATIENT_ID[stay.id] ?? 1,
      status: DEFAULT_STATUS_BY_PATIENT_ID[stay.id] ?? 'stable',
    }));
  }, [activeEncounterRows]);

  const canNavigate = React.useCallback(
    (route: string) => canAccessRoute(route, permissions),
    [permissions]
  );

  const buildRoute = React.useCallback(
    (route: string, tab?: string, patientMrn?: string) => {
      const params = new URLSearchParams();
      if (tab) {
        params.set('tab', tab);
      }
      const effectiveMrn = patientMrn ?? mrnParam;
      if (effectiveMrn) {
        params.set('mrn', effectiveMrn);
      }
      const query = params.toString();
      return query ? `${route}?${query}` : route;
    },
    [mrnParam]
  );

  const openRoute = React.useCallback(
    (route: string, tab?: string, patientMrn?: string) => {
      if (!canNavigate(route)) return;
      router.push(buildRoute(route, tab, patientMrn));
    },
    [buildRoute, canNavigate, router]
  );

  const criticalCount = inpatientRows.filter((row) => row.status === 'critical').length;
  const watchCount = inpatientRows.filter((row) => row.status === 'watch').length;
  const stableCount = inpatientRows.filter((row) => row.status === 'stable').length;

  const availableBeds = INITIAL_BED_BOARD.filter((bed) => bed.status === 'Available').length;
  const occupiedBeds = INITIAL_BED_BOARD.filter((bed) => bed.status === 'Occupied').length;
  const cleaningOrBlockedBeds = INITIAL_BED_BOARD.filter(
    (bed) => bed.status === 'Cleaning' || bed.status === 'Blocked'
  ).length;
  const clinicalStatusByPatientId = React.useMemo(() => {
    const map: Record<string, DashboardStatus> = {};
    if (activeEncounterRows.length > 0) {
      activeEncounterRows.forEach((record) => {
        map[record.patientId] = record.clinicalStatus;
      });
      return map;
    }
    return DEFAULT_STATUS_BY_PATIENT_ID;
  }, [activeEncounterRows]);

  const criticalBeds = INITIAL_BED_BOARD.filter((bed) => {
    if (!bed.patientId) return false;
    return (clinicalStatusByPatientId[bed.patientId] ?? 'stable') === 'critical';
  }).length;

  const statusStyles: Record<
    DashboardStatus,
    { label: string; color: string; bg: string }
  > = {
    critical: {
      label: 'Critical',
      color: theme.palette.error.dark,
      bg: alpha(theme.palette.error.main, 0.16),
    },
    watch: {
      label: 'Watch',
      color: theme.palette.warning.dark,
      bg: alpha(theme.palette.warning.main, 0.2),
    },
    stable: {
      label: 'Stable',
      color: theme.palette.success.dark,
      bg: alpha(theme.palette.success.main, 0.22),
    },
  };

  const toneStyles: Record<
    AlertTone,
    { color: string; bg: string; border: string; buttonColor: string }
  > = {
    error: {
      color: theme.palette.error.main,
      bg: alpha(theme.palette.error.main, 0.12),
      border: alpha(theme.palette.error.main, 0.35),
      buttonColor: theme.palette.error.main,
    },
    warning: {
      color: theme.palette.warning.dark,
      bg: alpha(theme.palette.warning.main, 0.2),
      border: alpha(theme.palette.warning.main, 0.35),
      buttonColor: theme.palette.warning.dark,
    },
    info: {
      color: theme.palette.info.main,
      bg: alpha(theme.palette.info.main, 0.14),
      border: alpha(theme.palette.info.main, 0.35),
      buttonColor: theme.palette.info.main,
    },
    success: {
      color: theme.palette.success.main,
      bg: alpha(theme.palette.success.main, 0.18),
      border: alpha(theme.palette.success.main, 0.35),
      buttonColor: theme.palette.success.main,
    },
  };

  const criticalPatient = inpatientRows.find((row) => row.status === 'critical') ?? inpatientRows[0];
  const watchPatient = inpatientRows.find((row) => row.status === 'watch') ?? inpatientRows[0];
  const dischargeReadyPatientId =
    activeEncounterRows.find((record) => record.dischargeReady)?.patientId ?? null;
  const dischargeReadyPatient = dischargeReadyPatientId
    ? inpatientRows.find((row) => row.id === dischargeReadyPatientId)
    : null;

  const alerts: DashboardAlert[] = [
    {
      id: 'spo2-critical',
      title: `SpO2 critical - ${criticalPatient?.patientName ?? 'Patient'}`,
      detail: `Needs immediate review at Bed ${criticalPatient?.bed ?? '--'}`,
      tone: 'error',
      actionLabel: 'View',
      route: '/ipd/rounds',
      tab: 'vitals',
      mrn: criticalPatient?.mrn,
    },
    {
      id: 'medication-due',
      title: 'Medication due this round',
      detail: `${watchPatient?.patientName ?? 'Patient'} has active medication tasks`,
      tone: 'warning',
      actionLabel: 'Give',
      route: '/ipd/rounds',
      tab: 'medications',
      mrn: watchPatient?.mrn,
    },
    {
      id: 'lab-ready',
      title: 'Lab result available',
      detail: `CBC report posted for ${watchPatient?.patientName ?? 'patient'}`,
      tone: 'info',
      actionLabel: 'Review',
      route: '/ipd/rounds',
      tab: 'orders',
      mrn: watchPatient?.mrn,
    },
    {
      id: 'discharge-ready',
      title: dischargeReadyPatient
        ? `${dischargeReadyPatient.patientName} ready for discharge`
        : 'Discharge checklist updates pending',
      detail: dischargeReadyPatient
        ? 'Checklist and billing are complete'
        : 'Complete pending items in discharge workflow',
      tone: dischargeReadyPatient ? 'success' : 'warning',
      actionLabel: 'Process',
      route: '/ipd/discharge',
      tab: 'pending',
      mrn: dischargeReadyPatient?.mrn,
    },
    {
      id: 'drug-interaction',
      title: 'Drug interaction alert',
      detail: `${criticalPatient?.patientName ?? 'Patient'} needs medication reconciliation`,
      tone: 'warning',
      actionLabel: 'Review',
      route: '/ipd/charges',
      tab: 'drug',
      mrn: criticalPatient?.mrn,
    },
  ];

  const metricCards = [
    {
      id: 'total',
      label: 'Total Inpatients',
      value: inpatientRows.length,
      note: 'Current admitted census',
      tone: 'primary' as const,
      icon: <LocalHospitalIcon sx={{ fontSize: 22 }} />,
    },
    {
      id: 'critical',
      label: 'Critical',
      value: criticalCount,
      note: 'Requires immediate review',
      tone: 'danger' as const,
      icon: <WarningAmberIcon sx={{ fontSize: 22 }} />,
    },
    {
      id: 'watch',
      label: 'Under Watch',
      value: watchCount,
      note: 'Close monitoring needed',
      tone: 'warning' as const,
      icon: <VisibilityIcon sx={{ fontSize: 22 }} />,
    },
    {
      id: 'stable',
      label: 'Stable',
      value: stableCount,
      note: 'Clinically stable patients',
      tone: 'success' as const,
      icon: <CheckCircleIcon sx={{ fontSize: 22 }} />,
    },
    {
      id: 'available',
      label: 'Beds Available',
      value: availableBeds,
      note: `of ${INITIAL_BED_BOARD.length} total beds`,
      tone: 'info' as const,
      icon: <BedIcon sx={{ fontSize: 22 }} />,
    },
  ];

  const bedSummary = [
    {
      id: 'occupied',
      label: 'Occupied',
      value: occupiedBeds,
      color: theme.palette.primary.main,
      icon: <BedIcon sx={{ fontSize: 18 }} />,
    },
    {
      id: 'available',
      label: 'Free',
      value: availableBeds,
      color: theme.palette.success.main,
      icon: <AssignmentTurnedInIcon sx={{ fontSize: 18 }} />,
    },
    {
      id: 'critical',
      label: 'Critical',
      value: criticalBeds,
      color: theme.palette.error.main,
      icon: <WarningAmberIcon sx={{ fontSize: 18 }} />,
    },
    {
      id: 'cleaning',
      label: 'Cleaning / Blocked',
      value: cleaningOrBlockedBeds,
      color: theme.palette.warning.dark,
      icon: <MonitorHeartIcon sx={{ fontSize: 18 }} />,
    },
  ];

  return (
    <PageTemplate title="IPD Dashboard" subtitle={pageSubtitle} currentPageTitle="IPD Dashboard">
      <Stack spacing={1.8}>
        <Card
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.18),
            borderRadius: 2.2,
            overflow: 'hidden',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={1.4}
            sx={{
              px: { xs: 1.6, sm: 2.2 },
              py: { xs: 1.5, sm: 1.8 },
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
            }}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: theme.palette.primary.main, lineHeight: 1.1 }}
              >
                IPD Dashboard
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.35, color: 'text.secondary' }}>
                Overview of all inpatients, bed status, and alerts — 22 EPIC modules
              </Typography>
            </Box>

            {/* <Button
              variant="contained"
              size="small"
              startIcon={<AddCircleOutlineIcon />}
              disabled={!canNavigate('/ipd/admissions')}
              onClick={() => openRoute('/ipd/admissions')}
              sx={{ borderRadius: 1.4, px: 1.35, py: 0.5, minHeight: 34, fontWeight: 700 }}
            >
              Admit Patient
            </Button> */}
          </Stack>
        </Card>

        <Box
          sx={{
            display: 'grid',
            gap: 1.2,
            gridTemplateColumns: {
              xs: 'repeat(1, minmax(0, 1fr))',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
              xl: 'repeat(5, minmax(0, 1fr))',
            },
          }}
        >
          {metricCards.map((metric) => (
            <IpdMetricCard
              key={metric.id}
              label={metric.label}
              value={metric.value}
              trend={metric.note}
              tone={metric.tone}
              icon={metric.icon}
            />
          ))}
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: 1.3,
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.2fr) minmax(0, 1fr)' },
            alignItems: 'start',
          }}
        >
          <Card
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.16),
              borderRadius: 2,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                px: 1.6,
                py: 1.2,
                borderBottom: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.14),
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.8}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1,
                    display: 'grid',
                    placeItems: 'center',
                    color: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  }}
                >
                  <LocalHospitalIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Current Inpatients
                </Typography>
              </Stack>
             
            </Stack>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeadCellSx(theme)}>Patient</TableCell>
                    <TableCell sx={tableHeadCellSx(theme)}>Bed</TableCell>
                    <TableCell sx={tableHeadCellSx(theme)}>Diagnosis</TableCell>
                    <TableCell sx={tableHeadCellSx(theme)}>Day</TableCell>
                    <TableCell sx={tableHeadCellSx(theme)}>Status</TableCell>
                    <TableCell sx={tableHeadCellSx(theme)}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inpatientRows.map((row) => {
                    const status = statusStyles[row.status];
                    return (
                      <TableRow
                        key={row.id}
                        hover
                        sx={{
                          '&:last-child td': { borderBottom: 'none' },
                        }}
                      >
                        <TableCell sx={{ py: 1.2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {row.patientName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {row.mrn}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.2, fontWeight: 700 }}>{row.bed}</TableCell>
                        <TableCell
                          sx={{
                            py: 1.2,
                            maxWidth: 210,
                            color: 'text.secondary',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {row.diagnosis}
                        </TableCell>
                        <TableCell sx={{ py: 1.2, fontWeight: 700 }}>{`D${row.dayOfStay}`}</TableCell>
                        <TableCell sx={{ py: 1.2 }}>
                          <Chip
                            size="small"
                            label={status.label}
                            sx={{
                              height: 22,
                              fontSize: 11,
                              fontWeight: 700,
                              color: status.color,
                              backgroundColor: status.bg,
                              '& .MuiChip-label': { px: 1 },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.2 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            disabled={!canNavigate('/ipd/rounds')}
                            onClick={() => openRoute('/ipd/rounds', 'rounds', row.mrn)}
                            sx={{ minHeight: 28, px: 1.05, textTransform: 'none' }}
                          >
                            Open
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          <Stack spacing={1.3}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.16),
                borderRadius: 2,
                p: 1.5,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mb: 0.5 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1,
                    display: 'grid',
                    placeItems: 'center',
                    color: theme.palette.error.main,
                    backgroundColor: alpha(theme.palette.error.main, 0.12),
                  }}
                >
                  <NotificationsActiveIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Live Alerts
                </Typography>
              </Stack>

              {alerts.map((alert) => {
                const tone = toneStyles[alert.tone];
                return (
                  <Stack
                    key={alert.id}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.1),
                      '&:last-of-type': { borderBottom: 'none', pb: 0.1 },
                    }}
                  >
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: 1,
                        display: 'grid',
                        placeItems: 'center',
                        color: tone.color,
                        backgroundColor: tone.bg,
                        border: '1px solid',
                        borderColor: tone.border,
                        flexShrink: 0,
                      }}
                    >
                      {alert.id === 'medication-due' ? (
                        <MedicationIcon sx={{ fontSize: 16 }} />
                      ) : alert.id === 'lab-ready' ? (
                        <ScienceIcon sx={{ fontSize: 16 }} />
                      ) : alert.id === 'discharge-ready' ? (
                        <AssignmentTurnedInIcon sx={{ fontSize: 16 }} />
                      ) : (
                        <WarningAmberIcon sx={{ fontSize: 16 }} />
                      )}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
                        {alert.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {alert.detail}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => openRoute(alert.route, alert.tab, alert.mrn)}
                      disabled={!canNavigate(alert.route)}
                      sx={{
                        minHeight: 28,
                        px: 1,
                        minWidth: 58,
                        borderColor: tone.border,
                        color: tone.buttonColor,
                        textTransform: 'none',
                        fontWeight: 700,
                      }}
                    >
                      {alert.actionLabel}
                    </Button>
                  </Stack>
                );
              })}
            </Card>

            <Card
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.16),
                borderRadius: 2,
                p: 1.5,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.1 }}>
                <Stack direction="row" alignItems="center" spacing={0.8}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1,
                      display: 'grid',
                      placeItems: 'center',
                      color: theme.palette.info.main,
                      backgroundColor: alpha(theme.palette.info.main, 0.12),
                    }}
                  >
                    <BedIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Bed Summary
                  </Typography>
                </Stack>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={!canNavigate('/ipd/beds')}
                  onClick={() => openRoute('/ipd/beds')}
                  sx={{ minHeight: 30, px: 1.1, textTransform: 'none' }}
                >
                  Bed Map
                </Button>
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gap: 0.9,
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                }}
              >
                {bedSummary.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      p: 1,
                      borderRadius: 1.4,
                      border: '1px solid',
                      borderColor: alpha(item.color, 0.3),
                      backgroundColor: alpha(item.color, 0.08),
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.9,
                    }}
                  >
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: 1,
                        display: 'grid',
                        placeItems: 'center',
                        color: item.color,
                        backgroundColor: alpha(item.color, 0.18),
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: item.color, lineHeight: 1.1 }}>
                        {item.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.label}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Card>
          </Stack>
        </Box>

        <Card
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.16),
            borderRadius: 2,
            p: 1.4,
          }}
        >
          {/* <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mb: 1.15 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                display: 'grid',
                placeItems: 'center',
                color: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
              }}
            >
              <LocalHospitalIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              All 22 EPIC IPD Modules - Quick Access
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gap: 0.8,
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                sm: 'repeat(3, minmax(0, 1fr))',
                md: 'repeat(5, minmax(0, 1fr))',
                xl: 'repeat(7, minmax(0, 1fr))',
              },
            }}
          >
            {QUICK_MODULES.map((module) => {
              const enabled = canNavigate(module.route);
              return (
                <Button
                  key={module.id}
                  variant="outlined"
                  size="small"
                  disabled={!enabled}
                  onClick={() => openRoute(module.route, module.tab)}
                  sx={{
                    minHeight: 66,
                    borderRadius: 1.3,
                    borderColor: alpha(theme.palette.primary.main, 0.25),
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 0.45,
                    px: 0.6,
                    py: 0.7,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.06),
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 27,
                      height: 27,
                      borderRadius: 1,
                      fontSize: 11,
                      fontWeight: 700,
                      color: enabled ? theme.palette.primary.main : 'text.disabled',
                      backgroundColor: enabled
                        ? alpha(theme.palette.primary.main, 0.12)
                        : alpha(theme.palette.text.disabled, 0.14),
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    {module.short}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      textAlign: 'center',
                      lineHeight: 1.1,
                      color: enabled ? 'text.primary' : 'text.disabled',
                    }}
                  >
                    {module.label}
                  </Typography>
                </Button>
              );
            })}
          </Box> */}
        </Card>
      </Stack>
    </PageTemplate>
  );
}

function tableHeadCellSx(theme: Theme) {
  return {
    py: 1,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: 'text.secondary',
    borderBottom: '1px solid',
    borderColor: alpha(theme.palette.primary.main, 0.16),
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  };
}
