"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/src/core/auth/UserContext";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  SelectChangeEvent,
  Slider,
  Stack,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Divider,
  Autocomplete,
} from "@/src/ui/components/atoms";
import {
  Card,
  CommonDialog,
  StatTile,
  WorkspaceHeaderCard,
} from "@/src/ui/components/molecules";
import {
  Add as AddIcon,
  AssignmentLate as AssignmentLateIcon,
  DragHandle as DragHandleIcon,
  FilterList as FilterListIcon,
  Hotel as HotelIcon,
  MoreVert as MoreVertIcon,
  PeopleAlt as PeopleAltIcon,
  PersonAddAlt as PersonAddAltIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import CommonDataGrid, {
  CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import { ListItemIcon, ListItemText } from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  CalendarMonth as CalendarMonthIcon,
  PlayArrow as StartIcon,
  Hotel as AdmitIcon,
  Receipt as InvoiceIcon,
  Archive as ArchiveIcon,
} from "@mui/icons-material";
import {
  patientData,
  patientMetrics,
  PatientRow,
} from "@/src/mocks/patientServer";

const statusColors: Record<
  string,
  "success" | "warning" | "error" | "info" | "default"
> = {
  Active: "success",
  Admitted: "info",
  "Billing Hold": "warning",
  Inactive: "default",
  Discharged: "default",
};

type CommonDataGridState = {
  columnVisibilityModel?: Record<string, boolean>;
  columnOrder?: string[];
};

const maskPhoneNumber = (phone: string) => {
  const input = (phone || "").trim();
  if (!input) return "—";

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
    return seen >= localVisibleStart ? digit : "X";
  });
};
const tagOptions = [
  "VIP",
  "High Risk",
  "Diabetic",
  "Hypertension",
  "Pregnancy",
  "Allergy",
];

export default function PatientListPage() {
  const theme = useTheme();
  const router = useRouter();
  const { role } = useUser();
  const isDoctor = role === "DOCTOR";
  const [rows] = React.useState<PatientRow[]>(patientData);

  const [filterDrawerOpen, setFilterDrawerOpen] = React.useState(false);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [selectedPatient, setSelectedPatient] =
    React.useState<PatientRow | null>(null);
  const [snackbar, setSnackbar] = React.useState<string | null>(null);
  const [externalState, setExternalState] =
    React.useState<CommonDataGridState | null>(null);
  const [columnsDialogOpen, setColumnsDialogOpen] = React.useState(false);
  const [columnVisModel, setColumnVisModel] = React.useState<Record<
    string,
    boolean
  > | null>(null);
  const [columnOrder, setColumnOrder] = React.useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  const [confirmAction, setConfirmAction] = React.useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);
  const [actionMenu, setActionMenu] = React.useState<{
    anchor: HTMLElement;
    row: PatientRow;
  } | null>(null);

  const handleMenuOpen = (
    e: React.MouseEvent<HTMLElement>,
    row: PatientRow,
  ) => {
    e.stopPropagation();
    setActionMenu({ anchor: e.currentTarget, row });
  };

  const handleMenuClose = () => setActionMenu(null);

  const buildRouteWithMrn = (
    route: string,
    row: PatientRow,
    extras?: Record<string, string>,
  ) => {
    const params = new URLSearchParams({ mrn: row.mrn });
    Object.entries(extras ?? {}).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return `${route}?${params.toString()}`;
  };

  const handleMenuNavigate = (
    route: string,
    extras?: Record<string, string>,
  ) => {
    const row = actionMenu?.row;
    handleMenuClose();
    if (!row) return;
    router.push(buildRouteWithMrn(route, row, extras));
  };

  const [filters, setFilters] = React.useState({
    status: "All",
    gender: "All",
    department: "All",
    doctor: "All",
    ageRange: [18, 80] as number[],
    regDateFrom: "",
    regDateTo: "",
    lastVisitFrom: "",
    lastVisitTo: "",
    tags: [] as string[],
  });

  const columns = React.useMemo<CommonColumn<PatientRow>[]>(
    () => [
      {
        field: "name",
        headerName: "Patient Name",
        renderCell: (row: PatientRow) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: 13,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: "primary.main",
                fontWeight: 700,
              }}
            >
              {row.firstName[0]}
              {row.lastName[0]}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: "primary.main", lineHeight: 1.2 }}
              >
                {row.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: "text.secondary",
                  fontSize: "0.68rem",
                  display: "block",
                  lineHeight: 1.2,
                }}
              >
                {row.mrn}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.68rem", display: "block", lineHeight: 1.2 }}
              >
                {row.department}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        field: "ageGender",
        headerName: "Age / Gender",
        valueGetter: (row: PatientRow) =>
          `${row?.age ?? "—"} / ${row?.gender ?? "—"}`,
      },
      {
        field: "phone",
        headerName: "Phone",
        width: 140,
        renderCell: (row: PatientRow) => (
          <Stack
            direction="row"
            alignItems="center"
            sx={{ height: "100%", width: "100%" }}
          >
            <Typography variant="body2">
              {maskPhoneNumber(row.phone)}
            </Typography>
          </Stack>
        ),
      },
      {
        field: "city",
        headerName: "City",
        width: 120,
      },
      {
        field: "lastVisit",
        headerName: "Last Visit",
        width: 150,
        valueGetter: (row: PatientRow) =>
          row?.lastVisit ? new Date(row.lastVisit).toLocaleDateString() : "—",
      },
      {
        field: "nextAppointment",
        headerName: "Next Appointment",
        valueGetter: (row: PatientRow) =>
          row?.nextAppointment
            ? new Date(row.nextAppointment).toLocaleDateString()
            : "—",
      },
      {
        field: "status",
        headerName: "Status",
        renderCell: (row: PatientRow) => (
          <Chip
            label={row.status}
            size="small"
            color={statusColors[row.status]}
            variant={row.status === "Inactive" ? "outlined" : "filled"}
          />
        ),
      },
      // {
      //   field: "outstandingBalance",
      //   headerName: "Outstanding",
      //   width: 140,
      //   valueGetter: (row: PatientRow) =>
      //     typeof row?.outstandingBalance === "number"
      //       ? `$${row.outstandingBalance.toFixed(2)}`
      //       : "—",
      // },
      {
        field: "tags",
        headerName: "Tags",
        width: 200,
        renderCell: (row: PatientRow) => (
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {row.tags.length === 0 && (
              <Typography variant="caption" color="text.secondary">
                —
              </Typography>
            )}
            {row.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Stack>
        ),
      },
      {
        field: "createdAt",
        headerName: "Created At",
        width: 140,
        valueGetter: (row: PatientRow) =>
          row?.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—",
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 120,
        align: "center",
        renderCell: (row: PatientRow) => (
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, row)}
            sx={{
              color: "text.secondary",
              "&:hover": { color: "primary.main" },
            }}
          >
            <MoreVertIcon sx={{ fontSize: 18 }} />
          </IconButton>
        ),
      },
    ],
    [],
  );

  const resetFilters = () => {
    setFilters({
      status: "All",
      gender: "All",
      department: "All",
      doctor: "All",
      ageRange: [18, 80],
      regDateFrom: "",
      regDateTo: "",
      lastVisitFrom: "",
      lastVisitTo: "",
      tags: [],
    });
  };

  const filteredRows = React.useMemo(() => {
    return rows.filter((row) => {
      if (filters.status !== "All" && row.status !== filters.status)
        return false;
      if (filters.gender !== "All" && row.gender !== filters.gender)
        return false;
      if (filters.department !== "All" && row.department !== filters.department)
        return false;
      if (filters.doctor !== "All" && row.doctor !== filters.doctor)
        return false; // Note: row might not have doctor field, check PatientRow
      if (row.age < filters.ageRange[0] || row.age > filters.ageRange[1])
        return false;

      if (
        filters.regDateFrom &&
        new Date(row.createdAt) < new Date(filters.regDateFrom)
      )
        return false;
      if (
        filters.regDateTo &&
        new Date(row.createdAt) > new Date(filters.regDateTo)
      )
        return false;
      if (
        filters.lastVisitFrom &&
        (!row.lastVisit ||
          new Date(row.lastVisit) < new Date(filters.lastVisitFrom))
      )
        return false;
      if (
        filters.lastVisitTo &&
        (!row.lastVisit ||
          new Date(row.lastVisit) > new Date(filters.lastVisitTo))
      )
        return false;

      if (
        filters.tags.length > 0 &&
        !filters.tags.some((tag) => row.tags.includes(tag))
      )
        return false;

      return true;
    });
  }, [rows, filters]);

  React.useEffect(() => {
    try {
      const key = "scanbo:grid:patient-list-v2";
      const persisted =
        typeof window !== "undefined" ? localStorage.getItem(key) : null;
      if (persisted) {
        const parsed = JSON.parse(persisted);
        if (parsed?.columnVisibilityModel) {
          setColumnVisModel(
            parsed.columnVisibilityModel as Record<string, boolean>,
          );
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
      setColumnVisModel(
        externalState.columnVisibilityModel as Record<string, boolean>,
      );
    }
    if (externalState?.columnOrder) {
      setColumnOrder(externalState.columnOrder);
    }
  }, [externalState?.columnOrder, externalState?.columnVisibilityModel]);

  const applyColumnVisModel = (
    model: Record<string, boolean>,
    order?: string[],
  ) => {
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
      (columnOrder.length > 0
        ? columnOrder
        : columns.map((column) => column.field)
      ).reduce(
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

  const handleBulkAction = (message: string) => {
    setSnackbar(message);
  };

  const savedViews = [
    { label: "Default View" },
    { label: "Billing Risk" },
    { label: "Recently Admitted" },
  ];

  const statCards = [
    {
      label: "Total Patients",
      value: patientMetrics.total,
      tone: "primary",
      Icon: PeopleAltIcon,
    },
    {
      label: "Today Registrations",
      value: patientMetrics.todayRegistrations,
      tone: "success",
      Icon: PersonAddAltIcon,
    },
    {
      label: "Pending Bills",
      value: patientMetrics.pendingBills,
      tone: "warning",
      Icon: AssignmentLateIcon,
    },
    {
      label: "Admitted",
      value: patientMetrics.admitted,
      tone: "primary",
      Icon: HotelIcon,
    },
  ] as const;

  return (
    <Box sx={{ px: 3, py: 3 }}>
      <WorkspaceHeaderCard sx={{ mb: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
        >
          <Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 0.8, sm: 1.25 }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              sx={{ mb: 0.6 }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Patients
              </Typography>
              {!isDoctor && (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip size="small" color="primary" label="Patient Registry" />
                  <Chip
                    size="small"
                    color="info"
                    variant="outlined"
                    label="OPD + IPD Linked"
                  />
                </Stack>
              )}
            </Stack>
            {!isDoctor && (
              <Typography variant="body2" color="text.secondary">
                Manage patient demographics, visits, admissions, and billing
                status in one place.
              </Typography>
            )}
          </Box>
          <Stack
            direction="row"
            spacing={1.25}
            flexWrap="wrap"
            alignItems="center"
          >
            {!isDoctor && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push("/patients/registration")}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow:
                    "0 4px 12px " + alpha(theme.palette.primary.main, 0.25),
                }}
              >
                Register Patient
              </Button>
            )}
          </Stack>
        </Stack>
      </WorkspaceHeaderCard>
      <Box
        sx={{
          display: "grid",
          gap: 2,
          mt: 2,

          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
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
          // p: 2,
        }}
      >
        <CommonDataGrid<PatientRow>
          columns={columns}
          rows={filteredRows}
          getRowId={(row) => row.mrn}
          searchPlaceholder="Search..."
          searchFields={["mrn", "name", "phone", "city", "department"]}
          showSerialNo={true}
          disableRowPointer={true}
          onRowClick={(row) => {
            if (isDoctor) {
              setSelectedPatient(row);
              setDetailsOpen(true);
              return;
            }
          }}
          toolbarRight={
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FilterListIcon />}
                onClick={() => setFilterDrawerOpen(true)}
              >
                Filters
              </Button>
              <Button variant="text" size="small" onClick={resetFilters}>
                Clear
              </Button>
              {/* <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  size="small"
                  onClick={() => handleBulkAction("Export selected (stub)")}
                >
                  Export
                </Button> */}
            </Stack>
          }
        />

        <Dialog
          open={columnsDialogOpen}
          onClose={() => setColumnsDialogOpen(false)}
          fullWidth
          maxWidth="xs"
        >
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
                      event.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      if (draggedIndex === null || draggedIndex === index)
                        return;
                      const newOrder = [...columnOrder];
                      const item = newOrder.splice(draggedIndex, 1)[0];
                      newOrder.splice(index, 0, item);
                      setColumnOrder(newOrder);
                      setDraggedIndex(index);
                    }}
                    onDragEnd={() => setDraggedIndex(null)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 1,
                      borderRadius: 1.5,
                      border: "1px solid",
                      borderColor:
                        draggedIndex === index ? "primary.main" : "divider",
                      bgcolor:
                        draggedIndex === index
                          ? alpha("#1976d2", 0.05)
                          : "transparent",
                      cursor: "grab",
                      "&:active": { cursor: "grabbing" },
                      gap: 1,
                    }}
                  >
                    <DragHandleIcon
                      sx={{ color: "text.disabled", fontSize: 18 }}
                    />
                    <FormControlLabel
                      sx={{ flex: 1, m: 0 }}
                      control={
                        <Checkbox
                          size="small"
                          checked={columnVisModel?.[field] !== false}
                          onChange={() => toggleColumn(field)}
                          sx={{ p: 0.5 }}
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {column.headerName ?? field}
                        </Typography>
                      }
                    />
                  </Box>
                );
              })}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => resetColumnVisibility()}>Reset</Button>
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

      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      >
        <Box sx={{ width: 360, p: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
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
                  setFilters((prev) => ({
                    ...prev,
                    status: event.target.value as string,
                  }))
                }
              >
                {[
                  "All",
                  "Active",
                  "Inactive",
                  "Admitted",
                  "Discharged",
                  "Billing Hold",
                ].map((value) => (
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
                  setFilters((prev) => ({
                    ...prev,
                    gender: event.target.value as string,
                  }))
                }
              >
                {["All", "Male", "Female", "Other"].map((value) => (
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
                onChange={(_, value) =>
                  setFilters((prev) => ({
                    ...prev,
                    ageRange: value as number[],
                  }))
                }
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
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    regDateFrom: event.target.value,
                  }))
                }
                fullWidth
              />
              <TextField
                label="To"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={filters.regDateTo}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    regDateTo: event.target.value,
                  }))
                }
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
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    lastVisitFrom: event.target.value,
                  }))
                }
                fullWidth
              />
              <TextField
                label="To"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={filters.lastVisitTo}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    lastVisitTo: event.target.value,
                  }))
                }
                fullWidth
              />
            </Stack>

            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                label="Department"
                value={filters.department}
                onChange={(event: SelectChangeEvent<unknown>) =>
                  setFilters((prev) => ({
                    ...prev,
                    department: event.target.value as string,
                  }))
                }
              >
                {[
                  "All",
                  "Cardiology",
                  "Neurology",
                  "Orthopedics",
                  "Pediatrics",
                  "Oncology",
                  "Dermatology",
                ].map((value) => (
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
                  setFilters((prev) => ({
                    ...prev,
                    doctor: event.target.value as string,
                  }))
                }
              >
                {[
                  "All",
                  "Dr. Rao",
                  "Dr. Chen",
                  "Dr. Kim",
                  "Dr. Martinez",
                  "Dr. Singh",
                  "Dr. Patel",
                ].map((value) => (
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
              onChange={(_, value) =>
                setFilters((prev) => ({ ...prev, tags: value }))
              }
              renderInput={(params) => (
                <TextField {...params} label="Tags" size="small" />
              )}
            />

            <Button
              variant="contained"
              onClick={() => setFilterDrawerOpen(false)}
            >
              Apply filters
            </Button>
          </Stack>
        </Box>
      </Drawer>

      <Drawer
        anchor="right"
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      >
        <Box sx={{ width: 360, p: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography variant="h6">Patient Summary</Typography>
            <IconButton onClick={() => setDetailsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
          {selectedPatient ? (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar>
                  {selectedPatient.firstName[0]}
                  {selectedPatient.lastName[0]}
                </Avatar>
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
                <Typography variant="caption" color="text.secondary">
                  Demographics
                </Typography>
                <Typography variant="body2">
                  {selectedPatient.age} years · {selectedPatient.gender}
                </Typography>
                <Typography variant="body2">
                  {maskPhoneNumber(selectedPatient.phone)}
                </Typography>
                <Typography variant="body2">{selectedPatient.city}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Alerts / Allergies
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  sx={{ mt: 0.5 }}
                >
                  {selectedPatient.alerts.length === 0 &&
                    selectedPatient.allergies.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        No alerts
                      </Typography>
                    )}
                  {selectedPatient.alerts.map((alert) => (
                    <Chip
                      key={alert}
                      label={alert}
                      color="warning"
                      size="small"
                    />
                  ))}
                  {selectedPatient.allergies.map((allergy) => (
                    <Chip
                      key={allergy}
                      label={allergy}
                      color="error"
                      size="small"
                    />
                  ))}
                </Stack>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Last Vitals
                </Typography>
                <Typography variant="body2">
                  {selectedPatient.lastVitals}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Last Visit Note
                </Typography>
                <Typography variant="body2">
                  {selectedPatient.lastVisitNote}
                </Typography>
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
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
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

      <Menu
        anchorEl={actionMenu?.anchor}
        open={Boolean(actionMenu)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            width: 220,
            mt: 0.5,
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            borderRadius: 2.5,
            "& .MuiMenuItem-root": {
              py: 1.2,
              px: 2,
              gap: 1.5,
              fontSize: "0.875rem",
              fontWeight: 500,
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                color: "primary.main",
                "& .MuiListItemIcon-root": { color: "primary.main" },
              },
            },
          },
        }}
      >
        <MenuItem onClick={() => handleMenuNavigate("/patients/profile")}>
          <ListItemIcon sx={{ minWidth: 24 }}>
            <VisibilityIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText primary="View Profile" />
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleMenuNavigate("/patients/registration", {
              mode: "edit",
              source: "patient-list",
            })
          }
        >
          <ListItemIcon sx={{ minWidth: 24 }}>
            <EditIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText primary="Edit Demographics" />
        </MenuItem>
        <Divider sx={{ my: 1, opacity: 0.6 }} />
        <MenuItem
          onClick={() =>
            handleMenuNavigate("/appointments/calendar", {
              booking: "1",
              source: "patient-list",
            })
          }
        >
          <ListItemIcon sx={{ minWidth: 24 }}>
            <CalendarMonthIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText primary="New Appointment" />
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleMenuNavigate("/appointments/visit", {
              source: "patient-list",
            })
          }
        >
          <ListItemIcon sx={{ minWidth: 24 }}>
            <StartIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText primary="Start Encounter" />
        </MenuItem>
        <MenuItem onClick={() => handleMenuNavigate("/ipd/admissions")}>
          <ListItemIcon sx={{ minWidth: 24 }}>
            <AdmitIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText primary="Admit Patient" />
        </MenuItem>
        <Divider sx={{ my: 1, opacity: 0.6 }} />
        <MenuItem onClick={() => handleMenuNavigate("/billing/invoices")}>
          <ListItemIcon sx={{ minWidth: 24 }}>
            <InvoiceIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText primary="Billing / Invoices" />
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            const row = actionMenu?.row;
            if (row) {
              setConfirmAction({
                title: "Archive Patient?",
                description: `Are you sure you want to archive ${row.name}? They will no longer appear in the active registry.`,
                onConfirm: () =>
                  setSnackbar(`Patient ${row.name} archived successfully.`),
              });
            }
            handleMenuClose();
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon sx={{ minWidth: 24, color: "inherit" }}>
            <ArchiveIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText primary="Archive" />
        </MenuItem>
      </Menu>
    </Box>
  );
}
