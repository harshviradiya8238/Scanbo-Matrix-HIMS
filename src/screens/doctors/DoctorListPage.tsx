"use client";

import * as React from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  SelectChangeEvent,
  Snackbar,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Typography,
} from "@/src/ui/components/atoms";
import { Card, CommonDialog, StatTile } from "@/src/ui/components/molecules";
import { useTheme } from "@/src/ui/theme";
import { getSoftSurface, getSubtleSurface } from "@/src/core/theme/surfaces";
import { alpha } from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  EventNote as EventNoteIcon,
  FileDownload as FileDownloadIcon,
  FilterList as FilterListIcon,
  LocalHospital as LocalHospitalIcon,
  MedicalServices as MedicalServicesIcon,
  MoreVert as MoreVertIcon,
  People as PeopleIcon,
  Videocam as VideocamIcon,
  Star as StarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import {
  GridActionsCellItem,
  GridColDef,
  GridFilterModel,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import DataTable, {
  CommonDataGridState,
} from "@/src/ui/components/organisms/DataTable";
import { doctorData, doctorMetrics, DoctorRow } from "@/src/mocks/doctorServer";
import { useRouter } from "next/navigation";

const statusColors: Record<
  string,
  "success" | "warning" | "error" | "info" | "default"
> = {
  Active: "success",
  "On Leave": "warning",
  Inactive: "default",
  Suspended: "error",
  "Pending Verification": "info",
};

const defaultFilterModel: GridFilterModel = {
  items: [],
  quickFilterValues: [],
};

const AVATAR_COLORS = [
  "#1172BA",
  "#0B84D0",
  "#2FA77A",
  "#2C8AD3",
  "#F3C44E",
  "#E77B7B",
  "#7C3AED",
  "#059669",
  "#DC2626",
  "#9333EA",
];

const getAvatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const DaysBadge = ({ days }: { days: string }) => {
  const theme = useTheme();
  const active = days ? days.split(",").filter(Boolean) : [];
  return (
    <Stack direction="row" spacing={0.35} flexWrap="wrap" useFlexGap>
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
        <Box
          key={d}
          sx={{
            px: 0.55,
            py: 0.15,
            borderRadius: 0.75,
            fontSize: "0.65rem",
            fontWeight: 700,
            lineHeight: 1.6,
            backgroundColor: active.includes(d)
              ? alpha(theme.palette.primary.main, 0.15)
              : alpha(theme.palette.text.disabled, 0.08),
            color: active.includes(d) ? "primary.main" : "text.disabled",
          }}
        >
          {d}
        </Box>
      ))}
    </Stack>
  );
};

const RatingBadge = ({ rating }: { rating: number }) => (
  <Stack direction="row" spacing={0.4} alignItems="center">
    <StarIcon sx={{ fontSize: 14, color: "#F3C44E" }} />
    <Typography variant="caption" sx={{ fontWeight: 700 }}>
      {rating.toFixed(1)}
    </Typography>
  </Stack>
);

export default function DoctorListPage() {
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const subtleSurface = getSubtleSurface(theme);
  const router = useRouter();

  const [rows] = React.useState<DoctorRow[]>(doctorData);
  const [filterDrawerOpen, setFilterDrawerOpen] = React.useState(false);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [selectedDoctor, setSelectedDoctor] = React.useState<DoctorRow | null>(
    null,
  );
  const [snackbar, setSnackbar] = React.useState<string | null>(null);
  const [viewsAnchor, setViewsAnchor] = React.useState<null | HTMLElement>(
    null,
  );
  const [externalState, setExternalState] =
    React.useState<CommonDataGridState | null>(null);
  const [columnsDialogOpen, setColumnsDialogOpen] = React.useState(false);
  const [columnVisModel, setColumnVisModel] = React.useState<Record<
    string,
    boolean
  > | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  const [filters, setFilters] = React.useState({
    status: "All",
    doctorType: "All",
    department: "All",
    specialization: "All",
    gender: "All",
    regDateFrom: "",
    regDateTo: "",
  });

  const [filterModel, setFilterModel] =
    React.useState<GridFilterModel>(defaultFilterModel);

  const columns = React.useMemo<GridColDef<DoctorRow>[]>(
    () => [
      {
        field: "doctorId",
        headerName: "Doctor ID",
        width: 120,
      },
      {
        field: "name",
        headerName: "Doctor",
        flex: 1,
        minWidth: 260,
        renderCell: (params) => (
          <Stack
            direction="row"
            spacing={1.2}
            alignItems="center"
            justifyContent="center"
            sx={{ height: "100%", width: "100%" }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                fontSize: 13,
                fontWeight: 700,
                bgcolor: getAvatarColor(params.row.firstName),
                flexShrink: 0,
              }}
            >
              {params.row.firstName?.[0]}
              {params.row.lastName?.[0]}
            </Avatar>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.3,
                  whiteSpace: "normal",
                }}
              >
                {params.row.name}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", lineHeight: 1.2 }}
              >
                {params.row.primarySpecialization}
              </Typography>

              {/* <Typography
          variant="caption"
          sx={{ color: 'primary.main', fontWeight: 600, fontSize: '0.68rem' }}
        >
          {params.row.qualifications}
        </Typography> */}
            </Box>
          </Stack>
        ),
      },
      {
        field: "designation",
        headerName: "Designation",
        width: 170,
      },
      {
        field: "department",
        headerName: "Department",
        width: 150,
      },
      {
        field: "doctorType",
        headerName: "Type",
        width: 120,
        renderCell: (params) => (
          <Chip
            label={params.row.doctorType}
            size="small"
            variant="outlined"
            color={
              params.row.doctorType === "Consultant" ? "primary" : "default"
            }
          />
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 160,
        headerAlign: "center",
        align: "center",
        renderCell: (params) => (
          <Stack
            spacing={0.5}
            alignItems="center"
            justifyContent="center"
            sx={{ width: "100%", height: "100%" }}
          >
            <Chip
              label={params.row.status}
              size="small"
              color={statusColors[params.row.status]}
              variant={params.row.status === "Inactive" ? "outlined" : "filled"}
            />
            {params.row.telemedicine && (
              <Stack direction="row" spacing={0.4} alignItems="center">
                <VideocamIcon sx={{ fontSize: 11, color: "info.main" }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: "info.main",
                    fontSize: "0.65rem",
                    fontWeight: 600,
                  }}
                >
                  Telemedicine
                </Typography>
              </Stack>
            )}
          </Stack>
        ),
      },
      {
        field: "todayAppointments",
        headerName: "Today",
        width: 100,
        renderCell: (params) => (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Stack direction="row" spacing={0.5} alignItems="center">
              <EventNoteIcon sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {params.row.todayAppointments}
              </Typography>
            </Stack>
          </Box>
        ),
      },
      {
        field: "availableDays",
        headerName: "Available Days",
        width: 230,
        headerAlign: "center",
        align: "center",
        renderCell: (params) => (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <DaysBadge days={params.row.availableDays} />
          </Box>
        ),
        sortable: false,
      },
      {
        field: "consultationFee",
        headerName: "Fee",
        width: 100,
        valueGetter: (_value, row) => `₹${row?.consultationFee ?? "—"}`,
      },
      {
        field: "rating",
        headerName: "Rating",
        width: 90,
        renderCell: (params) => (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <RatingBadge rating={params.row.rating} />
          </Box>
        ),
      },
      {
        field: "mobile",
        headerName: "Contact",
        width: 155,
      },
      {
        field: "joinedDate",
        headerName: "Joined",
        width: 120,
        valueGetter: (_value, row) =>
          row?.joinedDate
            ? new Date(row.joinedDate).toLocaleDateString("en-IN")
            : "—",
      },
      {
        field: "actions",
        headerName: "Actions",
        type: "actions",
        width: 100,
        getActions: (params) => [
          <GridActionsCellItem
            key="view"
            label="View profile"
            onClick={() => {
              setSelectedDoctor(params.row);
              setDetailsOpen(true);
            }}
            showInMenu
          />,
          <GridActionsCellItem
            key="edit"
            label="Edit doctor"
            onClick={() => setSnackbar("Edit doctor (stub)")}
            showInMenu
          />,
          <GridActionsCellItem
            key="schedule"
            label="View schedule"
            onClick={() => setSnackbar("View schedule (stub)")}
            showInMenu
          />,
          <GridActionsCellItem
            key="assign"
            label="Assign patients"
            onClick={() => setSnackbar("Assign patients (stub)")}
            showInMenu
          />,
          <GridActionsCellItem
            key="leave"
            label="Mark on leave"
            onClick={() =>
              setConfirmAction({
                title: "Mark doctor on leave?",
                description: `${params.row.name} will be marked as On Leave and unavailable for appointments.`,
                onConfirm: () => setSnackbar("Marked on leave (stub)"),
              })
            }
            showInMenu
          />,
          <GridActionsCellItem
            key="deactivate"
            label="Deactivate"
            onClick={() =>
              setConfirmAction({
                title: "Deactivate doctor account?",
                description: `This will deactivate ${params.row.name}'s account and prevent login.`,
                onConfirm: () => setSnackbar("Deactivated (stub)"),
              })
            }
            showInMenu
          />,
        ],
      },
    ],
    [],
  );

  const applyFilters = React.useCallback(() => {
    const items: GridFilterModel["items"] = [];
    if (filters.status !== "All")
      items.push({
        id: 1,
        field: "status",
        operator: "equals",
        value: filters.status,
      });
    if (filters.doctorType !== "All")
      items.push({
        id: 2,
        field: "doctorType",
        operator: "equals",
        value: filters.doctorType,
      });
    if (filters.department !== "All")
      items.push({
        id: 3,
        field: "department",
        operator: "equals",
        value: filters.department,
      });
    if (filters.specialization !== "All")
      items.push({
        id: 4,
        field: "primarySpecialization",
        operator: "equals",
        value: filters.specialization,
      });
    if (filters.gender !== "All")
      items.push({
        id: 5,
        field: "gender",
        operator: "equals",
        value: filters.gender,
      });
    if (filters.regDateFrom)
      items.push({
        id: 6,
        field: "joinedDate",
        operator: "after",
        value: filters.regDateFrom,
      });
    if (filters.regDateTo)
      items.push({
        id: 7,
        field: "joinedDate",
        operator: "before",
        value: filters.regDateTo,
      });

    setFilterModel({
      items,
      quickFilterValues: filterModel.quickFilterValues ?? [],
    });
  }, [filters, filterModel.quickFilterValues]);

  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  React.useEffect(() => {
    // initialize column visibility model from persisted state or externalState
    try {
      const key = `scanbo:grid:doctor-list`;
      const persisted =
        typeof window !== "undefined" ? localStorage.getItem(key) : null;
      if (persisted) {
        const parsed = JSON.parse(persisted);
        if (parsed?.columnVisibilityModel) {
          setColumnVisModel(parsed.columnVisibilityModel);
          return;
        }
      }
    } catch (e) {
      // ignore
    }
    if (externalState?.columnVisibilityModel)
      setColumnVisModel(externalState.columnVisibilityModel);
    else
      setColumnVisModel(
        columns.reduce(
          (acc, c) => ({ ...acc, [c.field]: true }),
          {} as Record<string, boolean>,
        ),
      );
  }, [externalState, columns]);

  const applyColumnVisModel = (model: Record<string, boolean>) => {
    setColumnVisModel(model);
    setExternalState((prev) => ({
      ...(prev ?? {}),
      columnVisibilityModel: model,
    }));
  };

  const toggleColumn = (field: string) => {
    const next = { ...(columnVisModel ?? {}) };
    next[field] = !next[field];
    applyColumnVisModel(next);
  };

  const resetColumnVisibility = () => {
    const allVisible = columns.reduce(
      (acc, c) => ({ ...acc, [c.field]: true }),
      {} as Record<string, boolean>,
    );
    applyColumnVisModel(allVisible);
  };

  const savedViews = [
    { label: "All Doctors", state: null },
    {
      label: "Active Consultants",
      state: {
        filterModel: {
          items: [
            { id: 1, field: "status", operator: "equals", value: "Active" },
            {
              id: 2,
              field: "doctorType",
              operator: "equals",
              value: "Consultant",
            },
          ],
        },
        sortModel: [{ field: "rating", sort: "desc" }],
      } satisfies CommonDataGridState,
    },
    {
      label: "Telemedicine Doctors",
      state: {
        filterModel: {
          items: [
            { id: 1, field: "telemedicine", operator: "is", value: "true" },
          ],
        },
        sortModel: [{ field: "todayAppointments", sort: "desc" }],
      } satisfies CommonDataGridState,
    },
    {
      label: "Busiest Today",
      state: {
        filterModel: { items: [] },
        sortModel: [{ field: "todayAppointments", sort: "desc" }],
      } satisfies CommonDataGridState,
    },
  ];

  const statCards = [
    {
      label: "Total Doctors",
      value: doctorMetrics.total,
      tone: "primary",
      Icon: PeopleIcon,
    },
    {
      label: "Active Today",
      value: doctorMetrics.activeToday,
      tone: "success",
      Icon: MedicalServicesIcon,
    },
    {
      label: "On Leave",
      value: doctorMetrics.onLeave,
      tone: "warning",
      Icon: LocalHospitalIcon,
    },
    {
      label: "Telemedicine",
      value: doctorMetrics.telemedicine,
      tone: "info",
      Icon: VideocamIcon,
    },
  ] as const;

  const resetFilters = () => {
    setFilters({
      status: "All",
      doctorType: "All",
      department: "All",
      specialization: "All",
      gender: "All",
      regDateFrom: "",
      regDateTo: "",
    });
    setFilterModel(defaultFilterModel);
  };

  return (
    <Box sx={{ px: 3, py: 3 }}>
      {/* Page Header */}
      <Card
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2.5,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: softSurface,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
        >
          <Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
              <Chip size="small" color="primary" label="Doctor Registry" />
              <Chip
                size="small"
                color="info"
                variant="outlined"
                label="OPD + Telemedicine"
              />
              <Chip
                size="small"
                color="success"
                variant="outlined"
                label="India & International"
              />
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Doctors
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage doctor profiles, specializations, schedules, and
              credentialing across all departments.
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={1.5}
            flexWrap="wrap"
            alignItems="center"
          >
            <Button variant="outlined" startIcon={<CloudUploadIcon />}>
              Import
            </Button>
            <Button variant="outlined" startIcon={<FileDownloadIcon />}>
              Export
            </Button>
            <Button
              variant="outlined"
              endIcon={<MoreVertIcon />}
              onClick={(e) => setViewsAnchor(e.currentTarget)}
            >
              Saved Views
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push("/doctors/registration")}
            >
              Add Doctor
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* Stat Cards */}
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

      {/* Data Table Card */}
      <Card
        sx={{
          mt: 2,
          p: 2,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: subtleSurface,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Doctor Registry
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {rows.length} doctors
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setFilterDrawerOpen(true)}
            >
              Filters
            </Button>
            <Button
              variant="outlined"
              startIcon={<ViewColumnIcon />}
              onClick={() => setColumnsDialogOpen(true)}
            >
              Columns
            </Button>
            <Button variant="text" onClick={resetFilters}>
              Clear filters
            </Button>
          </Stack>
        </Stack>

        <DataTable
          tableId="doctor-list"
          columns={columns}
          rows={rows}
          rowHeight={76}
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
          externalState={externalState}
          toolbarConfig={{
            title: "Doctors",
            showSavedViews: true,
            showPrint: true,
            emptyCtaLabel: "Add Doctor",
            onEmptyCtaClick: () => router.push("/doctors/registration"),
          }}
          onRowClick={(params) => {
            setSelectedDoctor(params.row as DoctorRow);
            setDetailsOpen(true);
          }}
          renderBulkActions={() => (
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setSnackbar("Export selected (stub)")}
              >
                Export selected
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setSnackbar("Send notification (stub)")}
              >
                Send notification
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  setConfirmAction({
                    title: "Mark selected on leave?",
                    description: "Selected doctors will be marked as On Leave.",
                    onConfirm: () => setSnackbar("Marked on leave (stub)"),
                  })
                }
              >
                Mark on leave
              </Button>
              <Button
                size="small"
                color="error"
                variant="outlined"
                onClick={() =>
                  setConfirmAction({
                    title: "Deactivate selected doctors?",
                    description:
                      "This will deactivate all selected doctor accounts.",
                    onConfirm: () => setSnackbar("Deactivated (stub)"),
                  })
                }
              >
                Deactivate
              </Button>
            </Stack>
          )}
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
              {columns.map((col) => (
                <FormControlLabel
                  key={col.field}
                  control={
                    <Checkbox
                      size="small"
                      checked={
                        columnVisModel
                          ? Boolean(columnVisModel[col.field])
                          : true
                      }
                      onChange={() => toggleColumn(col.field)}
                    />
                  }
                  label={col.headerName ?? col.field}
                />
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                resetColumnVisibility();
              }}
            >
              Reset
            </Button>
            <Button
              onClick={() => setColumnsDialogOpen(false)}
              variant="contained"
            >
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </Card>

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      >
        <Box sx={{ width: 340, p: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Filters
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Narrow down the doctor list
              </Typography>
            </Box>
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
                onChange={(e: SelectChangeEvent<unknown>) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: e.target.value as string,
                  }))
                }
              >
                {[
                  "All",
                  "Active",
                  "On Leave",
                  "Inactive",
                  "Suspended",
                  "Pending Verification",
                ].map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Doctor Type</InputLabel>
              <Select
                label="Doctor Type"
                value={filters.doctorType}
                onChange={(e: SelectChangeEvent<unknown>) =>
                  setFilters((prev) => ({
                    ...prev,
                    doctorType: e.target.value as string,
                  }))
                }
              >
                {[
                  "All",
                  "Consultant",
                  "Visiting",
                  "Resident",
                  "Intern",
                  "Telemedicine",
                ].map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                label="Department"
                value={filters.department}
                onChange={(e: SelectChangeEvent<unknown>) =>
                  setFilters((prev) => ({
                    ...prev,
                    department: e.target.value as string,
                  }))
                }
              >
                {[
                  "All",
                  "Cardiology",
                  "Neurology",
                  "Orthopedics",
                  "Gynecology",
                  "Pediatrics",
                  "Oncology",
                  "Gastroenterology",
                  "Pulmonology",
                  "Nephrology",
                  "Endocrinology",
                  "Dermatology",
                  "Psychiatry",
                  "Ophthalmology",
                  "ENT",
                  "Internal Medicine",
                  "Emergency",
                  "ICU",
                ].map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Specialization</InputLabel>
              <Select
                label="Specialization"
                value={filters.specialization}
                onChange={(e: SelectChangeEvent<unknown>) =>
                  setFilters((prev) => ({
                    ...prev,
                    specialization: e.target.value as string,
                  }))
                }
              >
                {[
                  "All",
                  "Cardiology",
                  "Neurology",
                  "Orthopedics",
                  "Gynecology & Obstetrics",
                  "Pediatrics",
                  "Oncology",
                  "Gastroenterology",
                  "General Medicine",
                  "General Surgery",
                  "Radiology",
                  "Emergency Medicine",
                  "Critical Care",
                ].map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Gender</InputLabel>
              <Select
                label="Gender"
                value={filters.gender}
                onChange={(e: SelectChangeEvent<unknown>) =>
                  setFilters((prev) => ({
                    ...prev,
                    gender: e.target.value as string,
                  }))
                }
              >
                {["All", "Male", "Female"].map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={1.5}>
              <TextField
                label="Joined from"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={filters.regDateFrom}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    regDateFrom: e.target.value,
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
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, regDateTo: e.target.value }))
                }
                fullWidth
              />
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => setFilterDrawerOpen(false)}
              >
                Apply Filters
              </Button>
              <Button variant="outlined" onClick={resetFilters}>
                Reset
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer>

      {/* Doctor Detail Drawer */}
      <Drawer
        anchor="right"
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      >
        <Box
          sx={{
            width: 380,
            p: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Drawer Header */}
          <Box
            sx={{
              px: 2.5,
              py: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: "#fff",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Doctor Profile
              </Typography>
              <IconButton
                size="small"
                onClick={() => setDetailsOpen(false)}
                sx={{ color: "#fff", mt: -0.5 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
            {selectedDoctor && (
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{ mt: 1.5 }}
              >
                <Avatar
                  sx={{
                    width: 52,
                    height: 52,
                    fontSize: 18,
                    fontWeight: 800,
                    bgcolor: alpha("#fff", 0.2),
                    border: "2px solid",
                    borderColor: alpha("#fff", 0.4),
                  }}
                >
                  {selectedDoctor.firstName[0]}
                  {selectedDoctor.lastName[0]}
                </Avatar>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, color: "#fff", lineHeight: 1.2 }}
                  >
                    {selectedDoctor.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: alpha("#fff", 0.85) }}
                  >
                    {selectedDoctor.primarySpecialization} ·{" "}
                    {selectedDoctor.department}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{ mt: 0.6 }}
                    flexWrap="wrap"
                  >
                    <Chip
                      label={selectedDoctor.status}
                      size="small"
                      sx={{
                        bgcolor: alpha("#fff", 0.2),
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        height: 20,
                      }}
                    />
                    <Chip
                      label={selectedDoctor.doctorType}
                      size="small"
                      sx={{
                        bgcolor: alpha("#fff", 0.15),
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        height: 20,
                      }}
                    />
                    {selectedDoctor.telemedicine && (
                      <Chip
                        icon={
                          <VideocamIcon
                            sx={{ fontSize: 12, color: "#fff !important" }}
                          />
                        }
                        label="Telemedicine"
                        size="small"
                        sx={{
                          bgcolor: alpha("#fff", 0.15),
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          height: 20,
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              </Stack>
            )}
          </Box>

          {/* Drawer Body */}
          <Box sx={{ flex: 1, overflow: "auto", p: 2.5 }}>
            {selectedDoctor ? (
              <Stack spacing={2}>
                {/* ID & License */}
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Identity &amp; License
                  </Typography>
                  <Stack spacing={0.6} sx={{ mt: 0.8 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <BadgeIcon
                        sx={{ fontSize: 14, color: "text.secondary" }}
                      />
                      <Typography variant="body2">
                        <Box component="span" sx={{ fontWeight: 600 }}>
                          Doctor ID:
                        </Box>{" "}
                        {selectedDoctor.doctorId}
                      </Typography>
                    </Stack>
                    <Typography variant="body2">
                      <Box component="span" sx={{ fontWeight: 600 }}>
                        License No:
                      </Box>{" "}
                      {selectedDoctor.licenseNumber}
                    </Typography>
                    <Typography variant="body2">
                      <Box component="span" sx={{ fontWeight: 600 }}>
                        Expiry:
                      </Box>{" "}
                      {new Date(
                        selectedDoctor.licenseExpiry,
                      ).toLocaleDateString("en-IN")}
                    </Typography>
                    <Typography variant="body2">
                      <Box component="span" sx={{ fontWeight: 600 }}>
                        Registration:
                      </Box>{" "}
                      {selectedDoctor.registrationCountry === "india"
                        ? "🇮🇳 India"
                        : "🌍 International"}
                    </Typography>
                  </Stack>
                </Box>

                <Divider />

                {/* Credentials */}
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Credentials
                  </Typography>
                  <Stack spacing={0.6} sx={{ mt: 0.8 }}>
                    <Typography variant="body2">
                      <Box component="span" sx={{ fontWeight: 600 }}>
                        Qualification:
                      </Box>{" "}
                      {selectedDoctor.qualifications}
                    </Typography>
                    <Typography variant="body2">
                      <Box component="span" sx={{ fontWeight: 600 }}>
                        Designation:
                      </Box>{" "}
                      {selectedDoctor.designation}
                    </Typography>
                    <Typography variant="body2">
                      <Box component="span" sx={{ fontWeight: 600 }}>
                        Experience:
                      </Box>{" "}
                      {selectedDoctor.yearsOfExperience} years
                    </Typography>
                    <Typography variant="body2">
                      <Box component="span" sx={{ fontWeight: 600 }}>
                        Languages:
                      </Box>{" "}
                      {selectedDoctor.languages}
                    </Typography>
                  </Stack>
                </Box>

                <Divider />

                {/* Contact */}
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Contact
                  </Typography>
                  <Stack spacing={0.6} sx={{ mt: 0.8 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneIcon
                        sx={{ fontSize: 14, color: "text.secondary" }}
                      />
                      <Typography variant="body2">
                        {selectedDoctor.mobile}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EmailIcon
                        sx={{ fontSize: 14, color: "text.secondary" }}
                      />
                      <Typography variant="body2">
                        {selectedDoctor.email}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

                <Divider />

                {/* Availability */}
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Availability
                  </Typography>
                  <Box sx={{ mt: 0.8 }}>
                    <DaysBadge days={selectedDoctor.availableDays} />
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        <Box component="span" sx={{ fontWeight: 600 }}>
                          OPD Fee:
                        </Box>{" "}
                        ₹{selectedDoctor.consultationFee}
                      </Typography>
                      <Typography variant="body2">
                        <Box component="span" sx={{ fontWeight: 600 }}>
                          Today:
                        </Box>{" "}
                        {selectedDoctor.todayAppointments} appts
                      </Typography>
                    </Stack>
                  </Box>
                </Box>

                <Divider />

                {/* Stats */}
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Statistics
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ mt: 0.8 }}
                    flexWrap="wrap"
                  >
                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        flex: 1,
                        minWidth: 80,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Total Patients
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {selectedDoctor.totalPatients}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        flex: 1,
                        minWidth: 80,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Rating
                      </Typography>
                      <Stack direction="row" spacing={0.4} alignItems="center">
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          {selectedDoctor.rating}
                        </Typography>
                        <StarIcon sx={{ fontSize: 16, color: "#F3C44E" }} />
                      </Stack>
                    </Box>
                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        flex: 1,
                        minWidth: 80,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Joined
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {new Date(selectedDoctor.joinedDate).toLocaleDateString(
                          "en-IN",
                          { month: "short", year: "numeric" },
                        )}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Divider />

                {/* Action Buttons */}
                <Stack spacing={1}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => setSnackbar("View full profile (stub)")}
                  >
                    View Full Profile
                  </Button>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<EventNoteIcon />}
                      onClick={() => setSnackbar("Open schedule (stub)")}
                    >
                      Schedule
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => setSnackbar("Edit doctor (stub)")}
                    >
                      Edit
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Select a doctor to view details.
              </Typography>
            )}
          </Box>
        </Box>
      </Drawer>

      {/* Saved Views Menu */}
      <Menu
        anchorEl={viewsAnchor}
        open={Boolean(viewsAnchor)}
        onClose={() => setViewsAnchor(null)}
      >
        {savedViews.map((view) => (
          <MenuItem
            key={view.label}
            onClick={() => {
              if (view.state?.filterModel)
                setFilterModel(view.state.filterModel as GridFilterModel);
              if (!view.state) setFilterModel(defaultFilterModel);
              setExternalState(
                view.state ?? {
                  filterModel: defaultFilterModel,
                  sortModel: [],
                },
              );
              setViewsAnchor(null);
            }}
          >
            {view.label}
          </MenuItem>
        ))}
      </Menu>

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
    </Box>
  );
}
