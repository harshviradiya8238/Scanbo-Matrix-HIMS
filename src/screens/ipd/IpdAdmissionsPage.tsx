'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
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
import {
  AssignmentInd as AssignmentIndIcon,
  LocalHospital as LocalHospitalIcon,
  Search as SearchIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { getPatientByMrn } from '@/src/mocks/global-patients';
import {
  ADMISSION_LEADS,
  AdmissionLead,
  AdmissionPriority,
  INPATIENT_STAYS,
} from './ipd-mock-data';
import {
  IpdMetricCard,
  IpdSectionCard,
  ipdFormStylesSx,
} from './components/ipd-ui';
import { registerIpdAdmissionEncounter } from './ipd-encounter-context';

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

interface CreatedAdmission {
  id: string;
  mrn: string;
  patientName: string;
  ageGender: string;
  admissionDate: string;
  consultant: string;
  ward: string;
  status: 'Admitted' | 'Observation';
  priority: AdmissionPriority;
}

interface PatientRow {
  id: string;
  mrn: string;
  patientName: string;
  ageGender: string;
  admissionDate: string;
  consultant: string;
  ward: string;
  status: 'Admitted' | 'Observation';
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

export default function IpdAdmissionsPage() {
  const router = useRouter();
  const mrnParam = useMrnParam();

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
  const [mrnApplied, setMrnApplied] = React.useState(false);

  const [createdAdmissions, setCreatedAdmissions] = React.useState<CreatedAdmission[]>(
    INPATIENT_STAYS.slice(0, 2).map((stay, index) => ({
      id: `seed-${stay.id}`,
      mrn: stay.mrn,
      patientName: stay.patientName,
      ageGender: stay.ageGender,
      admissionDate: formatDateTimeForRow(new Date(stay.admissionDate)),
      consultant: stay.consultant,
      ward: stay.ward,
      status: index === 0 ? 'Admitted' : 'Observation',
      priority: index === 0 ? 'Urgent' : 'Routine',
    }))
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

  React.useEffect(() => {
    if (!mrnParam || mrnApplied) return;
    const lead = ADMISSION_LEADS.find((item) => item.mrn === mrnParam);
    if (lead) {
      setSelectedLeadId(lead.id);
      setForm(buildFormFromLead(lead));
    }
    setMrnApplied(true);
  }, [mrnParam, mrnApplied]);

  const selectedLead = React.useMemo(
    () => ADMISSION_LEADS.find((lead) => lead.id === selectedLeadId),
    [selectedLeadId]
  );

  const seededPatient = getPatientByMrn(form.mrn || mrnParam);
  const displayName = form.patientName || seededPatient?.name;
  const displayMrn = form.mrn || seededPatient?.mrn || mrnParam;
  const pageSubtitle = formatPatientLabel(displayName, displayMrn);

  const queueRows = ADMISSION_LEADS;

  const allPatients = React.useMemo(() => {
    const existing: PatientRow[] = INPATIENT_STAYS.map((stay) => ({
      id: stay.id,
      mrn: stay.mrn,
      patientName: stay.patientName,
      ageGender: stay.ageGender,
      admissionDate: formatDateTimeForRow(new Date(stay.admissionDate)),
      consultant: stay.consultant,
      ward: stay.ward,
      status: 'Admitted',
    }));

    const merged = new Map<string, PatientRow>();
    existing.forEach((row) => merged.set(row.mrn, row));

    createdAdmissions.forEach((row) => {
      merged.set(row.mrn, {
        id: row.id,
        mrn: row.mrn,
        patientName: row.patientName,
        ageGender: row.ageGender,
        admissionDate: row.admissionDate,
        consultant: row.consultant,
        ward: row.ward,
        status: row.status,
      });
    });

    return Array.from(merged.values());
  }, [createdAdmissions]);

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
      label: 'Open',
      align: 'right',
      minWidth: 140,
      renderCell: (patient) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => router.push(`/ipd/beds?mrn=${encodeURIComponent(patient.mrn)}`)}
        >
          Bed / Ward
        </Button>
      ),
    },
  ];

  const queueColumns: CommonTableColumn<AdmissionLead>[] = [
    {
      id: 'mrn',
      label: 'MRN',
      minWidth: 140,
      renderCell: (lead) => lead.mrn,
    },
    {
      id: 'patientName',
      label: 'Patient Name',
      minWidth: 170,
      renderCell: (lead) => <Typography sx={{ fontWeight: 600 }}>{lead.patientName}</Typography>,
    },
    {
      id: 'source',
      label: 'Source',
      minWidth: 120,
      renderCell: (lead) => lead.source,
    },
    {
      id: 'priority',
      label: 'Priority',
      minWidth: 120,
      renderCell: (lead) => (
        <Chip
          size="small"
          label={lead.priority}
          color={lead.priority === 'Routine' ? 'success' : lead.priority === 'Urgent' ? 'warning' : 'error'}
        />
      ),
    },
    {
      id: 'preferredWard',
      label: 'Preferred Ward',
      minWidth: 180,
      renderCell: (lead) => lead.preferredWard,
    },
    {
      id: 'consultant',
      label: 'Consultant',
      minWidth: 180,
      renderCell: (lead) => lead.consultant,
    },
    {
      id: 'action',
      label: 'Action',
      align: 'right',
      minWidth: 150,
      renderCell: (lead) => (
        <Button size="small" variant="outlined" onClick={() => openDialogForLead(lead)}>
          Add Admission
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

  const urgentCount = queueRows.filter((lead) => lead.priority !== 'Routine').length;
  const insuranceCount = queueRows.filter((lead) => lead.patientType === 'Insurance').length;

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

  const openDialogForLead = (lead: AdmissionLead) => {
    setSelectedLeadId(lead.id);
    setForm(buildFormFromLead(lead));
    setErrors({});
    setDialogOpen(true);
  };

  const openDialogForNew = () => {
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
    const created: CreatedAdmission = {
      id: createdId,
      mrn: form.mrn,
      patientName: form.patientName,
      ageGender: '--',
      admissionDate: formatDateTimeForRow(now),
      consultant: form.consultant,
      ward: form.preferredWard,
      status: form.priority === 'Routine' ? 'Admitted' : 'Observation',
      priority: form.priority,
    };

    setCreatedAdmissions((prev) => [created, ...prev]);
    registerIpdAdmissionEncounter({
      patientId: createdId,
      mrn: form.mrn.trim(),
      patientName: form.patientName.trim(),
      consultant: form.consultant.trim(),
      ward: form.preferredWard.trim(),
      diagnosis: form.provisionalDiagnosis.trim(),
    });
    setSaveStamp(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setDialogOpen(false);

    setSnackbar({
      open: true,
      message: `Admission created for ${form.patientName}.`,
      severity: 'success',
    });

    if (openBedBoard) {
      router.push(form.mrn ? `/ipd/beds?mrn=${encodeURIComponent(form.mrn)}` : '/ipd/beds');
    }
  };

  return (
    <PageTemplate title="IPD Admissions" subtitle={pageSubtitle} currentPageTitle="Admissions">
      <Stack spacing={2}>
       

        <IpdSectionCard
          title="Admission Records"
          // subtitle="All IPD Patients and Admission Queue in tab view."
          action={
            <Button variant="contained" onClick={openDialogForNew}>
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
                <Tab value="all" label={`All IPD Patients (${allPatients.length})`} />
                <Tab value="queue" label={`Admission Queue (${queueRows.length})`} />
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
                  getRowId={(lead) => lead.id}
                  emptyMessage="No waiting admission leads found."
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
            <Button variant="outlined" onClick={handleSaveDraft}>
              Save Draft
            </Button>
            <Button variant="outlined" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={() => handleCreateAdmission(false)}>
              Create Admission
            </Button>
            <Button variant="contained" color="success" onClick={() => handleCreateAdmission(true)}>
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
