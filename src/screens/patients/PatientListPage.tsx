'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/src/core/auth/UserContext';
import { Avatar, Box, Button, Chip, Drawer, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent, Slider, Stack, TextField, Typography, Snackbar, Alert, Divider, Autocomplete, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox } from '@/src/ui/components/atoms';
import { Card, CommonDialog, StatTile } from '@/src/ui/components/molecules';
import { alpha } from '@mui/material';
import {
  Add as AddIcon,
  AssignmentLate as AssignmentLateIcon,
  FilterList as FilterListIcon,
  Hotel as HotelIcon,
  PeopleAlt as PeopleAltIcon,
  PersonAddAlt as PersonAddAltIcon,
  Close as CloseIcon,
  DragHandle as DragHandleIcon,
} from '@mui/icons-material';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import {
  GridActionsCellItem,
  GridColDef,
  GridFilterModel,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import DataTable, { CommonDataGridState } from '@/src/ui/components/organisms/DataTable';
import { patientData, patientMetrics, PatientRow } from '@/src/mocks/patientServer';

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  Active: 'success',
  Admitted: 'info',
  'Billing Hold': 'warning',
  Inactive: 'default',
  Discharged: 'default',
};

const tagOptions = ['VIP', 'High Risk', 'Diabetic', 'Hypertension', 'Pregnancy', 'Allergy'];

const defaultFilterModel: GridFilterModel = { items: [], quickFilterValues: [] };
const maskPhoneNumber = (phone: string) => {
  const input = (phone || '').trim();
  if (!input) return '—';

  const allDigits = input.match(/\d/g) || [];
  const totalDigits = allDigits.length;
  if (totalDigits <= 4) return input;

  // Keep country code visible when number starts with a + prefix (e.g. +91).
  const countryMatch = input.match(/^\+(\d{1,3})/);
  const keepPrefixDigits = countryMatch ? countryMatch[1].length : 0;
  const localVisibleStart = totalDigits - 4 + 1;

  let seen = 0;
  return input.replace(/\d/g, (digit) => {
    seen += 1;
    if (seen <= keepPrefixDigits) return digit;
    return seen >= localVisibleStart ? digit : 'X';
  });
};

export default function PatientListPage() {
  const router = useRouter();
  const { role } = useUser();
  const isDoctor = role === 'DOCTOR';
  const [rows] = React.useState<PatientRow[]>(patientData);

  const [filterDrawerOpen, setFilterDrawerOpen] = React.useState(false);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState<PatientRow | null>(null);
  const [snackbar, setSnackbar] = React.useState<string | null>(null);
  const [externalState, setExternalState] = React.useState<CommonDataGridState | null>(null);
  const [columnsDialogOpen, setColumnsDialogOpen] = React.useState(false);
  const [columnVisModel, setColumnVisModel] = React.useState<Record<string, boolean> | null>(null);
  const [columnOrder, setColumnOrder] = React.useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  const [filters, setFilters] = React.useState({
    status: 'All',
    gender: 'All',
    department: 'All',
    doctor: 'All',
    ageRange: [18, 80] as number[],
    regDateFrom: '',
    regDateTo: '',
    lastVisitFrom: '',
    lastVisitTo: '',
    tags: [] as string[],
  });

  const [filterModel, setFilterModel] = React.useState<GridFilterModel>(defaultFilterModel);

  const columns = React.useMemo<GridColDef<PatientRow>[]>(
    () => [
      {
        field: 'mrn',
        headerName: 'MRN/Patient ID',
        width: 140,
      },
      {
        field: 'name',
        headerName: 'Name',
        width: 240,
        renderCell: (params: GridRenderCellParams<PatientRow>) => (
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ height: '100%', width: '100%' }}>
            <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: 'primary.main' }}>
              {params.row.firstName[0]}
              {params.row.lastName[0]}
            </Avatar>
            <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {params.row.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.25 }}>
                {params.row.department}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        field: 'ageGender',
        headerName: 'Age / Gender',
        width: 140,
        valueGetter: (_value, row) => `${row?.age ?? '—'} / ${row?.gender ?? '—'}`,
      },
      {
        field: 'phone',
        headerName: 'Phone',
        width: 140,
        renderCell: (params: GridRenderCellParams<PatientRow>) => (
          <Stack direction="row" alignItems="center" sx={{ height: '100%', width: '100%' }}>
            <Typography variant="body2">{maskPhoneNumber(params.row.phone)}</Typography>
          </Stack>
        ),
      },
      {
        field: 'city',
        headerName: 'City',
        width: 120,
      },
      {
        field: 'lastVisit',
        headerName: 'Last Visit',
        width: 150,
        valueGetter: (_value, row) =>
          row?.lastVisit ? new Date(row.lastVisit).toLocaleDateString() : '—',
      },
      {
        field: 'nextAppointment',
        headerName: 'Next Appointment',
        width: 170,
        valueGetter: (_value, row) =>
          row?.nextAppointment ? new Date(row.nextAppointment).toLocaleDateString() : '—',
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 140,
        renderCell: (params) => (
          <Chip
            label={params.row.status}
            size="small"
            color={statusColors[params.row.status]}
            variant={params.row.status === 'Inactive' ? 'outlined' : 'filled'}
          />
        ),
      },
      {
        field: 'outstandingBalance',
        headerName: 'Outstanding',
        width: 140,
        valueGetter: (_value, row) =>
          typeof row?.outstandingBalance === 'number'
            ? `$${row.outstandingBalance.toFixed(2)}`
            : '—',
      },
      {
        field: 'tags',
        headerName: 'Tags',
        width: 200,
        renderCell: (params) => (
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {params.row.tags.length === 0 && (
              <Typography variant="caption" color="text.secondary">
                —
              </Typography>
            )}
            {params.row.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Stack>
        ),
      },
      {
        field: 'createdAt',
        headerName: 'Created At',
        width: 140,
        valueGetter: (_value, row) =>
          row?.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—',
      },
      {
        field: 'actions',
        headerName: 'Actions',
        type: 'actions',
        width: 120,
        getActions: (params) => [
          <GridActionsCellItem
            key="view"
            label="View profile"
            onClick={() => {
              setSelectedPatient(params.row);
              setDetailsOpen(true);
            }}
            showInMenu
          />,
          <GridActionsCellItem key="edit" label="Edit" onClick={() => setSnackbar('Edit patient (stub)')} showInMenu />,
          <GridActionsCellItem
            key="appointment"
            label="Create appointment"
            onClick={() => setSnackbar('Create appointment (stub)')}
            showInMenu
          />,
          <GridActionsCellItem
            key="encounter"
            label="Start encounter"
            onClick={() => setSnackbar('Start encounter (stub)')}
            showInMenu
          />,
          <GridActionsCellItem
            key="admit"
            label="Admit"
            onClick={() => setSnackbar('Admit patient (stub)')}
            showInMenu
          />,
          <GridActionsCellItem
            key="invoice"
            label="Generate invoice"
            onClick={() => setSnackbar('Generate invoice (stub)')}
            showInMenu
          />,
          <GridActionsCellItem
            key="archive"
            label="Archive"
            onClick={() =>
              setConfirmAction({
                title: 'Archive patient?',
                description: 'This will archive the patient record and hide it from active lists.',
                onConfirm: () => setSnackbar('Archive patient (stub)'),
              })
            }
            showInMenu
          />,
        ],
      },
    ],
    []
  );

  const applyFilterStateToModel = React.useCallback(() => {
    const items: GridFilterModel['items'] = [];
    if (filters.status !== 'All') {
      items.push({ id: 1, field: 'status', operator: 'equals', value: filters.status });
    }
    if (filters.gender !== 'All') {
      items.push({ id: 2, field: 'gender', operator: 'equals', value: filters.gender });
    }
    if (filters.department !== 'All') {
      items.push({ id: 3, field: 'department', operator: 'equals', value: filters.department });
    }
    if (filters.doctor !== 'All') {
      items.push({ id: 4, field: 'doctor', operator: 'equals', value: filters.doctor });
    }
    if (filters.tags.length > 0) {
      items.push({ id: 5, field: 'tags', operator: 'isAnyOf', value: filters.tags });
    }
    items.push({ id: 6, field: 'age', operator: '>=', value: filters.ageRange[0] });
    items.push({ id: 7, field: 'age', operator: '<=', value: filters.ageRange[1] });

    if (filters.regDateFrom) {
      items.push({ id: 8, field: 'createdAt', operator: 'after', value: filters.regDateFrom });
    }
    if (filters.regDateTo) {
      items.push({ id: 9, field: 'createdAt', operator: 'before', value: filters.regDateTo });
    }
    if (filters.lastVisitFrom) {
      items.push({ id: 10, field: 'lastVisit', operator: 'after', value: filters.lastVisitFrom });
    }
    if (filters.lastVisitTo) {
      items.push({ id: 11, field: 'lastVisit', operator: 'before', value: filters.lastVisitTo });
    }

    setFilterModel({ items, quickFilterValues: filterModel.quickFilterValues ?? [] });
  }, [filters, filterModel.quickFilterValues]);

  React.useEffect(() => {
    applyFilterStateToModel();
  }, [applyFilterStateToModel]);

  React.useEffect(() => {
    try {
      const key = 'scanbo:grid:patient-list-v2';
      const persisted = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      if (persisted) {
        const parsed = JSON.parse(persisted);
        if (parsed?.columnVisibilityModel) {
          setColumnVisModel(parsed.columnVisibilityModel as Record<string, boolean>);
        }
        if (parsed?.columnOrder) {
          setColumnOrder(parsed.columnOrder as string[]);
        }
        if (parsed?.columnVisibilityModel || parsed?.columnOrder) return;
      }
    } catch {
      // ignore
    }

    const defaultOrder = columns.map((column) => column.field);
    setColumnOrder(defaultOrder);
    setColumnVisModel(
      defaultOrder.reduce(
        (acc, field) => ({ ...acc, [field]: true }),
        {} as Record<string, boolean>,
      ),
    );
  }, [columns]);

  React.useEffect(() => {
    if (externalState?.columnVisibilityModel) {
      setColumnVisModel(externalState.columnVisibilityModel as Record<string, boolean>);
    }
    if (externalState?.columnOrder) {
      setColumnOrder(externalState.columnOrder);
    }
  }, [externalState?.columnOrder, externalState?.columnVisibilityModel]);

  const applyColumnVisModel = (model: Record<string, boolean>, order?: string[]) => {
    setColumnVisModel(model);
    if (order) setColumnOrder(order);
    setExternalState((prev) => ({
      ...(prev ?? {}),
      columnVisibilityModel: model,
      columnOrder: order ?? columnOrder,
    }));
  };

  const toggleColumn = (field: string) => {
    const current =
      columnVisModel ??
      (columnOrder.length > 0 ? columnOrder : columns.map((column) => column.field)).reduce(
        (acc, currentField) => ({ ...acc, [currentField]: true }),
        {} as Record<string, boolean>,
      );

    const next = { ...current };
    next[field] = current[field] === false ? true : false;
    applyColumnVisModel(next);
  };

  const resetColumnVisibility = () => {
    const allVisible = columns.reduce(
      (acc, column) => ({ ...acc, [column.field]: true }),
      {} as Record<string, boolean>,
    );
    const defaultOrder = columns.map((column) => column.field);
    applyColumnVisModel(allVisible, defaultOrder);
  };

  const resetFilters = () => {
    setFilters({
      status: 'All',
      gender: 'All',
      department: 'All',
      doctor: 'All',
      ageRange: [18, 80],
      regDateFrom: '',
      regDateTo: '',
      lastVisitFrom: '',
      lastVisitTo: '',
      tags: [],
    });
    setFilterModel(defaultFilterModel);
  };

  const handleBulkAction = (message: string) => {
    setSnackbar(message);
  };

  const statCards = [
    {
      label: 'Total Patients',
      value: patientMetrics.total,
      tone: 'primary',
      Icon: PeopleAltIcon,
    },
    {
      label: 'Today Registrations',
      value: patientMetrics.todayRegistrations,
      tone: 'success',
      Icon: PersonAddAltIcon,
    },
    {
      label: 'Pending Bills',
      value: patientMetrics.pendingBills,
      tone: 'warning',
      Icon: AssignmentLateIcon,
    },
    {
      label: 'Admitted',
      value: patientMetrics.admitted,
      tone: 'primary',
      Icon: HotelIcon,
    },
  ] as const;

  return (
    <Box sx={{ px: 3, py: 3 }}>
      <Card
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2.5,
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
                Patients
              </Typography>
              {!isDoctor && (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip size="small" color="primary" label="Patient Registry" />
                  <Chip size="small" color="info" variant="outlined" label="OPD + IPD Linked" />
                </Stack>
              )}
            </Stack>
            {!isDoctor && (
              <Typography variant="body2" color="text.secondary">
                Manage patient demographics, visits, admissions, and billing status in one place.
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center">
            {!isDoctor && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push('/patients/registration')}
              >
                Add Patient
              </Button>
            )}
          </Stack>
        </Stack>
      </Card>
      <Box
          sx={{
            display: 'grid',
            gap: 2,
            mt: 2,
              
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

      <Card
        sx={{
          mt: 2,
          p: 2,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Patient Registry
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {rows.length} patients
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<FilterListIcon />} onClick={() => setFilterDrawerOpen(true)}>
              Filters
            </Button>
            <Button variant="outlined" startIcon={<ViewColumnIcon />} onClick={() => setColumnsDialogOpen(true)}>
              Columns
            </Button>
            <Button variant="text" onClick={resetFilters}>
              Clear filters
            </Button>
          </Stack>
        </Stack>

        <DataTable
          tableId="patient-list"
          persistKey="patient-list-v2"
          columns={columns}
          rows={rows}
          autoHeight
          rowHeight={72}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ paginationModel: { page: 0, pageSize: 10 } }}
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
          externalState={externalState}
          toolbarConfig={{
            title: 'Patients',
            showSavedViews: false,
            showPrint: true,
            showExport: false,
            ...(isDoctor
              ? {}
              : {
                  emptyCtaLabel: 'Add Patient',
                  onEmptyCtaClick: () => router.push('/patients/registration'),
                }),
          }}
          onRowClick={(params) => {
            if (isDoctor) {
              setSelectedPatient(params.row as PatientRow);
              setDetailsOpen(true);
              return;
            }

            const row = params.row as PatientRow;
            router.push(`/patients/profile?mrn=${row.mrn}`);
          }}
          renderBulkActions={() => (
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  setConfirmAction({
                    title: 'Mark patients inactive?',
                    description: 'Selected patients will be moved to inactive status.',
                    onConfirm: () => handleBulkAction('Mark inactive (stub)'),
                  })
                }
              >
                Mark inactive
              </Button>
              <Button size="small" variant="outlined" onClick={() => handleBulkAction('Assign tags (stub)')}>
                Assign tags
              </Button>
              <Button size="small" variant="outlined" onClick={() => handleBulkAction('Send SMS (stub)')}>
                Send SMS
              </Button>
              <Button
                size="small"
                color="error"
                variant="outlined"
                onClick={() =>
                  setConfirmAction({
                    title: 'Merge duplicates?',
                    description: 'This will merge selected duplicate records into a single patient.',
                    onConfirm: () => handleBulkAction('Merge duplicates (stub)'),
                  })
                }
              >
                Merge duplicates
              </Button>
            </Stack>
          )}
        />

        <Dialog open={columnsDialogOpen} onClose={() => setColumnsDialogOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle>Choose columns</DialogTitle>
          <DialogContent>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {columnOrder.map((field, index) => {
                const column = columns.find((item) => item.field === field);
                if (!column) return null;

                return (
                  <Box
                    key={field}
                    draggable
                    onDragStart={(event) => {
                      setDraggedIndex(index);
                      event.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      if (draggedIndex === null || draggedIndex === index) return;
                      const newOrder = [...columnOrder];
                      const item = newOrder.splice(draggedIndex, 1)[0];
                      newOrder.splice(index, 0, item);
                      setColumnOrder(newOrder);
                      setDraggedIndex(index);
                    }}
                    onDragEnd={() => setDraggedIndex(null)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 1,
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: draggedIndex === index ? 'primary.main' : 'divider',
                      bgcolor: draggedIndex === index ? alpha('#1976d2', 0.05) : 'transparent',
                      cursor: 'grab',
                      '&:active': { cursor: 'grabbing' },
                      gap: 1,
                    }}
                  >
                    <DragHandleIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
                    <FormControlLabel
                      sx={{ flex: 1, m: 0 }}
                      control={(
                        <Checkbox
                          size="small"
                          checked={columnVisModel?.[field] !== false}
                          onChange={() => toggleColumn(field)}
                          sx={{ p: 0.5 }}
                        />
                      )}
                      label={(
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {column.headerName ?? field}
                        </Typography>
                      )}
                    />
                  </Box>
                );
              })}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => resetColumnVisibility()}>
              Reset
            </Button>
            <Button
              onClick={() => {
                applyColumnVisModel(columnVisModel ?? {}, columnOrder);
                setColumnsDialogOpen(false);
              }}
              variant="contained"
            >
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </Card>

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
                {['All', 'Active', 'Inactive', 'Admitted', 'Discharged', 'Billing Hold'].map((value) => (
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

            <Stack direction="row" spacing={1.5}>
              <TextField
                label="Registration from"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={filters.regDateFrom}
                onChange={(event) => setFilters((prev) => ({ ...prev, regDateFrom: event.target.value }))}
                fullWidth
              />
              <TextField
                label="To"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={filters.regDateTo}
                onChange={(event) => setFilters((prev) => ({ ...prev, regDateTo: event.target.value }))}
                fullWidth
              />
            </Stack>

            <Stack direction="row" spacing={1.5}>
              <TextField
                label="Last visit from"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={filters.lastVisitFrom}
                onChange={(event) => setFilters((prev) => ({ ...prev, lastVisitFrom: event.target.value }))}
                fullWidth
              />
              <TextField
                label="To"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={filters.lastVisitTo}
                onChange={(event) => setFilters((prev) => ({ ...prev, lastVisitTo: event.target.value }))}
                fullWidth
              />
            </Stack>

            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                label="Department"
                value={filters.department}
                onChange={(event: SelectChangeEvent<unknown>) =>
                  setFilters((prev) => ({ ...prev, department: event.target.value as string }))
                }
              >
                {['All', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology', 'Dermatology'].map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Doctor</InputLabel>
              <Select
                label="Doctor"
                value={filters.doctor}
                onChange={(event: SelectChangeEvent<unknown>) =>
                  setFilters((prev) => ({ ...prev, doctor: event.target.value as string }))
                }
              >
                {['All', 'Dr. Rao', 'Dr. Chen', 'Dr. Kim', 'Dr. Martinez', 'Dr. Singh', 'Dr. Patel'].map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Autocomplete
              multiple
              options={tagOptions}
              value={filters.tags}
              onChange={(_, value) => setFilters((prev) => ({ ...prev, tags: value }))}
              renderInput={(params) => <TextField {...params} label="Tags" size="small" />}
            />

            <Button variant="contained" onClick={() => setFilterDrawerOpen(false)}>
              Apply filters
            </Button>
          </Stack>
        </Box>
      </Drawer>

      <Drawer anchor="right" open={detailsOpen} onClose={() => setDetailsOpen(false)}>
        <Box sx={{ width: 360, p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Patient Summary</Typography>
            <IconButton onClick={() => setDetailsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
          {selectedPatient ? (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar>{selectedPatient.firstName[0]}{selectedPatient.lastName[0]}</Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {selectedPatient.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedPatient.mrn} · {selectedPatient.department}
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              <Box>
                <Typography variant="caption" color="text.secondary">Demographics</Typography>
                <Typography variant="body2">{selectedPatient.age} years · {selectedPatient.gender}</Typography>
                <Typography variant="body2">{maskPhoneNumber(selectedPatient.phone)}</Typography>
                <Typography variant="body2">{selectedPatient.city}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Alerts / Allergies</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
                  {selectedPatient.alerts.length === 0 && selectedPatient.allergies.length === 0 && (
                    <Typography variant="body2" color="text.secondary">No alerts</Typography>
                  )}
                  {selectedPatient.alerts.map((alert) => (
                    <Chip key={alert} label={alert} color="warning" size="small" />
                  ))}
                  {selectedPatient.allergies.map((allergy) => (
                    <Chip key={allergy} label={allergy} color="error" size="small" />
                  ))}
                </Stack>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Last Vitals</Typography>
                <Typography variant="body2">{selectedPatient.lastVitals}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Last Visit Note</Typography>
                <Typography variant="body2">{selectedPatient.lastVisitNote}</Typography>
              </Box>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Select a patient to view details.
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
        open={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.title}
        description={confirmAction?.description}
        confirmLabel="Confirm"
        confirmColor="error"
        onConfirm={() => {
          confirmAction?.onConfirm();
          setConfirmAction(null);
        }}
      />
    </Box>
  );
}
