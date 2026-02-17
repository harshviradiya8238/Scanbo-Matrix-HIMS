'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import { Card, StatTile } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { alpha, useTheme } from '@/src/ui/theme';
import { getSoftSurface, getSubtleSurface } from '@/src/core/theme/surfaces';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { GLOBAL_PATIENTS, GlobalPatient, getPatientByMrn, searchPatients } from '@/src/mocks/global-patients';
import {
  AssignmentInd as AssignmentIndIcon,
  BugReport as BugReportIcon,
  CalendarMonth as CalendarMonthIcon,
  CheckCircle as CheckCircleIcon,
  ExitToApp as ExitToAppIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Hotel as HotelIcon,
  HowToReg as HowToRegIcon,
  LocalHospital as LocalHospitalIcon,
  MedicalServices as MedicalServicesIcon,
  PersonAdd as PersonAddIcon,
  Queue as QueueIcon,
  Science as ScienceIcon,
  Search as SearchIcon,
  TouchApp as TouchAppIcon,
} from '@mui/icons-material';

interface FlowStep {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: React.ReactNode;
}

const INTAKE_STEPS: FlowStep[] = [
  {
    id: 'registration',
    title: 'Registration',
    description: 'Create patient profile and demographics.',
    route: '/patients/registration',
    icon: <PersonAddIcon fontSize="small" />,
  },
  {
    id: 'kiosk',
    title: 'Welcome Kiosk',
    description: 'Self check-in, consent, and ID capture.',
    route: '/clinical/modules/welcome-kiosk',
    icon: <TouchAppIcon fontSize="small" />,
  },
  {
    id: 'calendar',
    title: 'OPD Calendar',
    description: 'Schedule, confirm, and assign slots.',
    route: '/appointments/calendar',
    icon: <CalendarMonthIcon fontSize="small" />,
  },
  {
    id: 'queue',
    title: 'OPD Queue',
    description: 'Triage and move into consultation.',
    route: '/appointments/queue',
    icon: <QueueIcon fontSize="small" />,
  },
];

const OPD_STEPS: FlowStep[] = [
  {
    id: 'visit',
    title: 'Visit Workspace',
    description: 'Consultation and encounter documentation.',
    route: '/appointments/visit',
    icon: <MedicalServicesIcon fontSize="small" />,
  },
  {
    id: 'orders',
    title: 'Orders',
    description: 'Labs, imaging, and procedures.',
    route: '/clinical/orders',
    icon: <ScienceIcon fontSize="small" />,
  },
  {
    id: 'prescriptions',
    title: 'Prescriptions',
    description: 'Finalize medications and counseling.',
    route: '/clinical/prescriptions',
    icon: <MedicalServicesIcon fontSize="small" />,
  },
];

const IPD_STEPS: FlowStep[] = [
  {
    id: 'admissions',
    title: 'Admissions',
    description: 'Capture admission and consent.',
    route: '/ipd/admissions',
    icon: <AssignmentIndIcon fontSize="small" />,
  },
  {
    id: 'beds',
    title: 'Bed Board',
    description: 'Assign ward/bed and track occupancy.',
    route: '/ipd/beds',
    icon: <HotelIcon fontSize="small" />,
  },
  {
    id: 'rounds',
    title: 'ClinDoc Rounds',
    description: 'Daily progress notes and care plan.',
    route: '/ipd/rounds',
    icon: <LocalHospitalIcon fontSize="small" />,
  },
  {
    id: 'discharge',
    title: 'Discharge',
    description: 'Finalize discharge and instructions.',
    route: '/ipd/discharge',
    icon: <ExitToAppIcon fontSize="small" />,
  },
];

const POST_CARE_STEPS: FlowStep[] = [
  {
    id: 'care-companion',
    title: 'Care Companion',
    description: 'Follow-ups, reminders, and engagement.',
    route: '/clinical/modules/care-companion',
    icon: <FavoriteBorderIcon fontSize="small" />,
  },
  {
    id: 'infection-control',
    title: 'Infection Control',
    description: 'Cases, isolation, audits, and safety.',
    route: '/clinical/modules/bugsy-infection-control',
    icon: <BugReportIcon fontSize="small" />,
  },
];

function FlowStepCard({
  step,
  index,
  accent,
  onOpen,
}: {
  step: FlowStep;
  index: number;
  accent: string;
  onOpen: () => void;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        borderColor: alpha(accent, 0.35),
        backgroundColor: alpha(accent, 0.04),
        height: '100%',
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: alpha(accent, 0.18),
              color: accent,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {step.icon}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {index + 1}. {step.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {step.description}
            </Typography>
          </Box>
        </Stack>
        <Button size="small" variant="outlined" onClick={onOpen}>
          Open
        </Button>
      </Stack>
    </Card>
  );
}

export default function FlowOverviewPage() {
  const router = useRouter();
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const subtleSurface = getSubtleSurface(theme);
  const mrnParam = useMrnParam();
  const [searchInput, setSearchInput] = React.useState('');

  const selectedPatient = React.useMemo(
    () => (mrnParam ? getPatientByMrn(mrnParam) : undefined),
    [mrnParam]
  );

  const pageSubtitle = mrnParam ? formatPatientLabel(selectedPatient?.name, mrnParam) : undefined;
  const withMrn = React.useCallback(
    (route: string) => (mrnParam ? `${route}?mrn=${mrnParam}` : route),
    [mrnParam]
  );

  const searchOptions = React.useMemo(() => {
    if (searchInput.trim().length < 2) return [];
    return searchPatients(searchInput, 6);
  }, [searchInput]);

  const handleSelectPatient = (patient: GlobalPatient | null) => {
    if (!patient) return;
    router.push(`/clinical/flow-overview?mrn=${patient.mrn}`);
    setSearchInput('');
  };

  const handleClearPatient = () => {
    router.push('/clinical/flow-overview');
  };

  return (
    <PageTemplate title="Clinical Flow Overview" subtitle={pageSubtitle} currentPageTitle="Flow Overview">
      <Stack spacing={2}>
        <Card
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: softSurface,
          }}
        >
          <Stack spacing={1.25}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip size="small" color="primary" label="End-to-End Flow" />
              <Chip size="small" variant="outlined" label="OPD + IPD + Post-care" />
              {mrnParam ? (
                <Chip size="small" variant="outlined" color="info" label={`MRN ${mrnParam}`} />
              ) : null}
            </Stack>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
            >
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Patient Journey Map
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Follow one patient from registration and kiosk check-in through OPD or IPD care,
                  discharge, and follow-up programs.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button
                  variant="outlined"
                  startIcon={<HowToRegIcon />}
                  onClick={() => router.push('/patients/registration')}
                >
                  Register Patient
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<TouchAppIcon />}
                  onClick={() => router.push(withMrn('/clinical/modules/welcome-kiosk'))}
                >
                  Welcome Kiosk
                </Button>
                <Button
                  variant="contained"
                  startIcon={<MedicalServicesIcon />}
                  onClick={() => router.push(withMrn('/clinical/modules/ambulatory-care-opd'))}
                >
                  OPD Encounter
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Card>

        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
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
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Patient Context
                </Typography>
                <Autocomplete
                  options={searchOptions}
                  value={null}
                  inputValue={searchInput}
                  onInputChange={(_, value) => setSearchInput(value)}
                  onChange={(_, value) => handleSelectPatient(value)}
                  filterOptions={(options) => options}
                  noOptionsText={searchInput.trim().length < 2 ? 'Type at least 2 characters' : 'No matches found'}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search patient by MRN, name, phone..."
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} key={option.mrn} sx={{ display: 'flex', gap: 1.5, py: 1 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 34, height: 34, fontSize: 12 }}>
                        {option.name
                          .split(' ')
                          .map((part) => part.charAt(0).toUpperCase())
                          .slice(0, 2)
                          .join('')}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {option.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.mrn} · {option.department}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {GLOBAL_PATIENTS.slice(0, 5).map((patient) => (
                    <Chip
                      key={patient.mrn}
                      label={`${patient.name} · ${patient.mrn}`}
                      variant={patient.mrn === mrnParam ? 'filled' : 'outlined'}
                      color={patient.mrn === mrnParam ? 'primary' : 'default'}
                      onClick={() => router.push(`/clinical/flow-overview?mrn=${patient.mrn}`)}
                    />
                  ))}
                </Stack>

                <Divider />

                {mrnParam && selectedPatient ? (
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        {selectedPatient?.name
                          .split(' ')
                          .map((part) => part.charAt(0).toUpperCase())
                          .slice(0, 2)
                          .join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {selectedPatient?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedPatient?.ageGender} · {selectedPatient?.department}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip size="small" label={selectedPatient?.status} color="primary" variant="outlined" />
                      <Chip size="small" label={`Doctor: ${selectedPatient?.primaryDoctor}`} variant="outlined" />
                      <Chip size="small" label={`Last Visit: ${selectedPatient?.lastVisit}`} variant="outlined" />
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined" onClick={() => router.push(withMrn('/patients/profile'))}>
                        Open Profile
                      </Button>
                      <Button size="small" variant="text" onClick={handleClearPatient}>
                        Clear MRN
                      </Button>
                    </Stack>
                  </Stack>
                ) : mrnParam ? (
                  <Alert severity="warning">MRN not found. Please select a valid patient.</Alert>
                ) : (
                  <Alert severity="info">Select a patient to keep MRN context across the flow.</Alert>
                )}
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Stack spacing={2}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: subtleSurface,
                }}
              >
                <Stack spacing={1.5}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Module Jump Points
                  </Typography>
                  <Stack spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<CalendarMonthIcon />}
                      onClick={() => router.push(withMrn('/appointments/calendar'))}
                    >
                      Calendar Scheduling
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ScienceIcon />}
                      onClick={() => router.push(withMrn('/clinical/modules/radiant'))}
                    >
                      Radiology (Radiant)
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<MedicalServicesIcon />}
                      onClick={() => router.push(withMrn('/clinical/modules/ambulatory-care-opd'))}
                    >
                      EpicCare Ambulatory (OPD)
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<LocalHospitalIcon />}
                      onClick={() => router.push(withMrn('/clinical/modules/inpatient-documentation-clindoc'))}
                    >
                      Inpatient ClinDoc
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<TouchAppIcon />}
                      onClick={() => router.push(withMrn('/clinical/modules/welcome-kiosk'))}
                    >
                      Welcome Kiosk
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<FavoriteBorderIcon />}
                      onClick={() => router.push(withMrn('/clinical/modules/care-companion'))}
                    >
                      Care Companion
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<BugReportIcon />}
                      onClick={() => router.push(withMrn('/clinical/modules/bugsy-infection-control'))}
                    >
                      Infection Control
                    </Button>
                  </Stack>
                </Stack>
              </Card>

              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <StatTile
                    label="OPD Steps"
                    value={OPD_STEPS.length}
                    subtitle="Encounter → Orders"
                    tone="info"
                    icon={<MedicalServicesIcon />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StatTile
                    label="IPD Steps"
                    value={IPD_STEPS.length}
                    subtitle="Admission → Discharge"
                    tone="warning"
                    icon={<LocalHospitalIcon />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StatTile
                    label="Post-care"
                    value={POST_CARE_STEPS.length}
                    subtitle="Engagement + Safety"
                    tone="success"
                    icon={<CheckCircleIcon />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StatTile
                    label="Intake Steps"
                    value={INTAKE_STEPS.length}
                    subtitle="Registration → Queue"
                    tone="primary"
                    icon={<HowToRegIcon />}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Grid>
        </Grid>

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
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Patient Access & Intake
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: {
                  xs: '1fr',
                  md: `repeat(${INTAKE_STEPS.length}, minmax(0, 1fr))`,
                },
              }}
            >
              {INTAKE_STEPS.map((step, index) => (
                <FlowStepCard
                  key={step.id}
                  step={step}
                  index={index}
                  accent={theme.palette.primary.main}
                  onOpen={() => router.push(withMrn(step.route))}
                />
              ))}
            </Box>
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
          <Stack spacing={1.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Outpatient Journey (OPD)
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: {
                  xs: '1fr',
                  md: `repeat(${OPD_STEPS.length}, minmax(0, 1fr))`,
                },
              }}
            >
              {OPD_STEPS.map((step, index) => (
                <FlowStepCard
                  key={step.id}
                  step={step}
                  index={index}
                  accent={theme.palette.info.main}
                  onOpen={() => router.push(withMrn(step.route))}
                />
              ))}
            </Box>
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
          <Stack spacing={1.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Inpatient Journey (IPD)
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: {
                  xs: '1fr',
                  md: `repeat(${IPD_STEPS.length}, minmax(0, 1fr))`,
                },
              }}
            >
              {IPD_STEPS.map((step, index) => (
                <FlowStepCard
                  key={step.id}
                  step={step}
                  index={index}
                  accent={theme.palette.warning.main}
                  onOpen={() => router.push(withMrn(step.route))}
                />
              ))}
            </Box>
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
          <Stack spacing={1.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Post-care & Safety
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: {
                  xs: '1fr',
                  md: `repeat(${POST_CARE_STEPS.length}, minmax(0, 1fr))`,
                },
              }}
            >
              {POST_CARE_STEPS.map((step, index) => (
                <FlowStepCard
                  key={step.id}
                  step={step}
                  index={index}
                  accent={theme.palette.success.main}
                  onOpen={() => router.push(withMrn(step.route))}
                />
              ))}
            </Box>
          </Stack>
        </Card>
      </Stack>
    </PageTemplate>
  );
}
