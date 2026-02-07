'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import { Box, Button, Chip, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import StatTile from '@/src/ui/components/molecules/StatTile';
import { useTheme } from '@mui/material';
import { getSoftSurface, getSubtleSurface } from '@/src/core/theme/surfaces';
import {
  ArrowForward as ArrowForwardIcon,
  AssignmentLate as AssignmentLateIcon,
  CalendarMonth as CalendarMonthIcon,
  CheckCircle as CheckCircleIcon,
  Group as GroupIcon,
  Hotel as HotelIcon,
  LocalHospital as LocalHospitalIcon,
  MonitorHeart as MonitorHeartIcon,
  PersonAdd as PersonAddIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import { patientData, patientMetrics } from '@/src/mocks/patientServer';
import {
  ADMISSION_LEADS,
  DISCHARGE_CANDIDATES,
  INITIAL_BED_BOARD,
} from '@/src/screens/ipd/ipd-mock-data';
import { OPD_APPOINTMENTS, OPD_ENCOUNTERS } from '@/src/screens/opd/opd-mock-data';
import { CLINICAL_MODULES } from '@/src/screens/clinical/module-registry';

interface WardSummary {
  ward: string;
  total: number;
  occupied: number;
  available: number;
  blocked: number;
}

export default function DashboardPage() {
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const subtleSurface = getSubtleSurface(theme);
  const router = useRouter();
  const dashboardDate = '2026-02-04';

  const todaysAppointments = React.useMemo(
    () => OPD_APPOINTMENTS.filter((appointment) => appointment.date === dashboardDate),
    [dashboardDate]
  );

  const liveQueueCount = React.useMemo(
    () =>
      OPD_ENCOUNTERS.filter(
        (encounter) =>
          encounter.status === 'Checked-In' ||
          encounter.status === 'In Triage' ||
          encounter.status === 'In Consultation'
      ).length,
    []
  );

  const occupiedBeds = React.useMemo(
    () => INITIAL_BED_BOARD.filter((bed) => bed.status === 'Occupied').length,
    []
  );
  const availableBeds = React.useMemo(
    () => INITIAL_BED_BOARD.filter((bed) => bed.status === 'Available').length,
    []
  );
  const blockedBeds = React.useMemo(
    () =>
      INITIAL_BED_BOARD.filter((bed) => bed.status === 'Blocked' || bed.status === 'Cleaning')
        .length,
    []
  );
  const bedOccupancy = React.useMemo(() => {
    if (INITIAL_BED_BOARD.length === 0) return 0;
    return Math.round((occupiedBeds / INITIAL_BED_BOARD.length) * 100);
  }, [occupiedBeds]);

  const urgentAdmissions = React.useMemo(
    () => ADMISSION_LEADS.filter((lead) => lead.priority !== 'Routine').length,
    []
  );

  const dischargeReadyCount = React.useMemo(
    () =>
      DISCHARGE_CANDIDATES.filter(
        (candidate) =>
          candidate.billingStatus === 'Cleared' && candidate.pharmacyStatus === 'Ready'
      ).length,
    []
  );

  const wardSummary = React.useMemo<WardSummary[]>(() => {
    const map = new Map<string, WardSummary>();

    INITIAL_BED_BOARD.forEach((bed) => {
      const existing = map.get(bed.ward) || {
        ward: bed.ward,
        total: 0,
        occupied: 0,
        available: 0,
        blocked: 0,
      };

      existing.total += 1;
      if (bed.status === 'Occupied') existing.occupied += 1;
      if (bed.status === 'Available') existing.available += 1;
      if (bed.status === 'Blocked' || bed.status === 'Cleaning') existing.blocked += 1;

      map.set(bed.ward, existing);
    });

    return Array.from(map.values()).sort((a, b) => a.ward.localeCompare(b.ward));
  }, []);

  const departmentLoad = React.useMemo(() => {
    const map = new Map<string, number>();
    patientData.forEach((row) => {
      map.set(row.department, (map.get(row.department) || 0) + 1);
    });

    const sorted = Array.from(map.entries())
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const max = sorted[0]?.count ?? 1;
    return sorted.map((item) => ({ ...item, ratio: Math.round((item.count / max) * 100) }));
  }, []);

  const totalOutstanding = React.useMemo(
    () => patientData.reduce((sum, row) => sum + row.outstandingBalance, 0),
    []
  );

  const billingHoldCount = React.useMemo(
    () => patientData.filter((row) => row.status === 'Billing Hold').length,
    []
  );

  const implementedModules = React.useMemo(
    () => CLINICAL_MODULES.filter((moduleDefinition) => moduleDefinition.status === 'Implemented').length,
    []
  );

  const inProgressModules = React.useMemo(
    () => CLINICAL_MODULES.filter((moduleDefinition) => moduleDefinition.status === 'In Progress').length,
    []
  );

  const plannedModules = React.useMemo(
    () => CLINICAL_MODULES.filter((moduleDefinition) => moduleDefinition.status === 'Planned').length,
    []
  );

  return (
    <PageTemplate title="Dashboard" currentPageTitle="Dashboard">
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
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
          >
            <Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                <Chip size="small" color="primary" label="Command Center" />
                <Chip size="small" color="success" variant="outlined" label="OPD + IPD + Billing" />
                <Chip size="small" variant="outlined" label={`Date ${dashboardDate}`} />
              </Stack>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Hospital Operations Overview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monitor patient flow, bed utilization, appointments, and revenue signals in one dashboard.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                variant="outlined"
                startIcon={<PersonAddIcon />}
                onClick={() => router.push('/patients/registration')}
              >
                Register Patient
              </Button>
              <Button
                variant="outlined"
                startIcon={<CalendarMonthIcon />}
                onClick={() => router.push('/appointments/calendar')}
              >
                OPD Calendar
              </Button>
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={() => router.push('/ipd/admissions')}
              >
                IPD Admissions
              </Button>
            </Stack>
          </Stack>
        </Card>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
            },
          }}
        >
          <Box>
            <StatTile
              label="Live OPD Queue"
              value={liveQueueCount}
              subtitle={`${todaysAppointments.length} appointments today`}
              tone="info"
              icon={<GroupIcon sx={{ fontSize: 30 }} />}
            />
          </Box>
          <Box>
            <StatTile
              label="IPD Occupancy"
              value={`${bedOccupancy}%`}
              subtitle={`${occupiedBeds} occupied / ${INITIAL_BED_BOARD.length} total beds`}
              tone="warning"
              icon={<HotelIcon sx={{ fontSize: 30 }} />}
            />
          </Box>
          <Box>
            <StatTile
              label="Pending Bills"
              value={patientMetrics.pendingBills}
              subtitle={`${billingHoldCount} patients on billing hold`}
              tone="error"
              icon={<AssignmentLateIcon sx={{ fontSize: 30 }} />}
            />
          </Box>
          <Box>
            <StatTile
              label="Today Admissions"
              value={ADMISSION_LEADS.length}
              subtitle={`${urgentAdmissions} urgent/emergency cases`}
              tone="success"
              icon={<LocalHospitalIcon sx={{ fontSize: 30 }} />}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              lg: 'minmax(0, 5fr) minmax(0, 3fr)',
            },
          }}
        >
          <Box>
            <Stack spacing={2}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  // backgroundColor: subtleSurface,
                }}
              >
                <Stack spacing={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Today's OPD Schedule
                  </Typography>

                  {todaysAppointments
                    .slice()
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((appointment) => (
                      <Stack
                        key={appointment.id}
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={1}
                        justifyContent="space-between"
                        sx={{ py: 0.8, borderBottom: '1px dashed', borderColor: 'divider' }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {appointment.time} · {appointment.patientName} ({appointment.mrn})
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {appointment.provider} · {appointment.department} · {appointment.chiefComplaint}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={0.75} flexWrap="wrap">
                          <Chip size="small" variant="outlined" label={appointment.visitType} />
                          <Chip
                            size="small"
                            color={
                              appointment.status === 'Completed'
                                ? 'success'
                                : appointment.status === 'No Show'
                                ? 'error'
                                : appointment.status === 'In Consultation'
                                ? 'warning'
                                : 'info'
                            }
                            label={appointment.status}
                          />
                        </Stack>
                      </Stack>
                    ))}
                </Stack>
              </Card>

              <Card elevation={0} sx={{ p: 1.6, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={1.2}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={0.6}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      IPD Ward Occupancy
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {occupiedBeds}/{INITIAL_BED_BOARD.length} occupied
                    </Typography>
                  </Stack>

                  <Stack spacing={1}>
                    {wardSummary.map((ward) => {
                      const occupancy = ward.total > 0 ? Math.round((ward.occupied / ward.total) * 100) : 0;
                      const blockedNote = ward.blocked > 0 ? ` · ${ward.blocked} blocked` : '';

                      return (
                        <Box
                          key={ward.ward}
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.2fr) minmax(0, 1fr)' },
                            gap: 1.5,
                            alignItems: 'center',
                            p: 1.2,
                            borderRadius: 1.6,
                            border: '1px solid',
                            borderColor: 'divider',
                            backgroundColor: 'background.paper',
                          }}
                        >
                          <Stack spacing={0.35}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {ward.ward}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {ward.occupied}/{ward.total} occupied · {ward.available} available{blockedNote}
                            </Typography>
                          </Stack>
                          <Stack
                            direction="row"
                            spacing={0.75}
                            flexWrap="wrap"
                            justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                          >
                            <Chip size="small" color="primary" label={`${occupancy}% occupied`} />
                            <Chip size="small" color="info" label={`${ward.available} available`} />
                            {ward.blocked > 0 ? (
                              <Chip size="small" color="warning" label={`${ward.blocked} blocked`} />
                            ) : null}
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                </Stack>
              </Card>
            </Stack>
          </Box>

          <Box>
            <Stack spacing={2}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  // backgroundColor: subtleSurface,
                }}
              >
                <Stack spacing={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Operational Alerts
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <WarningAmberIcon color="warning" fontSize="small" />
                    <Typography variant="body2">
                      {urgentAdmissions} urgent admissions require fast-track bed assignment.
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <WarningAmberIcon color={blockedBeds > 0 ? 'error' : 'success'} fontSize="small" />
                    <Typography variant="body2">
                      {blockedBeds > 0
                        ? `${blockedBeds} beds are blocked/cleaning.`
                        : 'No blocked beds right now.'}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <MonitorHeartIcon color="warning" fontSize="small" />
                    <Typography variant="body2">
                      {
                        OPD_ENCOUNTERS.filter((encounter) => encounter.queuePriority === 'Urgent')
                          .length
                      } urgent OPD cases in triage/consult workflow.
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircleIcon color="success" fontSize="small" />
                    <Typography variant="body2">
                      {dischargeReadyCount} IPD candidates are discharge-ready today.
                    </Typography>
                  </Stack>
                </Stack>
              </Card>

              <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Financial Snapshot
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    ${totalOutstanding.toFixed(0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Current outstanding balance across patient accounts.
                  </Typography>
                  <Button variant="outlined" onClick={() => router.push('/billing/invoices')}>
                    Open Billing Invoices
                  </Button>
                </Stack>
              </Card>

              <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Module Progress
                  </Typography>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap">
                    <Chip size="small" color="success" label={`Implemented ${implementedModules}`} />
                    <Chip size="small" color="info" label={`In Progress ${inProgressModules}`} />
                    <Chip size="small" variant="outlined" label={`Planned ${plannedModules}`} />
                  </Stack>
                  <Button variant="text" onClick={() => router.push('/clinical/module-reference')}>
                    Open Module Reference
                  </Button>
                </Stack>
              </Card>

              <Card elevation={0} sx={{ p: 1.6, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={1.2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Department Load
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {departmentLoad.reduce((sum, dept) => sum + dept.count, 0)} patients
                    </Typography>
                  </Stack>

                  <Stack spacing={1}>
                    {departmentLoad.map((department) => (
                      <Box
                        key={department.department}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.2fr) minmax(0, 1fr)' },
                          gap: 1.5,
                          alignItems: 'center',
                          p: 1.2,
                          borderRadius: 1.6,
                          border: '1px solid',
                          borderColor: 'divider',
                          backgroundColor: 'background.paper',
                        }}
                      >
                        <Stack spacing={0.35}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {department.department}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {department.count} patients · {department.ratio}%
                          </Typography>
                        </Stack>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          flexWrap="wrap"
                          justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                        >
                          <Chip size="small" color="primary" label={`${department.count} patients`} />
                          <Chip size="small" color="info" label={`${department.ratio}% load`} />
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            </Stack>
          </Box>
        </Box>
      </Stack>
    </PageTemplate>
  );
}
