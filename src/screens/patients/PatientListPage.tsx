"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/src/core/auth/UserContext";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Drawer,
  FormControl,
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
  CloudUpload as CloudUploadIcon,
  FileDownload as FileDownloadIcon,
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
  const [viewsAnchor, setViewsAnchor] = React.useState<null | HTMLElement>(
    null,
  );
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
        field: "mrn",
        headerName: "MRN/Patient ID",
        width: 140,
      },
      {
        field: "name",
        headerName: "Name",
        width: 240,
        renderCell: (row: PatientRow) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: 13,
                bgcolor: "primary.main",
              }}
            >
              {row.firstName[0]}
              {row.lastName[0]}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {row.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", lineHeight: 1.25 }}
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
        width: 140,
        valueGetter: (row: PatientRow) =>
          `${row?.age ?? "—"} / ${row?.gender ?? "—"}`,
      },
      {
        field: "phone",
        headerName: "Phone",
        width: 140,
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
        width: 170,
        valueGetter: (row: PatientRow) =>
          row?.nextAppointment
            ? new Date(row.nextAppointment).toLocaleDateString()
            : "—",
      },
      {
        field: "status",
        headerName: "Status",
        width: 140,
        renderCell: (row: PatientRow) => (
          <Chip
            label={row.status}
            size="small"
            color={statusColors[row.status]}
            variant={row.status === "Inactive" ? "outlined" : "filled"}
          />
        ),
      },
      {
        field: "outstandingBalance",
        headerName: "Outstanding",
        width: 140,
        valueGetter: (row: PatientRow) =>
          typeof row?.outstandingBalance === "number"
            ? `$${row.outstandingBalance.toFixed(2)}`
            : "—",
      },
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
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
              <Chip
                size="small"
                color="primary"
                label="Registry"
                sx={{ fontWeight: 600 }}
              />
              <Chip
                size="small"
                variant="outlined"
                label="Records Central"
                sx={{
                  bgcolor: alpha(theme.palette.background.paper, 0.45),
                  fontWeight: 600,
                }}
              />
            </Stack>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "primary.main",
                letterSpacing: "-0.02em",
              }}
            >
              Patient List
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Centralized repository for all patient demographic and clinical
              identifiers.
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={1.25}
            flexWrap="wrap"
            alignItems="center"
          >
            {!isDoctor && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  Import
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  Export
                </Button>
              </>
            )}
            <Button
              variant="outlined"
              endIcon={<MoreVertIcon />}
              onClick={(event) => setViewsAnchor(event.currentTarget)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Views
            </Button>
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
          onRowClick={(row) => {
            if (isDoctor) {
              setSelectedPatient(row);
              setDetailsOpen(true);
              return;
            }
            router.push(`/patients/profile?mrn=${row.mrn}`);
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
                <Typography variant="body2">{selectedPatient.phone}</Typography>
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

      <Menu
        anchorEl={actionMenu?.anchor}
        open={Boolean(actionMenu)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            if (actionMenu) {
              setSelectedPatient(actionMenu.row);
              setDetailsOpen(true);
            }
            handleMenuClose();
          }}
        >
          View profile
        </MenuItem>

        <MenuItem
          onClick={() => {
            setSnackbar("Edit patient (stub)");
            handleMenuClose();
          }}
        >
          Edit
        </MenuItem>

        <MenuItem
          onClick={() => {
            setSnackbar("Create appointment (stub)");
            handleMenuClose();
          }}
        >
          Create appointment
        </MenuItem>

        <MenuItem
          onClick={() => {
            setSnackbar("Start encounter (stub)");
            handleMenuClose();
          }}
        >
          Start encounter
        </MenuItem>

        <MenuItem
          onClick={() => {
            setSnackbar("Admit patient (stub)");
            handleMenuClose();
          }}
        >
          Admit
        </MenuItem>

        <MenuItem
          onClick={() => {
            setSnackbar("Generate invoice (stub)");
            handleMenuClose();
          }}
        >
          Generate invoice
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem
          onClick={() => {
            if (actionMenu) {
              setConfirmAction({
                title: "Archive patient?",
                description:
                  "This will archive the patient record and hide it from active lists.",
                onConfirm: () => setSnackbar("Archive patient (stub)"),
              });
            }
            handleMenuClose();
          }}
          sx={{ color: "error.main" }}
        >
          Archive
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={viewsAnchor}
        open={Boolean(viewsAnchor)}
        onClose={() => setViewsAnchor(null)}
      >
        {savedViews.map((view) => (
          <MenuItem
            key={view.label}
            onClick={() => {
              // Note: Saved views logic simplified as we moved away from DataTable state
              setSnackbar(
                `Applying ${view.label} (not fully implemented in CommonDataGrid migration)`,
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
