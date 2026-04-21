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
} from '@/src/ui/components/atoms';
import { Card, StatTile } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';
import { PickersDay, type PickersDayProps } from '@mui/x-date-pickers/PickersDay';
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
import { maskMobileNumber } from '@/src/core/utils/phone';
import CustomCardTabs from '@/src/ui/components/molecules/CustomCardTabs';

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
  { day: 'Monday', open: true, from: '08:00', to: '20:00' },
  { day: 'Tuesday', open: true, from: '08:00', to: '20:00' },
  { day: 'Wednesday', open: true, from: '08:00', to: '20:00' },
  { day: 'Thursday', open: true, from: '08:00', to: '20:00' },
  { day: 'Friday', open: true, from: '08:00', to: '20:00' },
  { day: 'Saturday', open: true, from: '09:00', to: '17:00' },
  { day: 'Sunday', open: false, from: '09:00', to: '14:00' },
];

const DEFAULT_HOLIDAYS: Holiday[] = [
  { id: 'h1', date: '2026-01-26', name: 'Republic Day' },
  { id: 'h2', date: '2026-08-15', name: 'Independence Day' },
  { id: 'h3', date: '2026-10-02', name: 'Gandhi Jayanti' },
  { id: 'h4', date: '2026-11-01', name: 'Diwali' },
  { id: 'h4', date: '2026-11-01', name: 'Diwali' },
  { id: 'h4', date: '2026-11-01', name: 'Diwali' },
  { id: 'h4', date: '2026-11-01', name: 'Diwali' },
  { id: 'h4', date: '2026-11-01', name: 'Diwali' },
  { id: 'h4', date: '2026-11-01', name: 'Diwali' },
  { id: 'h4', date: '2026-11-01', name: 'Diwali' },
  { id: 'h4', date: '2026-11-01', name: 'Diwali' },
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
            borderRadius: 2.5,
            bgcolor: alpha(theme.palette.background.paper, 0.88),
            '&:hover fieldset': { borderColor: theme.palette.primary.main },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: theme.palette.primary.main,
          },
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        p: 1.6,
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.12),
        bgcolor: alpha(theme.palette.background.paper, 0.76),
        backdropFilter: 'blur(6px)',
      }}
    >
      <Stack direction="row" spacing={1.4} alignItems="flex-start">
        {icon && (
          <Box
            sx={{
              p: 0.8,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, 0.12),
            }}
          >
            {icon}
          </Box>
        )}
        <Stack spacing={0.25} flex={1}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              fontSize: '0.62rem',
            }}
          >
            {label}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 650 }}>
            {value || 'Not provided'}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

function HolidayDay(
  props: PickersDayProps & { holidayDates?: Set<string>; selectedDate?: string },
) {
  const { day, outsideCurrentMonth, holidayDates, selectedDate, sx, selected, ...other } = props;
  const theme = useTheme();
  const isHoliday = holidayDates?.has(day.format('YYYY-MM-DD')) ?? false;
  const isSelectedHoliday =
    isHoliday &&
    !outsideCurrentMonth &&
    (selectedDate === day.format('YYYY-MM-DD') || Boolean(selected));

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <PickersDay
        {...other}
        day={day}
        selected={selected}
        outsideCurrentMonth={outsideCurrentMonth}
        sx={{
          ...sx,
          ...(isSelectedHoliday
            ? {
                bgcolor: `${theme.palette.warning.main} !important`,
                color: `${theme.palette.warning.contrastText} !important`,
                fontWeight: 800,
                '&:hover, &:focus': {
                  bgcolor: `${theme.palette.warning.dark} !important`,
                },
              }
            : {}),
          ...(isHoliday && !outsideCurrentMonth
            ? {
                bgcolor: alpha(theme.palette.warning.main, 0.14),
                fontWeight: 700,
                '&.Mui-selected': {
                  bgcolor: `${theme.palette.warning.main} !important`,
                  color: `${theme.palette.warning.contrastText} !important`,
                },
              }
            : {}),
        }}
      />
      {isHoliday && !outsideCurrentMonth ? (
        <Box
          sx={{
            position: 'absolute',
            bottom: 4,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 5,
            height: 5,
            borderRadius: '50%',
            bgcolor: isSelectedHoliday
              ? theme.palette.warning.contrastText
              : theme.palette.warning.main,
          }}
        />
      ) : null}
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
  const [calendarDate, setCalendarDate] = React.useState<Dayjs>(dayjs(DEFAULT_HOLIDAYS[0]?.date ?? undefined));
  const [newHolidayDate, setNewHolidayDate] = React.useState('');
  const [newHolidayName, setNewHolidayName] = React.useState('');
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info',
  });

  const showSnack = (message: string, severity: 'success' | 'error' | 'info' = 'success') =>
    setSnackbar({ open: true, message, severity });

  const handleEditProfile = () => {
    setDraftProfile({ ...profile });
    setEditingProfile(true);
  };
  const handleSaveProfile = () => {
    setProfile({ ...draftProfile });
    setEditingProfile(false);
    showSnack('Hospital profile saved successfully.');
  };
  const handleCancelProfile = () => {
    setDraftProfile({ ...profile });
    setEditingProfile(false);
  };
  const updateDraft = (field: keyof HospitalProfile, value: string) =>
    setDraftProfile((prev) => ({ ...prev, [field]: value }));

  const toggleDay = (index: number) =>
    setHours((prev) => prev.map((d, i) => (i === index ? { ...d, open: !d.open } : d)));
  const updateHour = (index: number, field: 'from' | 'to', value: string) =>
    setHours((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  const handleSaveHours = () => showSnack('Working hours updated.');

  const handleAddHoliday = () => {
    if (!newHolidayDate || !newHolidayName.trim()) {
      showSnack('Both date and holiday name are required.', 'error');
      return;
    }
    const id = `h${Date.now()}`;
    setHolidays((prev) => [...prev, { id, date: newHolidayDate, name: newHolidayName.trim() }]);
    setCalendarDate(dayjs(newHolidayDate));
    setNewHolidayDate('');
    setNewHolidayName('');
    showSnack('Holiday added.');
  };

  const handleRemoveHoliday = (id: string) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
    showSnack('Holiday removed.', 'info');
  };

  const displayProfile = editingProfile ? draftProfile : profile;
  const openDays = hours.filter((d) => d.open).length;
  const profileCompletion = Math.round(
    (Object.values(profile).filter((value) => value.trim().length > 0).length / Object.values(profile).length) * 100,
  );
  const selectedDate = calendarDate.format('YYYY-MM-DD');
  const selectedDateHolidays = holidays.filter((holiday) => holiday.date === selectedDate);
  const holidayDates = React.useMemo(
    () => new Set(holidays.map((holiday) => holiday.date)),
    [holidays],
  );

  const profileTabContent = (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        mt: -1,
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ px: 2.3, py: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.background.default, 0.55), display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Hospital Identity</Typography>
          <Typography variant="body2" color="text.secondary">Core identity, registration and communication details</Typography>
        </Box>
        {editingProfile ? (
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" startIcon={<CancelIcon />} onClick={handleCancelProfile} sx={{ borderRadius: 2.2, textTransform: 'none', fontWeight: 700 }}>
              Cancel
            </Button>
            <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={handleSaveProfile} sx={{ borderRadius: 2.2, textTransform: 'none', fontWeight: 700 }}>
              Save Changes
            </Button>
          </Stack>
        ) : (
          <Button size="small" variant="contained" startIcon={<EditIcon />} onClick={handleEditProfile} sx={{ borderRadius: 2.2, textTransform: 'none', fontWeight: 700 }}>
            Edit Profile
          </Button>
        )}
      </Box>
      <Box sx={{ px: { xs: 1.5, md: 2.5 }, py: 2, flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <Stack spacing={2.4}>
          <Box>
            <Typography variant="caption" sx={{ mb: 1.2, color: 'primary.main', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', display: 'block' }}>
              General Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.4 }}>
              <ProfileField icon={<BusinessIcon fontSize="small" />} label="Hospital Name" value={displayProfile.name} editing={editingProfile} onChange={(v) => updateDraft('name', v)} />
              <ProfileField icon={<ShieldIcon fontSize="small" />} label="Legal / Registered Name" value={displayProfile.legalName} editing={editingProfile} onChange={(v) => updateDraft('legalName', v)} />
            </Box>
          </Box>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Box>
            <Typography variant="caption" sx={{ mb: 1.2, color: 'primary.main', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', display: 'block' }}>
              Contact & Address
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 1.4, mb: 1.4 }}>
              <ProfileField icon={<LocationOnIcon fontSize="small" />} label="Street Address" value={displayProfile.address} editing={editingProfile} onChange={(v) => updateDraft('address', v)} multiline />
              <Stack spacing={1.4}>
                <ProfileField label="City" value={displayProfile.city} editing={editingProfile} onChange={(v) => updateDraft('city', v)} />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.4}>
                  <Box flex={1}><ProfileField label="State" value={displayProfile.state} editing={editingProfile} onChange={(v) => updateDraft('state', v)} /></Box>
                  <Box flex={1}><ProfileField label="Pincode" value={displayProfile.pincode} editing={editingProfile} onChange={(v) => updateDraft('pincode', v)} /></Box>
                </Stack>
              </Stack>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 1.4 }}>
              <ProfileField icon={<PhoneIcon fontSize="small" />} label="Phone" value={editingProfile ? displayProfile.phone : maskMobileNumber(displayProfile.phone, 'Not provided')} editing={editingProfile} onChange={(v) => updateDraft('phone', v)} />
              <ProfileField icon={<EmailIcon fontSize="small" />} label="Email" value={displayProfile.email} editing={editingProfile} onChange={(v) => updateDraft('email', v)} />
              <ProfileField icon={<LanguageIcon fontSize="small" />} label="Website" value={displayProfile.website} editing={editingProfile} onChange={(v) => updateDraft('website', v)} />
            </Box>
          </Box>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Box>
            <Typography variant="caption" sx={{ mb: 1.2, color: 'primary.main', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', display: 'block' }}>
              Registration Details
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.4 }}>
              <ProfileField label="GSTIN" value={displayProfile.gstin} editing={editingProfile} onChange={(v) => updateDraft('gstin', v)} />
              <ProfileField label="Registration Number" value={displayProfile.registrationNumber} editing={editingProfile} onChange={(v) => updateDraft('registrationNumber', v)} />
            </Box>
          </Box>
        </Stack>
      </Box>
    </Card>
  );

  const workingHoursTabContent = (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        mt: -1,
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ px: 2.3, py: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.background.default, 0.55), display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>OPD Working Hours</Typography>
          <Typography variant="body2" color="text.secondary">Define opening hours by day</Typography>
        </Box>
        <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={handleSaveHours} sx={{ borderRadius: 2.2, textTransform: 'none', fontWeight: 700 }}>
          Save Hours
        </Button>
      </Box>
      <Box sx={{ p: 2, flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <Stack spacing={1.1}>
          {hours.map((row, index) => (
            <Box
              key={row.day}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '150px 64px 1fr 1fr' },
                gap: 1.5,
                alignItems: 'center',
                borderRadius: 2.5,
                border: row.open ? '1px solid' : '1px dashed',
                borderColor: row.open ? alpha(theme.palette.success.main, 0.28) : alpha(theme.palette.primary.main, 0.1),
                p: 1.4,
                bgcolor: row.open 
                  ? alpha(theme.palette.success.main, 0.04) 
                  : alpha(theme.palette.text.disabled, 0.03),
                transition: 'all 0.2s ease',
                opacity: row.open ? 1 : 0.8,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.2}>
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: row.open ? 'success.main' : alpha(theme.palette.text.disabled, 0.4),
                    boxShadow: row.open ? `0 0 8px ${theme.palette.success.main}` : 'none'
                  }} 
                />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: row.open ? 'text.primary' : 'text.disabled' }}>
                  {row.day}
                </Typography>
              </Stack>
              <Switch size="small" checked={row.open} onChange={() => toggleDay(index)} color="success" />
              <TextField
                label="From"
                type="time"
                value={row.from}
                onChange={(e) => updateHour(index, 'from', e.target.value)}
                size="small"
                disabled={!row.open}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.2 } }}
              />
              <TextField
                label="To"
                type="time"
                value={row.to}
                onChange={(e) => updateHour(index, 'to', e.target.value)}
                size="small"
                disabled={!row.open}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.2 } }}
              />
            </Box>
          ))}
        </Stack>
      </Box>
    </Card>
  );

  const holidayTabContent = (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        mt: -1,
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ px: 2.3, py: 1.8, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.background.default, 0.55) }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Holiday Calendar</Typography>
        <Typography variant="body2" color="text.secondary">
          {holidays.length} holiday{holidays.length !== 1 ? 's' : ''} defined in the system
        </Typography>
      </Box>
      <Box sx={{ p: 2, flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '360px 1fr' }, gap: 2 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2.6,
              overflow: 'hidden',
              border: 'none',
              boxShadow: 'none',
              bgcolor: 'transparent',
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                value={calendarDate}
                onChange={(value) => {
                  if (!value) return;
                  setCalendarDate(value);
                  setNewHolidayDate(value.format('YYYY-MM-DD'));
                }}
                slots={{ day: HolidayDay }}
                slotProps={{
                  day: {
                    holidayDates,
                    selectedDate,
                  } as PickersDayProps & { holidayDates: Set<string>; selectedDate: string },
                }}
                sx={{
                  border: 'none',
                  '& .MuiPickersDay-root': { border: 'none' },
                  '& .MuiDayCalendar-header, & .MuiDayCalendar-weekContainer': {
                    border: 'none',
                  },
                }}
              />
            </LocalizationProvider>
            <Box sx={{ px: 1.6, pb: 1.6 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                Events on selected date
              </Typography>
              <Stack spacing={0.8} sx={{ mt: 0.8 }}>
                {selectedDateHolidays.length > 0 ? (
                  selectedDateHolidays.map((holiday) => (
                    <Chip key={holiday.id} size="small" label={holiday.name} sx={{ justifyContent: 'flex-start', fontWeight: 600 }} color="warning" />
                  ))
                ) : (
                  <Typography variant="caption" color="text.secondary">No holiday on this date.</Typography>
                )}
              </Stack>
            </Box>
          </Card>

          <Stack spacing={1.6} sx={{ minHeight: 0 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '180px 1fr auto' }, gap: 1.2, alignItems: 'center', p: 1.4, borderRadius: 2.6, bgcolor: alpha(theme.palette.primary.main, 0.04), border: '1px dashed', borderColor: alpha(theme.palette.primary.main, 0.28) }}>
              <TextField
                size="small"
                label="Select Date"
                type="date"
                value={newHolidayDate}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewHolidayDate(value);
                  if (value) setCalendarDate(dayjs(value));
                }}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.2, bgcolor: 'background.paper' } }}
              />
              <TextField
                size="small"
                label="Holiday Name"
                value={newHolidayName}
                onChange={(e) => setNewHolidayName(e.target.value)}
                placeholder="e.g. Christmas, Diwali..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.2, bgcolor: 'background.paper' } }}
              />
              <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={handleAddHoliday} sx={{ borderRadius: 2.2, textTransform: 'none', fontWeight: 700, py: 1 }}>
                Add
              </Button>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 1.2,
                maxHeight: { xs: 'none', xl: 400 },
                overflowY: { xs: 'visible', xl: 'auto' },
                pr: { xs: 0, xl: 0.5 },
                alignContent: 'start',
                '&::-webkit-scrollbar': { width: 6 },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.22),
                  borderRadius: 999,
                },
              }}
            >
              {holidays
                .slice()
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((holiday) => {
                  const dateObj = new Date(`${holiday.date}T00:00:00`);
                  return (
                    <Box
                      key={holiday.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.2,
                        borderRadius: 2.2,
                        border: '1px solid',
                        borderColor: 'divider',
                        p: 1.25,
                        bgcolor: alpha(theme.palette.background.paper, 0.86),
                        transition: 'all .2s ease',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          minWidth: 48,
                          borderRadius: 1.8,
                          p: '4px 8px',
                          textAlign: 'center',
                          bgcolor: alpha(theme.palette.warning.main, 0.14),
                          color: 'warning.dark',
                        }}
                      >
                        <Typography sx={{ fontWeight: 800, lineHeight: 1.1 }}>{dateObj.getDate()}</Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.62rem', textTransform: 'uppercase' }}>
                          {dateObj.toLocaleString('default', { month: 'short' })}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {holiday.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{dateObj.getFullYear()}</Typography>
                      </Box>
                      <IconButton size="small" color="error" onClick={() => handleRemoveHoliday(holiday.id)} sx={{ bgcolor: alpha(theme.palette.error.main, 0.07), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.18) } }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  );
                })}
              {holidays.length === 0 && (
                <Box sx={{ gridColumn: '1 / -1', p: 3, textAlign: 'center' }}>
                  <EventBusyIcon sx={{ fontSize: 38, color: 'text.disabled', mb: 0.6, opacity: 0.55 }} />
                  <Typography variant="body2" color="text.secondary">No holidays defined yet</Typography>
                </Box>
              )}
            </Box>
          </Stack>
        </Box>
      </Box>
    </Card>
  );

  const tabItems = [
    { label: 'Hospital Profile', icon: <BusinessIcon fontSize="small" />, child: profileTabContent },
    { label: 'Working Hours', icon: <AccessTimeIcon fontSize="small" />, child: workingHoursTabContent },
    { label: 'Holiday Calendar', icon: <EventNoteIcon fontSize="small" />, child: holidayTabContent },
  ];

  return (
    <PageTemplate title="Facility Settings" currentPageTitle="Facility" fullHeight>
      <Box
        sx={{
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
          p: { xs: 1, md: 0 },
          fontFamily: '"Poppins", "DM Sans", sans-serif',
        }}
      >
        <Stack spacing={1} sx={{ height: '100%', minHeight: 0 }}>
           <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 1.5 }}>
            <StatTile
              label="Identity Completion"
              value={`${profileCompletion}%`}
              subtitle="Profile readiness"
              icon={<ShieldIcon />}
              tone="primary"
              sx={{ borderRadius: 3 }}
            />
            <StatTile
              label="Operational Days"
              value={`${openDays} / 7`}
              subtitle="Open in a week"
              icon={<AccessTimeIcon />}
              tone="success"
              sx={{ borderRadius: 3 }}
            />
            <StatTile
              label="Calendar Events"
              value={holidays.length}
              subtitle="Holidays configured"
              icon={<EventNoteIcon />}
              tone="warning"
              sx={{ borderRadius: 3 }}
            />
          </Box> 

          <CustomCardTabs
            items={tabItems}
            defaultValue={activeTab}
            sticky={false}
            showBackground
            scrollable
            sx={{ minHeight: 0, flex: 1 }}
            tabsSx={{
              display: 'inline-flex',
              alignSelf: 'flex-start',
              p: 0.3,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.background.paper, 0.88),
            }}
            onChange={(index) => setActiveTab(index)}
          />
        </Stack>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.14)' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageTemplate>
  );
}
