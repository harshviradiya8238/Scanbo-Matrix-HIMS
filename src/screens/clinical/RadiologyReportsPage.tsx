'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import DataTable from '@/src/ui/components/organisms/DataTable';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  LocalHospital as LocalHospitalIcon,
  TaskAlt as TaskAltIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import ModuleHeaderCard from '@/src/screens/clinical/components/ModuleHeaderCard';
import WorkflowSectionCard from '@/src/screens/clinical/components/WorkflowSectionCard';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { setReadingState, updateReadingCase } from '@/src/store/slices/radiologySlice';
import { ImagingPriority, ReadingCase, ReportState } from '@/src/core/radiology/types';

const priorityColors: Record<ImagingPriority, 'error' | 'warning' | 'default'> = {
  STAT: 'error',
  Urgent: 'warning',
  Routine: 'default',
};

const reportColors: Record<ReportState, 'default' | 'info' | 'warning' | 'success'> = {
  Unread: 'default',
  Drafting: 'info',
  'Need Addendum': 'warning',
  'Final Signed': 'success',
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

export default function RadiologyReportsPage() {
  const router = useRouter();
  const mrnParam = useMrnParam();
  const dispatch = useAppDispatch();
  const reading = useAppSelector((state) => state.radiology.reading);
  const reportTemplates = useAppSelector((state) => state.radiology.reportTemplates);

  const [selectedReadingId, setSelectedReadingId] = React.useState(reading[0]?.id ?? '');
  const [selectedTemplate, setSelectedTemplate] = React.useState(reportTemplates[0] ?? '');
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [mrnApplied, setMrnApplied] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const selectedReading = React.useMemo(
    () => reading.find((item) => item.id === selectedReadingId) ?? reading[0],
    [reading, selectedReadingId]
  );

  React.useEffect(() => {
    if (reading.length === 0) {
      setSelectedReadingId('');
      return;
    }
    if (!reading.find((item) => item.id === selectedReadingId)) {
      setSelectedReadingId(reading[0].id);
    }
  }, [reading, selectedReadingId]);

  React.useEffect(() => {
    if (!mrnParam || mrnApplied) return;
    const match = reading.find((item) => item.mrn === mrnParam);
    if (match) {
      setSelectedReadingId(match.id);
    }
    setMrnApplied(true);
  }, [mrnApplied, mrnParam, reading]);

  const pageSubtitle = formatPatientLabel(selectedReading?.patientName, selectedReading?.mrn);
  const withMrn = React.useCallback(
    (route: string) => (selectedReading?.mrn ? `${route}?mrn=${selectedReading.mrn}` : route),
    [selectedReading]
  );

  const pendingCount = reading.filter((item) => item.state !== 'Final Signed').length;

  const handleReviewCase = React.useCallback((readingId: string) => {
    setSelectedReadingId(readingId);
    setDrawerOpen(true);
  }, []);

  const readingColumns = React.useMemo<GridColDef<ReadingCase>[]>(
    () => [
      {
        field: 'patientName',
        headerName: 'Patient',
        minWidth: 260,
        flex: 1.1,
        renderCell: (params: GridRenderCellParams<ReadingCase>) => (
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, py: 0.5 }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 13 }}>
              {getInitials(params.row.patientName)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>
                {params.row.patientName}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }} noWrap>
                {params.row.mrn}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        field: 'subspecialty',
        headerName: 'Subspecialty',
        width: 150,
      },
      {
        field: 'modality',
        headerName: 'Modality',
        width: 110,
      },
      {
        field: 'priority',
        headerName: 'Priority',
        width: 110,
        renderCell: (params: GridRenderCellParams<ReadingCase, ImagingPriority>) => (
          <Chip size="small" label={params.row.priority} color={priorityColors[params.row.priority]} />
        ),
      },
      {
        field: 'turnaround',
        headerName: 'TAT',
        width: 115,
      },
      {
        field: 'state',
        headerName: 'Report',
        width: 140,
        renderCell: (params: GridRenderCellParams<ReadingCase, ReportState>) => (
          <Chip
            size="small"
            label={params.row.state}
            color={reportColors[params.row.state]}
            variant={params.row.state === 'Final Signed' ? 'filled' : 'outlined'}
          />
        ),
      },
      {
        field: 'actions',
        headerName: 'Next',
        width: 140,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<ReadingCase>) => (
          <Button
            size="small"
            variant="text"
            endIcon={<ArrowForwardIcon />}
            onClick={(event) => {
              event.stopPropagation();
              handleReviewCase(String(params.id));
            }}
          >
            Review
          </Button>
        ),
      },
    ],
    [handleReviewCase]
  );

  const handleSignReport = () => {
    if (!selectedReading) return;
    dispatch(setReadingState({ id: selectedReading.id, state: 'Final Signed' }));
    setSnackbar({
      open: true,
      message: `Report signed for ${selectedReading.patientName}.`,
      severity: 'success',
    });
  };

  return (
    <PageTemplate title="Radiology Reports" subtitle={pageSubtitle} currentPageTitle="Reports">
      <Stack spacing={2}>
        <ModuleHeaderCard
          title="Radiology Report Queue"
          description="Review images, apply structured templates, and sign final reports."
          chips={[
            { label: 'Radiology', color: 'primary' },
            { label: 'Radiologist Workflow', variant: 'outlined' },
          ]}
          actions={
            <>
              <Button
                variant="outlined"
                startIcon={<LocalHospitalIcon />}
                onClick={() => router.push(withMrn('/clinical/modules/radiant'))}
              >
                Open Workflow
              </Button>
              <Button
                variant="contained"
                startIcon={<ViewListIcon />}
                onClick={() => router.push(withMrn('/diagnostics/radiology/worklist'))}
              >
                Technician Worklist
              </Button>
            </>
          }
        />

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Reports Pending
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {pendingCount}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Total in Queue
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {reading.length}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Selected Template
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {selectedTemplate || '--'}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2} alignItems="stretch">
          <Grid item xs={12} sx={{ display: 'flex' }}>
            <WorkflowSectionCard
              title="Reading Worklist"
              subtitle="Click Review to open the details drawer."
              sx={{ flex: 1 }}
            >
              <DataTable
                tableId="radiology-reading-console"
                rows={reading}
                columns={readingColumns}
                rowHeight={80}
                tableHeight={430}
                onRowClick={(params) => handleReviewCase(String(params.id))}
                checkboxSelection={false}
                toolbarConfig={{
                  title: 'Radiologist Reading Queue',
                  showSavedViews: false,
                  showDensity: false,
                  showQuickFilter: true,
                }}
              />
            </WorkflowSectionCard>
          </Grid>
        </Grid>
      </Stack>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        transitionDuration={{ enter: 280, exit: 200 }}
        SlideProps={{
          easing: {
            enter: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
            exit: 'cubic-bezier(0.4, 0, 0.6, 1)',
          },
        }}
        ModalProps={{
          BackdropProps: {
            sx: {
              backgroundColor: 'rgba(15, 23, 42, 0.25)',
            },
          },
        }}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 460 },
            p: 2.5,
            borderTopLeftRadius: 20,
            borderBottomLeftRadius: 20,
            boxShadow: '0px 24px 60px rgba(15, 23, 42, 0.18)',
          },
        }}
      >
        <Stack spacing={2.5} sx={{ height: '100%' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Report Checklist
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Use templates and finalize the report.
              </Typography>
            </Box>
            <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close details">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Divider />
          {selectedReading ? (
            <Stack spacing={2.5}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'action.hover',
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ width: 46, height: 46, bgcolor: 'primary.main', fontSize: 14 }}>
                    {getInitials(selectedReading.patientName)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {selectedReading.patientName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedReading.mrn} · {selectedReading.subspecialty}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedReading.modality} · {selectedReading.study}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
                  <Chip
                    size="small"
                    label={`Report State: ${selectedReading.state}`}
                    color={reportColors[selectedReading.state]}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={`Priority: ${selectedReading.priority}`}
                    color={priorityColors[selectedReading.priority]}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={`Prior Study: ${selectedReading.hasPrior ? 'Available' : 'Not Found'}`}
                    color={selectedReading.hasPrior ? 'success' : 'default'}
                    variant="outlined"
                  />
                </Stack>
                {selectedReading.contrastSafety ? (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Contrast {selectedReading.contrastSafety.risk} · Creatinine {selectedReading.contrastSafety.creatinine} · eGFR{' '}
                    {selectedReading.contrastSafety.egfr}
                  </Typography>
                ) : null}
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Report Settings
                </Typography>
                <Stack spacing={1.25}>
                  <TextField
                    select
                    label="Report State"
                    value={selectedReading.state}
                    onChange={(event) =>
                      dispatch(
                        updateReadingCase({
                          id: selectedReading.id,
                          changes: { state: event.target.value as ReportState },
                        })
                      )
                    }
                    fullWidth
                  >
                    {['Unread', 'Drafting', 'Need Addendum', 'Final Signed'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Report Template"
                    value={selectedTemplate}
                    onChange={(event) => setSelectedTemplate(event.target.value)}
                    fullWidth
                  >
                    {reportTemplates.map((template) => (
                      <MenuItem key={template} value={template}>
                        {template}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Actions
                </Typography>
                <Stack spacing={1.25}>
                  <Button
                    variant="contained"
                    size="medium"
                    fullWidth
                    startIcon={<TaskAltIcon />}
                    onClick={handleSignReport}
                  >
                    Sign Report
                  </Button>
                  <Button
                    variant="outlined"
                    size="medium"
                    fullWidth
                    startIcon={<LocalHospitalIcon />}
                    onClick={() => router.push(withMrn('/clinical/modules/radiant'))}
                  >
                    Open Workflow
                  </Button>
                </Stack>
              </Box>
            </Stack>
          ) : (
            <Alert severity="info">Click Review on a row to open report details.</Alert>
          )}
        </Stack>
      </Drawer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageTemplate>
  );
}
