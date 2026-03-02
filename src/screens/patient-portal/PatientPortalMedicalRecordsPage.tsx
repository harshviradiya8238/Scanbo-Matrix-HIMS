'use client';

import * as React from 'react';
import {
  Box, Button, Chip, Stack, Typography,
} from '@/src/ui/components/atoms';
import { Card, StatTile } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import {
  Download as DownloadIcon,
  FolderShared as FolderSharedIcon,
  Image as ImageIcon,
  LocalHospital as LocalHospitalIcon,
  LocalPharmacy as LocalPharmacyIcon,
  MedicalInformation as MedicalInformationIcon,
  Science as ScienceIcon,
  Share as ShareIcon,
  Upload as UploadIcon,
  Vaccines as VaccinesIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import PatientPortalWorkspaceCard from './components/PatientPortalWorkspaceCard';
import { MEDICAL_RECORDS } from './patient-portal-mock-data';
import type { MedicalRecord } from './patient-portal-types';
import { ppSectionCard, ppSectionHeader } from './patient-portal-styles';

const TYPE_META: Record<MedicalRecord['type'], { color: string; icon: React.ReactNode; label: string }> = {
  Visit:        { color: '#1172BA', icon: <LocalHospitalIcon sx={{ fontSize: 14 }} />,   label: 'Visit'        },
  Lab:          { color: '#2FA77A', icon: <ScienceIcon sx={{ fontSize: 14 }} />,          label: 'Lab'          },
  Imaging:      { color: '#0B84D0', icon: <ImageIcon sx={{ fontSize: 14 }} />,            label: 'Imaging'      },
  Procedure:    { color: '#2C8AD3', icon: <VaccinesIcon sx={{ fontSize: 14 }} />,         label: 'Procedure'    },
  Prescription: { color: '#F3C44E', icon: <LocalPharmacyIcon sx={{ fontSize: 14 }} />,   label: 'Prescription' },
};

const ALL_TYPES = ['All', 'Visit', 'Lab', 'Imaging', 'Procedure', 'Prescription'] as const;
type FilterType = typeof ALL_TYPES[number];

export default function PatientPortalMedicalRecordsPage() {
  const theme = useTheme();
  const [filter, setFilter] = React.useState<FilterType>('All');
  const [viewRec, setViewRec] = React.useState<MedicalRecord | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [snack, setSnack] = React.useState<{ open: boolean; msg: string; severity: 'success' | 'info' | 'error' }>({ open: false, msg: '', severity: 'success' });

  const sectionCard = ppSectionCard(theme);
  const sectionHeader = ppSectionHeader(theme);

  const filtered = filter === 'All' ? MEDICAL_RECORDS : MEDICAL_RECORDS.filter((r) => r.type === filter);

  const handleUpload = () => {
    setUploading(true);
    setUploadProgress(0);
    const timer = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          setUploading(false);
          setSnack({ open: true, msg: 'Document uploaded successfully!', severity: 'success' });
          return 100;
        }
        return p + 20;
      });
    }, 300);
  };

  const handleDownload = (rec: MedicalRecord) => {
    setSnack({ open: true, msg: `Downloading: ${rec.title}`, severity: 'success' });
  };

  const handleShare = (rec: MedicalRecord) => {
    setSnack({ open: true, msg: `${rec.title} shared with your care team!`, severity: 'info' });
  };

  const typeIcon = (type: MedicalRecord['type']) => {
    const meta = TYPE_META[type];
    return (
      <Box sx={{
        width: 32, height: 32, borderRadius: 1.5,
        bgcolor: alpha(meta.color, 0.12), color: meta.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {meta.icon}
      </Box>
    );
  };

  return (
    <PatientPortalWorkspaceCard current="medical-records">
      <Stack spacing={2}>

        {/* ── Stat Tiles ── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
          <StatTile label="Total Records" value={MEDICAL_RECORDS.length} subtitle="All categories" icon={<FolderSharedIcon fontSize="small" />} variant="soft" />
          <StatTile label="Visit Records" value={MEDICAL_RECORDS.filter((r) => r.type === 'Visit').length} subtitle="Consultations" icon={<LocalHospitalIcon fontSize="small" />} variant="soft" tone="info" />
          <StatTile label="Lab Reports" value={MEDICAL_RECORDS.filter((r) => r.type === 'Lab').length} subtitle="Diagnostics" icon={<ScienceIcon fontSize="small" />} variant="soft" tone="success" />
          <StatTile label="Imaging" value={MEDICAL_RECORDS.filter((r) => r.type === 'Imaging').length} subtitle="X-Ray, Scan, MRI" icon={<ImageIcon fontSize="small" />} variant="soft" tone="warning" />
        </Box>

        {/* ── Records List ── */}
        <Card elevation={0} sx={sectionCard}>
          <Box sx={{ ...sectionHeader, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <FolderSharedIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Medical Records</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button variant="contained" disableElevation size="small"
                startIcon={<UploadIcon sx={{ fontSize: 14 }} />}
                onClick={handleUpload} disabled={uploading}
                sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12 }}>
                {uploading ? 'Uploading…' : 'Upload Document'}
              </Button>
            </Stack>
          </Box>

          {/* Upload progress */}
          {uploading && (
            <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>Uploading document…</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>{uploadProgress}%</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={uploadProgress} sx={{ borderRadius: 99, height: 5 }} />
            </Box>
          )}

          {/* Filter chips */}
          <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {ALL_TYPES.map((t) => {
                const isActive = filter === t;
                const meta = t !== 'All' ? TYPE_META[t as MedicalRecord['type']] : null;
                return (
                  <Chip key={t} label={t} size="small" onClick={() => setFilter(t)}
                    sx={{
                      fontWeight: 700, fontSize: 12, cursor: 'pointer',
                      bgcolor: isActive ? (meta ? alpha(meta.color, 0.15) : alpha(theme.palette.primary.main, 0.15)) : 'transparent',
                      color: isActive ? (meta ? meta.color : 'primary.main') : 'text.secondary',
                      border: '1px solid',
                      borderColor: isActive ? (meta ? alpha(meta.color, 0.35) : alpha(theme.palette.primary.main, 0.35)) : 'divider',
                    }} />
                );
              })}
            </Stack>
          </Box>

          {/* Records */}
          <Stack spacing={0}>
            {filtered.map((rec, idx) => {
              const meta = TYPE_META[rec.type];
              return (
                <Box key={rec.id} sx={{
                  px: 2, py: 1.75,
                  borderBottom: idx < filtered.length - 1 ? '1px solid' : 'none',
                  borderLeft: `4px solid ${meta.color}`,
                  borderLeftColor: meta.color,
                  borderColor: 'divider',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
                    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
                      {typeIcon(rec.type)}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{rec.title}</Typography>
                          <Chip size="small" label={rec.type}
                            sx={{ fontWeight: 700, fontSize: 10.5, bgcolor: alpha(meta.color, 0.1), color: meta.color }} />
                        </Stack>
                        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
                          <Typography variant="caption" color="text.secondary">{rec.doctor}</Typography>
                          <Typography variant="caption" color="text.disabled">·</Typography>
                          <Typography variant="caption" color="text.secondary">{rec.date}</Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5, fontSize: 13 }}>{rec.summary}</Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={0.75} flexShrink={0}>
                      <Button size="small" variant="outlined" startIcon={<VisibilityIcon sx={{ fontSize: 13 }} />}
                        onClick={() => setViewRec(rec)}
                        sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12 }}>View</Button>
                      <Button size="small" variant="text" startIcon={<DownloadIcon sx={{ fontSize: 13 }} />}
                        onClick={() => handleDownload(rec)}
                        sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12 }}>PDF</Button>
                      <Button size="small" variant="text" startIcon={<ShareIcon sx={{ fontSize: 13 }} />}
                        onClick={() => handleShare(rec)}
                        sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12 }}>Share</Button>
                    </Stack>
                  </Stack>
                </Box>
              );
            })}
            {filtered.length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <MedicalInformationIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">No records found for this filter.</Typography>
              </Box>
            )}
          </Stack>
        </Card>

      </Stack>

      {/* ── View Record Dialog ── */}
      <Dialog open={!!viewRec} onClose={() => setViewRec(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 0.5 }}>
          {viewRec && (
            <Stack direction="row" alignItems="center" spacing={1}>
              {typeIcon(viewRec.type)}
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{viewRec.title}</Typography>
            </Stack>
          )}
        </DialogTitle>
        <DialogContent>
          {viewRec && (
            <Stack spacing={1.75} sx={{ pt: 0.5 }}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.04), border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.15) }}>
                <Stack direction="row" justifyContent="space-between">
                  <Stack spacing={0.25}>
                    <Typography variant="caption" color="text.secondary">Provider / Lab</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{viewRec.doctor}</Typography>
                  </Stack>
                  <Stack spacing={0.25} sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">Date</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{viewRec.date}</Typography>
                  </Stack>
                  <Chip size="small" label={viewRec.type}
                    sx={{ alignSelf: 'flex-start', fontWeight: 700, bgcolor: alpha(TYPE_META[viewRec.type].color, 0.1), color: TYPE_META[viewRec.type].color }} />
                </Stack>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>Summary</Typography>
                <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.7 }}>{viewRec.summary}</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                This record is stored securely in your health vault. Download or share with your healthcare provider as needed.
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2, gap: 1 }}>
          <Button onClick={() => setViewRec(null)} sx={{ textTransform: 'none', fontWeight: 600 }}>Close</Button>
          <Button variant="outlined" startIcon={<ShareIcon sx={{ fontSize: 14 }} />}
            onClick={() => { if (viewRec) { handleShare(viewRec); setViewRec(null); } }}
            sx={{ textTransform: 'none', fontWeight: 600 }}>Share</Button>
          <Button variant="contained" disableElevation startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
            onClick={() => { if (viewRec) { handleDownload(viewRec); setViewRec(null); } }}
            sx={{ textTransform: 'none', fontWeight: 600 }}>Download</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} variant="filled" sx={{ fontWeight: 600 }} onClose={() => setSnack((p) => ({ ...p, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </PatientPortalWorkspaceCard>
  );
}
