"use client";

import * as React from "react";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
  Paper,
} from "@mui/material";
import { alpha, useTheme, styled } from "@mui/material/styles";
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PauseCircle as PauseCircleIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Shield as ShieldIcon,
  Groups as GroupsIcon,
  Lock as LockIcon,
  VerifiedUser as VerifiedUserIcon,
  MailOutline as MailOutlineIcon,
  Phone as PhoneIcon,
  BadgeOutlined as BadgeOutlinedIcon,
  BusinessCenter as BusinessCenterIcon,
  AccessTime as AccessTimeIcon,
  Close as CloseIcon,
  CheckCircleOutlined,
} from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useStaffStore, StaffUserStatus } from "@/src/core/staff/staffStore";
import { usePermission } from "@/src/core/auth/usePermission";
import { TextField } from "@/src/ui/components";
import { WorkspaceHeaderCard, StatTile } from "@/src/ui/components/molecules";
import { cardShadow } from "@/src/core/theme/tokens";
import { Grid } from "@/src/ui/components/layout";

const Card = styled(Paper)({
  backgroundColor: "#FFFFFF",
  border: "1px solid #E3EAF3",
  borderRadius: 12,
  boxShadow: cardShadow,
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

// ── Constants ─────────────────────────────────────────────────────────────────
const PERMISSION_GROUPS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "patients", label: "Patients" },
  { id: "appointments", label: "Appointments" },
  { id: "clinical", label: "Clinical" },
  { id: "ipd", label: "Inpatient" },
  { id: "orders", label: "Orders" },
  { id: "diagnostics", label: "Diagnostics" },
  { id: "pharmacy", label: "Pharmacy" },
  { id: "billing", label: "Billing" },
  { id: "inventory", label: "Inventory" },
  { id: "reports", label: "Reports" },
  { id: "admin", label: "Admin" },
  { id: "staff", label: "Staff" },
  { id: "help", label: "Help" },
];

const STATUS_STYLE: Record<
  StaffUserStatus,
  {
    label: string;
    color: string;
    bg: string;
    chipColor: "success" | "warning" | "default";
  }
> = {
  active: {
    label: "Active",
    color: "#16A34A",
    bg: "#DCFCE7",
    chipColor: "success",
  },
  invited: {
    label: "Invited",
    color: "#D97706",
    bg: "#FEF3C7",
    chipColor: "warning",
  },
  suspended: {
    label: "Suspended",
    color: "#6B7A99",
    bg: "#F1F5FB",
    chipColor: "default",
  },
};

const AVATAR_COLORS = [
  "#1172BA",
  // "#8B5CF6",
  // "#10B981",
  // "#F59E0B",
  // "#EF4444",
  // "#EC4899",
  // "#06B6D4",
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const getAvatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Box sx={{ mt: 0.2, color: "text.secondary", flexShrink: 0 }}>{icon}</Box>
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontSize: 10,
          }}
        >
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {value || "—"}
        </Typography>
      </Box>
    </Stack>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StaffUsersPage() {
  const {
    roles,
    roleMap,
    users,
    addUser,
    updateUser,
    deleteUser,
    setUserStatus,
  } = useStaffStore();
  const theme = useTheme();
  const permissionGate = usePermission();
  const canManageUsers = permissionGate([
    "staff.users.write",
    "staff.users.manage",
  ]);

  const [selectedUserId, setSelectedUserId] = React.useState<string>(
    users[0]?.id ?? "",
  );
  const [userSearch, setUserSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | StaffUserStatus
  >("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingUserId, setEditingUserId] = React.useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [userDraft, setUserDraft] = React.useState({
    name: "",
    email: "",
    phone: "",
    roleId: roles[0]?.id ?? "HOSPITAL_ADMIN",
    department: "",
    title: "",
    status: "invited" as StaffUserStatus,
  });
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info",
  });

  React.useEffect(() => {
    if (!selectedUserId && users.length > 0) setSelectedUserId(users[0].id);
  }, [users, selectedUserId]);

  const selectedUser = React.useMemo(
    () => users.find((u) => u.id === selectedUserId) ?? users[0],
    [users, selectedUserId],
  );

  const filteredUsers = React.useMemo(
    () =>
      users.filter((u) => {
        const q = userSearch.toLowerCase();
        return (
          (u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)) &&
          (roleFilter === "all" || u.roleId === roleFilter) &&
          (statusFilter === "all" || u.status === statusFilter)
        );
      }),
    [users, userSearch, roleFilter, statusFilter],
  );

  const statusCounts = React.useMemo(
    () =>
      users.reduce(
        (acc, u) => {
          acc[u.status] += 1;
          return acc;
        },
        { active: 0, invited: 0, suspended: 0 },
      ),
    [users],
  );

  const accessGroups = React.useMemo(() => {
    if (!selectedUser) return [];
    const perms = roleMap.get(selectedUser.roleId)?.permissions ?? [];
    if (perms.includes("*")) return ["Full Platform Access"];
    const groupLabels = new Map(PERMISSION_GROUPS.map((g) => [g.id, g.label]));
    const groups = new Set<string>();
    perms.forEach((p) => {
      const [g] = p.split(".");
      if (g) groups.add(groupLabels.get(g) ?? g.toUpperCase());
    });
    return Array.from(groups).slice(0, 10);
  }, [selectedUser, roleMap]);

  const handleOpenCreate = () => {
    setEditingUserId(null);
    setUserDraft({
      name: "",
      email: "",
      phone: "",
      roleId: roles[0]?.id ?? "HOSPITAL_ADMIN",
      department: "",
      title: "",
      status: "invited",
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = () => {
    if (!selectedUser) return;
    setEditingUserId(selectedUser.id);
    setUserDraft({
      name: selectedUser.name,
      email: selectedUser.email,
      phone: selectedUser.phone ?? "",
      roleId: selectedUser.roleId,
      department: selectedUser.department ?? "",
      title: selectedUser.title ?? "",
      status: selectedUser.status,
    });
    setDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (!userDraft.name.trim() || !userDraft.email.trim()) {
      setSnackbar({
        open: true,
        message: "Name and email are required.",
        severity: "error",
      });
      return;
    }
    if (editingUserId) {
      updateUser(editingUserId, { ...userDraft });
      setSnackbar({
        open: true,
        message: "User updated.",
        severity: "success",
      });
    } else {
      const newId = addUser({ ...userDraft });
      if (newId) {
        setSelectedUserId(newId);
        setSnackbar({
          open: true,
          message: "User invited successfully.",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Unable to create user.",
          severity: "error",
        });
        return;
      }
    }
    setDialogOpen(false);
  };

  const handleToggleStatus = () => {
    if (!selectedUser) return;
    const next: StaffUserStatus =
      selectedUser.status === "suspended"
        ? "active"
        : selectedUser.status === "invited"
          ? "active"
          : "suspended";
    setUserStatus(selectedUser.id, next);
    setSnackbar({
      open: true,
      message:
        next === "active"
          ? selectedUser.status === "invited"
            ? "User activated."
            : "User re-activated."
          : "User suspended.",
      severity: "info",
    });
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    deleteUser(selectedUser.id);
    setDeleteDialogOpen(false);
    setSelectedUserId("");
    setSnackbar({ open: true, message: "User removed.", severity: "info" });
  };

  const draft = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setUserDraft((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <PageTemplate
      title="User Management"
      subtitle={undefined}
      currentPageTitle="User Management"
    >
      <Stack spacing={1.25}>
        {/* ── Header ── */}
        <WorkspaceHeaderCard>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ md: "center" }}
            spacing={2}
          >
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  size="small"
                  label="Staff Directory"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    color: "primary.main",
                    fontWeight: 700,
                  }}
                />
                <Chip
                  size="small"
                  variant="outlined"
                  label={`${users.length} users`}
                  sx={{
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  }}
                />
                {!canManageUsers && (
                  <Chip
                    size="small"
                    label="Read-only"
                    sx={{
                      bgcolor: alpha(theme.palette.warning.main, 0.12),
                      color: "warning.dark",
                      fontWeight: 700,
                    }}
                  />
                )}
              </Stack>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "primary.main" }}
              >
                Staff Access &amp; User Directory
              </Typography>
            </Stack>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
              disabled={!canManageUsers}
              sx={{
                px: 3,
                py: 1.25,
                fontWeight: 700,
                fontSize: 14,
                boxShadow: cardShadow,
                whiteSpace: "nowrap",
              }}
            >
              Invite User
            </Button>
          </Stack>
        </WorkspaceHeaderCard>

        {/* ── Stat Cards ── */}
        <Grid container spacing={2}>
          <Grid xs={12} md={4}>
            <StatTile
              label="Active Users"
              value={statusCounts.active}
              subtitle="Currently enabled"
              icon={<CheckCircleIcon />}
              tone="success"
            />
          </Grid>
          <Grid xs={12} md={4}>
            {" "}
            <StatTile
              label="Pending Invites"
              value={statusCounts.invited}
              subtitle="Awaiting activation"
              icon={<MailOutlineIcon />}
              tone="warning"
            />
          </Grid>
          <Grid xs={12} md={4}>
            <StatTile
              label="Suspended"
              value={statusCounts.suspended}
              subtitle="Access disabled"
              icon={<PauseCircleIcon />}
              tone="info"
            />
          </Grid>
        </Grid>

        {/* ── Main Grid ── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "7fr 5fr" },
            gap: 2,
          }}
        >
          {/* Left: User List */}
          <Card>
            {/* List header */}
            <Box
              sx={{
                px: 2.5,
                py: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Box>
                  <SectionTag>User List</SectionTag>
                  <Typography variant="caption" color="text.secondary">
                    Filter and search staff members
                  </Typography>
                </Box>
                <Chip
                  label={`${filteredUsers.length} shown`}
                  size="small"
                  sx={{
                    bgcolor: alpha("#3B6FE8", 0.08),
                    color: "primary.main",
                    fontWeight: 600,
                  }}
                />
              </Stack>

              {/* Filters */}
              <Stack spacing={1.25}>
                <TextField
                  fullWidth
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon
                          sx={{ fontSize: 18, color: "text.secondary" }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                  <TextField
                    select
                    label="Role"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    sx={{ flex: 1 }}
                  >
                    <MenuItem value="all">All roles</MenuItem>
                    {roles.map((r) => (
                      <MenuItem key={r.id} value={r.id}>
                        {r.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    sx={{ flex: 1 }}
                  >
                    <MenuItem value="all">All statuses</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="invited">Invited</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                  </TextField>
                </Stack>
              </Stack>
            </Box>

            {/* User rows */}
            <Box sx={{ p: 2, maxHeight: 520, overflowY: "auto" }}>
              <Stack spacing={1.25}>
                {filteredUsers.map((user) => {
                  const roleLabel =
                    roleMap.get(user.roleId)?.label ?? user.roleId;
                  const s = STATUS_STYLE[user.status];
                  const isSelected = user.id === selectedUser?.id;
                  const avatarColor = getAvatarColor(user.name);
                  return (
                    <Box
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      sx={{
                        borderRadius: 2.5,
                        p: 1.75,
                        cursor: "pointer",
                        border: "1.5px solid",
                        borderColor: isSelected ? "primary.main" : "divider",
                        bgcolor: isSelected
                          ? alpha("#3B6FE8", 0.05)
                          : "background.paper",
                        transition: "all 0.15s ease",
                        "&:hover": {
                          borderColor: isSelected
                            ? "primary.main"
                            : alpha("#3B6FE8", 0.35),
                          bgcolor: isSelected
                            ? alpha("#3B6FE8", 0.05)
                            : alpha("#3B6FE8", 0.025),
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: isSelected
                              ? avatarColor
                              : alpha(avatarColor, 0.15),
                            color: isSelected ? "#fff" : avatarColor,
                            fontWeight: 700,
                            fontSize: 14,
                          }}
                        >
                          {getInitials(user.name)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography
                              variant="subtitle2"
                              noWrap
                              sx={{ fontWeight: 700 }}
                            >
                              {user.name}
                            </Typography>
                            <Chip
                              size="small"
                              label={s.label}
                              sx={{
                                height: 22,
                                fontSize: 11,
                                fontWeight: 700,
                                bgcolor: s.bg,
                                color: s.color,
                                ml: 1,
                              }}
                            />
                          </Stack>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                          >
                            {user.email}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={0.75}
                            flexWrap="wrap"
                            sx={{ mt: 0.75 }}
                          >
                            <Chip
                              size="small"
                              label={roleLabel}
                              variant="outlined"
                              sx={{
                                height: 20,
                                fontSize: 11,
                                borderColor: "divider",
                              }}
                            />
                            {user.department ? (
                              <Chip
                                size="small"
                                label={user.department}
                                sx={{
                                  height: 20,
                                  fontSize: 11,
                                  bgcolor: "background.default",
                                }}
                              />
                            ) : null}
                          </Stack>
                        </Box>
                      </Stack>
                    </Box>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <Box sx={{ py: 5, textAlign: "center" }}>
                    <GroupsIcon
                      sx={{
                        fontSize: 40,
                        color: "text.secondary",
                        mb: 1,
                        opacity: 0.4,
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      No users found. Try adjusting filters.
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </Card>

          {/* Right: Profile + Access */}
          <Stack spacing={2}>
            {/* User Profile Card */}
            <Card>
              {/* Profile header bar */}
              <Box
                sx={{
                  px: 2.5,
                  py: 2,
                  // background: selectedUser
                  //   ? `linear-gradient(135deg, ${alpha(getAvatarColor(selectedUser.name), 0.12)}, ${alpha(getAvatarColor(selectedUser.name), 0.04)})`
                  //   : "background.default",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <SectionTag>User Profile</SectionTag>
                  <Stack direction="row" spacing={0.75}>
                    <Tooltip title="Edit user">
                      <span>
                        <IconButton
                          size="small"
                          onClick={handleOpenEdit}
                          disabled={!selectedUser || !canManageUsers}
                          sx={{
                            bgcolor: alpha("#3B6FE8", 0.08),
                            "&:hover": { bgcolor: alpha("#3B6FE8", 0.15) },
                          }}
                        >
                          <EditIcon
                            fontSize="small"
                            sx={{ color: "primary.main" }}
                          />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Delete user">
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteDialogOpen(true)}
                          disabled={!selectedUser || !canManageUsers}
                          sx={{
                            bgcolor: alpha("#EF4444", 0.08),
                            "&:hover": { bgcolor: alpha("#EF4444", 0.15) },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Box>

              <Box sx={{ px: 2.5, py: 2 }}>
                {selectedUser ? (
                  <Stack spacing={2}>
                    {/* Avatar + name */}
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: getAvatarColor(selectedUser.name),
                          fontWeight: 800,
                          fontSize: 20,
                        }}
                      >
                        {getInitials(selectedUser.name)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 800 }}
                        >
                          {selectedUser.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedUser.title || "No title provided"}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          sx={{ mt: 0.75 }}
                          flexWrap="wrap"
                        >
                          <Chip
                            size="small"
                            label={
                              roleMap.get(selectedUser.roleId)?.label ??
                              selectedUser.roleId
                            }
                            sx={{
                              height: 20,
                              fontSize: 11,
                              bgcolor: alpha("#3B6FE8", 0.1),
                              color: "primary.main",
                              fontWeight: 700,
                            }}
                          />
                          <Chip
                            size="small"
                            label={STATUS_STYLE[selectedUser.status].label}
                            sx={{
                              height: 20,
                              fontSize: 11,
                              bgcolor: STATUS_STYLE[selectedUser.status].bg,
                              color: STATUS_STYLE[selectedUser.status].color,
                              fontWeight: 700,
                            }}
                          />
                        </Stack>
                      </Box>
                    </Stack>

                    <Divider />

                    {/* Info rows */}
                    <Stack spacing={1.5}>
                      <InfoRow
                        icon={<MailOutlineIcon sx={{ fontSize: 16 }} />}
                        label="Email"
                        value={selectedUser.email}
                      />
                      <InfoRow
                        icon={<PhoneIcon sx={{ fontSize: 16 }} />}
                        label="Phone"
                        value={selectedUser.phone ?? ""}
                      />
                      <InfoRow
                        icon={<BadgeOutlinedIcon sx={{ fontSize: 16 }} />}
                        label="Department"
                        value={selectedUser.department ?? ""}
                      />
                      <InfoRow
                        icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
                        label="Last Login"
                        value={selectedUser.lastLogin ?? "Not available"}
                      />
                    </Stack>

                    <Divider />

                    {/* Status toggle */}
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={handleToggleStatus}
                      disabled={!canManageUsers}
                      startIcon={
                        selectedUser.status === "suspended" ? (
                          <CheckCircleOutlined />
                        ) : (
                          <PauseCircleIcon />
                        )
                      }
                      sx={{
                        fontWeight: 700,
                        borderRadius: 2.5,
                        py: 1,
                        borderColor:
                          selectedUser.status === "suspended"
                            ? "#22C55E"
                            : "#EF4444",
                        color:
                          selectedUser.status === "suspended"
                            ? "#16A34A"
                            : "#DC2626",
                        "&:hover": {
                          bgcolor:
                            selectedUser.status === "suspended"
                              ? alpha("#22C55E", 0.08)
                              : alpha("#EF4444", 0.08),
                        },
                      }}
                    >
                      {selectedUser.status === "suspended"
                        ? "Re-activate User"
                        : selectedUser.status === "invited"
                          ? "Activate User"
                          : "Suspend User"}
                    </Button>
                  </Stack>
                ) : (
                  <Box sx={{ py: 3, textAlign: "center" }}>
                    <PersonIcon
                      sx={{
                        fontSize: 40,
                        color: "text.secondary",
                        opacity: 0.3,
                        mb: 1,
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Select a user to see profile details.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Card>

            {/* Access Snapshot Card */}
            <Card>
              <Box
                sx={{
                  px: 2.5,
                  py: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <ShieldIcon sx={{ color: "primary.main", fontSize: 20 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Access Snapshot
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Role-based permission highlights
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ px: 2.5, py: 2 }}>
                {selectedUser ? (
                  <Stack spacing={1.5}>
                    <Stack
                      direction="row"
                      spacing={0.75}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {accessGroups.map((group) => (
                        <Chip
                          key={group}
                          size="small"
                          label={group}
                          icon={
                            <LockIcon sx={{ fontSize: "14px !important" }} />
                          }
                          sx={{
                            height: 26,
                            fontSize: 12,
                            bgcolor: alpha(theme.palette.primary.main, 0.07),
                            color: "primary.main",
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          }}
                        />
                      ))}
                      {accessGroups.length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                          No permissions assigned.
                        </Typography>
                      )}
                    </Stack>
                    <Box
                      sx={{
                        px: 1.5,
                        py: 1,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.warning.main, 0.06),
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        <VerifiedUserIcon
                          sx={{
                            fontSize: 12,
                            verticalAlign: "middle",
                            mr: 0.5,
                            color: "warning.dark",
                          }}
                        />
                        Role permissions update automatically when role profiles
                        change.
                      </Typography>
                    </Box>
                  </Stack>
                ) : (
                  <Box sx={{ py: 2, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      Select a user to view access summary.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Stack>
        </Box>
      </Stack>

      {/* ── Invite / Edit Dialog ── */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: alpha("#3B6FE8", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PersonIcon sx={{ color: "primary.main" }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {editingUserId ? "Edit User" : "Invite User"}
              </Typography>
            </Stack>
            <IconButton size="small" onClick={() => setDialogOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.75} sx={{ pt: 1 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.75}>
              <TextField
                fullWidth
                label="Full Name"
                value={userDraft.name}
                onChange={draft("name")}
              />
              <TextField
                fullWidth
                label="Email"
                value={userDraft.email}
                onChange={draft("email")}
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.75}>
              <TextField
                fullWidth
                label="Phone"
                value={userDraft.phone}
                onChange={draft("phone")}
              />
              <TextField
                fullWidth
                label="Title"
                value={userDraft.title}
                onChange={draft("title")}
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.75}>
              <TextField
                fullWidth
                label="Department"
                value={userDraft.department}
                onChange={draft("department")}
              />
              <TextField
                fullWidth
                select
                label="Status"
                value={userDraft.status}
                onChange={draft("status")}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="invited">Invited</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </TextField>
            </Stack>
            <TextField
              fullWidth
              select
              label="Role"
              value={userDraft.roleId}
              onChange={draft("roleId")}
            >
              {roles.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="text"
            onClick={() => setDialogOpen(false)}
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveUser}
            disabled={!canManageUsers}
            sx={{
              px: 3,
              fontWeight: 700,
              boxShadow: `0 4px 12px ${alpha("#3B6FE8", 0.25)}`,
            }}
          >
            {editingUserId ? "Save Changes" : "Send Invite"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: alpha("#EF4444", 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DeleteIcon sx={{ color: "error.main" }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Delete User
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This will permanently remove <strong>{selectedUser?.name}</strong>{" "}
            from the directory. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="text"
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteUser}
            disabled={!canManageUsers}
            sx={{ px: 3, fontWeight: 700 }}
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageTemplate>
  );
}
