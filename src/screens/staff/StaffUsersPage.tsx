'use client';

import * as React from 'react';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@/src/ui/components/atoms';
import { Card, CardHeader, CommonDialog, StatTile } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PauseCircle as PauseCircleIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useStaffStore, StaffUserStatus } from '@/src/core/staff/staffStore';
import { usePermission } from '@/src/core/auth/usePermission';

const PERMISSION_GROUPS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'patients', label: 'Patients' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'clinical', label: 'Clinical' },
  { id: 'ipd', label: 'Inpatient' },
  { id: 'orders', label: 'Orders' },
  { id: 'diagnostics', label: 'Diagnostics' },
  { id: 'pharmacy', label: 'Pharmacy' },
  { id: 'billing', label: 'Billing' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'reports', label: 'Reports' },
  { id: 'admin', label: 'Admin' },
  { id: 'staff', label: 'Staff' },
  { id: 'help', label: 'Help' },
];

const statusTone: Record<StaffUserStatus, { label: string; color: 'success' | 'warning' | 'default' }>
  = {
    active: { label: 'Active', color: 'success' },
    invited: { label: 'Invited', color: 'warning' },
    suspended: { label: 'Suspended', color: 'default' },
  };

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export default function StaffUsersPage() {
  const theme = useTheme();
  const {
    roles,
    roleMap,
    users,
    addUser,
    updateUser,
    deleteUser,
    setUserStatus,
  } = useStaffStore();
  const permissionGate = usePermission();
  const canManageUsers = permissionGate(['staff.users.write', 'staff.users.manage']);

  const [selectedUserId, setSelectedUserId] = React.useState<string>(users[0]?.id ?? '');
  const [userSearch, setUserSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<'all' | StaffUserStatus>('all');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingUserId, setEditingUserId] = React.useState<string | null>(null);
  const [userDraft, setUserDraft] = React.useState({
    name: '',
    email: '',
    phone: '',
    roleId: roles[0]?.id ?? 'HOSPITAL_ADMIN',
    department: '',
    title: '',
    status: 'invited' as StaffUserStatus,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info',
  });

  React.useEffect(() => {
    if (!selectedUserId && users.length > 0) {
      setSelectedUserId(users[0].id);
    }
  }, [users, selectedUserId]);

  const selectedUser = React.useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? users[0],
    [users, selectedUserId]
  );

  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      const query = userSearch.toLowerCase();
      const matchesSearch =
        user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
      const matchesRole = roleFilter === 'all' || user.roleId === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, userSearch, roleFilter, statusFilter]);

  const statusCounts = React.useMemo(() => {
    return users.reduce(
      (acc, user) => {
        acc[user.status] += 1;
        return acc;
      },
      { active: 0, invited: 0, suspended: 0 }
    );
  }, [users]);

  const accessGroups = React.useMemo(() => {
    if (!selectedUser) return [];
    const rolePermissions = roleMap.get(selectedUser.roleId)?.permissions ?? [];
    if (rolePermissions.includes('*')) return ['Full Platform Access'];
    const groupLabels = new Map(PERMISSION_GROUPS.map((group) => [group.id, group.label]));
    const groups = new Set<string>();
    rolePermissions.forEach((perm) => {
      const [groupId] = perm.split('.');
      if (groupId) {
        groups.add(groupLabels.get(groupId) ?? groupId.toUpperCase());
      }
    });
    return Array.from(groups).slice(0, 10);
  }, [selectedUser, roleMap]);

  const handleOpenCreate = () => {
    setEditingUserId(null);
    setUserDraft({
      name: '',
      email: '',
      phone: '',
      roleId: roles[0]?.id ?? 'HOSPITAL_ADMIN',
      department: '',
      title: '',
      status: 'invited',
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = () => {
    if (!selectedUser) return;
    setEditingUserId(selectedUser.id);
    setUserDraft({
      name: selectedUser.name,
      email: selectedUser.email,
      phone: selectedUser.phone ?? '',
      roleId: selectedUser.roleId,
      department: selectedUser.department ?? '',
      title: selectedUser.title ?? '',
      status: selectedUser.status,
    });
    setDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (!userDraft.name.trim() || !userDraft.email.trim()) {
      setSnackbar({ open: true, message: 'Name and email are required.', severity: 'error' });
      return;
    }

    if (editingUserId) {
      updateUser(editingUserId, { ...userDraft });
      setSnackbar({ open: true, message: 'User updated.', severity: 'success' });
      setDialogOpen(false);
      return;
    }

    const newUserId = addUser({ ...userDraft });
    if (newUserId) {
      setSelectedUserId(newUserId);
      setSnackbar({ open: true, message: 'User invited successfully.', severity: 'success' });
      setDialogOpen(false);
      return;
    }

    setSnackbar({ open: true, message: 'Unable to create user.', severity: 'error' });
  };

  const handleToggleStatus = () => {
    if (!selectedUser) return;
    const nextStatus: StaffUserStatus =
      selectedUser.status === 'suspended' ? 'active' : selectedUser.status === 'invited' ? 'active' : 'suspended';
    setUserStatus(selectedUser.id, nextStatus);
    setSnackbar({
      open: true,
      message:
        nextStatus === 'active' && selectedUser.status === 'invited'
          ? 'User activated.'
          : nextStatus === 'active'
          ? 'User re-activated.'
          : 'User suspended.',
      severity: 'info',
    });
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    deleteUser(selectedUser.id);
    setDeleteDialogOpen(false);
    setSelectedUserId('');
    setSnackbar({ open: true, message: 'User removed.', severity: 'info' });
  };

  return (
    <PageTemplate
      title="User Management"
      subtitle={undefined}
      currentPageTitle="User Management"
    >
      <Stack spacing={2.5}>
        <Card
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: '1px solid',
            borderColor: alpha(theme.palette.info.main, 0.2),
            background: `linear-gradient(135deg, ${alpha(theme.palette.info.light, 0.18)}, ${alpha(
              theme.palette.info.main,
              0.08
            )})`,
          }}
        >
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip size="small" label="Staff Directory" color="info" />
              <Chip size="small" variant="outlined" label={`${users.length} users`} />
              {!canManageUsers ? (
                <Chip size="small" variant="outlined" color="warning" label="Read-only" />
              ) : null}
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Staff Access &amp; User Directory
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Centralize onboarding, track role assignments, and monitor staff account status in one place.
            </Typography>
          </Stack>
        </Card>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <StatTile
              label="Active users"
              value={statusCounts.active}
              subtitle="Currently enabled"
              tone="success"
              icon={<CheckCircleIcon fontSize="small" />}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <StatTile
              label="Pending invites"
              value={statusCounts.invited}
              subtitle="Awaiting activation"
              tone="warning"
              icon={<PersonIcon fontSize="small" />}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <StatTile
              label="Suspended"
              value={statusCounts.suspended}
              subtitle="Access disabled"
              tone="secondary"
              icon={<PauseCircleIcon fontSize="small" />}
            />
          </Box>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' },
            gap: 2,
          }}
        >
          <Box>
            <Card elevation={0} sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
              <CardHeader
                title="User List"
                subtitle="Filter and search staff members"
                action={
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    disabled={!canManageUsers}
                  >
                    Invite User
                  </Button>
                }
              />
              <Box sx={{ px: 2, pt: 1.5, pb: 2 }}>
                <Stack spacing={1.5}>
                  <TextField
                    size="small"
                    placeholder="Search by name or email"
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <TextField
                      select
                      size="small"
                      label="Role"
                      value={roleFilter}
                      onChange={(event) => setRoleFilter(event.target.value)}
                      sx={{ flex: 1 }}
                    >
                      <MenuItem value="all">All roles</MenuItem>
                      {roles.map((role) => (
                        <MenuItem key={role.id} value={role.id}>
                          {role.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      size="small"
                      label="Status"
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value as 'all' | StaffUserStatus)}
                      sx={{ flex: 1 }}
                    >
                      <MenuItem value="all">All statuses</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="invited">Invited</MenuItem>
                      <MenuItem value="suspended">Suspended</MenuItem>
                    </TextField>
                  </Stack>
                </Stack>

                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  {filteredUsers.map((user) => {
                    const roleLabel = roleMap.get(user.roleId)?.label ?? user.roleId;
                    const statusInfo = statusTone[user.status];
                    const isSelected = user.id === selectedUser?.id;

                    return (
                      <Box
                        key={user.id}
                        onClick={() => setSelectedUserId(user.id)}
                        sx={{
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          p: 1.5,
                          cursor: 'pointer',
                          backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.18), color: 'primary.main' }}>
                            {getInitials(user.name)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.email}
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.75 }}>
                              <Chip size="small" label={roleLabel} variant="outlined" />
                              <Chip size="small" label={statusInfo.label} color={statusInfo.color} />
                            </Stack>
                          </Box>
                        </Stack>
                      </Box>
                    );
                  })}
                  {filteredUsers.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No users found. Try adjusting filters.
                    </Typography>
                  ) : null}
                </Stack>
              </Box>
            </Card>
          </Box>

          <Box>
            <Stack spacing={2}>
              <Card elevation={0} sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                <CardHeader
                  title={selectedUser?.name ?? 'User Profile'}
                  subtitle={selectedUser?.email ?? 'Select a user to view details'}
                  action={
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Edit user">
                        <span>
                          <IconButton size="small" onClick={handleOpenEdit} disabled={!selectedUser || !canManageUsers}>
                            <EditIcon fontSize="small" />
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
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  }
                />
                <Box sx={{ px: 2, pt: 1.5, pb: 2 }}>
                  {selectedUser ? (
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: alpha(theme.palette.info.main, 0.18),
                            color: theme.palette.info.main,
                            width: 56,
                            height: 56,
                          }}
                        >
                          {getInitials(selectedUser.name)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {selectedUser.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {selectedUser.title || 'No title provided'}
                          </Typography>
                        </Box>
                      </Stack>

                      <Divider />

                      <Stack spacing={1}>
                        <Typography variant="caption" color="text.secondary">
                          Contact
                        </Typography>
                        <Typography variant="body2">{selectedUser.email}</Typography>
                        <Typography variant="body2">{selectedUser.phone || 'No phone on file'}</Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip size="small" label={roleMap.get(selectedUser.roleId)?.label ?? selectedUser.roleId} />
                        <Chip size="small" label={statusTone[selectedUser.status].label} />
                        {selectedUser.department ? (
                          <Chip size="small" label={selectedUser.department} variant="outlined" />
                        ) : null}
                      </Stack>

                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Last login
                        </Typography>
                        <Typography variant="body2">{selectedUser.lastLogin || 'Not available'}</Typography>
                      </Stack>

                      <Button
                        variant="outlined"
                        onClick={handleToggleStatus}
                        disabled={!canManageUsers}
                      >
                        {selectedUser.status === 'suspended'
                          ? 'Re-activate User'
                          : selectedUser.status === 'invited'
                          ? 'Activate User'
                          : 'Suspend User'}
                      </Button>
                    </Stack>
                  ) : (
                    <Alert severity="info">Select a user to see profile details.</Alert>
                  )}
                </Box>
              </Card>

              <Card elevation={0} sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                <CardHeader
                  title="Access Snapshot"
                  subtitle="Highlights of the selected user's role permissions"
                />
                <Box sx={{ px: 2, pt: 1.5, pb: 2 }}>
                  {selectedUser ? (
                    <Stack spacing={1.25}>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {accessGroups.map((group) => (
                          <Chip key={group} size="small" label={group} variant="outlined" />
                        ))}
                        {accessGroups.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No permissions assigned.
                          </Typography>
                        ) : null}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Role permissions update automatically when role profiles change.
                      </Typography>
                    </Stack>
                  ) : (
                    <Alert severity="info">Select a user to view access summary.</Alert>
                  )}
                </Box>
              </Card>
            </Stack>
          </Box>
        </Box>
      </Stack>

      <CommonDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingUserId ? 'Edit User' : 'Invite User'}
        maxWidth="sm"
        content={
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              label="Full Name"
              value={userDraft.name}
              onChange={(event) => setUserDraft((prev) => ({ ...prev, name: event.target.value }))}
            />
            <TextField
              label="Email"
              value={userDraft.email}
              onChange={(event) => setUserDraft((prev) => ({ ...prev, email: event.target.value }))}
            />
            <TextField
              label="Phone"
              value={userDraft.phone}
              onChange={(event) => setUserDraft((prev) => ({ ...prev, phone: event.target.value }))}
            />
            <TextField
              select
              label="Role"
              value={userDraft.roleId}
              onChange={(event) => setUserDraft((prev) => ({ ...prev, roleId: event.target.value }))}
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Department"
              value={userDraft.department}
              onChange={(event) => setUserDraft((prev) => ({ ...prev, department: event.target.value }))}
            />
            <TextField
              label="Title"
              value={userDraft.title}
              onChange={(event) => setUserDraft((prev) => ({ ...prev, title: event.target.value }))}
            />
            <TextField
              select
              label="Status"
              value={userDraft.status}
              onChange={(event) => setUserDraft((prev) => ({ ...prev, status: event.target.value as StaffUserStatus }))}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="invited">Invited</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </TextField>
          </Stack>
        }
        actions={
          <>
            <Button variant="text" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSaveUser} disabled={!canManageUsers}>
              {editingUserId ? 'Save Changes' : 'Send Invite'}
            </Button>
          </>
        }
      />

      <CommonDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Delete User"
        description="This will remove the user from the directory. This action cannot be undone."
        cancelLabel="Cancel"
        confirmLabel="Delete User"
        confirmColor="error"
        onConfirm={handleDeleteUser}
        confirmButtonProps={{ disabled: !canManageUsers }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageTemplate>
  );
}
