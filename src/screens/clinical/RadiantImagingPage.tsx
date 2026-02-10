'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Avatar,
  Box,
  Button,
  Chip,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import DataTable from '@/src/ui/components/organisms/DataTable';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { useUser } from '@/src/core/auth/UserContext';
import { canAccessRoute } from '@/src/core/navigation/route-access';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { moveOrderToWorklist, moveWorklistToReading } from '@/src/store/slices/radiologySlice';
import {
  ImagingOrder,
  ImagingPriority,
  ModalityCase,
  ReadingCase,
  ReportState,
  ValidationState,
  WorklistState,
} from '@/src/core/radiology/types';
import ModuleHeaderCard from '@/src/screens/clinical/components/ModuleHeaderCard';
import WorkflowSectionCard from '@/src/screens/clinical/components/WorkflowSectionCard';
import {
  Biotech as BiotechIcon,
  FactCheck as FactCheckIcon,
  LocalHospital as LocalHospitalIcon,
  PsychologyAlt as PsychologyAltIcon,
  QueryStats as QueryStatsIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';

const WORKSPACE_FLOW = [
  {
    label: '1. Front Desk',
    whoUses: 'Reception + Scheduling + Radiology Desk',
    description: 'Validate order, clear authorization, and assign scan slot.',
  },
  {
    label: '2. Technician',
    whoUses: 'Radiology Technician',
    description: 'Run MWL, perform scan, complete QA, and transmit study.',
  },
  {
    label: '3. Radiologist',
    whoUses: 'Radiologist',
    description: 'Read queue, compare priors, and finalize report.',
  },
];

const validationColors: Record<ValidationState, 'success' | 'warning' | 'info' | 'error'> = {
  Ready: 'success',
  'Needs Authorization': 'warning',
  'Needs Clinical Review': 'info',
  Hold: 'error',
};

const priorityColors: Record<ImagingPriority, 'error' | 'warning' | 'default'> = {
  STAT: 'error',
  Urgent: 'warning',
  Routine: 'default',
};

const worklistColors: Record<WorklistState, 'default' | 'info' | 'warning' | 'success'> = {
  Queued: 'default',
  'In Progress': 'info',
  'Tech QA': 'warning',
  'Sent to PACS': 'success',
};

const reportColors: Record<ReportState, 'default' | 'info' | 'warning' | 'success'> = {
  Unread: 'default',
  Drafting: 'info',
  'Need Addendum': 'warning',
  'Final Signed': 'success',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function WorkspaceTabPanel({
  value,
  index,
  children,
}: {
  value: number;
  index: number;
  children: React.ReactNode;
}) {
  if (value !== index) return null;
  return <Box sx={{ pt: 1 }}>{children}</Box>;
}

export default function RadiantImagingPage() {
  const router = useRouter();
  const mrnParam = useMrnParam();
  const { permissions } = useUser();
  const dispatch = useAppDispatch();
  const { orders, worklist, reading, reportTemplates } = useAppSelector((state) => state.radiology);

  const [activeTab, setActiveTab] = React.useState(0);
  const [selectedOrderId, setSelectedOrderId] = React.useState(orders[0]?.id ?? '');
  const [selectedWorklistId, setSelectedWorklistId] = React.useState(worklist[0]?.id ?? '');
  const [selectedReadingId, setSelectedReadingId] = React.useState(reading[0]?.id ?? '');
  const [selectedTemplate, setSelectedTemplate] = React.useState(reportTemplates[0] ?? '');
  const [mrnApplied, setMrnApplied] = React.useState(false);

  const selectedOrder = React.useMemo(
    () => orders.find((item) => item.id === selectedOrderId) ?? orders[0],
    [orders, selectedOrderId]
  );
  const selectedWorklistCase = React.useMemo(
    () => worklist.find((item) => item.id === selectedWorklistId) ?? worklist[0],
    [worklist, selectedWorklistId]
  );
  const selectedReadingCase = React.useMemo(
    () => reading.find((item) => item.id === selectedReadingId) ?? reading[0],
    [reading, selectedReadingId]
  );

  React.useEffect(() => {
    if (orders.length === 0) {
      setSelectedOrderId('');
    } else if (!orders.find((item) => item.id === selectedOrderId)) {
      setSelectedOrderId(orders[0].id);
    }
  }, [orders, selectedOrderId]);

  React.useEffect(() => {
    if (worklist.length === 0) {
      setSelectedWorklistId('');
    } else if (!worklist.find((item) => item.id === selectedWorklistId)) {
      setSelectedWorklistId(worklist[0].id);
    }
  }, [worklist, selectedWorklistId]);

  React.useEffect(() => {
    if (reading.length === 0) {
      setSelectedReadingId('');
    } else if (!reading.find((item) => item.id === selectedReadingId)) {
      setSelectedReadingId(reading[0].id);
    }
  }, [reading, selectedReadingId]);

  const flowContext = React.useMemo(() => {
    if (activeTab === 0) {
      return { mrn: selectedOrder?.mrn, patientName: selectedOrder?.patientName };
    }
    if (activeTab === 1) {
      return { mrn: selectedWorklistCase?.mrn, patientName: selectedWorklistCase?.patientName };
    }
    return { mrn: selectedReadingCase?.mrn, patientName: selectedReadingCase?.patientName };
  }, [activeTab, selectedOrder, selectedWorklistCase, selectedReadingCase]);

  const flowMrn = flowContext.mrn ?? mrnParam;
  const flowName = flowContext.patientName;
  const pageSubtitle = formatPatientLabel(flowName, flowMrn);
  const withMrn = React.useCallback(
    (route: string) => (flowMrn ? `${route}?mrn=${flowMrn}` : route),
    [flowMrn]
  );

  React.useEffect(() => {
    if (!mrnParam || mrnApplied) return;

    const orderMatch = orders.find((item) => item.mrn === mrnParam);
    const worklistMatch = worklist.find((item) => item.mrn === mrnParam);
    const readingMatch = reading.find((item) => item.mrn === mrnParam);

    if (orderMatch) setSelectedOrderId(orderMatch.id);
    if (worklistMatch) setSelectedWorklistId(worklistMatch.id);
    if (readingMatch) setSelectedReadingId(readingMatch.id);

    setMrnApplied(true);
  }, [mrnParam, mrnApplied, orders, worklist, reading]);

  const canNavigate = React.useCallback(
    (route: string) => canAccessRoute(route, permissions),
    [permissions]
  );

  const orderColumns = React.useMemo<GridColDef<ImagingOrder>[]>(
    () => [
      {
        field: 'patientName',
        headerName: 'Patient',
        minWidth: 220,
        flex: 1.1,
        renderCell: (params: GridRenderCellParams<ImagingOrder>) => (
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ height: '100%' }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 13 }}>
              {getInitials(params.row.patientName)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {params.row.patientName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {params.row.mrn} · {params.row.ageGender}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        field: 'modality',
        headerName: 'Modality',
        width: 110,
      },
      {
        field: 'study',
        headerName: 'Study',
        minWidth: 180,
        flex: 1,
      },
      {
        field: 'priority',
        headerName: 'Priority',
        width: 110,
        renderCell: (params: GridRenderCellParams<ImagingOrder, ImagingPriority>) => (
          <Chip size="small" label={params.row.priority} color={priorityColors[params.row.priority]} />
        ),
      },
      {
        field: 'validationState',
        headerName: 'Validation',
        width: 170,
        renderCell: (params: GridRenderCellParams<ImagingOrder, ValidationState>) => (
          <Chip
            size="small"
            label={params.row.validationState}
            color={validationColors[params.row.validationState]}
            variant={params.row.validationState === 'Ready' ? 'filled' : 'outlined'}
          />
        ),
      },
      {
        field: 'scheduledSlot',
        headerName: 'Slot',
        width: 110,
      },
    ],
    []
  );

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
        minWidth: 210,
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
        width: 145,
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

  const pendingValidationCount = orders.filter((item) => item.validationState !== 'Ready').length;
  const pendingMwlCount = worklist.filter((item) => item.state !== 'Sent to PACS').length;
  const pendingReportCount = reading.filter((item) => item.state !== 'Final Signed').length;
  const qaReworkCount = worklist.filter((item) => item.state === 'Tech QA').length;
  const transmitReadyCount = worklist.filter((item) => item.transmitState === 'Ready to Send').length;
  const transmitQueue = worklist.map((item) => ({
    id: item.id,
    patientName: item.patientName,
    study: item.study,
    state: item.transmitState,
  }));
  const selectedSafety = selectedReadingCase?.contrastSafety;

  return (
    <PageTemplate
      title="Radiology Imaging Workflow"
      subtitle={pageSubtitle}
      currentPageTitle="Radiology Imaging Workflow"
    >
      <Stack spacing={1.5}>
        <ModuleHeaderCard
          title="Radiology Imaging Workflow"
          description="Simple 3-step flow. Select a row in the table, complete checklist on the right, then move to next step."
          chips={[
            { label: 'Radiology', color: 'primary' },
            { label: 'Simple 3-Step Flow', variant: 'outlined' },
            { label: 'Implemented', color: 'success', variant: 'filled' },
          ]}
          actions={
            <>
              <Button
                variant="outlined"
                startIcon={<LocalHospitalIcon />}
                disabled={!canNavigate('/orders/radiology')}
                onClick={() => router.push(withMrn('/orders/radiology'))}
              >
                Order Console
              </Button>
              <Button
                variant="outlined"
                startIcon={<ViewListIcon />}
                disabled={!canNavigate('/diagnostics/radiology/worklist')}
                onClick={() => router.push(withMrn('/diagnostics/radiology/worklist'))}
              >
                Worklist Console
              </Button>
              <Button
                variant="contained"
                startIcon={<QueryStatsIcon />}
                disabled={!canNavigate('/diagnostics/radiology/reports')}
                onClick={() => router.push(withMrn('/diagnostics/radiology/reports'))}
              >
                Report Console
              </Button>
            </>
          }
        />

        <Card elevation={0} sx={{ p: 1.75, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={1.25}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                How To Use
              </Typography>
              <Typography variant="body2" color="text.secondary">
                1) Pick current step. 2) Select patient in table. 3) Complete right-side checklist. 4) Click next step.
              </Typography>
            </Box>
            <Tabs
              value={activeTab}
              onChange={(_, value: number) => setActiveTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                minHeight: 44,
                '& .MuiTab-root': {
                  minHeight: 44,
                  textTransform: 'none',
                  fontWeight: 600,
                },
              }}
            >
              <Tab icon={<FactCheckIcon fontSize="small" />} iconPosition="start" label={WORKSPACE_FLOW[0]?.label} />
              <Tab icon={<BiotechIcon fontSize="small" />} iconPosition="start" label={WORKSPACE_FLOW[1]?.label} />
              <Tab
                icon={<PsychologyAltIcon fontSize="small" />}
                iconPosition="start"
                label={WORKSPACE_FLOW[2]?.label}
              />
            </Tabs>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip size="small" label={`Step 1 Pending: ${pendingValidationCount}`} color="warning" />
              <Chip size="small" label={`Step 2 Pending: ${pendingMwlCount}`} color="info" />
              <Chip size="small" label={`Step 3 Pending: ${pendingReportCount}`} color="default" />
            </Stack>
          </Stack>
        </Card>

        <WorkspaceTabPanel value={activeTab} index={0}>
          <Grid container spacing={2} alignItems="stretch">
            <Grid item xs={12} lg={8} sx={{ display: 'flex' }}>
              <WorkflowSectionCard
                title="Step 1 Table: Validate and Schedule"
                subtitle={WORKSPACE_FLOW[0].description}
                sx={{ flex: 1 }}
              >
                <DataTable
                  tableId="radiology-order-validation-simple"
                  rows={orders}
                  columns={orderColumns}
                  rowHeight={62}
                  tableHeight={430}
                  onRowClick={(params) => setSelectedOrderId(String(params.id))}
                  toolbarConfig={{
                    title: 'Front Desk Order Queue',
                    showSavedViews: false,
                    showDensity: false,
                  }}
                />
              </WorkflowSectionCard>
            </Grid>
            <Grid item xs={12} lg={4} sx={{ display: 'flex' }}>
              <WorkflowSectionCard
                title="Step 1 Checklist"
                subtitle={`Who uses: ${WORKSPACE_FLOW[0].whoUses}`}
                sx={{ flex: 1 }}
              >
                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.main', fontSize: 14 }}>
                      {selectedOrder ? getInitials(selectedOrder.patientName) : '--'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {selectedOrder?.patientName ?? 'No patient selected'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedOrder?.mrn ?? '-'} · {selectedOrder?.modality ?? '-'}
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip
                    size="small"
                    label={`Validation: ${selectedOrder?.validationState ?? '-'}`}
                    color={selectedOrder ? validationColors[selectedOrder.validationState] : 'default'}
                    variant="outlined"
                  />
                  <Chip size="small" label={`Authorization: ${selectedOrder?.authorization ?? '-'}`} variant="outlined" />
                  <Chip size="small" label={`Clinical Check: ${selectedOrder?.clinicalCheck ?? '-'}`} variant="outlined" />
                  <Typography variant="body2">1. Confirm authorization status.</Typography>
                  <Typography variant="body2">2. Complete clinical pre-check.</Typography>
                  <Typography variant="body2">3. Confirm slot and send to technician queue.</Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={!selectedOrder}
                      onClick={() => {
                        if (!selectedOrder) return;
                        dispatch(moveOrderToWorklist({ id: selectedOrder.id }));
                        setActiveTab(1);
                        setSelectedWorklistId(selectedOrder.id);
                      }}
                    >
                      Move To Step 2
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={!canNavigate('/orders/radiology')}
                      onClick={() => router.push(withMrn('/orders/radiology'))}
                    >
                      Open Order Screen
                    </Button>
                  </Stack>
                </Stack>
              </WorkflowSectionCard>
            </Grid>
          </Grid>
        </WorkspaceTabPanel>

        <WorkspaceTabPanel value={activeTab} index={1}>
          <Grid container spacing={2} alignItems="stretch">
            <Grid item xs={12} lg={8} sx={{ display: 'flex' }}>
              <WorkflowSectionCard
                title="Step 2 Table: Modality Worklist"
                subtitle={WORKSPACE_FLOW[1].description}
                sx={{ flex: 1 }}
              >
                <DataTable
                  tableId="radiology-mwl-simple"
                  rows={worklist}
                  columns={worklistColumns}
                  rowHeight={62}
                  tableHeight={430}
                  onRowClick={(params) => setSelectedWorklistId(String(params.id))}
                  toolbarConfig={{
                    title: 'Technician MWL',
                    showSavedViews: false,
                    showDensity: false,
                  }}
                />
              </WorkflowSectionCard>
            </Grid>
            <Grid item xs={12} lg={4} sx={{ display: 'flex' }}>
              <WorkflowSectionCard
                title="Step 2 Checklist"
                subtitle={`Who uses: ${WORKSPACE_FLOW[1].whoUses}`}
                sx={{ flex: 1 }}
              >
                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.main', fontSize: 14 }}>
                      {selectedWorklistCase ? getInitials(selectedWorklistCase.patientName) : '--'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {selectedWorklistCase?.patientName ?? 'No patient selected'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedWorklistCase?.mrn ?? '-'} · {selectedWorklistCase?.room ?? '-'}
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip
                    size="small"
                    label={`Worklist State: ${selectedWorklistCase?.state ?? '-'}`}
                    color={selectedWorklistCase ? worklistColors[selectedWorklistCase.state] : 'default'}
                    variant="outlined"
                  />
                  <Chip size="small" label={`Prep: ${selectedWorklistCase?.prepStatus ?? '-'}`} variant="outlined" />
                  <Chip size="small" label={`QA Recheck Needed: ${qaReworkCount}`} color="warning" variant="outlined" />
                  <Chip
                    size="small"
                    label={`Ready To Transmit: ${transmitReadyCount}`}
                    color="info"
                    variant="outlined"
                  />
                  <Typography variant="body2">1. Acquire scan from MWL.</Typography>
                  <Typography variant="body2">2. Run QA and verify series.</Typography>
                  <Typography variant="body2">3. Transmit study to reporting queue.</Typography>
                  <Stack spacing={0.75}>
                    {transmitQueue.map((item) => (
                      <Stack key={item.id} direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {item.patientName} · {item.study}
                        </Typography>
                        <Chip size="small" label={item.state} variant="outlined" />
                      </Stack>
                    ))}
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={!selectedWorklistCase}
                      onClick={() => {
                        if (!selectedWorklistCase) return;
                        dispatch(moveWorklistToReading({ id: selectedWorklistCase.id }));
                        setActiveTab(2);
                        setSelectedReadingId(selectedWorklistCase.id);
                      }}
                    >
                      Move To Step 3
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={!canNavigate('/diagnostics/radiology/worklist')}
                      onClick={() => router.push(withMrn('/diagnostics/radiology/worklist'))}
                    >
                      Open Worklist Console
                    </Button>
                  </Stack>
                </Stack>
              </WorkflowSectionCard>
            </Grid>
          </Grid>
        </WorkspaceTabPanel>

        <WorkspaceTabPanel value={activeTab} index={2}>
          <Grid container spacing={2} alignItems="stretch">
            <Grid item xs={12} lg={8} sx={{ display: 'flex' }}>
              <WorkflowSectionCard
                title="Step 3 Table: Reading Worklist"
                subtitle={WORKSPACE_FLOW[2].description}
                sx={{ flex: 1 }}
              >
                <DataTable
                  tableId="radiology-reading-simple"
                  rows={reading}
                  columns={readingColumns}
                  rowHeight={62}
                  tableHeight={430}
                  onRowClick={(params) => setSelectedReadingId(String(params.id))}
                  toolbarConfig={{
                    title: 'Radiologist Reading Queue',
                    showSavedViews: false,
                    showDensity: false,
                  }}
                />
              </WorkflowSectionCard>
            </Grid>
            <Grid item xs={12} lg={4} sx={{ display: 'flex' }}>
              <WorkflowSectionCard
                title="Step 3 Checklist"
                subtitle={`Who uses: ${WORKSPACE_FLOW[2].whoUses}`}
                sx={{ flex: 1 }}
              >
                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.main', fontSize: 14 }}>
                      {selectedReadingCase ? getInitials(selectedReadingCase.patientName) : '--'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {selectedReadingCase?.patientName ?? 'No patient selected'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedReadingCase?.mrn ?? '-'} · {selectedReadingCase?.subspecialty ?? '-'}
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip
                    size="small"
                    label={`Report State: ${selectedReadingCase?.state ?? '-'}`}
                    color={selectedReadingCase ? reportColors[selectedReadingCase.state] : 'default'}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={`Prior Study: ${selectedReadingCase?.hasPrior ? 'Available' : 'Not Found'}`}
                    color={selectedReadingCase?.hasPrior ? 'success' : 'default'}
                    variant="outlined"
                  />
                  <TextField
                    size="small"
                    select
                    fullWidth
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
                  {selectedSafety ? (
                    <Stack spacing={0.75}>
                      <Chip
                        size="small"
                        label={`Contrast Safety: ${selectedSafety.risk}`}
                        color={selectedSafety.risk === 'Low' ? 'success' : 'warning'}
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary">
                        Creatinine {selectedSafety.creatinine} · eGFR {selectedSafety.egfr}
                      </Typography>
                    </Stack>
                  ) : (
                    <Chip size="small" label="Contrast Safety: No flag" variant="outlined" />
                  )}
                  <Typography variant="body2">1. Open case and review current + prior images.</Typography>
                  <Typography variant="body2">2. Use structured template and finalize findings.</Typography>
                  <Typography variant="body2">3. Sign report and close case.</Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={!canNavigate('/diagnostics/radiology/reports')}
                      onClick={() => router.push(withMrn('/diagnostics/radiology/reports'))}
                    >
                      Open Report Editor
                    </Button>
                    <Button variant="outlined" size="small" onClick={() => setActiveTab(0)}>
                      Back To Step 1
                    </Button>
                  </Stack>
                </Stack>
              </WorkflowSectionCard>
            </Grid>
          </Grid>
        </WorkspaceTabPanel>
      </Stack>
    </PageTemplate>
  );
}
