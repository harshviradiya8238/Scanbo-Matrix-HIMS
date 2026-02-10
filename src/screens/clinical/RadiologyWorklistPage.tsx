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

  const worklistColumns = React.useMemo<GridColDef<ModalityCase>[]>(
    () => [
      {
        field: 'patientName',
        headerName: 'Patient',
        minWidth: 220,
        flex: 1.1,
        renderCell: (params: GridRenderCellParams<ModalityCase>) => (
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
    ],
    []
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
          <Grid item xs={12} lg={8} sx={{ display: 'flex' }}>
            <WorkflowSectionCard
              title="Modality Worklist"
              subtitle="Track prep, scan progress, QA status, and transmit readiness."
              sx={{ flex: 1 }}
            >
              <DataTable
                tableId="radiology-worklist-console"
                rows={worklist}
                columns={worklistColumns}
                rowHeight={62}
                tableHeight={430}
                onRowClick={(params) => setSelectedWorklistId(String(params.id))}
                toolbarConfig={{
                  title: 'Technician MWL',
                  showSavedViews: false,
                  showDensity: false,
                  showQuickFilter: true,
                }}
              />
            </WorkflowSectionCard>
          </Grid>
          <Grid item xs={12} lg={4} sx={{ display: 'flex' }}>
            <WorkflowSectionCard
              title="Worklist Checklist"
              subtitle="Update prep, QA, and transmit state before moving to radiology."
              sx={{ flex: 1 }}
            >
              {selectedWorklist ? (
                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.main', fontSize: 14 }}>
                      {getInitials(selectedWorklist.patientName)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {selectedWorklist.patientName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedWorklist.mrn} · {selectedWorklist.room}
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip
                    size="small"
                    label={`Worklist State: ${selectedWorklist.state}`}
                    color={worklistColors[selectedWorklist.state]}
                    variant="outlined"
                  />
                  <Chip size="small" label={`Prep: ${selectedWorklist.prepStatus}`} variant="outlined" />
                  <Chip size="small" label={`Transmit: ${selectedWorklist.transmitState}`} variant="outlined" />
                  <TextField
                    label="Room"
                    size="small"
                    value={detailState.room}
                    onChange={(event) => setDetailState((prev) => ({ ...prev, room: event.target.value }))}
                  />
                  <TextField
                    label="Prep Status"
                    size="small"
                    value={detailState.prepStatus}
                    onChange={(event) =>
                      setDetailState((prev) => ({ ...prev, prepStatus: event.target.value }))
                    }
                  />
                  <TextField
                    select
                    size="small"
                    label="Worklist State"
                    value={detailState.state}
                    onChange={(event) =>
                      setDetailState((prev) => ({
                        ...prev,
                        state: event.target.value as WorklistState,
                      }))
                    }
                  >
                    {['Queued', 'In Progress', 'Tech QA', 'Sent to PACS'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    size="small"
                    label="Transmit State"
                    value={detailState.transmitState}
                    onChange={(event) =>
                      setDetailState((prev) => ({
                        ...prev,
                        transmitState: event.target.value as ModalityCase['transmitState'],
                      }))
                    }
                  >
                    {['Ready to Send', 'Sent', 'Retry'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" size="small" onClick={handleSaveUpdates}>
                      Save Updates
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<SendIcon />}
                      onClick={handleSendToRadiologist}
                    >
                      Move to Radiologist
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <Alert severity="info">Select a worklist case to update details.</Alert>
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
