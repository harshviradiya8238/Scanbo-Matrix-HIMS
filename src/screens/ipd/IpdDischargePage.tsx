'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
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
import { Card, CommonDialog } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { alpha, useTheme } from '@/src/ui/theme';
import {
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  CalendarMonth as CalendarMonthIcon,
  Checklist as ChecklistIcon,
  CloseRounded as CloseRoundedIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import {
  DISCHARGE_CANDIDATES,
  DISCHARGE_CHECKLIST,
  INPATIENT_STAYS,
} from './ipd-mock-data';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { getPatientByMrn } from '@/src/mocks/global-patients';
import { usePermission } from '@/src/core/auth/usePermission';
import { ipdFormStylesSx } from './components/ipd-ui';
import {
  markIpdEncounterDischarged,
  syncIpdEncounterDischargeChecks,
  useIpdEncounterState,
} from './ipd-encounter-context';

type DischargeType = 'Regular' | 'Transfer' | 'AMA' | 'DAMA';
type DischargeCondition = 'Stable' | 'Improved' | 'Recovered';
type DischargeFlowTab = 'pending' | 'all' | 'avs' | 'discharged';

interface DischargeDraft {
  dischargeDate: string;
  followUpDate: string;
  dischargeType: DischargeType;
  conditionAtDischarge: DischargeCondition;
  finalDiagnosis: string;
  diagnosisAtDischarge: string;
  hospitalCourse: string;
  procedures: string;
  dischargeMedications: string;
  patientInstructions: string;
  warningSigns: string;
  followUpDepartment: string;
  followUpDoctor: string;
}

type DraftErrors = Partial<Record<keyof DischargeDraft, string>>;
type ChecklistState = Record<string, boolean>;

interface CompletedDischargeEntry {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  completedAt: string;
  preparedBy: string;
}

function defaultIsoDate(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function buildInitialDraft(patientId: string): DischargeDraft {
  const patient = INPATIENT_STAYS.find((item) => item.id === patientId);

  return {
    dischargeDate: defaultIsoDate(1),
    followUpDate: defaultIsoDate(14),
    dischargeType: 'Regular',
    conditionAtDischarge: 'Stable',
    finalDiagnosis: patient?.diagnosis ?? '',
    diagnosisAtDischarge: patient?.diagnosis ?? '',
    hospitalCourse: '',
    procedures: '',
    dischargeMedications: '',
    patientInstructions:
      'Continue prescribed medications, maintain recommended diet, and report warning signs immediately.',
    warningSigns: '',
    followUpDepartment: patient?.consultant.includes('Surgery') ? 'Surgery OPD' : 'Medicine OPD',
    followUpDoctor: patient?.consultant ?? '',
  };
}

function buildInitialChecklistState(patientId: string): ChecklistState {
  const candidate = DISCHARGE_CANDIDATES.find((item) => item.patientId === patientId);

  const baseState = DISCHARGE_CHECKLIST.reduce<ChecklistState>((acc, item) => {
    acc[item.id] = false;
    return acc;
  }, {});

  if (!candidate) {
    return baseState;
  }

  if (candidate.billingStatus === 'Cleared') {
    baseState['bill-clearance'] = true;
  }

  if (candidate.pharmacyStatus === 'Ready') {
    baseState.pharmacy = true;
  }

  if (candidate.transportStatus === 'Arranged') {
    baseState.transport = true;
  }

  return baseState;
}

function isRequiredChecklistComplete(checklistState: ChecklistState): boolean {
  return DISCHARGE_CHECKLIST.filter((item) => item.required).every(
    (item) => checklistState[item.id]
  );
}

export default function IpdDischargePage() {
  const theme = useTheme();
  const router = useRouter();
  const mrnParam = useMrnParam();
  const permissionGate = usePermission();
  const canManageDischarge = permissionGate('ipd.discharge.write');
  const encounterState = useIpdEncounterState();
  const initialPatientId = DISCHARGE_CANDIDATES[0]?.patientId ?? '';

  const [flowTab, setFlowTab] = React.useState<DischargeFlowTab>('pending');
  const [selectedPatientId, setSelectedPatientId] = React.useState(initialPatientId);
  const [saveStamp, setSaveStamp] = React.useState('');
  const [completedPatientIds, setCompletedPatientIds] = React.useState<string[]>([]);
  const [mrnApplied, setMrnApplied] = React.useState(false);

  const [drafts, setDrafts] = React.useState<Record<string, DischargeDraft>>(() =>
    DISCHARGE_CANDIDATES.reduce<Record<string, DischargeDraft>>((acc, candidate) => {
      acc[candidate.patientId] = buildInitialDraft(candidate.patientId);
      return acc;
    }, {})
  );

  const [checklists, setChecklists] = React.useState<Record<string, ChecklistState>>(() =>
    DISCHARGE_CANDIDATES.reduce<Record<string, ChecklistState>>((acc, candidate) => {
      acc[candidate.patientId] = buildInitialChecklistState(candidate.patientId);
      return acc;
    }, {})
  );

  const [errors, setErrors] = React.useState<DraftErrors>({});
  const [completedEntries, setCompletedEntries] = React.useState<CompletedDischargeEntry[]>([]);

  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [confirmDischargeOpen, setConfirmDischargeOpen] = React.useState(false);
  const [confirmPatientId, setConfirmPatientId] = React.useState<string | null>(null);
  const [confirmDischargeDraft, setConfirmDischargeDraft] = React.useState<{
    condition: DischargeCondition;
    followUpDate: string;
    instructions: string;
  }>({
    condition: 'Stable',
    followUpDate: defaultIsoDate(14),
    instructions: '',
  });
  const [confirmDischargeError, setConfirmDischargeError] = React.useState('');

  const guardDischargeWrite = React.useCallback(
    (actionLabel: string) => {
      if (canManageDischarge) return true;
      setSnackbar({
        open: true,
        message: `You do not have permission to ${actionLabel}.`,
        severity: 'error',
      });
      return false;
    },
    [canManageDischarge]
  );

  const activeCandidates = React.useMemo(
    () => DISCHARGE_CANDIDATES.filter((candidate) => !completedPatientIds.includes(candidate.patientId)),
    [completedPatientIds]
  );

  React.useEffect(() => {
    if (!mrnParam || mrnApplied) return;
    const match = INPATIENT_STAYS.find((patient) => patient.mrn === mrnParam);
    if (match) {
      setSelectedPatientId(match.id);
      setFlowTab('avs');
    }
    setMrnApplied(true);
  }, [mrnParam, mrnApplied]);

  React.useEffect(() => {
    if (INPATIENT_STAYS.some((patient) => patient.id === selectedPatientId)) {
      return;
    }

    if (activeCandidates[0]) {
      setSelectedPatientId(activeCandidates[0].patientId);
    }
  }, [activeCandidates, selectedPatientId]);

  React.useEffect(() => {
    const dischargedFromContext = Object.values(encounterState)
      .filter((record) => record.workflowStatus === 'discharged')
      .map((record) => record.patientId);

    if (dischargedFromContext.length === 0) return;

    setCompletedPatientIds((prev) => {
      const merged = Array.from(new Set([...prev, ...dischargedFromContext]));
      return merged.length === prev.length ? prev : merged;
    });

    setCompletedEntries((prev) => {
      const existing = new Set(prev.map((entry) => entry.patientId));
      const additions: CompletedDischargeEntry[] = dischargedFromContext
        .filter((patientId) => !existing.has(patientId))
        .map((patientId) => {
          const patient = INPATIENT_STAYS.find((item) => item.id === patientId);
          return {
            id: `discharge-sync-${patientId}`,
            patientId,
            patientName: patient?.patientName ?? patientId,
            mrn: patient?.mrn ?? '--',
            completedAt: '--',
            preparedBy: 'System Sync',
          };
        });

      return additions.length > 0 ? [...additions, ...prev] : prev;
    });
  }, [encounterState]);

  const selectedPatient = React.useMemo(
    () => INPATIENT_STAYS.find((patient) => patient.id === selectedPatientId),
    [selectedPatientId]
  );

  const selectedCandidate = React.useMemo(
    () => DISCHARGE_CANDIDATES.find((candidate) => candidate.patientId === selectedPatientId),
    [selectedPatientId]
  );

  const confirmPatient = React.useMemo(
    () =>
      confirmPatientId
        ? INPATIENT_STAYS.find((patient) => patient.id === confirmPatientId) ?? null
        : null,
    [confirmPatientId]
  );

  const seededPatient = getPatientByMrn(selectedPatient?.mrn ?? mrnParam);
  const displayName = selectedPatient?.patientName || seededPatient?.name;
  const displayMrn = selectedPatient?.mrn || seededPatient?.mrn || mrnParam;
  const pageSubtitle = formatPatientLabel(displayName, displayMrn);

  const getDraftByPatientId = React.useCallback(
    (patientId: string): DischargeDraft => drafts[patientId] ?? buildInitialDraft(patientId),
    [drafts]
  );

  const getChecklistByPatientId = React.useCallback(
    (patientId: string): ChecklistState => checklists[patientId] ?? buildInitialChecklistState(patientId),
    [checklists]
  );

  const selectedDraft = getDraftByPatientId(selectedPatientId);
  const selectedChecklist = getChecklistByPatientId(selectedPatientId);

  const getProgressByPatientId = React.useCallback(
    (patientId: string) => {
      const checklist = getChecklistByPatientId(patientId);
      const doneCount = DISCHARGE_CHECKLIST.filter((item) => checklist[item.id]).length;
      const percent =
        DISCHARGE_CHECKLIST.length === 0
          ? 0
          : Math.round((doneCount / DISCHARGE_CHECKLIST.length) * 100);

      return {
        doneCount,
        percent,
        requiredComplete: isRequiredChecklistComplete(checklist),
      };
    },
    [getChecklistByPatientId]
  );

  const selectedProgress = getProgressByPatientId(selectedPatientId);
  const [selectedAge = '--', selectedGender = '--'] = selectedPatient?.ageGender
    .split('/')
    .map((value) => value.trim()) ?? ['--', '--'];
  const selectedStatus = selectedPatient
    ? resolveStatusPill(selectedPatient.diagnosis, selectedProgress.percent)
    : { label: 'stable', color: theme.palette.success.dark, bg: alpha(theme.palette.success.main, 0.2) };

  const pendingCount = activeCandidates.length;
  const dischargedCount = completedEntries.length;

  const openAvsForPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setErrors({});
    setFlowTab('avs');
  };

  const openClinicalCareTab = (tab: 'vitals' | 'orders' | 'notes') => {
    const params = new URLSearchParams();
    params.set('tab', tab);
    if (selectedPatient?.mrn) {
      params.set('mrn', selectedPatient.mrn);
    }
    router.push(`/ipd/rounds?${params.toString()}`);
  };

  const openDischargeConfirmation = (patientId: string) => {
    if (!guardDischargeWrite('start discharge confirmation')) return;
    const draft = getDraftByPatientId(patientId);
    setSelectedPatientId(patientId);
    setConfirmPatientId(patientId);
    setConfirmDischargeDraft({
      condition: draft.conditionAtDischarge,
      followUpDate: draft.followUpDate,
      instructions: draft.patientInstructions,
    });
    setConfirmDischargeError('');
    setConfirmDischargeOpen(true);
  };

  const closeDischargeConfirmation = () => {
    setConfirmDischargeOpen(false);
    setConfirmDischargeError('');
  };

  const finalizeDischargeFromConfirmation = () => {
    if (!guardDischargeWrite('complete discharge')) return;
    if (!confirmPatientId) return;

    if (!confirmDischargeDraft.followUpDate.trim()) {
      setConfirmDischargeError('Follow-up date is required.');
      return;
    }

    if (!confirmDischargeDraft.instructions.trim()) {
      setConfirmDischargeError('Discharge instructions are required.');
      return;
    }

    closeDischargeConfirmation();

    handleCompleteDischarge(confirmPatientId, {
      conditionAtDischarge: confirmDischargeDraft.condition,
      followUpDate: confirmDischargeDraft.followUpDate,
      patientInstructions: confirmDischargeDraft.instructions,
    });
  };

  const updateDraftField = <K extends keyof DischargeDraft>(
    patientId: string,
    field: K,
    value: DischargeDraft[K]
  ) => {
    setDrafts((prev) => ({
      ...prev,
      [patientId]: {
        ...(prev[patientId] ?? buildInitialDraft(patientId)),
        [field]: value,
      },
    }));

    if (patientId === selectedPatientId && errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const updateChecklistItem = (patientId: string, checklistId: string, checked: boolean) => {
    if (!guardDischargeWrite('update discharge checklist')) return;
    setChecklists((prev) => ({
      ...prev,
      [patientId]: {
        ...(prev[patientId] ?? buildInitialChecklistState(patientId)),
        [checklistId]: checked,
      },
    }));

    if (checklistId === 'bill-clearance') {
      syncIpdEncounterDischargeChecks(patientId, { billingCleared: checked });
    }
    if (checklistId === 'pharmacy') {
      syncIpdEncounterDischargeChecks(patientId, { pharmacyCleared: checked });
    }
    if (checklistId === 'follow-up') {
      syncIpdEncounterDischargeChecks(patientId, { followUpReady: checked });
    }
  };

  const handleSaveDraft = () => {
    if (!guardDischargeWrite('save discharge draft')) return;
    const now = new Date();
    setSaveStamp(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setSnackbar({
      open: true,
      message: 'Discharge draft saved locally.',
      severity: 'info',
    });
  };

  const printAfterVisitSummary = () => {
    setSnackbar({
      open: true,
      message: 'After Visit Summary is ready to print.',
      severity: 'success',
    });
  };

  const validateCompletion = (
    patientId: string,
    draftOverride?: Partial<DischargeDraft>
  ): boolean => {
    const draft = {
      ...getDraftByPatientId(patientId),
      ...(draftOverride ?? {}),
    };
    const checklist = getChecklistByPatientId(patientId);
    const checklistReady = isRequiredChecklistComplete(checklist);
    const encounter = encounterState[patientId];
    const integrationReady =
      !encounter ||
      (encounter.pendingOrders === 0 &&
        encounter.pendingDiagnostics === 0 &&
        encounter.pendingMedications === 0);
    const nextErrors: DraftErrors = {};

    const requiredFields: Array<[keyof DischargeDraft, string]> = [
      ['dischargeDate', 'Discharge date'],
      ['finalDiagnosis', 'Final diagnosis'],
      ['conditionAtDischarge', 'Condition at discharge'],
      ['dischargeMedications', 'Discharge medications'],
      ['followUpDate', 'Follow-up date'],
      ['followUpDoctor', 'Follow-up doctor'],
      ['patientInstructions', 'Patient instructions'],
    ];

    requiredFields.forEach(([field]) => {
      if (!draft[field].trim()) {
        nextErrors[field] = 'Required';
      }
    });

    const hasErrors = Object.keys(nextErrors).length > 0;

    if (hasErrors || !checklistReady) {
      setSelectedPatientId(patientId);
      setFlowTab('avs');
      setErrors(nextErrors);
    }

    if (hasErrors) {
      setSnackbar({
        open: true,
        message: 'Complete all required AVS fields before discharge.',
        severity: 'error',
      });
    }

    if (!checklistReady) {
      setSnackbar({
        open: true,
        message: 'Complete all required checklist items before discharge.',
        severity: 'error',
      });
    }

    if (!integrationReady) {
      setSnackbar({
        open: true,
        message: 'Pending clinical orders/diagnostics/medications must be completed before discharge.',
        severity: 'error',
      });
    }

    return !hasErrors && checklistReady && integrationReady;
  };

  const handleCompleteDischarge = (
    patientId: string,
    draftOverride?: Partial<DischargeDraft>
  ): boolean => {
    if (!guardDischargeWrite('complete discharge')) {
      return false;
    }
    if (completedPatientIds.includes(patientId)) {
      return false;
    }

    const patient = INPATIENT_STAYS.find((item) => item.id === patientId);
    if (!patient) {
      return false;
    }

    if (draftOverride) {
      setDrafts((prev) => ({
        ...prev,
        [patientId]: {
          ...(prev[patientId] ?? buildInitialDraft(patientId)),
          ...draftOverride,
        },
      }));
    }

    const valid = validateCompletion(patientId, draftOverride);
    if (!valid) {
      return false;
    }

    const completedAt = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    setCompletedPatientIds((prev) => (prev.includes(patientId) ? prev : [...prev, patientId]));
    setCompletedEntries((prev) => {
      if (prev.some((entry) => entry.patientId === patientId)) {
        return prev;
      }

      return [
        {
          id: `discharge-${Date.now()}-${patientId}`,
          patientId,
          patientName: patient.patientName,
          mrn: patient.mrn,
          completedAt,
          preparedBy: 'Ward Nurse 1',
        },
        ...prev,
      ];
    });

    setSaveStamp(completedAt);
    setSnackbar({
      open: true,
      message: `Discharge completed for ${patient.patientName}.`,
      severity: 'success',
    });
    markIpdEncounterDischarged(patientId);

    return true;
  };

  const compactButtonSx = {
    minWidth: 0,
    px: 1.5,
    py: 0.45,
    borderRadius: 1.2,
    textTransform: 'none',
    fontWeight: 600,
    boxShadow: 'none',
  };

  const actionButtonSx = {
    ...compactButtonSx,
    px: 1.2,
    py: 0.35,
    fontSize: 13,
    borderRadius: 1.1,
  };

  const labelSx = {
    display: 'block',
    mb: 0.45,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: alpha(theme.palette.text.primary, 0.84),
  };

  const inlineFormSx = {
    ...ipdFormStylesSx,
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.35,
      backgroundColor: alpha(theme.palette.primary.main, 0.06),
    },
    '& .MuiInputBase-input::placeholder': {
      color: alpha(theme.palette.text.primary, 0.5),
      opacity: 1,
    },
  };

  function resolveStatusPill(diagnosis: string, progressPercent: number) {
    const normalized = diagnosis.toLowerCase();

    if (progressPercent === 100) {
      return {
        label: 'stable',
        color: theme.palette.success.dark,
        bg: alpha(theme.palette.success.main, 0.2),
      };
    }

    if (normalized.includes('acute') || normalized.includes('uncontrolled') || progressPercent >= 30) {
      return {
        label: 'critical',
        color: theme.palette.error.main,
        bg: alpha(theme.palette.error.main, 0.16),
      };
    }

    if (normalized.includes('hypergly') || normalized.includes('watch')) {
      return {
        label: 'watch',
        color: theme.palette.warning.dark,
        bg: alpha(theme.palette.warning.main, 0.2),
      };
    }

    return {
      label: 'stable',
      color: theme.palette.success.dark,
      bg: alpha(theme.palette.success.main, 0.2),
    };
  }

  const renderDischargeTable = (patientIds: string[], title: string, emptyMessage: string) => (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.18),
        overflow: 'hidden',
        boxShadow: 'none',
      }}
    >
      <Box sx={{ px: 2, py: 1.6, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={0.8} alignItems="center">
          <ChecklistIcon fontSize="small" color="warning" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        </Stack>
      </Box>

      {patientIds.length === 0 ? (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
        </Box>
      ) : (
        <TableContainer sx={{ p: 1.2 }}>
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  '& .MuiTableCell-root': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.06),
                    color: alpha(theme.palette.text.primary, 0.52),
                    fontWeight: 700,
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 0.3,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  },
                }}
              >
                <TableCell>Patient</TableCell>
                <TableCell sx={{ minWidth: 70 }}>Bed</TableCell>
                <TableCell sx={{ minWidth: 64 }}>Day</TableCell>
                <TableCell>Diagnosis</TableCell>
                <TableCell sx={{ minWidth: 110 }}>Status</TableCell>
                <TableCell sx={{ minWidth: 220 }}>Discharge %</TableCell>
                <TableCell sx={{ minWidth: 240 }}>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {patientIds.map((patientId) => {
                const patient = INPATIENT_STAYS.find((item) => item.id === patientId);
                const candidate = DISCHARGE_CANDIDATES.find((item) => item.patientId === patientId);
                if (!patient || !candidate) return null;

                const progress = getProgressByPatientId(patientId);
                const statusPill = resolveStatusPill(patient.diagnosis, progress.percent);
                const isDischarged = completedPatientIds.includes(patientId);
                const barColor =
                  progress.percent === 100 ? theme.palette.success.main : theme.palette.error.main;

                return (
                  <TableRow
                    key={patientId}
                    sx={{
                      '& .MuiTableCell-root': {
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        py: 1.15,
                        verticalAlign: 'middle',
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {patient.patientName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {patient.mrn}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {patient.bed}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        Day {candidate.losDays}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {patient.diagnosis}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={statusPill.label}
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: statusPill.color,
                          backgroundColor: statusPill.bg,
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 190,
                            height: 6,
                            borderRadius: 99,
                            overflow: 'hidden',
                            backgroundColor: alpha(theme.palette.primary.main, 0.14),
                          }}
                        >
                          <Box
                            sx={{
                              height: '100%',
                              width: `${progress.percent}%`,
                              backgroundColor: barColor,
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                          {progress.percent}%
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={0.7} flexWrap="wrap">
                        <Button
                          size="small"
                          variant="outlined"
                          sx={actionButtonSx}
                          onClick={() => openAvsForPatient(patientId)}
                        >
                          Checklist
                        </Button>

                        <Button
                          size="small"
                          variant="outlined"
                          sx={{
                            ...actionButtonSx,
                            borderColor: alpha(theme.palette.warning.main, 0.8),
                            color: theme.palette.warning.dark,
                            '&:hover': {
                              borderColor: theme.palette.warning.main,
                              backgroundColor: alpha(theme.palette.warning.main, 0.08),
                            },
                          }}
                          onClick={() => openAvsForPatient(patientId)}
                        >
                          AVS
                        </Button>

                        {isDischarged ? (
                          <Chip size="small" color="success" label="Discharged" sx={{ fontWeight: 700 }} />
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            disabled={!canManageDischarge}
                            sx={{
                              ...actionButtonSx,
                              background: 'linear-gradient(90deg, #4f46e5 0%, #4338ca 100%)',
                              '&:hover': {
                                background: 'linear-gradient(90deg, #4338ca 0%, #3730a3 100%)',
                              },
                            }}
                            onClick={() => openDischargeConfirmation(patientId)}
                          >
                            Discharge
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );

  const medicationItems = selectedDraft.dischargeMedications
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <PageTemplate title="Discharge & AVS" subtitle={pageSubtitle} currentPageTitle="Discharge & AVS">
      <Stack spacing={2}>
        {!canManageDischarge ? (
          <Alert severity="warning">
            You are in read-only mode for discharge workflow. Contact admin for `ipd.discharge.write` access.
          </Alert>
        ) : null}

        <Stack spacing={0}>
          <Card
            elevation={0}
            sx={{
              p: { xs: 1.5, md: 2 },
              borderRadius: '10px 10px 0 0',
              border: '1px solid',
              borderBottom: 'none',
              borderColor: alpha(theme.palette.primary.main, 0.16),
              background: `linear-gradient(145deg, ${alpha(
                theme.palette.primary.main,
                0.08
              )} 0%, ${alpha(theme.palette.info.main, 0.06)} 100%)`,
            }}
          >
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', lg: 'center' }}
              spacing={1.25}
            >
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.1 }}>
                  Discharge & After Visit Summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Process patient discharges, generate AVS, release beds, and complete billing.
                </Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            
                <Button size="small" variant="contained" onClick={() => setFlowTab('avs')}>
                  AVS Preview
                </Button>
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  disabled={!selectedPatient || !canManageDischarge}
                  onClick={() => selectedPatient && openDischargeConfirmation(selectedPatient.id)}
                >
                  Start Discharge
                </Button>
              </Stack>
            </Stack>
          </Card>

          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 5,
              backgroundColor: alpha(theme.palette.background.default, 0.92),
              backdropFilter: 'blur(6px)',
            }}
          >
            <Card
              elevation={0}
              sx={{
                p: 0,
                borderRadius: '0 0 10px 10px',
                border: '1px solid',
                borderTop: 'none',
                borderColor: alpha(theme.palette.primary.main, 0.16),
              }}
            >
              <Box sx={{ px: 0.75, py: 0.5 }}>
                <Tabs
                  value={flowTab}
                  onChange={(_, value: DischargeFlowTab) => setFlowTab(value)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    '& .MuiTabs-flexContainer': { gap: 0.5 },
                    '& .MuiTabs-indicator': { display: 'none' },
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      minHeight: 40,
                      px: 2,
                      borderRadius: 1.5,
                      color: 'text.secondary',
                    },
                    '& .MuiTab-root.Mui-selected': {
                      color: 'common.white',
                      backgroundColor: 'primary.main',
                    },
                  }}
                >
                  <Tab value="pending" label={`Pending Discharge (${pendingCount})`} />
                  <Tab value="all" label="All Patients" />
                  <Tab value="avs" label="AVS Preview" />
                  <Tab value="discharged" label={`Discharged (${dischargedCount})`} />
                </Tabs>
              </Box>
            </Card>
          </Box>
        </Stack>

        {selectedPatient ? (
          <Card
            elevation={0}
            sx={{
              p: { xs: 1.25, md: 1.5 },
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.2),
              backgroundColor: alpha(theme.palette.primary.main, 0.03),
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1}
              alignItems={{ xs: 'flex-start', md: 'center' }}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                <Avatar
                  sx={{
                    width: 42,
                    height: 42,
                    bgcolor: 'primary.main',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                  }}
                >
                  {initials(selectedPatient.patientName)}
                </Avatar>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {selectedPatient.patientName}
                    </Typography>
                    <Chip
                      size="small"
                      label={selectedStatus.label}
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: selectedStatus.color,
                        backgroundColor: selectedStatus.bg,
                        textTransform: 'capitalize',
                      }}
                    />
                    <Chip size="small" label={selectedPatient.mrn} variant="outlined" />
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {selectedAge} / {selectedGender} · {selectedPatient.ward} / {selectedPatient.bed} · Day{' '}
                    {selectedCandidate?.losDays ?? '--'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {selectedPatient.diagnosis} · Consultant: {selectedPatient.consultant}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                <Button size="small" variant="text" onClick={() => openClinicalCareTab('vitals')}>
                  Vitals
                </Button>
                <Button size="small" variant="text" onClick={() => openClinicalCareTab('orders')}>
                  Orders
                </Button>
                <Button size="small" variant="outlined" onClick={() => openClinicalCareTab('notes')}>
                  Notes
                </Button>
              </Stack>
            </Stack>
          </Card>
        ) : null}

        {flowTab === 'pending'
          ? renderDischargeTable(
              activeCandidates.map((candidate) => candidate.patientId),
              'Patients Approaching Discharge',
              'No pending discharges.'
            )
          : null}

        {flowTab === 'all'
          ? renderDischargeTable(
              DISCHARGE_CANDIDATES.map((candidate) => candidate.patientId),
              'All Active Patients',
              'No discharge patients available.'
            )
          : null}

        {flowTab === 'avs' ? (
          selectedPatient ? (
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.18),
                overflow: 'hidden',
                boxShadow: 'none',
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: alpha(theme.palette.primary.main, 0.03),
                }}
              >
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={0.8}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {selectedPatient.patientName} ({selectedPatient.mrn})
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedPatient.diagnosis} · {selectedPatient.bed} · {selectedPatient.consultant}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={0.8}>
                    <Chip size="small" label={`Checklist ${selectedProgress.doneCount}/${DISCHARGE_CHECKLIST.length}`} />
                    <Chip
                      size="small"
                      color={selectedProgress.percent === 100 ? 'success' : 'warning'}
                      label={`${selectedProgress.percent}%`}
                    />
                  </Stack>
                </Stack>
              </Box>

              <Box sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="flex-start">
                  <Grid item xs={12} lg={5}>
                    <Stack spacing={2}>
                      <Card
                        elevation={0}
                        sx={{
                          border: '1px solid',
                          borderColor: alpha(theme.palette.primary.main, 0.14),
                          borderRadius: 1.8,
                        }}
                      >
                        <Box
                          sx={{
                            px: 1.6,
                            py: 1.2,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            backgroundColor: alpha(theme.palette.primary.main, 0.03),
                          }}
                        >
                          <Stack direction="row" spacing={0.8} alignItems="center">
                            <AssignmentTurnedInIcon fontSize="small" color="primary" />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              Discharge Checklist
                            </Typography>
                          </Stack>
                        </Box>

                        <Stack spacing={0.8} sx={{ p: 1.2 }}>
                          {DISCHARGE_CHECKLIST.map((item) => {
                            const checked = Boolean(selectedChecklist[item.id]);

                            return (
                              <Stack
                                key={item.id}
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{
                                  px: 1,
                                  py: 0.75,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  borderRadius: 1.2,
                                }}
                              >
                                <Button
                                  size="small"
                                  variant={checked ? 'contained' : 'outlined'}
                                  sx={{ ...actionButtonSx, minWidth: 38, px: 0.8 }}
                                  disabled={!canManageDischarge}
                                  onClick={() =>
                                    updateChecklistItem(selectedPatientId, item.id, !checked)
                                  }
                                >
                                  {checked ? 'Done' : 'Todo'}
                                </Button>

                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    textDecoration: checked ? 'line-through' : 'none',
                                  }}
                                >
                                  {item.label}
                                </Typography>
                              </Stack>
                            );
                          })}
                        </Stack>
                      </Card>

                      <Card
                        elevation={0}
                        sx={{
                          border: '1px solid',
                          borderColor: alpha(theme.palette.primary.main, 0.14),
                          borderRadius: 1.8,
                        }}
                      >
                        <Box sx={{ px: 1.6, py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>
                          <Stack direction="row" spacing={0.8} alignItems="center">
                            <LocalPharmacyIcon fontSize="small" color="primary" />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              Discharge Medications
                            </Typography>
                          </Stack>
                        </Box>

                        <Box sx={{ p: 1.6, ...inlineFormSx }}>
                          <Typography variant="caption" sx={labelSx}>
                            Medication List
                          </Typography>
                          <TextField
                            size="small"
                            multiline
                            minRows={5}
                            placeholder="Paracetamol 650mg SOS"
                            value={selectedDraft.dischargeMedications}
                            onChange={(event) =>
                              updateDraftField(selectedPatientId, 'dischargeMedications', event.target.value)
                            }
                            error={Boolean(errors.dischargeMedications)}
                            helperText={errors.dischargeMedications}
                            fullWidth
                          />
                        </Box>
                      </Card>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} lg={7}>
                    <Stack spacing={2}>
                      <Card
                        elevation={0}
                        sx={{
                          border: '1px solid',
                          borderColor: alpha(theme.palette.primary.main, 0.14),
                          borderRadius: 1.8,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            px: 1.8,
                            py: 1.3,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            backgroundColor: alpha(theme.palette.primary.main, 0.03),
                          }}
                        >
                          <Stack direction="row" spacing={0.8} alignItems="center">
                            <CalendarMonthIcon fontSize="small" color="primary" />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              Clinical Discharge Summary
                            </Typography>
                          </Stack>
                        </Box>

                        <Box sx={{ p: 1.8, ...inlineFormSx }}>
                          <Grid container spacing={1.1} sx={{ mt: 0.05 }}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" sx={labelSx}>
                                Discharge Date
                              </Typography>
                              <TextField
                                size="small"
                                type="date"
                                value={selectedDraft.dischargeDate}
                                onChange={(event) =>
                                  updateDraftField(selectedPatientId, 'dischargeDate', event.target.value)
                                }
                                error={Boolean(errors.dischargeDate)}
                                helperText={errors.dischargeDate}
                                fullWidth
                              />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" sx={labelSx}>
                                Discharge Type
                              </Typography>
                              <TextField
                                select
                                size="small"
                                value={selectedDraft.dischargeType}
                                onChange={(event) =>
                                  updateDraftField(
                                    selectedPatientId,
                                    'dischargeType',
                                    event.target.value as DischargeType
                                  )
                                }
                                fullWidth
                              >
                                {(['Regular', 'Transfer', 'AMA', 'DAMA'] as DischargeType[]).map((type) => (
                                  <MenuItem key={type} value={type}>
                                    {type}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" sx={labelSx}>
                                Condition
                              </Typography>
                              <TextField
                                select
                                size="small"
                                value={selectedDraft.conditionAtDischarge}
                                onChange={(event) =>
                                  updateDraftField(
                                    selectedPatientId,
                                    'conditionAtDischarge',
                                    event.target.value as DischargeCondition
                                  )
                                }
                                error={Boolean(errors.conditionAtDischarge)}
                                helperText={errors.conditionAtDischarge}
                                fullWidth
                              >
                                {(
                                  ['Stable', 'Improved', 'Recovered'] as DischargeCondition[]
                                ).map((condition) => (
                                  <MenuItem key={condition} value={condition}>
                                    {condition}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" sx={labelSx}>
                                Final Diagnosis
                              </Typography>
                              <TextField
                                size="small"
                                value={selectedDraft.finalDiagnosis}
                                onChange={(event) =>
                                  updateDraftField(selectedPatientId, 'finalDiagnosis', event.target.value)
                                }
                                error={Boolean(errors.finalDiagnosis)}
                                helperText={errors.finalDiagnosis}
                                fullWidth
                              />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" sx={labelSx}>
                                Diagnosis At Discharge
                              </Typography>
                              <TextField
                                size="small"
                                value={selectedDraft.diagnosisAtDischarge}
                                onChange={(event) =>
                                  updateDraftField(
                                    selectedPatientId,
                                    'diagnosisAtDischarge',
                                    event.target.value
                                  )
                                }
                                fullWidth
                              />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" sx={labelSx}>
                                Hospital Course
                              </Typography>
                              <TextField
                                size="small"
                                multiline
                                minRows={2.5}
                                value={selectedDraft.hospitalCourse}
                                onChange={(event) =>
                                  updateDraftField(
                                    selectedPatientId,
                                    'hospitalCourse',
                                    event.target.value
                                  )
                                }
                                fullWidth
                              />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" sx={labelSx}>
                                Procedures / Interventions
                              </Typography>
                              <TextField
                                size="small"
                                multiline
                                minRows={2.5}
                                value={selectedDraft.procedures}
                                onChange={(event) =>
                                  updateDraftField(selectedPatientId, 'procedures', event.target.value)
                                }
                                fullWidth
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      </Card>

                      <Card
                        elevation={0}
                        sx={{
                          border: '1px solid',
                          borderColor: alpha(theme.palette.primary.main, 0.14),
                          borderRadius: 1.8,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            px: 1.8,
                            py: 1.3,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            backgroundColor: alpha(theme.palette.primary.main, 0.03),
                          }}
                        >
                          <Stack direction="row" spacing={0.8} alignItems="center">
                            <LocalPharmacyIcon fontSize="small" color="primary" />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              Patient AVS Form
                            </Typography>
                          </Stack>
                        </Box>

                        <Box sx={{ p: 1.8, ...inlineFormSx }}>
                          <Grid container spacing={1.1} sx={{ mt: 0.05 }}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" sx={labelSx}>
                                Follow-up Date
                              </Typography>
                              <TextField
                                size="small"
                                type="date"
                                value={selectedDraft.followUpDate}
                                onChange={(event) =>
                                  updateDraftField(selectedPatientId, 'followUpDate', event.target.value)
                                }
                                error={Boolean(errors.followUpDate)}
                                helperText={errors.followUpDate}
                                fullWidth
                              />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" sx={labelSx}>
                                Follow-up Department
                              </Typography>
                              <TextField
                                size="small"
                                value={selectedDraft.followUpDepartment}
                                onChange={(event) =>
                                  updateDraftField(
                                    selectedPatientId,
                                    'followUpDepartment',
                                    event.target.value
                                  )
                                }
                                fullWidth
                              />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" sx={labelSx}>
                                Follow-up Doctor
                              </Typography>
                              <TextField
                                size="small"
                                value={selectedDraft.followUpDoctor}
                                onChange={(event) =>
                                  updateDraftField(selectedPatientId, 'followUpDoctor', event.target.value)
                                }
                                error={Boolean(errors.followUpDoctor)}
                                helperText={errors.followUpDoctor}
                                fullWidth
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <Typography variant="caption" sx={labelSx}>
                                Instructions
                              </Typography>
                              <TextField
                                size="small"
                                multiline
                                minRows={3.5}
                                value={selectedDraft.patientInstructions}
                                onChange={(event) =>
                                  updateDraftField(
                                    selectedPatientId,
                                    'patientInstructions',
                                    event.target.value
                                  )
                                }
                                error={Boolean(errors.patientInstructions)}
                                helperText={errors.patientInstructions}
                                fullWidth
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <Typography variant="caption" sx={labelSx}>
                                Warning Signs
                              </Typography>
                              <TextField
                                size="small"
                                multiline
                                minRows={2}
                                value={selectedDraft.warningSigns}
                                onChange={(event) =>
                                  updateDraftField(selectedPatientId, 'warningSigns', event.target.value)
                                }
                                fullWidth
                              />
                            </Grid>
                          </Grid>

                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={0.8}
                            justifyContent="space-between"
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                            sx={{ mt: 1.2 }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              {saveStamp ? `Last saved at ${saveStamp}` : 'No draft saved yet'}
                            </Typography>

                            <Stack direction="row" spacing={0.8}>
                              <Button
                                size="small"
                                variant="outlined"
                                sx={compactButtonSx}
                                onClick={handleSaveDraft}
                                disabled={!canManageDischarge}
                              >
                                Save Draft
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<PrintIcon sx={{ fontSize: 14 }} />}
                                sx={compactButtonSx}
                                onClick={printAfterVisitSummary}
                              >
                                Print AVS
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                disabled={!canManageDischarge}
                                sx={{
                                  ...compactButtonSx,
                                  background: 'linear-gradient(90deg, #4f46e5 0%, #4338ca 100%)',
                                  '&:hover': {
                                    background: 'linear-gradient(90deg, #4338ca 0%, #3730a3 100%)',
                                  },
                                }}
                                onClick={() => openDischargeConfirmation(selectedPatientId)}
                              >
                                Discharge
                              </Button>
                            </Stack>
                          </Stack>
                        </Box>
                      </Card>

                      <Card
                        elevation={0}
                        sx={{
                          border: '1px solid',
                          borderColor: alpha(theme.palette.primary.main, 0.14),
                          borderRadius: 1.8,
                          overflow: 'hidden',
                        }}
                      >
                        <Box sx={{ px: 1.8, py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            AVS Preview
                          </Typography>
                        </Box>

                        <Box sx={{ p: 1.8 }}>
                          <Stack spacing={0.9}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {selectedPatient.patientName} ({selectedPatient.mrn})
                            </Typography>

                            <Typography variant="caption" color="text.secondary">
                              Date: {selectedDraft.dischargeDate || '--'} · Type: {selectedDraft.dischargeType} ·
                              {' '}Condition: {selectedDraft.conditionAtDischarge}
                            </Typography>

                            <Typography variant="body2">
                              <strong>Diagnosis:</strong>{' '}
                              {selectedDraft.diagnosisAtDischarge || selectedDraft.finalDiagnosis || '--'}
                            </Typography>

                            {selectedDraft.hospitalCourse.trim() ? (
                              <Typography variant="body2">
                                <strong>Hospital Course:</strong> {selectedDraft.hospitalCourse}
                              </Typography>
                            ) : null}

                            {selectedDraft.procedures.trim() ? (
                              <Typography variant="body2">
                                <strong>Procedures:</strong> {selectedDraft.procedures}
                              </Typography>
                            ) : null}

                            <Typography variant="body2">
                              <strong>Follow-up:</strong> {selectedDraft.followUpDepartment} ·{' '}
                              {selectedDraft.followUpDoctor} · {selectedDraft.followUpDate || '--'}
                            </Typography>

                            <Typography variant="body2">
                              <strong>Instructions:</strong> {selectedDraft.patientInstructions || '--'}
                            </Typography>

                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.4 }}>
                                Medications
                              </Typography>

                              {medicationItems.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                  No medications added.
                                </Typography>
                              ) : (
                                <Stack spacing={0.2}>
                                  {medicationItems.map((medication, index) => (
                                    <Typography key={`${medication}-${index}`} variant="body2">
                                      • {medication}
                                    </Typography>
                                  ))}
                                </Stack>
                              )}
                            </Box>
                          </Stack>
                        </Box>
                      </Card>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Card>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No patient selected for AVS preview.
            </Typography>
          )
        ) : null}

        {flowTab === 'discharged' ? (
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.18),
              overflow: 'hidden',
              boxShadow: 'none',
            }}
          >
            <Box sx={{ px: 2, py: 1.6, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Discharged Patients
              </Typography>
            </Box>

            <Stack spacing={1} sx={{ p: 2 }}>
              {completedEntries.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No discharges completed yet.
                </Typography>
              ) : (
                completedEntries.map((entry) => {
                  const patient = INPATIENT_STAYS.find((item) => item.id === entry.patientId);

                  return (
                    <Box
                      key={entry.id}
                      sx={{
                        border: '1px solid',
                        borderColor: alpha(theme.palette.success.main, 0.28),
                        borderRadius: 1.5,
                        px: 1.4,
                        py: 1.1,
                        backgroundColor: alpha(theme.palette.success.main, 0.04),
                      }}
                    >
                      <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={1}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', md: 'center' }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {entry.patientName} ({entry.mrn})
                          </Typography>
                          {patient ? (
                            <Typography variant="caption" color="text.secondary">
                              {patient.diagnosis} · {patient.bed} · {patient.consultant}
                            </Typography>
                          ) : null}
                        </Box>

                        <Stack direction="row" spacing={0.8}>
                          <Chip size="small" color="success" label={`Done ${entry.completedAt}`} />
                          <Chip size="small" variant="outlined" label={entry.preparedBy} />
                        </Stack>
                      </Stack>
                    </Box>
                  );
                })
              )}
            </Stack>
          </Card>
        ) : null}

        <CommonDialog
          open={confirmDischargeOpen}
          onClose={closeDischargeConfirmation}
          maxWidth="sm"
          fullWidth
          title={
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
              <Stack direction="row" spacing={0.7} alignItems="center">
                <AssignmentTurnedInIcon sx={{ fontSize: 16, color: 'error.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Confirm Discharge
                </Typography>
              </Stack>
              <IconButton size="small" onClick={closeDischargeConfirmation}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
          }
          titleSx={{
            px: 2.2,
            py: 1.4,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
          contentSx={{
            ...inlineFormSx,
            px: 2.2,
            py: 1.8,
          }}
          actionsSx={{
            px: 2.2,
            py: 1.2,
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
          }}
          actions={
            <Stack direction="row" spacing={0.8} sx={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button size="small" variant="outlined" sx={compactButtonSx} onClick={closeDischargeConfirmation}>
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                color="success"
                sx={compactButtonSx}
                onClick={finalizeDischargeFromConfirmation}
                disabled={!canManageDischarge}
              >
                Finalize Discharge
              </Button>
            </Stack>
          }
          content={
            <Stack spacing={1.1}>
              <Typography variant="body2" color="text.secondary">
                You are about to discharge{' '}
                <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {confirmPatient?.patientName ?? '--'}
                </Box>
                . This will mark the IPD stay as complete and release the bed.
              </Typography>

              <Grid container spacing={1.1}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={labelSx}>
                    Discharge Condition
                  </Typography>
                  <TextField
                    select
                    size="small"
                    value={confirmDischargeDraft.condition}
                    onChange={(event) =>
                      setConfirmDischargeDraft((prev) => ({
                        ...prev,
                        condition: event.target.value as DischargeCondition,
                      }))
                    }
                    fullWidth
                  >
                    {(['Stable', 'Improved', 'Recovered'] as DischargeCondition[]).map((condition) => (
                      <MenuItem key={condition} value={condition}>
                        {condition}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={labelSx}>
                    Follow-up Date
                  </Typography>
                  <TextField
                    size="small"
                    type="date"
                    value={confirmDischargeDraft.followUpDate}
                    onChange={(event) =>
                      setConfirmDischargeDraft((prev) => ({
                        ...prev,
                        followUpDate: event.target.value,
                      }))
                    }
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" sx={labelSx}>
                    Discharge Instructions
                  </Typography>
                  <TextField
                    size="small"
                    multiline
                    minRows={3}
                    placeholder="Medications, diet, activity, follow-up..."
                    value={confirmDischargeDraft.instructions}
                    onChange={(event) =>
                      setConfirmDischargeDraft((prev) => ({
                        ...prev,
                        instructions: event.target.value,
                      }))
                    }
                    fullWidth
                  />
                </Grid>
              </Grid>

              {confirmDischargeError ? (
                <Typography variant="caption" color="error.main">
                  {confirmDischargeError}
                </Typography>
              ) : null}
            </Stack>
          }
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3500}
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
