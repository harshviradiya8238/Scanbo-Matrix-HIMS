"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Snackbar,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Shield as ShieldIcon,
  Group as GroupIcon,
  FilterList as FilterListIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  AccessTime as AccessTimeIcon,
  CancelOutlined as CancelOutlinedIcon,
  ListAlt as ListAltIcon,
} from "@mui/icons-material";
import { alpha, styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { WorkspaceHeaderCard, StatTile } from "@/src/ui/components/molecules";
import { cardShadow } from "@/src/core/theme/tokens";

const Card = styled(Paper)({
  backgroundColor: "#FFFFFF",
  border: "1px solid #E3EAF3",
  borderRadius: 12,
  boxShadow: "0 1px 4px rgba(27,43,80,0.06)",
  overflow: "hidden",
});

const SectionTag = styled(Typography)({
  fontSize: "0.68rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#9BAAC3",
  marginBottom: 3,
});

const ScrollBox = styled(Box)({
  overflowY: "auto",
  "&::-webkit-scrollbar": { width: 5 },
  "&::-webkit-scrollbar-track": { background: "transparent" },
  "&::-webkit-scrollbar-thumb": { background: "#CBD5E1", borderRadius: 4 },
  "&::-webkit-scrollbar-thumb:hover": { background: "#94A3B8" },
});

const MonoTag = styled(Box)({
  display: "inline-flex",
  alignItems: "center",
  padding: "2px 8px",
  borderRadius: 5,
  backgroundColor: "#F4F7FB",
  border: "1px solid #E3EAF3",
  fontFamily: "monospace",
  fontSize: "0.7rem",
  color: "#4B5E82",
  fontWeight: 500,
  whiteSpace: "nowrap",
});

const PageShell = styled(Box)({
  // minHeight: "100vh",
  padding: 24,
});

interface GroupTagProps {
  accent: string;
}
const GroupTag = styled(Box, {
  shouldForwardProp: (p) => p !== "accent",
})<GroupTagProps>(({ accent }) => ({
  display: "inline-flex",
  alignItems: "center",
  padding: "2px 8px",
  borderRadius: 20,
  fontSize: "0.68rem",
  fontWeight: 700,
  color: accent,
  backgroundColor: alpha(accent, 0.09),
  border: `1px solid ${alpha(accent, 0.2)}`,
  whiteSpace: "nowrap",
}));

// ─── Static data ─────────────────────────────────────────────────────────────

const MOCK_ROLES = [
  {
    id: "HOSPITAL_ADMIN",
    label: "Hospital Admin",
    description: "Full system access",
    isSystem: true,
    isActive: true,
    permissions: ["*"],
  },
  {
    id: "DOCTOR",
    label: "Doctor",
    description: "Clinical access and patient management",
    isSystem: true,
    isActive: true,
    permissions: [
      "clinical.read",
      "patients.read",
      "patients.write",
      "appointments.read",
      "orders.read",
      "orders.write",
    ],
  },
  {
    id: "NURSE",
    label: "Nurse",
    description: "Patient care and vitals management",
    isSystem: false,
    isActive: true,
    permissions: ["clinical.read", "patients.read", "appointments.read"],
  },
  {
    id: "PHARMACIST",
    label: "Pharmacist",
    description: "Pharmacy and medication management",
    isSystem: false,
    isActive: true,
    permissions: ["pharmacy.read", "pharmacy.write", "orders.read"],
  },
  {
    id: "RECEPTIONIST",
    label: "Receptionist",
    description: "Front desk and scheduling",
    isSystem: false,
    isActive: true,
    permissions: ["scheduling.read", "scheduling.write", "patients.read"],
  },
  {
    id: "BILLING_STAFF",
    label: "Billing Staff",
    description: "Revenue and billing operations",
    isSystem: false,
    isActive: false,
    permissions: ["billing.read", "billing.write", "revenue_cycle.read"],
  },
];

const ALL_PERMISSIONS = [
  {
    key: "clinical.read",
    group: "clinical",
    feature: "Clinical Records",
    action: "read",
  },
  {
    key: "clinical.write",
    group: "clinical",
    feature: "Clinical Records",
    action: "write",
  },
  {
    key: "patients.read",
    group: "patients",
    feature: "Patient Records",
    action: "read",
  },
  {
    key: "patients.write",
    group: "patients",
    feature: "Patient Records",
    action: "write",
  },
  {
    key: "appointments.read",
    group: "appointments",
    feature: "Appointments",
    action: "read",
  },
  {
    key: "appointments.write",
    group: "appointments",
    feature: "Appointments",
    action: "write",
  },
  { key: "orders.read", group: "orders", feature: "Orders", action: "read" },
  { key: "orders.write", group: "orders", feature: "Orders", action: "write" },
  {
    key: "pharmacy.read",
    group: "pharmacy",
    feature: "Pharmacy",
    action: "read",
  },
  {
    key: "pharmacy.write",
    group: "pharmacy",
    feature: "Pharmacy",
    action: "write",
  },
  { key: "billing.read", group: "billing", feature: "Billing", action: "read" },
  {
    key: "billing.write",
    group: "billing",
    feature: "Billing",
    action: "write",
  },
  {
    key: "revenue_cycle.read",
    group: "revenue_cycle",
    feature: "Revenue Cycle",
    action: "read",
  },
  {
    key: "scheduling.read",
    group: "scheduling",
    feature: "Scheduling",
    action: "read",
  },
  {
    key: "scheduling.write",
    group: "scheduling",
    feature: "Scheduling",
    action: "write",
  },
  {
    key: "radiology.read",
    group: "radiology",
    feature: "Radiology",
    action: "read",
  },
  {
    key: "radiology.write",
    group: "radiology",
    feature: "Radiology",
    action: "write",
  },
  {
    key: "laboratory.read",
    group: "laboratory",
    feature: "Laboratory",
    action: "read",
  },
  {
    key: "laboratory.write",
    group: "laboratory",
    feature: "Laboratory",
    action: "write",
  },
  { key: "reports.read", group: "reports", feature: "Reports", action: "read" },
  {
    key: "admin.audit.read",
    group: "admin",
    feature: "Audit Logs",
    action: "read",
  },
  {
    key: "staff.users.write",
    group: "staff",
    feature: "User Management",
    action: "write",
  },
  {
    key: "staff.roles.write",
    group: "staff",
    feature: "Role Management",
    action: "write",
  },
];

const GROUP_COLORS: Record<string, string> = {
  clinical: "#7C5CFC",
  patients: "#3B7DD8",
  appointments: "#10B981",
  orders: "#F59E0B",
  pharmacy: "#EC4899",
  billing: "#0891B2",
  revenue_cycle: "#0891B2",
  scheduling: "#16A34A",
  radiology: "#8B5CF6",
  laboratory: "#EA580C",
  reports: "#6366F1",
  admin: "#EF4444",
  staff: "#374151",
};

const toLabel = (s: string) =>
  s.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// ─── Page ───────────────────────────────────────────────────────────────────

export default function RolesPermissionsPage() {
  const [roles, setRoles] = React.useState(MOCK_ROLES);
  const [selectedRoleId, setSelectedRoleId] = React.useState(MOCK_ROLES[0].id);
  const [roleForm, setRoleForm] = React.useState({
    label: "",
    description: "",
    isActive: true,
  });
  const [moduleFilter, setModuleFilter] = React.useState("all");
  const [featureSearch, setFeatureSearch] = React.useState("");
  const [assignedSearch, setAssignedSearch] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [roleSearch, setRoleSearch] = React.useState("");
  const [viewAllOpen, setViewAllOpen] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [createDraft, setCreateDraft] = React.useState({
    label: "",
    description: "",
    cloneFromId: "",
  });
  const [reassignTo, setReassignTo] = React.useState("");
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info",
  });

  const selectedRole = React.useMemo(
    () => roles.find((r) => r.id === selectedRoleId) ?? roles[0],
    [roles, selectedRoleId],
  );
  const fullAccess = selectedRole?.permissions.includes("*") ?? false;

  React.useEffect(() => {
    if (!selectedRole) return;
    setRoleForm({
      label: selectedRole.label,
      description: selectedRole.description,
      isActive: selectedRole.isActive,
    });
    setSelected(new Set());
  }, [selectedRole?.id]);

  const roleDirty =
    selectedRole &&
    (roleForm.label.trim() !== selectedRole.label ||
      roleForm.description.trim() !== selectedRole.description ||
      roleForm.isActive !== selectedRole.isActive);

  const assignedPerms = fullAccess
    ? []
    : ALL_PERMISSIONS.filter((p) => selectedRole?.permissions.includes(p.key));
  const availablePerms = fullAccess
    ? []
    : ALL_PERMISSIONS.filter((p) => !selectedRole?.permissions.includes(p.key));

  const filteredAvailable = availablePerms.filter((p) => {
    if (moduleFilter !== "all" && p.group !== moduleFilter) return false;
    if (
      featureSearch &&
      !p.feature.toLowerCase().includes(featureSearch.toLowerCase()) &&
      !p.key.toLowerCase().includes(featureSearch.toLowerCase())
    )
      return false;
    return true;
  });

  const filteredAssigned = assignedPerms.filter((p) => {
    if (!assignedSearch) return true;
    return (
      p.feature.toLowerCase().includes(assignedSearch.toLowerCase()) ||
      p.key.toLowerCase().includes(assignedSearch.toLowerCase())
    );
  });

  const filteredRoles = roles.filter(
    (r) =>
      !roleSearch || r.label.toLowerCase().includes(roleSearch.toLowerCase()),
  );

  const visibleKeys = filteredAvailable.map((p) => p.key);
  const allVisSelected =
    visibleKeys.length > 0 && visibleKeys.every((k) => selected.has(k));
  const someVisSelected = visibleKeys.some((k) => selected.has(k));

  const notify = (
    message: string,
    severity: "success" | "error" | "info" = "success",
  ) => setSnackbar({ open: true, message, severity });

  const updateRole = (id: string, patch: Partial<(typeof MOCK_ROLES)[0]>) =>
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const handleSave = () => {
    if (!roleForm.label.trim())
      return notify("Role name is required.", "error");
    updateRole(selectedRole!.id, {
      label: roleForm.label,
      description: roleForm.description,
      isActive: roleForm.isActive,
    });
    notify("Role updated successfully.");
  };

  const handleToggleFullAccess = () =>
    updateRole(selectedRole!.id, { permissions: fullAccess ? [] : ["*"] });

  const handleAssign = () => {
    if (!selectedRole || selected.size === 0) return;
    const next = new Set(selectedRole.permissions);
    selected.forEach((k) => next.add(k));
    updateRole(selectedRole.id, { permissions: Array.from(next) });
    setSelected(new Set());
    notify("Privileges assigned successfully.");
  };

  const handleRemove = (key: string) => {
    if (!selectedRole) return;
    updateRole(selectedRole.id, {
      permissions: selectedRole.permissions.filter((p) => p !== key),
    });
  };

  const handleCreate = () => {
    if (!createDraft.label.trim())
      return notify("Role name is required.", "error");
    const id =
      createDraft.label.toUpperCase().replace(/\s+/g, "_") + "_" + Date.now();
    const cloneFrom = roles.find((r) => r.id === createDraft.cloneFromId);
    setRoles((prev) => [
      ...prev,
      {
        id,
        label: createDraft.label,
        description: createDraft.description,
        isSystem: false,
        isActive: true,
        permissions: cloneFrom ? [...cloneFrom.permissions] : [],
      },
    ]);
    setSelectedRoleId(id);
    setCreateOpen(false);
    notify("New role created.");
  };

  const handleDelete = () => {
    if (!selectedRole || selectedRole.isSystem) return;
    setRoles((prev) => prev.filter((r) => r.id !== selectedRole.id));
    setSelectedRoleId(roles.find((r) => r.id !== selectedRole.id)?.id ?? "");
    setDeleteOpen(false);
    notify("Role deleted.", "info");
  };

  const groups = Array.from(
    new Set(ALL_PERMISSIONS.map((p) => p.group)),
  ).sort();
  const totalRoles = roles.length;
  const activeRoles = roles.filter((r) => r.isActive).length;
  const systemRoles = roles.filter((r) => r.isSystem).length;
  const customRoles = roles.filter((r) => !r.isSystem).length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <PageShell>
        {/* Header */}
        <WorkspaceHeaderCard sx={{ mb: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2.5,
                  background: "#1172BA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 3px 10px rgba(59,125,216,0.32)",
                }}
              >
                <AdminPanelSettingsIcon sx={{ color: "#fff", fontSize: 20 }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: "primary.main",
                    lineHeight: 1.15,
                    fontSize: "1rem",
                    fontWeight: 800,
                  }}
                >
                  Role Management
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Manage roles &amp; assign granular permissions
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setViewAllOpen(true)}
                sx={{
                  borderColor: "rgba(17, 114, 186, 0.24)",
                  color: "#6B7A99",
                  fontSize: "0.77rem",
                  "&:hover": {
                    borderColor: "#3B7DD8",
                    color: "#3B7DD8",
                    bgcolor: alpha("#3B7DD8", 0.04),
                  },
                }}
              >
                View All Roles
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon sx={{ fontSize: 15 }} />}
                onClick={() => {
                  setCreateDraft({
                    label: "",
                    description: "",
                    cloneFromId: selectedRole?.id ?? "",
                  });
                  setCreateOpen(true);
                }}
                sx={{ bgcolor: "#1172BA", fontSize: "0.77rem" }}
              >
                Create Role
              </Button>
            </Stack>
          </Stack>
        </WorkspaceHeaderCard>

        {/* Stat cards — replaced with StatTile */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 2,
            mb: 2,
          }}
        >
          {[
            {
              label: "Total Roles",
              value: totalRoles,
              tone: "info",
              icon: <ListAltIcon />,
            },
            {
              label: "Custom",
              value: customRoles,
              tone: "warning",
              icon: <AccessTimeIcon />,
            },
            {
              label: "Active",
              value: activeRoles,
              tone: "success",
              icon: <CheckCircleOutlineIcon />,
            },
            {
              label: "System",
              value: systemRoles,
              tone: "error",
              icon: <CancelOutlinedIcon />,
            },
          ].map((s) => (
            <StatTile
              key={s.label}
              label={s.label}
              value={s.value}
              tone={s.tone as any}
              icon={s.icon}
              variant="soft"
            />
          ))}
        </Box>

        {/* Role config card */}
        <Card sx={{ mb: 2, p: 2 }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={1.5}>
            <Box>
              <SectionTag>Role Configuration</SectionTag>
              <Typography variant="subtitle2" sx={{ color: '#1A2332', fontSize: '0.84rem' }}>
                Update role details and access level
              </Typography>
            </Box>
            {selectedRole && (
              <Stack direction="row" spacing={0.75}>
                <Chip size="small" label={selectedRole.isSystem ? 'System' : 'Custom'}
                  sx={{ bgcolor: alpha(selectedRole.isSystem ? '#7C5CFC' : '#3B7DD8', 0.1),
                        color: selectedRole.isSystem ? '#7C5CFC' : '#3B7DD8',
                        border: `1px solid ${alpha(selectedRole.isSystem ? '#7C5CFC' : '#3B7DD8', 0.2)}` }} />
                <Chip size="small" label={selectedRole.isActive ? 'Active' : 'Inactive'}
                  sx={{ bgcolor: alpha(selectedRole.isActive ? '#10B981' : '#94A3B8', 0.1),
                        color: selectedRole.isActive ? '#10B981' : '#94A3B8',
                        border: `1px solid ${alpha(selectedRole.isActive ? '#10B981' : '#94A3B8', 0.2)}` }} />
                {fullAccess && (
                  <Chip size="small" label="Full Access"
                    sx={{ bgcolor: alpha('#F59E0B', 0.1), color: '#D97706', border: `1px solid ${alpha('#F59E0B', 0.25)}` }} />
                )}
              </Stack>
            )}
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} alignItems={{ md: 'center' }}>
            <TextField
              select label="Role"
              value={selectedRole?.id ?? ''}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><ShieldIcon sx={{ fontSize: 14, color: '#9BAAC3' }} /></InputAdornment> }}
            >
              {roles.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: r.isActive ? '#10B981' : '#CBD5E1', flexShrink: 0 }} />
                    <Typography variant="body2">{r.label}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Role Name" placeholder="e.g., Finance Manager"
              value={roleForm.label}
              onChange={(e) =>
                setRoleForm((p) => ({ ...p, label: e.target.value }))
              }
              disabled={!selectedRole}
            />

            <TextField
              label="Description"
              placeholder="Describe key responsibilities"
              value={roleForm.description}
              onChange={(e) =>
                setRoleForm((p) => ({ ...p, description: e.target.value }))
              }
              disabled={!selectedRole}
              sx={{ flex: 1 }}
            />

            <Stack direction="row" alignItems="center">
              <Tooltip title="Active roles can be assigned to users">
                <FormControlLabel
                  sx={{ mr: 0.5 }}
                  control={
                    <Switch
                      size="small"
                      checked={roleForm.isActive}
                      onChange={(e) =>
                        setRoleForm((p) => ({
                          ...p,
                          isActive: e.target.checked,
                        }))
                      }
                      disabled={!selectedRole}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "#4B5E82",
                        fontSize: "0.77rem",
                      }}
                    >
                      Active
                    </Typography>
                  }
                />
              </Tooltip>
              <Tooltip title="Grant unrestricted access to all features">
                <FormControlLabel
                  sx={{ mr: 0 }}
                  control={
                    <Checkbox
                      size="small"
                      checked={fullAccess}
                      onChange={handleToggleFullAccess}
                      disabled={!selectedRole}
                      sx={{ "&.Mui-checked": { color: "#F59E0B" } }}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "#4B5E82",
                        fontSize: "0.77rem",
                      }}
                    >
                      Full Access
                    </Typography>
                  }
                />
              </Tooltip>
            </Stack>

            <Stack direction="row" spacing={0.75} flexShrink={0}>
              <Button
                variant="contained"
                size="small"
                onClick={handleSave}
                disabled={!selectedRole || !roleDirty}
                sx={{ px: 2, bgcolor: "#3B7DD8", fontSize: "0.77rem" }}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="error"
                startIcon={<DeleteIcon sx={{ fontSize: 14 }} />}
                onClick={() => {
                  setReassignTo(
                    roles.find((r) => r.id !== selectedRole?.id)?.id ?? "",
                  );
                  setDeleteOpen(true);
                }}
                disabled={!selectedRole || selectedRole.isSystem}
                sx={{
                  fontSize: "0.77rem",
                  borderColor: alpha("#EF4444", 0.35),
                  "&:hover": {
                    borderColor: "#EF4444",
                    bgcolor: alpha("#EF4444", 0.04),
                  },
                }}
              >
                Delete
              </Button>
            </Stack>
          </Stack>
        </Card>

        {/* Two-column permissions */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ height: 600 }}
        >
          {/* Left — Available */}
          <Card
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 2,
                pt: 1.75,
                pb: 1.5,
                borderBottom: "1px solid #F0F4FA",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={1}
              >
                <Box>
                  <SectionTag>Available Privileges</SectionTag>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "#1A2332", fontSize: "0.82rem" }}
                  >
                    Select &amp; assign to{" "}
                    <strong>{selectedRole?.label}</strong>
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={`${filteredAvailable.length} available`}
                  sx={{
                    bgcolor: alpha("#3B7DD8", 0.08),
                    color: "#3B7DD8",
                    border: `1px solid ${alpha("#3B7DD8", 0.15)}`,
                  }}
                />
              </Stack>

              <Stack direction="row" spacing={1}>
                <TextField
                  select
                  label="Module"
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  disabled={!selectedRole || fullAccess}
                  sx={{ flex: "0 0 44%" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FilterListIcon
                          sx={{ fontSize: 14, color: "#9BAAC3" }}
                        />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="all">
                    <Typography variant="body2">All Modules</Typography>
                  </MenuItem>
                  {groups.map((g) => (
                    <MenuItem key={g} value={g}>
                      <Typography variant="body2">{toLabel(g)}</Typography>
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                fullWidth
                  label="Search"
                  placeholder="Feature or key..."
                  value={featureSearch}
                  onChange={(e) => setFeatureSearch(e.target.value)}
                  disabled={!selectedRole || fullAccess}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 14, color: "#9BAAC3" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </Box>

            {fullAccess && (
              <Alert
                severity="info"
                icon={false}
                sx={{
                  m: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  fontSize: "0.77rem",
                  bgcolor: alpha("#3B7DD8", 0.06),
                  color: "#2563EB",
                  border: `1px solid ${alpha("#3B7DD8", 0.15)}`,
                }}
              >
                Full access enabled — disable to assign granular privileges.
              </Alert>
            )}

            <ScrollBox sx={{ flex: 1 }}>
              <TableContainer>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 44, px: 1.5 }}>
                        <Checkbox
                          size="small"
                          checked={allVisSelected}
                          indeterminate={!allVisSelected && someVisSelected}
                          onChange={() => {
                            const next = new Set(selected);
                            if (allVisSelected)
                              visibleKeys.forEach((k) => next.delete(k));
                            else visibleKeys.forEach((k) => next.add(k));
                            setSelected(next);
                          }}
                          disabled={
                            !selectedRole ||
                            fullAccess ||
                            filteredAvailable.length === 0
                          }
                        />
                      </TableCell>
                      <TableCell>Feature</TableCell>
                      <TableCell>Permission Key</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAvailable.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          sx={{ textAlign: "center", py: 5 }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {fullAccess
                              ? "Full access active"
                              : "No permissions available"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAvailable.map((perm) => {
                        const color = GROUP_COLORS[perm.group] ?? "#6B7A99";
                        const isChecked = selected.has(perm.key);
                        return (
                          <TableRow
                            key={perm.key}
                            selected={isChecked}
                            sx={{ cursor: "pointer" }}
                            onClick={() => {
                              const next = new Set(selected);
                              next.has(perm.key)
                                ? next.delete(perm.key)
                                : next.add(perm.key);
                              setSelected(next);
                            }}
                          >
                            <TableCell
                              sx={{ px: 1.5 }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Checkbox
                                size="small"
                                checked={isChecked}
                                onChange={() => {
                                  const next = new Set(selected);
                                  next.has(perm.key)
                                    ? next.delete(perm.key)
                                    : next.add(perm.key);
                                  setSelected(next);
                                }}
                                disabled={!selectedRole || fullAccess}
                              />
                            </TableCell>
                            <TableCell>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                              >
                                <Box
                                  sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    bgcolor: color,
                                    flexShrink: 0,
                                  }}
                                />
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 600, color: "#1A2332" }}
                                  >
                                    {perm.feature}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ color, fontWeight: 600 }}
                                  >
                                    {toLabel(perm.group)}
                                  </Typography>
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <MonoTag>{perm.key}</MonoTag>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </ScrollBox>

            <Box
              sx={{
                px: 2,
                py: 1.25,
                borderTop: "1px solid #F0F4FA",
                bgcolor: "#FAFBFD",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="caption" color="text.secondary">
                  {selected.size > 0
                    ? `${selected.size} privilege${selected.size > 1 ? "s" : ""} selected`
                    : "Check rows to select"}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                  onClick={handleAssign}
                  disabled={!selectedRole || fullAccess || selected.size === 0}
                  sx={{ bgcolor: "#3B7DD8", fontSize: "0.76rem", px: 1.75 }}
                >
                  Assign{selected.size > 0 ? ` (${selected.size})` : ""}
                </Button>
              </Stack>
            </Box>
          </Card>

          {/* Right — Configured */}
          <Card
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 2,
                pt: 1.75,
                pb: 1.5,
                borderBottom: "1px solid #F0F4FA",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={1}
              >
                <Box>
                  <SectionTag>Configured Privileges</SectionTag>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "#1A2332", fontSize: "0.82rem" }}
                  >
                    Currently granted to <strong>{selectedRole?.label}</strong>
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={
                    fullAccess
                      ? "Full Access"
                      : `${assignedPerms.length} granted`
                  }
                  sx={{
                    bgcolor: fullAccess
                      ? alpha("#F59E0B", 0.12)
                      : alpha("#10B981", 0.1),
                    color: fullAccess ? "#D97706" : "#10B981",
                    border: `1px solid ${alpha(fullAccess ? "#F59E0B" : "#10B981", 0.22)}`,
                    fontWeight: 700,
                  }}
                />
              </Stack>
              <TextField
                placeholder="Search assigned privileges..."
                value={assignedSearch}
                fullWidth
                onChange={(e) => setAssignedSearch(e.target.value)}
                disabled={!selectedRole || fullAccess}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 14, color: "#9BAAC3" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {fullAccess && (
              <Alert
                severity="warning"
                icon={false}
                sx={{
                  m: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  fontSize: "0.77rem",
                  bgcolor: alpha("#F59E0B", 0.08),
                  color: "#92400E",
                  border: `1px solid ${alpha("#F59E0B", 0.25)}`,
                }}
              >
                Full access grants all permissions including future ones.
              </Alert>
            )}

            <ScrollBox sx={{ flex: 1 }}>
              <TableContainer>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Module</TableCell>
                      <TableCell>Feature</TableCell>
                      <TableCell>Key</TableCell>
                      <TableCell sx={{ width: 44 }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAssigned.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          sx={{ textAlign: "center", py: 5 }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {fullAccess
                              ? "Full access — all permissions granted"
                              : "No privileges assigned yet"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAssigned.map((perm) => {
                        const color = GROUP_COLORS[perm.group] ?? "#6B7A99";
                        return (
                          <TableRow key={perm.key}>
                            <TableCell>
                              <GroupTag accent={color}>
                                {toLabel(perm.group)}
                              </GroupTag>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, color: "#1A2332" }}
                              >
                                {perm.feature}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <MonoTag>{perm.key}</MonoTag>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Remove privilege">
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemove(perm.key)}
                                  disabled={!selectedRole || fullAccess}
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    color: "#C4CEDE",
                                    "&:hover": {
                                      color: "#EF4444",
                                      bgcolor: alpha("#EF4444", 0.08),
                                    },
                                  }}
                                >
                                  <CloseIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </ScrollBox>

            {!fullAccess && filteredAssigned.length > 0 && (
              <Box
                sx={{
                  px: 2,
                  py: 1.25,
                  borderTop: "1px solid #F0F4FA",
                  bgcolor: "#FAFBFD",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {filteredAssigned.length} privilege
                  {filteredAssigned.length !== 1 ? "s" : ""} configured
                </Typography>
              </Box>
            )}
          </Card>
        </Stack>

        {/* ── Dialogs ── */}

        {/* View All */}
        <Dialog
          open={viewAllOpen}
          onClose={() => setViewAllOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ pb: 0.5 }}>
            <Typography variant="h6" sx={{ fontSize: "1rem" }}>
              All Roles
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {roles.length} roles configured
            </Typography>
          </DialogTitle>
          <DialogContent>
            <TextField
              placeholder="Search roles..."
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              sx={{ mb: 1.5, mt: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 14, color: "#9BAAC3" }} />
                  </InputAdornment>
                ),
              }}
            />
            <List
              dense
              sx={{
                bgcolor: "#F7F9FD",
                borderRadius: 2,
                border: "1px solid #E3EAF3",
                p: 0.5,
              }}
            >
              {filteredRoles.map((role) => (
                <ListItemButton
                  key={role.id}
                  selected={role.id === selectedRole?.id}
                  onClick={() => {
                    setSelectedRoleId(role.id);
                    setViewAllOpen(false);
                  }}
                  sx={{ borderRadius: 2, mb: 0.25, py: 0.75 }}
                >
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      bgcolor: role.isActive ? "#10B981" : "#CBD5E1",
                      mr: 1.5,
                      flexShrink: 0,
                    }}
                  />
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {role.label}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {role.description}
                      </Typography>
                    }
                  />
                  <Chip
                    size="small"
                    label={
                      role.permissions.includes("*")
                        ? "Full Access"
                        : `${role.permissions.length} perms`
                    }
                    sx={{
                      ml: 1,
                      bgcolor: role.permissions.includes("*")
                        ? alpha("#F59E0B", 0.1)
                        : "#F4F7FB",
                      color: role.permissions.includes("*")
                        ? "#D97706"
                        : "#6B7A99",
                      border: `1px solid ${role.permissions.includes("*") ? alpha("#F59E0B", 0.25) : "#E3EAF3"}`,
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setViewAllOpen(false)}
              sx={{ borderColor: "#E3EAF3", color: "#6B7A99" }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create */}
        <Dialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ pb: 0.5 }}>
            <Typography variant="h6" sx={{ fontSize: "1rem" }}>
              Create New Role
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Configure a custom role with specific privileges
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={1.75} sx={{ mt: 1 }}>
              <TextField
                label="Role Name *"
                placeholder="e.g., Quality Reviewer"
                value={createDraft.label}
                onChange={(e) =>
                  setCreateDraft((p) => ({ ...p, label: e.target.value }))
                }
              />
              <TextField
                label="Description"
                placeholder="Describe key responsibilities"
                value={createDraft.description}
                onChange={(e) =>
                  setCreateDraft((p) => ({ ...p, description: e.target.value }))
                }
              />
              <TextField
                select
                label="Clone Permissions From"
                value={createDraft.cloneFromId}
                onChange={(e) =>
                  setCreateDraft((p) => ({ ...p, cloneFromId: e.target.value }))
                }
              >
                <MenuItem value="">
                  <Typography variant="body2">Start empty</Typography>
                </MenuItem>
                {roles.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    <Typography variant="body2">{r.label}</Typography>
                  </MenuItem>
                ))}
              </TextField>
              <Alert
                severity="info"
                icon={false}
                sx={{
                  py: 0.75,
                  borderRadius: 2,
                  fontSize: "0.77rem",
                  bgcolor: alpha("#3B7DD8", 0.06),
                  color: "#2563EB",
                  border: `1px solid ${alpha("#3B7DD8", 0.15)}`,
                }}
              >
                You can fine-tune permissions after the role is created.
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setCreateOpen(false)}
              sx={{ borderColor: "#E3EAF3", color: "#6B7A99" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreate}
              sx={{ bgcolor: "#3B7DD8" }}
            >
              Create Role
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete */}
        <Dialog
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ pb: 0.5 }}>
            <Typography
              variant="h6"
              sx={{ fontSize: "1rem", color: "#EF4444" }}
            >
              Delete Role
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={1.75} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Users assigned to <strong>{selectedRole?.label}</strong> must be
                reassigned before deletion.
              </Typography>
              <TextField
                select
                label="Reassign users to"
                value={reassignTo}
                onChange={(e) => setReassignTo(e.target.value)}
              >
                {roles
                  .filter((r) => r.id !== selectedRole?.id)
                  .map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      <Typography variant="body2">{r.label}</Typography>
                    </MenuItem>
                  ))}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setDeleteOpen(false)}
              sx={{ borderColor: "#E3EAF3", color: "#6B7A99" }}
            >
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={handleDelete}>
              Delete Role
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3500}
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
            sx={{
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              fontSize: "0.81rem",
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </PageShell>
  );
}
