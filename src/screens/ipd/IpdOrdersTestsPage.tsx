'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { Card, CommonDialog, CommonTabs } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { getPatientByMrn } from '@/src/mocks/global-patients';
import { useUser } from '@/src/core/auth/UserContext';
import { canAccessRoute } from '@/src/core/navigation/route-access';
import { useAppSelector } from '@/src/store/hooks';
import { useIpdEncounters } from './ipd-encounter-context';
import { DISCHARGE_CANDIDATES, INPATIENT_STAYS } from './ipd-mock-data';
import IpdPatientTopBar, { IpdPatientOption, IpdPatientTopBarField } from './components/IpdPatientTopBar';
import { findActiveTransferLeadByMrn } from './ipd-transfer-store';
import { LabPriority, LabSample, SampleStatus } from '@/src/core/laboratory/types';
import { WorklistState } from '@/src/core/radiology/types';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Biotech as BiotechIcon,
  Bolt as BoltIcon,
  BugReport as BugReportIcon,
  CheckCircle as CheckCircleIcon,
  Checklist as ChecklistIcon,
  ContentCut as ContentCutIcon,
  Description as DescriptionIcon,
  EditNote as EditNoteIcon,
  Event as EventIcon,
  FactCheck as FactCheckIcon,
  Groups as GroupsIcon,
  History as HistoryIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Inventory2 as Inventory2Icon,
  Label as LabelIcon,
  LocalHospital as LocalHospitalIcon,
  MonitorHeart as MonitorHeartIcon,
  PersonSearch as PersonSearchIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  ReceiptLong as ReceiptLongIcon,
  RestartAlt as RestartAltIcon,
  Restaurant as RestaurantIcon,
  Science as ScienceIcon,
  Search as SearchIcon,
  TaskAlt as TaskAltIcon,
  ViewInAr as ViewInArIcon,
  Visibility as VisibilityIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';

type OrdersWorkspaceTab = 'orders' | 'lab' | 'radiology';
type OrderManagementTab = 'active' | 'sets' | 'quick' | 'cosign' | 'history';
type LabWorkspaceTab = 'results' | 'samples' | 'critical' | 'pending' | 'micro';
type RadiologyWorkspaceTab = 'reports' | 'worklist' | 'scheduled' | 'resulted' | 'pacs';

type WorkflowOrderType =
  | 'Lab'
  | 'Imaging'
  | 'Medication'
  | 'Nursing'
  | 'Diet'
  | 'Procedure'
  | 'Consult'
  | 'ECG';
type WorkflowOrderPriority = LabPriority;
type WorkflowOrderStatus = 'active' | 'pending' | 'completed' | 'discontinued';
type OrderFilter = 'All' | WorkflowOrderType;

type SnackSeverity = 'success' | 'info' | 'warning' | 'error';

interface LocalWorkflowOrder {
  id: string;
  patientMrn: string;
  type: WorkflowOrderType;
  description: string;
  frequency: string;
  by: string;
  time: string;
  priority: WorkflowOrderPriority;
  status: WorkflowOrderStatus;
}

interface WorkflowOrderRow {
  id: string;
  type: WorkflowOrderType;
  description: string;
  frequency: string;
  by: string;
  time: string;
  priority: WorkflowOrderPriority;
  status: WorkflowOrderStatus;
  source: 'lab' | 'radiology' | 'local';
}

interface OrderSetTemplate {
  name: string;
  items: Array<{
    type: WorkflowOrderType;
    description: string;
    frequency: string;
    priority: WorkflowOrderPriority;
  }>;
}

interface QuickOrderGroup {
  category: WorkflowOrderType;
  items: string[];
}

interface PendingCosignRow {
  id: string;
  title: string;
  detail: string;
}

interface MicrobiologyRow {
  id: string;
  title: string;
  detail: string;
  status: 'Pending' | 'Resulted';
}

interface SampleQueueRow {
  id: string;
  testName: string;
  specimenType: string;
  orderedTime: string;
  container: string;
  volume: string;
  baseStatus: SampleStatus;
  collectedBy: string;
  sample: LabSample | null;
}

interface IpdOrdersTestsPageProps {
  defaultTab?: OrdersWorkspaceTab;
}

interface OrderDialogDraft {
  type: WorkflowOrderType;
  priority: WorkflowOrderPriority;
  description: string;
  frequency: string;
  duration: string;
  notes: string;
}

const ORDER_FILTERS: Array<{ value: OrderFilter; label: string; Icon: React.ElementType }> = [
  { value: 'All', label: 'All', Icon: SearchIcon },
  { value: 'Lab', label: 'Lab', Icon: ScienceIcon },
  { value: 'Imaging', label: 'Imaging', Icon: BiotechIcon },
  { value: 'Nursing', label: 'Nursing', Icon: LocalHospitalIcon },
  { value: 'Diet', label: 'Diet', Icon: RestaurantIcon },
  { value: 'Procedure', label: 'Procedure', Icon: ContentCutIcon },
  { value: 'Consult', label: 'Consult', Icon: GroupsIcon },
  { value: 'ECG', label: 'ECG', Icon: MonitorHeartIcon },
];

const ORDER_TYPE_OPTIONS: WorkflowOrderType[] = [
  'Lab',
  'Imaging',
  'Nursing',
  'Diet',
  'Procedure',
  'Consult',
  'ECG',
];

function createEmptyOrderDraft(): OrderDialogDraft {
  return {
    type: 'Lab',
    priority: 'Routine',
    description: '',
    frequency: 'Once',
    duration: '',
    notes: '',
  };
}

function iconLabel(Icon: React.ElementType, text: string): React.ReactNode {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Icon sx={{ fontSize: 16 }} />
      <span>{text}</span>
    </Stack>
  );
}

const ORDER_SET_TEMPLATES: OrderSetTemplate[] = [
  {
    name: 'Chest Pain / ACS Bundle',
    items: [
      { type: 'Lab', description: 'CBC + CMP STAT', frequency: 'Once', priority: 'STAT' },
      { type: 'Lab', description: 'Troponin Q6H x3', frequency: 'Q6H', priority: 'STAT' },
      { type: 'ECG', description: '12-Lead ECG STAT', frequency: 'Once', priority: 'STAT' },
      { type: 'Imaging', description: 'Chest X-Ray PA/Lateral', frequency: 'Once', priority: 'Urgent' },
      { type: 'Consult', description: 'Cardiology consult', frequency: 'Once', priority: 'Urgent' },
      { type: 'Nursing', description: 'Cardiac monitoring protocol', frequency: 'Continuous', priority: 'STAT' },
    ],
  },
  {
    name: 'Sepsis Protocol',
    items: [
      { type: 'Lab', description: 'Blood Culture x2', frequency: 'Once', priority: 'STAT' },
      { type: 'Lab', description: 'Lactate STAT', frequency: 'Once', priority: 'STAT' },
      { type: 'Lab', description: 'CBC + CMP STAT', frequency: 'Once', priority: 'STAT' },
      { type: 'Imaging', description: 'Chest X-Ray', frequency: 'Once', priority: 'Urgent' },
      { type: 'Nursing', description: 'Sepsis nursing bundle activation', frequency: 'Once', priority: 'STAT' },
      { type: 'Consult', description: 'Critical care consult', frequency: 'Once', priority: 'Urgent' },
    ],
  },
  {
    name: 'Post-Op Care',
    items: [
      { type: 'Lab', description: 'Post-op CBC', frequency: 'Daily', priority: 'Routine' },
      { type: 'Nursing', description: 'Wound assessment', frequency: 'Q8H', priority: 'Routine' },
      { type: 'Procedure', description: 'Physiotherapy referral', frequency: 'Daily', priority: 'Routine' },
      { type: 'Nursing', description: 'DVT prophylaxis checks', frequency: 'Daily', priority: 'Routine' },
    ],
  },
  {
    name: 'Diabetes Management',
    items: [
      { type: 'Lab', description: 'HbA1c', frequency: 'Once', priority: 'Routine' },
      { type: 'Lab', description: 'Fasting blood sugar', frequency: 'Daily', priority: 'Routine' },
      { type: 'Lab', description: 'Renal panel', frequency: 'Daily', priority: 'Routine' },
      { type: 'Consult', description: 'Diabetology consult', frequency: 'Once', priority: 'Routine' },
      { type: 'Diet', description: 'Diabetic diet plan', frequency: 'Daily', priority: 'Routine' },
      { type: 'Nursing', description: 'Glucose monitoring protocol', frequency: 'Q6H', priority: 'Routine' },
    ],
  },
];

const QUICK_ORDER_GROUPS: QuickOrderGroup[] = [
  {
    category: 'Lab',
    items: ['CBC', 'CMP', 'Troponin', 'ABG', 'Lactate', 'PT/INR', 'D-Dimer', 'HbA1c'],
  },
  {
    category: 'Imaging',
    items: ['Chest X-Ray', 'CT Head', 'CT Chest', 'USG Abdomen', '2D Echo', 'MRI Brain'],
  },
];

const PENDING_COSIGN_ROWS: PendingCosignRow[] = [
  {
    id: 'cosign-1',
    title: '2D Echocardiogram - Cardiology',
    detail: 'Needs attending cosign before scheduling.',
  },
  {
    id: 'cosign-2',
    title: 'Repeat ABG - ICU Follow-up',
    detail: 'Resident order pending consultant confirmation.',
  },
];

const MICROBIOLOGY_ROWS: MicrobiologyRow[] = [
  {
    id: 'micro-1',
    title: 'Blood Culture x2',
    detail: 'No growth so far. Final report expected in 24-48h.',
    status: 'Pending',
  },
  {
    id: 'micro-2',
    title: 'Urine Culture',
    detail: 'Mixed flora isolated. Sensitivity panel in progress.',
    status: 'Pending',
  },
  {
    id: 'micro-3',
    title: 'Sputum Culture',
    detail: 'Organism identified. Preliminary sensitivity available.',
    status: 'Resulted',
  },
];

function routeForOrdersWorkspaceTab(tab: OrdersWorkspaceTab): string {
  if (tab === 'lab') return '/ipd/orders-tests/lab';
  if (tab === 'radiology') return '/ipd/orders-tests/radiology';
  return '/ipd/orders-tests/orders';
}

function currentTimeLabel(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function toDisplayLabel(value: string): string {
  if (!value || value === '--') return '--';
  const tokens = value
    .split(/[\s-_]+/)
    .filter(Boolean);
  if (tokens.length === 0) return '--';
  return tokens
    .map((token) => token[0]?.toUpperCase() + token.slice(1))
    .join(' ');
}

function workflowOrderStatusColor(status: WorkflowOrderStatus): 'success' | 'warning' | 'default' | 'error' {
  if (status === 'completed') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'discontinued') return 'error';
  return 'default';
}

function workflowPriorityColor(priority: WorkflowOrderPriority): 'error' | 'warning' | 'default' {
  if (priority === 'STAT') return 'error';
  if (priority === 'Urgent') return 'warning';
  return 'default';
}

function sampleStatusColor(status: SampleStatus): 'warning' | 'info' | 'success' | 'error' | 'default' {
  if (status === 'Pending') return 'warning';
  if (status === 'Collected') return 'info';
  if (status === 'In Transit') return 'default';
  if (status === 'Received') return 'success';
  return 'error';
}

function worklistStatusColor(state: WorklistState): 'default' | 'info' | 'warning' | 'success' {
  if (state === 'In Progress') return 'info';
  if (state === 'Tech QA') return 'warning';
  if (state === 'Sent to PACS') return 'success';
  return 'default';
}

function resultFlagColor(flag: string): 'success' | 'warning' | 'error' | 'default' {
  const normalized = flag.toLowerCase();
  if (normalized.includes('critical')) return 'error';
  if (normalized.includes('abnormal')) return 'warning';
  if (normalized.includes('normal')) return 'success';
  return 'default';
}

function normalizeOrderStatusFromLab(status: string): WorkflowOrderStatus {
  if (status === 'Resulted') return 'completed';
  if (status === 'Pending Collection') return 'pending';
  return 'active';
}

function normalizeOrderStatusFromRadiology(validationState: string): WorkflowOrderStatus {
  if (validationState === 'Hold') return 'discontinued';
  if (validationState === 'Ready') return 'active';
  return 'pending';
}

function volumeBySpecimen(specimenType: string): string {
  const lower = specimenType.toLowerCase();
  if (lower.includes('blood')) return '3 mL';
  if (lower.includes('urine')) return '10 mL';
  if (lower.includes('sputum')) return '5 mL';
  return '2 mL';
}

export default function IpdOrdersTestsPage({ defaultTab = 'orders' }: IpdOrdersTestsPageProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mrnParam = useMrnParam();
  const { permissions } = useUser();

  const encounterRows = useIpdEncounters();
  const labOrders = useAppSelector((state) => state.lab.orders);
  const labSamples = useAppSelector((state) => state.lab.samples);
  const labResults = useAppSelector((state) => state.lab.results);
  const radiologyOrders = useAppSelector((state) => state.radiology.orders);
  const radiologyWorklist = useAppSelector((state) => state.radiology.worklist);
  const radiologyReading = useAppSelector((state) => state.radiology.reading);

  const [ordersTab, setOrdersTab] = React.useState<OrderManagementTab>('active');
  const [labTab, setLabTab] = React.useState<LabWorkspaceTab>('results');
  const [radiologyTab, setRadiologyTab] = React.useState<RadiologyWorkspaceTab>('reports');
  const [orderTypeFilter, setOrderTypeFilter] = React.useState<OrderFilter>('All');
  const [selectedLabResultId, setSelectedLabResultId] = React.useState('');
  const [selectedRadiologyOrderId, setSelectedRadiologyOrderId] = React.useState('');
  const [localOrdersByMrn, setLocalOrdersByMrn] = React.useState<Record<string, LocalWorkflowOrder[]>>({});
  const [orderStatusOverrides, setOrderStatusOverrides] = React.useState<Record<string, WorkflowOrderStatus>>({});
  const [sampleStatusOverrides, setSampleStatusOverrides] = React.useState<Record<string, SampleStatus>>({});
  const [worklistStatusOverrides, setWorklistStatusOverrides] = React.useState<Record<string, WorklistState>>({});
  const [orderDialogOpen, setOrderDialogOpen] = React.useState(false);
  const [orderDialogError, setOrderDialogError] = React.useState('');
  const [orderDraft, setOrderDraft] = React.useState<OrderDialogDraft>(createEmptyOrderDraft);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: SnackSeverity;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const activeEncounters = React.useMemo(
    () => encounterRows.filter((record) => record.workflowStatus !== 'discharged'),
    [encounterRows]
  );

  const selectedEncounter = React.useMemo(() => {
    if (activeEncounters.length === 0) return null;
    if (mrnParam) {
      const matched = activeEncounters.find((record) => record.mrn === mrnParam);
      if (matched) return matched;
    }
    return activeEncounters[0];
  }, [activeEncounters, mrnParam]);

  const selectedMrn = selectedEncounter?.mrn ?? mrnParam;
  const orderStoreKey = selectedMrn || '__global__';

  React.useEffect(() => {
    if (defaultTab !== 'orders') return;
    if (typeof document !== 'undefined') {
      const mainScroller = document.querySelector<HTMLElement>('main');
      if (mainScroller) {
        mainScroller.scrollTop = 0;
      }
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [defaultTab, ordersTab, selectedMrn]);

  const showSnack = React.useCallback((message: string, severity: SnackSeverity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const canNavigate = React.useCallback(
    (route: string) => canAccessRoute(route, permissions),
    [permissions]
  );

  const withMrn = React.useCallback(
    (route: string) => {
      if (!selectedMrn) return route;
      const joiner = route.includes('?') ? '&' : '?';
      return `${route}${joiner}mrn=${encodeURIComponent(selectedMrn)}`;
    },
    [selectedMrn]
  );

  const openRoute = React.useCallback(
    (route: string, accessRoute?: string) => {
      const checkRoute = accessRoute ?? route;
      if (!canNavigate(checkRoute)) return;
      router.push(withMrn(route));
    },
    [canNavigate, router, withMrn]
  );

  const navigateModule = React.useCallback(
    (tab: OrdersWorkspaceTab) => {
      const targetRoute = routeForOrdersWorkspaceTab(tab);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('tab');
      if (selectedMrn) {
        params.set('mrn', selectedMrn);
      } else {
        params.delete('mrn');
      }
      const query = params.toString();
      router.push(query ? `${targetRoute}?${query}` : targetRoute);
    },
    [router, searchParams, selectedMrn]
  );

  const replaceMrnInRoute = React.useCallback(
    (nextMrn: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextMrn) {
        params.set('mrn', nextMrn);
      } else {
        params.delete('mrn');
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const patientLabOrders = React.useMemo(
    () => (selectedMrn ? labOrders.filter((row) => row.mrn === selectedMrn) : []),
    [labOrders, selectedMrn]
  );
  const patientLabSamples = React.useMemo(
    () => (selectedMrn ? labSamples.filter((row) => row.mrn === selectedMrn) : []),
    [labSamples, selectedMrn]
  );
  const patientLabResults = React.useMemo(
    () => (selectedMrn ? labResults.filter((row) => row.mrn === selectedMrn) : []),
    [labResults, selectedMrn]
  );
  const patientRadiologyOrders = React.useMemo(
    () => (selectedMrn ? radiologyOrders.filter((row) => row.mrn === selectedMrn) : []),
    [radiologyOrders, selectedMrn]
  );
  const patientRadiologyWorklist = React.useMemo(
    () => (selectedMrn ? radiologyWorklist.filter((row) => row.mrn === selectedMrn) : []),
    [radiologyWorklist, selectedMrn]
  );
  const patientRadiologyReading = React.useMemo(
    () => (selectedMrn ? radiologyReading.filter((row) => row.mrn === selectedMrn) : []),
    [radiologyReading, selectedMrn]
  );

  const linkedTransferLead = React.useMemo(
    () => (selectedMrn ? findActiveTransferLeadByMrn(selectedMrn) : null),
    [selectedMrn]
  );

  const localOrders = localOrdersByMrn[orderStoreKey] ?? [];

  const workflowOrders = React.useMemo<WorkflowOrderRow[]>(() => {
    const fromLab: WorkflowOrderRow[] = patientLabOrders.map((row) => ({
      id: `lab-${row.id}`,
      type: 'Lab',
      description: row.testPanel,
      frequency: row.collectionWindow || 'As ordered',
      by: row.orderingPhysician || 'Physician',
      time: row.requestedAt || '--',
      priority: row.priority,
      status: normalizeOrderStatusFromLab(row.status),
      source: 'lab',
    }));

    const fromRadiology: WorkflowOrderRow[] = patientRadiologyOrders.map((row) => ({
      id: `rad-${row.id}`,
      type: row.modality.toLowerCase().includes('ecg') ? 'ECG' : 'Imaging',
      description: row.study,
      frequency: row.scheduledSlot || 'As scheduled',
      by: 'Radiology Order Desk',
      time: row.scheduledSlot || '--',
      priority: row.priority,
      status: normalizeOrderStatusFromRadiology(row.validationState),
      source: 'radiology',
    }));

    const fromLocal: WorkflowOrderRow[] = localOrders.map((row) => ({
      id: row.id,
      type: row.type,
      description: row.description,
      frequency: row.frequency,
      by: row.by,
      time: row.time,
      priority: row.priority,
      status: row.status,
      source: 'local',
    }));

    const merged = [...fromLab, ...fromRadiology, ...fromLocal];
    return merged.map((row) => ({
      ...row,
      status: orderStatusOverrides[row.id] ?? row.status,
    }));
  }, [localOrders, orderStatusOverrides, patientLabOrders, patientRadiologyOrders]);

  const activeOrders = React.useMemo(
    () => workflowOrders.filter((row) => row.status === 'active' || row.status === 'pending'),
    [workflowOrders]
  );
  const filteredActiveOrders = React.useMemo(
    () =>
      activeOrders.filter((row) => {
        if (orderTypeFilter === 'All') return true;
        return row.type === orderTypeFilter;
      }),
    [activeOrders, orderTypeFilter]
  );
  const historyOrders = React.useMemo(
    () => workflowOrders.filter((row) => row.status === 'completed' || row.status === 'discontinued'),
    [workflowOrders]
  );

  const handleApplyOrderSet = React.useCallback(
    (setTemplate: OrderSetTemplate) => {
      if (!selectedMrn) return;
      const now = currentTimeLabel();
      const createdRows: LocalWorkflowOrder[] = setTemplate.items.map((item, index) => ({
        id: `local-${selectedMrn}-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
        patientMrn: selectedMrn,
        type: item.type,
        description: item.description,
        frequency: item.frequency,
        by: selectedEncounter?.consultant || 'Attending Physician',
        time: now,
        priority: item.priority,
        status: 'pending',
      }));

      setLocalOrdersByMrn((prev) => ({
        ...prev,
        [orderStoreKey]: [...createdRows, ...(prev[orderStoreKey] ?? [])],
      }));
      setOrdersTab('active');
      showSnack(`${setTemplate.name} applied with ${createdRows.length} orders.`, 'success');
    },
    [orderStoreKey, selectedEncounter?.consultant, selectedMrn, showSnack]
  );

  const handleQuickOrder = React.useCallback(
    (category: WorkflowOrderType, description: string) => {
      if (!selectedMrn) return;
      const nextRow: LocalWorkflowOrder = {
        id: `local-${selectedMrn}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        patientMrn: selectedMrn,
        type: category,
        description,
        frequency: 'As ordered',
        by: selectedEncounter?.consultant || 'Attending Physician',
        time: currentTimeLabel(),
        priority: category === 'Lab' || category === 'Imaging' ? 'Urgent' : 'Routine',
        status: 'pending',
      };

      setLocalOrdersByMrn((prev) => ({
        ...prev,
        [orderStoreKey]: [nextRow, ...(prev[orderStoreKey] ?? [])],
      }));
      showSnack(`Quick order placed: ${description}`, 'success');
    },
    [orderStoreKey, selectedEncounter?.consultant, selectedMrn, showSnack]
  );

  const openOrderDialog = React.useCallback(() => {
    setOrderDialogError('');
    setOrderDraft(createEmptyOrderDraft());
    setOrderDialogOpen(true);
  }, []);

  const submitOrderFromDialog = React.useCallback(() => {
    if (!selectedMrn) {
      showSnack('Select a patient before placing an order.', 'warning');
      return;
    }
    if (!orderDraft.description.trim()) {
      setOrderDialogError('Order description is required.');
      return;
    }

    const description = orderDraft.notes.trim()
      ? `${orderDraft.description.trim()} | Note: ${orderDraft.notes.trim()}`
      : orderDraft.description.trim();
    const frequency = orderDraft.duration.trim()
      ? `${orderDraft.frequency.trim() || 'Once'} | ${orderDraft.duration.trim()}`
      : orderDraft.frequency.trim() || 'Once';

    const nextRow: LocalWorkflowOrder = {
      id: `local-${selectedMrn}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      patientMrn: selectedMrn,
      type: orderDraft.type,
      description,
      frequency,
      by: selectedEncounter?.consultant || 'Attending Physician',
      time: currentTimeLabel(),
      priority: orderDraft.priority,
      status: 'pending',
    };

    setLocalOrdersByMrn((prev) => ({
      ...prev,
      [orderStoreKey]: [nextRow, ...(prev[orderStoreKey] ?? [])],
    }));
    setOrderDialogOpen(false);
    setOrdersTab('active');
    showSnack(`Order placed: ${orderDraft.description.trim()}`, 'success');
  }, [orderDraft, orderStoreKey, selectedEncounter?.consultant, selectedMrn, showSnack]);

  const setOrderStatus = React.useCallback(
    (orderId: string, status: WorkflowOrderStatus, message: string) => {
      setOrderStatusOverrides((prev) => ({
        ...prev,
        [orderId]: status,
      }));
      showSnack(message, status === 'discontinued' ? 'warning' : 'success');
    },
    [showSnack]
  );

  const completeAllStat = React.useCallback(() => {
    const targetIds = workflowOrders
      .filter((row) => row.priority === 'STAT' && row.status !== 'completed' && row.status !== 'discontinued')
      .map((row) => row.id);

    if (targetIds.length === 0) {
      showSnack('No open STAT orders found.', 'info');
      return;
    }

    setOrderStatusOverrides((prev) => {
      const next = { ...prev };
      targetIds.forEach((id) => {
        next[id] = 'completed';
      });
      return next;
    });

    showSnack(`${targetIds.length} STAT orders marked completed.`, 'success');
  }, [showSnack, workflowOrders]);

  const sampleQueueRows = React.useMemo<SampleQueueRow[]>(() => {
    const rowsFromSamples: SampleQueueRow[] = patientLabSamples.map((sample) => ({
      id: sample.id,
      testName: sample.testPanel,
      specimenType: sample.specimenType,
      orderedTime: sample.collectionTime || '--',
      container: sample.container || '--',
      volume: volumeBySpecimen(sample.specimenType),
      baseStatus: sample.status,
      collectedBy: sample.collectedBy || '--',
      sample,
    }));

    const sampleIds = new Set(rowsFromSamples.map((row) => row.id));
    const rowsFromPendingOrders: SampleQueueRow[] = patientLabOrders
      .filter((order) => !sampleIds.has(order.id))
      .map((order) => ({
        id: order.id,
        testName: order.testPanel,
        specimenType: order.specimenType,
        orderedTime: order.requestedAt || '--',
        container: order.specimenType.toLowerCase().includes('urine') ? 'Sterile Cup' : 'EDTA Tube',
        volume: volumeBySpecimen(order.specimenType),
        baseStatus: 'Pending' as SampleStatus,
        collectedBy: '--',
        sample: null,
      }));

    return [...rowsFromPendingOrders, ...rowsFromSamples];
  }, [patientLabOrders, patientLabSamples]);

  const sampleRowsWithStatus = React.useMemo(
    () =>
      sampleQueueRows.map((row) => ({
        ...row,
        displayStatus: sampleStatusOverrides[row.id] ?? row.baseStatus,
      })),
    [sampleQueueRows, sampleStatusOverrides]
  );

  const pendingSampleCount = sampleRowsWithStatus.filter((row) => row.displayStatus === 'Pending').length;

  const selectedLabResult = React.useMemo(
    () => patientLabResults.find((row) => row.id === selectedLabResultId) ?? patientLabResults[0] ?? null,
    [patientLabResults, selectedLabResultId]
  );

  React.useEffect(() => {
    if (patientLabResults.length === 0) {
      setSelectedLabResultId('');
      return;
    }
    if (!patientLabResults.find((row) => row.id === selectedLabResultId)) {
      setSelectedLabResultId(patientLabResults[0].id);
    }
  }, [patientLabResults, selectedLabResultId]);

  const criticalLabResults = React.useMemo(
    () => patientLabResults.filter((row) => row.flag === 'Critical'),
    [patientLabResults]
  );

  const pendingLabRows = React.useMemo(() => {
    const fromOrders = patientLabOrders
      .filter((row) => row.status !== 'Resulted')
      .map((row) => ({
        id: row.id,
        title: row.testPanel,
        detail: `Ordered ${row.requestedAt} by ${row.orderingPhysician}`,
      }));

    const fromResults = patientLabResults
      .filter((row) => row.state === 'Pending Review')
      .map((row) => ({
        id: `res-${row.id}`,
        title: row.testName,
        detail: `Result pending review (${row.reportedAt})`,
      }));

    const merged = new Map<string, { id: string; title: string; detail: string }>();
    [...fromOrders, ...fromResults].forEach((row) => merged.set(row.id, row));
    return Array.from(merged.values());
  }, [patientLabOrders, patientLabResults]);

  const selectedRadiologyOrder = React.useMemo(
    () =>
      patientRadiologyOrders.find((row) => row.id === selectedRadiologyOrderId) ??
      patientRadiologyOrders[0] ??
      null,
    [patientRadiologyOrders, selectedRadiologyOrderId]
  );

  React.useEffect(() => {
    if (patientRadiologyOrders.length === 0) {
      setSelectedRadiologyOrderId('');
      return;
    }
    if (!patientRadiologyOrders.find((row) => row.id === selectedRadiologyOrderId)) {
      setSelectedRadiologyOrderId(patientRadiologyOrders[0].id);
    }
  }, [patientRadiologyOrders, selectedRadiologyOrderId]);

  const selectedReadingCase = React.useMemo(() => {
    if (!selectedRadiologyOrder) return null;
    return (
      patientRadiologyReading.find(
        (row) =>
          row.study.toLowerCase() === selectedRadiologyOrder.study.toLowerCase() ||
          row.modality.toLowerCase() === selectedRadiologyOrder.modality.toLowerCase()
      ) ?? null
    );
  }, [patientRadiologyReading, selectedRadiologyOrder]);

  const worklistRowsWithStatus = React.useMemo(
    () =>
      patientRadiologyWorklist.map((row) => ({
        ...row,
        displayState: worklistStatusOverrides[row.id] ?? row.state,
      })),
    [patientRadiologyWorklist, worklistStatusOverrides]
  );

  const scheduledRadiologyRows = React.useMemo(
    () => patientRadiologyOrders.filter((row) => row.validationState !== 'Hold'),
    [patientRadiologyOrders]
  );

  const resultedRadiologyRows = React.useMemo(
    () => patientRadiologyReading.filter((row) => row.state === 'Final Signed'),
    [patientRadiologyReading]
  );

  const navigateAllowed = {
    orderManagement: canNavigate('/ipd/orders-tests/orders'),
    labResult: canNavigate('/ipd/orders-tests/lab'),
    radiology: canNavigate('/ipd/orders-tests/radiology'),
    openRounds: canNavigate('/ipd/rounds'),
  };

  const moduleTitleMap: Record<OrdersWorkspaceTab, { title: string; subtitle: string }> = {
    orders: {
      title: 'Order Management - CPOE',
      subtitle: 'Unified ordering, order sets, quick orders, and order tracking.',
    },
    lab: {
      title: 'Laboratory - Sample Collection & Results',
      subtitle: 'Order to sample to result workflow with critical alerts.',
    },
    radiology: {
      title: 'Radiology - Orders, Worklist, Reports',
      subtitle: 'Order to worklist to report workflow with PACS handoff.',
    },
  };

  const moduleTitle = moduleTitleMap[defaultTab];
  const workspaceTabsSx = React.useMemo(
    () => ({
      px: 0.15,
      py: 0.35,
      '& .MuiTab-root': {
        minHeight: 42,
      },
    }),
    []
  );
  const ordersTabItems = React.useMemo<Array<{ id: OrderManagementTab; label: React.ReactNode }>>(
    () => [
      { id: 'active', label: iconLabel(AssignmentTurnedInIcon, `Active Orders (${activeOrders.length})`) },
      { id: 'sets', label: iconLabel(Inventory2Icon, `Order Sets (${ORDER_SET_TEMPLATES.length})`) },
      { id: 'quick', label: iconLabel(BoltIcon, 'Quick Orders') },
      { id: 'cosign', label: iconLabel(EditNoteIcon, `Pending Cosign (${PENDING_COSIGN_ROWS.length})`) },
      { id: 'history', label: iconLabel(HistoryIcon, `History (${historyOrders.length})`) },
    ],
    [activeOrders.length, historyOrders.length]
  );
  const labTabItems = React.useMemo<Array<{ id: LabWorkspaceTab; label: React.ReactNode }>>(
    () => [
      { id: 'results', label: iconLabel(FactCheckIcon, `Results (${patientLabResults.length})`) },
      { id: 'samples', label: iconLabel(ScienceIcon, `Sample Collection (${pendingSampleCount})`) },
      { id: 'critical', label: iconLabel(WarningAmberIcon, `Critical (${criticalLabResults.length})`) },
      { id: 'pending', label: iconLabel(HourglassEmptyIcon, `Pending (${pendingLabRows.length})`) },
      { id: 'micro', label: iconLabel(BugReportIcon, 'Microbiology') },
    ],
    [criticalLabResults.length, patientLabResults.length, pendingLabRows.length, pendingSampleCount]
  );
  const radiologyTabItems = React.useMemo<Array<{ id: RadiologyWorkspaceTab; label: React.ReactNode }>>(
    () => [
      { id: 'reports', label: iconLabel(DescriptionIcon, `Reports (${patientRadiologyOrders.length})`) },
      { id: 'worklist', label: iconLabel(ChecklistIcon, `Worklist (${worklistRowsWithStatus.length})`) },
      { id: 'scheduled', label: iconLabel(EventIcon, `Scheduled (${scheduledRadiologyRows.length})`) },
      { id: 'resulted', label: iconLabel(TaskAltIcon, `Resulted (${resultedRadiologyRows.length})`) },
      { id: 'pacs', label: iconLabel(ViewInArIcon, 'PACS Viewer') },
    ],
    [
      patientRadiologyOrders.length,
      resultedRadiologyRows.length,
      scheduledRadiologyRows.length,
      worklistRowsWithStatus.length,
    ]
  );
  const topBarPatientOptions = React.useMemo<IpdPatientOption[]>(() => {
    return activeEncounters.map((encounter) => {
      const stay = INPATIENT_STAYS.find((row) => row.id === encounter.patientId || row.mrn === encounter.mrn);
      const discharge = DISCHARGE_CANDIDATES.find((row) => row.patientId === encounter.patientId);
      const globalPatient = getPatientByMrn(encounter.mrn);
      const status = encounter.dischargeReady
        ? 'Discharge Due'
        : encounter.clinicalStatus === 'critical'
        ? 'Critical'
        : encounter.ward.toLowerCase().includes('icu')
        ? 'ICU'
        : 'Admitted';
      const tags = ['Admitted'];
      if (encounter.dischargeReady) tags.push('Discharge Due');
      if (encounter.clinicalStatus === 'critical') tags.push('Critical');
      if (encounter.ward.toLowerCase().includes('icu') || encounter.bed.toLowerCase().includes('icu')) tags.push('ICU');

      return {
        patientId: encounter.patientId,
        name: encounter.patientName,
        mrn: encounter.mrn,
        ageGender: stay?.ageGender ?? globalPatient?.ageGender ?? '--',
        ward: encounter.ward || stay?.ward || '--',
        bed: encounter.bed || stay?.bed || '--',
        consultant: encounter.consultant || stay?.consultant || '--',
        diagnosis: encounter.diagnosis || stay?.diagnosis || '--',
        status,
        statusTone:
          status === 'Critical' ? 'error' : status === 'Discharge Due' ? 'warning' : status === 'ICU' ? 'info' : 'success',
        tags,
      };
    });
  }, [activeEncounters]);

  const selectedTopBarPatient = React.useMemo(
    () =>
      selectedEncounter
        ? topBarPatientOptions.find((row) => row.patientId === selectedEncounter.patientId) ?? null
        : null,
    [selectedEncounter, topBarPatientOptions]
  );

  const selectedTopBarFields = React.useMemo<IpdPatientTopBarField[]>(() => {
    if (!selectedEncounter) return [];
    const stay = INPATIENT_STAYS.find((row) => row.id === selectedEncounter.patientId || row.mrn === selectedEncounter.mrn);
    const discharge = DISCHARGE_CANDIDATES.find((row) => row.patientId === selectedEncounter.patientId);
    const globalPatient = getPatientByMrn(selectedEncounter.mrn);
    const status = selectedEncounter.dischargeReady
      ? 'Discharge Due'
      : selectedEncounter.clinicalStatus === 'critical'
      ? 'Critical'
      : selectedEncounter.ward.toLowerCase().includes('icu')
      ? 'ICU'
      : 'Admitted';

    return [
      { id: 'age-sex', label: 'Age / Sex', value: stay?.ageGender ?? globalPatient?.ageGender ?? '--' },
      { id: 'ward-bed', label: 'Ward / Bed', value: `${selectedEncounter.ward || '--'} · ${selectedEncounter.bed || '--'}` },
      { id: 'admitted', label: 'Admitted', value: stay?.admissionDate ?? '--' },
      { id: 'los', label: 'LOS', value: discharge ? `Day ${discharge.losDays}` : '--' },
      { id: 'diagnosis', label: 'Diagnosis', value: selectedEncounter.diagnosis || '--' },
      { id: 'consultant', label: 'Consultant', value: selectedEncounter.consultant || '--' },
      { id: 'blood-group', label: 'Blood Group', value: '--' },
      { id: 'insurance', label: 'Insurance', value: '--' },
      { id: 'status', label: 'Status', value: status, tone: status === 'Critical' ? 'error' : status === 'Discharge Due' ? 'warning' : 'success' },
      { id: 'total-bill', label: 'Total Bill', value: '--' },
    ];
  }, [selectedEncounter]);

  const topBarHeader = (
    <IpdPatientTopBar
      moduleTitle="IPD Orders & Tests"
      sectionLabel="IPD"
      pageLabel={moduleTitle.title}
      patient={selectedTopBarPatient}
      fields={selectedTopBarFields}
      patientOptions={topBarPatientOptions}
      onSelectPatient={(patientId) => {
        const matched = topBarPatientOptions.find((item) => item.patientId === patientId);
        if (!matched) return;
        replaceMrnInRoute(matched.mrn);
      }}
    />
  );

  const headerActions = (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>

      {defaultTab === 'orders' ? (
        <>
          <Button size="small" variant="outlined" startIcon={<BoltIcon />} onClick={() => setOrdersTab('quick')}>
            Quick Order
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            disabled={!navigateAllowed.orderManagement}
            onClick={openOrderDialog}
          >
            New Order
          </Button>
        </>
      ) : null}

      {defaultTab === 'lab' ? (
        <>
          <Button size="small" variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigateModule('orders')}>
            Back to Orders
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<ScienceIcon />}
            disabled={!navigateAllowed.orderManagement}
            onClick={() => navigateModule('orders')}
          >
            Order Lab
          </Button>
        </>
      ) : null}

      {defaultTab === 'radiology' ? (
        <>
          <Button size="small" variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigateModule('orders')}>
            Back to Orders
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<BiotechIcon />}
            disabled={!navigateAllowed.orderManagement}
            onClick={() => navigateModule('orders')}
          >
            Order Imaging
          </Button>
        </>
      ) : null}
    </Stack>
  );

  if (activeEncounters.length === 0) {
    return (
      <PageTemplate title="Orders & Tests" header={topBarHeader} currentPageTitle="Orders & Tests">
        <Alert severity="info">No active inpatient encounters are available.</Alert>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title="Orders & Tests" header={topBarHeader}>
      <Stack spacing={2}>
        {linkedTransferLead ? (
          <Alert
            severity="info"
            action={
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<ReceiptLongIcon />}
                  onClick={() =>
                    openRoute(
                      `/encounters/${encodeURIComponent(linkedTransferLead.encounterId)}/orders`,
                      '/appointments/queue'
                    )
                  }
                >
                  Open Linked OPD Orders
                </Button>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<PersonSearchIcon />}
                  onClick={() => openRoute('/clinical/modules/ambulatory-care-opd', '/appointments/queue')}
                >
                  Open OPD Visit
                </Button>
              </Stack>
            }
          >
            IPD-OPD link active for {linkedTransferLead.patientName} ({linkedTransferLead.mrn}) from encounter{' '}
            {linkedTransferLead.encounterId}.
          </Alert>
        ) : null}

        <Stack spacing={0}>
          <Card
            elevation={0}
            sx={{
              p: { xs: 1.5, md: 2 },
              borderRadius: '10px 10px 0 0',
              borderBottom: 'none',
              borderColor: alpha(theme.palette.primary.main, 0.16),
              background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(
                theme.palette.info.main,
                0.06
              )} 100%)`,
            }}
          >
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              spacing={1.25}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', lg: 'center' }}
            >
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.1 }}>
                  {moduleTitle.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {moduleTitle.subtitle}
                </Typography>
              </Box>
              {headerActions}
            </Stack>
          </Card>

          <Card
            elevation={0}
            sx={{
              borderRadius: '0 0 10px 10px',
              border: '1px solid',
              borderTop: 'none',
              borderColor: alpha(theme.palette.primary.main, 0.16),
              overflow: 'hidden',
            }}
          >
            {defaultTab === 'orders' ? (
              <Box
                sx={{
                  px: 2,
                  py: 1.25,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 700, textTransform: 'uppercase' }}
                >
                  Filter by order type:
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                  {ORDER_FILTERS.map((option) => (
                    <Chip
                      key={option.value}
                      label={iconLabel(option.Icon, option.label)}
                      size="medium"
                      color={orderTypeFilter === option.value ? 'primary' : 'default'}
                      variant={orderTypeFilter === option.value ? 'filled' : 'outlined'}
                      onClick={() => setOrderTypeFilter(option.value)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Stack>
              </Box>
            ) : null}

            <Box sx={{ px: 0.75, py: 0.45 }}>
              {defaultTab === 'orders' ? (
                <CommonTabs tabs={ordersTabItems} value={ordersTab} onChange={setOrdersTab} sx={workspaceTabsSx} />
              ) : null}
              {defaultTab === 'lab' ? (
                <CommonTabs tabs={labTabItems} value={labTab} onChange={setLabTab} sx={workspaceTabsSx} />
              ) : null}
              {defaultTab === 'radiology' ? (
                <CommonTabs
                  tabs={radiologyTabItems}
                  value={radiologyTab}
                  onChange={setRadiologyTab}
                  sx={workspaceTabsSx}
                />
              ) : null}
            </Box>
          </Card>
        </Stack>

        {defaultTab === 'orders' ? (
          <Stack spacing={2}>
            {ordersTab === 'active' ? (
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.16),
                }}
              >
                <Stack spacing={1.5}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    spacing={1}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Active & Pending Orders ({filteredActiveOrders.length})
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Button size="small" variant="outlined" startIcon={<PlaylistAddCheckIcon />} onClick={completeAllStat}>
                        Complete All STAT
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ReceiptLongIcon />}
                        disabled={!navigateAllowed.openRounds}
                        onClick={() => openRoute('/ipd/rounds?tab=orders', '/ipd/rounds')}
                      >
                        Open Clinical Orders
                      </Button>
                    </Stack>
                  </Stack>

                  <Divider />

                  <Stack spacing={1}>
                    {filteredActiveOrders.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No active orders for this filter.
                      </Typography>
                    ) : (
                      filteredActiveOrders.map((order) => (
                        <Box
                          key={order.id}
                          sx={{
                            p: 1.25,
                            borderRadius: 1.5,
                            // border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                              {order.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {order.type} | {order.by} | {order.time} | {order.frequency}
                            </Typography>
                          </Box>

                          <Stack direction="row" spacing={0.75} alignItems="center" useFlexGap flexWrap="wrap">
                            <Chip size="small" label={order.priority} color={workflowPriorityColor(order.priority)} />
                            <Chip
                              size="small"
                              label={order.status.toUpperCase()}
                              color={workflowOrderStatusColor(order.status)}
                              variant={order.status === 'active' ? 'outlined' : 'filled'}
                            />
                            {order.type === 'Lab' ? (
                              <Button
                                size="small"
                                variant="text"
                                startIcon={<ScienceIcon />}
                                disabled={!navigateAllowed.labResult}
                                onClick={() => navigateModule('lab')}
                              >
                                View Result
                              </Button>
                            ) : null}
                            {order.type === 'Imaging' || order.type === 'ECG' ? (
                              <Button
                                size="small"
                                variant="text"
                                startIcon={<BiotechIcon />}
                                disabled={!navigateAllowed.radiology}
                                onClick={() => navigateModule('radiology')}
                              >
                                View Report
                              </Button>
                            ) : null}
                            <Button
                              size="small"
                              variant="text"
                              startIcon={<CheckCircleIcon />}
                              onClick={() =>
                                setOrderStatus(order.id, 'completed', `${order.description} marked completed.`)
                              }
                            >
                              Complete
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              variant="text"
                              startIcon={<WarningAmberIcon />}
                              onClick={() =>
                                setOrderStatus(order.id, 'discontinued', `${order.description} discontinued.`)
                              }
                            >
                              D/C
                            </Button>
                          </Stack>
                        </Box>
                      ))
                    )}
                  </Stack>
                </Stack>
              </Card>
            ) : null}

            {ordersTab === 'sets' ? (
              <Grid container spacing={2}>
                {ORDER_SET_TEMPLATES.map((orderSet) => (
                  <Grid key={orderSet.name} xs={12} md={6}>
                    <Card
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.primary.main, 0.16),
                        height: '100%',
                      }}
                    >
                      <Stack spacing={1.25}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {orderSet.name}
                          </Typography>
                          <Chip size="small" label={`${orderSet.items.length} Orders`} color="primary" />
                        </Stack>

                        <Stack spacing={0.6}>
                          {orderSet.items.map((item) => (
                            <Typography key={`${orderSet.name}-${item.description}`} variant="body2" color="text.secondary">
                              {item.description}
                            </Typography>
                          ))}
                        </Stack>

                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<TaskAltIcon />}
                          onClick={() => handleApplyOrderSet(orderSet)}
                        >
                          Apply Order Set
                        </Button>
                      </Stack>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : null}

            {ordersTab === 'quick' ? (
              <Stack spacing={2}>
                {QUICK_ORDER_GROUPS.map((group) => (
                  <Card
                    key={group.category}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.16),
                    }}
                  >
                    <Stack spacing={1.25}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {group.category} Quick Orders
                      </Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        {group.items.map((item) => (
                          <Chip
                            key={`${group.category}-${item}`}
                            label={item}
                            variant="outlined"
                            onClick={() => handleQuickOrder(group.category, item)}
                            sx={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            ) : null}

            {ordersTab === 'cosign' ? (
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.16),
                }}
              >
                <Stack spacing={1.1}>
                  {PENDING_COSIGN_ROWS.map((row) => (
                    <Box
                      key={row.id}
                      sx={{
                        p: 1.25,
                        borderRadius: 1.5,
                        // border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                          {row.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {row.detail}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.75}>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<TaskAltIcon />}
                          onClick={() => showSnack(`Cosigned: ${row.title}`)}
                        >
                          Cosign
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => showSnack(`Opened: ${row.title}`, 'info')}
                        >
                          View
                        </Button>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Card>
            ) : null}

            {ordersTab === 'history' ? (
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.16),
                }}
              >
                <Stack spacing={1}>
                  {historyOrders.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No completed/discontinued orders yet.
                    </Typography>
                  ) : (
                    historyOrders.map((order) => (
                      <Box
                        key={order.id}
                        sx={{
                          p: 1.2,
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1,
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              textDecoration: order.status === 'discontinued' ? 'line-through' : 'none',
                            }}
                            noWrap
                          >
                            {order.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {order.type} | {order.by} | {order.time}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <Chip
                            size="small"
                            label={order.status.toUpperCase()}
                            color={workflowOrderStatusColor(order.status)}
                          />
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<RestartAltIcon />}
                            onClick={() => showSnack(`Reorder queued: ${order.description}`, 'info')}
                          >
                            Reorder
                          </Button>
                        </Stack>
                      </Box>
                    ))
                  )}
                </Stack>
              </Card>
            ) : null}
          </Stack>
        ) : null}

        {defaultTab === 'lab' ? (
          <Stack spacing={2}>
            {labTab === 'results' ? (
              <Grid container spacing={2}>
                <Grid xs={12} md={5}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.16),
                      height: '100%',
                    }}
                  >
                    <Stack spacing={1.1}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Lab Orders ({patientLabResults.length})
                      </Typography>
                      <Divider />
                      {patientLabResults.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No lab results for selected MRN.
                        </Typography>
                      ) : (
                        patientLabResults.map((row) => (
                          <Box
                            key={row.id}
                            onClick={() => setSelectedLabResultId(row.id)}
                            sx={{
                              p: 1.1,
                              borderRadius: 1.25,
                              border: '1px solid',
                              borderColor:
                                selectedLabResult?.id === row.id
                                  ? alpha(theme.palette.primary.main, 0.4)
                                  : 'divider',
                              backgroundColor:
                                selectedLabResult?.id === row.id
                                  ? alpha(theme.palette.primary.main, 0.08)
                                  : 'transparent',
                              cursor: 'pointer',
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="center">
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                                  {row.testName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" noWrap>
                                  {row.reportedAt} | {row.verifiedBy}
                                </Typography>
                              </Box>
                              <Chip size="small" label={row.flag} color={resultFlagColor(row.flag)} />
                            </Stack>
                          </Box>
                        ))
                      )}
                    </Stack>
                  </Card>
                </Grid>

                <Grid xs={12} md={7}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.16),
                      height: '100%',
                    }}
                  >
                    {selectedLabResult ? (
                      <Stack spacing={1.25}>
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          justifyContent="space-between"
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                          spacing={1}
                        >
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                              {selectedLabResult.testName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Reported {selectedLabResult.reportedAt} | Verified by {selectedLabResult.verifiedBy}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={0.75}>
                            <Chip size="small" label={selectedLabResult.flag} color={resultFlagColor(selectedLabResult.flag)} />
                            <Chip size="small" label={selectedLabResult.state} variant="outlined" />
                          </Stack>
                        </Stack>

                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Parameter</TableCell>
                              <TableCell>Result</TableCell>
                              <TableCell>Unit</TableCell>
                              <TableCell>Reference</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>{selectedLabResult.testName}</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>{selectedLabResult.resultValue}</TableCell>
                              <TableCell>{selectedLabResult.unit}</TableCell>
                              <TableCell>{selectedLabResult.referenceRange}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<TaskAltIcon />}
                            onClick={() => showSnack('Result acknowledged.', 'success')}
                          >
                            Acknowledge
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EventIcon />}
                            onClick={() => showSnack('Trend chart opened.', 'info')}
                          >
                            View Trend
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ScienceIcon />}
                            onClick={() => setLabTab('samples')}
                          >
                            Open Samples
                          </Button>
                        </Stack>
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Select a result to see details.
                      </Typography>
                    )}
                  </Card>
                </Grid>
              </Grid>
            ) : null}

            {labTab === 'samples' ? (
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.16),
                }}
              >
                <Stack spacing={1.25}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    spacing={1}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Sample Collection Queue ({sampleRowsWithStatus.length})
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<PlaylistAddCheckIcon />}
                        onClick={() => {
                          const next: Record<string, SampleStatus> = {};
                          sampleRowsWithStatus.forEach((row) => {
                            if (row.displayStatus === 'Pending') {
                              next[row.id] = 'Collected';
                            }
                          });
                          setSampleStatusOverrides((prev) => ({ ...prev, ...next }));
                          showSnack('All pending samples marked collected.', 'success');
                        }}
                      >
                        Mark All Collected
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ScienceIcon />}
                        onClick={() => setLabTab('samples')}
                      >
                        Open Sample Workflow
                      </Button>
                    </Stack>
                  </Stack>

                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Test</TableCell>
                        <TableCell>Specimen</TableCell>
                        <TableCell>Container</TableCell>
                        <TableCell>Volume</TableCell>
                        <TableCell>Ordered</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sampleRowsWithStatus.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8}>
                            <Typography variant="body2" color="text.secondary">
                              No samples in queue.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        sampleRowsWithStatus.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>{row.id}</TableCell>
                            <TableCell>{row.testName}</TableCell>
                            <TableCell>{row.specimenType}</TableCell>
                            <TableCell>{row.container}</TableCell>
                            <TableCell>{row.volume}</TableCell>
                            <TableCell>{row.orderedTime}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={row.displayStatus}
                                color={sampleStatusColor(row.displayStatus)}
                                variant={row.displayStatus === 'Pending' ? 'filled' : 'outlined'}
                              />
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.75}>
                                <Button
                                  size="small"
                                  variant="text"
                                  startIcon={<LabelIcon />}
                                  onClick={() => showSnack(`Label printed for sample ${row.id}.`, 'info')}
                                >
                                  Label
                                </Button>
                                <Button
                                  size="small"
                                  variant="text"
                                  startIcon={<CheckCircleIcon />}
                                  onClick={() => {
                                    setSampleStatusOverrides((prev) => ({ ...prev, [row.id]: 'Collected' }));
                                    showSnack(`Sample ${row.id} marked collected.`, 'success');
                                  }}
                                  disabled={
                                    row.displayStatus === 'Collected' ||
                                    row.displayStatus === 'Received' ||
                                    row.displayStatus === 'In Transit'
                                  }
                                >
                                  Collect
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Stack>
              </Card>
            ) : null}

            {labTab === 'critical' ? (
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.error.main, 0.24),
                  backgroundColor: alpha(theme.palette.error.main, 0.04),
                }}
              >
                <Stack spacing={1.1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'error.main' }}>
                    Critical Lab Values
                  </Typography>

                  {criticalLabResults.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No critical values for selected patient.
                    </Typography>
                  ) : (
                    criticalLabResults.map((row) => (
                      <Box
                        key={row.id}
                        sx={{
                          p: 1.25,
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: alpha(theme.palette.error.main, 0.3),
                          backgroundColor: '#fff',
                        }}
                      >
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          justifyContent="space-between"
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                          spacing={1}
                        >
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {row.testName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {row.resultValue} {row.unit} | Ref {row.referenceRange}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={0.75}>
                            <Chip size="small" label="Critical" color="error" />
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              startIcon={<TaskAltIcon />}
                              onClick={() => showSnack(`Critical value acknowledged for ${row.testName}.`, 'warning')}
                            >
                              Acknowledge
                            </Button>
                          </Stack>
                        </Stack>
                      </Box>
                    ))
                  )}
                </Stack>
              </Card>
            ) : null}

            {labTab === 'pending' ? (
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.warning.main, 0.24),
                }}
              >
                <Stack spacing={1}>
                  {pendingLabRows.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No pending tests.
                    </Typography>
                  ) : (
                    pendingLabRows.map((row) => (
                      <Box
                        key={row.id}
                        sx={{
                          p: 1.2,
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1,
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {row.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.detail}
                          </Typography>
                        </Box>
                        <Chip size="small" label="Pending" color="warning" />
                      </Box>
                    ))
                  )}
                </Stack>
              </Card>
            ) : null}

            {labTab === 'micro' ? (
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.16),
                }}
              >
                <Stack spacing={1}>
                  {MICROBIOLOGY_ROWS.map((row) => (
                    <Box
                      key={row.id}
                      sx={{
                        p: 1.2,
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {row.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.detail}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={row.status}
                        color={row.status === 'Pending' ? 'warning' : 'success'}
                      />
                    </Box>
                  ))}
                </Stack>
              </Card>
            ) : null}
          </Stack>
        ) : null}

        {defaultTab === 'radiology' ? (
          <Stack spacing={2}>
            {radiologyTab === 'reports' ? (
              <Grid container spacing={2}>
                <Grid xs={12} md={5}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.16),
                      height: '100%',
                    }}
                  >
                    <Stack spacing={1.1}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Imaging Orders ({patientRadiologyOrders.length})
                      </Typography>
                      <Divider />
                      {patientRadiologyOrders.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No imaging orders for selected MRN.
                        </Typography>
                      ) : (
                        patientRadiologyOrders.map((row) => (
                          <Box
                            key={row.id}
                            onClick={() => setSelectedRadiologyOrderId(row.id)}
                            sx={{
                              p: 1.1,
                              borderRadius: 1.25,
                              border: '1px solid',
                              borderColor:
                                selectedRadiologyOrder?.id === row.id
                                  ? alpha(theme.palette.primary.main, 0.4)
                                  : 'divider',
                              backgroundColor:
                                selectedRadiologyOrder?.id === row.id
                                  ? alpha(theme.palette.primary.main, 0.08)
                                  : 'transparent',
                              cursor: 'pointer',
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="center">
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                                  {row.study}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" noWrap>
                                  {row.modality} | {row.scheduledSlot}
                                </Typography>
                              </Box>
                              <Stack direction="row" spacing={0.75}>
                                <Chip size="small" label={row.priority} color={workflowPriorityColor(row.priority)} />
                                <Chip size="small" label={row.validationState} variant="outlined" />
                              </Stack>
                            </Stack>
                          </Box>
                        ))
                      )}
                    </Stack>
                  </Card>
                </Grid>

                <Grid xs={12} md={7}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.16),
                      height: '100%',
                    }}
                  >
                    {selectedRadiologyOrder ? (
                      <Stack spacing={1.25}>
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          justifyContent="space-between"
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                          spacing={1}
                        >
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                              {selectedRadiologyOrder.study}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {selectedRadiologyOrder.modality} | Slot {selectedRadiologyOrder.scheduledSlot} | {selectedRadiologyOrder.validationState}
                            </Typography>
                          </Box>
                          <Chip size="small" label={selectedRadiologyOrder.priority} color={workflowPriorityColor(selectedRadiologyOrder.priority)} />
                        </Stack>

                        {selectedReadingCase ? (
                          <>
                            <Box
                              sx={{
                                p: 1.5,
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor: alpha(theme.palette.info.main, 0.28),
                                backgroundColor: alpha(theme.palette.info.main, 0.06),
                              }}
                            >
                              <Typography variant="caption" color="text.secondary">
                                Radiology Report
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {selectedReadingCase.study} reviewed in {selectedReadingCase.subspecialty}. Current report state: {selectedReadingCase.state}. Turnaround: {selectedReadingCase.turnaround}.
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                p: 1.5,
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor: alpha(theme.palette.primary.main, 0.28),
                                backgroundColor: alpha(theme.palette.primary.main, 0.06),
                              }}
                            >
                              <Typography variant="caption" color="text.secondary">
                                Impression
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
                                {selectedReadingCase.state === 'Final Signed'
                                  ? 'Final interpretation available and signed.'
                                  : selectedReadingCase.state === 'Need Addendum'
                                  ? 'Addendum requested prior to final release.'
                                  : 'Preliminary interpretation in progress.'}
                              </Typography>
                            </Box>
                          </>
                        ) : (
                          <Alert severity="info">Report not available yet for the selected study.</Alert>
                        )}

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<DescriptionIcon />}
                            onClick={() => setRadiologyTab('reports')}
                          >
                            Open Reports
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ChecklistIcon />}
                            onClick={() => setRadiologyTab('worklist')}
                          >
                            Open Worklist
                          </Button>
                          <Button size="small" variant="outlined" startIcon={<ViewInArIcon />} onClick={() => setRadiologyTab('pacs')}>
                            View PACS
                          </Button>
                        </Stack>
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Select a study to view report details.
                      </Typography>
                    )}
                  </Card>
                </Grid>
              </Grid>
            ) : null}

            {radiologyTab === 'worklist' ? (
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.16),
                }}
              >
                <Stack spacing={1.25}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    spacing={1}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Technician Worklist ({worklistRowsWithStatus.length})
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ChecklistIcon />}
                      onClick={() => setRadiologyTab('worklist')}
                    >
                      Open Full Worklist
                    </Button>
                  </Stack>

                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Study</TableCell>
                        <TableCell>Room</TableCell>
                        <TableCell>Prep</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>State</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {worklistRowsWithStatus.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <Typography variant="body2" color="text.secondary">
                              No worklist rows for selected patient.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        worklistRowsWithStatus.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>{row.study}</TableCell>
                            <TableCell>{row.room}</TableCell>
                            <TableCell>{row.prepStatus}</TableCell>
                            <TableCell>
                              <Chip size="small" label={row.priority} color={workflowPriorityColor(row.priority)} />
                            </TableCell>
                            <TableCell>
                              <Chip size="small" label={row.displayState} color={worklistStatusColor(row.displayState)} />
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.75}>
                                <Button
                                  size="small"
                                  variant="text"
                                  startIcon={<TaskAltIcon />}
                                  disabled={row.displayState === 'In Progress' || row.displayState === 'Sent to PACS'}
                                  onClick={() => {
                                    setWorklistStatusOverrides((prev) => ({ ...prev, [row.id]: 'In Progress' }));
                                    showSnack(`Started study: ${row.study}`, 'success');
                                  }}
                                >
                                  Start
                                </Button>
                                <Button
                                  size="small"
                                  variant="text"
                                  startIcon={<CheckCircleIcon />}
                                  disabled={row.displayState === 'Sent to PACS'}
                                  onClick={() => {
                                    setWorklistStatusOverrides((prev) => ({ ...prev, [row.id]: 'Sent to PACS' }));
                                    showSnack(`Completed and sent: ${row.study}`, 'success');
                                  }}
                                >
                                  Complete
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Stack>
              </Card>
            ) : null}

            {radiologyTab === 'scheduled' ? (
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.16),
                }}
              >
                <Stack spacing={1}>
                  {scheduledRadiologyRows.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No scheduled studies.
                    </Typography>
                  ) : (
                    scheduledRadiologyRows.map((row) => (
                      <Box
                        key={row.id}
                        sx={{
                          p: 1.2,
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1,
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                            {row.study}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {row.modality} | Slot {row.scheduledSlot}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={0.75}>
                          <Chip size="small" label={row.priority} color={workflowPriorityColor(row.priority)} />
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<EventIcon />}
                            onClick={() => showSnack(`Reschedule requested: ${row.study}`, 'info')}
                          >
                            Reschedule
                          </Button>
                        </Stack>
                      </Box>
                    ))
                  )}
                </Stack>
              </Card>
            ) : null}

            {radiologyTab === 'resulted' ? (
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.16),
                }}
              >
                <Stack spacing={1}>
                  {resultedRadiologyRows.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No resulted studies.
                    </Typography>
                  ) : (
                    resultedRadiologyRows.map((row) => (
                      <Box
                        key={row.id}
                        sx={{
                          p: 1.2,
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1,
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {row.study}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.modality} | {row.subspecialty} | TAT {row.turnaround}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={0.75}>
                          <Chip size="small" label="Reported" color="success" />
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<VisibilityIcon />}
                            onClick={() => {
                              setSelectedRadiologyOrderId(
                                patientRadiologyOrders.find((candidate) => candidate.study === row.study)?.id ?? ''
                              );
                              setRadiologyTab('reports');
                            }}
                          >
                            View Report
                          </Button>
                        </Stack>
                      </Box>
                    ))
                  )}
                </Stack>
              </Card>
            ) : null}

            {radiologyTab === 'pacs' ? (
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.16),
                }}
              >
                <Box
                  sx={{
                    minHeight: 320,
                    borderRadius: 2,
                    border: '1px dashed',
                    borderColor: alpha(theme.palette.common.white, 0.28),
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    textAlign: 'center',
                    px: 2,
                  }}
                >
                  <Stack spacing={1.25} alignItems="center">
                    <BiotechIcon sx={{ fontSize: 34, color: alpha('#fff', 0.9) }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      PACS Viewer Integration
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.78), maxWidth: 480 }}>
                      DICOM/PACS viewer placeholder matching the hybrid layout. Connect external PACS or viewer plugin for live image rendering.
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<ViewInArIcon />}
                        onClick={() => showSnack('Launching DICOM viewer...', 'info')}
                      >
                        Open DICOM Viewer
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<BiotechIcon />}
                        onClick={() => showSnack('Opening external PACS...', 'info')}
                      >
                        Launch External PACS
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </Card>
            ) : null}
          </Stack>
        ) : null}
      </Stack>

      <CommonDialog
        open={orderDialogOpen}
        onClose={() => setOrderDialogOpen(false)}
        title="Write New Order"
        subtitle="Place a new order without leaving this page."
        icon={<ScienceIcon sx={{ fontSize: 18 }} />}
        maxWidth="sm"
        fullWidth
        content={
          <Stack spacing={1.1}>
            <Grid container spacing={1.1} sx={{ mt: 0.15 }}>
              <Grid xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Order Type
                </Typography>
                <TextField
                  select
                  size="small"
                  value={orderDraft.type}
                  onChange={(event) =>
                    setOrderDraft((prev) => ({
                      ...prev,
                      type: event.target.value as WorkflowOrderType,
                    }))
                  }
                  fullWidth
                >
                  {ORDER_TYPE_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Priority
                </Typography>
                <TextField
                  select
                  size="small"
                  value={orderDraft.priority}
                  onChange={(event) =>
                    setOrderDraft((prev) => ({
                      ...prev,
                      priority: event.target.value as WorkflowOrderPriority,
                    }))
                  }
                  fullWidth
                >
                  {(['Routine', 'Urgent', 'STAT'] as WorkflowOrderPriority[]).map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                Order Description
              </Typography>
              <TextField
                size="small"
                placeholder="e.g. Repeat CBC + CMP, 12-lead ECG..."
                value={orderDraft.description}
                onChange={(event) =>
                  setOrderDraft((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                fullWidth
              />
            </Box>
            <Grid container spacing={1.1}>
              <Grid xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Frequency
                </Typography>
                <TextField
                  size="small"
                  placeholder="e.g. Once, Q8H, Daily"
                  value={orderDraft.frequency}
                  onChange={(event) =>
                    setOrderDraft((prev) => ({
                      ...prev,
                      frequency: event.target.value,
                    }))
                  }
                  fullWidth
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Duration
                </Typography>
                <TextField
                  size="small"
                  placeholder="e.g. 3 days, Ongoing, PRN"
                  value={orderDraft.duration}
                  onChange={(event) =>
                    setOrderDraft((prev) => ({
                      ...prev,
                      duration: event.target.value,
                    }))
                  }
                  fullWidth
                />
              </Grid>
            </Grid>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                Clinical Notes
              </Typography>
              <TextField
                size="small"
                multiline
                minRows={2}
                placeholder="Clinical justification..."
                value={orderDraft.notes}
                onChange={(event) =>
                  setOrderDraft((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }))
                }
                fullWidth
              />
            </Box>
            {orderDialogError ? (
              <Typography variant="caption" color="error.main">
                {orderDialogError}
              </Typography>
            ) : null}
          </Stack>
        }
        actions={
          <Stack direction="row" spacing={1} sx={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button size="small" variant="outlined" onClick={() => setOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="small" variant="contained" startIcon={<ScienceIcon />} onClick={submitOrderFromDialog}>
              Submit Order
            </Button>
          </Stack>
        }
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2800}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        message={snackbar.message}
      />
    </PageTemplate>
  );
}
