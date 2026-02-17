'use client';

import * as React from 'react';
import { DISCHARGE_CANDIDATES, INPATIENT_STAYS } from './ipd-mock-data';

export type IpdClinicalStatus = 'critical' | 'watch' | 'stable';
export type IpdWorkflowStatus = 'admitted' | 'in-care' | 'ready-for-discharge' | 'discharged';

export interface IpdEncounterRecord {
  patientId: string;
  admissionId: string;
  encounterId: string;
  mrn: string;
  patientName: string;
  consultant: string;
  ward: string;
  bed: string;
  diagnosis: string;
  clinicalStatus: IpdClinicalStatus;
  pendingOrders: number;
  pendingDiagnostics: number;
  pendingMedications: number;
  billingCleared: boolean;
  pharmacyCleared: boolean;
  followUpReady: boolean;
  dischargeReady: boolean;
  workflowStatus: IpdWorkflowStatus;
  updatedAt: string;
}

export interface RegisterAdmissionInput {
  patientId: string;
  mrn: string;
  patientName: string;
  consultant: string;
  ward: string;
  diagnosis: string;
}

type EncounterState = Record<string, IpdEncounterRecord>;
type EncounterPatch = Partial<Omit<IpdEncounterRecord, 'patientId' | 'admissionId' | 'encounterId' | 'mrn'>>;

const STORAGE_KEY = 'scanbo.hims.ipd.encounter-context.v1';

const DEFAULT_CLINICAL_STATUS: Record<string, IpdClinicalStatus> = {
  'ipd-1': 'watch',
  'ipd-2': 'stable',
  'ipd-3': 'critical',
  'ipd-4': 'stable',
};

const DEFAULT_PENDING_ORDERS: Record<string, number> = {
  'ipd-1': 2,
  'ipd-2': 1,
  'ipd-3': 2,
  'ipd-4': 1,
};

const DEFAULT_PENDING_DIAGNOSTICS: Record<string, number> = {
  'ipd-1': 1,
  'ipd-2': 0,
  'ipd-3': 1,
  'ipd-4': 1,
};

const DEFAULT_PENDING_MEDICATIONS: Record<string, number> = {
  'ipd-1': 2,
  'ipd-2': 1,
  'ipd-3': 3,
  'ipd-4': 1,
};

const listeners = new Set<() => void>();
let memoryState: EncounterState | null = null;

function nowIso(): string {
  return new Date().toISOString();
}

function buildDefaultState(): EncounterState {
  return INPATIENT_STAYS.reduce<EncounterState>((acc, stay, index) => {
    const dischargeCandidate = DISCHARGE_CANDIDATES.find((candidate) => candidate.patientId === stay.id);
    const billingCleared = dischargeCandidate?.billingStatus === 'Cleared';
    const pharmacyCleared = dischargeCandidate?.pharmacyStatus === 'Ready';
    const followUpReady =
      billingCleared && pharmacyCleared && dischargeCandidate?.transportStatus === 'Arranged';

    const base: IpdEncounterRecord = {
      patientId: stay.id,
      admissionId: `adm-${stay.id}`,
      encounterId: `enc-${stay.id}`,
      mrn: stay.mrn,
      patientName: stay.patientName,
      consultant: stay.consultant,
      ward: stay.ward,
      bed: stay.bed,
      diagnosis: stay.diagnosis,
      clinicalStatus: DEFAULT_CLINICAL_STATUS[stay.id] ?? 'stable',
      pendingOrders: DEFAULT_PENDING_ORDERS[stay.id] ?? 0,
      pendingDiagnostics: DEFAULT_PENDING_DIAGNOSTICS[stay.id] ?? 0,
      pendingMedications: DEFAULT_PENDING_MEDICATIONS[stay.id] ?? 0,
      billingCleared,
      pharmacyCleared,
      followUpReady,
      dischargeReady: false,
      workflowStatus: index === 0 ? 'in-care' : 'admitted',
      updatedAt: nowIso(),
    };

    acc[stay.id] = withDerivedFields(base);
    return acc;
  }, {});
}

function withDerivedFields(record: IpdEncounterRecord): IpdEncounterRecord {
  const isAlreadyDischarged = record.workflowStatus === 'discharged';
  const dischargeReady =
    !isAlreadyDischarged &&
    record.pendingOrders <= 0 &&
    record.pendingDiagnostics <= 0 &&
    record.pendingMedications <= 0 &&
    record.billingCleared &&
    record.pharmacyCleared &&
    record.followUpReady;

  const workflowStatus: IpdWorkflowStatus = isAlreadyDischarged
    ? 'discharged'
    : dischargeReady
    ? 'ready-for-discharge'
    : record.workflowStatus === 'admitted'
    ? 'admitted'
    : 'in-care';

  return {
    ...record,
    pendingOrders: Math.max(0, record.pendingOrders),
    pendingDiagnostics: Math.max(0, record.pendingDiagnostics),
    pendingMedications: Math.max(0, record.pendingMedications),
    dischargeReady,
    workflowStatus,
    updatedAt: record.updatedAt || nowIso(),
  };
}

function readStorage(): EncounterState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EncounterState;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStorage(state: EncounterState): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // best-effort cache only
  }
}

function ensureState(): EncounterState {
  if (memoryState) {
    return memoryState;
  }

  const defaults = buildDefaultState();
  const stored = readStorage();
  if (!stored) {
    memoryState = defaults;
    return memoryState;
  }

  const merged: EncounterState = { ...defaults };

  Object.values(stored).forEach((storedRecord) => {
    if (!storedRecord?.patientId) return;
    const existing = merged[storedRecord.patientId];
    const mergedRecord: IpdEncounterRecord = withDerivedFields({
      ...(existing ?? {
        patientId: storedRecord.patientId,
        admissionId: storedRecord.admissionId || `adm-${storedRecord.patientId}`,
        encounterId: storedRecord.encounterId || `enc-${storedRecord.patientId}`,
        mrn: storedRecord.mrn || '',
        patientName: storedRecord.patientName || '',
        consultant: storedRecord.consultant || '',
        ward: storedRecord.ward || '',
        bed: storedRecord.bed || '',
        diagnosis: storedRecord.diagnosis || '',
        clinicalStatus: storedRecord.clinicalStatus ?? 'stable',
        pendingOrders: 0,
        pendingDiagnostics: 0,
        pendingMedications: 0,
        billingCleared: false,
        pharmacyCleared: false,
        followUpReady: false,
        dischargeReady: false,
        workflowStatus: 'admitted',
        updatedAt: nowIso(),
      }),
      ...storedRecord,
      updatedAt: storedRecord.updatedAt || nowIso(),
    });
    merged[storedRecord.patientId] = mergedRecord;
  });

  memoryState = merged;
  return memoryState;
}

function emit(): void {
  listeners.forEach((listener) => listener());
}

function setState(nextState: EncounterState): void {
  memoryState = nextState;
  writeStorage(nextState);
  emit();
}

function shallowEqualRecord(a: IpdEncounterRecord, b: IpdEncounterRecord): boolean {
  return (
    a.patientId === b.patientId &&
    a.admissionId === b.admissionId &&
    a.encounterId === b.encounterId &&
    a.mrn === b.mrn &&
    a.patientName === b.patientName &&
    a.consultant === b.consultant &&
    a.ward === b.ward &&
    a.bed === b.bed &&
    a.diagnosis === b.diagnosis &&
    a.clinicalStatus === b.clinicalStatus &&
    a.pendingOrders === b.pendingOrders &&
    a.pendingDiagnostics === b.pendingDiagnostics &&
    a.pendingMedications === b.pendingMedications &&
    a.billingCleared === b.billingCleared &&
    a.pharmacyCleared === b.pharmacyCleared &&
    a.followUpReady === b.followUpReady &&
    a.dischargeReady === b.dischargeReady &&
    a.workflowStatus === b.workflowStatus
  );
}

export function getIpdEncounterState(): EncounterState {
  return ensureState();
}

export function getIpdEncounters(): IpdEncounterRecord[] {
  return Object.values(ensureState()).sort((a, b) => {
    if (a.workflowStatus === 'discharged' && b.workflowStatus !== 'discharged') return 1;
    if (a.workflowStatus !== 'discharged' && b.workflowStatus === 'discharged') return -1;
    return a.patientName.localeCompare(b.patientName);
  });
}

export function getIpdEncounterByPatientId(patientId: string): IpdEncounterRecord | null {
  return ensureState()[patientId] ?? null;
}

export function getIpdEncounterByMrn(mrn?: string | null): IpdEncounterRecord | null {
  if (!mrn) return null;
  return getIpdEncounters().find((record) => record.mrn === mrn) ?? null;
}

export function patchIpdEncounter(patientId: string, patch: EncounterPatch): void {
  const state = ensureState();
  const current = state[patientId];
  if (!current) return;

  const cleanPatch = Object.entries(patch).reduce<EncounterPatch>((acc, [key, value]) => {
    if (value !== undefined) {
      (acc as Record<string, unknown>)[key] = value;
    }
    return acc;
  }, {});

  const nextRecord = withDerivedFields({
    ...current,
    ...cleanPatch,
    updatedAt: nowIso(),
  });

  if (shallowEqualRecord(current, nextRecord)) return;
  setState({
    ...state,
    [patientId]: nextRecord,
  });
}

export function registerIpdAdmissionEncounter(input: RegisterAdmissionInput): IpdEncounterRecord {
  const state = ensureState();
  const existingByMrn = Object.values(state).find((record) => record.mrn === input.mrn);
  if (existingByMrn) {
    const updated = withDerivedFields({
      ...existingByMrn,
      patientName: input.patientName || existingByMrn.patientName,
      consultant: input.consultant || existingByMrn.consultant,
      ward: input.ward || existingByMrn.ward,
      diagnosis: input.diagnosis || existingByMrn.diagnosis,
      workflowStatus: existingByMrn.workflowStatus === 'discharged' ? 'in-care' : existingByMrn.workflowStatus,
      updatedAt: nowIso(),
    });
    if (!shallowEqualRecord(existingByMrn, updated)) {
      setState({
        ...state,
        [existingByMrn.patientId]: updated,
      });
    }
    return updated;
  }

  const patientId = input.patientId || `ipd-${Date.now()}`;
  const admissionId = `adm-${Date.now()}`;
  const encounterId = `enc-${Date.now()}`;
  const nextRecord = withDerivedFields({
    patientId,
    admissionId,
    encounterId,
    mrn: input.mrn,
    patientName: input.patientName,
    consultant: input.consultant,
    ward: input.ward,
    bed: '',
    diagnosis: input.diagnosis,
    clinicalStatus: 'stable',
    pendingOrders: 0,
    pendingDiagnostics: 0,
    pendingMedications: 0,
    billingCleared: false,
    pharmacyCleared: false,
    followUpReady: false,
    dischargeReady: false,
    workflowStatus: 'admitted',
    updatedAt: nowIso(),
  });

  setState({
    ...state,
    [patientId]: nextRecord,
  });

  return nextRecord;
}

export function assignIpdEncounterBed(
  patientId: string,
  bed: string,
  ward: string,
  diagnosis?: string
): void {
  patchIpdEncounter(patientId, {
    bed,
    ward,
    diagnosis,
    workflowStatus: 'in-care',
  });
}

export function syncIpdEncounterClinical(
  patientId: string,
  payload: {
    pendingOrders?: number;
    pendingDiagnostics?: number;
    pendingMedications?: number;
    clinicalStatus?: IpdClinicalStatus;
    diagnosis?: string;
  }
): void {
  patchIpdEncounter(patientId, {
    pendingOrders: payload.pendingOrders,
    pendingDiagnostics: payload.pendingDiagnostics,
    pendingMedications: payload.pendingMedications,
    clinicalStatus: payload.clinicalStatus,
    diagnosis: payload.diagnosis,
    workflowStatus: 'in-care',
  });
}

export function syncIpdEncounterDischargeChecks(
  patientId: string,
  payload: {
    billingCleared?: boolean;
    pharmacyCleared?: boolean;
    followUpReady?: boolean;
  }
): void {
  patchIpdEncounter(patientId, {
    billingCleared: payload.billingCleared,
    pharmacyCleared: payload.pharmacyCleared,
    followUpReady: payload.followUpReady,
  });
}

export function markIpdEncounterDischarged(patientId: string): void {
  patchIpdEncounter(patientId, {
    workflowStatus: 'discharged',
    pendingOrders: 0,
    pendingDiagnostics: 0,
    pendingMedications: 0,
  });
}

export function subscribeIpdEncounterState(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getEncounterStateSnapshot(): EncounterState {
  return ensureState();
}

export function useIpdEncounterState(): EncounterState {
  return React.useSyncExternalStore(
    subscribeIpdEncounterState,
    getEncounterStateSnapshot,
    getEncounterStateSnapshot
  );
}

export function useIpdEncounters(): IpdEncounterRecord[] {
  const state = useIpdEncounterState();
  return React.useMemo(() => Object.values(state), [state]);
}
