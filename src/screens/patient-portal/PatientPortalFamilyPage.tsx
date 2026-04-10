'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Slider,
  Snackbar,
  Stack,
  Typography,
} from '@/src/ui/components/atoms';
import { Card, CommonDialog, StatTile } from '@/src/ui/components/molecules';
import CommonDataGrid, { CommonColumn } from '@/src/components/table/CommonDataGrid';
import { alpha, useTheme } from '@/src/ui/theme';
import {
  Add as AddIcon,
  AssignmentLate as AssignmentLateIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon,
  Hotel as HotelIcon,
  MoreVert as MoreVertIcon,
  PeopleAlt as PeopleAltIcon,
  PersonAddAlt as PersonAddAltIcon,
} from '@mui/icons-material';
import PatientPortalWorkspaceCard from './components/PatientPortalWorkspaceCard';
import { FAMILY_MEMBERS } from './patient-portal-mock-data';
import type { FamilyMember } from './patient-portal-types';
import { ppSectionCard } from './patient-portal-styles';
import { maskMobileNumber } from '@/src/core/utils/phone';

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  Active: 'success',
  Pending: 'warning',
};

const RELATIONS = [
  'All',
  'Spouse / Wife',
  'Spouse / Husband',
  'Father',
  'Mother',
  'Brother',
  'Sister',
  'Son',
  'Daughter',
  'Grandfather',
  'Grandmother',
  'Other',
];

interface FamilyPortalRow extends FamilyMember {
  mrn: string;
  age: number;
  city: string;
  createdAt: string;
  tags: string[];
  alerts: string[];
  allergiesList: string[];
}

const calcAge = (dob: string): number => {
  if (!dob) return 0;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.max(0, Math.floor(diff / (365.25 * 24 * 3600 * 1000)));
};

const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const toCity = (member: FamilyMember): string => {
  if (member.city?.trim()) return member.city.trim();
  if (member.address?.trim()) {
    const parts = member.address.split(',').map((item) => item.trim()).filter(Boolean);
    if (parts.length > 1) return parts[parts.length - 1];
    return parts[0] ?? '—';
  }
  return '—';
};

const toFamilyRow = (member: FamilyMember, index: number): FamilyPortalRow => {
  const age = member.age ?? calcAge(member.dob);
  const allergiesList = (member.allergies || '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item && !['none', 'none known'].includes(item.toLowerCase()));

  const alerts: string[] = [];
  if (age > 0 && age < 18) alerts.push('Minor');
  if ((member.conditions ?? []).length > 0) alerts.push('Chronic Condition');

  const tags = [
    member.relation,
    ...(member.conditions ?? []).slice(0, 2),
  ].filter(Boolean);

  return {
    ...member,
    mrn: member.patientId || `HC-${String(20480120 + index)}`,
    age,
    city: toCity(member),
    createdAt: new Date(Date.now() - index * 1000 * 60 * 60 * 24 * 14).toISOString(),
    tags,
    alerts,
    allergiesList,
    status: member.status || 'Active',
  };
};

const buildRegistrationRoute = (): string => {
  return '/patient-portal/family/registration';
};

export default function PatientPortalFamilyPage() {
  const router = useRouter();
  const theme = useTheme();
  const sectionCard = ppSectionCard(theme);

  const [rows, setRows] = React.useState<FamilyPortalRow[]>(() =>
    FAMILY_MEMBERS.map((member, index) => toFamilyRow(member, index))
  );
  const [filterDrawerOpen, setFilterDrawerOpen] = React.useState(false);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<FamilyPortalRow | null>(null);
  const [snackbar, setSnackbar] = React.useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);

  const [filters, setFilters] = React.useState({
    status: 'All',
    gender: 'All',
    relation: 'All',
    ageRange: [0, 100] as number[],
  });

  const filteredRows = React.useMemo(() => {
    return rows.filter((row) => {
      const matchStatus = filters.status === 'All' || row.status === filters.status;
      const matchGender = filters.gender === 'All' || row.gender === filters.gender;
      const matchRelation = filters.relation === 'All' || row.relation === filters.relation;
      const matchAge = row.age >= filters.ageRange[0] && row.age <= filters.ageRange[1];
      return matchStatus && matchGender && matchRelation && matchAge;
    });
  }, [rows, filters]);

  const clearFilters = () => {
    setFilters({
      status: 'All',
      gender: 'All',
      relation: 'All',
      ageRange: [0, 100],
    });
  };

  const removeMember = (id: string) => {
    setRows((previous) => previous.filter((row) => row.id !== id));
    if (selectedMember?.id === id) {
      setSelectedMember(null);
      setDetailsOpen(false);
    }
    setConfirmDeleteId(null);
    setSnackbar('Family member removed.');
  };

  const columns = React.useMemo<CommonColumn<FamilyPortalRow>[]>(
    () => [
      {
        field: 'mrn',
        headerName: 'MRN / Patient ID',
        width: 150,
        renderCell: (row) => (
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', fontFamily: 'monospace' }}>
            {row.mrn}
          </Typography>
        ),
      },
      {
        field: 'name',
        headerName: 'Name',
        renderCell: (row) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: row.avatarColor || alpha(theme.palette.primary.main, 0.12), color: 'primary.main', fontWeight: 700 }}>
              {getInitials(row.name)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1.2 }} noWrap>
                {row.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', display: 'block', lineHeight: 1.2 }} noWrap>
                {row.relation}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        field: 'ageGender',
        headerName: 'Age / Gender',
        valueGetter: (row) => `${row?.age ?? '—'} / ${row?.gender ?? '—'}`,
      },
      {
        field: 'phone',
        headerName: 'Phone',
        width: 150,
        renderCell: (row) => (
          <Typography variant="body2">{maskMobileNumber(row.phone || '')}</Typography>
        ),
      },
      {
        field: 'city',
        headerName: 'City',
        width: 120,
      },
      {
        field: 'status',
        headerName: 'Status',
        renderCell: (row) => (
          <Chip
            label={row.status || 'Pending'}
            size="small"
            color={statusColors[row.status || 'Pending']}
            variant={row.status === 'Active' ? 'filled' : 'outlined'}
          />
        ),
      },
      {
        field: 'tags',
        headerName: 'Tags',
        width: 200,
        renderCell: (row) => (
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {row.tags.length === 0 ? (
              <Typography variant="caption" color="text.secondary">—</Typography>
            ) : (
              row.tags.map((tag) => (
                <Chip key={`${row.id}-${tag}`} label={tag} size="small" variant="outlined" />
              ))
            )}
          </Stack>
        ),
      },
      {
        field: 'createdAt',
        headerName: 'Created At',
        width: 120,
        valueGetter: (row) => row?.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—',
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 80,
        align: 'center',
        renderCell: (row) => (
          <IconButton
            size="small"
            onClick={() => { setSelectedMember(row); setDetailsOpen(true); }}
            sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
          >
            <MoreVertIcon sx={{ fontSize: 18 }} />
          </IconButton>
        ),
      },
    ],
    [theme, router]
  );

  const totalMembers = rows.length;
  const activeMembers = rows.filter((row) => row.status === 'Active').length;
  const pendingMembers = rows.filter((row) => row.status !== 'Active').length;
  const minors = rows.filter((row) => row.age < 18).length;

  const statCards = [
    {
      label: 'Total Members',
      value: totalMembers,
      tone: 'primary' as const,
      Icon: PeopleAltIcon,
    },
    {
      label: 'Active',
      value: activeMembers,
      tone: 'success' as const,
      Icon: PersonAddAltIcon,
    },
    {
      label: 'Pending Verification',
      value: pendingMembers,
      tone: 'warning' as const,
      Icon: AssignmentLateIcon,
    },
    {
      label: 'Dependents (<18)',
      value: minors,
      tone: 'info' as const,
      Icon: HotelIcon,
    },
  ];

  return (
    <PatientPortalWorkspaceCard current="family">
      <Stack spacing={1.25} sx={{ flex: 1, minHeight: 0 }}>
        <Card
          elevation={0}
          sx={{
            p: 2,
            flexShrink: 0,
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
          >
            <Box>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 0.8, sm: 1.25 }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                sx={{ mb: 0.6 }}
              >
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Family Members
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip size="small" color="primary" label="Patient Registry Pattern" />
                  <Chip size="small" color="info" variant="outlined" label="Unified Family Profiles" />
                </Stack>
              </Stack>
              
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push(buildRegistrationRoute())}
            >
              Add Family Member
            </Button>
          </Stack>
        </Card>

        <Box
          sx={{
            display: 'grid',
            gap: 1.25,
            flexShrink: 0,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
            },
          }}
        >
          {statCards.map((stat) => (
            <StatTile
              key={stat.label}
              label={stat.label}
              value={stat.value}
              tone={stat.tone}
              icon={<stat.Icon sx={{ fontSize: 28 }} />}
            />
          ))}
        </Box>

        <Card sx={{ ...sectionCard, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <CommonDataGrid<FamilyPortalRow>
            columns={columns}
            rows={filteredRows}
            getRowId={(row) => row.mrn}
            searchPlaceholder="Search by name, MRN, phone..."
            searchFields={['mrn', 'name', 'phone', 'city', 'relation']}
            showSerialNo={false}
            rowHeight={64}
            filterDropdowns={[
              {
                id: 'status',
                placeholder: 'Status',
                value: filters.status,
                options: ['All', 'Active', 'Pending'],
                onChange: (v) => setFilters((f) => ({ ...f, status: v })),
              },
              {
                id: 'relation',
                placeholder: 'Relation',
                value: filters.relation,
                options: RELATIONS,
                onChange: (v) => setFilters((f) => ({ ...f, relation: v })),
              },
            ]}
            toolbarRight={
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => router.push(buildRegistrationRoute())}
                sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
              >
                Add Family Member
              </Button>
            }
            onRowClick={(row) => { setSelectedMember(row); setDetailsOpen(true); }}
          />
        </Card>
      </Stack>

      <Drawer anchor="right" open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)}>
        <Box sx={{ width: 360, p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => setFilterDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={filters.status}
                onChange={(event: SelectChangeEvent<unknown>) =>
                  setFilters((prev) => ({ ...prev, status: event.target.value as string }))
                }
              >
                {['All', 'Active', 'Pending'].map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Gender</InputLabel>
              <Select
                label="Gender"
                value={filters.gender}
                onChange={(event: SelectChangeEvent<unknown>) =>
                  setFilters((prev) => ({ ...prev, gender: event.target.value as string }))
                }
              >
                {['All', 'Male', 'Female', 'Other'].map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Relation</InputLabel>
              <Select
                label="Relation"
                value={filters.relation}
                onChange={(event: SelectChangeEvent<unknown>) =>
                  setFilters((prev) => ({ ...prev, relation: event.target.value as string }))
                }
              >
                {RELATIONS.map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Age range
              </Typography>
              <Slider
                value={filters.ageRange}
                onChange={(_, value) => setFilters((prev) => ({ ...prev, ageRange: value as number[] }))}
                valueLabelDisplay="auto"
                min={0}
                max={100}
              />
            </Box>

            <Button variant="contained" onClick={() => setFilterDrawerOpen(false)}>
              Apply
            </Button>
            <Button variant="text" onClick={clearFilters}>
              Reset
            </Button>
          </Stack>
        </Box>
      </Drawer>

      <Drawer anchor="right" open={detailsOpen} onClose={() => setDetailsOpen(false)}>
        <Box sx={{ width: 380, p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Family Member Summary</Typography>
            <IconButton onClick={() => setDetailsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>

          {selectedMember ? (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: selectedMember.avatarColor || 'primary.main' }}>
                  {getInitials(selectedMember.name)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {selectedMember.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedMember.mrn} · {selectedMember.relation}
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              <Box>
                <Typography variant="caption" color="text.secondary">Demographics</Typography>
                <Typography variant="body2">{selectedMember.age} years · {selectedMember.gender || '—'}</Typography>
                <Typography variant="body2">DOB: {selectedMember.dob || '—'}</Typography>
                <Typography variant="body2">Blood Group: {selectedMember.bloodGroup || '—'}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Contact</Typography>
                <Typography variant="body2">{maskMobileNumber(selectedMember.phone || '')}</Typography>
                <Typography variant="body2">{selectedMember.email || '—'}</Typography>
                <Typography variant="body2">{selectedMember.city || '—'}</Typography>
                <Typography variant="body2">{selectedMember.address || '—'}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Alerts / Allergies</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
                  {selectedMember.alerts.length === 0 && selectedMember.allergiesList.length === 0 && (
                    <Typography variant="body2" color="text.secondary">No alerts</Typography>
                  )}
                  {selectedMember.alerts.map((alert) => (
                    <Chip key={alert} label={alert} color="warning" size="small" />
                  ))}
                  {selectedMember.allergiesList.map((allergy) => (
                    <Chip key={allergy} label={allergy} color="error" size="small" />
                  ))}
                </Stack>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Identity</Typography>
                <Typography variant="body2">
                  Aadhaar: {selectedMember.aadhaarNumber ? `XXXX-XXXX-${selectedMember.aadhaarNumber.slice(-4)}` : 'Not linked'}
                </Typography>
                <Typography variant="body2">ABHA: {selectedMember.abhaNumber || 'Not linked'}</Typography>
              </Box>

              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Registration Flow
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.4 }}>
                  Family member registration uses the same patient registration workflow.
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ mt: 1 }}
                  onClick={() => router.push(buildRegistrationRoute())}
                >
                  Open Patient Registration
                </Button>
              </Box>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Select a family member to view details.
            </Typography>
          )}
        </Box>
      </Drawer>

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="info" onClose={() => setSnackbar(null)}>
          {snackbar}
        </Alert>
      </Snackbar>

      <CommonDialog
        open={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
        title="Remove family member?"
        description="This action cannot be undone."
        confirmLabel="Remove"
        confirmColor="error"
        onConfirm={() => confirmDeleteId && removeMember(confirmDeleteId)}
      />
    </PatientPortalWorkspaceCard>
  );
}
