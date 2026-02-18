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
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { Card } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import {
  LocalPharmacy as LocalPharmacyIcon,
  PointOfSale as PointOfSaleIcon,
  ReceiptLong as ReceiptLongIcon,
  Medication as MedicationIcon,
} from '@mui/icons-material';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { usePermission } from '@/src/core/auth/usePermission';
import { useOpdData } from '@/src/store/opdHooks';
import { IpdMetricCard } from '@/src/screens/ipd/components/ipd-ui';
import {
  IpdEncounterRecord,
  syncIpdEncounterClinical,
  syncIpdEncounterDischargeChecks,
  useIpdEncounters,
} from '@/src/screens/ipd/ipd-encounter-context';

type DispenseWorkflowTab = 'ipd' | 'opd' | 'retail';
type IpdRxStatus = 'Prescribed' | 'Dispensed' | 'Administered' | 'Stopped';
type OpdDispenseStatus = 'Pending' | 'Dispensed' | 'Collected' | 'Cancelled';
type PaymentMode = 'Cash' | 'Card' | 'UPI';
type BillingStatus = 'Pending' | 'Ready for Billing' | 'Cancelled';

interface IpdPrescriptionRow {
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

interface OpdPrescriptionRow {
  id: string;
  encounterId: string;
  patientId: string;
  medicationName: string;
  dose: string;
  frequency: string;
  durationDays: string;
  route: string;
  instructions: string;
  issuedAt: string;
}

interface OpdDispenseRecord {
  status: OpdDispenseStatus;
  updatedAt: string;
}

interface RetailItemDraft {
  medicineName: string;
  quantity: string;
  unitPrice: string;
}

interface RetailItemRow {
  id: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface RetailSaleRecord {
  id: string;
  customerName: string;
  mobile: string;
  paymentMode: PaymentMode;
  prescriptionReference: string;
  prescriptionVerified: boolean;
  items: RetailItemRow[];
  totalAmount: number;
  createdAt: string;
}

type IpdPrescriptionStore = Record<string, IpdPrescriptionRow[]>;
type OpdDispenseStore = Record<string, OpdDispenseRecord>;

interface BillingEntry {
  id: string;
  orderId: string;
  patientId: string;
  patientMrn: string;
  patientName: string;
  admissionId: string;
  encounterId: string;
  category: 'Medication';
  serviceCode: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  currency: 'INR';
  status: BillingStatus;
  orderedBy: string;
  orderedAt: string;
  statusUpdatedAt: string;
  statusUpdatedBy: string;
}

interface PersistedOrderBillingState {
  version: 1;
  ordersByPatient: Record<string, unknown>;
  billingByPatient: Record<string, BillingEntry[]>;
}

const WORKFLOW_TABS: Array<{ id: DispenseWorkflowTab; label: string }> = [
  { id: 'ipd', label: 'IPD Dispense' },
  { id: 'opd', label: 'OPD Dispense' },
  { id: 'retail', label: 'Walk-in Retail' },
];

const IPD_RX_STORAGE_KEY = 'scanbo.hims.ipd.prescriptions.module.v1';
const ORDER_BILLING_STORAGE_KEY = 'scanbo.hims.ipd.orders-billing.v1';
const OPD_DISPENSE_STORAGE_KEY = 'scanbo.hims.opd.pharmacy-dispense.v1';
const RETAIL_SALES_STORAGE_KEY = 'scanbo.hims.pharmacy.retail-sales.v1';

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function isWorkflowTab(value: string | null): value is DispenseWorkflowTab {
  return value === 'ipd' || value === 'opd' || value === 'retail';
}

function formatCurrency(value: number): string {
  return CURRENCY_FORMATTER.format(value);
}

function nowTimeStamp(): string {
  return new Date().toLocaleString();
}

function readIpdPrescriptionStore(): IpdPrescriptionStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(IPD_RX_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as IpdPrescriptionStore;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeIpdPrescriptionStore(store: IpdPrescriptionStore): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(IPD_RX_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // best effort persistence
  }
}

function readOpdDispenseStore(): OpdDispenseStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(OPD_DISPENSE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as OpdDispenseStore;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeOpdDispenseStore(store: OpdDispenseStore): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(OPD_DISPENSE_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // best effort persistence
  }
}

function readRetailSales(): RetailSaleRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.sessionStorage.getItem(RETAIL_SALES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RetailSaleRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRetailSales(records: RetailSaleRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(RETAIL_SALES_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // best effort persistence
  }
}

function readPersistedBillingByPatient(): Record<string, BillingEntry[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(ORDER_BILLING_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<PersistedOrderBillingState>;
    if (!parsed?.billingByPatient || typeof parsed.billingByPatient !== 'object') return {};
    return parsed.billingByPatient;
  } catch {
    return {};
  }
}

function isPendingIpdMedication(status: IpdRxStatus): boolean {
  return status === 'Prescribed' || status === 'Dispensed';
}

function mapIpdRxStatusToBillingStatus(status: IpdRxStatus): BillingStatus {
  if (status === 'Stopped') return 'Cancelled';
  if (status === 'Dispensed' || status === 'Administered') return 'Ready for Billing';
  return 'Pending';
}

function buildBillingId(patientId: string, rowId: string): string {
  const dischargePrefix = `dc-rx-${patientId}-`;
  if (rowId.startsWith(dischargePrefix)) {
    const sourceRowId = rowId.slice(dischargePrefix.length);
    return `bill-rx-discharge-${patientId}-${sourceRowId}`;
  }
  const roundsPrefix = `rounds-${patientId}-`;
  if (rowId.startsWith(roundsPrefix)) {
    const sourceRowId = rowId.slice(roundsPrefix.length);
    return `bill-rx-rounds-${patientId}-${sourceRowId}`;
  }
  return `bill-rx-ipd-${patientId}-${rowId}`;
}

function buildOrderId(patientId: string, rowId: string): string {
  const dischargePrefix = `dc-rx-${patientId}-`;
  if (rowId.startsWith(dischargePrefix)) {
    const sourceRowId = rowId.slice(dischargePrefix.length);
    return `rx-discharge-${patientId}-${sourceRowId}`;
  }
  const roundsPrefix = `rounds-${patientId}-`;
  if (rowId.startsWith(roundsPrefix)) {
    const sourceRowId = rowId.slice(roundsPrefix.length);
    return `rx-rounds-${patientId}-${sourceRowId}`;
  }
  return `rx-ipd-${rowId}`;
}

function parseMedicationServiceName(serviceName: string): { medicationName: string; dose: string } {
  const trimmed = serviceName.trim();
  const match = /^(.*)\s+\((.*)\)$/.exec(trimmed);
  if (!match) {
    return { medicationName: trimmed || 'Medication', dose: '--' };
  }
  return {
    medicationName: match[1]?.trim() || 'Medication',
    dose: match[2]?.trim() || '--',
  };
}

function isDischargeMedicationBillingEntry(entry: BillingEntry, patientId: string): boolean {
  const entryId = String(entry.id || '');
  const orderId = String(entry.orderId || '');
  return (
    entryId.startsWith(`bill-rx-discharge-${patientId}-`) ||
    orderId.startsWith(`rx-discharge-${patientId}-`) ||
    entry.serviceCode === 'MED-DC'
  );
}

function inferDischargeSourceRowId(patientId: string, entry: BillingEntry): string {
  const billingPrefix = `bill-rx-discharge-${patientId}-`;
  const orderPrefix = `rx-discharge-${patientId}-`;
  if (String(entry.id).startsWith(billingPrefix)) {
    return String(entry.id).slice(billingPrefix.length);
  }
  if (String(entry.orderId).startsWith(orderPrefix)) {
    return String(entry.orderId).slice(orderPrefix.length);
  }
  return String(entry.id || `discharge-${Date.now()}`);
}

function mapBillingStatusToIpdRxStatus(status: BillingStatus): IpdRxStatus {
  if (status === 'Cancelled') return 'Stopped';
  if (status === 'Ready for Billing') return 'Dispensed';
  return 'Prescribed';
}

function toIpdRowsFromDischargeBilling(patientId: string, entries: BillingEntry[]): IpdPrescriptionRow[] {
  return entries
    .filter((entry) => isDischargeMedicationBillingEntry(entry, patientId))
    .map((entry) => {
      const sourceRowId = inferDischargeSourceRowId(patientId, entry);
      const parsed = parseMedicationServiceName(entry.serviceName || '');
      return {
        id: `dc-rx-${patientId}-${sourceRowId}`,
        medicationName: parsed.medicationName,
        dose: parsed.dose,
        route: '--',
        frequency: '--',
        duration: '',
        notes: 'Synced from discharge medication billing',
        status: mapBillingStatusToIpdRxStatus(entry.status ?? 'Pending'),
        prescribedBy: entry.orderedBy || 'Discharge Team',
        updatedAt: entry.statusUpdatedAt || entry.orderedAt || nowTimeStamp(),
      };
    });
}

function syncIpdPrescriptionBillingLedger(
  encounters: IpdEncounterRecord[],
  prescriptionStore: IpdPrescriptionStore
): void {
  if (typeof window === 'undefined') return;

  try {
    const raw = window.sessionStorage.getItem(ORDER_BILLING_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    const ordersByPatient = parsed?.ordersByPatient;
    const existingBillingByPatient = (parsed?.billingByPatient ?? {}) as Record<string, BillingEntry[]>;
    const nextBillingByPatient: Record<string, BillingEntry[]> = { ...existingBillingByPatient };

    const encounterByPatientId = encounters.reduce<Record<string, IpdEncounterRecord>>((acc, encounter) => {
      acc[encounter.patientId] = encounter;
      return acc;
    }, {});

    Object.entries(prescriptionStore).forEach(([patientId, rows]) => {
      const encounter = encounterByPatientId[patientId];
      const existingRows = nextBillingByPatient[patientId] ?? [];
      const existingById = new Map(existingRows.map((row) => [row.id, row]));
      const preservedRows = existingRows.filter((row) => {
        const rowId = String(row.id);
        return (
          !rowId.startsWith(`bill-rx-ipd-${patientId}-`) &&
          !rowId.startsWith(`bill-rx-rounds-${patientId}-`) &&
          !rowId.startsWith(`bill-rx-discharge-${patientId}-`)
        );
      });

      const syncedRows: BillingEntry[] = rows.map((row) => {
        const billingId = buildBillingId(patientId, row.id);
        const existing = existingById.get(billingId);
        const quantity = Number.isFinite(existing?.quantity) ? Number(existing?.quantity) : 1;
        const unitPrice = Number.isFinite(existing?.unitPrice) ? Number(existing?.unitPrice) : 300;
        const amount = Number.isFinite(existing?.amount) ? Number(existing?.amount) : quantity * unitPrice;

        return {
          id: billingId,
          orderId: buildOrderId(patientId, row.id),
          patientId,
          patientMrn: encounter?.mrn ?? existing?.patientMrn ?? '',
          patientName: encounter?.patientName ?? existing?.patientName ?? '',
          admissionId: encounter?.admissionId ?? existing?.admissionId ?? `adm-${patientId}`,
          encounterId: encounter?.encounterId ?? existing?.encounterId ?? `enc-${patientId}`,
          category: 'Medication',
          serviceCode: existing?.serviceCode ?? 'MED-IPD',
          serviceName: `${row.medicationName} (${row.dose})`,
          quantity,
          unitPrice,
          amount,
          currency: 'INR',
          status: mapIpdRxStatusToBillingStatus(row.status),
          orderedBy: existing?.orderedBy ?? row.prescribedBy,
          orderedAt: existing?.orderedAt ?? row.updatedAt,
          statusUpdatedAt: row.updatedAt,
          statusUpdatedBy: 'Pharmacy',
        };
      });

      nextBillingByPatient[patientId] = [...syncedRows, ...preservedRows];
    });

    window.sessionStorage.setItem(
      ORDER_BILLING_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        ordersByPatient: ordersByPatient && typeof ordersByPatient === 'object' ? ordersByPatient : {},
        billingByPatient: nextBillingByPatient,
      })
    );
  } catch {
    // best effort sync only
  }
}

function opdStatusChipColor(status: OpdDispenseStatus): 'warning' | 'info' | 'success' | 'default' {
  if (status === 'Pending') return 'warning';
  if (status === 'Dispensed') return 'info';
  if (status === 'Collected') return 'success';
  return 'default';
}

export default function PharmacyDispensePage() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mrnParam = useMrnParam();
  const permissionGate = usePermission();
  const canDispense = permissionGate('pharmacy.dispense.write');

  const ipdEncounters = useIpdEncounters();
  const opdData = useOpdData();

  const [activeTab, setActiveTab] = React.useState<DispenseWorkflowTab>('ipd');
  const [selectedIpdPatientId, setSelectedIpdPatientId] = React.useState('');
  const [selectedOpdEncounterId, setSelectedOpdEncounterId] = React.useState('');
  const [ipdRxStore, setIpdRxStore] = React.useState<IpdPrescriptionStore>(() =>
    readIpdPrescriptionStore()
  );
  const [persistedBillingByPatient, setPersistedBillingByPatient] = React.useState<
    Record<string, BillingEntry[]>
  >(() => readPersistedBillingByPatient());
  const [opdDispenseStore, setOpdDispenseStore] = React.useState<OpdDispenseStore>(() =>
    readOpdDispenseStore()
  );

  const [retailCustomerName, setRetailCustomerName] = React.useState('');
  const [retailCustomerMobile, setRetailCustomerMobile] = React.useState('');
  const [retailPrescriptionRef, setRetailPrescriptionRef] = React.useState('');
  const [retailPrescriptionVerified, setRetailPrescriptionVerified] = React.useState(false);
  const [retailPaymentMode, setRetailPaymentMode] = React.useState<PaymentMode>('Cash');
  const [retailItemDraft, setRetailItemDraft] = React.useState<RetailItemDraft>({
    medicineName: '',
    quantity: '',
    unitPrice: '',
  });
  const [retailCart, setRetailCart] = React.useState<RetailItemRow[]>([]);
  const [retailSales, setRetailSales] = React.useState<RetailSaleRecord[]>(() => readRetailSales());

  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  React.useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (!isWorkflowTab(tabParam)) return;
    setActiveTab((current) => (current === tabParam ? current : tabParam));
  }, [searchParams]);

  React.useEffect(() => {
    writeIpdPrescriptionStore(ipdRxStore);
  }, [ipdRxStore]);

  React.useEffect(() => {
    const refreshIpdPrescriptionStore = () => {
      const latestStore = readIpdPrescriptionStore();
      setIpdRxStore((currentStore) =>
        JSON.stringify(currentStore) === JSON.stringify(latestStore) ? currentStore : latestStore
      );
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshIpdPrescriptionStore();
      }
    };

    const onStorageChange = (event: StorageEvent) => {
      if (event.key === IPD_RX_STORAGE_KEY) {
        refreshIpdPrescriptionStore();
      }
    };

    refreshIpdPrescriptionStore();
    window.addEventListener('focus', refreshIpdPrescriptionStore);
    window.addEventListener('storage', onStorageChange);
    document.addEventListener('visibilitychange', onVisibilityChange);
    const intervalId = window.setInterval(refreshIpdPrescriptionStore, 5000);

    return () => {
      window.removeEventListener('focus', refreshIpdPrescriptionStore);
      window.removeEventListener('storage', onStorageChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, []);

  React.useEffect(() => {
    writeOpdDispenseStore(opdDispenseStore);
  }, [opdDispenseStore]);

  React.useEffect(() => {
    writeRetailSales(retailSales);
  }, [retailSales]);

  React.useEffect(() => {
    const refreshBillingLedger = () => {
      setPersistedBillingByPatient(readPersistedBillingByPatient());
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
    syncIpdPrescriptionBillingLedger(ipdEncounters, ipdRxStore);
  }, [ipdEncounters, ipdRxStore]);

  const activeIpdEncounters = React.useMemo(
    () =>
      ipdEncounters
        .filter((record) => record.workflowStatus !== 'discharged')
        .sort((a, b) => a.patientName.localeCompare(b.patientName)),
    [ipdEncounters]
  );

  React.useEffect(() => {
    setIpdRxStore((previous) => {
      let changed = false;
      const next: IpdPrescriptionStore = { ...previous };

      activeIpdEncounters.forEach((encounter) => {
        const patientId = encounter.patientId;
        const existingRows = previous[patientId] ?? [];
        const existingById = new Set(existingRows.map((row) => row.id));
        const dischargeRows = toIpdRowsFromDischargeBilling(
          patientId,
          persistedBillingByPatient[patientId] ?? []
        ).filter((row) => !existingById.has(row.id));

        if (dischargeRows.length > 0) {
          next[patientId] = [...existingRows, ...dischargeRows];
          changed = true;
        }
      });

      return changed ? next : previous;
    });
  }, [activeIpdEncounters, persistedBillingByPatient]);

  const ipdEncounterFromMrn = React.useMemo(
    () =>
      mrnParam ? activeIpdEncounters.find((record) => record.mrn === mrnParam) ?? null : null,
    [activeIpdEncounters, mrnParam]
  );

  React.useEffect(() => {
    if (ipdEncounterFromMrn) {
      setSelectedIpdPatientId(ipdEncounterFromMrn.patientId);
      return;
    }
    if (!selectedIpdPatientId && activeIpdEncounters[0]) {
      setSelectedIpdPatientId(activeIpdEncounters[0].patientId);
    }
  }, [activeIpdEncounters, ipdEncounterFromMrn, selectedIpdPatientId]);

  const selectedIpdEncounter =
    activeIpdEncounters.find((record) => record.patientId === selectedIpdPatientId) ??
    ipdEncounterFromMrn ??
    activeIpdEncounters[0] ??
    null;

  const selectedIpdRows = selectedIpdEncounter ? ipdRxStore[selectedIpdEncounter.patientId] ?? [] : [];
  const ipdPendingCount = selectedIpdRows.filter((row) => isPendingIpdMedication(row.status)).length;
  const ipdDispensedCount = selectedIpdRows.filter((row) => row.status === 'Dispensed').length;
  const ipdAdministeredCount = selectedIpdRows.filter((row) => row.status === 'Administered').length;
  const ipdPharmacyReady = selectedIpdRows.length > 0 && ipdPendingCount === 0;

  React.useEffect(() => {
    if (!selectedIpdEncounter) return;
    syncIpdEncounterClinical(selectedIpdEncounter.patientId, {
      pendingMedications: ipdPendingCount,
    });
    syncIpdEncounterDischargeChecks(selectedIpdEncounter.patientId, {
      pharmacyCleared: ipdPharmacyReady,
    });
  }, [ipdPendingCount, ipdPharmacyReady, selectedIpdEncounter]);

  const opdEncounterRows = React.useMemo(
    () => opdData.encounters.filter((row) => row.status !== 'COMPLETED' && row.status !== 'CANCELLED'),
    [opdData.encounters]
  );

  const opdPrescriptionsByEncounter = React.useMemo(() => {
    const grouped: Record<string, OpdPrescriptionRow[]> = {};
    opdData.prescriptions.forEach((row) => {
      if (!grouped[row.encounterId]) grouped[row.encounterId] = [];
      grouped[row.encounterId].push(row as OpdPrescriptionRow);
    });
    return grouped;
  }, [opdData.prescriptions]);

  const opdEncounterFromMrn = React.useMemo(() => {
    if (!mrnParam) return null;
    return opdEncounterRows.find((row) => row.mrn === mrnParam) ?? null;
  }, [mrnParam, opdEncounterRows]);

  React.useEffect(() => {
    if (opdEncounterFromMrn) {
      setSelectedOpdEncounterId(opdEncounterFromMrn.id);
      return;
    }
    if (!selectedOpdEncounterId && opdEncounterRows[0]) {
      setSelectedOpdEncounterId(opdEncounterRows[0].id);
    }
  }, [opdEncounterFromMrn, opdEncounterRows, selectedOpdEncounterId]);

  const selectedOpdEncounter =
    opdEncounterRows.find((row) => row.id === selectedOpdEncounterId) ??
    opdEncounterFromMrn ??
    opdEncounterRows[0] ??
    null;

  const selectedOpdRows = selectedOpdEncounter
    ? opdPrescriptionsByEncounter[selectedOpdEncounter.id] ?? []
    : [];

  const opdPendingCount = selectedOpdRows.filter(
    (row) => (opdDispenseStore[row.id]?.status ?? 'Pending') === 'Pending'
  ).length;
  const opdDispensedCount = selectedOpdRows.filter(
    (row) => (opdDispenseStore[row.id]?.status ?? 'Pending') === 'Dispensed'
  ).length;
  const opdCollectedCount = selectedOpdRows.filter(
    (row) => (opdDispenseStore[row.id]?.status ?? 'Pending') === 'Collected'
  ).length;

  const retailCartTotal = retailCart.reduce((sum, item) => sum + item.amount, 0);

  const pageSubtitle =
    activeTab === 'ipd' && selectedIpdEncounter
      ? formatPatientLabel(selectedIpdEncounter.patientName, selectedIpdEncounter.mrn)
      : activeTab === 'opd' && selectedOpdEncounter
      ? formatPatientLabel(selectedOpdEncounter.patientName, selectedOpdEncounter.mrn)
      : 'IPD / OPD / Walk-in retail dispensing';

  const switchTab = (nextTab: DispenseWorkflowTab) => {
    setActiveTab(nextTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', nextTab);
    if (mrnParam) params.set('mrn', mrnParam);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const notify = (message: string, severity: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const updateIpdMedicationStatus = (rowId: string, status: IpdRxStatus) => {
    if (!selectedIpdEncounter || !canDispense) return;
    setIpdRxStore((previous) => ({
      ...previous,
      [selectedIpdEncounter.patientId]: (previous[selectedIpdEncounter.patientId] ?? []).map((row) =>
        row.id === rowId
          ? {
              ...row,
              status,
              updatedAt: nowTimeStamp(),
            }
          : row
      ),
    }));
    notify(`IPD medication marked as ${status}.`, 'info');
  };

  const updateOpdDispenseStatus = (prescriptionId: string, status: OpdDispenseStatus) => {
    if (!canDispense) return;
    setOpdDispenseStore((previous) => ({
      ...previous,
      [prescriptionId]: {
        status,
        updatedAt: nowTimeStamp(),
      },
    }));
    notify(`OPD prescription marked as ${status}.`, 'info');
  };

  const addRetailItem = () => {
    if (!retailItemDraft.medicineName.trim()) {
      notify('Medicine name is required.', 'error');
      return;
    }
    const quantity = Number(retailItemDraft.quantity);
    const unitPrice = Number(retailItemDraft.unitPrice);
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice <= 0) {
      notify('Quantity and unit price must be valid positive numbers.', 'error');
      return;
    }
    const nextItem: RetailItemRow = {
      id: `retail-item-${Date.now()}`,
      medicineName: retailItemDraft.medicineName.trim(),
      quantity,
      unitPrice,
      amount: quantity * unitPrice,
    };
    setRetailCart((previous) => [...previous, nextItem]);
    setRetailItemDraft({ medicineName: '', quantity: '', unitPrice: '' });
  };

  const removeRetailItem = (itemId: string) => {
    setRetailCart((previous) => previous.filter((item) => item.id !== itemId));
  };

  const checkoutRetailSale = () => {
    if (!canDispense) return;
    if (!retailCustomerName.trim()) {
      notify('Customer name is required for checkout.', 'error');
      return;
    }
    if (retailCart.length === 0) {
      notify('Add at least one medicine item before checkout.', 'error');
      return;
    }
    const sale: RetailSaleRecord = {
      id: `POS-${Date.now().toString().slice(-6)}`,
      customerName: retailCustomerName.trim(),
      mobile: retailCustomerMobile.trim(),
      paymentMode: retailPaymentMode,
      prescriptionReference: retailPrescriptionRef.trim(),
      prescriptionVerified: retailPrescriptionVerified,
      items: retailCart,
      totalAmount: retailCartTotal,
      createdAt: nowTimeStamp(),
    };
    setRetailSales((previous) => [sale, ...previous].slice(0, 40));
    setRetailCustomerName('');
    setRetailCustomerMobile('');
    setRetailPrescriptionRef('');
    setRetailPrescriptionVerified(false);
    setRetailPaymentMode('Cash');
    setRetailCart([]);
    notify(`Retail sale ${sale.id} completed for ${formatCurrency(sale.totalAmount)}.`, 'success');
  };

  const compactBtnSx = {
    minWidth: 0,
    px: 1.35,
    py: 0.45,
    borderRadius: 1.1,
    textTransform: 'none',
    fontWeight: 600,
  };

  return (
    <PageTemplate title="Pharmacy Dispense" subtitle={pageSubtitle} currentPageTitle="Dispense">
      <Stack spacing={2}>
        {!canDispense ? (
          <Alert severity="info">
            You are in read-only mode for dispense operations. Request `pharmacy.dispense.write` access.
          </Alert>
        ) : null}

        <Card
          elevation={0}
          sx={{
            borderRadius: 2.4,
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.16),
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              px: { xs: 1.3, md: 1.8 },
              py: 1.1,
              borderBottom: '1px solid',
              borderColor: 'divider',
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={1}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
                Unified Pharmacy Workflow
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip size="small" label="IPD linked" color="info" />
                <Chip size="small" label="OPD linked" color="success" />
                <Chip size="small" label="Walk-in POS" color="warning" />
              </Stack>
            </Stack>
          </Box>

          <Box sx={{ px: { xs: 1, md: 1.6 } }}>
            <Tabs
              value={activeTab}
              onChange={(_, value: DispenseWorkflowTab) => switchTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 42,
                '& .MuiTabs-indicator': { height: 3 },
                '& .MuiTab-root': {
                  minHeight: 42,
                  textTransform: 'none',
                  fontWeight: 700,
                },
              }}
            >
              {WORKFLOW_TABS.map((tab) => (
                <Tab key={tab.id} value={tab.id} label={tab.label} />
              ))}
            </Tabs>
          </Box>
        </Card>

        {activeTab === 'ipd' ? (
          <Stack spacing={2}>
            <Grid container spacing={1.3}>
              <Grid item xs={12} sm={6} lg={3}>
                <IpdMetricCard
                  label="Pending IPD Medications"
                  value={ipdPendingCount}
                  tone="warning"
                  icon={<MedicationIcon sx={{ fontSize: 22 }} />}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <IpdMetricCard
                  label="Dispensed"
                  value={ipdDispensedCount}
                  tone="info"
                  icon={<LocalPharmacyIcon sx={{ fontSize: 22 }} />}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <IpdMetricCard
                  label="Administered"
                  value={ipdAdministeredCount}
                  tone="success"
                  icon={<ReceiptLongIcon sx={{ fontSize: 22 }} />}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <IpdMetricCard
                  label="Pharmacy Clearance"
                  value={ipdPharmacyReady ? 'Ready' : 'Pending'}
                  tone={ipdPharmacyReady ? 'success' : 'danger'}
                  icon={<LocalPharmacyIcon sx={{ fontSize: 22 }} />}
                />
              </Grid>
            </Grid>

            <Card
              elevation={0}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.2, p: 1.2 }}
            >
              {selectedIpdEncounter ? (
                <Stack spacing={1.2}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={1}
                    justifyContent="space-between"
                    alignItems={{ xs: 'stretch', md: 'center' }}
                  >
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <TextField
                        select
                        size="small"
                        label="IPD Patient"
                        value={selectedIpdEncounter.patientId}
                        onChange={(event) => setSelectedIpdPatientId(event.target.value)}
                        sx={{ minWidth: 300 }}
                      >
                        {activeIpdEncounters.map((row) => (
                          <MenuItem key={row.patientId} value={row.patientId}>
                            {row.patientName} ({row.mrn}) · {row.bed || '--'}
                          </MenuItem>
                        ))}
                      </TextField>
                      <Chip size="small" label={`Ward: ${selectedIpdEncounter.ward || '--'}`} variant="outlined" />
                      <Chip size="small" label={`Bed: ${selectedIpdEncounter.bed || '--'}`} variant="outlined" />
                    </Stack>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        router.push(
                          `/ipd/charges?tab=drug${selectedIpdEncounter.mrn ? `&mrn=${selectedIpdEncounter.mrn}` : ''}`
                        )
                      }
                    >
                      Open IPD Drug Panel
                    </Button>
                  </Stack>

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Medication</TableCell>
                          <TableCell>Dose / Route</TableCell>
                          <TableCell>Frequency</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedIpdRows.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} sx={{ textAlign: 'center', py: 2.4, color: 'text.secondary' }}>
                              No IPD prescription rows found for this patient.
                            </TableCell>
                          </TableRow>
                        ) : (
                          selectedIpdRows.map((row) => (
                            <TableRow key={row.id} hover>
                              <TableCell sx={{ minWidth: 220 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {row.medicationName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {row.prescribedBy} · {row.updatedAt}
                                </Typography>
                              </TableCell>
                              <TableCell>{`${row.dose} / ${row.route}`}</TableCell>
                              <TableCell>{row.duration ? `${row.frequency} · ${row.duration}` : row.frequency}</TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  color={
                                    row.status === 'Administered'
                                      ? 'success'
                                      : row.status === 'Dispensed'
                                      ? 'info'
                                      : row.status === 'Stopped'
                                      ? 'default'
                                      : 'warning'
                                  }
                                  label={row.status}
                                />
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" spacing={0.7}>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    sx={compactBtnSx}
                                    disabled={!canDispense || row.status === 'Dispensed' || row.status === 'Administered'}
                                    onClick={() => updateIpdMedicationStatus(row.id, 'Dispensed')}
                                  >
                                    Dispense
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    sx={compactBtnSx}
                                    disabled={!canDispense || row.status === 'Administered'}
                                    onClick={() => updateIpdMedicationStatus(row.id, 'Administered')}
                                  >
                                    Given
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="text"
                                    sx={compactBtnSx}
                                    disabled={!canDispense || row.status === 'Stopped'}
                                    onClick={() => updateIpdMedicationStatus(row.id, 'Stopped')}
                                  >
                                    Stop
                                  </Button>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Stack>
              ) : (
                <Alert severity="info">No active IPD encounters available.</Alert>
              )}
            </Card>
          </Stack>
        ) : null}

        {activeTab === 'opd' ? (
          <Stack spacing={2}>
            {opdData.status === 'loading' ? <Alert severity="info">Loading OPD records…</Alert> : null}
            {opdData.status === 'error' ? (
              <Alert severity="warning">
                OPD server unavailable. Showing local fallback data. {opdData.error ?? ''}
              </Alert>
            ) : null}

            <Grid container spacing={1.3}>
              <Grid item xs={12} sm={4}>
                <IpdMetricCard label="Pending OPD Rx" value={opdPendingCount} tone="warning" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <IpdMetricCard label="Dispensed" value={opdDispensedCount} tone="info" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <IpdMetricCard label="Collected" value={opdCollectedCount} tone="success" />
              </Grid>
            </Grid>

            <Card
              elevation={0}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.2, p: 1.2 }}
            >
              <Stack spacing={1.2}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1}
                  justifyContent="space-between"
                  alignItems={{ xs: 'stretch', md: 'center' }}
                >
                  <TextField
                    select
                    size="small"
                    label="OPD Encounter"
                    value={selectedOpdEncounter?.id ?? ''}
                    onChange={(event) => setSelectedOpdEncounterId(event.target.value)}
                    sx={{ minWidth: 320 }}
                  >
                    {opdEncounterRows.map((encounter) => (
                      <MenuItem key={encounter.id} value={encounter.id}>
                        {encounter.patientName} ({encounter.mrn}) · {encounter.doctor}
                      </MenuItem>
                    ))}
                  </TextField>
                  {selectedOpdEncounter ? (
                    <Chip
                      size="small"
                      label={`${selectedOpdEncounter.department} · ${selectedOpdEncounter.status}`}
                      variant="outlined"
                    />
                  ) : null}
                </Stack>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Medication</TableCell>
                        <TableCell>Dose / Route</TableCell>
                        <TableCell>Frequency</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOpdRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} sx={{ textAlign: 'center', py: 2.4, color: 'text.secondary' }}>
                            No OPD prescriptions available for this encounter.
                          </TableCell>
                        </TableRow>
                      ) : (
                        selectedOpdRows.map((row) => {
                          const dispenseState = opdDispenseStore[row.id]?.status ?? 'Pending';
                          return (
                            <TableRow key={row.id} hover>
                              <TableCell sx={{ minWidth: 220 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {row.medicationName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Issued: {row.issuedAt}
                                </Typography>
                              </TableCell>
                              <TableCell>{`${row.dose} / ${row.route}`}</TableCell>
                              <TableCell>
                                {row.durationDays ? `${row.frequency} · ${row.durationDays} days` : row.frequency}
                              </TableCell>
                              <TableCell>
                                <Chip size="small" color={opdStatusChipColor(dispenseState)} label={dispenseState} />
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" spacing={0.7}>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    sx={compactBtnSx}
                                    disabled={!canDispense || dispenseState === 'Dispensed' || dispenseState === 'Collected'}
                                    onClick={() => updateOpdDispenseStatus(row.id, 'Dispensed')}
                                  >
                                    Dispense
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    sx={compactBtnSx}
                                    disabled={!canDispense || dispenseState === 'Collected'}
                                    onClick={() => updateOpdDispenseStatus(row.id, 'Collected')}
                                  >
                                    Collect
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="text"
                                    sx={compactBtnSx}
                                    disabled={!canDispense || dispenseState === 'Cancelled'}
                                    onClick={() => updateOpdDispenseStatus(row.id, 'Cancelled')}
                                  >
                                    Cancel
                                  </Button>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Stack>
            </Card>
          </Stack>
        ) : null}

        {activeTab === 'retail' ? (
          <Stack spacing={2}>
            <Grid container spacing={1.3}>
              <Grid item xs={12} sm={6} md={4}>
                <IpdMetricCard
                  label="Cart Items"
                  value={retailCart.length}
                  tone="info"
                  icon={<PointOfSaleIcon sx={{ fontSize: 22 }} />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <IpdMetricCard label="Cart Total" value={formatCurrency(retailCartTotal)} tone="success" />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <IpdMetricCard label="Recent POS Bills" value={retailSales.length} tone="primary" />
              </Grid>
            </Grid>

            <Grid container spacing={1.2}>
              <Grid item xs={12} lg={7}>
                <Card
                  elevation={0}
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.2, p: 1.2 }}
                >
                  <Stack spacing={1.2}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      Walk-in Customer Sale
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Customer Name"
                          value={retailCustomerName}
                          onChange={(event) => setRetailCustomerName(event.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Mobile"
                          value={retailCustomerMobile}
                          onChange={(event) => setRetailCustomerMobile(event.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Prescription Ref (optional)"
                          value={retailPrescriptionRef}
                          onChange={(event) => setRetailPrescriptionRef(event.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          size="small"
                          select
                          label="Payment"
                          value={retailPaymentMode}
                          onChange={(event) => setRetailPaymentMode(event.target.value as PaymentMode)}
                        >
                          {(['Cash', 'Card', 'UPI'] as PaymentMode[]).map((mode) => (
                            <MenuItem key={mode} value={mode}>
                              {mode}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>

                    <Stack direction="row" spacing={0.8}>
                      <Chip
                        size="small"
                        color={retailPrescriptionVerified ? 'success' : 'warning'}
                        label={retailPrescriptionVerified ? 'Prescription Verified' : 'Prescription Unverified'}
                        onClick={() => setRetailPrescriptionVerified((previous) => !previous)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </Stack>

                    <Divider />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Add Item
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={12} md={5}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Medicine"
                          value={retailItemDraft.medicineName}
                          onChange={(event) =>
                            setRetailItemDraft((previous) => ({ ...previous, medicineName: event.target.value }))
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Qty"
                          value={retailItemDraft.quantity}
                          onChange={(event) =>
                            setRetailItemDraft((previous) => ({ ...previous, quantity: event.target.value }))
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Unit Price"
                          value={retailItemDraft.unitPrice}
                          onChange={(event) =>
                            setRetailItemDraft((previous) => ({ ...previous, unitPrice: event.target.value }))
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={1}>
                        <Button
                          size="small"
                          variant="contained"
                          disabled={!canDispense}
                          onClick={addRetailItem}
                          sx={{ minWidth: '100%', height: 40 }}
                        >
                          +
                        </Button>
                      </Grid>
                    </Grid>
                  </Stack>
                </Card>
              </Grid>

              <Grid item xs={12} lg={5}>
                <Card
                  elevation={0}
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.2, p: 1.2 }}
                >
                  <Stack spacing={1.2}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      Cart & Checkout
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Item</TableCell>
                            <TableCell>Qty</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {retailCart.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                                Cart is empty.
                              </TableCell>
                            </TableRow>
                          ) : (
                            retailCart.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.medicineName}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>{formatCurrency(item.amount)}</TableCell>
                                <TableCell align="right">
                                  <Button
                                    size="small"
                                    variant="text"
                                    color="error"
                                    disabled={!canDispense}
                                    onClick={() => removeRetailItem(item.id)}
                                  >
                                    Remove
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Total
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        {formatCurrency(retailCartTotal)}
                      </Typography>
                    </Stack>
                    <Button variant="contained" disabled={!canDispense} onClick={checkoutRetailSale}>
                      Complete Checkout
                    </Button>
                  </Stack>
                </Card>
              </Grid>
            </Grid>

            <Card
              elevation={0}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.2, p: 1.2 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                Recent Walk-in Sales
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Bill</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Items</TableCell>
                      <TableCell>Payment</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {retailSales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                          No retail bills yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      retailSales.slice(0, 8).map((sale) => (
                        <TableRow key={sale.id} hover>
                          <TableCell sx={{ fontWeight: 700 }}>{sale.id}</TableCell>
                          <TableCell>
                            <Typography variant="body2">{sale.customerName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {sale.mobile || '--'}
                            </Typography>
                          </TableCell>
                          <TableCell>{sale.items.length}</TableCell>
                          <TableCell>{sale.paymentMode}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>{formatCurrency(sale.totalAmount)}</TableCell>
                          <TableCell>{sale.createdAt}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Stack>
        ) : null}
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2400}
        onClose={() => setSnackbar((previous) => ({ ...previous, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((previous) => ({ ...previous, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageTemplate>
  );
}
