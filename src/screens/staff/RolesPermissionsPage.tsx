'use client';

import * as React from 'react';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
} from '@/src/ui/components/atoms';
import { Card, CardHeader, CommonDialog } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { Add as AddIcon, Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { NAV_GROUPS } from '@/src/core/navigation/nav-config';
import { CLINICAL_MODULES } from '@/src/screens/clinical/module-registry';
import { useStaffStore } from '@/src/core/staff/staffStore';
import { usePermission } from '@/src/core/auth/usePermission';
import { hasPermission } from '@/src/core/navigation/permissions';

const PERMISSION_GROUPS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'patients', label: 'Patients' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'clinical', label: 'Clinical' },
  { id: 'clinical_core', label: 'Clinical Core' },
  { id: 'ipd', label: 'Inpatient' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'surgery', label: 'Surgery' },
  { id: 'radiology', label: 'Radiology' },
  { id: 'laboratory', label: 'Laboratory' },
  { id: 'orders', label: 'Orders' },
  { id: 'diagnostics', label: 'Diagnostics' },
  { id: 'pharmacy', label: 'Pharmacy' },
  { id: 'patient_access', label: 'Patient Access' },
  { id: 'scheduling', label: 'Scheduling' },
  { id: 'revenue_cycle', label: 'Revenue Cycle' },
  { id: 'billing', label: 'Billing' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'patient_portal', label: 'Patient Portal' },
  { id: 'interoperability', label: 'Interoperability' },
  { id: 'population_health', label: 'Population Health' },
  { id: 'oncology', label: 'Oncology' },
  { id: 'cardiology', label: 'Cardiology' },
  { id: 'reports', label: 'Reports' },
  { id: 'admin', label: 'Admin' },
  { id: 'staff', label: 'Staff' },
  { id: 'help', label: 'Help' },
];

const EXTRA_PERMISSIONS = [
  'staff.users.write',
  'staff.roles.write',
  'staff.roster.write',
  'admin.audit.write',
  'reports.analytics.write',
];

const toTitleCase = (value: string) =>
  value
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());

type PermissionMeta = {
  key: string;
  groupId: string;
  groupLabel: string;
  featureKey: string;
  featureLabel: string;
  action: string;
  actionLabel: string;
  isWildcard: boolean;
};

export default function RolesPermissionsPage() {
  const { roles, users, addRole, updateRole, deleteRole } = useStaffStore();
  const permissionGate = usePermission();
  const canManageRoles = permissionGate(['staff.roles.write', 'staff.roles.manage']);

  const [selectedRoleId, setSelectedRoleId] = React.useState<string>(roles[0]?.id ?? '');
  const [roleForm, setRoleForm] = React.useState({
    label: '',
    description: '',
    isActive: true,
  });
  const [roleSearch, setRoleSearch] = React.useState('');
  const [rolesDialogOpen, setRolesDialogOpen] = React.useState(false);

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [createDraft, setCreateDraft] = React.useState({
    label: '',
    description: '',
    cloneFromId: '',
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteReassignRoleId, setDeleteReassignRoleId] = React.useState('');

  const [moduleFilter, setModuleFilter] = React.useState('all');
  const [featureSearch, setFeatureSearch] = React.useState('');
  const [privilegeSearch, setPrivilegeSearch] = React.useState('');
  const [assignedSearch, setAssignedSearch] = React.useState('');
  const [selectedAvailable, setSelectedAvailable] = React.useState<Set<string>>(() => new Set());

  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info',
  });

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const main = document.querySelector('main');
    if (!main) return;
    const prevOverflow = main.style.overflow;
    main.style.overflow = 'hidden';
    return () => {
      main.style.overflow = prevOverflow;
    };
  }, []);

  React.useEffect(() => {
    if (!selectedRoleId && roles.length > 0) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  const selectedRole = React.useMemo(
    () => roles.find((role) => role.id === selectedRoleId) ?? roles[0],
    [roles, selectedRoleId]
  );
  const fullAccess = Boolean(selectedRole?.permissions.includes('*'));

  React.useEffect(() => {
    if (!selectedRole) return;
    setRoleForm({
      label: selectedRole.label,
      description: selectedRole.description,
      isActive: selectedRole.isActive ?? true,
    });
  }, [selectedRole?.id, selectedRole?.label, selectedRole?.description, selectedRole?.isActive]);

  React.useEffect(() => {
    setSelectedAvailable(new Set());
  }, [selectedRoleId]);

  const roleDirty = Boolean(
    selectedRole &&
      (roleForm.label.trim() !== selectedRole.label ||
        roleForm.description.trim() !== selectedRole.description ||
        roleForm.isActive !== (selectedRole.isActive ?? true))
  );

  const roleUserCounts = React.useMemo(() => {
    const counts = new Map<string, number>();
    users.forEach((user) => {
      counts.set(user.roleId, (counts.get(user.roleId) ?? 0) + 1);
    });
    return counts;
  }, [users]);

  const groupLabelMap = React.useMemo(
    () => new Map(PERMISSION_GROUPS.map((group) => [group.id, group.label])),
    []
  );
  const getGroupLabel = React.useCallback(
    (groupId: string) => groupLabelMap.get(groupId) ?? toTitleCase(groupId),
    [groupLabelMap]
  );

  const permissionCatalog = React.useMemo<PermissionMeta[]>(() => {
    const permissionSet = new Set<string>();

    roles.forEach((role) => role.permissions.forEach((perm) => permissionSet.add(perm)));
    NAV_GROUPS.forEach((group) => {
      group.items.forEach((item) => {
        item.requiredPermissions?.forEach((perm) => permissionSet.add(perm));
        item.children?.forEach((child) => {
          child.requiredPermissions?.forEach((perm) => permissionSet.add(perm));
        });
      });
    });
    CLINICAL_MODULES.forEach((moduleDefinition) => {
      (moduleDefinition.requiredPermissions ?? []).forEach((perm) => permissionSet.add(perm));
    });
    EXTRA_PERMISSIONS.forEach((perm) => permissionSet.add(perm));

    permissionSet.delete('*');

    return Array.from(permissionSet)
      .filter(Boolean)
      .map((permission) => {
        const parts = permission.split('.');
        const groupId = parts[0] ?? '';
        const action = parts.length > 1 ? parts[parts.length - 1] : '';
        const subjectParts = parts.length > 2 ? parts.slice(1, -1) : [];
        const featureKey = subjectParts.join('.');
        const featureLabel = featureKey ? toTitleCase(featureKey) : getGroupLabel(groupId);
        const actionLabel = action ? (action === '*' ? 'All' : toTitleCase(action)) : '';

        return {
          key: permission,
          groupId,
          groupLabel: getGroupLabel(groupId),
          featureKey,
          featureLabel,
          action,
          actionLabel,
          isWildcard: action === '*',
        };
      })
      .sort((a, b) => {
        const groupCompare = a.groupLabel.localeCompare(b.groupLabel);
        if (groupCompare !== 0) return groupCompare;
        const featureCompare = a.featureLabel.localeCompare(b.featureLabel);
        if (featureCompare !== 0) return featureCompare;
        const actionCompare = a.actionLabel.localeCompare(b.actionLabel);
        if (actionCompare !== 0) return actionCompare;
        return a.key.localeCompare(b.key);
      });
  }, [roles, getGroupLabel]);

  const moduleOptions = React.useMemo(() => {
    const map = new Map<string, string>();
    permissionCatalog.forEach((perm) => {
      if (!map.has(perm.groupId)) {
        map.set(perm.groupId, perm.groupLabel);
      }
    });
    return Array.from(map.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [permissionCatalog]);

  const availablePermissions = React.useMemo(() => {
    if (!selectedRole) return [];
    return permissionCatalog.filter((perm) => !hasPermission(selectedRole.permissions, perm.key));
  }, [permissionCatalog, selectedRole]);

  const assignedPermissions = React.useMemo(() => {
    if (!selectedRole) return [];
    const assigned = new Set(selectedRole.permissions);
    return permissionCatalog.filter((perm) => assigned.has(perm.key));
  }, [permissionCatalog, selectedRole]);

  const filteredAvailable = React.useMemo(() => {
    const featureQuery = featureSearch.trim().toLowerCase();
    const privilegeQuery = privilegeSearch.trim().toLowerCase();

    return availablePermissions.filter((perm) => {
      if (moduleFilter !== 'all' && perm.groupId !== moduleFilter) return false;
      if (featureQuery) {
        const featureMatch =
          perm.featureLabel.toLowerCase().includes(featureQuery) ||
          perm.featureKey.toLowerCase().includes(featureQuery);
        if (!featureMatch) return false;
      }
      if (privilegeQuery) {
        const privilegeMatch =
          perm.key.toLowerCase().includes(privilegeQuery) ||
          perm.actionLabel.toLowerCase().includes(privilegeQuery);
        if (!privilegeMatch) return false;
      }
      return true;
    });
  }, [availablePermissions, featureSearch, privilegeSearch, moduleFilter]);

  const filteredAssigned = React.useMemo(() => {
    const query = assignedSearch.trim().toLowerCase();
    if (!query) return assignedPermissions;
    return assignedPermissions.filter((perm) => {
      return (
        perm.groupLabel.toLowerCase().includes(query) ||
        perm.featureLabel.toLowerCase().includes(query) ||
        perm.key.toLowerCase().includes(query)
      );
    });
  }, [assignedPermissions, assignedSearch]);

  const visibleAvailableKeys = React.useMemo(
    () => filteredAvailable.map((perm) => perm.key),
    [filteredAvailable]
  );

  const allVisibleSelected =
    visibleAvailableKeys.length > 0 && visibleAvailableKeys.every((key) => selectedAvailable.has(key));
  const someVisibleSelected = visibleAvailableKeys.some((key) => selectedAvailable.has(key));

  const filteredRoles = React.useMemo(() => {
    const query = roleSearch.trim().toLowerCase();
    if (!query) return roles;
    return roles.filter((role) => {
      return role.label.toLowerCase().includes(query) || role.id.toLowerCase().includes(query);
    });
  }, [roles, roleSearch]);

  const handleToggleFullAccess = () => {
    if (!selectedRole) return;
    if (selectedRole.permissions.includes('*')) {
      updateRole(selectedRole.id, { permissions: [] });
    } else {
      updateRole(selectedRole.id, { permissions: ['*'] });
    }
  };

  const handleSaveRole = () => {
    if (!selectedRole) return;
    if (!roleForm.label.trim()) {
      setSnackbar({ open: true, message: 'Role name is required.', severity: 'error' });
      return;
    }
    updateRole(selectedRole.id, {
      label: roleForm.label,
      description: roleForm.description,
      isActive: roleForm.isActive,
    });
    setSnackbar({ open: true, message: 'Role updated successfully.', severity: 'success' });
  };

  const handleOpenCreate = () => {
    setCreateDraft({
      label: '',
      description: '',
      cloneFromId: selectedRole?.id ?? roles[0]?.id ?? '',
    });
    setCreateDialogOpen(true);
  };

  const handleCreateRole = () => {
    if (!createDraft.label.trim()) {
      setSnackbar({ open: true, message: 'Role name is required.', severity: 'error' });
      return;
    }
    const newRoleId = addRole({
      label: createDraft.label,
      description: createDraft.description,
      cloneFromId: createDraft.cloneFromId || undefined,
    });
    if (newRoleId) {
      setSelectedRoleId(newRoleId);
      setCreateDialogOpen(false);
      setSnackbar({ open: true, message: 'New role created.', severity: 'success' });
      return;
    }
    setSnackbar({ open: true, message: 'Unable to create role.', severity: 'error' });
  };

  const handleOpenDelete = () => {
    if (!selectedRole || selectedRole.isSystem) return;
    setDeleteReassignRoleId(
      roles.find((item) => item.id === 'HOSPITAL_ADMIN')?.id ??
        roles.find((item) => item.id !== selectedRole.id)?.id ??
        ''
    );
    setDeleteDialogOpen(true);
  };

  const handleDeleteRole = () => {
    if (!selectedRole || selectedRole.isSystem) return;
    deleteRole(selectedRole.id, deleteReassignRoleId);
    setSnackbar({ open: true, message: 'Role removed and users reassigned.', severity: 'info' });
    setDeleteDialogOpen(false);
    setSelectedRoleId('');
  };

  const toggleAvailablePermission = (permissionKey: string) => {
    setSelectedAvailable((prev) => {
      const next = new Set(prev);
      if (next.has(permissionKey)) {
        next.delete(permissionKey);
      } else {
        next.add(permissionKey);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedAvailable((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleAvailableKeys.forEach((key) => next.delete(key));
      } else {
        visibleAvailableKeys.forEach((key) => next.add(key));
      }
      return next;
    });
  };

  const handleAssignPrivileges = () => {
    if (!selectedRole || !canManageRoles || selectedAvailable.size === 0) return;
    const next = new Set(selectedRole.permissions);
    selectedAvailable.forEach((permission) => next.add(permission));
    updateRole(selectedRole.id, { permissions: Array.from(next) });
    setSelectedAvailable(new Set());
    setSnackbar({ open: true, message: 'Privileges assigned successfully.', severity: 'success' });
  };

  const handleRemovePrivilege = (permissionKey: string) => {
    if (!selectedRole || !canManageRoles) return;
    const next = new Set(selectedRole.permissions);
    if (!next.has(permissionKey)) return;
    next.delete(permissionKey);
    updateRole(selectedRole.id, { permissions: Array.from(next) });
  };

  return (
    <PageTemplate title="Role Management" subtitle={undefined} currentPageTitle="Role Management" fullHeight>
      <Stack spacing={2} sx={{ flex: 1, minHeight: 0, height: '100%', overflow: 'hidden' }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          <CardHeader
            title="Role Details"
            padding={1.5}
            action={
              <Stack direction="row" spacing={1} alignItems="center">
                <Button size="small" variant="outlined" onClick={() => setRolesDialogOpen(true)}>
                  View All
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreate}
                  disabled={!canManageRoles}
                >
                  Create Role
                </Button>
              </Stack>
            }
          />
          <Box sx={{ px: 2, pb: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              Update role information and access status
            </Typography>
            <Grid container spacing={1.5} alignItems="center" sx={{ mt: 0.5 }}>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  size="small"
                  label="Role"
                  value={selectedRole?.id ?? ''}
                  onChange={(event) => setSelectedRoleId(event.target.value)}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  size="small"
                  label="Role Name"
                  placeholder="e.g., Finance"
                  value={roleForm.label}
                  onChange={(event) => setRoleForm((prev) => ({ ...prev, label: event.target.value }))}
                  disabled={!selectedRole || !canManageRoles}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  size="small"
                  label="Description"
                  placeholder="Describe this role"
                  value={roleForm.description}
                  onChange={(event) => setRoleForm((prev) => ({ ...prev, description: event.target.value }))}
                  disabled={!selectedRole || !canManageRoles}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={roleForm.isActive}
                        onChange={(event) =>
                          setRoleForm((prev) => ({ ...prev, isActive: event.target.checked }))
                        }
                        disabled={!selectedRole || !canManageRoles}
                      />
                    }
                    label="Active"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={fullAccess}
                        onChange={handleToggleFullAccess}
                        disabled={!selectedRole || !canManageRoles}
                      />
                    }
                    label="Full Access"
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                {selectedRole ? (
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Chip
                      size="small"
                      label={selectedRole.isSystem ? 'System role' : 'Custom role'}
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      label={`${roleUserCounts.get(selectedRole.id) ?? 0} users`}
                      variant="outlined"
                    />
                    {fullAccess ? <Chip size="small" label="Full access" color="success" /> : null}
                  </Stack>
                ) : null}
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ md: 'flex-end' }}>
                  <Button
                    variant="contained"
                    onClick={handleSaveRole}
                    disabled={!selectedRole || !canManageRoles || !roleDirty}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleOpenDelete}
                    disabled={!selectedRole || selectedRole.isSystem || !canManageRoles}
                  >
                    Delete
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Card>

        <Grid
          container
          spacing={2}
          sx={{
            flex: '1 1 0',
            minHeight: 0,
            alignItems: 'stretch',
            flexWrap: 'nowrap',
            overflow: 'hidden',
          }}
        >
          <Grid item xs={6} md={6} sx={{ minHeight: 0, height: '100%', display: 'flex', minWidth: 0 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardHeader
                title="Assign Privileges"
                subtitle="Select features and attach to this role"
                padding={1.5}
              />
              <Box
                sx={{
                  px: 2,
                  pb: 1.5,
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  overflow: 'hidden',
                }}
              >
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      size="small"
                      label="Module"
                      value={moduleFilter}
                      onChange={(event) => setModuleFilter(event.target.value)}
                      disabled={!selectedRole}
                    >
                      <MenuItem value="all">All modules</MenuItem>
                      {moduleOptions.map((module) => (
                        <MenuItem key={module.id} value={module.id}>
                          {module.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      size="small"
                      label="Feature"
                      placeholder="Search feature"
                      value={featureSearch}
                      onChange={(event) => setFeatureSearch(event.target.value)}
                      disabled={!selectedRole}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      size="small"
                      label="Privileges"
                      placeholder="Search privilege"
                      value={privilegeSearch}
                      onChange={(event) => setPrivilegeSearch(event.target.value)}
                      disabled={!selectedRole}
                    />
                  </Grid>
                </Grid>

                {!selectedRole ? (
                  <Alert severity="info">Select a role to manage privileges.</Alert>
                ) : null}
                {fullAccess ? (
                  <Alert severity="info">Full access enabled. Disable it to assign granular privileges.</Alert>
                ) : null}

                <Box sx={{ flex: '1 1 0', minHeight: 0, display: 'flex', overflow: 'hidden' }}>
                  <TableContainer
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      flex: 1,
                      minHeight: 0,
                      height: '100%',
                      overflow: 'auto',
                      '& .MuiTableCell-root': { py: 0.75 },
                    }}
                  >
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, width: 70 }}>Select</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Feature</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Privileges</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredAvailable.map((permission) => (
                          <TableRow key={permission.key}>
                            <TableCell align="center">
                              <Checkbox
                                size="small"
                                checked={selectedAvailable.has(permission.key)}
                                onChange={() => toggleAvailablePermission(permission.key)}
                                disabled={!selectedRole || fullAccess || !canManageRoles}
                              />
                            </TableCell>
                            <TableCell>
                              <Stack spacing={0.25}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {permission.featureLabel}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {permission.groupLabel}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                  {permission.key}
                                </Typography>
                                {permission.isWildcard ? (
                                  <Chip size="small" label="Wildcard" variant="outlined" />
                                ) : null}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredAvailable.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3}>
                              <Typography variant="body2" color="text.secondary">
                                Select a module or search to load available privileges.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={allVisibleSelected}
                        indeterminate={!allVisibleSelected && someVisibleSelected}
                        onChange={handleSelectAll}
                        disabled={!selectedRole || fullAccess || filteredAvailable.length === 0 || !canManageRoles}
                      />
                    }
                    label="Select All"
                  />
                  <Button
                    variant="contained"
                    onClick={handleAssignPrivileges}
                    disabled={!selectedRole || fullAccess || selectedAvailable.size === 0 || !canManageRoles}
                  >
                    Assign Privileges
                  </Button>
                </Stack>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={6} md={6} sx={{ minHeight: 0, height: '100%', display: 'flex', minWidth: 0 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardHeader
                title="Configured Privileges"
                subtitle="Privileges already granted"
                padding={1.5}
              />
              <Box
                sx={{
                  px: 2,
                  pb: 1.5,
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  overflow: 'hidden',
                }}
              >
                <TextField
                  size="small"
                  label="Search"
                  placeholder="Search assigned privileges"
                  value={assignedSearch}
                  onChange={(event) => setAssignedSearch(event.target.value)}
                  disabled={!selectedRole}
                />

                {fullAccess ? (
                  <Alert severity="info">Full access enabled. Disable it to manage assigned privileges.</Alert>
                ) : null}

                <Box sx={{ flex: '1 1 0', minHeight: 0, display: 'flex', overflow: 'hidden' }}>
                  <TableContainer
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      flex: 1,
                      minHeight: 0,
                      height: '100%',
                      overflow: 'auto',
                      '& .MuiTableCell-root': { py: 0.75 },
                    }}
                  >
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Module</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Feature</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Privileges</TableCell>
                          <TableCell sx={{ fontWeight: 700, width: 60 }} />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredAssigned.map((permission) => (
                          <TableRow key={permission.key}>
                            <TableCell>
                              <Typography variant="body2">{permission.groupLabel}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{permission.featureLabel}</Typography>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                  {permission.key}
                                </Typography>
                                {permission.isWildcard ? (
                                  <Chip size="small" label="Wildcard" variant="outlined" />
                                ) : null}
                              </Stack>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemovePrivilege(permission.key)}
                                disabled={!selectedRole || fullAccess || !canManageRoles}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredAssigned.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4}>
                              <Typography variant="body2" color="text.secondary">
                                No privileges assigned yet.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Stack>

      <Dialog open={rolesDialogOpen} onClose={() => setRolesDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>All Roles</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              size="small"
              placeholder="Search roles"
              value={roleSearch}
              onChange={(event) => setRoleSearch(event.target.value)}
            />
            <List
              dense
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                maxHeight: 360,
                overflow: 'auto',
              }}
            >
              {filteredRoles.map((role) => (
                <ListItemButton
                  key={role.id}
                  selected={role.id === selectedRole?.id}
                  onClick={() => {
                    setSelectedRoleId(role.id);
                    setRolesDialogOpen(false);
                  }}
                >
                  <ListItemText
                    primary={role.label}
                    secondary={`${role.isSystem ? 'System' : 'Custom'} · ${
                      roleUserCounts.get(role.id) ?? 0
                    } users`}
                  />
                  {role.permissions.includes('*') ? (
                    <Chip size="small" label="Full access" color="success" />
                  ) : (
                    <Chip size="small" label={`${role.permissions.length} perms`} variant="outlined" />
                  )}
                </ListItemButton>
              ))}
              {filteredRoles.length === 0 ? (
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    No roles found.
                  </Typography>
                </Box>
              ) : null}
            </List>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setRolesDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create New Role</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              label="Role Name"
              placeholder="e.g., Quality Reviewer"
              value={createDraft.label}
              onChange={(event) => setCreateDraft((prev) => ({ ...prev, label: event.target.value }))}
            />
            <TextField
              label="Role Description"
              placeholder="Describe the key responsibility"
              value={createDraft.description}
              onChange={(event) => setCreateDraft((prev) => ({ ...prev, description: event.target.value }))}
            />
            <TextField
              select
              label="Clone Permissions From"
              value={createDraft.cloneFromId}
              onChange={(event) => setCreateDraft((prev) => ({ ...prev, cloneFromId: event.target.value }))}
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.label}
                </MenuItem>
              ))}
            </TextField>
            <Alert severity="info">
              Permissions can be adjusted after the role is created using the privilege lists.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreateRole} disabled={!canManageRoles}>
            Create Role
          </Button>
        </DialogActions>
      </Dialog>

      <CommonDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Delete Role"
        maxWidth="sm"
        content={
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Users assigned to this role must be reassigned before deletion.
            </Typography>
            <TextField
              select
              label="Reassign users to"
              value={deleteReassignRoleId}
              onChange={(event) => setDeleteReassignRoleId(event.target.value)}
            >
              {roles
                .filter((role) => role.id !== selectedRole?.id)
                .map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.label}
                  </MenuItem>
                ))}
            </TextField>
          </Stack>
        }
        cancelLabel="Cancel"
        confirmLabel="Delete Role"
        confirmColor="error"
        onConfirm={handleDeleteRole}
        confirmButtonProps={{ disabled: !canManageRoles }}
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
