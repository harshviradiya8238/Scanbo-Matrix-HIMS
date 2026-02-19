'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import CommonTable, {
  CommonTableColumn,
  CommonTableFilterOption,
} from '@/src/ui/components/molecules/CommonTable';
import { Search as SearchIcon } from '@mui/icons-material';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { getPatientByMrn } from '@/src/mocks/global-patients';
import { usePermission } from '@/src/core/auth/usePermission';
import {
  ADMISSION_LEADS,
  AdmissionLead,
  AdmissionPriority,
  DISCHARGE_CANDIDATES,
  INPATIENT_STAYS,
} from './ipd-mock-data';
import {
  IpdSectionCard,
  ipdFormStylesSx,
} from './components/ipd-ui';
import { registerIpdAdmissionEncounter, useIpdEncounters } from './ipd-encounter-context';
import {
  markOpdToIpdTransferHandledByMrn,
  useOpdToIpdTransferLeads,
} from './ipd-transfer-store';
import IpdPatientTopBar, { IpdPatientOption, IpdPatientTopBarField } from './components/IpdPatientTopBar';

interface AdmissionDialogForm {
  patientName: string;
  mrn: string;
  mobile: string;
  admissionType: string;
  admissionSource: string;
  priority: AdmissionPriority;
  department: string;
  consultant: string;
  preferredWard: string;
  provisionalDiagnosis: string;
  admissionReason: string;
  payerType: string;
  insuranceProvider: string;
  policyNumber: string;
  termsAccepted: boolean;
}

type AdmissionErrors = Partial<Record<keyof AdmissionDialogForm, string>>;

interface PatientRow {
  id: string;
  mrn: string;
  patientName: string;
  ageGender: string;
  admissionDate: string;
  admissionTimestamp: number;
  consultant: string;
  diagnosis: string;
  ward: string;
  bed: string;
  status: 'Admitted' | 'Observation';
  entryType: 'Existing' | 'Created Now';
}

interface AdmissionQueueRow {
  id: string;
  mrn: string;
  patientName: string;
  source: 'OPD' | 'ER' | 'Transfer';
  priority: AdmissionPriority;
  preferredWard: string;
  consultant: string;
  provisionalDiagnosis: string;
  stage: 'Pending Admission' | 'Bed Pending';
}

function buildFilterOptions(values: string[], allLabel: string): CommonTableFilterOption[] {
  const uniqueValues = Array.from(new Set(values.filter(Boolean)));
  return [{ label: allLabel, value: 'all' }, ...uniqueValues.map((value) => ({ label: value, value }))];
}

function buildFormFromLead(lead: AdmissionLead): AdmissionDialogForm {
  return {
    patientName: lead.patientName,
    mrn: lead.mrn,
    mobile: lead.mobile,
    admissionType: lead.source === 'ER' ? 'Emergency' : 'Medical',
    admissionSource: lead.source,
    priority: lead.priority,
    department:
      lead.preferredWard === 'Surgical Ward - 1'
        ? 'Surgery'
        : lead.preferredWard === 'ICU'
        ? 'Critical Care'
        : 'Internal Medicine',
    consultant: lead.consultant,
    preferredWard: lead.preferredWard,
    provisionalDiagnosis: lead.provisionalDiagnosis,
    admissionReason: lead.admissionReason,
    payerType: lead.patientType,
    insuranceProvider: lead.patientType === 'Insurance' ? 'HealthSecure TPA' : '',
    policyNumber: '',
    termsAccepted: false,
  };
}

function buildEmptyForm(): AdmissionDialogForm {
  return {
    patientName: '',
    mrn: '',
    mobile: '',
    admissionType: 'Medical',
    admissionSource: 'OPD',
    priority: 'Routine',
    department: '',
    consultant: '',
    preferredWard: '',
    provisionalDiagnosis: '',
    admissionReason: '',
    payerType: 'General',
    insuranceProvider: '',
    policyNumber: '',
    termsAccepted: false,
  };
}

function formatDateTimeForRow(date: Date): string {
  const datePart = date.toLocaleDateString();
  const timePart = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${datePart} ${timePart}`;
}

function normalizeMrn(value: string): string {
  return value.trim().toUpperCase();
}

const TOTAL_BILL_BY_PATIENT_ID: Record<string, number> = {
  'ipd-1': 67000,
  'ipd-2': 52000,
  'ipd-3': 182000,
  'ipd-4': 48000,
};

const INSURANCE_BY_PATIENT_ID: Record<string, string> = {
  'ipd-1': 'Star Health',
  'ipd-2': 'HDFC Ergo',
  'ipd-3': 'New India Assurance',
  'ipd-4': 'No Insurance',
};

const INR_CURRENCY = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export default function IpdAdmissionsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mrnParam = useMrnParam();
  const permissionGate = usePermission();
  const ipdEncounters = useIpdEncounters();
  const transferLeads = useOpdToIpdTransferLeads();
  const canManageAdmissions = permissionGate('ipd.admissions.write');
  const canOpenBedBoard = permissionGate(['ipd.beds.read', 'ipd.beds.write', 'ipd.read']);

  const [allSearch, setAllSearch] = React.useState('');
  const [allStatusFilter, setAllStatusFilter] = React.useState('all');
  const [allWardFilter, setAllWardFilter] = React.useState('all');
  const [queueSearch, setQueueSearch] = React.useState('');
  const [queuePriorityFilter, setQueuePriorityFilter] = React.useState('all');
  const [queueSourceFilter, setQueueSourceFilter] = React.useState('all');
  const [historyTab, setHistoryTab] = React.useState<'all' | 'queue'>('all');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedLeadId, setSelectedLeadId] = React.useState<string>('');
  const [form, setForm] = React.useState<AdmissionDialogForm>(buildEmptyForm());
  const [errors, setErrors] = React.useState<AdmissionErrors>({});
  const [saveStamp, setSaveStamp] = React.useState('');
  const appliedMrnRef = React.useRef<string>('');

  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const queueRowsAll = React.useMemo(() => {
    const merged = new Map<string, AdmissionLead>();
    ADMISSION_LEADS.forEach((lead) => merged.set(normalizeMrn(lead.mrn), lead));
    transferLeads.forEach((lead) => merged.set(normalizeMrn(lead.mrn), lead));
    return Array.from(merged.values());
  }, [transferLeads]);

  React.useEffect(() => {
    if (!mrnParam) return;
    const normalizedMrn = mrnParam.trim().toUpperCase();
    if (!normalizedMrn || appliedMrnRef.current === normalizedMrn) return;

    const lead = queueRowsAll.find((item) => normalizeMrn(item.mrn) === normalizedMrn);
    if (!lead) return;

    setSelectedLeadId(lead.id);
    setForm(buildFormFromLead(lead));
    appliedMrnRef.current = normalizedMrn;
  }, [mrnParam, queueRowsAll]);

  const selectedLead = React.useMemo(
    () => queueRowsAll.find((lead) => lead.id === selectedLeadId),
    [queueRowsAll, selectedLeadId]
  );

  const activeIpdPatients = React.useMemo(() => {
    const seedByMrn = new Map(
      INPATIENT_STAYS.map((stay) => [normalizeMrn(stay.mrn), stay] as const)
    );

    const activeEncounters = ipdEncounters
      .filter((record) => record.workflowStatus !== 'discharged')
      .sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
      );

    const merged = new Map<string, PatientRow>();
    activeEncounters.forEach((record) => {
      const mrnKey = normalizeMrn(record.mrn);
      if (!mrnKey || merged.has(mrnKey)) return;

      const seed = seedByMrn.get(mrnKey);
      const globalPatient = getPatientByMrn(record.mrn);
      const encounterTimestamp = new Date(record.updatedAt).getTime();
      const admissionTimestamp = seed
        ? new Date(seed.admissionDate).getTime()
        : Number.isFinite(encounterTimestamp)
        ? encounterTimestamp
        : Date.now();
      const bed = record.bed?.trim() ?? '';

      merged.set(mrnKey, {
        id: record.patientId,
        mrn: record.mrn,
        patientName: record.patientName,
        ageGender: seed?.ageGender ?? globalPatient?.ageGender ?? '--',
        admissionDate: formatDateTimeForRow(new Date(admissionTimestamp)),
        admissionTimestamp,
        consultant: record.consultant || seed?.consultant || '--',
        diagnosis: record.diagnosis || seed?.diagnosis || '--',
        ward: record.ward || seed?.ward || '--',
        bed,
        status: bed ? 'Admitted' : 'Observation',
        entryType: seed ? 'Existing' : 'Created Now',
      });
    });

    return Array.from(merged.values()).sort(
      (left, right) => right.admissionTimestamp - left.admissionTimestamp
    );
  }, [ipdEncounters]);

  const buildFormFromActivePatient = React.useCallback((patient: PatientRow): AdmissionDialogForm => {
    const diagnosis = patient.diagnosis === '--' ? '' : patient.diagnosis;
    return {
      ...buildEmptyForm(),
      patientName: patient.patientName,
      mrn: patient.mrn,
      admissionSource: 'Transfer',
      consultant: patient.consultant === '--' ? '' : patient.consultant,
      preferredWard: patient.ward === '--' ? '' : patient.ward,
      provisionalDiagnosis: diagnosis,
      admissionReason: diagnosis,
    };
  }, []);

  React.useEffect(() => {
    if (!mrnParam) return;
    const normalizedMrn = normalizeMrn(mrnParam);
    if (!normalizedMrn || appliedMrnRef.current === normalizedMrn) return;

    const patient = activeIpdPatients.find((row) => normalizeMrn(row.mrn) === normalizedMrn);
    if (!patient) return;

    setSelectedLeadId('');
    setForm(buildFormFromActivePatient(patient));
    appliedMrnRef.current = normalizedMrn;
  }, [activeIpdPatients, buildFormFromActivePatient, mrnParam]);

  const allPatients = React.useMemo(
    () => activeIpdPatients.filter((patient) => Boolean(patient.bed)),
    [activeIpdPatients]
  );

  const activeIpdMrnSet = React.useMemo(
    () => new Set(activeIpdPatients.map((row) => normalizeMrn(row.mrn))),
    [activeIpdPatients]
  );

  const queueRows = React.useMemo<AdmissionQueueRow[]>(() => {
    const pendingAdmissionRows: AdmissionQueueRow[] = queueRowsAll
      .filter((lead) => !activeIpdMrnSet.has(normalizeMrn(lead.mrn)))
      .map((lead) => ({
        id: `lead-${lead.id}`,
        mrn: lead.mrn,
        patientName: lead.patientName,
        source: lead.source,
        priority: lead.priority,
        preferredWard: lead.preferredWard,
        consultant: lead.consultant,
        provisionalDiagnosis: lead.provisionalDiagnosis,
        stage: 'Pending Admission',
      }));

    const leadByMrn = new Map(
      queueRowsAll.map((lead) => [normalizeMrn(lead.mrn), lead] as const)
    );

    const bedPendingRows: AdmissionQueueRow[] = activeIpdPatients
      .filter((patient) => !patient.bed)
      .map((patient) => {
        const lead = leadByMrn.get(normalizeMrn(patient.mrn));
        return {
          id: `bed-pending-${patient.id}`,
          mrn: patient.mrn,
          patientName: patient.patientName,
          source: lead?.source ?? 'Transfer',
          priority: lead?.priority ?? 'Routine',
          preferredWard: patient.ward,
          consultant: patient.consultant,
          provisionalDiagnosis: lead?.provisionalDiagnosis ?? '',
          stage: 'Bed Pending',
        };
      });

    const merged = new Map<string, AdmissionQueueRow>();
    pendingAdmissionRows.forEach((row) => merged.set(normalizeMrn(row.mrn), row));
    bedPendingRows.forEach((row) => merged.set(normalizeMrn(row.mrn), row));
    return Array.from(merged.values());
  }, [activeIpdMrnSet, activeIpdPatients, queueRowsAll]);

  const topBarPatientOptions = React.useMemo<IpdPatientOption[]>(() => {
    const leadByMrn = new Map(
      queueRowsAll.map((lead) => [normalizeMrn(lead.mrn), lead] as const)
    );
    const merged = new Map<string, IpdPatientOption>();

    activeIpdPatients.forEach((patient) => {
      const mrnKey = normalizeMrn(patient.mrn);
      if (!mrnKey) return;

      const lead = leadByMrn.get(mrnKey);
      const dischargeCandidate = DISCHARGE_CANDIDATES.find((row) => row.patientId === patient.id);
      const status = !patient.bed
        ? 'Bed Pending'
        : dischargeCandidate
        ? 'Discharge Due'
        : 'Admitted';
      const insurance =
        INSURANCE_BY_PATIENT_ID[patient.id] ??
        (lead
          ? lead.patientType === 'Insurance'
            ? 'HealthSecure TPA'
            : lead.patientType
          : '--');
      const tags = ['Admitted'];
      if (!patient.bed) tags.push('Bed Pending');
      if (dischargeCandidate) tags.push('Discharge Due');
      if (
        patient.ward.toLowerCase().includes('icu') ||
        patient.bed.toLowerCase().includes('icu')
      ) {
        tags.push('ICU');
      }

      merged.set(mrnKey, {
        patientId: patient.id,
        name: patient.patientName,
        mrn: patient.mrn,
        ageGender: patient.ageGender,
        ward: patient.ward,
        bed: patient.bed || '--',
        consultant: patient.consultant,
        diagnosis: patient.diagnosis,
        status,
        statusTone:
          status === 'Discharge Due'
            ? 'warning'
            : status === 'Bed Pending'
            ? 'warning'
            : 'success',
        insurance,
        totalBill: TOTAL_BILL_BY_PATIENT_ID[patient.id] ?? 0,
        tags,
      });
    });

    queueRowsAll.forEach((lead) => {
      const mrnKey = normalizeMrn(lead.mrn);
      if (!mrnKey || merged.has(mrnKey)) return;

      const insurance =
        lead.patientType === 'Insurance' ? 'HealthSecure TPA' : lead.patientType;
      merged.set(mrnKey, {
        patientId: `lead-${lead.id}`,
        name: lead.patientName,
        mrn: lead.mrn,
        ageGender: `${lead.age} / ${lead.gender}`,
        ward: lead.preferredWard,
        bed: '--',
        consultant: lead.consultant,
        diagnosis: lead.provisionalDiagnosis,
        status: 'Pending Admission',
        statusTone: 'warning',
        insurance,
        totalBill: 0,
        tags: ['Pending Admission', lead.priority, lead.source],
      });
    });

    return Array.from(merged.values()).sort((left, right) =>
      left.name.localeCompare(right.name)
    );
  }, [activeIpdPatients, queueRowsAll]);

  const selectedTopBarPatient = React.useMemo<IpdPatientOption | null>(() => {
    const currentMrn = normalizeMrn(form.mrn || selectedLead?.mrn || mrnParam || '');
    if (!currentMrn) return topBarPatientOptions[0] ?? null;
    return (
      topBarPatientOptions.find((row) => normalizeMrn(row.mrn) === currentMrn) ??
      topBarPatientOptions[0] ??
      null
    );
  }, [form.mrn, mrnParam, selectedLead?.mrn, topBarPatientOptions]);

  const topBarFields = React.useMemo<IpdPatientTopBarField[]>(() => {
    if (!selectedTopBarPatient) return [];

    const mrnKey = normalizeMrn(selectedTopBarPatient.mrn);
    const lead = queueRowsAll.find((row) => normalizeMrn(row.mrn) === mrnKey);
    const activePatient = activeIpdPatients.find(
      (row) => normalizeMrn(row.mrn) === mrnKey
    );
    const stay = INPATIENT_STAYS.find((row) => normalizeMrn(row.mrn) === mrnKey);
    const dischargeCandidate = activePatient
      ? DISCHARGE_CANDIDATES.find((row) => row.patientId === activePatient.id)
      : undefined;
    const globalPatient = getPatientByMrn(selectedTopBarPatient.mrn);
    const allergies =
      lead?.knownAllergies || globalPatient?.tags?.join(', ') || 'No known';
    const status =
      selectedTopBarPatient.status ||
      (activePatient?.bed ? 'Admitted' : 'Pending Admission');
    const totalBillValueRaw = selectedTopBarPatient.totalBill;
    const totalBillValue =
      typeof totalBillValueRaw === 'number'
        ? totalBillValueRaw
        : Number(totalBillValueRaw);
    const totalBill = Number.isFinite(totalBillValue)
      ? INR_CURRENCY.format(totalBillValue)
      : '--';

    return [
      {
        id: 'age-sex',
        label: 'Age / Sex',
        value:
          selectedTopBarPatient.ageGender ??
          stay?.ageGender ??
          (lead ? `${lead.age} / ${lead.gender}` : '--'),
      },
      {
        id: 'ward-bed',
        label: 'Ward / Bed',
        value: `${selectedTopBarPatient.ward || '--'} · ${
          selectedTopBarPatient.bed || '--'
        }`,
      },
      { id: 'admitted', label: 'Admitted', value: stay?.admissionDate ?? '--' },
      {
        id: 'los',
        label: 'LOS',
        value: dischargeCandidate ? `Day ${dischargeCandidate.losDays}` : '--',
      },
      {
        id: 'diagnosis',
        label: 'Diagnosis',
        value:
          selectedTopBarPatient.diagnosis || lead?.provisionalDiagnosis || '--',
      },
      {
        id: 'consultant',
        label: 'Consultant',
        value: selectedTopBarPatient.consultant || lead?.consultant || '--',
      },
      { id: 'blood-group', label: 'Blood Group', value: '--' },
      {
        id: 'allergies',
        label: 'Allergies',
        value: allergies,
        tone: allergies === 'No known' ? 'success' : 'warning',
      },
      {
        id: 'insurance',
        label: 'Insurance',
        value: selectedTopBarPatient.insurance || '--',
        tone: 'info',
      },
      {
        id: 'status',
        label: 'Status',
        value: status,
        tone:
          status === 'Admitted'
            ? 'success'
            : status === 'Discharge Due'
            ? 'warning'
            : 'info',
      },
      { id: 'total-bill', label: 'Total Bill', value: totalBill, tone: 'info' },
    ];
  }, [activeIpdPatients, queueRowsAll, selectedTopBarPatient]);

  const onSelectTopBarPatient = React.useCallback(
    (patientId: string) => {
      const selectedPatient = topBarPatientOptions.find(
        (row) => row.patientId === patientId
      );
      if (!selectedPatient) return;

      const mrnKey = normalizeMrn(selectedPatient.mrn);
      const lead = queueRowsAll.find((row) => normalizeMrn(row.mrn) === mrnKey);
      const activePatient = activeIpdPatients.find(
        (row) => normalizeMrn(row.mrn) === mrnKey
      );

      if (lead) {
        setSelectedLeadId(lead.id);
        setForm(buildFormFromLead(lead));
      } else if (activePatient) {
        setSelectedLeadId('');
        setForm(buildFormFromActivePatient(activePatient));
      } else {
        setSelectedLeadId('');
        setForm((prev) => ({ ...prev, patientName: selectedPatient.name, mrn: selectedPatient.mrn }));
      }

      appliedMrnRef.current = mrnKey;
      const params = new URLSearchParams(searchParams.toString());
      params.set('mrn', selectedPatient.mrn);
      if (activePatient?.id) {
        params.set('patientId', activePatient.id);
      } else {
        params.delete('patientId');
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [
      activeIpdPatients,
      buildFormFromActivePatient,
      pathname,
      queueRowsAll,
      router,
      searchParams,
      topBarPatientOptions,
    ]
  );

  const topBarHeader = (
    <IpdPatientTopBar
      moduleTitle="IPD Admissions"
      sectionLabel="IPD"
      pageLabel="Admissions"
      patient={selectedTopBarPatient}
      fields={topBarFields}
      patientOptions={topBarPatientOptions}
      onSelectPatient={onSelectTopBarPatient}
    />
  );

  const allPatientColumns: CommonTableColumn<PatientRow>[] = [
    {
      id: 'mrn',
      label: 'MRN',
      minWidth: 140,
      renderCell: (patient) => patient.mrn,
    },
    {
      id: 'patientName',
      label: 'Patient Name',
      minWidth: 170,
      renderCell: (patient) => <Typography sx={{ fontWeight: 600 }}>{patient.patientName}</Typography>,
    },
    {
      id: 'entryType',
      label: 'Entry',
      minWidth: 130,
      renderCell: (patient) => (
        <Chip
          size="small"
          label={patient.entryType}
          color={patient.entryType === 'Created Now' ? 'info' : 'default'}
          variant={patient.entryType === 'Created Now' ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      id: 'ageGender',
      label: 'Age / Gender',
      minWidth: 130,
      renderCell: (patient) => patient.ageGender,
    },
    {
      id: 'admissionDate',
      label: 'Admission Date & Time',
      minWidth: 190,
      renderCell: (patient) => patient.admissionDate,
    },
    {
      id: 'ward',
      label: 'Ward',
      minWidth: 180,
      renderCell: (patient) => patient.ward,
    },
    {
      id: 'consultant',
      label: 'Consultant',
      minWidth: 180,
      renderCell: (patient) => patient.consultant,
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      renderCell: (patient) => (
        <Chip
          size="small"
          label={patient.status}
          color={patient.status === 'Admitted' ? 'success' : 'warning'}
        />
      ),
    },
    {
      id: 'open',
      label: 'Action',
      align: 'right',
      minWidth: 160,
      renderCell: (patient) => {
        const hasBed = Boolean(patient.bed);
        const route = hasBed
          ? `/ipd/beds?mrn=${encodeURIComponent(patient.mrn)}&patientId=${encodeURIComponent(patient.id)}`
          : `/ipd/beds?tab=bed-board&mrn=${encodeURIComponent(patient.mrn)}&patientId=${encodeURIComponent(patient.id)}`;

        return (
          <Button
            size="small"
            variant="outlined"
            disabled={!canOpenBedBoard}
            onClick={() => router.push(route)}
          >
            {hasBed ? 'Bed / Ward' : 'Allocate Bed'}
          </Button>
        );
      },
    },
  ];

  const queueColumns: CommonTableColumn<AdmissionQueueRow>[] = [
    {
      id: 'mrn',
      label: 'MRN',
      minWidth: 140,
      renderCell: (row) => row.mrn,
    },
    {
      id: 'patientName',
      label: 'Patient Name',
      minWidth: 170,
      renderCell: (row) => <Typography sx={{ fontWeight: 600 }}>{row.patientName}</Typography>,
    },
    {
      id: 'stage',
      label: 'Stage',
      minWidth: 150,
      renderCell: (row) => (
        <Chip
          size="small"
          label={row.stage}
          color={row.stage === 'Bed Pending' ? 'warning' : 'default'}
          variant={row.stage === 'Bed Pending' ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      id: 'source',
      label: 'Source',
      minWidth: 120,
      renderCell: (row) => row.source,
    },
    {
      id: 'priority',
      label: 'Priority',
      minWidth: 120,
      renderCell: (row) => (
        <Chip
          size="small"
          label={row.priority}
          color={row.priority === 'Routine' ? 'success' : row.priority === 'Urgent' ? 'warning' : 'error'}
        />
      ),
    },
    {
      id: 'preferredWard',
      label: 'Preferred Ward',
      minWidth: 180,
      renderCell: (row) => row.preferredWard,
    },
    {
      id: 'consultant',
      label: 'Consultant',
      minWidth: 180,
      renderCell: (row) => row.consultant,
    },
    {
      id: 'action',
      label: 'Action',
      align: 'right',
      minWidth: 180,
      renderCell: (row) => (
        <Button
          size="small"
          variant="outlined"
          disabled={!canOpenBedBoard || (row.stage === 'Pending Admission' && !canManageAdmissions)}
          onClick={() => handleQueueAllocateBed(row)}
        >
          Allocate Bed
        </Button>
      ),
    },
  ];

  const allPatientStatusOptions = React.useMemo(
    () => buildFilterOptions(allPatients.map((row) => row.status), 'All Status'),
    [allPatients]
  );
  const allPatientWardOptions = React.useMemo(
    () => buildFilterOptions(allPatients.map((row) => row.ward), 'All Wards'),
    [allPatients]
  );

  const queuePriorityOptions = React.useMemo(
    () => buildFilterOptions(queueRows.map((row) => row.priority), 'All Priority'),
    [queueRows]
  );
  const queueSourceOptions = React.useMemo(
    () => buildFilterOptions(queueRows.map((row) => row.source), 'All Source'),
    [queueRows]
  );

  const filteredAllPatients = React.useMemo(() => {
    const query = allSearch.trim().toLowerCase();
    return allPatients.filter((patient) => {
      if (query) {
        const searchableText = [
          patient.mrn,
          patient.patientName,
          patient.ageGender,
          patient.admissionDate,
          patient.diagnosis,
          patient.ward,
          patient.consultant,
          patient.status,
        ]
          .join(' ')
          .toLowerCase();
        if (!searchableText.includes(query)) return false;
      }

      if (allStatusFilter !== 'all' && patient.status !== allStatusFilter) return false;
      if (allWardFilter !== 'all' && patient.ward !== allWardFilter) return false;
      return true;
    });
  }, [allPatients, allSearch, allStatusFilter, allWardFilter]);

  const filteredQueueRows = React.useMemo(() => {
    const query = queueSearch.trim().toLowerCase();
    return queueRows.filter((lead) => {
      if (query) {
        const searchableText = [
          lead.patientName,
          lead.mrn,
          lead.provisionalDiagnosis,
          lead.preferredWard,
          lead.consultant,
          lead.source,
        ]
          .join(' ')
          .toLowerCase();
        if (!searchableText.includes(query)) return false;
      }

      if (queuePriorityFilter !== 'all' && lead.priority !== queuePriorityFilter) return false;
      if (queueSourceFilter !== 'all' && lead.source !== queueSourceFilter) return false;
      return true;
    });
  }, [queueRows, queueSearch, queuePriorityFilter, queueSourceFilter]);

  const updateFormField = <K extends keyof AdmissionDialogForm>(
    field: K,
    value: AdmissionDialogForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleQueueAllocateBed = (row: AdmissionQueueRow) => {
    if (!canOpenBedBoard) {
      setSnackbar({
        open: true,
        message: 'You do not have permission to open Bed / Ward.',
        severity: 'error',
      });
      return;
    }

    let patientIdForRoute = activeIpdPatients.find(
      (patient) => normalizeMrn(patient.mrn) === normalizeMrn(row.mrn)
    )?.id;

    if (row.stage === 'Pending Admission') {
      if (!canManageAdmissions) {
        setSnackbar({
          open: true,
          message: 'You do not have permission to create admissions.',
          severity: 'error',
        });
        return;
      }

      const lead = queueRowsAll.find(
        (item) => normalizeMrn(item.mrn) === normalizeMrn(row.mrn)
      );
      if (!lead) {
        setSnackbar({
          open: true,
          message: 'Admission lead not found for this patient.',
          severity: 'error',
        });
        return;
      }

      const registeredEncounter = registerIpdAdmissionEncounter({
        patientId: `admission-${Date.now()}`,
        mrn: lead.mrn.trim(),
        patientName: lead.patientName.trim(),
        consultant: lead.consultant.trim(),
        ward: lead.preferredWard.trim(),
        diagnosis: lead.provisionalDiagnosis.trim(),
      });
      patientIdForRoute = registeredEncounter.patientId;
      markOpdToIpdTransferHandledByMrn(lead.mrn.trim());
      setSnackbar({
        open: true,
        message: `Admission created for ${lead.patientName}. Proceed with bed allocation.`,
        severity: 'success',
      });
    }

    const patientIdQuery = patientIdForRoute
      ? `&patientId=${encodeURIComponent(patientIdForRoute)}`
      : '';
    router.push(`/ipd/beds?tab=bed-board&mrn=${encodeURIComponent(row.mrn)}${patientIdQuery}`);
  };

  const openDialogForNew = () => {
    if (!canManageAdmissions) {
      setSnackbar({
        open: true,
        message: 'You do not have permission to create admissions.',
        severity: 'error',
      });
      return;
    }
    if (selectedLead) {
      setForm(buildFormFromLead(selectedLead));
    } else {
      setForm(buildEmptyForm());
    }
    setErrors({});
    setDialogOpen(true);
  };

  const validateForm = (): boolean => {
    const nextErrors: AdmissionErrors = {};

    const requiredFields: Array<[keyof AdmissionDialogForm, string]> = [
      ['patientName', 'Patient name'],
      ['mrn', 'MRN'],
      ['mobile', 'Mobile'],
      ['admissionType', 'Admission type'],
      ['admissionSource', 'Admission source'],
      ['priority', 'Priority'],
      ['department', 'Department'],
      ['consultant', 'Consultant'],
      ['preferredWard', 'Preferred ward'],
      ['provisionalDiagnosis', 'Provisional diagnosis'],
      ['payerType', 'Payer type'],
    ];

    requiredFields.forEach(([field, label]) => {
      const value = form[field];
      if (typeof value === 'string' && value.trim().length === 0) {
        nextErrors[field] = `${label} is required`;
      }
    });

    if (form.payerType === 'Insurance' && !form.insuranceProvider.trim()) {
      nextErrors.insuranceProvider = 'Insurance provider is required';
    }

    if (form.payerType === 'Insurance' && !form.policyNumber.trim()) {
      nextErrors.policyNumber = 'Policy number is required';
    }

    if (!form.termsAccepted) {
      nextErrors.termsAccepted = 'Admission consent is required';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveDraft = () => {
    if (!canManageAdmissions) {
      setSnackbar({
        open: true,
        message: 'You do not have permission to save admission drafts.',
        severity: 'error',
      });
      return;
    }
    const now = new Date();
    const stamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSaveStamp(stamp);
    setSnackbar({
      open: true,
      message: 'Admission draft saved.',
      severity: 'info',
    });
  };

  const handleCreateAdmission = (openBedBoard: boolean) => {
    if (!canManageAdmissions) {
      setSnackbar({
        open: true,
        message: 'You do not have permission to create admissions.',
        severity: 'error',
      });
      return;
    }
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please complete required admission fields.',
        severity: 'error',
      });
      return;
    }

    const now = new Date();
    const createdId = `admission-${Date.now()}`;
    const registeredEncounter = registerIpdAdmissionEncounter({
      patientId: createdId,
      mrn: form.mrn.trim(),
      patientName: form.patientName.trim(),
      consultant: form.consultant.trim(),
      ward: form.preferredWard.trim(),
      diagnosis: form.provisionalDiagnosis.trim(),
    });
    markOpdToIpdTransferHandledByMrn(form.mrn.trim());
    setSaveStamp(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setDialogOpen(false);

    setSnackbar({
      open: true,
      message: `Admission created for ${form.patientName}.`,
      severity: 'success',
    });

    if (openBedBoard) {
      const mrnQuery = form.mrn ? `?mrn=${encodeURIComponent(form.mrn)}` : '?';
      const separator = mrnQuery.includes('?mrn=') ? '&' : '';
      const patientIdQuery = `patientId=${encodeURIComponent(registeredEncounter.patientId)}`;
      router.push(`/ipd/beds${mrnQuery}${separator}${patientIdQuery}`);
    }
  };

  return (
    <PageTemplate title="IPD Admissions" header={topBarHeader} currentPageTitle="Admissions">
      <Stack spacing={2}>
        {!canManageAdmissions ? (
          <Alert severity="warning">
            You are in read-only mode for admissions. Contact admin for `ipd.admissions.write` access.
          </Alert>
        ) : null}
     

        <IpdSectionCard
          title="Admission Records"
          // subtitle="All IPD Patients and Admission Queue in tab view."
          action={
            <Button variant="contained" onClick={openDialogForNew} disabled={!canManageAdmissions}>
              + New Admission
            </Button>
          }
          bodySx={ipdFormStylesSx}
        >
          <Stack spacing={1.5}>
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              spacing={1}
              alignItems={{ xs: 'stretch', lg: 'center' }}
              justifyContent="space-between"
            >
              <Tabs
                value={historyTab}
                onChange={(_, value: 'all' | 'queue') => setHistoryTab(value)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  px: 0.25,
                  flexShrink: 0,
                  '& .MuiTabs-indicator': {
                    display: 'none',
                  },
                  '& .MuiTabs-flexContainer': { gap: 0.5 },
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    minHeight: 40,
                    px: 2,
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderRadius: 1.5,
                    transition: 'all 0.2s ease',
                  },
                  '& .MuiTab-root.Mui-selected': {
                    color: 'common.white',
                    backgroundColor: 'primary.main',
                  },
                }}
              >
                <Tab value="all" label={`All IPD Patients - Admitted (${allPatients.length})`} />
                <Tab value="queue" label={`Admission Queue - Pending Bed (${queueRows.length})`} />
              </Tabs>

              {historyTab === 'all' ? (
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    justifyContent: { xs: 'flex-start', lg: 'flex-end' },
                  }}
                >
                  <TextField
                    size="small"
                    placeholder="Search all IPD patients..."
                    value={allSearch}
                    onChange={(event) => setAllSearch(event.target.value)}
                    sx={{ minWidth: { xs: '100%', sm: 250 }, maxWidth: 340 }}
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
                    value={allStatusFilter}
                    onChange={(event) => setAllStatusFilter(event.target.value)}
                    sx={{ minWidth: 150 }}
                  >
                    {allPatientStatusOptions.map((option) => (
                      <MenuItem key={`all-status-${option.value}`} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    size="small"
                    select
                    label="Ward"
                    value={allWardFilter}
                    onChange={(event) => setAllWardFilter(event.target.value)}
                    sx={{ minWidth: 180 }}
                  >
                    {allPatientWardOptions.map((option) => (
                      <MenuItem key={`all-ward-${option.value}`} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              ) : (
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    justifyContent: { xs: 'flex-start', lg: 'flex-end' },
                  }}
                >
                  <TextField
                    size="small"
                    placeholder="Search queue by patient, MRN, diagnosis..."
                    value={queueSearch}
                    onChange={(event) => setQueueSearch(event.target.value)}
                    sx={{ minWidth: { xs: '100%', sm: 280 }, maxWidth: 360 }}
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
                    label="Priority"
                    value={queuePriorityFilter}
                    onChange={(event) => setQueuePriorityFilter(event.target.value)}
                    sx={{ minWidth: 150 }}
                  >
                    {queuePriorityOptions.map((option) => (
                      <MenuItem key={`queue-priority-${option.value}`} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    size="small"
                    select
                    label="Source"
                    value={queueSourceFilter}
                    onChange={(event) => setQueueSourceFilter(event.target.value)}
                    sx={{ minWidth: 150 }}
                  >
                    {queueSourceOptions.map((option) => (
                      <MenuItem key={`queue-source-${option.value}`} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              )}
            </Stack>

            {historyTab === 'all' ? (
              <Box>
                <CommonTable
                  rows={filteredAllPatients}
                  columns={allPatientColumns}
                  getRowId={(patient) => patient.id}
                  emptyMessage="No IPD patients found."
                />
              </Box>
            ) : null}

            {historyTab === 'queue' ? (
              <Box>
                <CommonTable
                  rows={filteredQueueRows}
                  columns={queueColumns}
                  getRowId={(row) => row.id}
                  emptyMessage="No patients pending bed allocation."
                />
              </Box>
            ) : null}
          </Stack>
        </IpdSectionCard>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
          <DialogTitle sx={{ fontWeight: 700 }}>New Patient Admission</DialogTitle>
          <DialogContent dividers sx={ipdFormStylesSx}>
            <Stack spacing={2} sx={{ pt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                Fill required fields and create admission. Use "Create + Bed Allocate" to move directly to the Bed / Ward page.
              </Typography>

              <Grid container spacing={1.5}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Patient Name"
                    value={form.patientName}
                    onChange={(event) => updateFormField('patientName', event.target.value)}
                    error={Boolean(errors.patientName)}
                    helperText={errors.patientName}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="MRN"
                    value={form.mrn}
                    onChange={(event) => updateFormField('mrn', event.target.value)}
                    error={Boolean(errors.mrn)}
                    helperText={errors.mrn}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Mobile"
                    value={form.mobile}
                    onChange={(event) => updateFormField('mobile', event.target.value)}
                    error={Boolean(errors.mobile)}
                    helperText={errors.mobile}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    select
                    label="Admission Type"
                    value={form.admissionType}
                    onChange={(event) => updateFormField('admissionType', event.target.value)}
                    error={Boolean(errors.admissionType)}
                    helperText={errors.admissionType}
                  >
                    {['Medical', 'Surgical', 'Emergency', 'Maternity', 'Pediatric'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    select
                    label="Admission Source"
                    value={form.admissionSource}
                    onChange={(event) => updateFormField('admissionSource', event.target.value)}
                    error={Boolean(errors.admissionSource)}
                    helperText={errors.admissionSource}
                  >
                    {['OPD', 'ER', 'Transfer'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    select
                    label="Priority"
                    value={form.priority}
                    onChange={(event) => updateFormField('priority', event.target.value as AdmissionPriority)}
                    error={Boolean(errors.priority)}
                    helperText={errors.priority}
                  >
                    {['Routine', 'Urgent', 'Emergency'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={form.department}
                    onChange={(event) => updateFormField('department', event.target.value)}
                    error={Boolean(errors.department)}
                    helperText={errors.department}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Consultant"
                    value={form.consultant}
                    onChange={(event) => updateFormField('consultant', event.target.value)}
                    error={Boolean(errors.consultant)}
                    helperText={errors.consultant}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Preferred Ward"
                    value={form.preferredWard}
                    onChange={(event) => updateFormField('preferredWard', event.target.value)}
                    error={Boolean(errors.preferredWard)}
                    helperText={errors.preferredWard}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Provisional Diagnosis"
                    value={form.provisionalDiagnosis}
                    onChange={(event) => updateFormField('provisionalDiagnosis', event.target.value)}
                    error={Boolean(errors.provisionalDiagnosis)}
                    helperText={errors.provisionalDiagnosis}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Admission Reason"
                    value={form.admissionReason}
                    onChange={(event) => updateFormField('admissionReason', event.target.value)}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    select
                    label="Payer Type"
                    value={form.payerType}
                    onChange={(event) => updateFormField('payerType', event.target.value)}
                    error={Boolean(errors.payerType)}
                    helperText={errors.payerType}
                  >
                    {['General', 'Insurance', 'Corporate', 'Staff'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Insurance Provider"
                    value={form.insuranceProvider}
                    onChange={(event) => updateFormField('insuranceProvider', event.target.value)}
                    error={Boolean(errors.insuranceProvider)}
                    helperText={errors.insuranceProvider}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Policy Number"
                    value={form.policyNumber}
                    onChange={(event) => updateFormField('policyNumber', event.target.value)}
                    error={Boolean(errors.policyNumber)}
                    helperText={errors.policyNumber}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.termsAccepted}
                        onChange={(event) => updateFormField('termsAccepted', event.target.checked)}
                      />
                    }
                    label="Admission consent captured"
                  />
                  {errors.termsAccepted ? (
                    <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: -0.75 }}>
                      {errors.termsAccepted}
                    </Typography>
                  ) : null}
                </Grid>
              </Grid>

              <Typography variant="caption" color="text.secondary">
                {saveStamp ? `Last saved at ${saveStamp}` : 'No draft saved yet'}
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={handleSaveDraft} disabled={!canManageAdmissions}>
              Save Draft
            </Button>
            <Button variant="outlined" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => handleCreateAdmission(false)}
              disabled={!canManageAdmissions}
            >
              Create Admission
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleCreateAdmission(true)}
              disabled={!canManageAdmissions || !canOpenBedBoard}
            >
              Create + Bed Allocate
            </Button>
          </DialogActions>
        </Dialog>

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
