'use client';

import * as React from 'react';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import { Card, CardHeader } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import {
  History as HistoryIcon,
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  ManageAccounts as ManageAccountsIcon,
  Login as LoginIcon,
  DesktopMac as DesktopMacIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

type LogAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'PASSWORD_CHANGE'
  | 'ROLE_CHANGE'
  | 'SETTINGS_EDIT'
  | 'VIEW_RECORD';

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: LogAction;
  module: string;
  description: string;
  ip: string;
}

const SEED_LOGS: AuditEntry[] = [
  { id: 'a1',  timestamp: '2026-03-26T14:45:00', user: 'Dr. Arun Mehta',   role: 'Doctor',          action: 'LOGIN',           module: 'Auth',           description: 'Successful login',                               ip: '192.168.1.10' },
  { id: 'a2',  timestamp: '2026-03-26T14:42:10', user: 'Admin User',       role: 'Hospital Admin',  action: 'SETTINGS_EDIT',   module: 'Facility',       description: 'Updated hospital working hours',                 ip: '192.168.1.2'  },
  { id: 'a3',  timestamp: '2026-03-26T14:38:55', user: 'Admin User',       role: 'Hospital Admin',  action: 'CREATE',          module: 'Departments',    description: 'Created department: Neurosurgery',               ip: '192.168.1.2'  },
  { id: 'a4',  timestamp: '2026-03-26T14:30:00', user: 'Nurse Priya',      role: 'Nurse',           action: 'VIEW_RECORD',     module: 'Patients',       description: 'Viewed patient record: P-2041',                  ip: '192.168.1.25' },
  { id: 'a5',  timestamp: '2026-03-26T14:15:22', user: 'Rajesh Kumar',     role: 'Reception',       action: 'CREATE',          module: 'Appointments',   description: 'Booked appointment for patient P-3102',          ip: '192.168.1.11' },
  { id: 'a6',  timestamp: '2026-03-26T13:50:44', user: 'Admin User',       role: 'Hospital Admin',  action: 'ROLE_CHANGE',     module: 'Staff',          description: 'Changed role of user "Nurse Priya" to Nurse',   ip: '192.168.1.2'  },
  { id: 'a7',  timestamp: '2026-03-26T13:30:05', user: 'Vikram Singh',     role: 'Doctor',          action: 'UPDATE',          module: 'Clinical',       description: 'Updated prescription for encounter E-5512',      ip: '192.168.1.18' },
  { id: 'a8',  timestamp: '2026-03-26T13:10:17', user: 'Admin User',       role: 'Hospital Admin',  action: 'DELETE',          module: 'Master Data',    description: 'Deleted duplicate ICD-10 code: J06.9',           ip: '192.168.1.2'  },
  { id: 'a9',  timestamp: '2026-03-26T12:55:30', user: 'Sneha Joshi',      role: 'Doctor',          action: 'LOGIN',           module: 'Auth',           description: 'Successful login',                               ip: '192.168.1.14' },
  { id: 'a10', timestamp: '2026-03-26T12:40:00', user: 'Billing Staff',    role: 'Billing',         action: 'CREATE',          module: 'Billing',        description: 'Generated invoice INV-20240122 for P-1902',      ip: '192.168.1.30' },
  { id: 'a11', timestamp: '2026-03-26T12:20:00', user: 'Admin User',       role: 'Hospital Admin',  action: 'PASSWORD_CHANGE', module: 'Auth',           description: 'Reset password for user "Rajesh Kumar"',         ip: '192.168.1.2'  },
  { id: 'a12', timestamp: '2026-03-26T12:00:12', user: 'Dr. Arun Mehta',   role: 'Doctor',          action: 'LOGOUT',          module: 'Auth',           description: 'User logged out',                                ip: '192.168.1.10' },
  { id: 'a13', timestamp: '2026-03-26T11:45:05', user: 'Pharmacy Staff',   role: 'Pharmacist',      action: 'UPDATE',          module: 'Pharmacy',       description: 'Dispensed medicines for prescription RX-8812',   ip: '192.168.1.33' },
  { id: 'a14', timestamp: '2026-03-26T11:30:00', user: 'Admin User',       role: 'Hospital Admin',  action: 'CREATE',          module: 'Staff',          description: 'Invited new user: Nurse Kavya Reddy',            ip: '192.168.1.2'  },
  { id: 'a15', timestamp: '2026-03-26T11:00:22', user: 'Lab Technician',   role: 'Lab',             action: 'UPDATE',          module: 'Lab',            description: 'Uploaded lab results for order LB-0451',         ip: '192.168.1.40' },
];

type Tone = 'success' | 'warning' | 'error' | 'info' | 'secondary';

const ACTION_META: Record<LogAction, { label: string; tone: Tone }> = {
  LOGIN:           { label: 'Login',           tone: 'success' },
  LOGOUT:          { label: 'Logout',          tone: 'secondary' },
  CREATE:          { label: 'Create',          tone: 'info' },
  UPDATE:          { label: 'Update',          tone: 'warning' },
  DELETE:          { label: 'Delete',          tone: 'error' },
  PASSWORD_CHANGE: { label: 'Password', tone: 'warning' },
  ROLE_CHANGE:     { label: 'Role Change',     tone: 'error' },
  SETTINGS_EDIT:   { label: 'Settings',   tone: 'warning' },
  VIEW_RECORD:     { label: 'View',     tone: 'secondary' },
};

const TONE_COLOR: Record<Tone, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
  secondary: 'default',
};

function fmtTimestamp(ts: string): string {
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export default function AuditLogsPage() {
  const theme = useTheme();

  const [logs, setLogs] = React.useState<AuditEntry[]>(SEED_LOGS);
  const [search, setSearch] = React.useState('');
  const [actionFilter, setActionFilter] = React.useState<'all' | LogAction>('all');
  const [moduleFilter, setModuleFilter] = React.useState('all');
  const [userFilter, setUserFilter] = React.useState('all');

  const uniqueModules = React.useMemo(() => ['all', ...Array.from(new Set(logs.map((l) => l.module))).sort()], [logs]);
  const uniqueUsers = React.useMemo(() => ['all', ...Array.from(new Set(logs.map((l) => l.user))).sort()], [logs]);
  const uniqueActions = React.useMemo(() => ['all', ...Array.from(new Set(logs.map((l) => l.action)))] as ('all' | LogAction)[], [logs]);

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase();
    return logs.filter((entry) => {
      const matchSearch = !q || entry.user.toLowerCase().includes(q) || entry.description.toLowerCase().includes(q) || entry.ip.includes(q);
      const matchAction = actionFilter === 'all' || entry.action === actionFilter;
      const matchModule = moduleFilter === 'all' || entry.module === moduleFilter;
      const matchUser = userFilter === 'all' || entry.user === userFilter;
      return matchSearch && matchAction && matchModule && matchUser;
    });
  }, [logs, search, actionFilter, moduleFilter, userFilter]);

  const stats = React.useMemo(() => ({
    total: logs.length,
    critical: logs.filter((l) => l.action === 'DELETE' || l.action === 'ROLE_CHANGE').length,
    settings: logs.filter((l) => l.action === 'SETTINGS_EDIT').length,
    logins: logs.filter((l) => l.action === 'LOGIN').length,
  }), [logs]);

  const handleRefresh = () => {
    setLogs([...SEED_LOGS]);
    setSearch(''); setActionFilter('all'); setModuleFilter('all'); setUserFilter('all');
  };

  return (
    <PageTemplate title="Audit Logs" currentPageTitle="Audit Logs">
      <Stack spacing={1.25}>

        {/* Banner with Gradient & Modern Typography */}
        <Box
          sx={{
            p: 2.5,
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.15),
          }}
        >
          <Box
            sx={{ position: 'absolute', top: -80, right: -40, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0)} 70%)`, zIndex: 0 }}
          />
          <Stack spacing={1} sx={{ position: 'relative', zIndex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip size="small" label="Settings / Admin" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.15), color: 'primary.dark', fontWeight: 600 }} />
              <Typography variant="body2" color="text.secondary">/</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Audit Logs</Typography>
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px', color: 'text.primary' }}>
              System Audit Logs
            </Typography>
          </Stack>
        </Box>

        {/* Stats Section with Glassmorphism */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          {[
            { label: 'Total Tracked Events', value: stats.total, color: theme.palette.primary.main, icon: <HistoryIcon /> },
            { label: 'Critical Action Flags', value: stats.critical, color: theme.palette.error.main, icon: <SecurityIcon /> },
            { label: 'Configuration Changes', value: stats.settings, color: theme.palette.warning.main, icon: <ManageAccountsIcon /> },
            { label: 'Authentications Today', value: stats.logins, color: theme.palette.success.main, icon: <LoginIcon /> }
          ].map((stat, idx) => (
            <Box
              key={idx}
              sx={{
                flex: 1,
                p: 2, /* Reduced from top 3 */
                borderRadius: 4,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                boxShadow: `0 4px 20px ${alpha(stat.color, 0.08)}`,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)' }
              }}
            >
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(stat.color, 0.1), color: stat.color }}>
                {stat.icon}
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>{stat.value}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mt: 0.5 }}>{stat.label}</Typography>
              </Box>
            </Box>
          ))}
        </Stack>

        {/* Filters + Table */}
        <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center', bgcolor: alpha(theme.palette.background.default, 0.4) }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Event Ledger</Typography>
              <Typography variant="body2" color="text.secondary">Showing {filtered.length} matching events from log history</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh} sx={{ borderRadius: 2 }}>
                Refresh Data
              </Button>
              <Button size="small" variant="contained" startIcon={<FileDownloadIcon />} disabled sx={{ borderRadius: 2 }}>
                Export Result
              </Button>
            </Stack>
          </Box>

          <Box sx={{ p: 2 }}>
            {/* Filter row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
              <TextField 
                size="small" 
                placeholder="Search user, action, IP..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                InputProps={{ startAdornment: <SearchIcon color="action" fontSize="small" sx={{ mr: 1 }} /> }}
              />
              <TextField select size="small" label="Action Category" value={actionFilter} onChange={(e) => setActionFilter(e.target.value as 'all' | LogAction)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
                {uniqueActions.map((a) => <MenuItem key={a} value={a}>{a === 'all' ? 'All Activities' : ACTION_META[a].label}</MenuItem>)}
              </TextField>
              <TextField select size="small" label="Module Segment" value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
                {uniqueModules.map((m) => <MenuItem key={m} value={m}>{m === 'all' ? 'All Segments' : m}</MenuItem>)}
              </TextField>
              <TextField select size="small" label="Filter by User" value={userFilter} onChange={(e) => setUserFilter(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
                {uniqueUsers.map((u) => <MenuItem key={u} value={u}>{u === 'all' ? 'Every User' : u}</MenuItem>)}
              </TextField>
            </Box>

            {/* Log entries */}
            <Stack spacing={1}>
              {filtered.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center', bgcolor: alpha(theme.palette.background.default, 0.3), borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
                  <HistoryIcon sx={{ fontSize: 40, color: 'text.disabled', opacity: 0.6, mb: 1 }} />
                  <Typography variant="body2" color="text.disabled">No Logs Found for current filters.</Typography>
                </Box>
              )}
              {filtered.map((entry) => {
                const meta = ACTION_META[entry.action];
                const chipColor = TONE_COLOR[meta.tone];
                const isCritical = entry.action === 'DELETE' || entry.action === 'ROLE_CHANGE';
                return (
                  <Box
                    key={entry.id}
                    sx={{
                      display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '220px 1fr 200px' }, gap: 1.5, alignItems: 'center',
                      borderRadius: 3, border: '1px solid', borderColor: isCritical ? alpha(theme.palette.error.main, 0.4) : 'divider',
                      backgroundColor: isCritical ? alpha(theme.palette.error.main, 0.02) : 'transparent',
                      p: 1.5, transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: isCritical ? alpha(theme.palette.error.main, 0.04) : alpha(theme.palette.primary.main, 0.04),
                        borderColor: isCritical ? theme.palette.error.main : theme.palette.primary.main,
                        transform: 'translateX(2px)',
                      }
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: isCritical ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.primary.main, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', color: isCritical ? 'error.main' : 'primary.main', flexShrink: 0 }}>
                        {entry.action === 'LOGIN' || entry.action === 'LOGOUT' ? <LoginIcon fontSize="small" /> : entry.action === 'ROLE_CHANGE' || entry.action === 'PASSWORD_CHANGE' ? <LockIcon fontSize="small" /> : <HistoryIcon fontSize="small" />}
                      </Box>
                      <Stack>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{entry.user}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{entry.role}</Typography>
                      </Stack>
                    </Stack>

                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.25 }}>{entry.description}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                         <Chip size="small" label={entry.action.replace('_', ' ')} color={chipColor} sx={{ fontWeight: 600, height: 18, fontSize: '0.65rem' }} />
                         <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}><DesktopMacIcon sx={{ fontSize: 12 }} /> {entry.ip}</Typography>
                      </Stack>
                    </Box>

                    <Stack alignItems="flex-end" spacing={0.5}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>{fmtTimestamp(entry.timestamp)}</Typography>
                      <Chip size="small" label={entry.module} variant="outlined" sx={{ fontWeight: 600, color: 'text.secondary', borderColor: 'divider', height: 20, fontSize: '0.65rem' }} />
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Card>

      </Stack>
    </PageTemplate>
  );
}
