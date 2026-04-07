"use client";
import * as React from "react";
import { alpha, useTheme } from "@/src/ui/theme";
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
  MenuItem,
  Select,
  SelectChangeEvent,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import {
  Card,
  CommonDialog,
  StatTile,
  WorkspaceHeaderCard,
} from "@/src/ui/components/molecules";
import {
  Add as AddIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  EventNote as EventNoteIcon,
  FileDownload as FileDownloadIcon,
  FilterList as FilterListIcon,
  LocalHospital as LocalHospitalIcon,
  MedicalServices as MedicalServicesIcon,
  People as PeopleIcon,
  Videocam as VideocamIcon,
  Star as StarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  CalendarMonth as CalendarMonthIcon,
  MoreVert as MoreVertIcon,
  DeleteOutline as DeleteOutlineIcon,
} from "@mui/icons-material";
import { getSoftSurface, getSubtleSurface } from "@/src/core/theme/surfaces";
import { Menu, ListItemIcon, ListItemText } from "@mui/material";
import SimpleDataGrid, {
  CommonColumn,
  FilterDropdown,
} from "@/src/components/table/CommonDataGrid";
import { doctorData, doctorMetrics, DoctorRow } from "@/src/mocks/doctorServer";
import { CARE_COMPANION_ENROLLED } from "@/src/mocks/care-companion";
import { useRouter } from "next/navigation";
import { GridActionsCellItem } from "@mui/x-data-grid";

/* ─── Helpers ────────────────────────────────────────────────────────────── */

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
              ? alpha("#1172BA", 0.15)
              : alpha("#6b7280", 0.08),
            color: active.includes(d) ? "#1172BA" : "#9ca3af",
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

/* ─── Page Component ─────────────────────────────────────────────────────── */

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
  const [confirmAction, setConfirmAction] = React.useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  /* ── toolbar filter state ── */
  const [statusFilter, setStatusFilter] = React.useState("All Status");
  const [typeFilter, setTypeFilter] = React.useState("All Types");

  /* ── row action menu ── */
  const [actionMenu, setActionMenu] = React.useState<{
    anchor: HTMLElement;
    row: DoctorRow;
  } | null>(null);
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, row: DoctorRow) => {
    e.stopPropagation();
    setActionMenu({ anchor: e.currentTarget, row });
  };
  const handleMenuClose = () => setActionMenu(null);

  /* ── advanced filter drawer state ── */
  const [filters, setFilters] = React.useState({
    department: "All",
    specialization: "All",
    gender: "All",
    regDateFrom: "",
    regDateTo: "",
  });

  /* ── filtered rows (toolbar + drawer combined) ── */
  const filteredRows = React.useMemo(() => {
    return rows.filter((row) => {
      if (statusFilter !== "All Status" && row.status !== statusFilter)
        return false;
      if (typeFilter !== "All Types" && row.doctorType !== typeFilter)
        return false;
      if (filters.department !== "All" && row.department !== filters.department)
        return false;
      if (
        filters.specialization !== "All" &&
        row.primarySpecialization !== filters.specialization
      )
        return false;
      if (filters.gender !== "All" && row.gender !== filters.gender)
        return false;
      if (
        filters.regDateFrom &&
        new Date(row.joinedDate) < new Date(filters.regDateFrom)
      )
        return false;
      if (
        filters.regDateTo &&
        new Date(row.joinedDate) > new Date(filters.regDateTo)
      )
        return false;
      return true;
    });
  }, [rows, statusFilter, typeFilter, filters]);

  const resetFilters = () => {
    setStatusFilter("All Status");
    setTypeFilter("All Types");
    setFilters({
      department: "All",
      specialization: "All",
      gender: "All",
      regDateFrom: "",
      regDateTo: "",
    });
  };

  /* ── columns ── */
  const columns = React.useMemo<CommonColumn<DoctorRow>[]>(
    () => [
      {
        field: "name",
        headerName: "Doctor",
        flex: 1,
        headerAlign: "center",
        renderCell: (row: DoctorRow) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 36,
                height: 36,
                fontSize: 13,
                fontWeight: 700,
                bgcolor: getAvatarColor(row.firstName),
                flexShrink: 0,
              }}
            >
              {row.firstName?.[0]}
              {row.lastName?.[0]}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{ fontSize: "0.875rem", fontWeight: 700, lineHeight: 1.3 }}
              >
                {row.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", lineHeight: 1.2 }}
              >
                {row.primarySpecialization}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        field: "designation",
        headerName: "Designation",
      },
      {
        field: "department",
        headerName: "Department",
      },
      {
        field: "doctorType",
        headerName: "Type",
        align: "center",
        headerAlign: "center",
        width: 130,
        renderCell: (row: DoctorRow) => (
          <Chip
            label={row.doctorType}
            size="small"
            variant="outlined"
            color={row.doctorType === "Consultant" ? "primary" : "default"}
          />
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 160,
        align: "center",
        headerAlign: "center",
        renderCell: (row: DoctorRow) => (
          <Stack spacing={0.4} alignItems="center">
            <Chip
              label={row.status}
              size="small"
              color={statusColors[row.status]}
              variant={row.status === "Inactive" ? "outlined" : "filled"}
            />
            {row.telemedicine && (
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
        field: "availableDays",
        headerName: "Schedule",
        width: 210,
        renderCell: (row: DoctorRow) => <DaysBadge days={row.availableDays} />,
      },
      {
        field: "todayAppointments",
        headerName: "Today",
        width: 80,
        align: "center",
        renderCell: (row: DoctorRow) => (
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            justifyContent="center"
          >
            <EventNoteIcon sx={{ fontSize: 13, color: "text.secondary" }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {row.todayAppointments}
            </Typography>
          </Stack>
        ),
      },
      {
        field: "rating",
        headerName: "Rating",
        width: 80,
        align: "center",
        renderCell: (row: DoctorRow) => <RatingBadge rating={row.rating} />,
      },
      {
        field: "mobile",
        headerName: "Contact",
        width: 148,
      },
      {
        field: "joinedDate",
        headerName: "Joined",
        width: 110,
        valueGetter: (row) =>
          row.joinedDate
            ? new Date(row.joinedDate).toLocaleDateString("en-IN")
            : "—",
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 60,
        align: "center",
        renderCell: (row: DoctorRow) => (
          <IconButton
            size="small"
            onClick={(e: React.MouseEvent<HTMLElement>) =>
              handleMenuOpen(e, row)
            }
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

  /* ── render ── */
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      {/* Page Header */}
      <WorkspaceHeaderCard sx={{ borderRadius: '22px' }}>
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
                label="Medical Staff"
                sx={{ fontWeight: 600 }}
              />
              <Chip
                size="small"
                variant="outlined"
                label="OPD + Telemedicine"
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
              Doctor List
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comprehensive registry of active consultants, specialists, and
              telehealth practitioners.
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={1.25}
            flexWrap="wrap"
            alignItems="center"
          >
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
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push("/doctors/registration")}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                boxShadow:
                  "0 4px 12px " + alpha(theme.palette.primary.main, 0.25),
              }}
            >
              Add Doctor
            </Button>
          </Stack>
        </Stack>
      </WorkspaceHeaderCard>

      {/* Stat Cards */}
      <Box
        sx={{
          display: "grid",
          gap: 1.25,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
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

      {/* Doctor Registry Table */}
      <Box>
        <SimpleDataGrid<DoctorRow>
          columns={columns}
          rows={filteredRows}
          getRowId={(row) => row.id}
          showSerialNo={true}
          searchPlaceholder="Search doctor, specialization, ID…"
          searchFields={[
            "name",
            "doctorId",
            "primarySpecialization",
            "department",
            "mobile",
            "email",
          ]}
          filterDropdowns={[]}
          defaultRowsPerPage={10}
          onRowClick={(row) => {
            setSelectedDoctor(row);
            setDetailsOpen(true);
          }}
          emptyTitle="No doctors found"
          emptyDescription="Try adjusting your filters or search term."
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
            </Stack>
          }
        />
      </Box>

      {/* ── Filter Drawer ── */}
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
            {/* Status */}
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e: SelectChangeEvent<unknown>) =>
                  setStatusFilter(e.target.value as string)
                }
              >
                {[
                  "All Status",
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

            {/* Doctor Type */}
            <FormControl fullWidth size="small">
              <InputLabel>Doctor Type</InputLabel>
              <Select
                label="Doctor Type"
                value={typeFilter}
                onChange={(e: SelectChangeEvent<unknown>) =>
                  setTypeFilter(e.target.value as string)
                }
              >
                {[
                  "All Types",
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

            {/* Department */}
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

      {/* ── Doctor Detail Drawer ── */}
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
          {/* Header */}
          <Box
            sx={{
              px: 2.5,
              py: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary?.main ?? theme.palette.primary.dark})`,
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

          {/* Body */}
          <Box sx={{ flex: 1, overflow: "auto", p: 2.5 }}>
            {selectedDoctor ? (
              <Stack spacing={2}>
                {/* Identity */}
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
                        Designation:
                      </Box>{" "}
                      {selectedDoctor.designation}
                    </Typography>
                    <Typography variant="body2">
                      <Box component="span" sx={{ fontWeight: 600 }}>
                        Qualifications:
                      </Box>{" "}
                      {selectedDoctor.qualifications}
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
                      {selectedDoctor.languages ?? "—"}
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

                {/* Metrics */}
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {[
                    {
                      label: "Total Patients",
                      value: selectedDoctor.totalPatients,
                    },
                    {
                      label: "Today's Appts",
                      value: selectedDoctor.todayAppointments,
                    },
                    {
                      label: "Rating",
                      value: `${selectedDoctor.rating.toFixed(1)} ⭐`,
                    },
                    {
                      label: "Fee",
                      value: `₹${selectedDoctor.consultationFee.toLocaleString("en-IN")}`,
                    },
                    {
                      label: "Joined",
                      value: new Date(
                        selectedDoctor.joinedDate,
                      ).toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                      }),
                    },
                  ].map((item) => (
                    <Box
                      key={item.label}
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        flex: 1,
                        minWidth: 80,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {item.label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Stack>

                <Divider />

                {/* Actions */}
                <Stack spacing={1}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() =>
                      router.push(
                        `/doctors/profile?doctorId=${encodeURIComponent(selectedDoctor.doctorId)}`,
                      )
                    }
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

      {/* ── Row Action Menu ── */}
      <Menu
        anchorEl={actionMenu?.anchor}
        open={Boolean(actionMenu)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 190,
            borderRadius: 2,
            mt: 0.5,
            "& .MuiMenuItem-root": {
              py: 1,
              px: 1.5,
              fontSize: "0.875rem",
              gap: 1.25,
              borderRadius: 1,
              mx: 0.5,
              mb: 0.25,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (actionMenu) {
              setSelectedDoctor(actionMenu.row);
              setDetailsOpen(true);
            }
            handleMenuClose();
          }}
        >
          <ListItemIcon sx={{ minWidth: 0 }}>
            <VisibilityIcon sx={{ fontSize: 17, color: "primary.main" }} />
          </ListItemIcon>
          <ListItemText primary="View Profile" />
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (actionMenu)
              setSnackbar(`Edit doctor ${actionMenu.row.name} (stub)`);
            handleMenuClose();
          }}
        >
          <ListItemIcon sx={{ minWidth: 0 }}>
            <EditIcon sx={{ fontSize: 17, color: "text.secondary" }} />
          </ListItemIcon>
          <ListItemText primary="Edit Doctor" />
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (actionMenu)
              setSnackbar(`View schedule for ${actionMenu.row.name} (stub)`);
            handleMenuClose();
          }}
        >
          <ListItemIcon sx={{ minWidth: 0 }}>
            <CalendarMonthIcon sx={{ fontSize: 17, color: "text.secondary" }} />
          </ListItemIcon>
          <ListItemText primary="View Schedule" />
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem
          onClick={() => {
            if (actionMenu)
              setConfirmAction({
                title: "Delete Doctor",
                description: `Are you sure you want to delete ${actionMenu.row.name}? This action cannot be undone.`,
                onConfirm: () =>
                  setSnackbar(`Deleted ${actionMenu.row.name} (stub)`),
              });
            handleMenuClose();
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon sx={{ minWidth: 0 }}>
            <DeleteOutlineIcon sx={{ fontSize: 17, color: "error.main" }} />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>

      {/* Snackbar */}
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

      {/* Confirm Dialog */}
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
