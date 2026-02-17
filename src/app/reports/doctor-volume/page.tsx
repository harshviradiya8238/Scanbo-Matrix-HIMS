'use client';

import * as React from 'react';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Box,
  Card,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from '@/src/ui/components/atoms';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { useOpdData } from '@/src/store/opdHooks';
import { ADMISSION_LEADS, INPATIENT_STAYS } from '@/src/screens/ipd/ipd-mock-data';
import {
  Visibility as VisibilityIcon,
  Launch as LaunchIcon,
  LocalHospital as LocalHospitalIcon,
  EventAvailable as EventAvailableIcon,
  People as PeopleIcon,
  MonitorHeart as MonitorHeartIcon,
  CalendarMonth as CalendarMonthIcon,
  Queue as QueueIcon,
  MedicalServices as MedicalServicesIcon,
  Science as ScienceIcon,
  LocalPharmacy as LocalPharmacyIcon,
} from '@mui/icons-material';
import { useTheme } from '@/src/ui/theme';
import { getSoftSurface } from '@/src/core/theme/surfaces';
import { DISCHARGE_CANDIDATES } from '@/src/screens/ipd/ipd-mock-data';

const uniqueDates = (values: string[]) => Array.from(new Set(values)).sort();

export default function DoctorVolumeReportPage() {
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const { appointments, encounters, status: opdStatus, error: opdError } = useOpdData();

  const dates = uniqueDates(appointments.map((a) => a.date));
  const [selectedDate, setSelectedDate] = React.useState(() => dates[0] ?? '');
  const [selectedDoctor, setSelectedDoctor] = React.useState<string>('');
  const [statusFilter, setStatusFilter] = React.useState<string>('All');
  const [mode, setMode] = React.useState<'opd' | 'ipd'>('opd');

  const dailyAppointments = React.useMemo(
    () =>
      appointments.filter((appt) => {
        const matchDate = selectedDate ? appt.date === selectedDate : true;
        const matchStatus = statusFilter === 'All' ? true : appt.status === statusFilter;
        return matchDate && matchStatus;
      }),
    [appointments, selectedDate, statusFilter]
  );

  const doctorSummary = React.useMemo(() => {
    const map = new Map<string, { department: string; total: number; status: Record<string, number> }>();
    dailyAppointments.forEach((appt) => {
      const entry = map.get(appt.provider) ?? {
        department: appt.department,
        total: 0,
        status: {
          Scheduled: 0,
          'Checked-In': 0,
          'In Triage': 0,
          'In Consultation': 0,
          Completed: 0,
          'No Show': 0,
        },
      };
      entry.total += 1;
      entry.status[appt.status] = (entry.status[appt.status] ?? 0) + 1;
      map.set(appt.provider, entry);
    });
    return Array.from(map.entries()).map(([provider, data]) => ({ provider, ...data }));
  }, [dailyAppointments]);

  React.useEffect(() => {
    if (!selectedDoctor && doctorSummary.length > 0) {
      setSelectedDoctor(doctorSummary[0].provider);
    }
  }, [doctorSummary, selectedDoctor]);

  const doctorAppointments = React.useMemo(
    () =>
      dailyAppointments
        .filter((appt) => (selectedDoctor ? appt.provider === selectedDoctor : true))
        .sort((a, b) => a.time.localeCompare(b.time)),
    [dailyAppointments, selectedDoctor]
  );

  const activeEncounters = React.useMemo(
    () => encounters.filter((enc) => enc.status !== 'COMPLETED'),
    [encounters]
  );

  const ipdSummary = React.useMemo(() => {
    const map = new Map<string, { admitted: number; leads: number }>();
    INPATIENT_STAYS.forEach((stay) => {
      const entry = map.get(stay.consultant) ?? { admitted: 0, leads: 0 };
      entry.admitted += 1;
      map.set(stay.consultant, entry);
    });
    ADMISSION_LEADS.forEach((lead) => {
      const entry = map.get(lead.consultant) ?? { admitted: 0, leads: 0 };
      entry.leads += 1;
      map.set(lead.consultant, entry);
    });
    return Array.from(map.entries()).map(([consultant, data]) => ({ consultant, ...data }));
  }, []);

  const dischargeRows = React.useMemo(() => {
    return DISCHARGE_CANDIDATES.map((candidate) => {
      const stay = INPATIENT_STAYS.find((item) => item.id === candidate.patientId);
      const completed =
        candidate.billingStatus === 'Cleared' &&
        candidate.pharmacyStatus === 'Ready' &&
        candidate.transportStatus === 'Arranged';
      return {
        patientId: candidate.patientId,
        patientName: stay?.patientName ?? 'Unknown',
        mrn: stay?.mrn ?? '—',
        consultant: stay?.consultant ?? '—',
        wardBed: stay ? `${stay.ward} · ${stay.bed}` : '—',
        estimatedDischargeDate: candidate.estimatedDischargeDate,
        losDays: candidate.losDays,
        billingStatus: candidate.billingStatus,
        pharmacyStatus: candidate.pharmacyStatus,
        transportStatus: candidate.transportStatus,
        overallStatus: completed ? 'Completed' : 'In Progress',
      };
    }).sort((a, b) => a.estimatedDischargeDate.localeCompare(b.estimatedDischargeDate));
  }, []);

  const completedDischarges = React.useMemo(
    () => dischargeRows.filter((row) => row.overallStatus === 'Completed'),
    [dischargeRows]
  );

  return (
    <PageTemplate title="OPD Command Center" currentPageTitle="Reports">
      <Stack spacing={2}>
        {opdStatus === 'loading' ? <Alert severity="info">Loading OPD data…</Alert> : null}
        {opdStatus === 'error' ? (
          <Alert severity="warning">OPD JSON server unreachable. Showing fallback data. {opdError ?? ''}</Alert>
        ) : null}

        <Card
          elevation={0}
          sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', backgroundColor: softSurface }}
        >
          <Stack spacing={1.2}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  OPD Command Center
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Manage OPD flow end-to-end and jump into any step.
                </Typography>
              </Box>
              <Button variant="contained" size="small" onClick={() => window.open('/appointments/queue', '_self')}>
                Open Queue
              </Button>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              {[
                { label: 'Calendar', icon: <CalendarMonthIcon fontSize="small" />, route: '/appointments/calendar' },
                { label: 'Queue', icon: <QueueIcon fontSize="small" />, route: '/appointments/queue' },
                { label: 'Visit', icon: <MedicalServicesIcon fontSize="small" />, route: '/appointments/visit' },
                { label: 'Orders', icon: <ScienceIcon fontSize="small" />, route: '/clinical/orders' },
                { label: 'Prescriptions', icon: <LocalPharmacyIcon fontSize="small" />, route: '/clinical/prescriptions' },
              ].map((item) => (
                <Button
                  key={item.label}
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={item.icon}
                  onClick={() => window.open(item.route, '_self')}
                  sx={{ borderStyle: 'dashed', textTransform: 'none', fontWeight: 600 }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          </Stack>
        </Card>

        <Grid container spacing={2}>
          {[{
            label: 'Today Appointments',
            value: dailyAppointments.length,
            icon: <EventAvailableIcon fontSize="small" />, color: 'primary'
          },{
            label: 'Active OPD',
            value: activeEncounters.length,
            icon: <MonitorHeartIcon fontSize="small" />, color: 'info'
          },{
            label: 'IPD Admitted',
            value: INPATIENT_STAYS.length,
            icon: <LocalHospitalIcon fontSize="small" />, color: 'success'
          },{
            label: 'IPD Leads',
            value: ADMISSION_LEADS.length,
            icon: <PeopleIcon fontSize="small" />, color: 'secondary'
          }].map((tile) => (
            <Grid key={tile.label} item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ p: 1.6, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary">{tile.label}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>{tile.value}</Typography>
                  </Box>
                    <Chip icon={tile.icon} label={tile.label.split(' ')[0]} color={tile.color as any} variant="outlined" size="small" />
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              select
              fullWidth
              label="Date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              {dates.map((date) => (
                <MenuItem key={date} value={date}>
                  {date}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              select
              fullWidth
              label="Doctor"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {doctorSummary.map((row) => (
                <MenuItem key={row.provider} value={row.provider}>
                  {row.provider}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              select
              fullWidth
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {['All', 'Scheduled', 'Checked-In', 'In Triage', 'In Consultation', 'Completed', 'No Show'].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={12} md={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
              <Chip label={`Active OPD: ${activeEncounters.length}`} color="info" variant="outlined" />
              <Chip label={`IPD Consultants: ${ipdSummary.length}`} color="success" variant="outlined" />
            </Stack>
          </Grid>
        </Grid>

        <ToggleButtonGroup
          exclusive
          value={mode}
          onChange={(_, value) => value && setMode(value)}
          size="small"
          color="primary"
        >
          <ToggleButton value="opd">OPD View</ToggleButton>
          <ToggleButton value="ipd">IPD View</ToggleButton>
        </ToggleButtonGroup>

        {mode === 'opd' && (
          <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              OPD by Doctor (date-specific)
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Dept</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Checked-In</TableCell>
                  <TableCell align="right">In Triage</TableCell>
                  <TableCell align="right">In Consult</TableCell>
                  <TableCell align="right">Completed</TableCell>
                  <TableCell align="right">No Show</TableCell>
                  <TableCell align="center">Open</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {doctorSummary.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <Typography variant="body2" color="text.secondary">
                        No appointments for this filter.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  doctorSummary.map((row) => (
                    <TableRow
                      key={row.provider}
                      hover
                      selected={row.provider === selectedDoctor}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => setSelectedDoctor(row.provider)}
                    >
                      <TableCell>{row.provider}</TableCell>
                      <TableCell>{row.department}</TableCell>
                      <TableCell align="right">{row.total}</TableCell>
                      <TableCell align="right">{row.status['Checked-In']}</TableCell>
                      <TableCell align="right">{row.status['In Triage']}</TableCell>
                      <TableCell align="right">{row.status['In Consultation']}</TableCell>
                      <TableCell align="right">{row.status['Completed']}</TableCell>
                      <TableCell align="right">{row.status['No Show']}</TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<VisibilityIcon fontSize="small" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoctor(row.provider);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        )}

        {mode === 'opd' && (
          <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                OPD Patients for {selectedDoctor || 'All Doctors'} ({selectedDate || 'All Dates'})
              </Typography>
              <Chip label={`${doctorAppointments.length} patient(s)`} size="small" />
            </Stack>
            <Divider sx={{ my: 1 }} />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>MRN</TableCell>
                  <TableCell>Complaint</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {doctorAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography variant="body2" color="text.secondary">
                        No patients match this filter.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  doctorAppointments.map((appt) => (
                    <TableRow
                      key={appt.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => window.open(`/appointments/queue?mrn=${appt.mrn}`, '_self')}
                    >
                      <TableCell>{appt.time}</TableCell>
                      <TableCell>{appt.patientName}</TableCell>
                      <TableCell>{appt.mrn}</TableCell>
                      <TableCell>{appt.chiefComplaint}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          variant="outlined"
                          color={
                            appt.status === 'In Consultation'
                              ? 'warning'
                              : appt.status === 'Checked-In'
                              ? 'info'
                              : appt.status === 'Completed'
                              ? 'success'
                              : appt.status === 'No Show'
                              ? 'error'
                              : 'default'
                          }
                          label={appt.status}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="text"
                          endIcon={<LaunchIcon fontSize="small" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/appointments/queue?mrn=${appt.mrn}`, '_self');
                          }}
                        >
                          Open
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        )}

        {mode === 'ipd' && (
          <Stack spacing={2}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>IPD by Consultant</Typography>
                <Chip label={`${ipdSummary.length} consultant(s)`} size="small" />
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Consultant</TableCell>
                    <TableCell align="right">Admitted</TableCell>
                    <TableCell align="right">Leads / Pending</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ipdSummary.map((row) => (
                    <TableRow key={row.consultant} hover>
                      <TableCell>{row.consultant}</TableCell>
                      <TableCell align="right">{row.admitted}</TableCell>
                      <TableCell align="right">{row.leads}</TableCell>
                      <TableCell align="right">
                        <Button size="small" variant="outlined" onClick={() => window.open('/ipd/admissions', '_self')}>
                          Open IPD
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>IPD Discharge Tracker</Typography>
                <Chip label={`${dischargeRows.length} patient(s)`} size="small" />
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Patient</TableCell>
                    <TableCell>MRN</TableCell>
                    <TableCell>Consultant</TableCell>
                    <TableCell>Ward / Bed</TableCell>
                    <TableCell>EDD</TableCell>
                    <TableCell align="right">LOS</TableCell>
                    <TableCell>Billing</TableCell>
                    <TableCell>Pharmacy</TableCell>
                    <TableCell>Transport</TableCell>
                    <TableCell>Overall</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dischargeRows.map((row) => (
                    <TableRow key={row.patientId} hover>
                      <TableCell>{row.patientName}</TableCell>
                      <TableCell>{row.mrn}</TableCell>
                      <TableCell>{row.consultant}</TableCell>
                      <TableCell>{row.wardBed}</TableCell>
                      <TableCell>{row.estimatedDischargeDate}</TableCell>
                      <TableCell align="right">{row.losDays}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          variant="outlined"
                          color={row.billingStatus === 'Cleared' ? 'success' : 'warning'}
                          label={row.billingStatus}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          variant="outlined"
                          color={row.pharmacyStatus === 'Ready' ? 'success' : 'warning'}
                          label={row.pharmacyStatus}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          variant="outlined"
                          color={row.transportStatus === 'Arranged' ? 'success' : 'warning'}
                          label={row.transportStatus}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={row.overallStatus === 'Completed' ? 'success' : 'info'}
                          label={row.overallStatus}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => window.open(`/ipd/discharge?mrn=${row.mrn}`, '_self')}
                        >
                          Open Discharge
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Completed Discharges</Typography>
                <Chip label={`${completedDischarges.length} completed`} color="success" variant="outlined" size="small" />
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Patient</TableCell>
                    <TableCell>MRN</TableCell>
                    <TableCell>Consultant</TableCell>
                    <TableCell>Discharge Date</TableCell>
                    <TableCell align="right">LOS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {completedDischarges.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography variant="body2" color="text.secondary">
                          No completed discharges available yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    completedDischarges.map((row) => (
                      <TableRow key={`completed-${row.patientId}`} hover>
                        <TableCell>{row.patientName}</TableCell>
                        <TableCell>{row.mrn}</TableCell>
                        <TableCell>{row.consultant}</TableCell>
                        <TableCell>{row.estimatedDischargeDate}</TableCell>
                        <TableCell align="right">{row.losDays}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </Stack>
        )}
      </Stack>
    </PageTemplate>
  );
}
