'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Stack,
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
import DataTable from '@/src/ui/components/organisms/DataTable';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { alpha, useTheme } from '@mui/material';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { useUser } from '@/src/core/auth/UserContext';
import { canAccessRoute } from '@/src/core/navigation/route-access';
import ModuleHeaderCard from '@/src/screens/clinical/components/ModuleHeaderCard';
import {
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Bed as BedIcon,
  Hotel as HotelIcon,
  HowToReg as HowToRegIcon,
  LocalHospital as LocalHospitalIcon,
  PersonAdd as PersonAddIcon,
  VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material';

type RegistrationStatus = 'Awaiting Insurance' | 'Ready for Admission' | 'Bed Assigned' | 'Completed';
type AdmissionPriority = 'Routine' | 'Urgent';
type VerificationStatus = 'Pending' | 'In Review' | 'Approved';

interface RegistrationCase {
  id: string;
  patientName: string;
  mrn: string;
  ageGender: string;
  visitType: string;
  status: RegistrationStatus;
  insurance: string;
  bedRequest: string;
  eta: string;
  priority: AdmissionPriority;
}

interface WardCapacity {
  id: string;
  name: string;
  totalBeds: number;
  occupied: number;
  pendingDischarges: number;
}

interface VerificationTask {
  id: string;
  patientName: string;
  mrn: string;
  task: string;
  owner: string;
  due: string;
  status: VerificationStatus;
}

const REGISTRATION_QUEUE: RegistrationCase[] = [
  {
    id: 'reg-1',
    patientName: 'Aarav Nair',
    mrn: 'MRN-245781',
    ageGender: '34 / Male',
    visitType: 'Planned Admission',
    status: 'Awaiting Insurance',
    insurance: 'Zenith Cashless',
    bedRequest: 'Medical Ward',
    eta: '10:30 AM',
    priority: 'Routine',
  },
  {
    id: 'reg-2',
    patientName: 'Meera Joshi',
    mrn: 'MRN-245799',
    ageGender: '28 / Female',
    visitType: 'Emergency Admission',
    status: 'Ready for Admission',
    insurance: 'Self Pay',
    bedRequest: 'Surgical Ward',
    eta: '10:45 AM',
    priority: 'Urgent',
  },
  {
    id: 'reg-3',
    patientName: 'Ravi Iyer',
    mrn: 'MRN-245802',
    ageGender: '56 / Male',
    visitType: 'Transfer',
    status: 'Bed Assigned',
    insurance: 'HealthSecure',
    bedRequest: 'ICU',
    eta: '11:05 AM',
    priority: 'Urgent',
  },
  {
    id: 'reg-4',
    patientName: 'Sneha Patil',
    mrn: 'MRN-245820',
    ageGender: '42 / Female',
    visitType: 'Day Care',
    status: 'Completed',
    insurance: 'NovaCare',
    bedRequest: 'Day Care Unit',
    eta: '11:20 AM',
    priority: 'Routine',
  },
];

const WARD_CAPACITY: WardCapacity[] = [
  {
    id: 'ward-1',
    name: 'Medical Ward',
    totalBeds: 42,
    occupied: 36,
    pendingDischarges: 5,
  },
  {
    id: 'ward-2',
    name: 'Surgical Ward',
    totalBeds: 30,
    occupied: 26,
    pendingDischarges: 3,
  },
  {
    id: 'ward-3',
    name: 'ICU',
    totalBeds: 12,
    occupied: 11,
    pendingDischarges: 1,
  },
];

const VERIFICATION_TASKS: VerificationTask[] = [
  {
    id: 'vt-1',
    patientName: 'Aarav Nair',
    mrn: 'MRN-245781',
    task: 'Validate insurance pre-authorization',
    owner: 'Front Desk',
    due: '10:15 AM',
    status: 'Pending',
  },
  {
    id: 'vt-2',
    patientName: 'Meera Joshi',
    mrn: 'MRN-245799',
    task: 'Collect admission consent',
    owner: 'Admission Desk',
    due: '10:30 AM',
    status: 'In Review',
  },
  {
    id: 'vt-3',
    patientName: 'Ravi Iyer',
    mrn: 'MRN-245802',
    task: 'Verify transfer documents',
    owner: 'Bed Manager',
    due: '10:50 AM',
    status: 'Approved',
  },
];

const statusColors: Record<RegistrationStatus, 'warning' | 'info' | 'success' | 'default'> = {
  'Awaiting Insurance': 'warning',
  'Ready for Admission': 'info',
  'Bed Assigned': 'success',
  Completed: 'default',
};

const priorityColors: Record<AdmissionPriority, 'default' | 'error'> = {
  Routine: 'default',
  Urgent: 'error',
};

const verificationColors: Record<VerificationStatus, 'warning' | 'info' | 'success'> = {
  Pending: 'warning',
  'In Review': 'info',
  Approved: 'success',
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('');

export default function RegistrationAdtPage() {
  const router = useRouter();
  const theme = useTheme();
  const mrnParam = useMrnParam();
  const { permissions } = useUser();
  const [selectedCaseId, setSelectedCaseId] = React.useState(REGISTRATION_QUEUE[0]?.id ?? '');
  const [mrnApplied, setMrnApplied] = React.useState(false);

  const selectedCase = React.useMemo(
    () => REGISTRATION_QUEUE.find((entry) => entry.id === selectedCaseId) ?? REGISTRATION_QUEUE[0],
    [selectedCaseId]
  );

  const flowMrn = selectedCase?.mrn ?? mrnParam;
  const pageSubtitle = formatPatientLabel(selectedCase?.patientName, flowMrn);
  const withMrn = React.useCallback(
    (route: string) => (flowMrn ? `${route}?mrn=${flowMrn}` : route),
    [flowMrn]
  );

  React.useEffect(() => {
    if (!mrnParam || mrnApplied) return;
    const match = REGISTRATION_QUEUE.find((entry) => entry.mrn === mrnParam);
    if (match) {
      setSelectedCaseId(match.id);
    }
    setMrnApplied(true);
  }, [mrnParam, mrnApplied]);

  const canNavigate = React.useCallback(
    (route: string) => canAccessRoute(route, permissions),
    [permissions]
  );

  const columns = React.useMemo<GridColDef<RegistrationCase>[]>(
    () => [
      {
        field: 'patientName',
        headerName: 'Patient',
        minWidth: 240,
        flex: 1.2,
        renderCell: (params: GridRenderCellParams<RegistrationCase>) => (
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ height: '100%' }}>
            <Avatar sx={{ width: 34, height: 34, fontSize: 13, bgcolor: 'primary.main' }}>
              {getInitials(params.row.patientName)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {params.row.patientName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {params.row.mrn} - {params.row.ageGender}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        field: 'visitType',
        headerName: 'Visit Type',
        width: 170,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 170,
        renderCell: (params: GridRenderCellParams<RegistrationCase, RegistrationStatus>) => (
          <Chip
            size="small"
            label={params.value}
            color={statusColors[params.row.status]}
            variant={params.row.status === 'Completed' ? 'outlined' : 'filled'}
          />
        ),
      },
      {
        field: 'bedRequest',
        headerName: 'Bed Request',
        width: 170,
      },
      {
        field: 'eta',
        headerName: 'ETA',
        width: 110,
      },
      {
        field: 'priority',
        headerName: 'Priority',
        width: 120,
        renderCell: (params: GridRenderCellParams<RegistrationCase, AdmissionPriority>) => (
          <Chip
            size="small"
            label={params.value}
            color={priorityColors[params.row.priority]}
            variant={params.row.priority === 'Urgent' ? 'filled' : 'outlined'}
          />
        ),
      },
    ],
    []
  );

  return (
    <PageTemplate title="Registration & ADT" subtitle={pageSubtitle} currentPageTitle="Registration & ADT">
      <Stack spacing={1.5}>
        <ModuleHeaderCard
          title="Registration & ADT"
          description="Capture registrations, verify coverage, admit patients, and coordinate beds in one workspace."
          chips={[
            { label: 'Patient Access', color: 'primary' },
            { label: 'Registration & Bed Management', variant: 'outlined' },
            { label: 'Implemented', color: 'success', variant: 'filled' },
          ]}
          actions={
            <>
              <Button
                variant="outlined"
                startIcon={<PersonAddIcon />}
                disabled={!canNavigate('/patients/registration')}
                onClick={() => router.push(withMrn('/patients/registration'))}
              >
                New Registration
              </Button>
              <Button
                variant="contained"
                startIcon={<LocalHospitalIcon />}
                disabled={!canNavigate('/ipd/admissions')}
                onClick={() => router.push(withMrn('/ipd/admissions'))}
              >
                Start Admission
              </Button>
            </>
          }
        />

        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <StatTile
              label="Registrations Today"
              value="18"
              subtitle="3 awaiting insurance"
              icon={<HowToRegIcon fontSize="small" />}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatTile
              label="Admissions Pending"
              value="6"
              subtitle="2 urgent"
              icon={<LocalHospitalIcon fontSize="small" />}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatTile
              label="Beds Occupied"
              value="73/84"
              subtitle="87% occupancy"
              icon={<HotelIcon fontSize="small" />}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatTile
              label="Discharges Today"
              value="12"
              subtitle="4 pending sign-off"
              icon={<AssignmentTurnedInIcon fontSize="small" />}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Card elevation={0} sx={{ p: 0, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
              <DataTable
                tableId="registration-queue"
                rows={REGISTRATION_QUEUE}
                columns={columns}
                onRowClick={(params) => setSelectedCaseId(String(params.id))}
                toolbarConfig={{
                  title: 'Admission Queue',
                  showColumns: false,
                  showDensity: false,
                  showExport: false,
                  showSavedViews: false,
                }}
                rowHeight={64}
              />
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Card elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                      {selectedCase ? getInitials(selectedCase.patientName) : '--'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {selectedCase?.patientName ?? 'Select a registration'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedCase?.mrn ?? 'No MRN selected'}
                      </Typography>
                    </Box>
                  </Stack>
                  <Divider />
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        Visit Type
                      </Typography>
                      <Typography variant="body2">{selectedCase?.visitType ?? '-'}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        Insurance
                      </Typography>
                      <Typography variant="body2">{selectedCase?.insurance ?? '-'}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        Bed Request
                      </Typography>
                      <Typography variant="body2">{selectedCase?.bedRequest ?? '-'}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        Status
                      </Typography>
                      {selectedCase ? (
                        <Chip
                          size="small"
                          label={selectedCase.status}
                          color={statusColors[selectedCase.status]}
                          variant={selectedCase.status === 'Completed' ? 'outlined' : 'filled'}
                        />
                      ) : (
                        <Typography variant="body2">-</Typography>
                      )}
                    </Stack>
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<HowToRegIcon />}
                      disabled={!canNavigate('/patients/registration')}
                      onClick={() => router.push(withMrn('/patients/registration'))}
                    >
                      Open Registration
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<BedIcon />}
                      disabled={!canNavigate('/ipd/beds')}
                      onClick={() => router.push(withMrn('/ipd/beds'))}
                    >
                      Bed Board
                    </Button>
                  </Stack>
                </Stack>
              </Card>

              <Card elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <HotelIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Bed Board Snapshot
                    </Typography>
                  </Stack>
                  <Stack spacing={1.5}>
                    {WARD_CAPACITY.map((ward) => {
                      const occupancy = Math.round((ward.occupied / ward.totalBeds) * 100);
                      return (
                        <Box key={ward.id}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="subtitle2">{ward.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {ward.occupied}/{ward.totalBeds} occupied
                            </Typography>
                          </Stack>
                          <Box
                            sx={{
                              mt: 0.75,
                              height: 6,
                              borderRadius: 999,
                              backgroundColor: alpha(theme.palette.primary.main, 0.12),
                            }}
                          >
                            <Box
                              sx={{
                                width: `${occupancy}%`,
                                height: '100%',
                                borderRadius: 999,
                                backgroundColor:
                                  occupancy >= 90 ? theme.palette.warning.main : theme.palette.primary.main,
                              }}
                            />
                          </Box>
                          <Stack direction="row" spacing={1} sx={{ mt: 0.75 }} flexWrap="wrap">
                            <Chip
                              size="small"
                              label={`${ward.totalBeds - ward.occupied} available`}
                              variant="outlined"
                            />
                            <Chip
                              size="small"
                              label={`${ward.pendingDischarges} pending discharge`}
                              variant="outlined"
                            />
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                </Stack>
              </Card>
            </Stack>
          </Grid>
        </Grid>

        <Card elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <VerifiedUserIcon fontSize="small" color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Insurance & ID Tasks
              </Typography>
            </Stack>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Patient</TableCell>
                    <TableCell>Task</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Due</TableCell>
                    <TableCell align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {VERIFICATION_TASKS.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {task.patientName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {task.mrn}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{task.task}</Typography>
                      </TableCell>
                      <TableCell>{task.owner}</TableCell>
                      <TableCell>{task.due}</TableCell>
                      <TableCell align="right">
                        <Chip size="small" label={task.status} color={verificationColors[task.status]} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Card>
      </Stack>
    </PageTemplate>
  );
}
