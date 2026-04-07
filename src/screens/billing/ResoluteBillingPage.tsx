'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import { Card, CommonTabs, StatTile } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import { usePermission } from '@/src/core/auth/usePermission';
import { INPATIENT_STAYS } from '@/src/screens/ipd/ipd-mock-data';
import { getRoleLabel, getRolesForPermissions } from '@/src/core/navigation/permissions';
import { UserRole } from '@/src/core/navigation/types';
import {
  AccountBalanceWallet as AccountBalanceWalletIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Biotech as BiotechIcon,
  Description as DescriptionIcon,
  EventNote as EventNoteIcon,
  GppGood as GppGoodIcon,
  Inventory2 as Inventory2Icon,
  LocalHospital as LocalHospitalIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Payments as PaymentsIcon,
  ReceiptLong as ReceiptLongIcon,
  Refresh as RefreshIcon,
  Science as ScienceIcon,
  Shield as ShieldIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';

type ResoluteTab = 'workqueue' | 'claims' | 'payments' | 'integrations' | 'roles';
type QueueOwner = 'Coding' | 'Claims' | 'Cashier' | 'Insurance' | 'Refund Desk';
type QueuePriority = 'High' | 'Medium' | 'Low';
type QueueStatus = 'Pending' | 'In Progress' | 'Blocked' | 'Completed';
type ClaimsFilter = 'All' | 'Draft' | 'Submitted' | 'Adjudicated' | 'Denied' | 'Paid';
type PatientDeskTab = 'charges' | 'invoices' | 'payments' | 'insurance' | 'refunds';

type LedgerStatus = 'Pending' | 'Ready for Billing' | 'Cancelled';
type InvoiceStatus = 'Pending' | 'Paid';
type PaymentStatus = 'Completed' | 'Pending';
type RefundStatus = 'Under Review' | 'Processed';
type PreAuthStatus = 'Approved' | 'Pending';

interface BillingLedgerEntry {
  id: string;
  patientId: string;
  category: string;
  serviceCode: string;
  serviceName: string;
  amount: number;
  status: LedgerStatus;
}

interface BillingInvoiceRow {
  id: string;
  patientId: string;
  date: string;
  type: 'Final Bill' | 'Interim Bill';
  amount: number;
  insuranceAmount: number;
  patientDue: number;
  status: InvoiceStatus;
}

interface BillingPaymentRow {
  id: string;
  patientId: string;
  dateTime: string;
  mode: 'Cash' | 'UPI' | 'Card' | 'NEFT' | 'Insurance';
  amount: number;
  invoiceId: string;
  receivedBy: string;
  status: PaymentStatus;
}

interface BillingInsuranceProfile {
  provider: string;
  approvedAmount: number;
  claimedAmount: number;
  active: boolean;
}

interface BillingPreAuthRow {
  id: string;
  patientId: string;
  service: string;
  requestedOn: string;
  approvedAmount: number;
  status: PreAuthStatus;
}

interface BillingRefundRow {
  id: string;
  patientId: string;
  title: string;
  requestedOn: string;
  amount: number;
  status: RefundStatus;
}

interface PersistedOrderBillingState {
  version: 1;
  billingByPatient: Record<string, BillingLedgerEntry[]>;
}

interface PersistedBillingModuleState {
  version: 1;
  invoicesByPatient: Record<string, BillingInvoiceRow[]>;
  paymentsByPatient: Record<string, BillingPaymentRow[]>;
  insuranceByPatient: Record<string, BillingInsuranceProfile>;
  preAuthByPatient: Record<string, BillingPreAuthRow[]>;
  refundsByPatient: Record<string, BillingRefundRow[]>;
}

interface QueueRow {
  id: string;
  title: string;
  patientId: string;
  patientLabel: string;
  owner: QueueOwner;
  priority: QueuePriority;
  status: QueueStatus;
  source: string;
  sla: string;
  amount: number;
  actionRoute: string;
  actionLabel: string;
}

interface ClaimRow {
  id: string;
  claimNo: string;
  patientLabel: string;
  payer: string;
  billedAmount: number;
  approvedAmount: number;
  deniedAmount: number;
  status: Exclude<ClaimsFilter, 'All'>;
  denialReason: string;
  lastUpdated: string;
}

interface IntegrationRow {
  id: string;
  module: string;
  owner: string;
  inbound: string;
  outbound: string;
  route: string;
  status: 'Live' | 'Review' | 'Planned';
}

interface RoleWorkflowRow {
  id: string;
  role: UserRole;
  scope: string;
  responsibilities: string;
  permissions: string[];
  primaryScreen: string;
}

const ORDER_BILLING_STORAGE_KEY = 'scanbo.hims.ipd.orders-billing.v1';
const BILLING_MODULE_STORAGE_KEY = 'scanbo.hims.ipd.billing-medication.module.v1';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(Math.max(0, value));
}

function parseRecordMap<T>(input: unknown): Record<string, T[]> {
  if (!input || typeof input !== 'object') return {};
  return input as Record<string, T[]>;
}

function parseRecordObject<T>(input: unknown): Record<string, T> {
  if (!input || typeof input !== 'object') return {};
  return input as Record<string, T>;
}

function readPersistedOrderState(): Record<string, BillingLedgerEntry[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(ORDER_BILLING_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<PersistedOrderBillingState>;
    return parseRecordMap<BillingLedgerEntry>(parsed.billingByPatient);
  } catch {
    return {};
  }
}

function readPersistedBillingState(): PersistedBillingModuleState {
  const base: PersistedBillingModuleState = {
    version: 1,
    invoicesByPatient: {},
    paymentsByPatient: {},
    insuranceByPatient: {},
    preAuthByPatient: {},
    refundsByPatient: {},
  };

  if (typeof window === 'undefined') return base;
  try {
    const raw = window.sessionStorage.getItem(BILLING_MODULE_STORAGE_KEY);
    if (!raw) return base;

    const parsed = JSON.parse(raw) as Partial<PersistedBillingModuleState>;
    return {
      version: 1,
      invoicesByPatient: parseRecordMap<BillingInvoiceRow>(parsed.invoicesByPatient),
      paymentsByPatient: parseRecordMap<BillingPaymentRow>(parsed.paymentsByPatient),
      insuranceByPatient: parseRecordObject<BillingInsuranceProfile>(parsed.insuranceByPatient),
      preAuthByPatient: parseRecordMap<BillingPreAuthRow>(parsed.preAuthByPatient),
      refundsByPatient: parseRecordMap<BillingRefundRow>(parsed.refundsByPatient),
    };
  } catch {
    return base;
  }
}

function queuePriorityColor(priority: QueuePriority): 'error' | 'warning' | 'success' {
  if (priority === 'High') return 'error';
  if (priority === 'Medium') return 'warning';
  return 'success';
}

function queueStatusColor(status: QueueStatus): 'default' | 'warning' | 'info' | 'success' | 'error' {
  if (status === 'Pending') return 'warning';
  if (status === 'In Progress') return 'info';
  if (status === 'Blocked') return 'error';
  return 'success';
}

function claimStatusColor(
  status: Exclude<ClaimsFilter, 'All'>
): 'default' | 'warning' | 'info' | 'success' | 'error' {
  if (status === 'Draft') return 'default';
  if (status === 'Submitted') return 'warning';
  if (status === 'Adjudicated') return 'info';
  if (status === 'Denied') return 'error';
  return 'success';
}

function integrationStatusColor(status: IntegrationRow['status']): 'success' | 'warning' | 'default' {
  if (status === 'Live') return 'success';
  if (status === 'Review') return 'warning';
  return 'default';
}

const ROLE_WORKFLOW_ROWS: RoleWorkflowRow[] = [
  {
    id: 'role-billing-exec',
    role: 'BILLING',
    scope: 'Day-end operational billing',
    responsibilities: 'Charge audit, invoice finalization, claim generation, patient due follow-up',
    permissions: ['billing.read', 'billing.invoices.read'],
    primaryScreen: '/billing/invoices',
  },
  {
    id: 'role-cashier',
    role: 'BILLING',
    scope: 'Collection desk',
    responsibilities: 'Receive payment, post receipts, reconcile pending dues, handover closure',
    permissions: ['billing.read', 'billing.payments.write'],
    primaryScreen: '/billing/payments',
  },
  {
    id: 'role-insurance-desk',
    role: 'BILLING',
    scope: 'Insurance and TPA',
    responsibilities: 'Pre-auth requests, claim submission, adjudication follow-up, denial management',
    permissions: ['billing.read', 'billing.insurance.read'],
    primaryScreen: '/billing/insurance',
  },
  {
    id: 'role-billing-supervisor',
    role: 'HOSPITAL_ADMIN',
    scope: 'Governance and approvals',
    responsibilities: 'Exception approvals, refund authorization, KPI tracking, escalation handling',
    permissions: ['billing.*', 'reports.billing.*'],
    primaryScreen: '/clinical/modules/resolute-billing',
  },
  {
    id: 'role-auditor',
    role: 'AUDITOR',
    scope: 'Audit and compliance',
    responsibilities: 'Ledger verification, write-off audit, claim trail review, policy compliance',
    permissions: ['billing.read', 'reports.*', 'admin.audit.read'],
    primaryScreen: '/reports/billing',
  },
];

const INTEGRATION_ROWS: IntegrationRow[] = [
  {
    id: 'int-prelude',
    module: 'Registration & ADT',
    owner: 'Front Desk / Admission',
    inbound: 'MRN, payer class, policy reference, admission class',
    outbound: 'Coverage validation task and financial class flags',
    route: '/clinical/modules/prelude-grand-central',
    status: 'Live',
  },
  {
    id: 'int-ipd-charges',
    module: 'IPD Charge / Drug',
    owner: 'Clinical Billing',
    inbound: 'Order-linked charge lines, medication usage, room/consumable usage',
    outbound: 'Invoice-ready ledger and discharge billing clearance state',
    route: '/ipd/charges',
    status: 'Live',
  },
  {
    id: 'int-pharmacy',
    module: 'Willow Pharmacy',
    owner: 'Pharmacy + Billing',
    inbound: 'Dispense status and billable pharmacy items',
    outbound: 'Patient due status and medication billing closure',
    route: '/clinical/modules/willow',
    status: 'Live',
  },
  {
    id: 'int-lab-radiology',
    module: 'Diagnostics (Lab / Radiology)',
    owner: 'Diagnostics + Billing',
    inbound: 'Performed test orders and report completion states',
    outbound: 'Diagnostic charge posting and payer split',
    route: '/ipd/orders-tests/orders',
    status: 'Review',
  },
  {
    id: 'int-insurance',
    module: 'Insurance / TPA',
    owner: 'Insurance Desk',
    inbound: 'Pre-auth responses, approved amounts, denial reasons',
    outbound: 'Claim packets, supporting documents, appeal references',
    route: '/billing/insurance',
    status: 'Live',
  },
  {
    id: 'int-refunds',
    module: 'Refunds & Adjustments',
    owner: 'Billing Supervisor',
    inbound: 'Over-collection, cancellation, payer reversal triggers',
    outbound: 'Refund approval trail and settlement posting',
    route: '/billing/refunds',
    status: 'Live',
  },
];

export default function ResoluteBillingPage() {
  const theme = useTheme();
  const router = useRouter();
  const permissionGate = usePermission();

  const canRead = permissionGate('billing.read') || permissionGate('billing.*');
  const canWrite = permissionGate('billing.payments.write') || permissionGate('billing.*');

  const [activeTab, setActiveTab] = React.useState<ResoluteTab>('workqueue');
  const [search, setSearch] = React.useState('');
  const [queueOwnerFilter, setQueueOwnerFilter] = React.useState<'All' | QueueOwner>('All');
  const [claimsFilter, setClaimsFilter] = React.useState<ClaimsFilter>('All');
  const [quickPatientId, setQuickPatientId] = React.useState<string>('');

  const [ledgerByPatient, setLedgerByPatient] = React.useState<Record<string, BillingLedgerEntry[]>>(
    () => readPersistedOrderState()
  );
  const [moduleState, setModuleState] = React.useState<PersistedBillingModuleState>(() =>
    readPersistedBillingState()
  );

  const refreshData = React.useCallback(() => {
    setLedgerByPatient(readPersistedOrderState());
    setModuleState(readPersistedBillingState());
  }, []);

  React.useEffect(() => {
    refreshData();
    const onFocus = () => refreshData();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refreshData();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    const intervalId = window.setInterval(refreshData, 7000);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      window.clearInterval(intervalId);
    };
  }, [refreshData]);

  const inpatientById = React.useMemo(() => {
    const map = new Map<string, (typeof INPATIENT_STAYS)[number]>();
    INPATIENT_STAYS.forEach((row) => {
      map.set(row.id, row);
    });
    return map;
  }, []);

  React.useEffect(() => {
    setQuickPatientId((current) => {
      if (current && inpatientById.has(current)) return current;
      return INPATIENT_STAYS[0]?.id ?? '';
    });
  }, [inpatientById]);

  const ledgerRows = React.useMemo(() => {
    return Object.entries(ledgerByPatient).flatMap(([patientId, rows]) =>
      rows.map((row) => ({ ...row, patientId }))
    );
  }, [ledgerByPatient]);

  const invoiceRows = React.useMemo<BillingInvoiceRow[]>(() => {
    return Object.entries(moduleState.invoicesByPatient).flatMap(([patientId, rows]) =>
      rows.map((row) => ({ ...row, patientId }))
    );
  }, [moduleState.invoicesByPatient]);

  const paymentRows = React.useMemo<BillingPaymentRow[]>(() => {
    return Object.entries(moduleState.paymentsByPatient).flatMap(([patientId, rows]) =>
      rows.map((row) => ({ ...row, patientId }))
    );
  }, [moduleState.paymentsByPatient]);

  const preAuthRows = React.useMemo<BillingPreAuthRow[]>(() => {
    return Object.entries(moduleState.preAuthByPatient).flatMap(([patientId, rows]) =>
      rows.map((row) => ({ ...row, patientId }))
    );
  }, [moduleState.preAuthByPatient]);

  const refundRows = React.useMemo<BillingRefundRow[]>(() => {
    return Object.entries(moduleState.refundsByPatient).flatMap(([patientId, rows]) =>
      rows.map((row) => ({ ...row, patientId }))
    );
  }, [moduleState.refundsByPatient]);

  const getPatientLabel = React.useCallback(
    (patientId: string) => {
      const patient = inpatientById.get(patientId);
      if (!patient) return patientId;
      return `${patient.patientName} (${patient.mrn})`;
    },
    [inpatientById]
  );

  const buildPatientDeskRoute = React.useCallback(
    (patientId: string, tab: PatientDeskTab) => {
      const base = `/ipd/charges?tab=${tab}`;
      const patient = inpatientById.get(patientId);
      if (!patient?.mrn) return base;
      return `${base}&mrn=${encodeURIComponent(patient.mrn)}`;
    },
    [inpatientById]
  );

  const grossCharges = ledgerRows
    .filter((row) => row.status !== 'Cancelled')
    .reduce((sum, row) => sum + Math.max(0, row.amount), 0);

  const readyToBill = ledgerRows
    .filter((row) => row.status === 'Ready for Billing')
    .reduce((sum, row) => sum + Math.max(0, row.amount), 0);

  const pendingChargePosting = ledgerRows
    .filter((row) => row.status === 'Pending')
    .reduce((sum, row) => sum + Math.max(0, row.amount), 0);

  const collectionsCompleted = paymentRows
    .filter((row) => row.status === 'Completed')
    .reduce((sum, row) => sum + Math.max(0, row.amount), 0);

  const outstandingAr = invoiceRows
    .filter((row) => row.status === 'Pending')
    .reduce((sum, row) => sum + Math.max(0, row.patientDue), 0);

  const insuranceClaimed = Object.values(moduleState.insuranceByPatient).reduce(
    (sum, row) => sum + Math.max(0, row.claimedAmount || 0),
    0
  );

  const insuranceApproved = Object.values(moduleState.insuranceByPatient).reduce(
    (sum, row) => sum + Math.max(0, row.approvedAmount || 0),
    0
  );

  const claimApprovalRate = insuranceClaimed > 0 ? Math.round((insuranceApproved / insuranceClaimed) * 100) : 0;
  const pendingRefundCount = refundRows.filter((row) => row.status === 'Under Review').length;

  const metricTiles = [
    {
      label: 'Gross Charges',
      value: formatCurrency(grossCharges),
      subtitle: 'Total active charge book',
      icon: <ReceiptLongIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: 'Ready for Billing',
      value: formatCurrency(readyToBill),
      subtitle: 'Queued for invoice generation',
      icon: <AssignmentTurnedInIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: 'Outstanding A/R',
      value: formatCurrency(outstandingAr),
      subtitle: 'Pending collection + payer settlement',
      icon: <WarningAmberIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: 'Collections Posted',
      value: formatCurrency(collectionsCompleted),
      subtitle: 'Completed payment receipts',
      icon: <PaymentsIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: 'Claim Approval Rate',
      value: `${claimApprovalRate}%`,
      subtitle: `${formatCurrency(insuranceApproved)} approved`,
      icon: <ShieldIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: 'Refunds Under Review',
      value: pendingRefundCount,
      subtitle: 'Supervisor queue',
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 18 }} />,
    },
  ];

  const queueRows = React.useMemo<QueueRow[]>(() => {
    const rows: QueueRow[] = [];

    ledgerRows.forEach((entry) => {
      if (entry.status !== 'Pending') return;
      rows.push({
        id: `queue-ledger-${entry.id}`,
        title: `${entry.serviceName} charge needs coding verification`,
        patientId: entry.patientId,
        patientLabel: getPatientLabel(entry.patientId),
        owner: 'Coding',
        priority: entry.amount >= 20000 ? 'High' : 'Medium',
        status: 'Pending',
        source: 'Charge Ledger',
        sla: '4h',
        amount: entry.amount,
        actionRoute: buildPatientDeskRoute(entry.patientId, 'charges'),
        actionLabel: 'Open Patient Charges',
      });
    });

    preAuthRows.forEach((entry) => {
      if (entry.status !== 'Pending') return;
      rows.push({
        id: `queue-preauth-${entry.id}`,
        title: `${entry.service} pre-auth pending payer response`,
        patientId: entry.patientId,
        patientLabel: getPatientLabel(entry.patientId),
        owner: 'Insurance',
        priority: entry.approvedAmount >= 50000 ? 'High' : 'Medium',
        status: 'In Progress',
        source: 'Insurance Desk',
        sla: '24h',
        amount: entry.approvedAmount,
        actionRoute: buildPatientDeskRoute(entry.patientId, 'insurance'),
        actionLabel: 'Open Patient Insurance',
      });
    });

    invoiceRows.forEach((entry) => {
      if (entry.status !== 'Pending') return;
      rows.push({
        id: `queue-invoice-${entry.id}`,
        title: `${entry.type} pending patient collection`,
        patientId: entry.patientId,
        patientLabel: getPatientLabel(entry.patientId),
        owner: 'Cashier',
        priority: entry.patientDue >= 15000 ? 'High' : 'Low',
        status: 'Pending',
        source: 'Invoice Ledger',
        sla: '8h',
        amount: entry.patientDue,
        actionRoute: buildPatientDeskRoute(entry.patientId, 'payments'),
        actionLabel: 'Open Patient Payments',
      });
    });

    refundRows.forEach((entry) => {
      if (entry.status !== 'Under Review') return;
      rows.push({
        id: `queue-refund-${entry.id}`,
        title: `${entry.title} awaiting supervisor approval`,
        patientId: entry.patientId,
        patientLabel: getPatientLabel(entry.patientId),
        owner: 'Refund Desk',
        priority: entry.amount >= 10000 ? 'High' : 'Medium',
        status: 'Blocked',
        source: 'Refunds',
        sla: '24h',
        amount: entry.amount,
        actionRoute: buildPatientDeskRoute(entry.patientId, 'refunds'),
        actionLabel: 'Open Patient Refunds',
      });
    });

    return rows.sort((a, b) => {
      const priorityRank = { High: 0, Medium: 1, Low: 2 };
      if (priorityRank[a.priority] !== priorityRank[b.priority]) {
        return priorityRank[a.priority] - priorityRank[b.priority];
      }
      return b.amount - a.amount;
    });
  }, [buildPatientDeskRoute, invoiceRows, ledgerRows, preAuthRows, refundRows, getPatientLabel]);

  const filteredQueueRows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return queueRows.filter((row) => {
      if (queueOwnerFilter !== 'All' && row.owner !== queueOwnerFilter) return false;
      if (!q) return true;
      return (
        row.title.toLowerCase().includes(q) ||
        row.patientLabel.toLowerCase().includes(q) ||
        row.source.toLowerCase().includes(q) ||
        row.owner.toLowerCase().includes(q)
      );
    });
  }, [queueOwnerFilter, queueRows, search]);

  const claimRows = React.useMemo<ClaimRow[]>(() => {
    const rows: ClaimRow[] = [];
    invoiceRows.forEach((invoice) => {
      const insuranceProfile = moduleState.insuranceByPatient[invoice.patientId];
      const payer = insuranceProfile?.active ? insuranceProfile.provider : 'Self Pay';

      const approvedAmount = Math.min(
        Math.max(0, invoice.insuranceAmount),
        Math.max(0, insuranceProfile?.approvedAmount ?? 0)
      );
      const deniedAmount = Math.max(0, invoice.insuranceAmount - approvedAmount);

      let status: ClaimRow['status'] = 'Submitted';
      let denialReason = '--';
      if (invoice.status === 'Paid') {
        status = 'Paid';
      } else if (deniedAmount > 0) {
        status = 'Denied';
        denialReason = 'Payer reduction / non-covered service';
      } else if (approvedAmount > 0) {
        status = 'Adjudicated';
      }

      rows.push({
        id: `claim-${invoice.id}`,
        claimNo: `CLM-${invoice.id.slice(-6)}`,
        patientLabel: getPatientLabel(invoice.patientId),
        payer,
        billedAmount: invoice.amount,
        approvedAmount,
        deniedAmount,
        status,
        denialReason,
        lastUpdated: invoice.date,
      });
    });

    preAuthRows.forEach((row) => {
      if (row.status !== 'Pending') return;
      rows.push({
        id: `claim-draft-${row.id}`,
        claimNo: `CLM-DRAFT-${row.id.slice(-4)}`,
        patientLabel: getPatientLabel(row.patientId),
        payer: moduleState.insuranceByPatient[row.patientId]?.provider ?? 'Insurance',
        billedAmount: row.approvedAmount,
        approvedAmount: 0,
        deniedAmount: 0,
        status: 'Draft',
        denialReason: '--',
        lastUpdated: row.requestedOn,
      });
    });

    return rows.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
  }, [invoiceRows, moduleState.insuranceByPatient, preAuthRows, getPatientLabel]);

  const filteredClaimRows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return claimRows.filter((row) => {
      if (claimsFilter !== 'All' && row.status !== claimsFilter) return false;
      if (!q) return true;
      return (
        row.claimNo.toLowerCase().includes(q) ||
        row.patientLabel.toLowerCase().includes(q) ||
        row.payer.toLowerCase().includes(q)
      );
    });
  }, [claimRows, claimsFilter, search]);

  const recentPayments = React.useMemo(() => {
    return [...paymentRows].sort((a, b) => b.dateTime.localeCompare(a.dateTime)).slice(0, 12);
  }, [paymentRows]);

  const pendingInvoices = React.useMemo(() => {
    return [...invoiceRows]
      .filter((row) => row.status === 'Pending')
      .sort((a, b) => b.patientDue - a.patientDue);
  }, [invoiceRows]);

  const billingReadRoles = React.useMemo(
    () => getRolesForPermissions(['billing.read']).map((role) => getRoleLabel(role)),
    []
  );

  const quickPatient = React.useMemo(
    () => (quickPatientId ? inpatientById.get(quickPatientId) ?? null : null),
    [inpatientById, quickPatientId]
  );

  return (
    <PageTemplate
      title="Resolute Billing"
      subtitle="Billing control tower for queue monitoring, claims, collections, and refund governance."
      currentPageTitle="Resolute Billing"
      fullHeight
    >
      <Stack spacing={1.25} sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {!canRead ? (
          <Alert severity="error">You do not have access to Resolute Billing. Request `billing.read`.</Alert>
        ) : null}

        {canRead ? (
          <>
            {!canWrite ? (
              <Alert severity="info">
                You are in read-only mode for payments and financial write actions.
              </Alert>
            ) : null}

            <Card
              elevation={0}
              sx={{
                borderRadius: 2.2,
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.16),
                p: 1.2,
              }}
            >
              <Stack
                direction={{ xs: 'column', lg: 'row' }}
                spacing={1}
                justifyContent="space-between"
                alignItems={{ lg: 'center' }}
                sx={{ mb: 1 }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Resolute Billing = Hospital-level Control Tower (not patient-wise entry)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Select patient from dropdown and open Patient Billing Desk for edits. This page is only for
                    all-patient queue, claims, collections, and refund monitoring.
                  </Typography>
                </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.7} alignItems={{ sm: 'center' }}>
                  <TextField
                    select
                    size="small"
                    label="Patient"
                    value={quickPatientId}
                    onChange={(event) => setQuickPatientId(event.target.value)}
                    sx={{ minWidth: { xs: '100%', sm: 260 } }}
                  >
                    {INPATIENT_STAYS.map((patient) => (
                      <MenuItem key={patient.id} value={patient.id}>
                        {`${patient.patientName} (${patient.mrn})`}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={!quickPatient}
                    onClick={() => {
                      if (!quickPatientId) return;
                      router.push(buildPatientDeskRoute(quickPatientId, 'insurance'));
                    }}
                  >
                    Open Selected Patient Insurance
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={!quickPatient}
                    onClick={() => {
                      if (!quickPatientId) return;
                      router.push(buildPatientDeskRoute(quickPatientId, 'charges'));
                    }}
                  >
                    Open Selected Patient Billing
                  </Button>
                </Stack>
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    lg: 'repeat(3, minmax(0, 1fr))',
                    xl: 'repeat(6, minmax(0, 1fr))',
                  },
                  gap: 2,
                }}
              >
                {metricTiles.map((tile) => (
                  <StatTile
                    key={tile.label}
                    label={tile.label}
                    value={tile.value}
                    subtitle={tile.subtitle}
                    icon={tile.icon}
                    variant="soft"
                  />
                ))}
              </Box>
            </Card>

            <Card
              elevation={0}
              sx={{
                borderRadius: 2.2,
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.14),
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  px: 1,
                  py: 0.65,
                  borderBottom: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.12),
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                }}
              >
                <CommonTabs
                  tabs={[
                    { id: 'workqueue', label: 'Operational Queue', icon: <EventNoteIcon /> },
                    { id: 'claims', label: 'Claims & Denials', icon: <DescriptionIcon /> },
                    { id: 'payments', label: 'Collections', icon: <PaymentsIcon /> },
                  ]}
                  value={activeTab}
                  onChange={setActiveTab}
                  tabSx={{ minHeight: 35, px: 1.3, borderRadius: 1.2, fontSize: 12.5 }}
                />
              </Box>

              {activeTab === 'workqueue' ? (
                <Box sx={{ p: 1.2, flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.4fr) minmax(0, 1fr)' }, gap: 1.2 }}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 1.8,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.12),
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: 0,
                    }}
                  >
                    <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1) }}>
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
                        <TextField
                          size="small"
                          placeholder="Search queue by patient / item / owner"
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          sx={{ width: { xs: '100%', md: 320 } }}
                        />
                        <TextField
                          select
                          size="small"
                          label="Owner"
                          value={queueOwnerFilter}
                          onChange={(event) => setQueueOwnerFilter(event.target.value as 'All' | QueueOwner)}
                          sx={{ width: { xs: '100%', md: 170 } }}
                        >
                          {(['All', 'Coding', 'Claims', 'Cashier', 'Insurance', 'Refund Desk'] as const).map((value) => (
                            <MenuItem key={value} value={value}>
                              {value}
                            </MenuItem>
                          ))}
                        </TextField>
                        <Box sx={{ flex: 1 }} />
                        <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={refreshData}>
                          Refresh
                        </Button>
                      </Stack>
                    </Box>
                    <TableContainer sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>Work Item</TableCell>
                            <TableCell>Owner</TableCell>
                            <TableCell>Priority</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>SLA</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredQueueRows.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7}>
                                <Alert severity="info">No work items for current filter.</Alert>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredQueueRows.map((row) => (
                              <TableRow key={row.id}>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    {row.title}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {row.patientLabel} - {row.source}
                                  </Typography>
                                </TableCell>
                                <TableCell>{row.owner}</TableCell>
                                <TableCell>
                                  <Chip size="small" label={row.priority} color={queuePriorityColor(row.priority)} />
                                </TableCell>
                                <TableCell>
                                  <Chip size="small" label={row.status} color={queueStatusColor(row.status)} />
                                </TableCell>
                                <TableCell>{row.sla}</TableCell>
                                <TableCell>{formatCurrency(row.amount)}</TableCell>
                                <TableCell>
                                  <Button size="small" variant="outlined" onClick={() => router.push(row.actionRoute)}>
                                    {row.actionLabel}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Card>

                  <Stack spacing={1}>
                    <Card elevation={0} sx={{ borderRadius: 1.8, border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.12), p: 1.1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.8 }}>
                        Queue Snapshot
                      </Typography>
                      <Stack spacing={0.7}>
                        {(['Coding', 'Insurance', 'Cashier', 'Refund Desk'] as const).map((owner) => {
                          const ownerRows = queueRows.filter((row) => row.owner === owner);
                          const ownerAmount = ownerRows.reduce((sum, row) => sum + row.amount, 0);
                          return (
                            <Stack key={owner} direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2">{owner}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {ownerRows.length} items - {formatCurrency(ownerAmount)}
                              </Typography>
                            </Stack>
                          );
                        })}
                      </Stack>
                    </Card>

                    <Card elevation={0} sx={{ borderRadius: 1.8, border: '1px solid', borderColor: alpha(theme.palette.warning.main, 0.24), p: 1.1 }}>
                      <Stack direction="row" spacing={0.7} alignItems="center">
                        <WarningAmberIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          Escalation Watch
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ mt: 0.7 }}>
                        {queueRows.filter((row) => row.priority === 'High').length} high-priority items require action before cut-off.
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Focus sequence: pending coding, insurance pre-auth, cashier collections, then refund approvals.
                      </Typography>
                    </Card>

                  </Stack>
                </Box>
              ) : null}

              {activeTab === 'claims' ? (
                <Box sx={{ p: 1.2, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Card elevation={0} sx={{ borderRadius: 1.8, border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.12), p: 1 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
                      <TextField
                        size="small"
                        placeholder="Search claim no / patient / payer"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        sx={{ width: { xs: '100%', md: 340 } }}
                      />
                      <TextField
                        select
                        size="small"
                        label="Claim Status"
                        value={claimsFilter}
                        onChange={(event) => setClaimsFilter(event.target.value as ClaimsFilter)}
                        sx={{ width: { xs: '100%', md: 190 } }}
                      >
                        {(['All', 'Draft', 'Submitted', 'Adjudicated', 'Denied', 'Paid'] as const).map((value) => (
                          <MenuItem key={value} value={value}>
                            {value}
                          </MenuItem>
                        ))}
                      </TextField>
                      <Box sx={{ flex: 1 }} />
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() =>
                          router.push(
                            quickPatientId ? buildPatientDeskRoute(quickPatientId, 'insurance') : '/ipd/charges?tab=insurance'
                          )
                        }
                      >
                        Open Claim Desk
                      </Button>
                    </Stack>
                  </Card>

                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 1.8,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.12),
                      flex: 1,
                      minHeight: 0,
                      overflow: 'hidden',
                    }}
                  >
                    <TableContainer sx={{ height: '100%', minHeight: 0, overflowY: 'auto' }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>Claim</TableCell>
                            <TableCell>Payer</TableCell>
                            <TableCell>Billed</TableCell>
                            <TableCell>Approved</TableCell>
                            <TableCell>Denied</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Denial Reason</TableCell>
                            <TableCell>Updated</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredClaimRows.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8}>
                                <Alert severity="info">No claims available for selected filters.</Alert>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredClaimRows.map((row) => (
                              <TableRow key={row.id}>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    {row.claimNo}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {row.patientLabel}
                                  </Typography>
                                </TableCell>
                                <TableCell>{row.payer}</TableCell>
                                <TableCell>{formatCurrency(row.billedAmount)}</TableCell>
                                <TableCell>{formatCurrency(row.approvedAmount)}</TableCell>
                                <TableCell>{formatCurrency(row.deniedAmount)}</TableCell>
                                <TableCell>
                                  <Chip size="small" label={row.status} color={claimStatusColor(row.status)} />
                                </TableCell>
                                <TableCell>{row.denialReason}</TableCell>
                                <TableCell>{row.lastUpdated}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Card>
                </Box>
              ) : null}

              {activeTab === 'payments' ? (
                <Box sx={{ p: 1.2, flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1fr) minmax(0, 1fr)' }, gap: 1.2 }}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 1.8,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.12),
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: 0,
                    }}
                  >
                    <Box sx={{ px: 1, py: 0.85, borderBottom: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1) }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Pending Invoice Collections
                      </Typography>
                    </Box>
                    <TableContainer sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>Invoice</TableCell>
                            <TableCell>Patient</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Patient Due</TableCell>
                            <TableCell>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {pendingInvoices.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5}>
                                <Alert severity="success">No pending invoice dues.</Alert>
                              </TableCell>
                            </TableRow>
                          ) : (
                            pendingInvoices.map((row) => (
                              <TableRow key={row.id}>
                                <TableCell sx={{ fontWeight: 700 }}>{row.id}</TableCell>
                                <TableCell>{getPatientLabel(row.patientId)}</TableCell>
                                <TableCell>{row.type}</TableCell>
                                <TableCell>{formatCurrency(row.patientDue)}</TableCell>
                                <TableCell>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => router.push(buildPatientDeskRoute(row.patientId, 'payments'))}
                                  >
                                    Collect
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Card>

                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 1.8,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.12),
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: 0,
                    }}
                  >
                    <Box sx={{ px: 1, py: 0.85, borderBottom: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1) }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Recent Payment Receipts
                      </Typography>
                    </Box>
                    <TableContainer sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>Receipt</TableCell>
                            <TableCell>Patient</TableCell>
                            <TableCell>Mode</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {recentPayments.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5}>
                                <Alert severity="info">No payments posted yet.</Alert>
                              </TableCell>
                            </TableRow>
                          ) : (
                            recentPayments.map((row) => (
                              <TableRow key={row.id}>
                                <TableCell sx={{ fontWeight: 700 }}>{row.id}</TableCell>
                                <TableCell>{getPatientLabel(row.patientId)}</TableCell>
                                <TableCell>{row.mode}</TableCell>
                                <TableCell>{formatCurrency(row.amount)}</TableCell>
                                <TableCell>
                                  <Chip
                                    size="small"
                                    label={row.status}
                                    color={row.status === 'Completed' ? 'success' : 'warning'}
                                  />
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Card>
                </Box>
              ) : null}

              {activeTab === 'integrations' ? (
                <Box sx={{ p: 1.2, flex: 1, minHeight: 0, overflowY: 'auto' }}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                      gap: 1.2,
                    }}
                  >
                    {INTEGRATION_ROWS.map((row) => (
                      <Card
                        key={row.id}
                        elevation={0}
                        sx={{
                          borderRadius: 1.8,
                          border: '1px solid',
                          borderColor: alpha(theme.palette.primary.main, 0.12),
                          p: 1.1,
                        }}
                      >
                        <Stack spacing={0.7}>
                          <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="center">
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                              {row.module}
                            </Typography>
                            <Chip size="small" label={row.status} color={integrationStatusColor(row.status)} />
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            Owner: {row.owner}
                          </Typography>
                          <Divider />
                          <Typography variant="caption" color="text.secondary">
                            Inbound
                          </Typography>
                          <Typography variant="body2">{row.inbound}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.3 }}>
                            Outbound
                          </Typography>
                          <Typography variant="body2">{row.outbound}</Typography>
                          <Button size="small" variant="outlined" onClick={() => router.push(row.route)}>
                            Open Connected Module
                          </Button>
                        </Stack>
                      </Card>
                    ))}
                  </Box>
                </Box>
              ) : null}

              {activeTab === 'roles' ? (
                <Box sx={{ p: 1.2, flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.5fr) minmax(0, 1fr)' }, gap: 1.2 }}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 1.8,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.12),
                      minHeight: 0,
                      overflow: 'hidden',
                    }}
                  >
                    <TableContainer sx={{ height: '100%', minHeight: 0, overflowY: 'auto' }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>Role</TableCell>
                            <TableCell>Scope</TableCell>
                            <TableCell>Responsibilities</TableCell>
                            <TableCell>Primary Screen</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {ROLE_WORKFLOW_ROWS.map((row) => (
                            <TableRow key={row.id}>
                              <TableCell sx={{ fontWeight: 700 }}>{getRoleLabel(row.role)}</TableCell>
                              <TableCell>{row.scope}</TableCell>
                              <TableCell>{row.responsibilities}</TableCell>
                              <TableCell>
                                <Button size="small" variant="outlined" onClick={() => router.push(row.primaryScreen)}>
                                  Open
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Card>

                  <Stack spacing={1}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 1.8,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.primary.main, 0.12),
                        p: 1.1,
                      }}
                    >
                      <Stack direction="row" spacing={0.8} alignItems="center">
                        <GppGoodIcon sx={{ fontSize: 18, color: 'success.main' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          Module Visibility
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.4 }}>
                        Roles having `billing.read` access:
                      </Typography>
                      <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap sx={{ mt: 0.8 }}>
                        {billingReadRoles.map((roleLabel) => (
                          <Chip key={roleLabel} size="small" label={roleLabel} variant="outlined" />
                        ))}
                      </Stack>
                    </Card>

                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 1.8,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.warning.main, 0.24),
                        p: 1.1,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Control Checklist
                      </Typography>
                      <Stack spacing={0.4} sx={{ mt: 0.7 }}>
                        <Typography variant="body2">1. Charge posting must be complete before final invoice.</Typography>
                        <Typography variant="body2">2. Denied claims need reason capture and appeal owner assignment.</Typography>
                        <Typography variant="body2">3. Refunds require supervisor authorization trail.</Typography>
                        <Typography variant="body2">4. Payment reconciliation must close before discharge billing clearance.</Typography>
                      </Stack>
                    </Card>

                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 1.8,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.info.main, 0.2),
                        p: 1.1,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                        Connected Operational Areas
                      </Typography>
                      <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                        <Chip size="small" label="OPD / Appointments" icon={<EventNoteIcon />} />
                        <Chip size="small" label="IPD Wards" icon={<LocalHospitalIcon />} />
                        <Chip size="small" label="Pharmacy" icon={<LocalPharmacyIcon />} />
                        <Chip size="small" label="Lab" icon={<ScienceIcon />} />
                        <Chip size="small" label="Radiology" icon={<BiotechIcon />} />
                        <Chip size="small" label="Inventory" icon={<Inventory2Icon />} />
                      </Stack>
                    </Card>
                  </Stack>
                </Box>
              ) : null}
            </Card>
          </>
        ) : null}
      </Stack>
    </PageTemplate>
  );
}
