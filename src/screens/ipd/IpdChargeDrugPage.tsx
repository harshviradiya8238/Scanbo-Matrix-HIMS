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
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Snackbar,
} from '@/src/ui/components/atoms';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { Card, CommonDialog } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { getPatientByMrn } from '@/src/mocks/global-patients';
import { usePermission } from '@/src/core/auth/usePermission';
import { useUser } from '@/src/core/auth/UserContext';
import { canAccessRoute } from '@/src/core/navigation/route-access';
import { DISCHARGE_CANDIDATES, INPATIENT_STAYS } from './ipd-mock-data';
import { IpdMetricCard } from './components/ipd-ui';
import IpdModuleTabs from './components/IpdModuleTabs';
import IpdPatientTopBar, { IpdPatientOption, IpdPatientTopBarField } from './components/IpdPatientTopBar';
import { syncIpdEncounterDischargeChecks, useIpdEncounters } from './ipd-encounter-context';

type ChargeStatus = 'Posted' | 'Pending' | 'Scheduled' | 'Cancelled';
type ClinicalBillingStatus = 'Pending' | 'Ready for Billing' | 'Cancelled';
type IpdRxStatus = 'Prescribed' | 'Dispensed' | 'Administered' | 'Stopped';
type BillingModuleView = 'ipd-charges' | 'invoices' | 'payments' | 'insurance' | 'refunds';
type BillingChargeCategory = 'Medication' | 'Procedure' | 'Consumable' | 'Room' | 'Lab';
type PaymentMode = 'Cash' | 'UPI' | 'Card' | 'NEFT' | 'Insurance';
type BillingInvoiceStatus = 'Pending' | 'Paid';
type BillingPaymentStatus = 'Completed' | 'Pending';
type RefundStatus = 'Under Review' | 'Processed';
type PreAuthStatus = 'Approved' | 'Pending';

interface ClinicalBillingLedgerEntry {
  id: string;
  orderId?: string;
  patientId: string;
  category: string;
  serviceCode: string;
  serviceName: string;
  amount: number;
  status: ClinicalBillingStatus;
}

interface PersistedOrderBillingState {
  version: 1;
  billingByPatient: Record<string, ClinicalBillingLedgerEntry[]>;
}

interface SharedPrescriptionRow {
  id: string;
  medicationName: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
  notes: string;
  status: IpdRxStatus;
  prescribedBy: string;
  updatedAt: string;
}

type SharedPrescriptionStore = Record<string, SharedPrescriptionRow[]>;

interface BillingChargeItem {
  id: string;
  category: BillingChargeCategory;
  name: string;
  description: string;
  qty: number;
  unit: string;
  rate: number;
  status: ChargeStatus;
  source: 'linked' | 'manual';
}

interface BillingInvoiceRow {
  id: string;
  date: string;
  type: 'Final Bill' | 'Interim Bill';
  amount: number;
  insuranceAmount: number;
  patientDue: number;
  status: BillingInvoiceStatus;
}

interface BillingPaymentRow {
  id: string;
  dateTime: string;
  mode: PaymentMode;
  amount: number;
  invoiceId: string;
  receivedBy: string;
  status: BillingPaymentStatus;
  reference?: string;
}

interface BillingInsuranceProfile {
  provider: string;
  policyNumber: string;
  tpa: string;
  memberId: string;
  sumInsured: number;
  approvedAmount: number;
  claimedAmount: number;
  active: boolean;
}

interface BillingPreAuthRow {
  id: string;
  service: string;
  requestedOn: string;
  approvedAmount: number;
  status: PreAuthStatus;
}

interface BillingRefundRow {
  id: string;
  title: string;
  description: string;
  requestedOn: string;
  amount: number;
  status: RefundStatus;
}

interface BillingModulePersistedState {
  version: 1;
  manualChargesByPatient: Record<string, BillingChargeItem[]>;
  invoicesByPatient: Record<string, BillingInvoiceRow[]>;
  paymentsByPatient: Record<string, BillingPaymentRow[]>;
  insuranceByPatient: Record<string, BillingInsuranceProfile>;
  preAuthByPatient: Record<string, BillingPreAuthRow[]>;
  refundsByPatient: Record<string, BillingRefundRow[]>;
}

interface AddChargeDraft {
  category: BillingChargeCategory;
  name: string;
  description: string;
  qty: number;
  unit: string;
  rate: number;
}

interface PaymentDraft {
  amount: number;
  mode: PaymentMode;
  invoiceId: string;
  receivedBy: string;
  reference: string;
  remarks: string;
}

interface RefundDraft {
  reason: string;
  amount: number;
  reference: string;
  description: string;
}

interface PreAuthDraft {
  service: string;
  amount: number;
  diagnosisCode: string;
  procedureCode: string;
  justification: string;
}

interface InsuranceDraft {
  provider: string;
  policyNumber: string;
  tpa: string;
  memberId: string;
  sumInsured: number;
}

interface IpdChargeDrugPageProps {
  defaultView?: BillingModuleView;
}

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const ORDER_BILLING_STORAGE_KEY = 'scanbo.hims.ipd.orders-billing.v1';
const IPD_RX_STORAGE_KEY = 'scanbo.hims.ipd.prescriptions.module.v1';
const BILLING_MODULE_STORAGE_KEY = 'scanbo.hims.ipd.billing-medication.module.v1';

const CHARGE_CATEGORY_TABS = [
  { id: 'Medication', label: '💊 Medications' },
  { id: 'Procedure', label: '🩺 Procedures' },
  { id: 'Consumable', label: '🧴 Consumables' },
  { id: 'Room', label: '🛏 Room Charges' },
  { id: 'Lab', label: '🔬 Lab / Radiology' },
] as const;

const CATEGORY_UNITS: Record<BillingChargeCategory, string> = {
  Medication: 'doses',
  Procedure: 'procedures',
  Consumable: 'units',
  Room: 'days',
  Lab: 'tests',
};

const ROUTE_BY_VIEW: Record<BillingModuleView, string> = {
  'ipd-charges': '/ipd/charges',
  invoices: '/billing/invoices',
  payments: '/billing/payments',
  insurance: '/billing/insurance',
  refunds: '/billing/refunds',
};

const DEFAULT_INSURANCE_BY_PATIENT_ID: Record<string, BillingInsuranceProfile> = {
  'ipd-1': {
    provider: 'Star Health',
    policyNumber: 'SH-7829-4415',
    tpa: 'Medi Assist',
    memberId: 'MEM-004156',
    sumInsured: 500000,
    approvedAmount: 45000,
    claimedAmount: 32000,
    active: true,
  },
  'ipd-2': {
    provider: 'HDFC Ergo',
    policyNumber: 'HE-1135-2201',
    tpa: 'Health India',
    memberId: 'MEM-002211',
    sumInsured: 300000,
    approvedAmount: 20000,
    claimedAmount: 12000,
    active: true,
  },
  'ipd-3': {
    provider: 'New India Assurance',
    policyNumber: 'NIA-9112-0893',
    tpa: 'Vipul MedCorp',
    memberId: 'MEM-008831',
    sumInsured: 800000,
    approvedAmount: 150000,
    claimedAmount: 90000,
    active: true,
  },
  'ipd-4': {
    provider: 'Self Pay',
    policyNumber: '--',
    tpa: '--',
    memberId: '--',
    sumInsured: 0,
    approvedAmount: 0,
    claimedAmount: 0,
    active: false,
  },
};

const DEFAULT_PREAUTH_BY_PATIENT_ID: Record<string, BillingPreAuthRow[]> = {
  'ipd-1': [
    {
      id: 'PA-0041-01',
      service: 'Hospitalization + Procedures',
      requestedOn: '2026-02-14',
      approvedAmount: 55000,
      status: 'Approved',
    },
    {
      id: 'PA-0041-02',
      service: 'Echo Doppler Follow-up',
      requestedOn: '2026-02-19',
      approvedAmount: 3200,
      status: 'Pending',
    },
  ],
  'ipd-2': [
    {
      id: 'PA-0042-01',
      service: 'Post-operative package',
      requestedOn: '2026-02-18',
      approvedAmount: 18000,
      status: 'Approved',
    },
  ],
  'ipd-3': [
    {
      id: 'PA-0038-01',
      service: 'ICU + thrombolysis',
      requestedOn: '2026-02-12',
      approvedAmount: 140000,
      status: 'Approved',
    },
  ],
  'ipd-4': [],
};

const DEFAULT_REFUNDS_BY_PATIENT_ID: Record<string, BillingRefundRow[]> = {
  'ipd-1': [
    {
      id: 'REF-0041-01',
      title: 'Duplicate Lab Test Charge',
      description: 'CBC panel ordered twice on Day 1',
      requestedOn: '2026-02-19',
      amount: 600,
      status: 'Under Review',
    },
    {
      id: 'REF-0041-00',
      title: 'Security Deposit Refund',
      description: 'Deposit adjustment after discharge estimate update',
      requestedOn: '2026-02-16',
      amount: 5000,
      status: 'Processed',
    },
  ],
  'ipd-2': [],
  'ipd-3': [],
  'ipd-4': [],
};

function formatCurrency(value: number): string {
  return CURRENCY_FORMATTER.format(Math.max(0, Number.isFinite(value) ? value : 0));
}

function mapBillingStatusToChargeStatus(status: ClinicalBillingStatus): ChargeStatus {
  if (status === 'Ready for Billing') return 'Posted';
  if (status === 'Cancelled') return 'Cancelled';
  return 'Pending';
}

function mapSharedRxStatusToChargeStatus(status: IpdRxStatus): ChargeStatus {
  if (status === 'Administered' || status === 'Dispensed') return 'Posted';
  if (status === 'Stopped') return 'Cancelled';
  return 'Pending';
}

function mapSharedRxToPaymentMode(mode: PaymentMode): string {
  const icons: Record<PaymentMode, string> = {
    Cash: 'Cash',
    UPI: 'UPI',
    Card: 'Card',
    NEFT: 'NEFT',
    Insurance: 'Insurance',
  };
  return icons[mode];
}

function parseChargeCategory(rawCategory: string, serviceName: string): BillingChargeCategory {
  const hay = `${rawCategory} ${serviceName}`.toLowerCase();
  if (hay.includes('pharmacy') || hay.includes('medication') || hay.includes('drug') || hay.includes('rx')) {
    return 'Medication';
  }
  if (hay.includes('procedure') || hay.includes('consult')) return 'Procedure';
  if (hay.includes('room') || hay.includes('nursing') || hay.includes('bed')) return 'Room';
  if (
    hay.includes('lab') ||
    hay.includes('radiology') ||
    hay.includes('imaging') ||
    hay.includes('scan') ||
    hay.includes('x-ray')
  ) {
    return 'Lab';
  }
  return 'Consumable';
}

function readPersistedBillingLedger(): Record<string, ClinicalBillingLedgerEntry[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(ORDER_BILLING_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<PersistedOrderBillingState>;
    if (!parsed || typeof parsed !== 'object' || !parsed.billingByPatient) {
      return {};
    }
    return parsed.billingByPatient as Record<string, ClinicalBillingLedgerEntry[]>;
  } catch {
    return {};
  }
}

function readSharedPrescriptionStore(): SharedPrescriptionStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(IPD_RX_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SharedPrescriptionStore;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

function buildBasePersistedModuleState(): BillingModulePersistedState {
  return {
    version: 1,
    manualChargesByPatient: {
      'ipd-1': [],
      'ipd-2': [],
      'ipd-3': [],
      'ipd-4': [],
    },
    invoicesByPatient: {
      'ipd-1': [
        {
          id: 'INV-2026-0041-01',
          date: '2026-02-18',
          type: 'Interim Bill',
          amount: 62480,
          insuranceAmount: 30000,
          patientDue: 32480,
          status: 'Paid',
        },
      ],
      'ipd-2': [],
      'ipd-3': [],
      'ipd-4': [],
    },
    paymentsByPatient: {
      'ipd-1': [
        {
          id: 'RCP-0041-01',
          dateTime: '2026-02-18 14:34',
          mode: 'Cash',
          amount: 15000,
          invoiceId: 'INV-2026-0041-01',
          receivedBy: 'Cashier Desk 2',
          status: 'Completed',
        },
        {
          id: 'RCP-0041-02',
          dateTime: '2026-02-18 15:10',
          mode: 'UPI',
          amount: 17480,
          invoiceId: 'INV-2026-0041-01',
          receivedBy: 'Online Portal',
          status: 'Completed',
        },
      ],
      'ipd-2': [],
      'ipd-3': [],
      'ipd-4': [],
    },
    insuranceByPatient: { ...DEFAULT_INSURANCE_BY_PATIENT_ID },
    preAuthByPatient: { ...DEFAULT_PREAUTH_BY_PATIENT_ID },
    refundsByPatient: { ...DEFAULT_REFUNDS_BY_PATIENT_ID },
  };
}

function readPersistedBillingModuleState(): BillingModulePersistedState {
  const base = buildBasePersistedModuleState();
  if (typeof window === 'undefined') return base;
  try {
    const raw = window.sessionStorage.getItem(BILLING_MODULE_STORAGE_KEY);
    if (!raw) return base;

    const parsed = JSON.parse(raw) as Partial<BillingModulePersistedState>;
    if (!parsed || typeof parsed !== 'object') return base;

    return {
      version: 1,
      manualChargesByPatient: {
        ...base.manualChargesByPatient,
        ...(parsed.manualChargesByPatient ?? {}),
      },
      invoicesByPatient: {
        ...base.invoicesByPatient,
        ...(parsed.invoicesByPatient ?? {}),
      },
      paymentsByPatient: {
        ...base.paymentsByPatient,
        ...(parsed.paymentsByPatient ?? {}),
      },
      insuranceByPatient: {
        ...base.insuranceByPatient,
        ...(parsed.insuranceByPatient ?? {}),
      },
      preAuthByPatient: {
        ...base.preAuthByPatient,
        ...(parsed.preAuthByPatient ?? {}),
      },
      refundsByPatient: {
        ...base.refundsByPatient,
        ...(parsed.refundsByPatient ?? {}),
      },
    };
  } catch {
    return base;
  }
}

function writePersistedBillingModuleState(state: BillingModulePersistedState): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(BILLING_MODULE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // best effort cache
  }
}

function nowDateTimeLabel(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5);
  return `${date} ${time}`;
}

function asDisplayDate(dateInput: string): string {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return dateInput;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function categoryTone(
  category: BillingChargeCategory
): { bg: string; color: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'default' } {
  if (category === 'Medication') return { bg: 'rgba(25, 118, 210, 0.12)', color: 'primary' };
  if (category === 'Procedure') return { bg: 'rgba(156, 39, 176, 0.12)', color: 'secondary' };
  if (category === 'Room') return { bg: 'rgba(2, 136, 209, 0.12)', color: 'info' };
  if (category === 'Lab') return { bg: 'rgba(245, 124, 0, 0.14)', color: 'warning' };
  return { bg: 'rgba(0, 150, 136, 0.12)', color: 'success' };
}

function categoryIcon(category: BillingChargeCategory): string {
  if (category === 'Medication') return '💊';
  if (category === 'Procedure') return '🩺';
  if (category === 'Room') return '🛏';
  if (category === 'Lab') return '🔬';
  return '🧴';
}

function paymentModeIcon(mode: PaymentMode): string {
  if (mode === 'Cash') return '💵';
  if (mode === 'UPI') return '📱';
  if (mode === 'Card') return '💳';
  if (mode === 'NEFT') return '🏦';
  return '🛡';
}

function chargeStatusColor(status: ChargeStatus): 'success' | 'warning' | 'info' | 'error' {
  if (status === 'Posted') return 'success';
  if (status === 'Pending') return 'warning';
  if (status === 'Scheduled') return 'info';
  return 'error';
}

function invoiceStatusColor(status: BillingInvoiceStatus): 'success' | 'warning' {
  return status === 'Paid' ? 'success' : 'warning';
}

function preAuthStatusColor(status: PreAuthStatus): 'success' | 'warning' {
  return status === 'Approved' ? 'success' : 'warning';
}

function refundStatusColor(status: RefundStatus): 'success' | 'warning' {
  return status === 'Processed' ? 'success' : 'warning';
}

function buildChargeItemsFromSharedRx(
  patientId: string,
  rows: SharedPrescriptionRow[]
): BillingChargeItem[] {
  return rows.map((row) => {
    const qty = Math.max(1, Number.parseInt(row.duration.replace(/[^0-9]/g, ''), 10) || 1);
    const rate = 350;
    return {
      id: `bill-rx-ipd-${patientId}-${row.id}`,
      category: 'Medication',
      name: row.medicationName,
      description: `${row.dose} / ${row.route} · ${row.frequency}${row.duration ? ` · ${row.duration}` : ''}`,
      qty,
      unit: 'doses',
      rate,
      status: mapSharedRxStatusToChargeStatus(row.status),
      source: 'linked',
    };
  });
}

function buildChargeItemsFromBillingEntries(entries: ClinicalBillingLedgerEntry[]): BillingChargeItem[] {
  return entries.map((entry) => {
    const category = parseChargeCategory(entry.category, entry.serviceName);
    return {
      id: String(entry.id),
      category,
      name: entry.serviceName || entry.category || 'Billing Item',
      description: entry.serviceCode ? `${entry.serviceCode} · ${entry.category}` : entry.category,
      qty: 1,
      unit: CATEGORY_UNITS[category],
      rate: Math.max(0, entry.amount || 0),
      status: mapBillingStatusToChargeStatus(entry.status),
      source: 'linked',
    };
  });
}

function toItemAmount(item: BillingChargeItem): number {
  return Math.max(0, item.qty * item.rate);
}

function sumByCategory(items: BillingChargeItem[], category: BillingChargeCategory): number {
  return items
    .filter((item) => item.category === category && item.status !== 'Cancelled')
    .reduce((sum, item) => sum + toItemAmount(item), 0);
}

export default function IpdChargeDrugPage({ defaultView = 'ipd-charges' }: IpdChargeDrugPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mrnParam = useMrnParam();
  const theme = useTheme();
  const permissionGate = usePermission();
  const { permissions } = useUser();
  const encounterRows = useIpdEncounters();

  const activeEncounters = React.useMemo(
    () => encounterRows.filter((record) => record.workflowStatus !== 'discharged'),
    [encounterRows]
  );

  const [selectedPatientId, setSelectedPatientId] = React.useState('');
  const [activeView, setActiveView] = React.useState<BillingModuleView>(defaultView);
  const [activeChargeCategory, setActiveChargeCategory] = React.useState<BillingChargeCategory>('Medication');

  const [persistedBillingByPatient, setPersistedBillingByPatient] = React.useState<
    Record<string, ClinicalBillingLedgerEntry[]>
  >(() => readPersistedBillingLedger());
  const [sharedPrescriptionStore, setSharedPrescriptionStore] = React.useState<SharedPrescriptionStore>(() =>
    readSharedPrescriptionStore()
  );
  const [moduleState, setModuleState] = React.useState<BillingModulePersistedState>(() =>
    readPersistedBillingModuleState()
  );

  const [addChargeDialogOpen, setAddChargeDialogOpen] = React.useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = React.useState(false);
  const [invoicePreviewOpen, setInvoicePreviewOpen] = React.useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = React.useState(false);
  const [preAuthDialogOpen, setPreAuthDialogOpen] = React.useState(false);
  const [insuranceDialogOpen, setInsuranceDialogOpen] = React.useState(false);

  const [editingChargeId, setEditingChargeId] = React.useState<string | null>(null);

  const [addChargeDraft, setAddChargeDraft] = React.useState<AddChargeDraft>({
    category: 'Medication',
    name: '',
    description: '',
    qty: 1,
    unit: CATEGORY_UNITS.Medication,
    rate: 0,
  });

  const [paymentDraft, setPaymentDraft] = React.useState<PaymentDraft>({
    amount: 0,
    mode: 'Cash',
    invoiceId: '',
    receivedBy: 'Cashier Desk 1',
    reference: '',
    remarks: '',
  });

  const [refundDraft, setRefundDraft] = React.useState<RefundDraft>({
    reason: 'Duplicate Charge',
    amount: 0,
    reference: '',
    description: '',
  });

  const [preAuthDraft, setPreAuthDraft] = React.useState<PreAuthDraft>({
    service: '',
    amount: 0,
    diagnosisCode: '',
    procedureCode: '',
    justification: '',
  });

  const [insuranceDraft, setInsuranceDraft] = React.useState<InsuranceDraft>({
    provider: '',
    policyNumber: '',
    tpa: '',
    memberId: '',
    sumInsured: 0,
  });

  const [toast, setToast] = React.useState<{
    open: boolean;
    severity: 'success' | 'warning' | 'error' | 'info';
    message: string;
  }>({
    open: false,
    severity: 'info',
    message: '',
  });

  React.useEffect(() => {
    setActiveView(defaultView);
  }, [defaultView]);

  React.useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'drug') {
      setActiveView('ipd-charges');
      setActiveChargeCategory('Medication');
    }
    if (tabParam === 'charges') {
      setActiveView((current) => (pathname.startsWith('/ipd/charges') ? 'ipd-charges' : current));
    }
  }, [pathname, searchParams]);

  React.useEffect(() => {
    const refreshBillingLedger = () => {
      setPersistedBillingByPatient(readPersistedBillingLedger());
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshBillingLedger();
      }
    };

    refreshBillingLedger();
    window.addEventListener('focus', refreshBillingLedger);
    document.addEventListener('visibilitychange', onVisibilityChange);
    const intervalId = window.setInterval(refreshBillingLedger, 5000);

    return () => {
      window.removeEventListener('focus', refreshBillingLedger);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, []);

  React.useEffect(() => {
    const refreshSharedPrescriptionRows = () => {
      const latestStore = readSharedPrescriptionStore();
      setSharedPrescriptionStore((currentStore) =>
        JSON.stringify(currentStore) === JSON.stringify(latestStore) ? currentStore : latestStore
      );
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshSharedPrescriptionRows();
      }
    };

    const onStorageChange = (event: StorageEvent) => {
      if (event.key === IPD_RX_STORAGE_KEY) {
        refreshSharedPrescriptionRows();
      }
    };

    refreshSharedPrescriptionRows();
    window.addEventListener('focus', refreshSharedPrescriptionRows);
    window.addEventListener('storage', onStorageChange);
    document.addEventListener('visibilitychange', onVisibilityChange);
    const intervalId = window.setInterval(refreshSharedPrescriptionRows, 5000);

    return () => {
      window.removeEventListener('focus', refreshSharedPrescriptionRows);
      window.removeEventListener('storage', onStorageChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, []);

  React.useEffect(() => {
    writePersistedBillingModuleState(moduleState);
  }, [moduleState]);

  React.useEffect(() => {
    if (activeEncounters.length === 0) {
      setSelectedPatientId('');
      return;
    }

    if (mrnParam) {
      const matched = activeEncounters.find((record) => record.mrn === mrnParam);
      if (matched) {
        setSelectedPatientId((current) => (current === matched.patientId ? current : matched.patientId));
        return;
      }
    }

    setSelectedPatientId((current) => {
      if (current && activeEncounters.some((record) => record.patientId === current)) {
        return current;
      }
      return activeEncounters[0]?.patientId ?? '';
    });
  }, [activeEncounters, mrnParam]);

  const selectedEncounter = React.useMemo(
    () =>
      activeEncounters.find((record) => record.patientId === selectedPatientId) ??
      activeEncounters[0] ??
      null,
    [activeEncounters, selectedPatientId]
  );

  const canNavigate = React.useCallback(
    (route: string) => canAccessRoute(route, permissions),
    [permissions]
  );

  const withMrn = React.useCallback(
    (route: string) => {
      if (!selectedEncounter?.mrn) return route;
      const joiner = route.includes('?') ? '&' : '?';
      return `${route}${joiner}mrn=${encodeURIComponent(selectedEncounter.mrn)}`;
    },
    [selectedEncounter?.mrn]
  );

  const showToast = React.useCallback(
    (message: string, severity: 'success' | 'warning' | 'error' | 'info' = 'info') => {
      setToast({ open: true, severity, message });
    },
    []
  );

  const moduleHeaderRoute = React.useCallback(
    (view: BillingModuleView): string => {
      if (view === 'ipd-charges') {
        return '/ipd/charges?tab=charges';
      }
      return ROUTE_BY_VIEW[view];
    },
    []
  );

  const goToView = React.useCallback(
    (view: BillingModuleView) => {
      setActiveView(view);
      const route = moduleHeaderRoute(view);
      if (!canNavigate(route.split('?')[0])) return;
      router.push(withMrn(route));
    },
    [canNavigate, moduleHeaderRoute, router, withMrn]
  );

  if (!selectedEncounter) {
    return (
      <PageTemplate
        title="💵 Billing & Medication Charges"
        header={
          <IpdPatientTopBar
            moduleTitle="IPD Charge / Drug"
            sectionLabel="IPD"
            pageLabel="Charge / Drug"
            patient={null}
            fields={[]}
            patientOptions={[]}
            onSelectPatient={() => {}}
          />
        }
        currentPageTitle="💵 Billing & Medication Charges"
      >
        <Card elevation={0} sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No active inpatient encounters available.
          </Typography>
        </Card>
      </PageTemplate>
    );
  }

  const linkedBillingRows = persistedBillingByPatient[selectedEncounter.patientId] ?? [];
  const sharedPrescriptionRows = sharedPrescriptionStore[selectedEncounter.patientId] ?? [];

  const chargeItemsFromRx = buildChargeItemsFromSharedRx(selectedEncounter.patientId, sharedPrescriptionRows);
  const chargeItemsFromBilling = buildChargeItemsFromBillingEntries(linkedBillingRows).filter(
    (entry) => !chargeItemsFromRx.some((rxItem) => rxItem.id === entry.id)
  );

  const manualChargeItems = moduleState.manualChargesByPatient[selectedEncounter.patientId] ?? [];
  const allChargeItems = [...chargeItemsFromRx, ...chargeItemsFromBilling, ...manualChargeItems];

  const categoryTotals = {
    medication: sumByCategory(allChargeItems, 'Medication'),
    procedure: sumByCategory(allChargeItems, 'Procedure'),
    consumable: sumByCategory(allChargeItems, 'Consumable'),
    room: sumByCategory(allChargeItems, 'Room'),
    lab: sumByCategory(allChargeItems, 'Lab'),
  };

  const grossChargeAmount =
    categoryTotals.medication +
    categoryTotals.procedure +
    categoryTotals.consumable +
    categoryTotals.room +
    categoryTotals.lab;

  const insuranceProfile =
    moduleState.insuranceByPatient[selectedEncounter.patientId] ??
    DEFAULT_INSURANCE_BY_PATIENT_ID[selectedEncounter.patientId] ?? {
      provider: 'Self Pay',
      policyNumber: '--',
      tpa: '--',
      memberId: '--',
      sumInsured: 0,
      approvedAmount: 0,
      claimedAmount: 0,
      active: false,
    };

  const insuranceCoverage = Math.max(0, insuranceProfile.approvedAmount);

  const paymentRows = moduleState.paymentsByPatient[selectedEncounter.patientId] ?? [];
  const amountPaid = paymentRows
    .filter((row) => row.status === 'Completed')
    .reduce((sum, row) => sum + Math.max(0, row.amount), 0);

  const patientDue = Math.max(0, grossChargeAmount - insuranceCoverage);
  const outstanding = Math.max(0, patientDue - amountPaid);

  const invoiceRows = moduleState.invoicesByPatient[selectedEncounter.patientId] ?? [];
  const preAuthRows = moduleState.preAuthByPatient[selectedEncounter.patientId] ?? [];
  const refundRows = moduleState.refundsByPatient[selectedEncounter.patientId] ?? [];

  const currentCategoryRows = allChargeItems.filter((item) => item.category === activeChargeCategory);

  const canManageClearance = permissionGate('ipd.discharge.write');

  const onSelectPatient = (patientId: string) => {
    const next = activeEncounters.find((record) => record.patientId === patientId);
    if (!next) return;
    setSelectedPatientId(next.patientId);
    const currentRoute = ROUTE_BY_VIEW[activeView];
    const route = activeView === 'ipd-charges' ? `${currentRoute}?tab=charges` : currentRoute;
    router.replace(withMrn(route), { scroll: false });
  };

  const openAddChargeDialog = (category?: BillingChargeCategory) => {
    const nextCategory = category ?? activeChargeCategory;
    setAddChargeDraft({
      category: nextCategory,
      name: '',
      description: '',
      qty: 1,
      unit: CATEGORY_UNITS[nextCategory],
      rate: 0,
    });
    setEditingChargeId(null);
    setAddChargeDialogOpen(true);
  };

  const openEditChargeDialog = (row: BillingChargeItem) => {
    if (row.source !== 'manual') {
      showToast('Linked charges are read-only. Edit from source module.', 'info');
      return;
    }
    setAddChargeDraft({
      category: row.category,
      name: row.name,
      description: row.description,
      qty: row.qty,
      unit: row.unit,
      rate: row.rate,
    });
    setEditingChargeId(row.id);
    setAddChargeDialogOpen(true);
  };

  const saveChargeDraft = () => {
    if (!addChargeDraft.name.trim()) {
      showToast('Item name is required.', 'warning');
      return;
    }
    if (addChargeDraft.qty <= 0 || addChargeDraft.rate <= 0) {
      showToast('Quantity and rate must be greater than zero.', 'warning');
      return;
    }

    const nextCharge: BillingChargeItem = {
      id: editingChargeId ?? `manual-${selectedEncounter.patientId}-${Date.now()}`,
      category: addChargeDraft.category,
      name: addChargeDraft.name.trim(),
      description: addChargeDraft.description.trim() || '--',
      qty: addChargeDraft.qty,
      unit: addChargeDraft.unit.trim() || CATEGORY_UNITS[addChargeDraft.category],
      rate: addChargeDraft.rate,
      status: 'Posted',
      source: 'manual',
    };

    setModuleState((prev) => {
      const currentRows = prev.manualChargesByPatient[selectedEncounter.patientId] ?? [];
      const nextRows = editingChargeId
        ? currentRows.map((row) => (row.id === editingChargeId ? nextCharge : row))
        : [...currentRows, nextCharge];

      return {
        ...prev,
        manualChargesByPatient: {
          ...prev.manualChargesByPatient,
          [selectedEncounter.patientId]: nextRows,
        },
      };
    });

    setAddChargeDialogOpen(false);
    showToast(editingChargeId ? 'Charge updated successfully.' : 'Charge added successfully.', 'success');
  };

  const deleteManualCharge = (rowId: string) => {
    setModuleState((prev) => {
      const currentRows = prev.manualChargesByPatient[selectedEncounter.patientId] ?? [];
      return {
        ...prev,
        manualChargesByPatient: {
          ...prev.manualChargesByPatient,
          [selectedEncounter.patientId]: currentRows.filter((row) => row.id !== rowId),
        },
      };
    });
    showToast('Charge removed.', 'warning');
  };

  const openPaymentDialog = (amount?: number) => {
    const targetInvoice = invoiceRows.find((row) => row.status === 'Pending')?.id || invoiceRows[0]?.id || '--';
    setPaymentDraft({
      amount: Math.max(0, amount ?? outstanding),
      mode: 'Cash',
      invoiceId: targetInvoice,
      receivedBy: 'Cashier Desk 1',
      reference: '',
      remarks: '',
    });
    setPaymentDialogOpen(true);
  };

  const submitPayment = () => {
    if (paymentDraft.amount <= 0) {
      showToast('Enter a valid payment amount.', 'warning');
      return;
    }

    const nextRow: BillingPaymentRow = {
      id: `RCP-${selectedEncounter.patientId}-${Date.now()}`,
      dateTime: nowDateTimeLabel(),
      mode: paymentDraft.mode,
      amount: paymentDraft.amount,
      invoiceId: paymentDraft.invoiceId || '--',
      receivedBy: paymentDraft.receivedBy || 'Cashier Desk 1',
      status: 'Completed',
      reference: paymentDraft.reference || undefined,
    };

    setModuleState((prev) => ({
      ...prev,
      paymentsByPatient: {
        ...prev.paymentsByPatient,
        [selectedEncounter.patientId]: [nextRow, ...(prev.paymentsByPatient[selectedEncounter.patientId] ?? [])],
      },
    }));

    setPaymentDialogOpen(false);
    showToast(
      `Payment of ${formatCurrency(paymentDraft.amount)} recorded via ${mapSharedRxToPaymentMode(paymentDraft.mode)}.`,
      'success'
    );
  };

  const generateInvoice = () => {
    const nextId = `INV-${new Date().getFullYear()}-${selectedEncounter.patientId}-${Date.now().toString().slice(-4)}`;
    const nextInvoice: BillingInvoiceRow = {
      id: nextId,
      date: new Date().toISOString().slice(0, 10),
      type: 'Final Bill',
      amount: grossChargeAmount,
      insuranceAmount: insuranceCoverage,
      patientDue,
      status: outstanding <= 0 ? 'Paid' : 'Pending',
    };

    setModuleState((prev) => ({
      ...prev,
      invoicesByPatient: {
        ...prev.invoicesByPatient,
        [selectedEncounter.patientId]: [nextInvoice, ...(prev.invoicesByPatient[selectedEncounter.patientId] ?? [])],
      },
    }));

    setInvoicePreviewOpen(true);
    if (activeView !== 'invoices') {
      goToView('invoices');
    }
    showToast(`Invoice ${nextId} generated.`, 'success');
  };

  const submitRefund = () => {
    if (refundDraft.amount <= 0 || !refundDraft.description.trim()) {
      showToast('Refund amount and description are required.', 'warning');
      return;
    }

    const nextRefund: BillingRefundRow = {
      id: `REF-${selectedEncounter.patientId}-${Date.now().toString().slice(-4)}`,
      title: refundDraft.reason,
      description: refundDraft.description.trim(),
      requestedOn: new Date().toISOString().slice(0, 10),
      amount: refundDraft.amount,
      status: 'Under Review',
    };

    setModuleState((prev) => ({
      ...prev,
      refundsByPatient: {
        ...prev.refundsByPatient,
        [selectedEncounter.patientId]: [nextRefund, ...(prev.refundsByPatient[selectedEncounter.patientId] ?? [])],
      },
    }));

    setRefundDialogOpen(false);
    showToast('Refund request submitted for approval.', 'success');
  };

  const submitPreAuth = () => {
    if (!preAuthDraft.service.trim() || preAuthDraft.amount <= 0) {
      showToast('Service and amount are required.', 'warning');
      return;
    }

    const nextRow: BillingPreAuthRow = {
      id: `PA-${selectedEncounter.patientId}-${Date.now().toString().slice(-4)}`,
      service: preAuthDraft.service.trim(),
      requestedOn: new Date().toISOString().slice(0, 10),
      approvedAmount: preAuthDraft.amount,
      status: 'Pending',
    };

    setModuleState((prev) => ({
      ...prev,
      preAuthByPatient: {
        ...prev.preAuthByPatient,
        [selectedEncounter.patientId]: [nextRow, ...(prev.preAuthByPatient[selectedEncounter.patientId] ?? [])],
      },
    }));

    setPreAuthDialogOpen(false);
    showToast('Pre-authorization request sent.', 'success');
  };

  const openInsuranceDialog = () => {
    setInsuranceDraft({
      provider: insuranceProfile.provider,
      policyNumber: insuranceProfile.policyNumber,
      tpa: insuranceProfile.tpa,
      memberId: insuranceProfile.memberId,
      sumInsured: insuranceProfile.sumInsured,
    });
    setInsuranceDialogOpen(true);
  };

  const saveInsuranceProfile = () => {
    if (!insuranceDraft.provider.trim() || !insuranceDraft.policyNumber.trim()) {
      showToast('Insurance company and policy number are required.', 'warning');
      return;
    }

    const nextProfile: BillingInsuranceProfile = {
      provider: insuranceDraft.provider.trim(),
      policyNumber: insuranceDraft.policyNumber.trim(),
      tpa: insuranceDraft.tpa.trim() || '--',
      memberId: insuranceDraft.memberId.trim() || '--',
      sumInsured: Math.max(0, insuranceDraft.sumInsured),
      approvedAmount: insuranceProfile.approvedAmount,
      claimedAmount: insuranceProfile.claimedAmount,
      active: true,
    };

    setModuleState((prev) => ({
      ...prev,
      insuranceByPatient: {
        ...prev.insuranceByPatient,
        [selectedEncounter.patientId]: nextProfile,
      },
    }));

    setInsuranceDialogOpen(false);
    showToast('Insurance profile saved.', 'success');
  };

  const toggleClearance = (type: 'billing' | 'pharmacy') => {
    if (!canManageClearance) return;
    if (type === 'billing') {
      syncIpdEncounterDischargeChecks(selectedEncounter.patientId, {
        billingCleared: !selectedEncounter.billingCleared,
      });
      return;
    }

    syncIpdEncounterDischargeChecks(selectedEncounter.patientId, {
      pharmacyCleared: !selectedEncounter.pharmacyCleared,
    });
  };

  const topBarPatientOptions = React.useMemo<IpdPatientOption[]>(() => {
    return activeEncounters.map((encounter) => {
      const linkedRows = persistedBillingByPatient[encounter.patientId] ?? [];
      const sharedRows = sharedPrescriptionStore[encounter.patientId] ?? [];
      const chargeRowsFromRx = buildChargeItemsFromSharedRx(encounter.patientId, sharedRows);
      const chargeRowsFromBilling = buildChargeItemsFromBillingEntries(linkedRows).filter(
        (entry) => !chargeRowsFromRx.some((rxItem) => rxItem.id === entry.id)
      );
      const manualRows = moduleState.manualChargesByPatient[encounter.patientId] ?? [];
      const allRows = [...chargeRowsFromRx, ...chargeRowsFromBilling, ...manualRows];
      const gross =
        sumByCategory(allRows, 'Medication') +
        sumByCategory(allRows, 'Procedure') +
        sumByCategory(allRows, 'Consumable') +
        sumByCategory(allRows, 'Room') +
        sumByCategory(allRows, 'Lab');

      const profile =
        moduleState.insuranceByPatient[encounter.patientId] ??
        DEFAULT_INSURANCE_BY_PATIENT_ID[encounter.patientId] ?? {
          provider: 'Self Pay',
          policyNumber: '--',
          tpa: '--',
          memberId: '--',
          sumInsured: 0,
          approvedAmount: 0,
          claimedAmount: 0,
          active: false,
        };
      const coverage = Math.max(0, profile.approvedAmount);
      const paidAmount = (moduleState.paymentsByPatient[encounter.patientId] ?? [])
        .filter((entry) => entry.status === 'Completed')
        .reduce((sum, entry) => sum + Math.max(0, entry.amount), 0);
      const due = Math.max(0, Math.max(0, gross - coverage) - paidAmount);

      const stay = INPATIENT_STAYS.find((row) => row.id === encounter.patientId || row.mrn === encounter.mrn);
      const globalPatient = getPatientByMrn(encounter.mrn || mrnParam);
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
        ward: encounter.ward || '--',
        bed: encounter.bed || '--',
        consultant: encounter.consultant || '--',
        diagnosis: encounter.diagnosis || stay?.diagnosis || '--',
        status,
        statusTone:
          status === 'Critical' ? 'error' : status === 'Discharge Due' ? 'warning' : status === 'ICU' ? 'info' : 'success',
        insurance: profile.active ? profile.provider : 'No Insurance',
        totalBill: gross,
        dueAmount: due,
        tags,
      };
    });
  }, [activeEncounters, moduleState, mrnParam, persistedBillingByPatient, sharedPrescriptionStore]);

  const selectedTopBarPatient = React.useMemo(
    () => topBarPatientOptions.find((row) => row.patientId === selectedEncounter.patientId) ?? null,
    [selectedEncounter.patientId, topBarPatientOptions]
  );

  const selectedTopBarFields = React.useMemo<IpdPatientTopBarField[]>(() => {
    const stay = INPATIENT_STAYS.find((row) => row.id === selectedEncounter.patientId || row.mrn === selectedEncounter.mrn);
    const discharge = DISCHARGE_CANDIDATES.find((row) => row.patientId === selectedEncounter.patientId);
    const globalPatient = getPatientByMrn(selectedEncounter.mrn || mrnParam);
    const allergies = globalPatient?.tags?.join(', ') || 'No known';
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
      { id: 'allergies', label: 'Allergies', value: allergies, tone: allergies === 'No known' ? 'success' : 'warning' },
      { id: 'insurance', label: 'Insurance', value: insuranceProfile.active ? insuranceProfile.provider : 'No Insurance', tone: insuranceProfile.active ? 'info' : 'default' },
      { id: 'status', label: 'Status', value: status, tone: status === 'Critical' ? 'error' : status === 'Discharge Due' ? 'warning' : 'success' },
      { id: 'total-bill', label: 'Total Bill', value: formatCurrency(grossChargeAmount), tone: 'info' },
    ];
  }, [grossChargeAmount, insuranceProfile.active, insuranceProfile.provider, mrnParam, selectedEncounter]);

  const topBarHeader = (
    <IpdPatientTopBar
      moduleTitle="IPD Charge / Drug"
      sectionLabel="IPD"
      pageLabel="Charge / Drug"
      patient={selectedTopBarPatient}
      fields={selectedTopBarFields}
      patientOptions={topBarPatientOptions}
      onSelectPatient={onSelectPatient}
    />
  );

  const sectionCardSx = {
    p: 0,
    border: '1px solid',
    borderColor: alpha(theme.palette.primary.main, 0.14),
    borderRadius: 2.5,
    boxShadow: 'none',
    overflow: 'hidden',
  };

  return (
    <PageTemplate title="💵 Billing & Medication Charges" header={topBarHeader}>
      <Stack spacing={2}>
        {!canManageClearance ? (
          <Alert severity="info">
            You are in read-only mode for billing/pharmacy clearance. Request `ipd.discharge.write` for updates.
          </Alert>
        ) : null}

        {activeView === 'ipd-charges' ? (
          <Card
            elevation={0}
            sx={{
              p: { xs: 1.5, md: 2 },
              borderRadius: 2.5,
              border: '1px solid',
              boxShadow: 'none',

              borderColor: alpha(theme.palette.primary.main, 0.15),
              background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.09)} 0%, ${alpha(
                theme.palette.info.main,
                0.06
              )} 100%)`,
            }}
          >
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', lg: 'center' }}
            >
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.1 }}>
                  💊 IPD Charges & Drug Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Track medication, procedures, consumables, room, and lab charges for this inpatient.
                </Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button size="small" variant="outlined" onClick={() => openAddChargeDialog()}>
                  ➕ Add Charge
                </Button>
                <Button size="small" variant="contained" onClick={() => generateInvoice()}>
                  🧾 Generate Invoice
                </Button>
              </Stack>
            </Stack>
          </Card>
        ) : null}

          <Box >
            {activeView === 'ipd-charges' ? (
              <Stack spacing={2}>
                <Grid container spacing={1.5}>
                  <Grid xs={12} sm={6} lg={3}>
                    <IpdMetricCard
                      label="💊 Medication Charges"
                      value={formatCurrency(categoryTotals.medication)}
                      tone="primary"
                      icon={<span>💊</span>}
                    />
                  </Grid>
                  <Grid xs={12} sm={6} lg={3}>
                    <IpdMetricCard
                      label="🩺 Procedure Charges"
                      value={formatCurrency(categoryTotals.procedure)}
                      tone="info"
                      icon={<span>🩺</span>}
                    />
                  </Grid>
                  <Grid xs={12} sm={6} lg={3}>
                    <IpdMetricCard
                      label="🛏 Room & Nursing"
                      value={formatCurrency(categoryTotals.room)}
                      tone="success"
                      icon={<span>🛏</span>}
                    />
                  </Grid>
                  <Grid xs={12} sm={6} lg={3}>
                    <IpdMetricCard
                      label="🔬 Lab & Diagnostics"
                      value={formatCurrency(categoryTotals.lab)}
                      tone="warning"
                      icon={<span>🔬</span>}
                    />
                  </Grid>
                </Grid>

                <Card elevation={0} sx={sectionCardSx}>
                  <Box sx={{ px: 1.5, pt: 1.2 }}>
                    <IpdModuleTabs
                      tabs={CHARGE_CATEGORY_TABS.map((tab) => ({ id: tab.id, label: tab.label }))}
                      value={activeChargeCategory}
                      onChange={(value) => {
                        if (
                          value !== 'Medication' &&
                          value !== 'Procedure' &&
                          value !== 'Consumable' &&
                          value !== 'Room' &&
                          value !== 'Lab'
                        ) {
                          return;
                        }
                        setActiveChargeCategory(value);
                      }}
                    />
                  </Box>

                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      spacing={1}
                      sx={{ mb: 1.25 }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {`${activeChargeCategory} Charges`}
                      </Typography>
                      <Button size="small" variant="contained" onClick={() => openAddChargeDialog(activeChargeCategory)}>
                        {`➕ Add ${activeChargeCategory}`}
                      </Button>
                    </Stack>

                    {currentCategoryRows.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 1.5 }}>
                        No charges available in this category.
                      </Typography>
                    ) : (
                      <Stack spacing={1}>
                        {currentCategoryRows.map((row) => {
                          const amount = toItemAmount(row);
                          return (
                            <Box
                              key={row.id}
                              sx={{
                                border: '1px solid',
                                borderColor: alpha(theme.palette.primary.main, 0.14),
                                borderRadius: 1.6,
                                p: 1.2,
                                display: 'flex',
                                gap: 1,
                                alignItems: 'center',
                                backgroundColor: alpha(theme.palette.primary.main, 0.03),
                              }}
                            >
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {row.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  {row.description}
                                </Typography>
                              </Box>

                              <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary', minWidth: 72, textAlign: 'right' }}
                              >
                                {row.qty} {row.unit}
                              </Typography>

                              <Typography variant="body2" sx={{ fontWeight: 800, minWidth: 110, textAlign: 'right' }}>
                                {formatCurrency(amount)}
                              </Typography>

                              <Chip size="small" color={chargeStatusColor(row.status)} label={row.status} />

                              <Stack direction="row" spacing={0.5}>
                                <Button size="small" variant="outlined" onClick={() => openEditChargeDialog(row)}>
                                  ✏️
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  disabled={row.source !== 'manual'}
                                  onClick={() => deleteManualCharge(row.id)}
                                >
                                  🗑
                                </Button>
                              </Stack>
                            </Box>
                          );
                        })}
                      </Stack>
                    )}
                  </Box>
                </Card>

                <Card elevation={0} sx={sectionCardSx}>
                  <Box sx={{ px: 2, py: 1.75 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                      📊 Billing Summary
                    </Typography>
                    <Stack spacing={0.8}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Medications & Drugs
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatCurrency(categoryTotals.medication)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Procedures
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatCurrency(categoryTotals.procedure)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Consumables
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatCurrency(categoryTotals.consumable)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Room & Nursing
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatCurrency(categoryTotals.room)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Lab & Diagnostics
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatCurrency(categoryTotals.lab)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Insurance Coverage ({insuranceProfile.provider})
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                          - {formatCurrency(insuranceCoverage)}
                        </Typography>
                      </Stack>
                      <Divider sx={{ my: 0.8 }} />
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          💵 Patient Due
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>
                          {formatCurrency(patientDue)}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1.5 }}>
                      <Button variant="contained" onClick={() => generateInvoice()}>
                        🧾 Generate Final Invoice
                      </Button>
                      <Button variant="contained" color="success" onClick={() => openPaymentDialog()}>
                        💳 Process Payment
                      </Button>
                      <Button variant="outlined" onClick={() => goToView('insurance')}>
                        🛡 Manage Insurance
                      </Button>
                    </Stack>
                  </Box>
                </Card>

               
              </Stack>
            ) : null}

            {activeView === 'invoices' ? (
              <Stack spacing={2}>
                <Card elevation={0} sx={sectionCardSx}>
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      spacing={1}
                      sx={{ mb: 1.2 }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        📄 Invoices
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined" onClick={() => openAddChargeDialog()}>
                          ➕ Add Charge
                        </Button>
                        <Button size="small" variant="contained" onClick={() => generateInvoice()}>
                          🧾 New Invoice
                        </Button>
                      </Stack>
                    </Stack>

                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Invoice #</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell align="right">Insurance</TableCell>
                            <TableCell align="right">Patient Due</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {invoiceRows.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} sx={{ py: 2.5, textAlign: 'center', color: 'text.secondary' }}>
                                No invoices yet. Generate a bill to create invoice entries.
                              </TableCell>
                            </TableRow>
                          ) : (
                            invoiceRows.map((row) => (
                              <TableRow key={row.id} hover>
                                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{row.id}</TableCell>
                                <TableCell>{asDisplayDate(row.date)}</TableCell>
                                <TableCell>
                                  <Chip size="small" label={row.type} color={row.type === 'Final Bill' ? 'info' : 'secondary'} />
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>
                                  {formatCurrency(row.amount)}
                                </TableCell>
                                <TableCell align="right" sx={{ color: 'success.main', fontWeight: 700 }}>
                                  {formatCurrency(row.insuranceAmount)}
                                </TableCell>
                                <TableCell align="right" sx={{ color: 'primary.main', fontWeight: 700 }}>
                                  {formatCurrency(row.patientDue)}
                                </TableCell>
                                <TableCell>
                                  <Chip size="small" color={invoiceStatusColor(row.status)} label={row.status} />
                                </TableCell>
                                <TableCell>
                                  <Stack direction="row" spacing={0.6}>
                                    <Button size="small" variant="outlined" onClick={() => setInvoicePreviewOpen(true)}>
                                      View
                                    </Button>
                                    <Button size="small" variant="outlined" color="success" onClick={() => openPaymentDialog()}>
                                      Pay
                                    </Button>
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Card>

                <Grid container spacing={1.5}>
                  <Grid xs={12} md={6}>
                    <Card elevation={0} sx={sectionCardSx}>
                      <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.1 }}>
                          📈 Billing Overview
                        </Typography>
                        <Stack spacing={0.8}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">Total Invoiced</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(grossChargeAmount)}</Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">Insurance Approved</Typography>
                            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 700 }}>
                              {formatCurrency(insuranceCoverage)}
                            </Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">Already Paid</Typography>
                            <Typography variant="body2" sx={{ color: 'info.main', fontWeight: 700 }}>
                              {formatCurrency(amountPaid)}
                            </Typography>
                          </Stack>
                          <Divider sx={{ my: 0.6 }} />
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>⚠ Outstanding</Typography>
                            <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 900 }}>
                              {formatCurrency(outstanding)}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    </Card>
                  </Grid>
                  <Grid xs={12} md={6}>
                    <Card elevation={0} sx={sectionCardSx}>
                      <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.1 }}>
                          ⚡ Quick Actions
                        </Typography>
                        <Stack spacing={1}>
                          <Button variant="outlined" sx={{ justifyContent: 'flex-start' }} onClick={() => setInvoicePreviewOpen(true)}>
                            👁 Invoice Preview
                          </Button>
                          <Button variant="outlined" sx={{ justifyContent: 'flex-start' }} onClick={() => goToView('payments')}>
                            💳 Process Payment
                          </Button>
                          <Button variant="outlined" sx={{ justifyContent: 'flex-start' }} onClick={() => goToView('insurance')}>
                            🛡 View Insurance Details
                          </Button>
                          <Button variant="outlined" sx={{ justifyContent: 'flex-start' }} onClick={() => goToView('refunds')}>
                            💸 Request Refund
                          </Button>
                        </Stack>
                      </Box>
                    </Card>
                  </Grid>
                </Grid>
              </Stack>
            ) : null}

            {activeView === 'payments' ? (
              <Stack spacing={2}>
                <Card elevation={0} sx={sectionCardSx}>
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      spacing={1}
                      sx={{ mb: 1.2 }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        💳 Payment Records
                      </Typography>
                      <Button size="small" variant="contained" onClick={() => openPaymentDialog()}>
                        ➕ Record Payment
                      </Button>
                    </Stack>

                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Receipt #</TableCell>
                            <TableCell>Date & Time</TableCell>
                            <TableCell>Mode</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell>Invoice</TableCell>
                            <TableCell>Received By</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paymentRows.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} sx={{ py: 2.5, textAlign: 'center', color: 'text.secondary' }}>
                                No payment records available.
                              </TableCell>
                            </TableRow>
                          ) : (
                            paymentRows.map((row) => (
                              <TableRow key={row.id} hover>
                                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{row.id}</TableCell>
                                <TableCell>{row.dateTime}</TableCell>
                                <TableCell>
                                  <Stack direction="row" spacing={0.6} alignItems="center">
                                    <Typography variant="body2">{`${paymentModeIcon(row.mode)} ${mapSharedRxToPaymentMode(row.mode)}`}</Typography>
                                  </Stack>
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>
                                  {formatCurrency(row.amount)}
                                </TableCell>
                                <TableCell sx={{ fontFamily: 'monospace' }}>{row.invoiceId}</TableCell>
                                <TableCell>{row.receivedBy}</TableCell>
                                <TableCell>
                                  <Chip size="small" color={row.status === 'Completed' ? 'success' : 'warning'} label={row.status} />
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Card>

                <Grid container spacing={1.5}>
                  <Grid xs={12} md={6}>
                    <Card elevation={0} sx={sectionCardSx}>
                      <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.1 }}>
                          💰 Payment Summary
                        </Typography>
                        <Stack spacing={0.8}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">Total Bill</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(grossChargeAmount)}</Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">Insurance</Typography>
                            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 700 }}>
                              {formatCurrency(insuranceCoverage)}
                            </Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">Amount Paid</Typography>
                            <Typography variant="body2" sx={{ color: 'info.main', fontWeight: 700 }}>
                              {formatCurrency(amountPaid)}
                            </Typography>
                          </Stack>
                          <Divider sx={{ my: 0.6 }} />
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 800 }}>⚠ Outstanding</Typography>
                            <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 900 }}>
                              {formatCurrency(outstanding)}
                            </Typography>
                          </Stack>
                        </Stack>
                        <Button variant="contained" sx={{ mt: 1.4, width: '100%' }} onClick={() => openPaymentDialog()}>
                          {`💳 Collect ${formatCurrency(outstanding)}`}
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                  <Grid xs={12} md={6}>
                    <Card elevation={0} sx={sectionCardSx}>
                      <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.1 }}>
                          📊 Payment Breakdown by Mode
                        </Typography>
                        <Stack spacing={0.8}>
                          {(['Cash', 'UPI', 'Card', 'NEFT', 'Insurance'] as PaymentMode[]).map((mode) => {
                            const total = paymentRows
                              .filter((row) => row.mode === mode)
                              .reduce((sum, row) => sum + row.amount, 0);
                            return (
                              <Stack key={mode} direction="row" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                  {`${paymentModeIcon(mode)} ${mode}`}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {formatCurrency(total)}
                                </Typography>
                              </Stack>
                            );
                          })}
                        </Stack>
                      </Box>
                    </Card>
                  </Grid>
                </Grid>
              </Stack>
            ) : null}

            {activeView === 'insurance' ? (
              <Stack spacing={2}>
                <Card elevation={0} sx={sectionCardSx}>
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      spacing={1}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        🛡 Insurance / TPA Management
                      </Typography>
                      <Button size="small" variant="contained" onClick={openInsuranceDialog}>
                        ➕ Add / Update Insurance
                      </Button>
                    </Stack>

                    <Box
                      sx={{
                        mt: 1.3,
                        p: 1.5,
                        borderRadius: 1.6,
                        border: '1px solid',
                        borderColor: insuranceProfile.active ? 'success.main' : 'divider',
                        backgroundColor: insuranceProfile.active
                          ? alpha(theme.palette.success.main, 0.08)
                          : alpha(theme.palette.grey[500], 0.05),
                      }}
                    >
                      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.2}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            {insuranceProfile.provider}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Policy: {insuranceProfile.policyNumber} · TPA: {insuranceProfile.tpa}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Member ID: {insuranceProfile.memberId}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          color={insuranceProfile.active ? 'success' : 'default'}
                          label={insuranceProfile.active ? 'Active & Approved' : 'Inactive'}
                        />
                      </Stack>

                      <Grid container spacing={1.1} sx={{ mt: 0.3 }}>
                        <Grid xs={12} md={4}>
                          <Card elevation={0} sx={{ p: 1.1, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="caption" color="text.secondary">💼 Sum Insured</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                              {formatCurrency(insuranceProfile.sumInsured)}
                            </Typography>
                          </Card>
                        </Grid>
                        <Grid xs={12} md={4}>
                          <Card elevation={0} sx={{ p: 1.1, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="caption" color="text.secondary">✅ Pre-auth Approved</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'success.main' }}>
                              {formatCurrency(insuranceProfile.approvedAmount)}
                            </Typography>
                          </Card>
                        </Grid>
                        <Grid xs={12} md={4}>
                          <Card elevation={0} sx={{ p: 1.1, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="caption" color="text.secondary">🏦 Claimed So Far</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
                              {formatCurrency(insuranceProfile.claimedAmount)}
                            </Typography>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>

                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1.4, mb: 1 }}>
                      📋 Pre-Authorization Requests
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Pre-Auth ID</TableCell>
                            <TableCell>Service</TableCell>
                            <TableCell>Requested On</TableCell>
                            <TableCell align="right">Approved Amount</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {preAuthRows.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} sx={{ py: 2.5, textAlign: 'center', color: 'text.secondary' }}>
                                No pre-auth requests created yet.
                              </TableCell>
                            </TableRow>
                          ) : (
                            preAuthRows.map((row) => (
                              <TableRow key={row.id} hover>
                                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{row.id}</TableCell>
                                <TableCell>{row.service}</TableCell>
                                <TableCell>{asDisplayDate(row.requestedOn)}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>
                                  {formatCurrency(row.approvedAmount)}
                                </TableCell>
                                <TableCell>
                                  <Chip size="small" color={preAuthStatusColor(row.status)} label={row.status} />
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1.4 }}>
                      <Button variant="contained" onClick={() => setPreAuthDialogOpen(true)}>
                        📋 New Pre-Auth Request
                      </Button>
                      <Button variant="outlined" onClick={() => showToast('Claim documents sent to TPA.', 'success')}>
                        📤 Send Claim Documents
                      </Button>
                      <Button variant="outlined" onClick={() => showToast('Final claim submitted to insurer.', 'success')}>
                        🏦 Submit Final Claim
                      </Button>
                    </Stack>
                  </Box>
                </Card>

                <Card elevation={0} sx={sectionCardSx}>
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.1 }}>
                      📅 Claim Status Timeline
                    </Typography>
                    <Stack spacing={1.1}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <Typography variant="body2" sx={{ mt: 0.1 }}>
                          ✅
                        </Typography>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            Pre-Authorization Approved
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Approved amount: {formatCurrency(insuranceCoverage)}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <Typography variant="body2" sx={{ mt: 0.1 }}>
                          ✅
                        </Typography>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            Interim Claim Processed
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Claimed amount: {formatCurrency(insuranceProfile.claimedAmount)}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <Typography variant="body2" sx={{ mt: 0.1 }}>
                          ⏳
                        </Typography>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            Final Discharge Claim Pending
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            To be submitted during final discharge billing.
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </Box>
                </Card>
              </Stack>
            ) : null}

            {activeView === 'refunds' ? (
              <Stack spacing={2}>
                <Card elevation={0} sx={sectionCardSx}>
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      spacing={1}
                      sx={{ mb: 1.2 }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        💸 Refunds & Adjustments
                      </Typography>
                      <Button size="small" variant="contained" onClick={() => setRefundDialogOpen(true)}>
                        ➕ Request Refund
                      </Button>
                    </Stack>

                    {refundRows.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No refund entries available.
                      </Typography>
                    ) : (
                      <Stack spacing={1}>
                        {refundRows.map((row) => (
                          <Box
                            key={row.id}
                            sx={{
                              p: 1.2,
                              borderRadius: 1.6,
                              border: '1px solid',
                              borderColor:
                                row.status === 'Processed'
                                  ? alpha(theme.palette.success.main, 0.45)
                                  : alpha(theme.palette.warning.main, 0.45),
                              backgroundColor:
                                row.status === 'Processed'
                                  ? alpha(theme.palette.success.main, 0.08)
                                  : alpha(theme.palette.warning.main, 0.1),
                            }}
                          >
                            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {row.id} · {row.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  {row.description}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  Requested: {asDisplayDate(row.requestedOn)}
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                  {formatCurrency(row.amount)}
                                </Typography>
                                <Chip size="small" color={refundStatusColor(row.status)} label={row.status} />
                              </Box>
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    )}

                    <Divider sx={{ my: 1.3 }} />
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        💸 Total Refunded / Adjusted:
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 800 }}>
                        {formatCurrency(refundRows.reduce((sum, row) => sum + row.amount, 0))}
                      </Typography>
                    </Stack>
                  </Box>
                </Card>

                <Card elevation={0} sx={sectionCardSx}>
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.1 }}>
                      📋 Refund Policy
                    </Typography>
                    <Stack spacing={0.6}>
                      <Typography variant="body2" color="text.secondary">
                        • Refund requests must be approved by the billing supervisor within 24 hours.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • Cash refunds are processed within 3 working days.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • UPI/Card refunds are credited within 5-7 working days.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • Security deposit is refunded after discharge settlement.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • Medical charge refunds require attending consultant approval.
                      </Typography>
                    </Stack>
                  </Box>
                </Card>
              </Stack>
            ) : null}
          </Box>

        <Card
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.2),
            borderRadius: 0,
            position: 'sticky',
            bottom: 0,
            zIndex: 3,
            backdropFilter: 'blur(4px)',
            backgroundColor: alpha(theme.palette.background.paper, 0.96),
            boxShadow: `0 6px 14px ${alpha(theme.palette.primary.main, 0.1)}`,
            mx: { xs: -2, sm: -3 },
            mb: -2,
            borderLeft: 'none',
            borderRight: 'none',
          }}
        >
          <Box sx={{ px: 2, py: 1.2 }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.25}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
            >
              <Stack direction="row" spacing={2.2} useFlexGap flexWrap="wrap">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Charges
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {formatCurrency(grossChargeAmount)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Insurance
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: 'success.main', fontWeight: 800 }}>
                    {formatCurrency(insuranceCoverage)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Outstanding
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: 'warning.main', fontWeight: 800 }}>
                    {formatCurrency(outstanding)}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={() => generateInvoice()}>
                  🧾 Generate Invoice
                </Button>
                <Button variant="contained" onClick={() => openPaymentDialog()}>
                  💳 Process Payment
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Card>
      </Stack>

      <CommonDialog
        open={addChargeDialogOpen}
        onClose={() => setAddChargeDialogOpen(false)}
        title={editingChargeId ? '✏️ Edit Charge' : '➕ Add Charge / Drug'}
        maxWidth="md"
        confirmLabel={editingChargeId ? '💾 Save Changes' : '✅ Add Charge'}
        onConfirm={saveChargeDraft}
        content={
          <Grid container spacing={1.2}>
            <Grid xs={12} md={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="Category"
                value={addChargeDraft.category}
                onChange={(event) => {
                  const category = event.target.value as BillingChargeCategory;
                  setAddChargeDraft((prev) => ({
                    ...prev,
                    category,
                    unit: CATEGORY_UNITS[category],
                  }));
                }}
              >
                {CHARGE_CATEGORY_TABS.map((tab) => (
                  <MenuItem key={tab.id} value={tab.id}>
                    {tab.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Item Name"
                value={addChargeDraft.name}
                onChange={(event) => setAddChargeDraft((prev) => ({ ...prev, name: event.target.value }))}
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Description"
                value={addChargeDraft.description}
                onChange={(event) => setAddChargeDraft((prev) => ({ ...prev, description: event.target.value }))}
              />
            </Grid>
            <Grid xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Quantity"
                value={addChargeDraft.qty}
                onChange={(event) =>
                  setAddChargeDraft((prev) => ({
                    ...prev,
                    qty: Math.max(1, Number(event.target.value) || 1),
                  }))
                }
              />
            </Grid>
            <Grid xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Unit"
                value={addChargeDraft.unit}
                onChange={(event) => setAddChargeDraft((prev) => ({ ...prev, unit: event.target.value }))}
              />
            </Grid>
            <Grid xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Rate (INR)"
                value={addChargeDraft.rate}
                onChange={(event) =>
                  setAddChargeDraft((prev) => ({
                    ...prev,
                    rate: Math.max(0, Number(event.target.value) || 0),
                  }))
                }
              />
            </Grid>
            <Grid xs={12}>
              <Alert severity="info" sx={{ mt: 0.5 }}>
                Calculated amount: {formatCurrency(addChargeDraft.qty * addChargeDraft.rate)}
              </Alert>
            </Grid>
          </Grid>
        }
      />

      <CommonDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        title="💳 Process Payment"
        maxWidth="sm"
        confirmLabel="✅ Confirm Payment"
        onConfirm={submitPayment}
        confirmColor="success"
        content={
          <Stack spacing={1.2}>
            <Alert severity="info">
              Outstanding amount for {selectedEncounter.patientName}: {formatCurrency(outstanding)}
            </Alert>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Amount"
              value={paymentDraft.amount}
              onChange={(event) =>
                setPaymentDraft((prev) => ({
                  ...prev,
                  amount: Math.max(0, Number(event.target.value) || 0),
                }))
              }
            />
            <TextField
              select
              fullWidth
              size="small"
              label="Payment Mode"
              value={paymentDraft.mode}
              onChange={(event) =>
                setPaymentDraft((prev) => ({
                  ...prev,
                  mode: event.target.value as PaymentMode,
                }))
              }
            >
              {(['Cash', 'UPI', 'Card', 'NEFT', 'Insurance'] as PaymentMode[]).map((mode) => (
                <MenuItem key={mode} value={mode}>
                  {mode}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              size="small"
              label="Invoice ID"
              value={paymentDraft.invoiceId}
              onChange={(event) => setPaymentDraft((prev) => ({ ...prev, invoiceId: event.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              label="Reference Number"
              value={paymentDraft.reference}
              onChange={(event) => setPaymentDraft((prev) => ({ ...prev, reference: event.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              label="Collected By"
              value={paymentDraft.receivedBy}
              onChange={(event) => setPaymentDraft((prev) => ({ ...prev, receivedBy: event.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              label="Remarks"
              value={paymentDraft.remarks}
              onChange={(event) => setPaymentDraft((prev) => ({ ...prev, remarks: event.target.value }))}
            />
          </Stack>
        }
      />

      <CommonDialog
        open={invoicePreviewOpen}
        onClose={() => setInvoicePreviewOpen(false)}
        title="🧾 Invoice Preview"
        maxWidth="md"
        hideCancel
        confirmLabel="Close"
        onConfirm={() => setInvoicePreviewOpen(false)}
        content={
          <Stack spacing={1.2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {selectedEncounter.patientName} ({selectedEncounter.mrn})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ward: {selectedEncounter.ward} · Bed: {selectedEncounter.bed} · Consultant: {selectedEncounter.consultant}
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Medications & Drugs</TableCell>
                    <TableCell align="right">{formatCurrency(categoryTotals.medication)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Procedures</TableCell>
                    <TableCell align="right">{formatCurrency(categoryTotals.procedure)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Consumables</TableCell>
                    <TableCell align="right">{formatCurrency(categoryTotals.consumable)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Room & Nursing</TableCell>
                    <TableCell align="right">{formatCurrency(categoryTotals.room)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Lab & Diagnostics</TableCell>
                    <TableCell align="right">{formatCurrency(categoryTotals.lab)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ color: 'success.main' }}>Insurance Coverage</TableCell>
                    <TableCell align="right" sx={{ color: 'success.main' }}>
                      - {formatCurrency(insuranceCoverage)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ color: 'success.main' }}>Already Paid</TableCell>
                    <TableCell align="right" sx={{ color: 'success.main' }}>
                      - {formatCurrency(amountPaid)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Net Payable</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900, color: 'primary.main' }}>
                      {formatCurrency(outstanding)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button variant="outlined" onClick={() => setInvoicePreviewOpen(false)}>
                Close
              </Button>
              <Button variant="outlined" onClick={() => showToast('Sending invoice to printer.', 'success')}>
                🖨 Print
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  setInvoicePreviewOpen(false);
                  goToView('payments');
                  openPaymentDialog(outstanding);
                }}
              >
                💳 Process Payment
              </Button>
            </Stack>
          </Stack>
        }
      />

      <CommonDialog
        open={refundDialogOpen}
        onClose={() => setRefundDialogOpen(false)}
        title="💸 Request Refund"
        maxWidth="sm"
        confirmLabel="📤 Submit Request"
        onConfirm={submitRefund}
        content={
          <Stack spacing={1.2}>
            <TextField
              select
              fullWidth
              size="small"
              label="Reason"
              value={refundDraft.reason}
              onChange={(event) => setRefundDraft((prev) => ({ ...prev, reason: event.target.value }))}
            >
              {['Duplicate Charge', 'Incorrect Billing', 'Service Not Rendered', 'Insurance Adjustment', 'Security Deposit Refund', 'Other'].map((reason) => (
                <MenuItem key={reason} value={reason}>
                  {reason}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Amount"
              value={refundDraft.amount}
              onChange={(event) =>
                setRefundDraft((prev) => ({
                  ...prev,
                  amount: Math.max(0, Number(event.target.value) || 0),
                }))
              }
            />
            <TextField
              fullWidth
              size="small"
              label="Reference"
              value={refundDraft.reference}
              onChange={(event) => setRefundDraft((prev) => ({ ...prev, reference: event.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              multiline
              minRows={3}
              label="Description"
              value={refundDraft.description}
              onChange={(event) => setRefundDraft((prev) => ({ ...prev, description: event.target.value }))}
            />
          </Stack>
        }
      />

      <CommonDialog
        open={preAuthDialogOpen}
        onClose={() => setPreAuthDialogOpen(false)}
        title="📋 New Pre-Authorization Request"
        maxWidth="sm"
        confirmLabel="📤 Submit to TPA"
        onConfirm={submitPreAuth}
        content={
          <Stack spacing={1.2}>
            <TextField
              fullWidth
              size="small"
              label="Service / Procedure"
              value={preAuthDraft.service}
              onChange={(event) => setPreAuthDraft((prev) => ({ ...prev, service: event.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Estimated Amount"
              value={preAuthDraft.amount}
              onChange={(event) =>
                setPreAuthDraft((prev) => ({
                  ...prev,
                  amount: Math.max(0, Number(event.target.value) || 0),
                }))
              }
            />
            <TextField
              fullWidth
              size="small"
              label="ICD-10 Diagnosis Code"
              value={preAuthDraft.diagnosisCode}
              onChange={(event) => setPreAuthDraft((prev) => ({ ...prev, diagnosisCode: event.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              label="Procedure Code"
              value={preAuthDraft.procedureCode}
              onChange={(event) => setPreAuthDraft((prev) => ({ ...prev, procedureCode: event.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              multiline
              minRows={3}
              label="Clinical Justification"
              value={preAuthDraft.justification}
              onChange={(event) => setPreAuthDraft((prev) => ({ ...prev, justification: event.target.value }))}
            />
          </Stack>
        }
      />

      <CommonDialog
        open={insuranceDialogOpen}
        onClose={() => setInsuranceDialogOpen(false)}
        title="🛡 Add / Update Insurance Details"
        maxWidth="sm"
        confirmLabel="✅ Save Insurance"
        onConfirm={saveInsuranceProfile}
        content={
          <Stack spacing={1.2}>
            <TextField
              fullWidth
              size="small"
              label="Insurance Company"
              value={insuranceDraft.provider}
              onChange={(event) => setInsuranceDraft((prev) => ({ ...prev, provider: event.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              label="Policy Number"
              value={insuranceDraft.policyNumber}
              onChange={(event) => setInsuranceDraft((prev) => ({ ...prev, policyNumber: event.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              label="TPA"
              value={insuranceDraft.tpa}
              onChange={(event) => setInsuranceDraft((prev) => ({ ...prev, tpa: event.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              label="Member ID"
              value={insuranceDraft.memberId}
              onChange={(event) => setInsuranceDraft((prev) => ({ ...prev, memberId: event.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Sum Insured"
              value={insuranceDraft.sumInsured}
              onChange={(event) =>
                setInsuranceDraft((prev) => ({
                  ...prev,
                  sumInsured: Math.max(0, Number(event.target.value) || 0),
                }))
              }
            />
          </Stack>
        }
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3200}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </PageTemplate>
  );
}
