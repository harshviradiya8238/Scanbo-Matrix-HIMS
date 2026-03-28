'use client';

import * as React from 'react';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
  Tabs,
  Tab,
} from '@/src/ui/components/atoms';
import { Fade } from '@mui/material';
import { Card, CardHeader } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import {
  Business as BusinessIcon,
  AccessTime as AccessTimeIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  EventBusy as EventBusyIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  Shield as ShieldIcon,
  EventNote as EventNoteIcon,
} from '@mui/icons-material';

interface HospitalProfile {
  name: string;
  legalName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  gstin: string;
  registrationNumber: string;
}

interface DayHours {
  day: string;
  open: boolean;
  from: string;
  to: string;
}

interface Holiday {
  id: string;
  date: string;
  name: string;
}

const DEFAULT_PROFILE: HospitalProfile = {
  name: 'Scanbo General Hospital',
  legalName: 'Scanbo Healthcare Pvt. Ltd.',
  address: '42, Medical Complex, Sector 7',
  city: 'Ahmedabad',
  state: 'Gujarat',
  pincode: '380001',
  phone: '+91 79 2630 1000',
  email: 'admin@scanbohospital.com',
  website: 'www.scanbohospital.com',
  gstin: '24AAACS1234A1Z5',
  registrationNumber: 'GUJ/HOS/2018/04521',
};

const DAYS_OF_WEEK: DayHours[] = [
  { day: 'Monday',    open: true,  from: '08:00', to: '20:00' },
  { day: 'Tuesday',   open: true,  from: '08:00', to: '20:00' },
  { day: 'Wednesday', open: true,  from: '08:00', to: '20:00' },
  { day: 'Thursday',  open: true,  from: '08:00', to: '20:00' },
  { day: 'Friday',    open: true,  from: '08:00', to: '20:00' },
  { day: 'Saturday',  open: true,  from: '09:00', to: '17:00' },
  { day: 'Sunday',    open: false, from: '09:00', to: '14:00' },
];

const DEFAULT_HOLIDAYS: Holiday[] = [
  { id: 'h1', date: '2026-01-26', name: 'Republic Day' },
  { id: 'h2', date: '2026-08-15', name: 'Independence Day' },
  { id: 'h3', date: '2026-10-02', name: 'Gandhi Jayanti' },
  { id: 'h4', date: '2026-11-01', name: 'Diwali' },
];

function ProfileField({
  label,
  value,
  editing,
  onChange,
  multiline = false,
  icon,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  multiline?: boolean;
  icon?: React.ReactNode;
}) {
  const theme = useTheme();
  if (editing) {
    return (
      <TextField
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size="small"
        fullWidth
        multiline={multiline}
        rows={multiline ? 2 : 1}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            transition: 'all 0.2s',
            '&:hover fieldset': { borderColor: theme.palette.primary.main },
            '&.Mui-focused fieldset': { borderWidth: '2px' },
          },
        }}
      />
    );
  }
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.action.hover, 0.04),
        border: '1px solid transparent',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          borderColor: alpha(theme.palette.primary.main, 0.2),
          transform: 'translateY(-1px)',
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.05)}`,
        },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        {icon && (
          <Box sx={{ p: 0.5, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
            {icon}
          </Box>
        )}
        <Stack spacing={0.25} flex={1}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: value ? 'text.primary' : 'text.disabled' }}>
            {value || 'Not provided'}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

export default function FacilitySettingsPage() {
  const theme = useTheme();

  const [profile, setProfile] = React.useState<HospitalProfile>(DEFAULT_PROFILE);
  const [draftProfile, setDraftProfile] = React.useState<HospitalProfile>(DEFAULT_PROFILE);
  const [editingProfile, setEditingProfile] = React.useState(false);

  const [activeTab, setActiveTab] = React.useState(0);
  const [hours, setHours] = React.useState<DayHours[]>(DAYS_OF_WEEK);
  const [holidays, setHolidays] = React.useState<Holiday[]>(DEFAULT_HOLIDAYS);
  const [newHolidayDate, setNewHolidayDate] = React.useState('');
  const [newHolidayName, setNewHolidayName] = React.useState('');
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  const showSnack = (message: string, severity: 'success' | 'error' | 'info' = 'success') =>
    setSnackbar({ open: true, message, severity });

  const handleEditProfile = () => { setDraftProfile({ ...profile }); setEditingProfile(true); };
  const handleSaveProfile = () => { setProfile({ ...draftProfile }); setEditingProfile(false); showSnack('Hospital profile saved successfully.'); };
  const handleCancelProfile = () => { setDraftProfile({ ...profile }); setEditingProfile(false); };
  const updateDraft = (field: keyof HospitalProfile, value: string) => setDraftProfile((prev) => ({ ...prev, [field]: value }));

  const toggleDay = (index: number) => setHours((prev) => prev.map((d, i) => (i === index ? { ...d, open: !d.open } : d)));
  const updateHour = (index: number, field: 'from' | 'to', value: string) => setHours((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  const handleSaveHours = () => showSnack('Working hours updated.');

  const handleAddHoliday = () => {
    if (!newHolidayDate || !newHolidayName.trim()) { showSnack('Both date and holiday name are required.', 'error'); return; }
    const id = `h${Date.now()}`;
    setHolidays((prev) => [...prev, { id, date: newHolidayDate, name: newHolidayName.trim() }]);
    setNewHolidayDate(''); setNewHolidayName(''); showSnack('Holiday added.');
  };

  const handleRemoveHoliday = (id: string) => { setHolidays((prev) => prev.filter((h) => h.id !== id)); showSnack('Holiday removed.', 'info'); };

  const displayProfile = editingProfile ? draftProfile : profile;

  return (
    <PageTemplate title="Facility Settings" currentPageTitle="Facility Settings">
      <Stack spacing={2.5}> {/* Reduced from 4 */}

        {/* ── Banner ─────────────────────────────────────────────── */}
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
            sx={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0)} 70%)` }}
          />
          <Stack spacing={1} sx={{ position: 'relative', zIndex: 1 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
              <Chip size="small" label="Settings / Admin" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.15), color: 'primary.dark', fontWeight: 600 }} />
              <Typography variant="body2" color="text.secondary">/</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Facility</Typography>
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px', color: 'text.primary' }}>
              Facility Settings
            </Typography>
            
          </Stack>
        </Box>

        {/* ── Tabs ─────────────────────────────────── */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{
              minHeight: 40,
              '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.9rem', minWidth: 120, minHeight: 40, py: 0 },
            }}
          >
            <Tab icon={<BusinessIcon fontSize="small" sx={{ mr: 1 }}/>} iconPosition="start" label="Hospital Profile" />
            <Tab icon={<AccessTimeIcon fontSize="small" sx={{ mr: 1 }}/>} iconPosition="start" label="Working Hours" />
            <Tab icon={<EventNoteIcon fontSize="small" sx={{ mr: 1 }}/>} iconPosition="start" label="Holiday Calendar" />
          </Tabs>
        </Box>

        {/* Hospital Profile */}
        <Fade in={activeTab === 0} mountOnEnter unmountOnExit timeout={200}>
          <Box style={{ display: activeTab === 0 ? 'block' : 'none' }}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.background.default, 0.5), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Hospital Identity</Typography>
                  <Typography variant="body2" color="text.secondary">Core identity, registration and contact details</Typography>
                </Box>
                {editingProfile ? (
                  <Stack direction="row" spacing={1.5}>
                    <Button size="small" variant="outlined" startIcon={<CancelIcon />} onClick={handleCancelProfile} sx={{ borderRadius: 2 }}>Cancel</Button>
                    <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={handleSaveProfile} sx={{ borderRadius: 2, boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` }}>Save Changes</Button>
                  </Stack>
                ) : (
                  <Button size="small" variant="contained" startIcon={<EditIcon />} onClick={handleEditProfile} sx={{ borderRadius: 2, boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` }}>Edit Profile</Button>
                )}
              </Box>
              <Box sx={{ px: 3, py: 2 }}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="caption" sx={{ mb: 1.5, color: 'primary.main', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, display: 'block' }}>General Information</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                      <ProfileField icon={<BusinessIcon fontSize="small" />} label="Hospital Name" value={displayProfile.name} editing={editingProfile} onChange={(v) => updateDraft('name', v)} />
                      <ProfileField icon={<ShieldIcon fontSize="small" />} label="Legal / Registered Name" value={displayProfile.legalName} editing={editingProfile} onChange={(v) => updateDraft('legalName', v)} />
                    </Box>
                  </Box>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  <Box>
                    <Typography variant="caption" sx={{ mb: 1.5, color: 'primary.main', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, display: 'block' }}>Contact & Address</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 2, mb: 2 }}>
                      <ProfileField icon={<LocationOnIcon fontSize="small" />} label="Street Address" value={displayProfile.address} editing={editingProfile} onChange={(v) => updateDraft('address', v)} multiline />
                      <Stack spacing={2}>
                        <ProfileField label="City" value={displayProfile.city} editing={editingProfile} onChange={(v) => updateDraft('city', v)} />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                          <Box flex={1}><ProfileField label="State" value={displayProfile.state} editing={editingProfile} onChange={(v) => updateDraft('state', v)} /></Box>
                          <Box flex={1}><ProfileField label="Pincode" value={displayProfile.pincode} editing={editingProfile} onChange={(v) => updateDraft('pincode', v)} /></Box>
                        </Stack>
                      </Stack>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                      <ProfileField icon={<PhoneIcon fontSize="small" />} label="Phone" value={displayProfile.phone} editing={editingProfile} onChange={(v) => updateDraft('phone', v)} />
                      <ProfileField icon={<EmailIcon fontSize="small" />} label="Email" value={displayProfile.email} editing={editingProfile} onChange={(v) => updateDraft('email', v)} />
                      <ProfileField icon={<LanguageIcon fontSize="small" />} label="Website" value={displayProfile.website} editing={editingProfile} onChange={(v) => updateDraft('website', v)} />
                    </Box>
                  </Box>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  <Box>
                    <Typography variant="caption" sx={{ mb: 1.5, color: 'primary.main', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, display: 'block' }}>Registration Details</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                      <ProfileField label="GSTIN" value={displayProfile.gstin} editing={editingProfile} onChange={(v) => updateDraft('gstin', v)} />
                      <ProfileField label="Registration Number" value={displayProfile.registrationNumber} editing={editingProfile} onChange={(v) => updateDraft('registrationNumber', v)} />
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Card>
          </Box>
        </Fade>

        {/* Working Hours */}
        <Fade in={activeTab === 1} mountOnEnter unmountOnExit timeout={200}>
          <Box style={{ display: activeTab === 1 ? 'block' : 'none' }}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.background.default, 0.5), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>OPD Working Hours</Typography>
                  <Typography variant="body2" color="text.secondary">Define opening hours per day of the week</Typography>
                </Box>
                <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={handleSaveHours} sx={{ borderRadius: 2, boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` }}>
                  Save Hours
                </Button>
              </Box>
              <Box sx={{ p: 2 }}>
                <Stack spacing={1}>
                  {hours.map((row, index) => (
                    <Box
                      key={row.day}
                      sx={{
                        display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '140px 60px 1fr 1fr' }, gap: 2, alignItems: 'center',
                        borderRadius: 2, border: '1px solid', borderColor: row.open ? alpha(theme.palette.success.main, 0.3) : 'divider',
                        p: 1.5, transition: 'all 0.2s', backgroundColor: row.open ? alpha(theme.palette.success.main, 0.02) : alpha(theme.palette.action.disabledBackground, 0.2),
                        '&:hover': { borderColor: row.open ? theme.palette.success.main : theme.palette.action.disabled, transform: 'translateX(2px)' }
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: row.open ? 'success.main' : 'text.disabled', boxShadow: row.open ? `0 0 8px ${theme.palette.success.main}` : 'none' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: row.open ? 'text.primary' : 'text.disabled' }}>{row.day}</Typography>
                      </Stack>
                      <Switch size="small" checked={row.open} onChange={() => toggleDay(index)} color="success" />
                      <TextField label="From" type="time" value={row.from} onChange={(e) => updateHour(index, 'from', e.target.value)} size="small" disabled={!row.open} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                      <TextField label="To" type="time" value={row.to} onChange={(e) => updateHour(index, 'to', e.target.value)} size="small" disabled={!row.open} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Card>
          </Box>
        </Fade>

        {/* Holiday Calendar */}
        <Fade in={activeTab === 2} mountOnEnter unmountOnExit timeout={200}>
          <Box style={{ display: activeTab === 2 ? 'block' : 'none' }}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Holiday Calendar</Typography>
                <Typography variant="body2" color="text.secondary">{holidays.length} holiday{holidays.length !== 1 ? 's' : ''} defined in the system</Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Stack spacing={3}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '180px 1fr auto' }, gap: 2, alignItems: 'center', p: 2, bgcolor: alpha(theme.palette.primary.main, 0.02), border: '1px dashed', borderColor: alpha(theme.palette.primary.main, 0.3), borderRadius: 3 }}>
                    <TextField size="small" label="Select Date" type="date" value={newHolidayDate} onChange={(e) => setNewHolidayDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' } }} />
                    <TextField size="small" label="Holiday Name" value={newHolidayName} onChange={(e) => setNewHolidayName(e.target.value)} placeholder="e.g. Christmas, Diwali..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' } }} />
                    <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={handleAddHoliday} sx={{ height: '100%', borderRadius: 2, py: 1, px: 2, boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` }}>Add</Button>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    {holidays.slice().sort((a, b) => a.date.localeCompare(b.date)).map((holiday) => {
                      const dateObj = new Date(holiday.date + 'T00:00:00');
                      return (
                        <Box key={holiday.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', p: 1.5, transition: 'all 0.2s ease', '&:hover': { borderColor: theme.palette.primary.main, boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.08)}`, transform: 'translateY(-1px)' } }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 50, p: 0.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main' }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>{dateObj.getDate()}</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>{dateObj.toLocaleString('default', { month: 'short' })}</Typography>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{holiday.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{dateObj.getFullYear()}</Typography>
                          </Box>
                          <IconButton size="small" color="error" onClick={() => handleRemoveHoliday(holiday.id)} sx={{ bgcolor: alpha(theme.palette.error.main, 0.05), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15) } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      );
                    })}
                    {holidays.length === 0 && (
                      <Box sx={{ gridColumn: '1 / -1', p: 3, textAlign: 'center' }}>
                        <EventBusyIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1, opacity: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">No holidays defined yet</Typography>
                      </Box>
                    )}
                  </Box>
                </Stack>
              </Box>
            </Card>
          </Box>
        </Fade>

      </Stack>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>{snackbar.message}</Alert>
      </Snackbar>
    </PageTemplate>
  );
}
