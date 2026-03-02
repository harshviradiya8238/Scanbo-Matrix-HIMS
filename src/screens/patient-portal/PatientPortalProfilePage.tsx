'use client';

import React from 'react';
import { Avatar, Box, Button, Chip, Divider, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { StatTile } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import {
  CalendarMonth as CalendarMonthIcon,
  ContactPhone as ContactPhoneIcon,
  FavoriteBorder as FavoriteBorderIcon,
  History as HistoryIcon,
  LocalHospital as LocalHospitalIcon,
  LocalPrintshop as PrintIcon,
  MedicalInformation as MedicalInformationIcon,
  Message as MessageIcon,
  MonitorHeart as MonitorHeartIcon,
  Person as PersonIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import PatientPortalWorkspaceCard from './components/PatientPortalWorkspaceCard';
import { PATIENT, APPOINTMENTS, MEDICATIONS } from './patient-portal-mock-data';
import { ppSectionCard, ppSectionHeader } from './patient-portal-styles';

const MEDICAL_HISTORY = [
  { label: 'Past Surgeries',      value: PATIENT.pastSurgeries,      icon: <LocalHospitalIcon sx={{ fontSize: 15 }} /> },
  { label: 'Family History',      value: PATIENT.familyHistory,       icon: <FavoriteBorderIcon sx={{ fontSize: 15 }} /> },
  { label: 'Current Medications', value: PATIENT.currentMedications,  icon: <LocalPharmacyIcon sx={{ fontSize: 15 }} /> },
  { label: 'Smoking / Alcohol',   value: PATIENT.smokingAlcohol,      icon: <ShieldIcon sx={{ fontSize: 15 }} /> },
  { label: 'Last Checkup',        value: PATIENT.lastCheckup,         icon: <HistoryIcon sx={{ fontSize: 15 }} /> },
] as const;

export default function PatientPortalProfilePage() {
  const theme = useTheme();
  const [saved, setSaved] = React.useState(false);
  const [form, setForm] = React.useState({
    name: PATIENT.name,
    dob: PATIENT.dob,
    gender: PATIENT.gender,
    bloodGroup: PATIENT.bloodGroup,
    address: PATIENT.address,
    phone: PATIENT.phone,
    email: PATIENT.email,
    emergencyName: PATIENT.emergencyContactName,
    emergencyPhone: PATIENT.emergencyContactPhone,
    conditions: PATIENT.conditions.join(', '),
  });

  const set =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sectionCard = ppSectionCard(theme);
  const sectionHeader = ppSectionHeader(theme);

  const upcomingCount = APPOINTMENTS.filter((a) => a.status === 'upcoming').length;
  const activeMedCount = MEDICATIONS.length;
  const lastVisit = APPOINTMENTS.filter((a) => a.status === 'completed').at(0);
  const nextAppt = APPOINTMENTS.filter((a) => a.status === 'upcoming').at(0);

  return (
    <PatientPortalWorkspaceCard current="profile" hidePatientBar>
      <Stack spacing={2.5}>

        {/* ── Header Card — matches OPD PatientProfilePage card exactly ── */}
        <Card elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', lg: 'center' }}
            justifyContent="space-between"
          >
            {/* Left: Avatar + name + meta */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  fontSize: 20,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {PATIENT.initials}
              </Avatar>

              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {PATIENT.name}
                </Typography>

                <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 0.5 }}>
                  {[
                    { label: 'PID',        value: PATIENT.pid },
                    { label: 'Age',        value: `${PATIENT.age} yrs` },
                    { label: 'Gender',     value: PATIENT.gender },
                    { label: 'Blood Grp',  value: PATIENT.bloodGroup },
                  ].map((meta) => (
                    <Stack key={meta.label} direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="caption" color="text.secondary">{meta.label}:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>{meta.value}</Typography>
                    </Stack>
                  ))}
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                  <Chip label="Active" color="success" variant="outlined" size="small" />
                  <Chip label="Patient Portal" color="info" variant="outlined" size="small" />
                  {PATIENT.conditions.map((c) => (
                    <Chip key={c} label={c} size="small" variant="outlined" />
                  ))}
                  {PATIENT.allergies !== 'None Known' && (
                    <Chip label="Has Allergies" color="error" variant="outlined" size="small" />
                  )}
                </Stack>
              </Box>
            </Stack>

            {/* Right: Action buttons */}
            <Stack direction={{ xs: 'row', sm: 'row' }} spacing={1} flexWrap="wrap" alignSelf={{ xs: 'stretch', lg: 'center' }}>
              <Button variant="contained" disableElevation startIcon={<CalendarMonthIcon sx={{ fontSize: 16 }} />}
                sx={{ textTransform: 'none', fontWeight: 600 }}>
                New Appointment
              </Button>
              <Button variant="outlined" startIcon={<MessageIcon sx={{ fontSize: 16 }} />}
                sx={{ textTransform: 'none', fontWeight: 600 }}>
                Send Message
              </Button>
              <Button variant="outlined" startIcon={<PrintIcon sx={{ fontSize: 16 }} />}
                onClick={() => typeof window !== 'undefined' && window.print()}
                sx={{ textTransform: 'none', fontWeight: 600 }}>
                Print Chart
              </Button>
            </Stack>
          </Stack>
        </Card>

        {/* ── Stat Tiles ── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
          <StatTile
            label="Total Appointments"
            value={APPOINTMENTS.length}
            subtitle={lastVisit ? `Last: ${lastVisit.month} ${lastVisit.day}` : 'No visits yet'}
            icon={<CalendarMonthIcon fontSize="small" />}
            variant="soft"
          />
          <StatTile
            label="Active Medications"
            value={activeMedCount}
            subtitle="Currently on profile"
            icon={<LocalPharmacyIcon fontSize="small" />}
            variant="soft"
          />
          <StatTile
            label="Upcoming Visits"
            value={upcomingCount}
            subtitle={nextAppt ? `Next: ${nextAppt.month} ${nextAppt.day}` : 'None scheduled'}
            icon={<MonitorHeartIcon fontSize="small" />}
            variant="soft"
          />
          <StatTile
            label="Last Checkup"
            value={PATIENT.lastCheckup}
            subtitle="General medicine"
            icon={<MedicalInformationIcon fontSize="small" />}
            variant="soft"
          />
        </Box>

        {/* ── Main two-column form + history ── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1.4fr 1fr' }, gap: 2 }}>

          {/* Left — editable forms */}
          <Stack spacing={2}>

            {/* Personal Information */}
            <Card elevation={0} sx={sectionCard}>
              <Box sx={sectionHeader}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PersonIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Personal Information</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" size="small" sx={{ textTransform: 'none', fontWeight: 600 }}
                      onClick={() => setForm((p) => ({ ...p,
                        name: PATIENT.name, dob: PATIENT.dob, gender: PATIENT.gender,
                        bloodGroup: PATIENT.bloodGroup, address: PATIENT.address,
                      }))}>
                      Discard
                    </Button>
                    <Button variant="contained" disableElevation size="small"
                      sx={{ textTransform: 'none', fontWeight: 600 }} onClick={handleSave}>
                      {saved ? 'Saved ✓' : 'Save'}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
              <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.75 }}>
                <TextField label="Full Name" size="small" fullWidth value={form.name} onChange={set('name')} />
                <TextField
                  label="Date of Birth" type="date" size="small" fullWidth
                  InputLabelProps={{ shrink: true }} value={form.dob} onChange={set('dob')}
                />
                <FormControl size="small" fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select label="Gender" value={form.gender}
                    onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value as string }))}>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth>
                  <InputLabel>Blood Group</InputLabel>
                  <Select label="Blood Group" value={form.bloodGroup}
                    onChange={(e) => setForm((p) => ({ ...p, bloodGroup: e.target.value as string }))}>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <MenuItem key={bg} value={bg}>{bg}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Address" size="small" fullWidth multiline rows={2}
                  value={form.address} onChange={set('address')}
                  sx={{ gridColumn: { sm: '1 / -1' } }}
                />
              </Box>
            </Card>

            {/* Contact & Emergency */}
            <Card elevation={0} sx={sectionCard}>
              <Box sx={sectionHeader}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ContactPhoneIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Contact &amp; Emergency</Typography>
                </Stack>
              </Box>
              <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.75 }}>
                <TextField label="Phone Number" size="small" fullWidth value={form.phone} onChange={set('phone')} />
                <TextField label="Email Address" size="small" fullWidth value={form.email} onChange={set('email')} />

                <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
                  <Divider>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, px: 1 }}>
                      Emergency Contact
                    </Typography>
                  </Divider>
                </Box>

                <TextField label="Contact Name" size="small" fullWidth value={form.emergencyName} onChange={set('emergencyName')} />
                <TextField label="Contact Phone" size="small" fullWidth value={form.emergencyPhone} onChange={set('emergencyPhone')} />
                <TextField
                  label="Medical Conditions" size="small" fullWidth
                  value={form.conditions} onChange={set('conditions')}
                  sx={{ gridColumn: { sm: '1 / -1' } }}
                />
              </Box>
            </Card>
          </Stack>

          {/* Right — read-only health snapshot + medical history */}
          <Stack spacing={2}>

            {/* Health Snapshot */}
            <Card elevation={0} sx={sectionCard}>
              <Box sx={sectionHeader}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <MedicalInformationIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Health Snapshot</Typography>
                </Stack>
              </Box>
              <Box sx={{ p: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  Active Conditions
                </Typography>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.75, mb: 2 }}>
                  {PATIENT.conditions.map((c) => (
                    <Chip key={c} label={c} size="small"
                      sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.dark', fontWeight: 700, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}
                    />
                  ))}
                </Stack>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25 }}>
                  {[
                    { label: 'Blood Group',  value: PATIENT.bloodGroup,  color: theme.palette.error.main },
                    { label: 'Allergies',    value: PATIENT.allergies,   color: theme.palette.warning.main },
                    { label: 'Age',          value: `${PATIENT.age} yrs`, color: theme.palette.primary.main },
                    { label: 'Last Checkup', value: PATIENT.lastCheckup, color: theme.palette.success.main },
                  ].map((item) => (
                    <Box key={item.label} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', borderTop: `3px solid ${item.color}` }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                        {item.label}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 0.3, color: item.color }}>
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Card>

            {/* Medical History */}
            <Card elevation={0} sx={sectionCard}>
              <Box sx={sectionHeader}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <HistoryIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Medical History</Typography>
                </Stack>
              </Box>
              <Box sx={{ px: 2, pt: 1, pb: 1.5 }}>
                {MEDICAL_HISTORY.map((item, idx) => (
                  <Stack
                    key={item.label}
                    direction="row"
                    spacing={1.5}
                    alignItems="flex-start"
                    sx={{
                      py: 1.25,
                      borderBottom: idx < MEDICAL_HISTORY.length - 1 ? '1px solid' : 'none',
                      borderColor: 'rgba(15, 23, 42, 0.06)',
                    }}
                  >
                    <Box sx={{
                      width: 28, height: 28, borderRadius: 1.5, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main', flexShrink: 0,
                    }}>
                      {item.icon}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.15 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.value}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Box>
            </Card>

          </Stack>
        </Box>
      </Stack>
    </PatientPortalWorkspaceCard>
  );
}
