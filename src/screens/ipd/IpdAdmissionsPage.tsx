'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import { Alert, Avatar, Box, Button, Checkbox, Chip, Divider, FormControlLabel, InputAdornment, List, ListItemButton, ListItemText, MenuItem, Snackbar, Stack, TextField, Typography } from '@/src/ui/components/atoms';
import { Card, StatTile } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import {
  AssignmentInd as AssignmentIndIcon,
  CalendarMonth as CalendarMonthIcon,
  LocalHospital as LocalHospitalIcon,
  Search as SearchIcon,
  Send as SendIcon,
  Save as SaveIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import IpdFlowHeader from './components/IpdFlowHeader';
import { ADMISSION_LEADS, AdmissionLead, INPATIENT_STAYS } from './ipd-mock-data';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { getPatientByMrn } from '@/src/mocks/global-patients';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';

interface AdmissionFormData {
  patientName: string;
  mrn: string;
  patientType: string;
  aadhaarId: string;
  language: string;
  nationality: string;
  gender: string;
  age: string;
  mobile: string;
  kinName: string;
  kinPhone: string;
  admissionType: string;
  admissionSource: string;
  priority: string;
  department: string;
  consultant: string;
  preferredWard: string;
  provisionalDiagnosis: string;
  admissionReason: string;
  plannedAdmissionDate: string;
  plannedAdmissionTime: string;
  expectedLengthOfStay: string;
  payerType: string;
  insuranceProvider: string;
  policyNumber: string;
  corporateName: string;
  knownAllergies: string;
  comorbidities: string;
  vitalBP: string;
  vitalHR: string;
  vitalTemp: string;
  vitalSpO2: string;
  clinicalNotes: string;
  specialInstructions: string;
  isolationRequired: boolean;
  requiresVentilator: boolean;
  termsAccepted: boolean;
  privacyConsent: boolean;
}

type AdmissionFormErrors = Partial<Record<keyof AdmissionFormData, string>>;

interface CreatedAdmission {
  id: string;
  mrn: string;
  patientName: string;
  consultant: string;
  admissionType: string;
  preferredWard: string;
  priority: string;
  createdAt: string;
}

function getNowDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getNowTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function buildAdmissionForm(lead: AdmissionLead): AdmissionFormData {
  return {
    patientName: lead.patientName,
    mrn: lead.mrn,
    patientType: lead.patientType,
    aadhaarId: lead.aadhaarId,
    language: lead.language,
    nationality: lead.nationality,
    gender: lead.gender,
    age: String(lead.age),
    mobile: lead.mobile,
    kinName: lead.kinName,
    kinPhone: lead.kinPhone,
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
    plannedAdmissionDate: getNowDate(),
    plannedAdmissionTime: getNowTime(),
    expectedLengthOfStay: lead.priority === 'Emergency' ? '5' : '3',
    payerType: lead.patientType === 'Insurance' ? 'Insurance' : lead.patientType,
    insuranceProvider: lead.patientType === 'Insurance' ? 'HealthSecure TPA' : '',
    policyNumber: '',
    corporateName: lead.patientType === 'Corporate' ? 'Scanbo Corporate Plan' : '',
    knownAllergies: lead.knownAllergies,
    comorbidities: '',
    vitalBP: '',
    vitalHR: '',
    vitalTemp: '',
    vitalSpO2: '',
    clinicalNotes: '',
    specialInstructions: '',
    isolationRequired: false,
    requiresVentilator: lead.preferredWard === 'ICU',
    termsAccepted: false,
    privacyConsent: false,
  };
}

const DEFAULT_LEAD = ADMISSION_LEADS[0];

export default function IpdAdmissionsPage() {
  const router = useRouter();
  const mrnParam = useMrnParam();
  const [search, setSearch] = React.useState('');
  const [selectedLeadId, setSelectedLeadId] = React.useState(DEFAULT_LEAD?.id ?? '');
  const [form, setForm] = React.useState<AdmissionFormData>(
    DEFAULT_LEAD
      ? buildAdmissionForm(DEFAULT_LEAD)
      : {
          patientName: '',
          mrn: '',
          patientType: 'General',
          aadhaarId: '',
          language: 'English',
          nationality: 'Indian',
          gender: '',
          age: '',
          mobile: '',
          kinName: '',
          kinPhone: '',
          admissionType: 'Medical',
          admissionSource: 'OPD',
          priority: 'Routine',
          department: '',
          consultant: '',
          preferredWard: '',
          provisionalDiagnosis: '',
          admissionReason: '',
          plannedAdmissionDate: getNowDate(),
          plannedAdmissionTime: getNowTime(),
          expectedLengthOfStay: '',
          payerType: 'General',
          insuranceProvider: '',
          policyNumber: '',
          corporateName: '',
          knownAllergies: '',
          comorbidities: '',
          vitalBP: '',
          vitalHR: '',
          vitalTemp: '',
          vitalSpO2: '',
          clinicalNotes: '',
          specialInstructions: '',
          isolationRequired: false,
          requiresVentilator: false,
          termsAccepted: false,
          privacyConsent: false,
        }
  );
  const [errors, setErrors] = React.useState<AdmissionFormErrors>({});
  const [saveStamp, setSaveStamp] = React.useState('');
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

  const seededPatient = getPatientByMrn(form.mrn || mrnParam);
  const displayName = form.patientName || seededPatient?.name;
  const displayMrn = form.mrn || seededPatient?.mrn || mrnParam;
  const pageSubtitle = formatPatientLabel(displayName, displayMrn);

  const [todayAdmissions, setTodayAdmissions] = React.useState<CreatedAdmission[]>(
    INPATIENT_STAYS.slice(0, 2).map((stay, index) => ({
      id: `seed-${stay.id}`,
      mrn: stay.mrn,
      patientName: stay.patientName,
      consultant: stay.consultant,
      admissionType: index === 0 ? 'Medical' : 'Surgical',
      preferredWard: stay.ward,
      priority: index === 0 ? 'Urgent' : 'Routine',
      createdAt: index === 0 ? '08:15 AM' : '09:05 AM',
    }))
  );

  React.useEffect(() => {
    if (!mrnParam || mrnApplied) return;
    const lead = ADMISSION_LEADS.find((item) => item.mrn === mrnParam);
    if (lead) {
      setSelectedLeadId(lead.id);
      setForm(buildAdmissionForm(lead));
      setSearch(mrnParam);
    } else {
      const patient = getPatientByMrn(mrnParam);
      if (patient) {
        setForm((prev) => ({
          ...prev,
          mrn: patient.mrn,
          patientName: patient.name,
          age: String(patient.age),
          gender: patient.gender,
          mobile: patient.phone,
          department: patient.department,
          consultant: patient.primaryDoctor,
        }));
        setSearch(patient.mrn);
      }
    }
    setMrnApplied(true);
  }, [mrnParam, mrnApplied]);

  const filteredLeads = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return ADMISSION_LEADS;

    return ADMISSION_LEADS.filter((lead) =>
      [
        lead.patientName,
        lead.mrn,
        lead.provisionalDiagnosis,
        lead.preferredWard,
        lead.consultant,
        lead.priority,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [search]);

  const selectedLead = React.useMemo(
    () => ADMISSION_LEADS.find((lead) => lead.id === selectedLeadId),
    [selectedLeadId]
  );

  const urgentCount = ADMISSION_LEADS.filter((lead) => lead.priority !== 'Routine').length;
  const insuranceCount = ADMISSION_LEADS.filter((lead) => lead.patientType === 'Insurance').length;

  const updateField = <K extends keyof AdmissionFormData>(
    field: K,
    value: AdmissionFormData[K]
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

  const handleLeadSelect = (lead: AdmissionLead) => {
    setSelectedLeadId(lead.id);
    setForm(buildAdmissionForm(lead));
    setErrors({});
  };

  const validateForm = (): boolean => {
    const nextErrors: AdmissionFormErrors = {};

    const requiredTextFields: Array<[keyof AdmissionFormData, string]> = [
      ['patientName', 'Patient Name'],
      ['mrn', 'MRN'],
      ['gender', 'Gender'],
      ['mobile', 'Mobile'],
      ['admissionType', 'Admission Type'],
      ['admissionSource', 'Admission Source'],
      ['priority', 'Priority'],
      ['department', 'Department'],
      ['consultant', 'Consultant'],
      ['preferredWard', 'Preferred Ward'],
      ['provisionalDiagnosis', 'Provisional Diagnosis'],
      ['plannedAdmissionDate', 'Planned Admission Date'],
      ['plannedAdmissionTime', 'Planned Admission Time'],
      ['payerType', 'Payer Type'],
    ];

    requiredTextFields.forEach(([field, label]) => {
      const value = form[field];
      if (typeof value === 'string' && value.trim().length === 0) {
        nextErrors[field] = `${label} is required`;
      }
    });

    if (form.payerType === 'Insurance' && !form.insuranceProvider.trim()) {
      nextErrors.insuranceProvider = 'Insurance provider is required for insurance payer type';
    }

    if (form.payerType === 'Insurance' && !form.policyNumber.trim()) {
      nextErrors.policyNumber = 'Policy number is required for insurance payer type';
    }

    if (form.payerType === 'Corporate' && !form.corporateName.trim()) {
      nextErrors.corporateName = 'Corporate name is required for corporate payer type';
    }

    if (!form.termsAccepted) {
      nextErrors.termsAccepted = 'Admission consent is required';
    }

    if (!form.privacyConsent) {
      nextErrors.privacyConsent = 'Privacy consent is required';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveDraft = () => {
    const now = new Date();
    setSaveStamp(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setSnackbar({
      open: true,
      message: 'Admission draft saved locally.',
      severity: 'info',
    });
  };

  const handleCreateAdmission = (openBedBoard: boolean) => {
    const isValid = validateForm();

    if (!isValid) {
      setSnackbar({
        open: true,
        message: 'Please complete required fields before creating admission.',
        severity: 'error',
      });
      return;
    }

    const now = new Date();
    setSaveStamp(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    const createdRecord: CreatedAdmission = {
      id: `admission-${Date.now()}`,
      mrn: form.mrn,
      patientName: form.patientName,
      consultant: form.consultant,
      admissionType: form.admissionType,
      preferredWard: form.preferredWard,
      priority: form.priority,
      createdAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTodayAdmissions((prev) => [createdRecord, ...prev]);
    setSnackbar({
      open: true,
      message: `Admission created for ${form.patientName}.`,
      severity: 'success',
    });

    if (openBedBoard) {
      router.push(form.mrn ? `/ipd/beds?mrn=${form.mrn}` : '/ipd/beds');
    }
  };

  return (
    <PageTemplate title="IPD Admissions" subtitle={pageSubtitle} currentPageTitle="Admissions">
      <Stack spacing={2}>
        <IpdFlowHeader
          activeStep="admissions"
          title="Inpatient Admission Desk"
          description="Capture patient demographics, admission orders, and payer approvals before bed assignment."
          patientMrn={displayMrn}
          patientName={displayName}
          primaryAction={{
            label: 'Go to Bed Management',
            route: '/ipd/beds',
          }}
        />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <StatTile
              label="Waiting Admissions"
              value={ADMISSION_LEADS.length}
              tone="info"
              icon={<AssignmentIndIcon sx={{ fontSize: 32 }} />}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <StatTile
              label="Urgent / Emergency"
              value={urgentCount}
              tone="warning"
              icon={<WarningAmberIcon sx={{ fontSize: 32 }} />}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <StatTile
              label="Insurance Admissions"
              value={insuranceCount}
              tone="success"
              icon={<LocalHospitalIcon sx={{ fontSize: 32 }} />}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} lg={3.5}>
            <Card
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
              }}
            >
              <Stack spacing={1.5}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Admission Queue
                </Typography>
                <TextField
                  size="small"
                  placeholder="Search MRN, diagnosis, ward..."
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

                <List sx={{ p: 0 }}>
                  {filteredLeads.map((lead) => (
                    <ListItemButton
                      key={lead.id}
                      selected={lead.id === selectedLeadId}
                      onClick={() => handleLeadSelect(lead)}
                      sx={{
                        mb: 1,
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: lead.id === selectedLeadId ? 'primary.main' : 'divider',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Stack direction="row" spacing={1.25} sx={{ width: '100%' }}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 13 }}>
                          {lead.patientName
                            .split(' ')
                            .map((part) => part.charAt(0).toUpperCase())
                            .slice(0, 2)
                            .join('')}
                        </Avatar>
                        <Box sx={{ minWidth: 0, width: '100%' }}>
                          <ListItemText
                            primary={
                              <Typography noWrap variant="body2" sx={{ fontWeight: 700 }}>
                                {lead.patientName}
                              </Typography>
                            }
                            secondary={
                              <Typography noWrap variant="caption" color="text.secondary">
                                {lead.mrn} · {lead.source}
                              </Typography>
                            }
                          />
                          <Stack direction="row" spacing={0.75} flexWrap="wrap">
                            <Chip
                              size="small"
                              variant="outlined"
                              label={lead.preferredWard}
                            />
                            <Chip
                              size="small"
                              color={
                                lead.priority === 'Routine'
                                  ? 'success'
                                  : lead.priority === 'Urgent'
                                  ? 'warning'
                                  : 'error'
                              }
                              label={lead.priority}
                            />
                          </Stack>
                        </Box>
                      </Stack>
                    </ListItemButton>
                  ))}
                </List>

                {!selectedLead ? (
                  <Typography variant="body2" color="text.secondary">
                    Select a waiting patient from the queue.
                  </Typography>
                ) : null}
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} lg={8.5}>
            <Card
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1.5}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Admission Form
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Form fields are prefilled from registration and can be edited before final admission.
                    </Typography>
                  </Box>
                  <Chip
                    icon={<CalendarMonthIcon />}
                    label={`Planned: ${form.plannedAdmissionDate || '-'}`}
                    color="primary"
                    variant="outlined"
                  />
                </Stack>

                <Divider />

                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Patient and Contact
                </Typography>

                <Grid container spacing={1.5}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Patient Name"
                      value={form.patientName}
                      onChange={(event) => updateField('patientName', event.target.value)}
                      error={Boolean(errors.patientName)}
                      helperText={errors.patientName}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="MRN"
                      value={form.mrn}
                      onChange={(event) => updateField('mrn', event.target.value)}
                      error={Boolean(errors.mrn)}
                      helperText={errors.mrn}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      select
                      label="Patient Type"
                      value={form.patientType}
                      onChange={(event) => updateField('patientType', event.target.value)}
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
                      label="AADHAAR ID"
                      value={form.aadhaarId}
                      onChange={(event) => updateField('aadhaarId', event.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Language"
                      value={form.language}
                      onChange={(event) => updateField('language', event.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Nationality"
                      value={form.nationality}
                      onChange={(event) => updateField('nationality', event.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      select
                      label="Gender"
                      value={form.gender}
                      onChange={(event) => updateField('gender', event.target.value)}
                      error={Boolean(errors.gender)}
                      helperText={errors.gender}
                    >
                      {['Male', 'Female', 'Other'].map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Age"
                      type="number"
                      value={form.age}
                      onChange={(event) => updateField('age', event.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Mobile"
                      value={form.mobile}
                      onChange={(event) => updateField('mobile', event.target.value)}
                      error={Boolean(errors.mobile)}
                      helperText={errors.mobile}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Next of Kin"
                      value={form.kinName}
                      onChange={(event) => updateField('kinName', event.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Emergency Contact"
                      value={form.kinPhone}
                      onChange={(event) => updateField('kinPhone', event.target.value)}
                    />
                  </Grid>
                </Grid>

                <Divider />

                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Admission, Clinical, and Bed Request
                </Typography>

                <Grid container spacing={1.5}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      select
                      label="Admission Type"
                      value={form.admissionType}
                      onChange={(event) => updateField('admissionType', event.target.value)}
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

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      select
                      label="Admission Source"
                      value={form.admissionSource}
                      onChange={(event) => updateField('admissionSource', event.target.value)}
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

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      select
                      label="Priority"
                      value={form.priority}
                      onChange={(event) => updateField('priority', event.target.value)}
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

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Department"
                      value={form.department}
                      onChange={(event) => updateField('department', event.target.value)}
                      error={Boolean(errors.department)}
                      helperText={errors.department}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Consultant"
                      value={form.consultant}
                      onChange={(event) => updateField('consultant', event.target.value)}
                      error={Boolean(errors.consultant)}
                      helperText={errors.consultant}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Preferred Ward"
                      value={form.preferredWard}
                      onChange={(event) => updateField('preferredWard', event.target.value)}
                      error={Boolean(errors.preferredWard)}
                      helperText={errors.preferredWard}
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Planned Date"
                      type="date"
                      value={form.plannedAdmissionDate}
                      onChange={(event) => updateField('plannedAdmissionDate', event.target.value)}
                      error={Boolean(errors.plannedAdmissionDate)}
                      helperText={errors.plannedAdmissionDate}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Planned Time"
                      type="time"
                      value={form.plannedAdmissionTime}
                      onChange={(event) => updateField('plannedAdmissionTime', event.target.value)}
                      error={Boolean(errors.plannedAdmissionTime)}
                      helperText={errors.plannedAdmissionTime}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Expected LOS (days)"
                      type="number"
                      value={form.expectedLengthOfStay}
                      onChange={(event) => updateField('expectedLengthOfStay', event.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={10}>
                    <TextField
                      fullWidth
                      label="Provisional Diagnosis"
                      value={form.provisionalDiagnosis}
                      onChange={(event) => updateField('provisionalDiagnosis', event.target.value)}
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
                      onChange={(event) => updateField('admissionReason', event.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Known Allergies"
                      value={form.knownAllergies}
                      onChange={(event) => updateField('knownAllergies', event.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Comorbidities"
                      value={form.comorbidities}
                      onChange={(event) => updateField('comorbidities', event.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="BP"
                      placeholder="120/80"
                      value={form.vitalBP}
                      onChange={(event) => updateField('vitalBP', event.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="HR"
                      placeholder="80"
                      value={form.vitalHR}
                      onChange={(event) => updateField('vitalHR', event.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="SpO2"
                      placeholder="98%"
                      value={form.vitalSpO2}
                      onChange={(event) => updateField('vitalSpO2', event.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Temp"
                      placeholder="98.6 F"
                      value={form.vitalTemp}
                      onChange={(event) => updateField('vitalTemp', event.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.isolationRequired}
                          onChange={(event) => updateField('isolationRequired', event.target.checked)}
                        />
                      }
                      label="Isolation required"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.requiresVentilator}
                          onChange={(event) => updateField('requiresVentilator', event.target.checked)}
                        />
                      }
                      label="Ventilator support likely"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      label="Clinical Notes"
                      value={form.clinicalNotes}
                      onChange={(event) => updateField('clinicalNotes', event.target.value)}
                    />
                  </Grid>
                </Grid>

                <Divider />

                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Payer, Approvals, and Consent
                </Typography>

                <Grid container spacing={1.5}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      select
                      label="Payer Type"
                      value={form.payerType}
                      onChange={(event) => updateField('payerType', event.target.value)}
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

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Insurance Provider"
                      value={form.insuranceProvider}
                      onChange={(event) => updateField('insuranceProvider', event.target.value)}
                      error={Boolean(errors.insuranceProvider)}
                      helperText={errors.insuranceProvider}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Policy Number"
                      value={form.policyNumber}
                      onChange={(event) => updateField('policyNumber', event.target.value)}
                      error={Boolean(errors.policyNumber)}
                      helperText={errors.policyNumber}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Corporate Name"
                      value={form.corporateName}
                      onChange={(event) => updateField('corporateName', event.target.value)}
                      error={Boolean(errors.corporateName)}
                      helperText={errors.corporateName}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      label="Special Instructions"
                      value={form.specialInstructions}
                      onChange={(event) => updateField('specialInstructions', event.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.termsAccepted}
                          onChange={(event) => updateField('termsAccepted', event.target.checked)}
                        />
                      }
                      label="Admission consent signed"
                    />
                    {errors.termsAccepted ? (
                      <Typography variant="caption" color="error.main" sx={{ display: 'block' }}>
                        {errors.termsAccepted}
                      </Typography>
                    ) : null}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.privacyConsent}
                          onChange={(event) => updateField('privacyConsent', event.target.checked)}
                        />
                      }
                      label="Data privacy consent captured"
                    />
                    {errors.privacyConsent ? (
                      <Typography variant="caption" color="error.main" sx={{ display: 'block' }}>
                        {errors.privacyConsent}
                      </Typography>
                    ) : null}
                  </Grid>
                </Grid>

                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1.2}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {saveStamp ? `Last saved at ${saveStamp}` : 'Draft not saved yet'}
                  </Typography>

                  <Stack direction="row" spacing={1.2}>
                    <Button variant="outlined" startIcon={<SaveIcon />} onClick={handleSaveDraft}>
                      Save Draft
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SendIcon />}
                      onClick={() => handleCreateAdmission(false)}
                    >
                      Create Admission
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleCreateAdmission(true)}
                    >
                      Create + Bed Allocate
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Admissions Created Today
            </Typography>
            {todayAdmissions.map((admission) => (
              <Stack
                key={admission.id}
                direction={{ xs: 'column', md: 'row' }}
                spacing={1}
                justifyContent="space-between"
                sx={{ py: 0.75, borderBottom: '1px dashed', borderColor: 'divider' }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {admission.patientName} ({admission.mrn})
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip size="small" variant="outlined" label={admission.admissionType} />
                  <Chip size="small" variant="outlined" label={admission.preferredWard} />
                  <Chip
                    size="small"
                    color={admission.priority === 'Routine' ? 'success' : 'warning'}
                    label={admission.priority}
                  />
                  <Chip size="small" label={admission.createdAt} />
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Card>

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
