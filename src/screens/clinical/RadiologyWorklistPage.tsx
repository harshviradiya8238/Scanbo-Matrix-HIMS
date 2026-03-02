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
  Send as SendIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import ModuleHeaderCard from '@/src/screens/clinical/components/ModuleHeaderCard';
import WorkflowSectionCard from '@/src/screens/clinical/components/WorkflowSectionCard';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import {
  moveWorklistToReading,
  updateWorklistCase,
} from '@/src/store/slices/radiologySlice';
import { ImagingPriority, ModalityCase, WorklistState } from '@/src/core/radiology/types';

const worklistColors: Record<WorklistState, 'default' | 'info' | 'warning' | 'success'> = {
  Queued: 'default',
  'In Progress': 'info',
  'Tech QA': 'warning',
  'Sent to PACS': 'success',
};

const priorityColors: Record<ImagingPriority, 'error' | 'warning' | 'default'> = {
  STAT: 'error',
  Urgent: 'warning',
  Routine: 'default',
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

export default function RadiologyWorklistPage() {
  const router = useRouter();
  const mrnParam = useMrnParam();
  const dispatch = useAppDispatch();
  const worklist = useAppSelector((state) => state.radiology.worklist);

  const [selectedWorklistId, setSelectedWorklistId] = React.useState(worklist[0]?.id ?? '');
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [mrnApplied, setMrnApplied] = React.useState(false);
  const [detailState, setDetailState] = React.useState({
    room: '',
    prepStatus: '',
    state: 'Queued' as WorklistState,
    transmitState: 'Ready to Send' as ModalityCase['transmitState'],
  });
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const selectedWorklist = React.useMemo(
    () => worklist.find((item) => item.id === selectedWorklistId) ?? worklist[0],
    [worklist, selectedWorklistId]
  );

  React.useEffect(() => {
    if (worklist.length === 0) {
      setSelectedWorklistId('');
      return;
    }
    if (!worklist.find((item) => item.id === selectedWorklistId)) {
      setSelectedWorklistId(worklist[0].id);
    }
  }, [worklist, selectedWorklistId]);

  React.useEffect(() => {
    if (!mrnParam || mrnApplied) return;
    const match = worklist.find((item) => item.mrn === mrnParam);
    if (match) {
      setSelectedWorklistId(match.id);
    }
    setMrnApplied(true);
  }, [mrnApplied, mrnParam, worklist]);

  React.useEffect(() => {
    if (!selectedWorklist) return;
    setDetailState({
      room: selectedWorklist.room,
      prepStatus: selectedWorklist.prepStatus,
      state: selectedWorklist.state,
      transmitState: selectedWorklist.transmitState,
    });
  }, [selectedWorklist]);

  const pageSubtitle = formatPatientLabel(selectedWorklist?.patientName, selectedWorklist?.mrn);
  const withMrn = React.useCallback(
    (route: string) => (selectedWorklist?.mrn ? `${route}?mrn=${selectedWorklist.mrn}` : route),
    [selectedWorklist]
  );

  const pendingCount = worklist.filter((item) => item.state !== 'Sent to PACS').length;

  const handleReviewCase = React.useCallback((worklistId: string) => {
    setSelectedWorklistId(worklistId);
    setDrawerOpen(true);
  }, []);

  const worklistColumns = React.useMemo<GridColDef<ModalityCase>[]>(
    () => [
      {
        field: 'patientName',
        headerName: 'Patient',
        minWidth: 260,
        flex: 1.1,
        renderCell: (params: GridRenderCellParams<ModalityCase>) => (
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
        field: 'protocol',
        headerName: 'Protocol',
        minWidth: 200,
        flex: 1,
      },
      {
        field: 'room',
        headerName: 'Room',
        width: 130,
      },
      {
        field: 'prepStatus',
        headerName: 'Prep',
        minWidth: 150,
        flex: 0.8,
      },
      {
        field: 'priority',
        headerName: 'Priority',
        width: 110,
        renderCell: (params: GridRenderCellParams<ModalityCase, ImagingPriority>) => (
          <Chip size="small" label={params.row.priority} color={priorityColors[params.row.priority]} />
        ),
      },
      {
        field: 'state',
        headerName: 'State',
        width: 130,
        renderCell: (params: GridRenderCellParams<ModalityCase, WorklistState>) => (
          <Chip
            size="small"
            label={params.row.state}
            color={worklistColors[params.row.state]}
            variant={params.row.state === 'Sent to PACS' ? 'filled' : 'outlined'}
          />
        ),
      },
      {
        field: 'actions',
        headerName: 'Next',
        width: 140,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<ModalityCase>) => (
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

  const handleSaveUpdates = () => {
    if (!selectedWorklist) return;
    dispatch(
      updateWorklistCase({
        id: selectedWorklist.id,
        changes: {
          room: detailState.room,
          prepStatus: detailState.prepStatus,
          state: detailState.state,
          transmitState: detailState.transmitState,
        },
      })
    );
    setSnackbar({ open: true, message: 'Worklist updated.', severity: 'success' });
  };

  const handleSendToRadiologist = () => {
    if (!selectedWorklist) return;
    dispatch(moveWorklistToReading({ id: selectedWorklist.id }));
    setSnackbar({
      open: true,
      message: `Sent ${selectedWorklist.patientName} to radiologist queue.`,
      severity: 'success',
    });
  };

  return (
    <PageTemplate title="Radiology Worklist" subtitle={pageSubtitle} currentPageTitle="Worklist">
      <Stack spacing={2}>
        <ModuleHeaderCard
          title="Technician Worklist"
          description="Run MWL, perform scans, complete QA, and transmit studies to the reporting queue."
          chips={[
            { label: 'Radiology', color: 'primary' },
            { label: 'Technician Workflow', variant: 'outlined' },
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
                startIcon={<ScienceIcon />}
                onClick={() => router.push(withMrn('/diagnostics/radiology/reports'))}
              >
                Report Queue
              </Button>
            </>
          }
        />

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Pending QA / Transmit
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {pendingCount}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Total in Worklist
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {worklist.length}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Selected Room
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {selectedWorklist?.room ?? '--'}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2} alignItems="stretch">
          <Grid item xs={12} sx={{ display: 'flex' }}>
            <WorkflowSectionCard
              title="Modality Worklist"
              subtitle="Click Review to open the details drawer."
              sx={{ flex: 1 }}
            >
              <DataTable
                tableId="radiology-worklist-console"
                rows={worklist}
                columns={worklistColumns}
                rowHeight={80}
                tableHeight={430}
                onRowClick={(params) => handleReviewCase(String(params.id))}
                checkboxSelection={false}
                toolbarConfig={{
                  title: 'Technician MWL',
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
                Worklist Checklist
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Update prep, QA, and transmit state before moving to radiology.
              </Typography>
            </Box>
            <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close details">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Divider />
          {selectedWorklist ? (
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
                    {getInitials(selectedWorklist.patientName)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {selectedWorklist.patientName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedWorklist.mrn} · {selectedWorklist.room}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedWorklist.study}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
                  <Chip
                    size="small"
                    label={`Worklist State: ${selectedWorklist.state}`}
                    color={worklistColors[selectedWorklist.state]}
                    variant="outlined"
                  />
                  <Chip size="small" label={`Prep: ${selectedWorklist.prepStatus}`} variant="outlined" />
                  <Chip size="small" label={`Transmit: ${selectedWorklist.transmitState}`} variant="outlined" />
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Worklist Details
                </Typography>
                <Stack spacing={1.25}>
                  <TextField
                    label="Room"
                    value={detailState.room}
                    onChange={(event) => setDetailState((prev) => ({ ...prev, room: event.target.value }))}
                    fullWidth
                  />
                  <TextField
                    label="Prep Status"
                    value={detailState.prepStatus}
                    onChange={(event) =>
                      setDetailState((prev) => ({ ...prev, prepStatus: event.target.value }))
                    }
                    fullWidth
                  />
                  <TextField
                    select
                    label="Worklist State"
                    value={detailState.state}
                    onChange={(event) =>
                      setDetailState((prev) => ({ ...prev, state: event.target.value as WorklistState }))
                    }
                    fullWidth
                  >
                    {['Queued', 'In Progress', 'Tech QA', 'Sent to PACS'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Transmit State"
                    value={detailState.transmitState}
                    onChange={(event) =>
                      setDetailState((prev) => ({
                        ...prev,
                        transmitState: event.target.value as ModalityCase['transmitState'],
                      }))
                    }
                    fullWidth
                  >
                    {['Ready to Send', 'Sent', 'Retry'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
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
                  <Button variant="outlined" size="medium" fullWidth onClick={handleSaveUpdates}>
                    Save Updates
                  </Button>
                  <Button
                    variant="contained"
                    size="medium"
                    fullWidth
                    startIcon={<SendIcon />}
                    onClick={handleSendToRadiologist}
                  >
                    Move to Radiologist
                  </Button>
                </Stack>
              </Box>
            </Stack>
          ) : (
            <Alert severity="info">Click Review on a row to open worklist details.</Alert>
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
