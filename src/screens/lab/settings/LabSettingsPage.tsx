'use client';

import * as React from 'react';
import PageTemplate from '@/src/ui/components/PageTemplate';
import { Alert, Box, Button, Snackbar, Stack, TextField, Typography } from '@/src/ui/components/atoms';
import { useTheme } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { updateSettings } from '@/src/store/slices/limsSlice';
import { useLabTheme } from '../lab-theme';
import LabWorkspaceCard from '../components/LabWorkspaceCard';

const SETTINGS_MENU = ['Lab Details', 'Users & Roles', 'Sample Types', 'Analysis Services', 'Departments', 'Email Templates', 'Billing', 'Integrations'];

export default function LabSettingsPage() {
  const theme = useTheme();
  const lab = useLabTheme(theme);
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector((state) => state.lims);
  const [activeMenu, setActiveMenu] = React.useState(0);
  const [form, setForm] = React.useState(settings);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string }>({ open: false, message: '' });

  React.useEffect(() => setForm(settings), [settings]);

  const handleSave = () => {
    dispatch(updateSettings(form));
    setSnackbar({ open: true, message: 'Settings saved.' });
  };

  return (
    <PageTemplate title="Settings" subtitle="System configuration" currentPageTitle="Settings">
      <LabWorkspaceCard current="settings">
        <Stack spacing={2}>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '220px 1fr' } }}>
          <Box sx={{ ...lab.cardSx, p: 1 }}>
            {SETTINGS_MENU.map((item, i) => (
              <Box
                key={item}
                onClick={() => setActiveMenu(i)}
                sx={{
                  py: 1.25,
                  px: 1,
                  cursor: 'pointer',
                  color: i === activeMenu ? 'primary.main' : 'text.secondary',
                  borderLeft: '2px solid',
                  borderLeftColor: i === activeMenu ? 'primary.main' : 'transparent',
                  pl: i === activeMenu ? 1.5 : 1,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Typography variant="body2">{item}</Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ ...lab.cardSx, p: 2 }}>
            {activeMenu === 0 && (
              <>
                <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: 1.5, mb: 2, display: 'block' }}>Lab Details</Typography>
                <Stack spacing={2}>
                  <TextField label="Lab Name" value={form.labName} onChange={(e) => setForm((p) => ({ ...p, labName: e.target.value }))} size="small" fullWidth />
                  <TextField label="Lab ID" value={form.labId} onChange={(e) => setForm((p) => ({ ...p, labId: e.target.value }))} size="small" fullWidth />
                  <TextField label="Director" value={form.director} onChange={(e) => setForm((p) => ({ ...p, director: e.target.value }))} size="small" fullWidth />
                  <TextField label="Accreditation" value={form.accreditation} onChange={(e) => setForm((p) => ({ ...p, accreditation: e.target.value }))} size="small" fullWidth />
                  <TextField label="City" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} size="small" fullWidth />
                  <TextField label="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} size="small" fullWidth />
                  <TextField label="Email" value={form.email || ''} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} size="small" fullWidth />
                  <TextField label="Report Footer" value={form.footer || ''} onChange={(e) => setForm((p) => ({ ...p, footer: e.target.value }))} multiline rows={2} size="small" fullWidth />
                  <Button variant="contained" onClick={handleSave}>Save Changes</Button>
                </Stack>
              </>
            )}
          {activeMenu !== 0 && (
            <Typography color="text.secondary">Configure this section in a future update.</Typography>
          )}
          </Box>
        </Box>
        </Stack>
      </LabWorkspaceCard>
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </PageTemplate>
  );
}
