'use client';

import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  CloudUpload as CloudUploadIcon,
  ContentCopy as ContentCopyIcon,
  DocumentScanner as DocumentScannerIcon,
  LocalHospital as LocalHospitalIcon,
  Psychology as PsychologyIcon,
  Science as ScienceIcon,
  Send as SendIcon,
  Share as ShareIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import PatientPortalWorkspaceCard from './components/PatientPortalWorkspaceCard';
import { LAB_REQUISITIONS } from './patient-portal-mock-data';
import type { LabRequisition } from './patient-portal-types';
import { ppSectionCard, ppSectionHeader, ppInnerCard } from './patient-portal-styles';

const STATUS_META: Record<LabRequisition['status'], { label: string; color: string; bg: string }> = {
  'Pending':      { label: 'Pending',      color: '#92400e', bg: '#fef3c7' },
  'Sent to Lab':  { label: 'Sent to Lab',  color: '#1e40af', bg: '#dbeafe' },
  'Collected':    { label: 'Collected',    color: '#6d28d9', bg: '#ede9fe' },
  'Completed':    { label: 'Completed',    color: '#065f46', bg: '#d1fae5' },
};

const LABS = ['SRL Diagnostics', 'Metropolis', 'Dr. Lal PathLabs', 'Thyrocare', 'Apollo Diagnostics', 'Agappe Diagnostics'];
const COMMON_TESTS = ['CBC', 'HbA1c', 'Blood Glucose (F)', 'Lipid Panel', 'Thyroid Profile (T3/T4/TSH)', 'Vitamin D', 'Vitamin B12', 'Serum Creatinine', 'LFT', 'KFT', 'Urine Routine', 'CRP', 'ESR', 'Iron Studies', 'Ferritin'];

export default function PatientPortalLabRequisitionsPage() {
  const theme = useTheme();
  const sectionCard = ppSectionCard(theme);
  const sectionHeader = ppSectionHeader(theme);
  const innerCard = ppInnerCard();

  const [requisitions, setRequisitions] = React.useState<LabRequisition[]>(() =>
    LAB_REQUISITIONS.map(r => ({ ...r }))
  );
  const [selected, setSelected] = React.useState<LabRequisition | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
  const [ocrRunning, setOcrRunning] = React.useState(false);
  const [ocrDone, setOcrDone] = React.useState(false);
  const [shareTarget, setShareTarget] = React.useState('');
  const [uploadMode, setUploadMode] = React.useState<'file' | 'scan'>('file');
  const [selectedLab, setSelectedLab] = React.useState('');
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'info' }>({ open: false, message: '', severity: 'success' });

  const selectedReq = selected ?? requisitions[0];

  const handleSendToLab = (req: LabRequisition) => {
    const lab = selectedLab || req.lab || LABS[0];
    setRequisitions(prev => prev.map(r => r.id === req.id ? { ...r, status: 'Sent to Lab', lab, shareMethod: 'digital' } : r));
    setSnackbar({ open: true, message: `Requisition sent digitally to ${lab}`, severity: 'success' });
  };

  const handleOCR = () => {
    setOcrRunning(true);
    setOcrDone(false);
    setTimeout(() => {
      setOcrRunning(false);
      setOcrDone(true);
      setRequisitions(prev => prev.map(r => r.id === selectedReq.id ? { ...r, ocrExtracted: true } : r));
      setSnackbar({ open: true, message: 'OCR extraction complete — text data extracted from uploaded document', severity: 'success' });
    }, 2200);
  };

  const handleShare = () => {
    if (!shareTarget.trim()) return;
    setRequisitions(prev => prev.map(r => r.id === selectedReq.id ? { ...r } : r));
    setShareDialogOpen(false);
    setShareTarget('');
    setSnackbar({ open: true, message: `Requisition shared with ${shareTarget}`, severity: 'success' });
  };

  const counts = {
    total: requisitions.length,
    pending: requisitions.filter(r => r.status === 'Pending').length,
    sent: requisitions.filter(r => r.status === 'Sent to Lab').length,
    completed: requisitions.filter(r => r.status === 'Completed').length,
  };

  return (
    <PatientPortalWorkspaceCard current="lab-requisitions">
      {/* Stats */}
      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4,1fr)' }, mb: 2 }}>
        {[
          { label: 'Total', value: counts.total, color: theme.palette.primary.main, bg: alpha(theme.palette.primary.main, 0.08), icon: <AssignmentIcon fontSize="small" /> },
          { label: 'Pending', value: counts.pending, color: '#92400e', bg: '#fef3c7', icon: <AccessTimeIcon fontSize="small" /> },
          { label: 'Sent to Lab', value: counts.sent, color: '#1e40af', bg: '#dbeafe', icon: <SendIcon fontSize="small" /> },
          { label: 'Completed', value: counts.completed, color: '#065f46', bg: '#d1fae5', icon: <CheckCircleIcon fontSize="small" /> },
        ].map(s => (
          <Box key={s.label} sx={{ p: 1.5, borderRadius: 2, bgcolor: s.bg, border: '1px solid', borderColor: alpha(s.color, 0.2) }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ color: s.color }}>{s.icon}</Box>
              <Box>
                <Typography sx={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                <Typography variant="caption" sx={{ color: s.color, fontWeight: 600 }}>{s.label}</Typography>
              </Box>
            </Stack>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', lg: '340px minmax(0,1fr)' } }}>
        {/* Left — list */}
        <Card elevation={0} sx={{ ...sectionCard, height: 'fit-content' }}>
          <Box sx={sectionHeader}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <AssignmentIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Lab Requisitions</Typography>
              </Stack>
            </Stack>
          </Box>
          <Stack spacing={0}>
            {requisitions.map(req => {
              const meta = STATUS_META[req.status];
              const isActive = selectedReq.id === req.id;
              return (
                <Box key={req.id} onClick={() => setSelected(req)} sx={{ ...innerCard, borderRadius: 0, borderLeft: isActive ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent', backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.04) : 'transparent', cursor: 'pointer', '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.03) }, mx: 0 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{req.requisitionNo}</Typography>
                      <Typography variant="caption" color="text.secondary">{req.date} · {req.time}</Typography>
                      <Typography variant="caption" display="block" color="text.secondary">{req.orderedBy}</Typography>
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.3 }}>{req.tests.slice(0, 2).join(', ')}{req.tests.length > 2 ? ` +${req.tests.length - 2} more` : ''}</Typography>
                    </Box>
                    <Chip size="small" label={meta.label} sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: meta.bg, color: meta.color, flexShrink: 0, ml: 1 }} />
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Card>

        {/* Right — detail */}
        <Card elevation={0} sx={sectionCard}>
          <Box sx={{ ...sectionHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <ScienceIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedReq.requisitionNo}</Typography>
            </Stack>
            <Chip size="small" label={STATUS_META[selectedReq.status].label} sx={{ bgcolor: STATUS_META[selectedReq.status].bg, color: STATUS_META[selectedReq.status].color, fontWeight: 700, fontSize: 11 }} />
          </Box>

          <Box sx={{ p: 2 }}>
            <Stack spacing={2}>
              {/* Meta */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 1.5 }}>
                {[
                  { label: 'Date & Time', value: `${selectedReq.date} · ${selectedReq.time}` },
                  { label: 'Ordered By', value: selectedReq.orderedBy },
                  { label: 'Lab', value: selectedReq.lab ?? 'Not assigned yet' },
                  { label: 'Share Method', value: selectedReq.shareMethod === 'digital' ? 'Digital (sent online)' : selectedReq.shareMethod === 'physical' ? 'Physical copy' : 'Not shared yet' },
                ].map(item => (
                  <Box key={item.label}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.value}</Typography>
                  </Box>
                ))}
              </Box>

              {/* Tests */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>ORDERED TESTS</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.75 }}>
                  {selectedReq.tests.map(t => (
                    <Chip key={t} label={t} size="small" sx={{ fontSize: 11, fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.dark' }} />
                  ))}
                </Box>
              </Box>

              {/* Notes */}
              {selectedReq.notes && (
                <Alert severity="info" icon={false} sx={{ borderRadius: 2, py: 0.75 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>{selectedReq.notes}</Typography>
                </Alert>
              )}

              {/* OCR status */}
              {selectedReq.uploadedFile && (
                <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.2), bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <DocumentScannerIcon fontSize="small" color="primary" />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>Uploaded Document</Typography>
                        <Typography variant="caption" color="text.secondary">{selectedReq.uploadedFile}</Typography>
                      </Box>
                    </Stack>
                    {selectedReq.ocrExtracted ? (
                      <Chip size="small" label="OCR Done" icon={<CheckCircleIcon sx={{ fontSize: 13 }} />} sx={{ bgcolor: '#d1fae5', color: '#065f46', fontWeight: 700, fontSize: 11 }} />
                    ) : (
                      <Button size="small" variant="outlined" startIcon={<PsychologyIcon sx={{ fontSize: 14 }} />} onClick={handleOCR} disabled={ocrRunning} sx={{ textTransform: 'none', fontSize: 11, fontWeight: 700 }}>
                        {ocrRunning ? 'Running OCR…' : 'Run OCR'}
                      </Button>
                    )}
                  </Stack>
                  {ocrRunning && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}
                  {ocrDone && <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5, fontWeight: 600 }}>Text extracted successfully from document.</Typography>}
                </Box>
              )}

              {/* Actions */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5, display: 'block', mb: 1 }}>ACTIONS</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>

                  {/* Send to Lab digitally */}
                  {selectedReq.status === 'Pending' && (
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="flex-end">
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                          <InputLabel>Select Lab</InputLabel>
                          <Select value={selectedLab || selectedReq.lab || ''} label="Select Lab" onChange={e => setSelectedLab(e.target.value as string)}>
                            {LABS.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                          </Select>
                        </FormControl>
                        <Button variant="contained" size="small" disableElevation startIcon={<SendIcon sx={{ fontSize: 14 }} />} onClick={() => handleSendToLab(selectedReq)} sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}>
                          Send to Lab (Digital)
                        </Button>
                      </Stack>
                    </Box>
                  )}

                  {/* Upload physical / scan */}
                  <Button variant="outlined" size="small" startIcon={uploadMode === 'scan' ? <DocumentScannerIcon sx={{ fontSize: 14 }} /> : <CloudUploadIcon sx={{ fontSize: 14 }} />}
                    onClick={() => setUploadDialogOpen(true)} sx={{ textTransform: 'none', fontWeight: 700 }}>
                    {uploadMode === 'scan' ? 'Scan Physical Copy' : 'Upload Document'}
                  </Button>

                  {/* Share */}
                  <Button variant="outlined" size="small" startIcon={<ShareIcon sx={{ fontSize: 14 }} />} onClick={() => setShareDialogOpen(true)} sx={{ textTransform: 'none', fontWeight: 700 }}>
                    Share
                  </Button>

                  {/* Copy requisition number */}
                  <Tooltip title="Copy Requisition No.">
                    <Button variant="outlined" size="small" startIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />} onClick={() => { navigator.clipboard?.writeText(selectedReq.requisitionNo); setSnackbar({ open: true, message: 'Copied to clipboard', severity: 'info' }); }} sx={{ textTransform: 'none', fontWeight: 700 }}>
                      Copy No.
                    </Button>
                  </Tooltip>
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Card>
      </Box>

      {/* Upload / Scan Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
          Upload or Scan Document
        </DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1}>
              {(['file', 'scan'] as const).map(mode => (
                <Button key={mode} variant={uploadMode === mode ? 'contained' : 'outlined'} size="small" disableElevation startIcon={mode === 'file' ? <CloudUploadIcon /> : <DocumentScannerIcon />} onClick={() => setUploadMode(mode)} sx={{ textTransform: 'none', fontWeight: 700 }}>
                  {mode === 'file' ? 'Upload File' : 'Scan (Camera)'}
                </Button>
              ))}
            </Stack>
            {uploadMode === 'file' ? (
              <Box sx={{ border: '2px dashed', borderColor: alpha(theme.palette.primary.main, 0.35), borderRadius: 2, p: 3, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.03), cursor: 'pointer' }}>
                <CloudUploadIcon sx={{ fontSize: 36, color: 'primary.main', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Click to upload or drag & drop</Typography>
                <Typography variant="caption" color="text.secondary">PDF, JPG, PNG up to 10 MB</Typography>
              </Box>
            ) : (
              <Box sx={{ border: '2px dashed', borderColor: alpha(theme.palette.warning.main, 0.4), borderRadius: 2, p: 3, textAlign: 'center', bgcolor: alpha(theme.palette.warning.main, 0.03) }}>
                <DocumentScannerIcon sx={{ fontSize: 36, color: 'warning.main', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Open camera to scan physical copy</Typography>
                <Typography variant="caption" color="text.secondary">Position the document clearly in frame</Typography>
                <Box sx={{ mt: 1.5 }}>
                  <Button variant="contained" color="warning" size="small" disableElevation sx={{ textTransform: 'none', fontWeight: 700 }}>
                    Open Camera
                  </Button>
                </Box>
              </Box>
            )}
            <Alert severity="info" icon={<PsychologyIcon fontSize="small" />} sx={{ borderRadius: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>After upload, you can run OCR to automatically extract test data from the document.</Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button onClick={() => setUploadDialogOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" disableElevation onClick={() => { setUploadDialogOpen(false); setSnackbar({ open: true, message: 'Document uploaded successfully', severity: 'success' }); }} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
          Share Requisition
        </DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Stack spacing={2}>
            <TextField size="small" fullWidth label="Share with (Doctor / Lab / Email)" placeholder="e.g. Dr. Priya Sharma or lab@srl.com" value={shareTarget} onChange={e => setShareTarget(e.target.value)} />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {['Dr. Priya Sharma', 'SRL Diagnostics', 'Dr. Arvind Mehta'].map(name => (
                <Chip key={name} label={name} size="small" onClick={() => setShareTarget(name)} sx={{ cursor: 'pointer', fontWeight: 600 }} variant="outlined" />
              ))}
            </Box>
            <Stack direction="row" spacing={1}>
              {[{ icon: <LocalHospitalIcon fontSize="small" />, label: 'Lab Share' }, { icon: <ContentCopyIcon fontSize="small" />, label: 'Copy Link' }].map(item => (
                <Button key={item.label} variant="outlined" size="small" startIcon={item.icon} sx={{ textTransform: 'none', fontWeight: 700, flex: 1 }}>{item.label}</Button>
              ))}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button onClick={() => setShareDialogOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" disableElevation onClick={handleShare} sx={{ textTransform: 'none', fontWeight: 700 }}>Share</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={2800} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(p => ({ ...p, open: false }))} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </PatientPortalWorkspaceCard>
  );
}
