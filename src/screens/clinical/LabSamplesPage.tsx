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
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Close as CloseIcon,
  LocalHospital as LocalHospitalIcon,
  Science as ScienceIcon,
  LocalShipping as LocalShippingIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import ModuleHeaderCard from '@/src/screens/clinical/components/ModuleHeaderCard';
import WorkflowSectionCard from '@/src/screens/clinical/components/WorkflowSectionCard';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { moveSampleToResults, updateSample } from '@/src/store/slices/labSlice';
import { LabSample, SampleStatus } from '@/src/core/laboratory/types';

type SampleDetailState = {
  collectionSite: string;
  collectedBy: string;
  collectionTime: string;
  accessionNumber: string;
  status: SampleStatus;
  transport: string;
};

const statusColors: Record<SampleStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  Pending: 'warning',
  Collected: 'info',
  'In Transit': 'default',
  Received: 'success',
  Rejected: 'error',
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

export default function LabSamplesPage() {
  const router = useRouter();
  const mrnParam = useMrnParam();
  const dispatch = useAppDispatch();
  const samples = useAppSelector((state) => state.lab.samples);

  const [selectedSampleId, setSelectedSampleId] = React.useState(samples[0]?.id ?? '');
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [detailState, setDetailState] = React.useState<SampleDetailState>({
    collectionSite: '',
    collectedBy: '',
    collectionTime: '',
    accessionNumber: '',
    status: 'Pending',
    transport: '',
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

  const selectedSample = React.useMemo(
    () => samples.find((sample) => sample.id === selectedSampleId) ?? samples[0],
    [samples, selectedSampleId]
  );

  React.useEffect(() => {
    if (samples.length === 0) {
      setSelectedSampleId('');
      return;
    }
    if (!samples.find((sample) => sample.id === selectedSampleId)) {
      setSelectedSampleId(samples[0].id);
    }
  }, [samples, selectedSampleId]);

  React.useEffect(() => {
    if (!mrnParam || mrnApplied) return;
    const match = samples.find((sample) => sample.mrn === mrnParam);
    if (match) {
      setSelectedSampleId(match.id);
    }
    setMrnApplied(true);
  }, [mrnApplied, mrnParam, samples]);

  React.useEffect(() => {
    if (!selectedSample) return;
    setDetailState({
      collectionSite: selectedSample.collectionSite,
      collectedBy: selectedSample.collectedBy,
      collectionTime: selectedSample.collectionTime,
      accessionNumber: selectedSample.accessionNumber,
      status: selectedSample.status,
      transport: selectedSample.transport,
    });
  }, [selectedSample]);

  const pageSubtitle = formatPatientLabel(selectedSample?.patientName, selectedSample?.mrn);
  const withMrn = React.useCallback(
    (route: string) => (selectedSample?.mrn ? `${route}?mrn=${selectedSample.mrn}` : route),
    [selectedSample]
  );

  const pendingCount = samples.filter((sample) => sample.status === 'Pending').length;
  const transitCount = samples.filter((sample) => sample.status === 'In Transit').length;
  const receivedCount = samples.filter((sample) => sample.status === 'Received').length;

  const handleReviewSample = React.useCallback((sampleId: string) => {
    setSelectedSampleId(sampleId);
    setDrawerOpen(true);
  }, []);

  const sampleColumns = React.useMemo<GridColDef<LabSample>[]>(
    () => [
      {
        field: 'patientName',
        headerName: 'Patient',
        minWidth: 260,
        flex: 1.1,
        renderCell: (params: GridRenderCellParams<LabSample>) => (
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
        field: 'testPanel',
        headerName: 'Panel',
        minWidth: 200,
        flex: 1,
      },
      {
        field: 'specimenType',
        headerName: 'Specimen',
        width: 130,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 140,
        renderCell: (params: GridRenderCellParams<LabSample, SampleStatus>) => (
          <Chip size="small" label={params.row.status} color={statusColors[params.row.status]} />
        ),
      },
      {
        field: 'accessionNumber',
        headerName: 'Accession',
        width: 160,
      },
      {
        field: 'collectionTime',
        headerName: 'Collected At',
        width: 140,
      },
      {
        field: 'transport',
        headerName: 'Transport',
        minWidth: 170,
        flex: 0.9,
      },
      {
        field: 'actions',
        headerName: 'Next',
        width: 140,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<LabSample>) => (
          <Button
            size="small"
            variant="text"
            endIcon={<ArrowForwardIcon />}
            onClick={(event) => {
              event.stopPropagation();
              handleReviewSample(String(params.id));
            }}
          >
            Review
          </Button>
        ),
      },
    ],
    [handleReviewSample]
  );

  const handleSaveUpdates = () => {
    if (!selectedSample) return;
    dispatch(
      updateSample({
        id: selectedSample.id,
        changes: {
          ...detailState,
        },
      })
    );
    setSnackbar({ open: true, message: 'Sample updated.', severity: 'success' });
  };

  const handleMarkCollected = () => {
    if (!selectedSample) return;
    dispatch(updateSample({ id: selectedSample.id, changes: { status: 'Collected' } }));
    setSnackbar({ open: true, message: 'Sample marked collected.', severity: 'success' });
  };

  const handleSendToLab = () => {
    if (!selectedSample) return;
    dispatch(updateSample({ id: selectedSample.id, changes: { status: 'Received' } }));
    setSnackbar({ open: true, message: 'Sample received in lab.', severity: 'info' });
  };

  const handleSendToResults = () => {
    if (!selectedSample) return;
    dispatch(moveSampleToResults(selectedSample.id));
    setSnackbar({ open: true, message: 'Result record created.', severity: 'success' });
  };

  return (
    <PageTemplate title="Lab Samples" subtitle={pageSubtitle} currentPageTitle="Samples">
      <Stack spacing={2}>
        <ModuleHeaderCard
          title="Sample Collection & Intake"
          description="Track collection, transport, and lab receipt before results entry."
          chips={[{ label: 'Laboratory', color: 'primary' }, { label: 'Sample Workflow', variant: 'outlined' }]}
          actions={
            <>
              <Button variant="outlined" startIcon={<ScienceIcon />} onClick={() => router.push(withMrn('/orders/lab'))}>
                Open Orders
              </Button>
              <Button variant="contained" startIcon={<LocalHospitalIcon />} onClick={() => router.push(withMrn('/diagnostics/lab/results'))}>
                Open Results
              </Button>
            </>
          }
        />

        <Grid container spacing={2} alignItems="stretch">
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Pending Collection
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {pendingCount}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                In Transit
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {transitCount}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Received
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {receivedCount}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2} alignItems="stretch">
          <Grid item xs={12} sx={{ display: 'flex' }}>
            <WorkflowSectionCard
              title="Sample Queue"
              subtitle="Click Review to open the details drawer."
              sx={{ flex: 1 }}
            >
              <DataTable
                tableId="lab-samples-console"
                rows={samples}
                columns={sampleColumns}
                rowHeight={80}
                tableHeight={430}
                onRowClick={(params) => handleReviewSample(String(params.id))}
                checkboxSelection={false}
                toolbarConfig={{
                  title: 'Samples',
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
              backdropFilter: 'blur(4px)',
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
                Sample Details
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Update accession details and confirm lab receipt.
              </Typography>
            </Box>
            <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close details">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Divider />
          {selectedSample ? (
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
                    {getInitials(selectedSample.patientName)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {selectedSample.patientName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedSample.mrn}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedSample.specimenType} · {selectedSample.testPanel}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
                  <Chip
                    size="small"
                    label={`Status: ${selectedSample.status}`}
                    color={statusColors[selectedSample.status]}
                    variant="outlined"
                  />
                  <Chip size="small" label={`Accession: ${selectedSample.accessionNumber}`} variant="outlined" />
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Collection Information
                </Typography>
                <Stack spacing={1.25}>
                  <TextField
                    label="Collection Site"
                    value={detailState.collectionSite}
                    onChange={(event) =>
                      setDetailState((prev) => ({ ...prev, collectionSite: event.target.value }))
                    }
                    fullWidth
                  />
                  <TextField
                    label="Collected By"
                    value={detailState.collectedBy}
                    onChange={(event) =>
                      setDetailState((prev) => ({ ...prev, collectedBy: event.target.value }))
                    }
                    fullWidth
                  />
                  <TextField
                    label="Collection Time"
                    value={detailState.collectionTime}
                    onChange={(event) =>
                      setDetailState((prev) => ({ ...prev, collectionTime: event.target.value }))
                    }
                    fullWidth
                  />
                  <TextField
                    label="Accession Number"
                    value={detailState.accessionNumber}
                    onChange={(event) =>
                      setDetailState((prev) => ({ ...prev, accessionNumber: event.target.value }))
                    }
                    fullWidth
                  />
                  <TextField
                    select
                    label="Status"
                    value={detailState.status}
                    onChange={(event) =>
                      setDetailState((prev) => ({ ...prev, status: event.target.value as SampleStatus }))
                    }
                    fullWidth
                  >
                    {['Pending', 'Collected', 'In Transit', 'Received', 'Rejected'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Transport"
                    value={detailState.transport}
                    onChange={(event) =>
                      setDetailState((prev) => ({ ...prev, transport: event.target.value }))
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
                  <Button variant="outlined" size="medium" fullWidth onClick={handleSaveUpdates}>
                    Save Updates
                  </Button>
                  <Button
                    variant="contained"
                    size="medium"
                    fullWidth
                    startIcon={<AssignmentTurnedInIcon />}
                    onClick={handleMarkCollected}
                  >
                    Mark Collected
                  </Button>
                  <Button
                    variant="text"
                    size="medium"
                    fullWidth
                    startIcon={<LocalShippingIcon />}
                    onClick={handleSendToLab}
                  >
                    Mark Received
                  </Button>
                  <Button
                    variant="text"
                    size="medium"
                    fullWidth
                    startIcon={<LocalHospitalIcon />}
                    onClick={handleSendToResults}
                  >
                    Send to Results
                  </Button>
                </Stack>
              </Box>
            </Stack>
          ) : (
            <Alert severity="info">Click Review on a row to open sample details.</Alert>
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
