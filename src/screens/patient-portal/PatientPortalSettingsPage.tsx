'use client';

import * as React from 'react';
import { Box, Button, MenuItem, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import { Switch, TextField, Select } from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import PatientPortalWorkspaceCard from './components/PatientPortalWorkspaceCard';
import { ppSectionCard, ppSectionHeader } from './patient-portal-styles';

interface NotificationPref {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

const NOTIFICATION_PREFS: NotificationPref[] = [
  { id: 'appt-reminders', label: 'Appointment Reminders', description: 'Get notified before upcoming appointments', defaultOn: true },
  { id: 'med-alerts', label: 'Medication Alerts', description: 'Reminders for medication doses', defaultOn: true },
  { id: 'lab-ready', label: 'Lab Result Ready', description: 'Notify when lab results are available', defaultOn: true },
  { id: 'report-shared', label: 'Report Shared', description: 'Notify when a doctor shares a report', defaultOn: true },
  { id: 'bill-reminders', label: 'Bill Reminders', description: 'Alerts for pending or overdue bills', defaultOn: false },
  { id: 'doctor-messages', label: 'Doctor Messages', description: 'Notifications for new messages from doctors', defaultOn: true },
];

export default function PatientPortalSettingsPage() {
  const theme = useTheme();

  const [notifToggles, setNotifToggles] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(NOTIFICATION_PREFS.map((p) => [p.id, p.defaultOn])),
  );
  const [twoFactor, setTwoFactor] = React.useState(true);
  const [loginAlerts, setLoginAlerts] = React.useState(true);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [language, setLanguage] = React.useState('en');
  const [dateFormat, setDateFormat] = React.useState('dd/mm/yyyy');
  const [themeMode, setThemeMode] = React.useState('light');

  const toggleNotif = (id: string) => setNotifToggles((prev) => ({ ...prev, [id]: !prev[id] }));

  const sectionCard = ppSectionCard(theme);
  const sectionHeader = ppSectionHeader(theme);

  return (
    <PatientPortalWorkspaceCard current="settings">
      <Stack spacing={2}>
        {/* Two-column grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          {/* Notification Preferences */}
          <Card elevation={0} sx={sectionCard}>
            <Box sx={sectionHeader}>
              <Stack direction="row" spacing={1} alignItems="center">
                <NotificationsIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Notification Preferences</Typography>
              </Stack>
            </Box>
            <Box>
              {NOTIFICATION_PREFS.map((pref, idx) => (
                <Box
                  key={pref.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1.25,
                    borderBottom: idx < NOTIFICATION_PREFS.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{pref.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{pref.description}</Typography>
                  </Box>
                  <Switch checked={notifToggles[pref.id] ?? false} onChange={() => toggleNotif(pref.id)} color="primary" />
                </Box>
              ))}
            </Box>
          </Card>

          {/* Security */}
          <Card elevation={0} sx={sectionCard}>
            <Box sx={sectionHeader}>
              <Stack direction="row" spacing={1} alignItems="center">
                <SecurityIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Security</Typography>
              </Stack>
            </Box>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Two-Factor Authentication</Typography>
                  <Typography variant="caption" color="text.secondary">Add an extra layer of security to your account</Typography>
                </Box>
                <Switch checked={twoFactor} onChange={() => setTwoFactor(!twoFactor)} color="primary" />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Login Alerts</Typography>
                  <Typography variant="caption" color="text.secondary">Get notified when your account is accessed from a new device</Typography>
                </Box>
                <Switch checked={loginAlerts} onChange={() => setLoginAlerts(!loginAlerts)} color="primary" />
              </Box>

              <Box sx={{ pt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5 }}>Change Password</Typography>
                <Stack spacing={1.5}>
                  <TextField size="small" type="password" label="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} fullWidth />
                  <TextField size="small" type="password" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} fullWidth />
                  <TextField size="small" type="password" label="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} fullWidth />
                  <Button variant="contained" disableElevation size="small" sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600 }}>
                    Update Password
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Card>
        </Box>

        {/* App Preferences */}
        <Card elevation={0} sx={sectionCard}>
          <Box sx={sectionHeader}>
            <Stack direction="row" spacing={1} alignItems="center">
              <SettingsIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>App Preferences</Typography>
            </Stack>
          </Box>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>Language</Typography>
                <Select size="small" fullWidth value={language} onChange={(e) => setLanguage(e.target.value as string)}>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="hi">Hindi</MenuItem>
                  <MenuItem value="gu">Gujarati</MenuItem>
                </Select>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>Date Format</Typography>
                <Select size="small" fullWidth value={dateFormat} onChange={(e) => setDateFormat(e.target.value as string)}>
                  <MenuItem value="dd/mm/yyyy">DD/MM/YYYY</MenuItem>
                  <MenuItem value="mm/dd/yyyy">MM/DD/YYYY</MenuItem>
                  <MenuItem value="yyyy-mm-dd">YYYY-MM-DD</MenuItem>
                </Select>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>Default Theme</Typography>
                <Select size="small" fullWidth value={themeMode} onChange={(e) => setThemeMode(e.target.value as string)}>
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                </Select>
              </Box>
            </Box>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" disableElevation size="small" sx={{ textTransform: 'none', fontWeight: 600 }}>
                Save Preferences
              </Button>
            </Box>
          </Box>
        </Card>

        {/* Danger Zone */}
        <Card elevation={0} sx={{ ...ppSectionCard(theme), borderColor: alpha(theme.palette.error.main, 0.3) }}>
          <Box sx={{ ...ppSectionHeader(theme), backgroundColor: alpha(theme.palette.error.main, 0.04), borderColor: alpha(theme.palette.error.main, 0.2) }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <WarningIcon fontSize="small" color="error" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'error.main' }}>Danger Zone</Typography>
            </Stack>
          </Box>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Delete Account</Typography>
              <Typography variant="caption" color="text.secondary">
                Permanently delete your account and all associated data. This action cannot be undone.
              </Typography>
            </Box>
            <Button variant="outlined" color="error" size="small" sx={{ textTransform: 'none', fontWeight: 600, flexShrink: 0 }}>
              Delete Account
            </Button>
          </Box>
        </Card>
      </Stack>
    </PatientPortalWorkspaceCard>
  );
}
