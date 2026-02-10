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
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@/src/ui/components/atoms';
import { Card, CardHeader, StatTile } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { alpha, useTheme } from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Shield as ShieldIcon,
  Security as SecurityIcon,
  Group as GroupIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';
import { NAV_GROUPS } from '@/src/core/navigation/nav-config';
import { CLINICAL_MODULES } from '@/src/screens/clinical/module-registry';
import { useStaffStore } from '@/src/core/staff/staffStore';
import { usePermission } from '@/src/core/auth/usePermission';

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

const ACTION_COLUMNS = ['create', 'read', 'write'] as const;

const toTitleCase = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());

const formatPermissionLabel = (permission: string, groupLabel: string) => {
  const parts = permission.split('.');
  if (parts.length === 1) return toTitleCase(permission);
  const action = parts.pop() ?? '';
  const subject = parts.slice(1).join(' ');
  const subjectLabel = subject ? toTitleCase(subject) : groupLabel;
  return `${subjectLabel} · ${toTitleCase(action)}`;
};

type PermissionItem = { key: string; label: string };

type PermissionGroup = {
  id: string;
  label: string;
  permissions: PermissionItem[];
};

type PermissionMatrixRow =
  | {
      type: 'group';
      groupId: string;
      groupLabel: string;
      hasGroupAccess: boolean;
    }
  | {
      type: 'subject';
      groupId: string;
      groupLabel: string;
      subjectKey: string;
      subjectLabel: string;
      actions: string[];
      otherActions: string[];
      hasGroupAccess: boolean;
      hasSubjectAccess: boolean;
      actionPermissions: Record<(typeof ACTION_COLUMNS)[number], { key: string; exists: boolean; assigned: boolean }>;
    };

export default function RolesPermissionsPage() {
  const theme = useTheme();
  const panelHeight = 'calc(100vh - 200px)';
  const {
    roles,
    users,
    addRole,
    updateRole,
    deleteRole,
  } = useStaffStore();
  const permissionGate = usePermission();
  const canManageRoles = permissionGate(['staff.roles.write', 'staff.roles.manage']);

  const [selectedRoleId, setSelectedRoleId] = React.useState<string>(roles[0]?.id ?? '');
  const [roleSearch, setRoleSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<'all' | 'system' | 'custom'>('all');
  const [permissionSearch, setPermissionSearch] = React.useState('');
  const [permissionView, setPermissionView] = React.useState<'all' | 'assigned' | 'unassigned'>('assigned');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingRoleId, setEditingRoleId] = React.useState<string | null>(null);
  const [roleDraft, setRoleDraft] = React.useState({
    label: '',
    description: '',
    cloneFromId: '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteReassignRoleId, setDeleteReassignRoleId] = React.useState('');
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info',
  });

  React.useEffect(() => {
    if (!selectedRoleId && roles.length > 0) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  const selectedRole = React.useMemo(
    () => roles.find((role) => role.id === selectedRoleId) ?? roles[0],
    [roles, selectedRoleId]
  );
  const fullAccess = selectedRole?.permissions.includes('*');

  const roleUserCounts = React.useMemo(() => {
    const counts = new Map<string, number>();
    users.forEach((user) => {
      counts.set(user.roleId, (counts.get(user.roleId) ?? 0) + 1);
    });
    return counts;
  }, [users]);

  const visibleRoles = React.useMemo(() => {
    return roles.filter((role) => {
      const matchesFilter =
        roleFilter === 'all' ||
        (roleFilter === 'system' && role.isSystem) ||
        (roleFilter === 'custom' && !role.isSystem);
      const matchesSearch =
        role.label.toLowerCase().includes(roleSearch.toLowerCase()) ||
        role.id.toLowerCase().includes(roleSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [roles, roleFilter, roleSearch]);

  const permissionGroups = React.useMemo(() => {
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

    const groupMap = new Map<string, Set<string>>();
    permissionSet.forEach((perm) => {
      if (perm.endsWith('.*')) return;
      const [groupId] = perm.split('.');
      if (!groupId) return;
      if (!groupMap.has(groupId)) {
        groupMap.set(groupId, new Set());
      }
      groupMap.get(groupId)?.add(perm);
    });

    const knownGroupIds = new Set(PERMISSION_GROUPS.map((group) => group.id));
    const groups: PermissionGroup[] = [];

    PERMISSION_GROUPS.forEach((group) => {
      const permissions = Array.from(groupMap.get(group.id) ?? []);
      if (permissions.length === 0) return;
      const items = permissions
        .sort()
        .map((perm) => ({
          key: perm,
          label: formatPermissionLabel(perm, group.label),
        }))
        .filter((item) => {
          if (!permissionSearch) return true;
          const query = permissionSearch.toLowerCase();
          return item.key.toLowerCase().includes(query) || item.label.toLowerCase().includes(query);
        });
      if (items.length === 0) return;
      groups.push({ id: group.id, label: group.label, permissions: items });
    });

    const extraGroups = Array.from(groupMap.keys())
      .filter((groupId) => !knownGroupIds.has(groupId))
      .sort();

    extraGroups.forEach((groupId) => {
      const permissions = Array.from(groupMap.get(groupId) ?? []).sort();
      const items = permissions
        .map((perm) => ({
          key: perm,
          label: formatPermissionLabel(perm, toTitleCase(groupId)),
        }))
        .filter((item) => {
          if (!permissionSearch) return true;
          const query = permissionSearch.toLowerCase();
          return item.key.toLowerCase().includes(query) || item.label.toLowerCase().includes(query);
        });
      if (items.length === 0) return;
      groups.push({ id: groupId, label: toTitleCase(groupId), permissions: items });
    });

    return groups;
  }, [roles, permissionSearch]);

  const permissionRows = React.useMemo<PermissionMatrixRow[]>(() => {
    if (!selectedRole) return [];

    const rows: PermissionMatrixRow[] = [];

    permissionGroups.forEach((group) => {
      const groupWildcard = `${group.id}.*`;
      const hasGroupAccess = selectedRole.permissions.includes(groupWildcard);

      const subjectMap = new Map<
        string,
        { label: string; actions: Set<string> }
      >();

      group.permissions.forEach((perm) => {
        const key = perm.key;
        const parts = key.split('.');
        if (parts.length < 2) return;
        const action = parts[parts.length - 1];
        const subjectParts = parts.slice(1, -1);
        const subjectKey = subjectParts.length === 0 ? group.id : `${group.id}.${subjectParts.join('.')}`;
        const subjectLabel = subjectParts.length === 0 ? group.label : toTitleCase(subjectParts.join(' '));

        if (!subjectMap.has(subjectKey)) {
          subjectMap.set(subjectKey, { label: subjectLabel, actions: new Set() });
        }
        subjectMap.get(subjectKey)?.actions.add(action);
      });

      if (subjectMap.size === 0 && !hasGroupAccess) return;

      const subjectRows: PermissionMatrixRow[] = [];

      subjectMap.forEach((subjectData, subjectKey) => {
        const actions = Array.from(subjectData.actions).sort();
        const subjectWildcard = `${subjectKey}.*`;
        const hasSubjectAccess = selectedRole.permissions.includes(subjectWildcard);
        const actionPermissions = {
          create: { key: '', exists: false, assigned: false },
          read: { key: '', exists: false, assigned: false },
          write: { key: '', exists: false, assigned: false },
        };

        ACTION_COLUMNS.forEach((action) => {
          const permissionKey =
            subjectKey === group.id ? `${group.id}.${action}` : `${subjectKey}.${action}`;
          const exists = subjectData.actions.has(action);
          const assigned =
            fullAccess ||
            hasGroupAccess ||
            hasSubjectAccess ||
            selectedRole.permissions.includes(permissionKey);
          actionPermissions[action] = { key: permissionKey, exists, assigned };
        });

        const hasVisibleAction = actions.some((action) => {
          if (permissionView === 'all') return true;
          const permissionKey =
            subjectKey === group.id ? `${group.id}.${action}` : `${subjectKey}.${action}`;
          const assigned =
            fullAccess ||
            hasGroupAccess ||
            hasSubjectAccess ||
            selectedRole.permissions.includes(permissionKey);
          if (permissionView === 'assigned') return assigned;
          return !assigned;
        });

        if (!hasVisibleAction) return;

        const otherActions = actions.filter(
          (action) => !ACTION_COLUMNS.includes(action as (typeof ACTION_COLUMNS)[number])
        );

        subjectRows.push({
          type: 'subject',
          groupId: group.id,
          groupLabel: group.label,
          subjectKey,
          subjectLabel: subjectData.label,
          actions,
          otherActions,
          hasGroupAccess,
          hasSubjectAccess,
          actionPermissions,
        });
      });

      if (subjectRows.length === 0 && !hasGroupAccess) return;

      rows.push({
        type: 'group',
        groupId: group.id,
        groupLabel: group.label,
        hasGroupAccess,
      });
      rows.push(...subjectRows);
    });

    return rows;
  }, [permissionGroups, permissionView, selectedRole, fullAccess]);

  const handleOpenCreate = () => {
    setEditingRoleId(null);
    setRoleDraft({ label: '', description: '', cloneFromId: roles[0]?.id ?? '' });
    setDialogOpen(true);
  };

  const handleOpenEdit = () => {
    if (!selectedRole) return;
    setEditingRoleId(selectedRole.id);
    setRoleDraft({
      label: selectedRole.label,
      description: selectedRole.description,
      cloneFromId: '',
    });
    setDialogOpen(true);
  };

  const handleSaveRole = () => {
    if (!roleDraft.label.trim()) {
      setSnackbar({ open: true, message: 'Role name is required.', severity: 'error' });
      return;
    }
    if (editingRoleId) {
      updateRole(editingRoleId, {
        label: roleDraft.label,
        description: roleDraft.description,
      });
      setSnackbar({ open: true, message: 'Role updated successfully.', severity: 'success' });
      setDialogOpen(false);
      return;
    }
    const newRoleId = addRole({
      label: roleDraft.label,
      description: roleDraft.description,
      cloneFromId: roleDraft.cloneFromId || undefined,
    });
    if (newRoleId) {
      setSelectedRoleId(newRoleId);
      setSnackbar({ open: true, message: 'New role created.', severity: 'success' });
      setDialogOpen(false);
      return;
    }
    setSnackbar({ open: true, message: 'Unable to create role.', severity: 'error' });
  };

  const handleDeleteRole = () => {
    if (!selectedRole || selectedRole.isSystem) return;
    deleteRole(selectedRole.id, deleteReassignRoleId);
    setSnackbar({ open: true, message: 'Role removed and users reassigned.', severity: 'info' });
    setDeleteDialogOpen(false);
    setSelectedRoleId('');
  };

  const handlePermissionUpdate = (permissions: string[]) => {
    if (!selectedRole) return;
    updateRole(selectedRole.id, { permissions });
  };

  const handleToggleFullAccess = () => {
    if (!selectedRole) return;
    if (selectedRole.permissions.includes('*')) {
      handlePermissionUpdate([]);
    } else {
      handlePermissionUpdate(['*']);
    }
  };

  const togglePermission = (permission: string, groupId: string, subjectKey: string, actions: string[]) => {
    if (!selectedRole) return;
    const current = new Set(selectedRole.permissions);
    if (current.has('*')) return;

    const subjectWildcard = `${subjectKey}.*`;
    if (current.has(subjectWildcard)) {
      current.delete(subjectWildcard);
      actions.forEach((action) => {
        const key = subjectKey === groupId ? `${groupId}.${action}` : `${subjectKey}.${action}`;
        current.add(key);
      });
    }

    if (current.has(permission)) {
      current.delete(permission);
    } else {
      current.add(permission);
    }

    const groupWildcard = `${groupId}.*`;
    if (current.has(groupWildcard)) {
      current.delete(groupWildcard);
    }

    handlePermissionUpdate(Array.from(current));
  };

  const toggleGroupAccess = (groupId: string) => {
    if (!selectedRole) return;
    const groupWildcard = `${groupId}.*`;
    const current = new Set(selectedRole.permissions);
    if (current.has('*')) return;

    if (current.has(groupWildcard)) {
      current.delete(groupWildcard);
    } else {
      Array.from(current).forEach((perm) => {
        if (perm.startsWith(`${groupId}.`)) {
          current.delete(perm);
        }
      });
      current.add(groupWildcard);
    }

    handlePermissionUpdate(Array.from(current));
  };


  return (
    <PageTemplate
      title="Role Management"
      subtitle={undefined}
      currentPageTitle="Role Management"
    >
      <Stack spacing={1.5}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <StatTile
              label="Total roles"
              value={roles.length}
              subtitle="Access profiles"
              tone="primary"
              icon={<ShieldIcon fontSize="small" />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatTile
              label="Custom roles"
              value={roles.filter((role) => !role.isSystem).length}
              subtitle="Tailored access"
              tone="info"
              icon={<SecurityIcon fontSize="small" />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatTile
              label="Assigned users"
              value={users.length}
              subtitle="Active directory"
              tone="success"
              icon={<GroupIcon fontSize="small" />}
            />
          </Grid>
        </Grid>

        <Box sx={{ height: { md: panelHeight }, overflow: { md: 'hidden' } }}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          <Grid item xs={12} md={4} sx={{ height: '100%' }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardHeader
                title="Roles"
                subtitle="Manage access profiles"
                action={
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    disabled={!canManageRoles}
                  >
                    Create Role
                  </Button>
                }
              />
              <Box
                sx={{
                  px: 2,
                  pt: 1.5,
                  pb: 2,
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <Stack spacing={1.5}>
                  <TextField
                    size="small"
                    placeholder="Search roles"
                    value={roleSearch}
                    onChange={(event) => setRoleSearch(event.target.value)}
                    InputProps={{
                      startAdornment: (
                        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                          <TuneIcon fontSize="small" />
                        </Box>
                      ),
                    }}
                  />
                  <TextField
                    select
                    size="small"
                    label="Filter"
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value as 'all' | 'system' | 'custom')}
                  >
                    <MenuItem value="all">All roles</MenuItem>
                    <MenuItem value="system">System roles</MenuItem>
                    <MenuItem value="custom">Custom roles</MenuItem>
                  </TextField>
                </Stack>
                <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', pr: 0.5 }}>
                  <Stack spacing={1.5}>
                    {visibleRoles.map((role) => {
                      const userCount = roleUserCounts.get(role.id) ?? 0;
                      const isSelected = role.id === selectedRole?.id;
                      return (
                        <Box
                          key={role.id}
                          onClick={() => setSelectedRoleId(role.id)}
                          sx={{
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            p: 1.25,
                            cursor: 'pointer',
                            backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                          }}
                        >
                        <Stack spacing={0.5}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {role.label}
                            </Typography>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              {role.isSystem ? (
                                <Chip size="small" label="System" variant="outlined" />
                              ) : (
                                <Chip size="small" label="Custom" color="info" variant="outlined" />
                              )}
                              {isSelected ? (
                                <Stack direction="row" spacing={0.25}>
                                  <Tooltip title="Edit role">
                                    <span>
                                      <IconButton
                                        size="small"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          handleOpenEdit();
                                        }}
                                        disabled={!canManageRoles}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                  <Tooltip title={role.isSystem ? 'System roles cannot be deleted' : 'Delete role'}>
                                    <span>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          if (role.isSystem) return;
                                          setDeleteReassignRoleId(
                                            roles.find((item) => item.id === 'HOSPITAL_ADMIN')?.id ?? roles[0]?.id ?? ''
                                          );
                                          setDeleteDialogOpen(true);
                                        }}
                                        disabled={role.isSystem || !canManageRoles}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </Stack>
                              ) : null}
                            </Stack>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {role.description || 'No description added yet.'}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Chip size="small" label={`${userCount} users`} variant="outlined" />
                            {role.permissions.includes('*') ? (
                              <Chip size="small" label="Full access" color="success" />
                            ) : (
                              <Chip size="small" label={`${role.permissions.length} permissions`} variant="outlined" />
                            )}
                          </Stack>
                        </Stack>
                        </Box>
                      );
                    })}
                    {visibleRoles.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No roles found. Try adjusting filters.
                      </Typography>
                    ) : null}
                  </Stack>
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={8} sx={{ height: '100%' }}>
            <Stack spacing={2} sx={{ height: '100%' }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardHeader
                  title="Permission Builder"
                  subtitle="Toggle granular permissions or grant full access"
                  action={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Full Access
                      </Typography>
                      <Checkbox
                        size="small"
                        checked={Boolean(fullAccess)}
                        onChange={handleToggleFullAccess}
                        disabled={!selectedRole || !canManageRoles}
                      />
                    </Stack>
                  }
                />
                <Box
                  sx={{
                    px: 2,
                    pt: 1.5,
                    pb: 2,
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Stack spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
                    <TextField
                      size="small"
                      placeholder="Search permissions"
                      value={permissionSearch}
                      onChange={(event) => setPermissionSearch(event.target.value)}
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                            <TuneIcon fontSize="small" />
                          </Box>
                        ),
                      }}
                    />

                    {!selectedRole ? (
                      <Alert severity="info">Select a role to begin editing permissions.</Alert>
                    ) : null}

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        size="small"
                        label="All"
                        color={permissionView === 'all' ? 'primary' : 'default'}
                        variant={permissionView === 'all' ? 'filled' : 'outlined'}
                        onClick={() => setPermissionView('all')}
                      />
                      <Chip
                        size="small"
                        label="Assigned"
                        color={permissionView === 'assigned' ? 'primary' : 'default'}
                        variant={permissionView === 'assigned' ? 'filled' : 'outlined'}
                        onClick={() => setPermissionView('assigned')}
                      />
                      <Chip
                        size="small"
                        label="Unassigned"
                        color={permissionView === 'unassigned' ? 'primary' : 'default'}
                        variant={permissionView === 'unassigned' ? 'filled' : 'outlined'}
                        onClick={() => setPermissionView('unassigned')}
                      />
                    </Stack>

                    <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                      <TableContainer
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          '& .MuiTableCell-root': { py: 0.75 },
                        }}
                      >
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700, width: '38%' }}>Module</TableCell>
                              <TableCell sx={{ fontWeight: 700, textAlign: 'center', width: 110 }}>
                                Create
                              </TableCell>
                              <TableCell sx={{ fontWeight: 700, textAlign: 'center', width: 110 }}>
                                Read
                              </TableCell>
                              <TableCell sx={{ fontWeight: 700, textAlign: 'center', width: 110 }}>
                                Write
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                          {permissionRows.map((row, index) => {
                            if (row.type === 'group') {
                              return (
                                <TableRow
                                  key={`${row.groupId}-group`}
                                  sx={{
                                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                  }}
                                >
                                  <TableCell colSpan={4}>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                        {row.groupLabel}
                                      </Typography>
                                      <Stack direction="row" spacing={0.5} alignItems="center">
                                        <Typography variant="caption" color="text.secondary">
                                          Group access
                                        </Typography>
                                        <Checkbox
                                          size="small"
                                          checked={Boolean(fullAccess || row.hasGroupAccess)}
                                          onChange={() => toggleGroupAccess(row.groupId)}
                                          disabled={!selectedRole || Boolean(fullAccess) || !canManageRoles}
                                        />
                                      </Stack>
                                    </Stack>
                                  </TableCell>
                                </TableRow>
                              );
                            }

                            return (
                              <TableRow key={`${row.groupId}-${row.subjectKey}-${index}`}>
                                <TableCell>
                                  <Stack spacing={0.25}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {row.subjectLabel}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {row.subjectKey}
                                    </Typography>
                                    {row.otherActions.length > 0 ? (
                                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                        {row.otherActions.map((action) => (
                                          <Chip
                                            key={`${row.subjectKey}-${action}`}
                                            size="small"
                                            label={toTitleCase(action)}
                                            variant="outlined"
                                          />
                                        ))}
                                      </Stack>
                                    ) : null}
                                  </Stack>
                                </TableCell>
                                {ACTION_COLUMNS.map((action) => {
                                  const cell = row.actionPermissions[action];
                                  return (
                                    <TableCell key={`${row.subjectKey}-${action}`} align="center">
                                          {cell.exists ? (
                                        <Checkbox
                                          size="small"
                                          checked={cell.assigned}
                                          onChange={() => togglePermission(cell.key, row.groupId, row.subjectKey, row.actions)}
                                          disabled={
                                            !selectedRole ||
                                            Boolean(fullAccess || row.hasGroupAccess || !canManageRoles)
                                          }
                                        />
                                      ) : (
                                        <Typography variant="caption" color="text.secondary">
                                          —
                                        </Typography>
                                      )}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            );
                          })}
                          {permissionRows.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4}>
                                <Alert severity="info">
                                  No permissions available. Adjust the filters above.
                                </Alert>
                              </TableCell>
                            </TableRow>
                          ) : null}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Stack>
                </Box>
              </Card>

            </Stack>
          </Grid>
        </Grid>
        </Box>
      </Stack>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingRoleId ? 'Edit Role' : 'Create New Role'}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              label="Role Name"
              placeholder="e.g., Quality Reviewer"
              value={roleDraft.label}
              onChange={(event) => setRoleDraft((prev) => ({ ...prev, label: event.target.value }))}
            />
            <TextField
              label="Role Description"
              placeholder="Describe the key responsibility"
              value={roleDraft.description}
              onChange={(event) => setRoleDraft((prev) => ({ ...prev, description: event.target.value }))}
            />
            {!editingRoleId ? (
              <TextField
                select
                label="Clone Permissions From"
                value={roleDraft.cloneFromId}
                onChange={(event) => setRoleDraft((prev) => ({ ...prev, cloneFromId: event.target.value }))}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.label}
                  </MenuItem>
                ))}
              </TextField>
            ) : null}
            <Alert severity="info">
              Permissions can be adjusted after the role is created using the toggle matrix.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveRole} disabled={!canManageRoles}>
            {editingRoleId ? 'Save Changes' : 'Create Role'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Delete Role</DialogTitle>
        <DialogContent>
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
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteRole} disabled={!canManageRoles}>
            Delete Role
          </Button>
        </DialogActions>
      </Dialog>

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
