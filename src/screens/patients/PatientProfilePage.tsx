'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@/src/ui/components/atoms';
import { Card, StatTile } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { useTheme, alpha } from '@mui/material';
import {
  CalendarMonth as CalendarMonthIcon,
  Description as DescriptionIcon,
  EventNote as EventNoteIcon,
  EventAvailable as EventAvailableIcon,
  Favorite as FavoriteIcon,
  FitnessCenter as FitnessCenterIcon,
  Healing as HealingIcon,
  History as HistoryIcon,
  ImageOutlined as ImageOutlinedIcon,
  LocalPharmacy as LocalPharmacyIcon,
  MonitorHeart as MonitorHeartIcon,
  PersonOutline as PersonOutlineIcon,
  ReportProblem as ReportProblemIcon,
  Scale as ScaleIcon,
  Science as ScienceIcon,
  Thermostat as ThermostatIcon,
  Air as AirIcon,
  VerifiedUser as VerifiedUserIcon,
  Vaccines as VaccinesIcon,
  WarningAmber as WarningAmberIcon,
  WaterDrop as WaterDropIcon,
} from '@mui/icons-material';
import GlobalPatientSearch from '@/src/ui/components/molecules/GlobalPatientSearch';
import { GLOBAL_PATIENTS, getPatientByMrn } from '@/src/mocks/global-patients';
import { useOpdData } from '@/src/store/opdHooks';
import { getSoftSurface } from '@/src/core/theme/surfaces';

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : '—');

const formatLongDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

const buildDateTime = (date: string, time: string) => new Date(`${date}T${time}:00`);

const formatFrequency = (value: string) => {
  switch (value) {
    case 'BD':
      return 'Twice daily';
    case 'OD':
      return 'Once daily';
    case 'HS':
      return 'At bedtime';
    case 'SOS':
      return 'As needed';
    default:
      return value;
  }
};

interface InfoRowProps {
  label: string;
  value?: React.ReactNode;
}

const InfoRow = ({ label, value }: InfoRowProps) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    sx={{ py: 1, borderBottom: '1px solid', borderColor: 'rgba(15, 23, 42, 0.06)' }}
  >
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
      {value ?? '—'}
    </Typography>
  </Stack>
);

interface TabPanelProps {
  value: string;
  tab: string;
  children: React.ReactNode;
}

const TabPanel = ({ value, tab, children }: TabPanelProps) =>
  value === tab ? <Box sx={{ mt: 0 }}>{children}</Box> : null;

export default function PatientProfilePage() {
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const router = useRouter();
  const searchParams = useSearchParams();
  const mrn = searchParams.get('mrn')?.toUpperCase() ?? '';
  const { appointments, encounters, vitalTrends, medicationCatalog } = useOpdData();
  const patient = getPatientByMrn(mrn);
  const cardShadow = '0 12px 24px rgba(15, 23, 42, 0.06)';
  const tileShadow = '0 8px 18px rgba(15, 23, 42, 0.05)';
  const lightBorder = `1px solid ${alpha(theme.palette.text.primary, 0.04)}`;
  const dividerSx = { my: 1.5, borderColor: alpha(theme.palette.text.primary, 0.08) };
  const tabHeaderSx = { mb: 1.5 };

  const opdAppointments = React.useMemo(
    () => appointments.filter((appointment) => appointment.mrn === patient?.mrn),
    [appointments, patient?.mrn]
  );

  const opdEncounter = React.useMemo(
    () => encounters.find((encounter) => encounter.mrn === patient?.mrn),
    [encounters, patient?.mrn]
  );

  const timelineAppointments = React.useMemo(
    () =>
      [...opdAppointments].sort(
        (a, b) => buildDateTime(b.date, b.time).getTime() - buildDateTime(a.date, a.time).getTime()
      ),
    [opdAppointments]
  );

  const latestAppointment = timelineAppointments[0];

  const vitalHistory = React.useMemo(
    () => (opdEncounter ? vitalTrends.filter((record) => record.patientId === opdEncounter.id) : []),
    [opdEncounter, vitalTrends]
  );

  const latestVital = vitalHistory.length ? vitalHistory[vitalHistory.length - 1] : undefined;

  const tabs = [
    { value: 'history', label: 'Medical History' },
    { value: 'medications', label: 'Medications' },
    { value: 'labs', label: 'Lab Results' },
    { value: 'imaging', label: 'Imaging' },
    { value: 'documents', label: 'Documents' },
    { value: 'appointments', label: 'Appointments' },
    { value: 'immunizations', label: 'Immunizations' },
    { value: 'problems', label: 'Problem List' },
    
  ];

  const [activeTab, setActiveTab] = React.useState(tabs[0].value);

  const payerType = latestAppointment?.payerType ?? 'General';
  const insuranceLabel =
    payerType === 'Insurance'
      ? 'HealthSecure TPA'
      : payerType === 'Corporate'
        ? 'Scanbo Corporate Plan'
        : 'Self Pay';

  const allergiesRaw = opdEncounter?.allergies ?? [];
  const allergies = allergiesRaw.filter((item) => item && item.toLowerCase() !== 'no known allergies');
  const allergyDisplay = allergies.length ? allergies : ['No known allergies'];

  const problems = opdEncounter?.problems ?? [];

  const patientMedications = React.useMemo(() => {
    if (!medicationCatalog.length) return [];

    const preferredNames = new Set<string>();
    if (patient?.tags.includes('Diabetic')) preferredNames.add('Metformin');
    if (patient?.tags.includes('Hypertension')) preferredNames.add('Telmisartan');
    if (patient?.tags.includes('Cardiac')) preferredNames.add('Atorvastatin');

    const prioritized = medicationCatalog.filter((med) => preferredNames.has(med.genericName));
    const fallback = medicationCatalog.filter((med) => !preferredNames.has(med.genericName));
    const selected = [...prioritized, ...fallback].slice(0, 4);

    return selected.map((med, index) => ({
      name: med.genericName,
      dosage: med.strength,
      frequency: med.commonFrequency,
      status: index === selected.length - 1 && selected.length > 2 ? 'Discontinued' : 'Active',
    }));
  }, [medicationCatalog, patient?.tags]);

  const medicationTableRows = React.useMemo(() => {
    if (!medicationCatalog.length) return [];

    const metaMap: Record<
      string,
      { subtitle: string; startDate: string; refills: string; status?: 'Active' | 'Completed' }
    > = {
      Metformin: {
        subtitle: 'Antihyperglycemic – Biguanide',
        startDate: '2024-01-15',
        refills: '3 remaining',
      },
      Telmisartan: {
        subtitle: 'Antihypertensive – ARB',
        startDate: '2023-11-02',
        refills: '2 remaining',
      },
      Pantoprazole: {
        subtitle: 'Proton Pump Inhibitor',
        startDate: '2024-02-01',
        refills: '2 remaining',
      },
      Paracetamol: {
        subtitle: 'Analgesic / Antipyretic',
        startDate: '2024-03-10',
        refills: 'PRN',
      },
      Atorvastatin: {
        subtitle: 'Cholesterol Management – Statin',
        startDate: '2024-08-05',
        refills: '4 remaining',
      },
      'Amoxicillin + Clavulanate': {
        subtitle: 'Antibiotic',
        startDate: '2025-06-22',
        refills: 'N/A',
        status: 'Completed',
      },
    };

    const preferredNames = new Set<string>();
    if (patient?.tags.includes('Diabetic')) preferredNames.add('Metformin');
    if (patient?.tags.includes('Hypertension')) preferredNames.add('Telmisartan');
    if (patient?.tags.includes('Cardiac')) preferredNames.add('Atorvastatin');

    const prioritized = medicationCatalog.filter((med) => preferredNames.has(med.genericName));
    const fallback = medicationCatalog.filter((med) => !preferredNames.has(med.genericName));
    const selected = [...prioritized, ...fallback].slice(0, 6);

    const prescriber = latestAppointment?.provider ?? patient?.primaryDoctor ?? '—';

    return selected.map((med, index) => {
      const meta = metaMap[med.genericName];
      const fallbackStart = patient?.lastVisit ?? '2024-01-01';
      const status = meta?.status ?? (index === selected.length - 1 ? 'Completed' : 'Active');

      return {
        name: med.genericName,
        subtitle: meta?.subtitle ?? med.form,
        dosage: `${med.strength} · ${formatFrequency(med.commonFrequency)}`,
        prescriber,
        startDate: meta?.startDate ?? fallbackStart,
        status,
        refills: meta?.refills ?? (status === 'Active' ? '3 remaining' : 'N/A'),
      };
    });
  }, [latestAppointment?.provider, medicationCatalog, patient?.primaryDoctor, patient?.lastVisit, patient?.tags]);

  const labResults = [
    {
      category: 'Metabolic Panel',
      results: [
        { test: 'Glucose (Fasting)', value: '98 mg/dL', range: '70-100', status: 'Normal' },
        { test: 'Creatinine', value: '0.9 mg/dL', range: '0.6-1.3', status: 'Normal' },
      ],
    },
    {
      category: 'Lipid Profile',
      results: [
        { test: 'LDL Cholesterol', value: '102 mg/dL', range: '<100', status: 'Borderline' },
        { test: 'HDL Cholesterol', value: '52 mg/dL', range: '>40', status: 'Normal' },
      ],
    },
  ];

  const documents = [
    { name: 'Annual Physical Summary', type: 'PDF', date: '2026-02-04' },
    { name: 'Lab Report - Lipid Profile', type: 'PDF', date: '2026-02-01' },
    { name: 'Imaging Order - Chest X-Ray', type: 'Order', date: '2025-12-18' },
  ];

  const immunizations = [
    { name: 'Influenza', date: '2025-10-01', status: 'Completed' },
    { name: 'COVID-19 Booster', date: '2025-08-15', status: 'Completed' },
    { name: 'Tetanus (Tdap)', date: '2023-03-12', status: 'Completed' },
  ];

  const completedVisits = opdAppointments.filter((appointment) => appointment.status === 'Completed').length;
  const showRate = opdAppointments.length
    ? Math.round((completedVisits / opdAppointments.length) * 100)
    : null;

  const vitalTiles = [
    {
      label: 'Blood Pressure',
      value: latestVital?.bp ?? opdEncounter?.vitals.bp ?? '—',
      icon: <MonitorHeartIcon fontSize="small" />,
    },
    {
      label: 'Heart Rate',
      value: latestVital?.hr ?? opdEncounter?.vitals.hr ?? '—',
      icon: <FavoriteIcon fontSize="small" />,
    },
    {
      label: 'Temperature',
      value: latestVital?.temp ?? opdEncounter?.vitals.temp ?? '—',
      icon: <ThermostatIcon fontSize="small" />,
    },
    {
      label: 'Respiratory Rate',
      value: latestVital?.rr ?? opdEncounter?.vitals.rr ?? '—',
      icon: <AirIcon fontSize="small" />,
    },
    {
      label: 'SpO2',
      value: latestVital?.spo2 ?? opdEncounter?.vitals.spo2 ?? '—',
      icon: <WaterDropIcon fontSize="small" />,
    },
    {
      label: 'Pain Level',
      value: latestVital?.painScore !== undefined ? `${latestVital.painScore}/10` : '—',
      icon: <HealingIcon fontSize="small" />,
    },
    {
      label: 'Weight',
      value: opdEncounter?.vitals.weightKg ? `${opdEncounter.vitals.weightKg} kg` : '—',
      icon: <ScaleIcon fontSize="small" />,
    },
    {
      label: 'BMI',
      value: opdEncounter?.vitals.bmi ?? '—',
      icon: <FitnessCenterIcon fontSize="small" />,
    },
  ];

  if (!patient) {
    return (
      <PageTemplate title="Patient Profile" currentPageTitle="Profile">
        <Card elevation={0} sx={{ p: 3, borderRadius: 2, boxShadow: cardShadow, backgroundColor: 'background.paper' }}>
          <Stack spacing={2} alignItems="center">
            <Typography variant="h6">Find a patient</Typography>
            <Typography variant="body2" color="text.secondary">
              Search by MRN, name, or phone to open the patient profile.
            </Typography>
            <Box sx={{ width: { xs: '100%', sm: 420 } }}>
              <GlobalPatientSearch />
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
              {GLOBAL_PATIENTS.slice(0, 4).map((seed) => (
                <Chip
                  key={seed.mrn}
                  label={`${seed.name} · ${seed.mrn}`}
                  variant="outlined"
                  onClick={() => router.push(`/patients/profile?mrn=${seed.mrn}`)}
                />
              ))}
            </Stack>
          </Stack>
        </Card>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title="Patient Profile" currentPageTitle="Profile">
      <Stack spacing={2.5}>
        <Card
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            boxShadow: cardShadow,
            backgroundColor: softSurface,
          }}
        >
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', lg: 'center' }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: theme.palette.primary.main, fontSize: 20 }}>
                {getInitials(patient.name)}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {patient.name}
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 0.5 }}>
                  {[
                    { label: 'MRN', value: patient.mrn },
                    { label: 'Age', value: `${patient.age} yrs` },
                    { label: 'Gender', value: patient.gender },
                    { label: 'Department', value: patient.department },
                  ].map((meta) => (
                    <Stack key={meta.label} direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        {meta.label}:
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {meta.value}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                  <Chip
                    label={patient.status}
                    color={patient.status === 'Active' ? 'success' : 'warning'}
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    label={payerType === 'General' ? 'Self Pay' : payerType}
                    color={payerType === 'Insurance' ? 'info' : 'default'}
                    variant="outlined"
                    size="small"
                  />
                  {allergies.length ? (
                    <Chip label="Has Allergies" color="error" variant="outlined" size="small" />
                  ) : null}
                  {patient.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Box>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignSelf={{ xs: 'stretch', lg: 'center' }}>
              <Button
                variant="contained"
                onClick={() => router.push(`/appointments/visit?mrn=${patient.mrn}`)}
              >
                New Visit
              </Button>
              <Button variant="outlined">
                Send Message
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.print();
                  }
                }}
              >
                Print Chart
              </Button>
            </Stack>
          </Stack>
        </Card>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 2,
          }}
        >
          <StatTile
            label="Total Visits"
            value={opdAppointments.length}
            subtitle={latestAppointment ? `Last on ${formatDate(latestAppointment.date)}` : 'No visits yet'}
            icon={<CalendarMonthIcon fontSize="small" />}
            variant="soft"
            sx={{ boxShadow: cardShadow }}
          />
          <StatTile
            label="Active Medications"
            value={patientMedications.filter((med) => med.status === 'Active').length}
            subtitle={patientMedications.length ? 'On profile' : 'None listed'}
            icon={<LocalPharmacyIcon fontSize="small" />}
            variant="soft"
            sx={{ boxShadow: cardShadow }}
          />
          <StatTile
            label="Vitals Captured"
            value={vitalHistory.length}
            subtitle={latestVital ? `Latest ${latestVital.recordedAt}` : 'No vitals recorded'}
            icon={<MonitorHeartIcon fontSize="small" />}
            variant="soft"
            sx={{ boxShadow: cardShadow }}
          />
          <StatTile
            label="Show Rate"
            value={showRate === null ? '—' : `${showRate}%`}
            subtitle={opdAppointments.length ? `${completedVisits} completed` : 'No visits yet'}
            icon={<EventAvailableIcon fontSize="small" />}
            variant="soft"
            sx={{ boxShadow: cardShadow }}
          />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', xl: '360px 1fr' },
            gap: 2,
            alignItems: 'start',
          }}
        >
          <Stack spacing={1.5}>
            <Card
              elevation={0}
              sx={{ p: 2, borderRadius: 2, boxShadow: cardShadow, backgroundColor: 'background.paper' }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <VerifiedUserIcon fontSize="small" color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Insurance Information
                </Typography>
              </Stack>
              <Divider sx={dividerSx} />
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  color: 'common.white',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  mb: 2,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {insuranceLabel}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {payerType} coverage
                </Typography>
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ opacity: 0.75 }}>
                      Member ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {payerType === 'General' ? '—' : `${patient.mrn.replace('MRN-', 'MEM-')}`}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ opacity: 0.75 }}>
                      Plan
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {payerType === 'Insurance' ? 'PPO' : payerType === 'Corporate' ? 'Corporate' : 'Self Pay'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              <Stack spacing={0}>
                <InfoRow label="Primary Doctor" value={patient.primaryDoctor} />
                <InfoRow label="Department" value={patient.department} />
              </Stack>
            </Card>

            <Card
              elevation={0}
              sx={{ p: 2, borderRadius: 2, boxShadow: cardShadow, backgroundColor: 'background.paper' }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonOutlineIcon fontSize="small" color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Demographics & Contact
                </Typography>
              </Stack>
              <Divider sx={dividerSx} />
              <Stack spacing={0}>
                <InfoRow label="Phone" value={patient.phone} />
                <InfoRow label="City" value={patient.city} />
                <InfoRow label="Primary Doctor" value={patient.primaryDoctor} />
                <InfoRow label="Department" value={patient.department} />
                <InfoRow label="Emergency Contact" value="—" />
              </Stack>
            </Card>

            <Card
              elevation={0}
              sx={{ p: 2, borderRadius: 2, boxShadow: cardShadow, backgroundColor: 'background.paper' }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <MonitorHeartIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Latest Vital Signs
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {latestVital ? `Recorded ${latestVital.recordedAt}` : 'No vitals yet'}
                </Typography>
              </Stack>
              <Divider sx={dividerSx} />
              <Grid container spacing={1.75}>
                {vitalTiles.map((item) => (
                  <Grid item xs={6} key={item.label}>
                    <Box
                      sx={{
                        p: 1.75,
                        borderRadius: 1.5,
                        border: lightBorder,
                        backgroundColor: 'background.paper',
                        boxShadow: tileShadow,
                        display: 'grid',
                        gap: 0.8,
                        minHeight: 96,
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)',
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: 1,
                            display: 'grid',
                            placeItems: 'center',
                            backgroundColor: alpha(theme.palette.primary.main, 0.12),
                            color: theme.palette.primary.main,
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {item.label}
                        </Typography>
                      </Stack>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          fontSize: '1.15rem',
                          lineHeight: 1.3,
                          color: 'text.secondary',
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Card>

            <Card
              elevation={0}
              sx={{ p: 2, borderRadius: 2, boxShadow: cardShadow, backgroundColor: 'background.paper' }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <WarningAmberIcon fontSize="small" color="error" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Allergies & Alerts
                </Typography>
              </Stack>
              <Divider sx={dividerSx} />
              <Stack spacing={1}>
                {allergyDisplay.map((allergy) => (
                  <Box
                    key={allergy}
                    sx={{
                      p: 1.25,
                      borderRadius: 1.5,
                      border: lightBorder,
                      borderLeft: '3px solid',
                      borderLeftColor: allergies.length ? theme.palette.error.main : theme.palette.success.main,
                      backgroundColor: allergies.length
                        ? alpha(theme.palette.error.main, 0.08)
                        : alpha(theme.palette.success.main, 0.06),
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: allergies.length ? theme.palette.error.main : theme.palette.text.primary,
                      }}
                    >
                      {allergy}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Card>
          </Stack>

          <Stack spacing={1}>
            <Card
              elevation={0}
              sx={{ p: 0, borderRadius: 2, boxShadow: cardShadow, backgroundColor: 'background.paper' }}
            >
              <Box sx={{ px: 0.5, py: 0.5, borderBottom: lightBorder }}>
                <Tabs
                  value={activeTab}
                  onChange={(_, value) => setActiveTab(value)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    px: 0.5,
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
                      backgroundColor: theme.palette.primary.main,
                      boxShadow: `0 6px 12px ${alpha(theme.palette.primary.main, 0.24)}`,
                    },
                  }}
                >
                  {tabs.map((tab) => (
                    <Tab key={tab.value} label={tab.label} value={tab.value} />
                  ))}
                </Tabs>
              </Box>

              <Box sx={{ p: 2 }}>
                <TabPanel value={activeTab} tab="history">
                <Stack direction="row" spacing={1} alignItems="center" sx={tabHeaderSx}>
                  <HistoryIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Encounter Timeline
                  </Typography>
                </Stack>
                {timelineAppointments.length ? (
                  <Box
                    sx={{
                      position: 'relative',
                      pl: 4,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 16,
                        top: 6,
                        bottom: 6,
                        width: 2,
                        backgroundColor: alpha(theme.palette.text.primary, 0.08),
                      },
                    }}
                  >
                    <Stack spacing={2}>
                      {timelineAppointments.map((appointment) => (
                        <Box key={appointment.id} sx={{ position: 'relative', pl: 1 }}>
                          <Box
                            sx={{
                              position: 'absolute',
                              left: -24,
                              top: 20,
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              backgroundColor: 'background.paper',
                              border: '3px solid',
                              borderColor: theme.palette.primary.main,
                            }}
                          />
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              backgroundColor: alpha(theme.palette.text.primary, 0.02),
                              border: lightBorder,
                            }}
                          >
                            <Stack
                              direction={{ xs: 'column', sm: 'row' }}
                              justifyContent="space-between"
                              alignItems={{ xs: 'flex-start', sm: 'center' }}
                              spacing={1}
                            >
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {appointment.visitType} · {appointment.department}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatLongDate(appointment.date)}
                              </Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {appointment.chiefComplaint || 'Clinical encounter logged.'}
                            </Typography>
                            <Stack direction="row" spacing={2} flexWrap="wrap">
                              <Typography variant="caption" color="text.secondary">
                                Provider: {appointment.provider}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Department: {appointment.department}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Type: {appointment.visitType}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Status: {appointment.status}
                              </Typography>
                            </Stack>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No encounters recorded for this patient yet.
                  </Typography>
                )}
                </TabPanel>

                <TabPanel value={activeTab} tab="medications">
                <Stack direction="row" spacing={1} alignItems="center" sx={tabHeaderSx}>
                  <LocalPharmacyIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Medications
                  </Typography>
                </Stack>
                {medicationTableRows.length ? (
                  <TableContainer
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                      backgroundColor: 'transparent',
                    }}
                  >
                    <Table
                      size="small"
                      sx={{
                        borderCollapse: 'collapse',
                        '& .MuiTableCell-root': {
                          borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
                        },
                        '& .MuiTableRow-root:last-of-type .MuiTableCell-root': {
                          borderBottom: 'none',
                        },
                      }}
                    >
                      <TableHead
                        sx={{
                          '& .MuiTableRow-root': {
                            boxShadow: `inset 0 -1px 0 ${alpha(theme.palette.text.primary, 0.12)}`,
                          },
                          '& .MuiTableCell-root': {
                            color: 'text.secondary',
                            fontWeight: 700,
                            borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
                            backgroundColor: alpha(theme.palette.text.primary, 0.05),
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            fontSize: '0.8rem',
                          },
                          '& .MuiTableCell-root:first-of-type': {
                            borderTopLeftRadius: 0,
                          },
                          '& .MuiTableCell-root:last-of-type': {
                            borderTopRightRadius: 0,
                          },
                        }}
                      >
                        <TableRow>
                          <TableCell>Medication</TableCell>
                          <TableCell>Dosage & Frequency</TableCell>
                          <TableCell>Prescriber</TableCell>
                          <TableCell>Start Date</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Refills</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {medicationTableRows.map((med) => (
                          <TableRow
                            key={med.name}
                            sx={{
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.text.primary, 0.03),
                              },
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {med.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {med.subtitle}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {med.dosage}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{med.prescriber}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{formatLongDate(med.startDate)}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={med.status}
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  backgroundColor:
                                    med.status === 'Active'
                                      ? alpha(theme.palette.success.main, 0.12)
                                      : alpha(theme.palette.text.primary, 0.08),
                                  color:
                                    med.status === 'Active'
                                      ? theme.palette.success.main
                                      : theme.palette.text.secondary,
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {med.refills}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No medications listed for this patient yet.
                  </Typography>
                )}
                </TabPanel>

                <TabPanel value={activeTab} tab="labs">
                <Stack direction="row" spacing={1} alignItems="center" sx={tabHeaderSx}>
                  <ScienceIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Lab Results
                  </Typography>
                </Stack>
                <Stack spacing={2}>
                  {labResults.map((category) => (
                    <Box
                      key={category.category}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: lightBorder,
                        backgroundColor: alpha(theme.palette.text.primary, 0.02),
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <ScienceIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {category.category}
                        </Typography>
                      </Stack>
                      <Stack spacing={1.5}>
                        {category.results.map((result) => (
                          <Box
                            key={result.test}
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr auto' },
                              gap: 1,
                              alignItems: 'center',
                              p: 1.2,
                              borderRadius: 1.5,
                              border: lightBorder,
                              backgroundColor: 'background.paper',
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {result.test}
                            </Typography>
                            <Typography variant="body2">{result.value}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Range {result.range}
                            </Typography>
                            <Chip
                              label={result.status}
                              size="small"
                              color={result.status === 'Normal' ? 'success' : 'warning'}
                              variant="outlined"
                            />
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
                </TabPanel>

                <TabPanel value={activeTab} tab="imaging">
                <Stack direction="row" spacing={1} alignItems="center" sx={tabHeaderSx}>
                  <ImageOutlinedIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Imaging Studies
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  No imaging studies available.
                </Typography>
                </TabPanel>

                <TabPanel value={activeTab} tab="documents">
                <Stack direction="row" spacing={1} alignItems="center" sx={tabHeaderSx}>
                  <DescriptionIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Documents
                  </Typography>
                </Stack>
                <Grid container spacing={2}>
                  {documents.map((doc) => (
                    <Grid item xs={12} sm={6} md={4} key={doc.name}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: lightBorder,
                          backgroundColor: alpha(theme.palette.text.primary, 0.02),
                          height: '100%',
                        }}
                      >
                        <Stack spacing={1}>
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: 1.5,
                              display: 'grid',
                              placeItems: 'center',
                              backgroundColor: alpha(theme.palette.primary.main, 0.12),
                              color: theme.palette.primary.main,
                            }}
                          >
                            <DescriptionIcon fontSize="small" />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {doc.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {doc.type} · {formatDate(doc.date)}
                          </Typography>
                        </Stack>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                </TabPanel>

                <TabPanel value={activeTab} tab="appointments">
                <Stack direction="row" spacing={1} alignItems="center" sx={tabHeaderSx}>
                  <EventNoteIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Appointments
                  </Typography>
                </Stack>
                <Stack spacing={1.5}>
                  {timelineAppointments.length ? (
                    timelineAppointments.map((appointment) => (
                      <Box
                        key={appointment.id}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: '96px 1fr' },
                          gap: 2,
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.text.primary, 0.02),
                          border: lightBorder,
                        }}
                      >
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 2,
                            backgroundColor: alpha(theme.palette.primary.main, 0.12),
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {new Date(appointment.date).getDate()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(appointment.date).toLocaleDateString('en-US', { month: 'short' })}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {appointment.department}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {appointment.time} · {appointment.provider}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {appointment.chiefComplaint}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Chip label={appointment.status} size="small" variant="outlined" />
                            <Chip label={appointment.visitType} size="small" variant="outlined" />
                          </Stack>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No appointments scheduled yet.
                    </Typography>
                  )}
                </Stack>
                </TabPanel>

                <TabPanel value={activeTab} tab="immunizations">
                <Stack direction="row" spacing={1} alignItems="center" sx={tabHeaderSx}>
                  <VaccinesIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Immunizations
                  </Typography>
                </Stack>
                <Stack spacing={1.5}>
                  {immunizations.map((shot) => (
                    <Box
                      key={shot.name}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr auto' },
                        gap: 1,
                        alignItems: 'center',
                        p: 1.5,
                        borderRadius: 2,
                        border: lightBorder,
                        backgroundColor: alpha(theme.palette.text.primary, 0.02),
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {shot.name}
                      </Typography>
                      <Typography variant="body2">{formatDate(shot.date)}</Typography>
                      <Chip
                        label={shot.status}
                        size="small"
                        color={shot.status === 'Completed' ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    </Box>
                  ))}
                </Stack>
                </TabPanel>

                <TabPanel value={activeTab} tab="problems">
                <Stack direction="row" spacing={1} alignItems="center" sx={tabHeaderSx}>
                  <ReportProblemIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Problem List
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {problems.length ? (
                    problems.map((problem) => (
                      <Chip key={problem} label={problem} variant="outlined" />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No problems recorded for this patient.
                    </Typography>
                  )}
                </Stack>
                </TabPanel>
              </Box>
            </Card>
          </Stack>
        </Box>
      </Stack>
    </PageTemplate>
  );
}
