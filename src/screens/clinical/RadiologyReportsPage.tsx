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

  const readingColumns = React.useMemo<GridColDef<ReadingCase>[]>(
    () => [
      {
        field: 'patientName',
        headerName: 'Patient',
        minWidth: 220,
        flex: 1.1,
        renderCell: (params: GridRenderCellParams<ReadingCase>) => (
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ height: '100%' }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 13 }}>
              {getInitials(params.row.patientName)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {params.row.patientName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
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
    ],
    []
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
          <Grid item xs={12} lg={8} sx={{ display: 'flex' }}>
            <WorkflowSectionCard
              title="Reading Worklist"
              subtitle="Open cases, review priors, and complete the report."
              sx={{ flex: 1 }}
            >
              <DataTable
                tableId="radiology-reading-console"
                rows={reading}
                columns={readingColumns}
                rowHeight={62}
                tableHeight={430}
                onRowClick={(params) => setSelectedReadingId(String(params.id))}
                toolbarConfig={{
                  title: 'Radiologist Reading Queue',
                  showSavedViews: false,
                  showDensity: false,
                  showQuickFilter: true,
                }}
              />
            </WorkflowSectionCard>
          </Grid>
          <Grid item xs={12} lg={4} sx={{ display: 'flex' }}>
            <WorkflowSectionCard
              title="Report Checklist"
              subtitle="Use templates and finalize the report."
              sx={{ flex: 1 }}
            >
              {selectedReading ? (
                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.main', fontSize: 14 }}>
                      {getInitials(selectedReading.patientName)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {selectedReading.patientName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedReading.mrn} · {selectedReading.subspecialty}
                      </Typography>
                    </Box>
                  </Stack>
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
                  {selectedReading.contrastSafety ? (
                    <Stack spacing={0.5}>
                      <Chip
                        size="small"
                        label={`Contrast Safety: ${selectedReading.contrastSafety.risk}`}
                        color={selectedReading.contrastSafety.risk === 'Low' ? 'success' : 'warning'}
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary">
                        Creatinine {selectedReading.contrastSafety.creatinine} · eGFR{' '}
                        {selectedReading.contrastSafety.egfr}
                      </Typography>
                    </Stack>
                  ) : (
                    <Chip size="small" label="Contrast Safety: No flag" variant="outlined" />
                  )}
                  <TextField
                    select
                    size="small"
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
                  >
                    {['Unread', 'Drafting', 'Need Addendum', 'Final Signed'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    size="small"
                    label="Report Template"
                    value={selectedTemplate}
                    onChange={(event) => setSelectedTemplate(event.target.value)}
                  >
                    {reportTemplates.map((template) => (
                      <MenuItem key={template} value={template}>
                        {template}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Typography variant="body2">1. Open case and review current + prior images.</Typography>
                  <Typography variant="body2">2. Use structured template and finalize findings.</Typography>
                  <Typography variant="body2">3. Sign report and close case.</Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<TaskAltIcon />}
                      onClick={handleSignReport}
                    >
                      Sign Report
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<LocalHospitalIcon />}
                      onClick={() => router.push(withMrn('/clinical/modules/radiant'))}
                    >
                      Open Workflow
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <Alert severity="info">Select a case to review report details.</Alert>
              )}
            </WorkflowSectionCard>
          </Grid>
        </Grid>
      </Stack>

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
