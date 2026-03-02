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
  Snackbar,
  Stack,
  TextField,
  Typography,
  MenuItem,
} from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import DataTable from '@/src/ui/components/organisms/DataTable';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  FactCheck as FactCheckIcon,
  LocalHospital as LocalHospitalIcon,
  Science as ScienceIcon,
  TaskAlt as TaskAltIcon,
} from '@mui/icons-material';
import ModuleHeaderCard from '@/src/screens/clinical/components/ModuleHeaderCard';
import WorkflowSectionCard from '@/src/screens/clinical/components/WorkflowSectionCard';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { setResultState, updateResult } from '@/src/store/slices/labSlice';
import { LabResult, ResultFlag, ResultState } from '@/src/core/laboratory/types';

type ResultDetailState = {
  testName: string;
  specimenType: string;
  resultValue: string;
  unit: string;
  referenceRange: string;
  flag: ResultFlag;
  state: ResultState;
  reportedAt: string;
  verifiedBy: string;
};

const flagColors: Record<ResultFlag, 'default' | 'warning' | 'error' | 'success'> = {
  Normal: 'success',
  Abnormal: 'warning',
  Critical: 'error',
};

const stateColors: Record<ResultState, 'default' | 'info' | 'success' | 'warning'> = {
  'Pending Review': 'warning',
  Verified: 'info',
  Released: 'success',
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

export default function LabResultsPage() {
  const router = useRouter();
  const mrnParam = useMrnParam();
  const dispatch = useAppDispatch();
  const results = useAppSelector((state) => state.lab.results);
  const resultTemplates = useAppSelector((state) => state.lab.resultTemplates);

  const [selectedResultId, setSelectedResultId] = React.useState(results[0]?.id ?? '');
  const [selectedTemplate, setSelectedTemplate] = React.useState(resultTemplates[0] ?? '');
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [detailState, setDetailState] = React.useState<ResultDetailState>({
    testName: '',
    specimenType: '',
    resultValue: '',
    unit: '',
    referenceRange: '',
    flag: 'Normal',
    state: 'Pending Review',
    reportedAt: '',
    verifiedBy: '',
  });
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

  const selectedResult = React.useMemo(
    () => results.find((result) => result.id === selectedResultId) ?? results[0],
    [results, selectedResultId]
  );

  React.useEffect(() => {
    if (results.length === 0) {
      setSelectedResultId('');
      return;
    }
    if (!results.find((result) => result.id === selectedResultId)) {
      setSelectedResultId(results[0].id);
    }
  }, [results, selectedResultId]);

  React.useEffect(() => {
    if (!mrnParam || mrnApplied) return;
    const match = results.find((result) => result.mrn === mrnParam);
    if (match) {
      setSelectedResultId(match.id);
    }
    setMrnApplied(true);
  }, [mrnApplied, mrnParam, results]);

  React.useEffect(() => {
    if (!selectedResult) return;
    setDetailState({
      testName: selectedResult.testName,
      specimenType: selectedResult.specimenType,
      resultValue: selectedResult.resultValue,
      unit: selectedResult.unit,
      referenceRange: selectedResult.referenceRange,
      flag: selectedResult.flag,
      state: selectedResult.state,
      reportedAt: selectedResult.reportedAt,
      verifiedBy: selectedResult.verifiedBy,
    });
    setSelectedTemplate(selectedResult.testName);
  }, [selectedResult]);

  const pageSubtitle = formatPatientLabel(selectedResult?.patientName, selectedResult?.mrn);
  const withMrn = React.useCallback(
    (route: string) => (selectedResult?.mrn ? `${route}?mrn=${selectedResult.mrn}` : route),
    [selectedResult]
  );

  const pendingCount = results.filter((result) => result.state !== 'Released').length;
  const criticalCount = results.filter((result) => result.flag === 'Critical').length;
  const totalCount = results.length;

  const handleReviewResult = React.useCallback((resultId: string) => {
    setSelectedResultId(resultId);
    setDrawerOpen(true);
  }, []);

  const resultColumns = React.useMemo<GridColDef<LabResult>[]>(
    () => [
      {
        field: 'patientName',
        headerName: 'Patient',
        minWidth: 260,
        flex: 1.1,
        renderCell: (params: GridRenderCellParams<LabResult>) => (
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
        field: 'testName',
        headerName: 'Test',
        minWidth: 200,
        flex: 1,
      },
      {
        field: 'specimenType',
        headerName: 'Specimen',
        width: 130,
      },
      {
        field: 'resultValue',
        headerName: 'Result',
        width: 140,
      },
      {
        field: 'flag',
        headerName: 'Flag',
        width: 120,
        renderCell: (params: GridRenderCellParams<LabResult, ResultFlag>) => (
          <Chip size="small" label={params.row.flag} color={flagColors[params.row.flag]} />
        ),
      },
      {
        field: 'state',
        headerName: 'State',
        width: 140,
        renderCell: (params: GridRenderCellParams<LabResult, ResultState>) => (
          <Chip size="small" label={params.row.state} color={stateColors[params.row.state]} variant="outlined" />
        ),
      },
      {
        field: 'reportedAt',
        headerName: 'Reported',
        width: 120,
      },
      {
        field: 'actions',
        headerName: 'Next',
        width: 140,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<LabResult>) => (
          <Button
            size="small"
            variant="text"
            endIcon={<ArrowForwardIcon />}
            onClick={(event) => {
              event.stopPropagation();
              handleReviewResult(String(params.id));
            }}
          >
            Review
          </Button>
        ),
      },
    ],
    [handleReviewResult]
  );

  const handleSaveUpdates = () => {
    if (!selectedResult) return;
    dispatch(updateResult({ id: selectedResult.id, changes: { ...detailState } }));
    setSnackbar({ open: true, message: 'Result updated.', severity: 'success' });
  };

  const handleVerify = () => {
    if (!selectedResult) return;
    dispatch(
      setResultState({
        id: selectedResult.id,
        state: 'Verified',
        verifiedBy: detailState.verifiedBy || 'Lab Supervisor',
      })
    );
    setSnackbar({ open: true, message: 'Result verified.', severity: 'success' });
  };

  const handleRelease = () => {
    if (!selectedResult) return;
    dispatch(
      setResultState({
        id: selectedResult.id,
        state: 'Released',
        verifiedBy: detailState.verifiedBy || 'Lab Supervisor',
      })
    );
    setSnackbar({ open: true, message: 'Result released to chart.', severity: 'success' });
  };

  return (
    <PageTemplate title="Lab Results" subtitle={pageSubtitle} currentPageTitle="Results">
      <Stack spacing={2}>
        <ModuleHeaderCard
          title="Results Validation"
          description="Review lab values, flag abnormalities, and release verified reports."
          chips={[{ label: 'Laboratory', color: 'primary' }, { label: 'Pathology Review', variant: 'outlined' }]}
          actions={
            <>
              <Button variant="outlined" startIcon={<ScienceIcon />} onClick={() => router.push('/diagnostics/lab/samples')}>
                Open Samples
              </Button>
              <Button variant="contained" startIcon={<LocalHospitalIcon />} onClick={() => router.push(withMrn('/patients/profile'))}>
                Patient Profile
              </Button>
            </>
          }
        />

        <Grid container spacing={2} alignItems="stretch">
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Pending Review
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {pendingCount}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Critical Flags
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                {criticalCount}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Total Results
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {totalCount}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2} alignItems="stretch">
          <Grid item xs={12} sx={{ display: 'flex' }}>
            <WorkflowSectionCard
              title="Result Queue"
              subtitle="Click Review to open the details drawer."
              sx={{ flex: 1 }}
            >
              <DataTable
                tableId="lab-results-console"
                rows={results}
                columns={resultColumns}
                rowHeight={80}
                tableHeight={430}
                onRowClick={(params) => handleReviewResult(String(params.id))}
                checkboxSelection={false}
                toolbarConfig={{
                  title: 'Results',
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
                Result Details
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Apply templates, record values, and release reports.
              </Typography>
            </Box>
            <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close details">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Divider />
          {selectedResult ? (
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
                    {getInitials(selectedResult.patientName)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {selectedResult.patientName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedResult.mrn}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedResult.specimenType} · {selectedResult.testName}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
                  <Chip
                    size="small"
                    label={`Flag: ${detailState.flag}`}
                    color={flagColors[detailState.flag]}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={`State: ${detailState.state}`}
                    color={stateColors[detailState.state]}
                    variant="outlined"
                  />
                </Stack>
              </Box>

              {detailState.flag === 'Critical' ? (
                <Alert severity="error">Critical result flagged. Confirm notification workflow.</Alert>
              ) : null}

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Result Entry
                </Typography>
                <Stack spacing={1.25}>
                  <TextField
                    select
                    label="Template"
                    value={selectedTemplate}
                    onChange={(event) => {
                      const next = event.target.value;
                      setSelectedTemplate(next);
                      setDetailState((prev) => ({ ...prev, testName: next }));
                    }}
                    fullWidth
                  >
                    {resultTemplates.map((template) => (
                      <MenuItem key={template} value={template}>
                        {template}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Test Name"
                    value={detailState.testName}
                    onChange={(event) =>
                      setDetailState((prev) => ({ ...prev, testName: event.target.value }))
                    }
                    fullWidth
                  />
                  <TextField
                    label="Specimen Type"
                    value={detailState.specimenType}
                    onChange={(event) =>
                      setDetailState((prev) => ({ ...prev, specimenType: event.target.value }))
                    }
                    fullWidth
                  />
                  <TextField
                    label="Result Value"
                    value={detailState.resultValue}
                    onChange={(event) =>
                      setDetailState((prev) => ({ ...prev, resultValue: event.target.value }))
                    }
                    fullWidth
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      label="Unit"
                      value={detailState.unit}
                      onChange={(event) => setDetailState((prev) => ({ ...prev, unit: event.target.value }))}
                      fullWidth
                    />
                    <TextField
                      label="Reference Range"
                      value={detailState.referenceRange}
                      onChange={(event) =>
                        setDetailState((prev) => ({ ...prev, referenceRange: event.target.value }))
                      }
                      fullWidth
                    />
                  </Stack>
                  <TextField
                    select
                    label="Flag"
                    value={detailState.flag}
                    onChange={(event) =>
                      setDetailState((prev) => ({ ...prev, flag: event.target.value as ResultFlag }))
                    }
                    fullWidth
                  >
                    {['Normal', 'Abnormal', 'Critical'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Reported At"
                    value={detailState.reportedAt}
                    onChange={(event) =>
                      setDetailState((prev) => ({ ...prev, reportedAt: event.target.value }))
                    }
                    fullWidth
                  />
                  <TextField
                    label="Verified By"
                    value={detailState.verifiedBy}
                    onChange={(event) =>
                      setDetailState((prev) => ({ ...prev, verifiedBy: event.target.value }))
                    }
                    fullWidth
                  />
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Actions
                </Typography>
                <Stack spacing={1.25}>
                  <Button
                    variant="outlined"
                    size="medium"
                    fullWidth
                    startIcon={<FactCheckIcon />}
                    onClick={handleSaveUpdates}
                  >
                    Save Updates
                  </Button>
                  <Button
                    variant="contained"
                    size="medium"
                    fullWidth
                    startIcon={<TaskAltIcon />}
                    onClick={handleVerify}
                  >
                    Verify
                  </Button>
                  <Button
                    variant="text"
                    size="medium"
                    fullWidth
                    startIcon={<LocalHospitalIcon />}
                    onClick={handleRelease}
                  >
                    Release to Chart
                  </Button>
                </Stack>
              </Box>
            </Stack>
          ) : (
            <Alert severity="info">Click Review on a row to open result details.</Alert>
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
