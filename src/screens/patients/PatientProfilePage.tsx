'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import { Avatar, Box, Button, Chip, Divider, Stack, Typography } from '@/src/ui/components/atoms';
import { Card, StatTile } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { useTheme, alpha } from '@mui/material';
import {
  AssignmentInd as AssignmentIndIcon,
  CalendarMonth as CalendarMonthIcon,
  LocalHospital as LocalHospitalIcon,
  MedicalServices as MedicalServicesIcon,
  MonitorHeart as MonitorHeartIcon,
  NoteAlt as NoteAltIcon,
  LocalPharmacy as LocalPharmacyIcon,
} from '@mui/icons-material';
import GlobalPatientSearch from '@/src/ui/components/molecules/GlobalPatientSearch';
import { GLOBAL_PATIENTS, getPatientByMrn } from '@/src/mocks/global-patients';
import { useOpdData } from '@/src/store/opdHooks';
import { ADMISSION_LEADS, INPATIENT_STAYS, INITIAL_BED_BOARD } from '@/src/screens/ipd/ipd-mock-data';

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : '—');

const buildDateTime = (date: string, time: string) => new Date(`${date}T${time}:00`);

export default function PatientProfilePage() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mrn = searchParams.get('mrn')?.toUpperCase() ?? '';
  const { appointments, encounters, vitalTrends, notes } = useOpdData();
  const patient = getPatientByMrn(mrn);

  const opdAppointments = React.useMemo(
    () => appointments.filter((appointment) => appointment.mrn === patient?.mrn),
    [appointments, patient?.mrn]
  );
  const opdEncounter = React.useMemo(
    () => encounters.find((encounter) => encounter.mrn === patient?.mrn),
    [encounters, patient?.mrn]
  );
  const vitalsCount = React.useMemo(
    () =>
      opdEncounter
        ? vitalTrends.filter((record) => record.patientId === opdEncounter.id).length
        : 0,
    [opdEncounter, vitalTrends]
  );
  const notesCount = React.useMemo(
    () =>
      opdEncounter ? notes.filter((note) => note.patientId === opdEncounter.id).length : 0,
    [notes, opdEncounter]
  );
  const upcomingOpd = React.useMemo(() => {
    const upcoming = opdAppointments
      .filter((appointment) => appointment.status === 'Scheduled')
      .sort((a, b) => buildDateTime(a.date, a.time).getTime() - buildDateTime(b.date, b.time).getTime());
    return upcoming[0];
  }, [opdAppointments]);

  const lastOpd = React.useMemo(() => {
    const sorted = [...opdAppointments].sort(
      (a, b) => buildDateTime(b.date, b.time).getTime() - buildDateTime(a.date, a.time).getTime()
    );
    return sorted[0];
  }, [opdAppointments]);

  const ipdStay = React.useMemo(
    () => INPATIENT_STAYS.find((stay) => stay.mrn === patient?.mrn),
    [patient?.mrn]
  );
  const ipdLead = React.useMemo(
    () => ADMISSION_LEADS.find((lead) => lead.mrn === patient?.mrn),
    [patient?.mrn]
  );
  const ipdBed = React.useMemo(
    () => INITIAL_BED_BOARD.find((bed) => bed.mrn === patient?.mrn),
    [patient?.mrn]
  );

  const opdFlowSteps = [
    {
      title: 'Calendar',
      description: 'Manage bookings and arrival slots.',
      icon: <CalendarMonthIcon fontSize="small" />,
      route: '/appointments/calendar',
    },
    {
      title: 'Queue',
      description: 'Track triage and consultation flow.',
      icon: <MonitorHeartIcon fontSize="small" />,
      route: '/appointments/queue',
    },
    {
      title: 'Visit',
      description: 'Capture SOAP notes and plan.',
      icon: <MedicalServicesIcon fontSize="small" />,
      route: '/appointments/visit',
    },
    {
      title: 'Vitals',
      description: 'Record nursing observations.',
      icon: <MonitorHeartIcon fontSize="small" />,
      route: '/clinical/vitals',
    },
    {
      title: 'Orders',
      description: 'Place lab and imaging orders.',
      icon: <AssignmentIndIcon fontSize="small" />,
      route: '/clinical/orders',
    },
    {
      title: 'Notes',
      description: 'Document assessment and notes.',
      icon: <NoteAltIcon fontSize="small" />,
      route: '/clinical/notes',
    },
    {
      title: 'Prescriptions',
      description: 'Finalize medications.',
      icon: <LocalPharmacyIcon fontSize="small" />,
      route: '/clinical/prescriptions',
    },
  ];

  const ipdFlowSteps = [
    {
      title: 'Admissions',
      description: 'Capture admission and consent.',
      icon: <AssignmentIndIcon fontSize="small" />,
      route: '/ipd/admissions',
    },
    {
      title: 'Bed Board',
      description: 'Assign ward and bed.',
      icon: <LocalHospitalIcon fontSize="small" />,
      route: '/ipd/beds',
    },
    {
      title: 'Rounds',
      description: 'Daily review and orders.',
      icon: <MedicalServicesIcon fontSize="small" />,
      route: '/ipd/rounds',
    },
    {
      title: 'Discharge',
      description: 'Finalize billing and discharge.',
      icon: <LocalHospitalIcon fontSize="small" />,
      route: '/ipd/discharge',
    },
  ];

  if (!patient) {
    return (
      <PageTemplate title="Patient Profile" currentPageTitle="Profile">
        <Card elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
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
      <Stack spacing={2}>
        <Card
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(
              theme.palette.primary.main,
              0.04
            )} 100%)`,
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 56, height: 56, bgcolor: theme.palette.primary.main, fontSize: 18 }}>
                {getInitials(patient.name)}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {patient.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {patient.mrn} · {patient.ageGender} · {patient.department}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                  <Chip label={patient.status} color="primary" variant="outlined" size="small" />
                  {patient.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Box>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                variant="contained"
                onClick={() => router.push(`/appointments/visit?mrn=${patient.mrn}`)}
              >
                Open OPD Visit
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push(`/ipd/admissions?mrn=${patient.mrn}`)}
              >
                Open IPD Admission
              </Button>
            </Stack>
          </Stack>
        </Card>

        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <StatTile
              label="Last Visit"
              value={formatDate(lastOpd?.date ?? patient.lastVisit)}
              subtitle={lastOpd ? `${lastOpd.department} · ${lastOpd.provider}` : patient.primaryDoctor}
              icon={<CalendarMonthIcon fontSize="small" />}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatTile
              label="Next Appointment"
              value={formatDate(upcomingOpd?.date ?? patient.nextAppointment)}
              subtitle={upcomingOpd ? `${upcomingOpd.time} · ${upcomingOpd.provider}` : 'No upcoming visit'}
              icon={<AssignmentIndIcon fontSize="small" />}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatTile
              label="OPD Status"
              value={opdEncounter?.status ?? 'Not in queue'}
              subtitle={opdEncounter?.chiefComplaint ?? 'No active encounter'}
              icon={<MedicalServicesIcon fontSize="small" />}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatTile
              label="IPD Status"
              value={ipdStay ? 'Admitted' : ipdLead ? 'Pending Admission' : 'Not Admitted'}
              subtitle={ipdStay ? `${ipdStay.ward} · ${ipdStay.bed}` : ipdLead?.preferredWard ?? '—'}
              icon={<LocalHospitalIcon fontSize="small" />}
            />
          </Grid>
        </Grid>

        <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            OPD Journey
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Snapshot of this patient across the outpatient flow.
          </Typography>
          <Divider sx={{ my: 1.5 }} />
          <Stack spacing={1}>
            {[
              {
                step: 'Calendar',
                status: lastOpd
                  ? `${lastOpd.status} · ${lastOpd.date} ${lastOpd.time} · ${lastOpd.provider}`
                  : 'No appointment on record',
                route: '/appointments/calendar',
              },
              {
                step: 'Queue',
                status: opdEncounter
                  ? `${opdEncounter.status} · ${opdEncounter.doctor}`
                  : 'Not in queue',
                route: '/appointments/queue',
              },
              {
                step: 'Visit',
                status: opdEncounter
                  ? opdEncounter.status === 'Completed'
                    ? 'Visit completed'
                    : 'Visit in progress'
                  : 'Visit not started',
                route: '/appointments/visit',
              },
              {
                step: 'Vitals',
                status: vitalsCount > 0 ? `${vitalsCount} capture(s)` : 'No vitals recorded',
                route: '/clinical/vitals',
              },
              {
                step: 'Notes',
                status: notesCount > 0 ? `${notesCount} note(s)` : 'No notes recorded',
                route: '/clinical/notes',
              },
              {
                step: 'Orders',
                status: 'Orders not tracked in demo store',
                route: '/clinical/orders',
              },
              {
                step: 'Prescriptions',
                status: 'Prescriptions not tracked in demo store',
                route: '/clinical/prescriptions',
              },
            ].map((row) => (
              <Box
                key={row.step}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1.5fr 2fr auto' },
                  gap: 1,
                  alignItems: 'center',
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  p: 1.2,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {row.step}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {row.status}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => router.push(`${row.route}?mrn=${patient.mrn}`)}
                >
                  Open
                </Button>
              </Box>
            ))}
          </Stack>
        </Card>

        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Demographics & Contact
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Phone</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{patient.phone}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">City</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{patient.city}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Primary Doctor</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{patient.primaryDoctor}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Department</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{patient.department}</Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={12} md={7}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Current Location Snapshot
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">OPD Queue</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {opdEncounter ? `${opdEncounter.status} · ${opdEncounter.doctor}` : 'No active queue'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">IPD Ward</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {ipdStay?.ward ?? ipdLead?.preferredWard ?? '—'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Bed</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {ipdStay?.bed ?? ipdBed?.bedNumber ?? '—'}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            OPD Flow
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use the buttons below to walk through the OPD workflow with this patient pre-selected.
          </Typography>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {opdFlowSteps.map((step) => (
              <Grid item xs={12} sm={6} md={4} key={step.title}>
                <Card
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.5,
                        display: 'grid',
                        placeItems: 'center',
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                        color: theme.palette.primary.main,
                      }}
                    >
                      {step.icon}
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {step.title}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {step.description}
                  </Typography>
                  <Box sx={{ mt: 'auto' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => router.push(`${step.route}?mrn=${patient.mrn}`)}
                    >
                      Open
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Card>

        <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            IPD Flow
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Walk through inpatient admissions, bed board, rounds, and discharge.
          </Typography>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {ipdFlowSteps.map((step) => (
              <Grid item xs={12} sm={6} md={3} key={step.title}>
                <Card
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.5,
                        display: 'grid',
                        placeItems: 'center',
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                        color: theme.palette.primary.main,
                      }}
                    >
                      {step.icon}
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {step.title}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {step.description}
                  </Typography>
                  <Box sx={{ mt: 'auto' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => router.push(`${step.route}?mrn=${patient.mrn}`)}
                    >
                      Open
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Card>
      </Stack>
    </PageTemplate>
  );
}
