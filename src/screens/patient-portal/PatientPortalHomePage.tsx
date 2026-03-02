'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import {
  CalendarMonth as CalendarMonthIcon,
  Medication as MedicationIcon,
  MonitorHeart as MonitorHeartIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import PatientPortalWorkspaceCard from './components/PatientPortalWorkspaceCard';
import { StatTile } from '@/src/ui/components/molecules';
import {
  PATIENT,
  HEALTH_STATS,
  MEDICATIONS,
  LAB_RESULTS,
  APPOINTMENTS,
  VITALS,
} from './patient-portal-mock-data';
import {
  ppSectionCard,
  ppSectionHeader,
  ppInnerCard,
  ppHeadCell,
  ppTintedBlock,
} from './patient-portal-styles';

const QUICK_LINKS = [
  { emoji: '📅', label: 'Book Appointment' },
  { emoji: '📤', label: 'Upload Reports' },
  { emoji: '🧪', label: 'Order Lab Test' },
  { emoji: '💬', label: 'Chat with Doctor' },
];

const labStatusColor = (theme: any) => ({
  Normal: { bg: theme.palette.success.light, fg: theme.palette.success.dark, dot: theme.palette.success.main },
  High: { bg: theme.palette.error.light, fg: theme.palette.error.dark, dot: theme.palette.error.main },
  Low: { bg: theme.palette.warning.light, fg: theme.palette.warning.dark, dot: theme.palette.warning.main },
});

export default function PatientPortalHomePage() {
  const router = useRouter();
  const theme = useTheme();
  const LAB_STATUS_COLOR = labStatusColor(theme);

  const statusBorderColor: Record<string, string> = {
    upcoming: theme.palette.primary.main,
    completed: theme.palette.success.main,
    cancelled: theme.palette.error.main,
  };

  const sectionCard = ppSectionCard(theme);
  const sectionHeader = ppSectionHeader(theme);
  const innerCard = ppInnerCard();
  const headCell = ppHeadCell(theme);
  const tinted = ppTintedBlock(theme);

  return (
    <PatientPortalWorkspaceCard current="home">
      <Stack spacing={2}>
        {/* ── Daily Health Tip Banner ── */}
        

        {/* ── Health Stat Cards ── */}
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' } }}>
          {HEALTH_STATS.map((s) => (
            <StatTile
              key={s.id}
              label={s.label}
              value={s.value}
              subtitle={s.badge}
              tone={s.badgeType === 'good' ? 'success' : 'warning'}
              variant="soft"
              icon={<Box component="span" sx={{ fontSize: 20, lineHeight: 1 }}>{s.emoji}</Box>}
            />
          ))}
        </Box>

        {/* ── Quick Links ── */}


        {/* ── Upcoming Appointments + Active Medications ── */}
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' } }}>
          {/* Upcoming Appointments */}
          <Card elevation={0} sx={sectionCard}>
            <Box sx={sectionHeader}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <CalendarMonthIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Upcoming Appointments</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    size="small"
                    variant="contained"
                    disableElevation
                    onClick={() => router.push('/patient-portal/appointments?focus=booking')}
                    sx={{ textTransform: 'none', fontSize: 11.5, fontWeight: 700, borderRadius: 1.5 }}
                  >
                    Book New
                  </Button>
                  <Typography
                    variant="caption"
                    onClick={() => router.push('/patient-portal/my-appointments')}
                    sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  >
                    View All
                  </Typography>
                </Stack>
              </Stack>
            </Box>
            <Stack spacing={1} sx={{ p: 2 }}>
              {APPOINTMENTS.map((apt) => (
                <Box
                  key={apt.id}
                  sx={{
                    ...innerCard,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    borderLeft: '3px solid',
                    borderColor: statusBorderColor[apt.status] ?? theme.palette.text.secondary,
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 50,
                      borderRadius: 1,
                      backgroundColor: theme.palette.primary.main,
                      color: '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Typography sx={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{apt.day}</Typography>
                    <Typography sx={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>{apt.month}</Typography>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{apt.doctorName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {apt.department} · {apt.location}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {apt.time} · Token {apt.token}
                    </Typography>
                  </Box>
                  <Chip
                    label={apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                      backgroundColor:
                        apt.status === 'upcoming'
                          ? alpha(theme.palette.primary.main, 0.1)
                          : apt.status === 'completed'
                          ? alpha(theme.palette.success.main, 0.1)
                          : alpha(theme.palette.error.main, 0.1),
                      color:
                        apt.status === 'upcoming'
                          ? theme.palette.primary.dark
                          : apt.status === 'completed'
                          ? theme.palette.success.dark
                          : theme.palette.error.dark,
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Card>

          {/* Active Medications */}
          <Card elevation={0} sx={sectionCard}>
            <Box sx={sectionHeader}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <MedicationIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Active Medications</Typography>
                </Stack>
                <Typography
                  variant="caption"
                  onClick={() => router.push('/patient-portal/medications')}
                  sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                >
                  View All
                </Typography>
              </Stack>
            </Box>
            <Stack spacing={1} sx={{ p: 2 }}>
              {MEDICATIONS.map((med) => (
                <Stack key={med.id} direction="row" alignItems="center" spacing={1.5} sx={innerCard}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      backgroundColor: med.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {med.emoji}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{med.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{med.dose}</Typography>
                  </Box>
                  <Chip
                    label={med.timing}
                    size="small"
                    sx={{ height: 22, fontSize: 11, fontWeight: 600, backgroundColor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.dark }}
                  />
                </Stack>
              ))}
            </Stack>
          </Card>
        </Box>

        {/* ── Recent Lab Results + Current Vitals ── */}
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' } }}>
          {/* Recent Lab Results */}
          <Card elevation={0} sx={sectionCard}>
            <Box sx={sectionHeader}>
              <Stack direction="row" spacing={1} alignItems="center">
                <ScienceIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Recent Lab Results</Typography>
              </Stack>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headCell}>Test Name</TableCell>
                    <TableCell sx={headCell}>Value</TableCell>
                    <TableCell sx={headCell}>Ref Range</TableCell>
                    <TableCell sx={headCell} align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {LAB_RESULTS.map((lr) => {
                    const cfg = LAB_STATUS_COLOR[lr.status] ?? LAB_STATUS_COLOR.Normal;
                    return (
                      <TableRow key={lr.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                        <TableCell sx={{ fontSize: 12.5 }}>
                          <Stack direction="row" alignItems="center" spacing={0.75}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: cfg.dot, flexShrink: 0 }} />
                            <span>{lr.testName}</span>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ fontSize: 12.5, fontWeight: 700 }}>{lr.value}</TableCell>
                        <TableCell sx={{ fontSize: 12.5, color: 'text.secondary' }}>{lr.refRange}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={lr.status}
                            size="small"
                            sx={{ height: 22, fontSize: 11, fontWeight: 700, backgroundColor: cfg.bg, color: cfg.fg }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          {/* Current Vitals */}
          <Card elevation={0} sx={sectionCard}>
            <Box sx={sectionHeader}>
              <Stack direction="row" spacing={1} alignItems="center">
                <MonitorHeartIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Current Vitals</Typography>
              </Stack>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, p: 2 }}>
              {VITALS.map((v) => (
                <Box key={v.id} sx={{ ...tinted, p: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 0.25 }}>
                    {v.label}
                  </Typography>
                  <Stack direction="row" alignItems="baseline" spacing={0.5}>
                    <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{v.value}</Typography>
                    {v.unit && <Typography variant="caption" color="text.secondary">{v.unit}</Typography>}
                  </Stack>
                  <Box sx={{ mt: 0.75, height: 4, borderRadius: 2, backgroundColor: alpha(v.color, 0.15), overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${v.fillPercent}%`, borderRadius: 2, backgroundColor: v.color }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
        </Box>
      </Stack>
    </PatientPortalWorkspaceCard>
  );
}
