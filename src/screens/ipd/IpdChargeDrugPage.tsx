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
} from '@/src/ui/components/atoms';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { Card } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import {
  AccountBalanceWallet as AccountBalanceWalletIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  LocalAtm as LocalAtmIcon,
  Medication as MedicationIcon,
  ReceiptLong as ReceiptLongIcon,
  Science as ScienceIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { getPatientByMrn } from '@/src/mocks/global-patients';
import { usePermission } from '@/src/core/auth/usePermission';
import { useUser } from '@/src/core/auth/UserContext';
import { canAccessRoute } from '@/src/core/navigation/route-access';
import { IpdMetricCard } from './components/ipd-ui';
import IpdModuleTabs from './components/IpdModuleTabs';
import {
  IpdEncounterRecord,
  syncIpdEncounterDischargeChecks,
  useIpdEncounters,
} from './ipd-encounter-context';

type ChargeDrugTab = 'charges' | 'drug';
type ChargeStatus = 'Posted' | 'Pending' | 'Scheduled' | 'Cancelled';
type ClinicalBillingStatus = 'Pending' | 'Ready for Billing' | 'Cancelled';
type InteractionSeverity = 'Low' | 'Moderate' | 'High';
type MedicationState = 'Due' | 'Active' | 'Given' | 'Stopped';
type MedicationSlot = 'morning' | 'afternoon' | 'night';
type IpdRxStatus = 'Prescribed' | 'Dispensed' | 'Administered' | 'Stopped';

interface ChargeRow {
  id: string;
  category: string;
  description: string;
  code: string;
  amount: number;
  status: ChargeStatus;
}

interface DrgSummary {
  drgCode: string;
  drgLabel: string;
  principalDx: string;
  secondaryDx: string;
  principalProcedure: string;
  drgWeight: string;
  expectedLos: string;
  expectedReimbursement: number;
}

interface MedicationAdminRow {
  id: string;
  medication: string;
  dose: string;
  route: string;
  frequency: string;
  state: MedicationState;
  given: Record<MedicationSlot, boolean>;
}

interface DrugInteractionRow {
  id: string;
  drugA: string;
  drugB: string;
  severity: InteractionSeverity;
  effect: string;
  action: string;
}

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

const CHARGE_DRUG_TABS = [
  { id: 'charges', label: 'Charge Capture & DRG' },
  { id: 'drug', label: 'Drug Safety / MAR' },
] as const;

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});
const ORDER_BILLING_STORAGE_KEY = 'scanbo.hims.ipd.orders-billing.v1';
const IPD_RX_STORAGE_KEY = 'scanbo.hims.ipd.prescriptions.module.v1';

const ALLERGY_BY_PATIENT_ID: Record<string, string> = {
  'ipd-1': 'Penicillin',
  'ipd-2': 'No known drug allergies',
  'ipd-3': 'Aspirin sensitivity',
  'ipd-4': 'Sulfa drugs',
};

const CHARGE_ROWS_BY_PATIENT_ID: Record<string, ChargeRow[]> = {
  'ipd-1': [
    {
      id: 'ipd-1-charge-1',
      category: 'Room & Board',
      description: 'High dependency bed utilization (Day 1-3)',
      code: 'IPD-RB-003',
      amount: 22000,
      status: 'Posted',
    },
    {
      id: 'ipd-1-charge-2',
      category: 'Procedure',
      description: 'Bronchodilator nebulization bundle',
      code: 'PROC-NEB-01',
      amount: 3800,
      status: 'Posted',
    },
    {
      id: 'ipd-1-charge-3',
      category: 'Lab',
      description: 'CBC, CRP, ABG repeat panel',
      code: 'LAB-CBC-CRP',
      amount: 2750,
      status: 'Pending',
    },
    {
      id: 'ipd-1-charge-4',
      category: 'Pharmacy',
      description: 'IV antibiotics and analgesics',
      code: 'RX-IPD-119',
      amount: 4600,
      status: 'Pending',
    },
    {
      id: 'ipd-1-charge-5',
      category: 'Consult',
      description: 'Pulmonology specialist consult',
      code: 'CONS-PULM',
      amount: 1700,
      status: 'Posted',
    },
    {
      id: 'ipd-1-charge-6',
      category: 'Radiology',
      description: 'Follow-up chest X-ray',
      code: 'IMG-CXR',
      amount: 900,
      status: 'Scheduled',
    },
  ],
  'ipd-2': [
    {
      id: 'ipd-2-charge-1',
      category: 'Room & Board',
      description: 'General ward bed (Post-op)',
      code: 'IPD-RB-002',
      amount: 12000,
      status: 'Posted',
    },
    {
      id: 'ipd-2-charge-2',
      category: 'Procedure',
      description: 'Post-operative dressing and drain care',
      code: 'PROC-POSTOP',
      amount: 3200,
      status: 'Posted',
    },
    {
      id: 'ipd-2-charge-3',
      category: 'Pharmacy',
      description: 'IV antibiotics and GI prophylaxis',
      code: 'RX-POSTOP-77',
      amount: 2600,
      status: 'Pending',
    },
    {
      id: 'ipd-2-charge-4',
      category: 'Lab',
      description: 'Post-op CBC and electrolytes',
      code: 'LAB-POSTOP',
      amount: 1450,
      status: 'Posted',
    },
  ],
  'ipd-3': [
    {
      id: 'ipd-3-charge-1',
      category: 'Room & Board',
      description: 'Cardiac ICU bed utilization',
      code: 'ICU-RB-011',
      amount: 48000,
      status: 'Posted',
    },
    {
      id: 'ipd-3-charge-2',
      category: 'Procedure',
      description: 'STEMI protocol thrombolysis',
      code: 'CARD-THROMB',
      amount: 45000,
      status: 'Posted',
    },
    {
      id: 'ipd-3-charge-3',
      category: 'Lab',
      description: 'Serial troponin and coagulation panel',
      code: 'LAB-TROP',
      amount: 7600,
      status: 'Pending',
    },
    {
      id: 'ipd-3-charge-4',
      category: 'Pharmacy',
      description: 'Heparin infusion and antiplatelet therapy',
      code: 'RX-CARD-33',
      amount: 6400,
      status: 'Pending',
    },
    {
      id: 'ipd-3-charge-5',
      category: 'Consult',
      description: 'Cardiology and diabetology consults',
      code: 'CONS-DUAL',
      amount: 4300,
      status: 'Posted',
    },
  ],
  'ipd-4': [
    {
      id: 'ipd-4-charge-1',
      category: 'Room & Board',
      description: 'General ward bed utilization',
      code: 'IPD-RB-001',
      amount: 10800,
      status: 'Posted',
    },
    {
      id: 'ipd-4-charge-2',
      category: 'Nursing',
      description: 'Glucose monitoring and diabetes counseling',
      code: 'NUR-DM-01',
      amount: 1900,
      status: 'Pending',
    },
    {
      id: 'ipd-4-charge-3',
      category: 'Pharmacy',
      description: 'Insulin correction doses',
      code: 'RX-INS-12',
      amount: 1550,
      status: 'Pending',
    },
  ],
};

const DRG_SUMMARY_BY_PATIENT_ID: Record<string, DrgSummary> = {
  'ipd-1': {
    drgCode: 'DRG 193',
    drgLabel: 'Simple pneumonia with complications',
    principalDx: 'J18.9',
    secondaryDx: 'E11.9, I10',
    principalProcedure: 'Nebulization support',
    drgWeight: '1.7342',
    expectedLos: '4.2 days',
    expectedReimbursement: 124000,
  },
  'ipd-2': {
    drgCode: 'DRG 343',
    drgLabel: 'Appendectomy without severe CC/MCC',
    principalDx: 'K35.8',
    secondaryDx: 'R10.31',
    principalProcedure: 'Appendicectomy',
    drgWeight: '1.2861',
    expectedLos: '3.1 days',
    expectedReimbursement: 98000,
  },
  'ipd-3': {
    drgCode: 'DRG 282',
    drgLabel: 'Acute myocardial infarction with MCC',
    principalDx: 'I21.09',
    secondaryDx: 'E11.9, I10, E78.5',
    principalProcedure: 'Thrombolysis (STEMI protocol)',
    drgWeight: '3.2481',
    expectedLos: '5.4 days',
    expectedReimbursement: 224000,
  },
  'ipd-4': {
    drgCode: 'DRG 638',
    drgLabel: 'Diabetes with major complications',
    principalDx: 'E11.65',
    secondaryDx: 'R73.9',
    principalProcedure: 'Insulin stabilization protocol',
    drgWeight: '1.5140',
    expectedLos: '3.8 days',
    expectedReimbursement: 102000,
  },
};

const MEDICATION_ROWS_BY_PATIENT_ID: Record<string, MedicationAdminRow[]> = {
  'ipd-1': [
    {
      id: 'ipd-1-med-1',
      medication: 'Piperacillin/Tazobactam',
      dose: '4.5 g',
      route: 'IV',
      frequency: 'Q8H',
      state: 'Active',
      given: { morning: true, afternoon: false, night: false },
    },
    {
      id: 'ipd-1-med-2',
      medication: 'Paracetamol',
      dose: '650 mg',
      route: 'Oral',
      frequency: 'SOS',
      state: 'Due',
      given: { morning: false, afternoon: false, night: false },
    },
  ],
  'ipd-2': [
    {
      id: 'ipd-2-med-1',
      medication: 'Ceftriaxone',
      dose: '1 g',
      route: 'IV',
      frequency: 'Q12H',
      state: 'Active',
      given: { morning: true, afternoon: false, night: true },
    },
    {
      id: 'ipd-2-med-2',
      medication: 'Pantoprazole',
      dose: '40 mg',
      route: 'Oral',
      frequency: 'OD',
      state: 'Given',
      given: { morning: true, afternoon: true, night: true },
    },
  ],
  'ipd-3': [
    {
      id: 'ipd-3-med-1',
      medication: 'Heparin',
      dose: '5000 U',
      route: 'IV infusion',
      frequency: 'Continuous',
      state: 'Active',
      given: { morning: true, afternoon: true, night: true },
    },
    {
      id: 'ipd-3-med-2',
      medication: 'Aspirin',
      dose: '325 mg',
      route: 'Oral',
      frequency: 'OD',
      state: 'Due',
      given: { morning: false, afternoon: false, night: false },
    },
    {
      id: 'ipd-3-med-3',
      medication: 'Clopidogrel',
      dose: '75 mg',
      route: 'Oral',
      frequency: 'OD',
      state: 'Due',
      given: { morning: false, afternoon: false, night: false },
    },
  ],
  'ipd-4': [
    {
      id: 'ipd-4-med-1',
      medication: 'Insulin Regular',
      dose: 'Sliding scale',
      route: 'SC',
      frequency: 'Q6H',
      state: 'Active',
      given: { morning: true, afternoon: false, night: false },
    },
  ],
};

const DRUG_INTERACTIONS_BY_PATIENT_ID: Record<string, DrugInteractionRow[]> = {
  'ipd-1': [
    {
      id: 'ipd-1-int-1',
      drugA: 'Piperacillin/Tazobactam',
      drugB: 'Warfarin (if resumed)',
      severity: 'Moderate',
      effect: 'May potentiate anticoagulation and increase INR variation.',
      action: 'Monitor coagulation profile if anticoagulation restarts.',
    },
  ],
  'ipd-2': [],
  'ipd-3': [
    {
      id: 'ipd-3-int-1',
      drugA: 'Aspirin',
      drugB: 'Clopidogrel',
      severity: 'Moderate',
      effect: 'Combined antiplatelet therapy raises bleeding risk.',
      action: 'Continue with GI protection and active bleeding surveillance.',
    },
    {
      id: 'ipd-3-int-2',
      drugA: 'Heparin',
      drugB: 'Aspirin',
      severity: 'High',
      effect: 'Concurrent anticoagulant and antiplatelet use increases hemorrhage risk.',
      action: 'Document indication, monitor aPTT and bleeding markers every shift.',
    },
  ],
  'ipd-4': [
    {
      id: 'ipd-4-int-1',
      drugA: 'Insulin',
      drugB: 'Beta blockers (if prescribed)',
      severity: 'Low',
      effect: 'May mask adrenergic symptoms of hypoglycemia.',
      action: 'Increase glucose monitoring frequency.',
    },
  ],
};

function isChargeDrugTab(value: string | null): value is ChargeDrugTab {
  return value === 'charges' || value === 'drug';
}

function formatCurrency(value: number): string {
  return CURRENCY_FORMATTER.format(value);
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

function buildRxBillingId(patientId: string, rowId: string): string {
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

function cloneBillingLedger(
  source: Record<string, ClinicalBillingLedgerEntry[]>
): Record<string, ClinicalBillingLedgerEntry[]> {
  return Object.fromEntries(
    Object.entries(source).map(([patientId, rows]) => [
      patientId,
      rows.map((row) => ({ ...row })),
    ])
  ) as Record<string, ClinicalBillingLedgerEntry[]>;
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

    return cloneBillingLedger(parsed.billingByPatient as Record<string, ClinicalBillingLedgerEntry[]>);
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
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function mapSharedRxStatusToMedicationState(status: IpdRxStatus): MedicationState {
  if (status === 'Administered') return 'Given';
  if (status === 'Dispensed') return 'Active';
  if (status === 'Stopped') return 'Stopped';
  return 'Due';
}

function toMedicationRowsFromShared(rows: SharedPrescriptionRow[]): MedicationAdminRow[] {
  return rows.map((row) => {
    const mappedState = mapSharedRxStatusToMedicationState(row.status);
    const mappedGiven =
      mappedState === 'Given'
        ? { morning: true, afternoon: true, night: true }
        : mappedState === 'Active'
        ? { morning: true, afternoon: false, night: false }
        : { morning: false, afternoon: false, night: false };

    return {
      id: row.id,
      medication: row.medicationName,
      dose: row.dose,
      route: row.route,
      frequency: row.duration ? `${row.frequency} · ${row.duration}` : row.frequency,
      state: mappedState,
      given: mappedGiven,
    };
  });
}

function mapBillingStatusToMedicationState(status: ClinicalBillingStatus): MedicationState {
  if (status === 'Cancelled') return 'Stopped';
  if (status === 'Ready for Billing') return 'Given';
  return 'Due';
}

function parseMedicationServiceName(serviceName: string): { medication: string; dose: string } {
  const trimmed = serviceName.trim();
  const match = /^(.*)\s+\((.*)\)$/.exec(trimmed);
  if (!match) {
    return { medication: trimmed || 'Medication', dose: '--' };
  }
  return {
    medication: match[1]?.trim() || 'Medication',
    dose: match[2]?.trim() || '--',
  };
}

function isDischargeMedicationBillingEntry(
  patientId: string,
  entry: ClinicalBillingLedgerEntry
): boolean {
  const entryId = String(entry.id || '');
  const orderId = String(entry.orderId || '');
  return (
    entryId.startsWith(`bill-rx-discharge-${patientId}-`) ||
    orderId.startsWith(`rx-discharge-${patientId}-`) ||
    entry.serviceCode === 'MED-DC'
  );
}

function inferDischargeMedicationSourceRowId(
  patientId: string,
  entry: ClinicalBillingLedgerEntry
): string {
  const billingPrefix = `bill-rx-discharge-${patientId}-`;
  const orderPrefix = `rx-discharge-${patientId}-`;
  if (String(entry.id).startsWith(billingPrefix)) {
    return String(entry.id).slice(billingPrefix.length);
  }
  if (String(entry.orderId).startsWith(orderPrefix)) {
    return String(entry.orderId).slice(orderPrefix.length);
  }
  return String(entry.id || `dc-fallback-${Date.now()}`);
}

function toMedicationRowsFromDischargeBilling(
  patientId: string,
  entries: ClinicalBillingLedgerEntry[]
): MedicationAdminRow[] {
  return entries
    .filter((entry) => isDischargeMedicationBillingEntry(patientId, entry))
    .map((entry) => {
      const sourceRowId = inferDischargeMedicationSourceRowId(patientId, entry);
      const parsed = parseMedicationServiceName(entry.serviceName || '');
      const mappedState = mapBillingStatusToMedicationState(entry.status ?? 'Pending');
      const mappedGiven =
        mappedState === 'Given'
          ? { morning: true, afternoon: true, night: true }
          : mappedState === 'Active'
          ? { morning: true, afternoon: false, night: false }
          : { morning: false, afternoon: false, night: false };

      return {
        id: `dc-rx-${patientId}-${sourceRowId}`,
        medication: parsed.medication,
        dose: parsed.dose,
        route: '--',
        frequency: '--',
        state: mappedState,
        given: mappedGiven,
      };
    });
}

function toChargeRowsFromBilling(entries: ClinicalBillingLedgerEntry[]): ChargeRow[] {
  return entries.map((entry) => ({
    id: entry.id,
    category: entry.category || 'Service',
    description: entry.serviceName || 'Clinical billing item',
    code: entry.serviceCode || '--',
    amount: Number.isFinite(entry.amount) ? entry.amount : 0,
    status: mapBillingStatusToChargeStatus(entry.status ?? 'Pending'),
  }));
}

function toMedicationChargeRowsFromShared(
  patientId: string,
  sharedRows: SharedPrescriptionRow[],
  billingEntries: ClinicalBillingLedgerEntry[]
): ChargeRow[] {
  const billingById = new Map(billingEntries.map((entry) => [String(entry.id), entry]));

  return sharedRows.map((row) => {
    const billingId = buildRxBillingId(patientId, row.id);
    const existing = billingById.get(billingId);
    const existingAmount =
      typeof existing?.amount === 'number' && Number.isFinite(existing.amount)
        ? existing.amount
        : 300;

    return {
      id: billingId,
      category: existing?.category || 'Medication',
      description: `${row.medicationName} (${row.dose})`,
      code: existing?.serviceCode || 'MED-GEN',
      amount: existingAmount,
      status: mapSharedRxStatusToChargeStatus(row.status),
    };
  });
}

function chargeStatusColor(status: ChargeStatus): 'success' | 'warning' | 'info' | 'error' {
  if (status === 'Posted') return 'success';
  if (status === 'Scheduled') return 'info';
  if (status === 'Cancelled') return 'error';
  return 'warning';
}

function interactionSeverityColor(severity: InteractionSeverity): 'success' | 'warning' | 'error' {
  if (severity === 'High') return 'error';
  if (severity === 'Moderate') return 'warning';
  return 'success';
}

function medicationStateColor(state: MedicationState): 'success' | 'warning' | 'info' | 'default' {
  if (state === 'Given') return 'success';
  if (state === 'Due') return 'warning';
  if (state === 'Stopped') return 'default';
  return 'info';
}

function cloneMedicationRows(
  source: Record<string, MedicationAdminRow[]>
): Record<string, MedicationAdminRow[]> {
  return Object.fromEntries(
    Object.entries(source).map(([patientId, rows]) => [
      patientId,
      rows.map((row) => ({
        ...row,
        given: { ...row.given },
      })),
    ])
  ) as Record<string, MedicationAdminRow[]>;
}

function buildFallbackChargeRows(encounter: IpdEncounterRecord): ChargeRow[] {
  return [
    {
      id: `${encounter.patientId}-fallback-room`,
      category: 'Room & Board',
      description: `${encounter.ward || 'Ward'} bed utilization`,
      code: 'IPD-RB',
      amount: 6500,
      status: encounter.billingCleared ? 'Posted' : 'Pending',
    },
    {
      id: `${encounter.patientId}-fallback-nursing`,
      category: 'Nursing',
      description: 'Inpatient nursing and monitoring',
      code: 'NUR-IPD',
      amount: 1900,
      status: encounter.billingCleared ? 'Posted' : 'Pending',
    },
  ];
}

function buildFallbackDrgSummary(): DrgSummary {
  return {
    drgCode: 'DRG --',
    drgLabel: 'Pending DRG assignment',
    principalDx: '--',
    secondaryDx: '--',
    principalProcedure: '--',
    drgWeight: '--',
    expectedLos: '--',
    expectedReimbursement: 0,
  };
}

function buildFallbackMedicationRows(): MedicationAdminRow[] {
  return [
    {
      id: 'fallback-med-1',
      medication: 'Medication order pending',
      dose: '--',
      route: '--',
      frequency: '--',
      state: 'Due',
      given: { morning: false, afternoon: false, night: false },
    },
  ];
}

export default function IpdChargeDrugPage() {
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
  const [activeTab, setActiveTab] = React.useState<ChargeDrugTab>('charges');
  const [persistedBillingByPatient, setPersistedBillingByPatient] = React.useState<
    Record<string, ClinicalBillingLedgerEntry[]>
  >(() => readPersistedBillingLedger());
  const [sharedPrescriptionStore, setSharedPrescriptionStore] = React.useState<SharedPrescriptionStore>(() =>
    readSharedPrescriptionStore()
  );
  const [medicationRowsByPatient, setMedicationRowsByPatient] = React.useState<
    Record<string, MedicationAdminRow[]>
  >(() => cloneMedicationRows(MEDICATION_ROWS_BY_PATIENT_ID));

  React.useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (!isChargeDrugTab(tabParam)) return;
    setActiveTab((currentTab) => (currentTab === tabParam ? currentTab : tabParam));
  }, [searchParams]);

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

  React.useEffect(() => {
    if (!selectedEncounter) return;
    setMedicationRowsByPatient((previous) => {
      if (previous[selectedEncounter.patientId]) return previous;
      return {
        ...previous,
        [selectedEncounter.patientId]: buildFallbackMedicationRows(),
      };
    });
  }, [selectedEncounter]);

  const replaceWorkspaceQuery = React.useCallback(
    (nextTab: ChargeDrugTab, nextMrn?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', nextTab);
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

  if (!selectedEncounter) {
    return (
      <PageTemplate title="Charge / Drug" currentPageTitle="Charge / Drug">
        <Card elevation={0} sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No active inpatient encounters available.
          </Typography>
        </Card>
      </PageTemplate>
    );
  }

  const patientFromMrn = getPatientByMrn(selectedEncounter.mrn || mrnParam);
  const pageSubtitle = formatPatientLabel(
    selectedEncounter.patientName || patientFromMrn?.name,
    selectedEncounter.mrn
  );

  const linkedClinicalBillingRows = persistedBillingByPatient[selectedEncounter.patientId] ?? [];
  const sharedPrescriptionRows = sharedPrescriptionStore[selectedEncounter.patientId] ?? [];
  const sharedMedicationChargeRows = toMedicationChargeRowsFromShared(
    selectedEncounter.patientId,
    sharedPrescriptionRows,
    linkedClinicalBillingRows
  );
  const sharedMedicationChargeIds = new Set(sharedMedicationChargeRows.map((row) => String(row.id)));
  const linkedNonMedicationBillingRows = linkedClinicalBillingRows.filter((entry) => {
    const entryId = String(entry.id);
    if (sharedMedicationChargeIds.has(entryId)) return false;
    const ipdPrefix = `bill-rx-ipd-${selectedEncounter.patientId}-`;
    const roundsPrefix = `bill-rx-rounds-${selectedEncounter.patientId}-`;
    return !entryId.startsWith(ipdPrefix) && !entryId.startsWith(roundsPrefix);
  });
  const chargeRows =
    sharedMedicationChargeRows.length > 0
      ? [...sharedMedicationChargeRows, ...toChargeRowsFromBilling(linkedNonMedicationBillingRows)]
      : linkedClinicalBillingRows.length > 0
      ? toChargeRowsFromBilling(linkedClinicalBillingRows)
      : CHARGE_ROWS_BY_PATIENT_ID[selectedEncounter.patientId] ?? buildFallbackChargeRows(selectedEncounter);
  const drgSummary = DRG_SUMMARY_BY_PATIENT_ID[selectedEncounter.patientId] ?? buildFallbackDrgSummary();
  const sharedMedicationRows = toMedicationRowsFromShared(sharedPrescriptionRows);
  const dischargeMedicationRowsFromBilling = toMedicationRowsFromDischargeBilling(
    selectedEncounter.patientId,
    linkedClinicalBillingRows
  );
  const mergedSyncedMedicationRows = [
    ...sharedMedicationRows,
    ...dischargeMedicationRowsFromBilling.filter(
      (row) => !sharedMedicationRows.some((sharedRow) => sharedRow.id === row.id)
    ),
  ];
  const hasSyncedMedicationRows = mergedSyncedMedicationRows.length > 0;
  const medicationRows = hasSyncedMedicationRows
    ? mergedSyncedMedicationRows
    : medicationRowsByPatient[selectedEncounter.patientId] ?? buildFallbackMedicationRows();
  const drugInteractions = DRUG_INTERACTIONS_BY_PATIENT_ID[selectedEncounter.patientId] ?? [];
  const allergyLabel = ALLERGY_BY_PATIENT_ID[selectedEncounter.patientId] ?? 'No known drug allergies';

  const grossChargeAmount = chargeRows.reduce((sum, row) => sum + row.amount, 0);
  const postedChargeAmount = chargeRows
    .filter((row) => row.status === 'Posted')
    .reduce((sum, row) => sum + row.amount, 0);
  const pendingChargeAmount = chargeRows
    .filter((row) => row.status === 'Pending' || row.status === 'Scheduled')
    .reduce((sum, row) => sum + row.amount, 0);
  const cancelledChargeAmount = chargeRows
    .filter((row) => row.status === 'Cancelled')
    .reduce((sum, row) => sum + row.amount, 0);
  const netChargeAmount = grossChargeAmount - cancelledChargeAmount;
  const highRiskInteractions = drugInteractions.filter((row) => row.severity === 'High').length;
  const dueMedicationCount = medicationRows.filter(
    (row) => row.state === 'Due' || row.state === 'Active'
  ).length;

  const canManageClearance = permissionGate('ipd.discharge.write');
  const canManageMedication = permissionGate(['ipd.rounds.write', 'ipd.discharge.write']);

  const switchTab = (nextTab: ChargeDrugTab) => {
    setActiveTab(nextTab);
    replaceWorkspaceQuery(nextTab, selectedEncounter.mrn);
  };

  const onSelectPatient = (patientId: string) => {
    const next = activeEncounters.find((record) => record.patientId === patientId);
    if (!next) return;
    setSelectedPatientId(next.patientId);
    replaceWorkspaceQuery(activeTab, next.mrn);
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

  const toggleMedicationSlot = (rowId: string, slot: MedicationSlot) => {
    if (!canManageMedication) return;
    setMedicationRowsByPatient((previous) => ({
      ...previous,
      [selectedEncounter.patientId]: (previous[selectedEncounter.patientId] ?? []).map((row) => {
        if (row.id !== rowId) return row;
        const nextGiven = { ...row.given, [slot]: !row.given[slot] };
        const allGiven = nextGiven.morning && nextGiven.afternoon && nextGiven.night;
        const anyGiven = nextGiven.morning || nextGiven.afternoon || nextGiven.night;
        return {
          ...row,
          given: nextGiven,
          state: allGiven ? 'Given' : anyGiven ? 'Active' : 'Due',
        };
      }),
    }));
  };

  const sectionCardSx = {
    p: 0,
    border: '1px solid',
    borderColor: alpha(theme.palette.primary.main, 0.14),
    borderRadius: 2.5,
    boxShadow: 'none',
    overflow: 'hidden',
  };

  return (
    <PageTemplate title="Charge / Drug" subtitle={pageSubtitle} currentPageTitle="Charge / Drug Workspace">
      <Stack spacing={2}>
        {!canManageClearance ? (
          <Alert severity="info">
            You are in read-only mode for billing/pharmacy clearance. Request `ipd.discharge.write` for updates.
          </Alert>
        ) : null}

        <Card
          elevation={0}
          sx={{
            p: { xs: 1.5, md: 2 },
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.15),
            background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.09)} 0%, ${alpha(
              theme.palette.info.main,
              0.05
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
                Charge & Drug Menu
              </Typography>
              <Typography variant="body2" color="text.secondary">
                IPD-linked charge capture, DRG review, medication safety, and discharge clearance sync.
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField
                select
                size="small"
                label="Patient"
                value={selectedEncounter.patientId}
                onChange={(event) => onSelectPatient(event.target.value)}
                sx={{ minWidth: 260, backgroundColor: '#fff' }}
              >
                {activeEncounters.map((record) => (
                  <MenuItem key={record.patientId} value={record.patientId}>
                    {record.patientName} ({record.mrn})
                  </MenuItem>
                ))}
              </TextField>

              <Button
                size="small"
                variant="outlined"
                disabled={!canNavigate('/billing/invoices')}
                onClick={() => router.push('/billing/invoices')}
              >
                Billing Invoices
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={!canNavigate('/ipd/rounds')}
                onClick={() => router.push(withMrn('/ipd/rounds?tab=billing'))}
              >
                Clinical Billing
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={!canNavigate('/pharmacy/dispense')}
                onClick={() => router.push(withMrn('/pharmacy/dispense?tab=ipd'))}
              >
                Pharmacy Queue
              </Button>
              <Button
                size="small"
                variant="contained"
                disabled={!canNavigate('/ipd/discharge')}
                onClick={() => router.push(withMrn('/ipd/discharge?tab=pending'))}
              >
                Open Discharge
              </Button>
            </Stack>
          </Stack>
        </Card>

        <Card elevation={0} sx={sectionCardSx}>
          <Box sx={{ px: { xs: 1.5, md: 2 }, pt: 1.2 }}>
            <IpdModuleTabs
              tabs={CHARGE_DRUG_TABS.map((tab) => ({ id: tab.id, label: tab.label }))}
              value={activeTab}
              onChange={(nextValue) => {
                if (!isChargeDrugTab(nextValue)) return;
                switchTab(nextValue);
              }}
            />
          </Box>

          <Box sx={{ px: { xs: 1.5, md: 2 }, py: 1.75 }}>
            {activeTab === 'charges' ? (
              <Stack spacing={2}>
                <Grid container spacing={1.5}>
                  <Grid xs={12} sm={6} lg={3}>
                    <IpdMetricCard
                      label="Net Charges"
                      value={formatCurrency(netChargeAmount)}
                      tone="primary"
                      icon={<LocalAtmIcon fontSize="small" />}
                    />
                  </Grid>
                  <Grid xs={12} sm={6} lg={3}>
                    <IpdMetricCard
                      label="Posted"
                      value={formatCurrency(postedChargeAmount)}
                      tone="success"
                      icon={<AssignmentTurnedInIcon fontSize="small" />}
                    />
                  </Grid>
                  <Grid xs={12} sm={6} lg={3}>
                    <IpdMetricCard
                      label="Pending / Scheduled"
                      value={formatCurrency(pendingChargeAmount)}
                      tone="warning"
                      icon={<ReceiptLongIcon fontSize="small" />}
                    />
                  </Grid>
                  <Grid xs={12} sm={6} lg={3}>
                    <IpdMetricCard
                      label="DRG Code"
                      value={drgSummary.drgCode}
                      tone="info"
                      icon={<AccountBalanceWalletIcon fontSize="small" />}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={1.5}>
                  <Grid xs={12} lg={8}>
                    <Card elevation={0} sx={sectionCardSx}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        spacing={1}
                        sx={{
                          px: 1.8,
                          py: 1.3,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          Charge Detail Ledger
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {linkedClinicalBillingRows.length > 0
                            ? 'Synced from Clinical Care > Billing'
                            : 'Showing charge seed data'}
                        </Typography>
                        <Chip
                          size="small"
                          color={selectedEncounter.billingCleared ? 'success' : 'warning'}
                          label={selectedEncounter.billingCleared ? 'Billing Cleared' : 'Billing Pending'}
                        />
                      </Stack>

                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Category</TableCell>
                              <TableCell>Description</TableCell>
                              <TableCell>Code</TableCell>
                              <TableCell align="right">Amount</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {chargeRows.map((row) => (
                              <TableRow key={row.id} hover>
                                <TableCell>
                                  <Chip size="small" label={row.category} variant="outlined" />
                                </TableCell>
                                <TableCell sx={{ minWidth: 260 }}>{row.description}</TableCell>
                                <TableCell
                                  sx={{
                                    fontFamily: 'monospace',
                                    fontSize: 12,
                                    color: 'text.secondary',
                                  }}
                                >
                                  {row.code}
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>
                                  {formatCurrency(row.amount)}
                                </TableCell>
                                <TableCell>
                                  <Chip size="small" color={chargeStatusColor(row.status)} label={row.status} />
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow
                              sx={{
                                backgroundColor: alpha(theme.palette.primary.main, 0.07),
                              }}
                            >
                              <TableCell colSpan={3} sx={{ fontWeight: 800, color: 'primary.main' }}>
                                Net Total (Excl. Cancelled)
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 800, color: 'primary.main' }}>
                                {formatCurrency(netChargeAmount)}
                              </TableCell>
                              <TableCell />
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Card>
                  </Grid>

                  <Grid xs={12} lg={4}>
                    <Stack spacing={1.5}>
                      <Card elevation={0} sx={sectionCardSx}>
                        <Box sx={{ px: 1.8, py: 1.4 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            DRG Assignment
                          </Typography>
                          <Typography variant="h6" sx={{ mt: 0.8, fontWeight: 800 }}>
                            {drgSummary.drgCode}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.2 }}>
                            {drgSummary.drgLabel}
                          </Typography>

                          {[
                            ['Principal Dx', drgSummary.principalDx],
                            ['Secondary Dx', drgSummary.secondaryDx],
                            ['Procedure', drgSummary.principalProcedure],
                            ['DRG Weight', drgSummary.drgWeight],
                            ['Expected LOS', drgSummary.expectedLos],
                            [
                              'Expected Reimbursement',
                              drgSummary.expectedReimbursement > 0
                                ? formatCurrency(drgSummary.expectedReimbursement)
                                : '--',
                            ],
                          ].map(([label, value]) => (
                            <Stack
                              key={label}
                              direction="row"
                              justifyContent="space-between"
                              spacing={1.5}
                              sx={{ py: 0.6 }}
                            >
                              <Typography variant="caption" color="text.secondary">
                                {label}
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 700, textAlign: 'right' }}>
                                {value}
                              </Typography>
                            </Stack>
                          ))}
                        </Box>
                      </Card>

                      <Card elevation={0} sx={sectionCardSx}>
                        <Box sx={{ px: 1.8, py: 1.4 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            Discharge Clearance Sync
                          </Typography>

                          <Stack direction="row" spacing={1} sx={{ mt: 1.1, flexWrap: 'wrap' }}>
                            <Chip
                              size="small"
                              color={selectedEncounter.billingCleared ? 'success' : 'warning'}
                              label={selectedEncounter.billingCleared ? 'Billing Cleared' : 'Billing Pending'}
                            />
                            <Chip
                              size="small"
                              color={selectedEncounter.pharmacyCleared ? 'success' : 'warning'}
                              label={selectedEncounter.pharmacyCleared ? 'Pharmacy Cleared' : 'Pharmacy Pending'}
                            />
                            <Chip
                              size="small"
                              color={selectedEncounter.dischargeReady ? 'success' : 'default'}
                              label={selectedEncounter.dischargeReady ? 'Ready for Discharge' : 'Not Ready'}
                            />
                          </Stack>

                          <Divider sx={{ my: 1.3 }} />
                          <Stack spacing={0.8}>
                            <Button
                              size="small"
                              variant={selectedEncounter.billingCleared ? 'outlined' : 'contained'}
                              disabled={!canManageClearance}
                              onClick={() => toggleClearance('billing')}
                            >
                              {selectedEncounter.billingCleared ? 'Reopen Billing' : 'Mark Billing Cleared'}
                            </Button>
                            <Button
                              size="small"
                              variant={selectedEncounter.pharmacyCleared ? 'outlined' : 'contained'}
                              color="success"
                              disabled={!canManageClearance}
                              onClick={() => toggleClearance('pharmacy')}
                            >
                              {selectedEncounter.pharmacyCleared ? 'Reopen Pharmacy' : 'Mark Pharmacy Cleared'}
                            </Button>
                          </Stack>
                        </Box>
                      </Card>
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            ) : (
              <Stack spacing={2}>
                <Grid container spacing={1.5}>
                  <Grid xs={12} sm={6} lg={3}>
                    <IpdMetricCard
                      label="Medications Due"
                      value={dueMedicationCount}
                      tone="warning"
                      icon={<MedicationIcon fontSize="small" />}
                    />
                  </Grid>
                  <Grid xs={12} sm={6} lg={3}>
                    <IpdMetricCard
                      label="High-Risk Interactions"
                      value={highRiskInteractions}
                      tone={highRiskInteractions > 0 ? 'danger' : 'success'}
                      icon={<WarningAmberIcon fontSize="small" />}
                    />
                  </Grid>
                  <Grid xs={12} sm={6} lg={3}>
                    <IpdMetricCard
                      label="Pending Charges"
                      value={formatCurrency(pendingChargeAmount)}
                      tone="info"
                      icon={<LocalAtmIcon fontSize="small" />}
                    />
                  </Grid>
                  <Grid xs={12} sm={6} lg={3}>
                    <IpdMetricCard
                      label="Pharmacy Clearance"
                      value={selectedEncounter.pharmacyCleared ? 'Cleared' : 'Pending'}
                      tone={selectedEncounter.pharmacyCleared ? 'success' : 'warning'}
                      icon={<ScienceIcon fontSize="small" />}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={1.5}>
                  <Grid xs={12} lg={8}>
                    <Card elevation={0} sx={sectionCardSx}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        spacing={1}
                        sx={{
                          px: 1.8,
                          py: 1.3,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          backgroundColor: alpha(theme.palette.info.main, 0.06),
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          Medication Administration Record (MAR)
                        </Typography>
                        <Chip
                          size="small"
                          color={selectedEncounter.pharmacyCleared ? 'success' : 'warning'}
                          label={selectedEncounter.pharmacyCleared ? 'Pharmacy Cleared' : 'Pending Pharmacy Clearance'}
                        />
                      </Stack>

                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Medication</TableCell>
                              <TableCell>Dose / Route</TableCell>
                              <TableCell>Frequency</TableCell>
                              <TableCell>06:00</TableCell>
                              <TableCell>14:00</TableCell>
                              <TableCell>22:00</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {medicationRows.map((row) => (
                              <TableRow key={row.id} hover>
                                <TableCell sx={{ fontWeight: 700 }}>{row.medication}</TableCell>
                                <TableCell>
                                  {row.dose} / {row.route}
                                </TableCell>
                                <TableCell>{row.frequency}</TableCell>
                                {(['morning', 'afternoon', 'night'] as MedicationSlot[]).map((slot) => (
                                  <TableCell key={`${row.id}-${slot}`}>
                                    <Button
                                      size="small"
                                      variant={row.state === 'Stopped' ? 'outlined' : row.given[slot] ? 'contained' : 'outlined'}
                                      color={row.state === 'Stopped' ? 'inherit' : row.given[slot] ? 'success' : 'inherit'}
                                      disabled={!canManageMedication || hasSyncedMedicationRows}
                                      onClick={() => toggleMedicationSlot(row.id, slot)}
                                      sx={{ minWidth: 58 }}
                                    >
                                      {row.state === 'Stopped' ? 'Stopped' : row.given[slot] ? 'Given' : 'Due'}
                                    </Button>
                                  </TableCell>
                                ))}
                                <TableCell>
                                  <Chip size="small" color={medicationStateColor(row.state)} label={row.state} />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Card>
                  </Grid>

                  <Grid xs={12} lg={4}>
                    <Stack spacing={1.5}>
                      <Card elevation={0} sx={sectionCardSx}>
                        <Box sx={{ px: 1.8, py: 1.4 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            Drug Interaction Alerts
                          </Typography>

                          {drugInteractions.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.2 }}>
                              No active interaction alerts for this patient.
                            </Typography>
                          ) : (
                            <Stack spacing={1.1} sx={{ mt: 1.1 }}>
                              {drugInteractions.map((alert) => (
                                <Box
                                  key={alert.id}
                                  sx={{
                                    p: 1.1,
                                    borderRadius: 1.6,
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette.warning.main, 0.35),
                                    backgroundColor: alpha(theme.palette.warning.main, 0.08),
                                  }}
                                >
                                  <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    spacing={1}
                                    sx={{ mb: 0.5 }}
                                  >
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                      {alert.drugA} ↔ {alert.drugB}
                                    </Typography>
                                    <Chip
                                      size="small"
                                      color={interactionSeverityColor(alert.severity)}
                                      label={alert.severity}
                                    />
                                  </Stack>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                    {alert.effect}
                                  </Typography>
                                  <Typography variant="caption" sx={{ display: 'block', mt: 0.4, fontWeight: 700 }}>
                                    Action: {alert.action}
                                  </Typography>
                                </Box>
                              ))}
                            </Stack>
                          )}
                        </Box>
                      </Card>

                      <Card elevation={0} sx={sectionCardSx}>
                        <Box sx={{ px: 1.8, py: 1.4 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            Allergy & Safety Check
                          </Typography>
                          <Stack spacing={1} sx={{ mt: 1.1 }}>
                            <Chip
                              size="small"
                              color={allergyLabel === 'No known drug allergies' ? 'success' : 'error'}
                              label={
                                allergyLabel === 'No known drug allergies'
                                  ? 'NKDA'
                                  : `Allergy: ${allergyLabel}`
                              }
                              sx={{ width: 'fit-content' }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              Pharmacy clearance status in this panel syncs with the IPD discharge checklist.
                            </Typography>
                            <Button
                              size="small"
                              variant={selectedEncounter.pharmacyCleared ? 'outlined' : 'contained'}
                              color="success"
                              disabled={!canManageClearance}
                              onClick={() => toggleClearance('pharmacy')}
                            >
                              {selectedEncounter.pharmacyCleared
                                ? 'Reopen Pharmacy Clearance'
                                : 'Mark Pharmacy Cleared'}
                            </Button>
                          </Stack>
                        </Box>
                      </Card>
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            )}
          </Box>
        </Card>
      </Stack>
    </PageTemplate>
  );
}
