'use client';

import * as React from 'react';
import { OpdAppointment, OpdEncounterCase } from '@/src/screens/opd/opd-mock-data';
import { AdmissionLead, AdmissionPriority } from './ipd-mock-data';

type TransferState = Record<string, OpdToIpdTransferLead>;
type TransferPayer = OpdAppointment['payerType'] | 'Staff';

const STORAGE_KEY = 'scanbo.hims.ipd.opd-transfer.v1';
const EMPTY_STATE: TransferState = {};

const listeners = new Set<() => void>();
let memoryState: TransferState | null = null;

const PAYER_TO_PATIENT_TYPE: Record<TransferPayer, AdmissionLead['patientType']> = {
  General: 'General',
  Insurance: 'Insurance',
  Corporate: 'Corporate',
  Staff: 'Staff',
};

export interface OpdToIpdTransferLead extends AdmissionLead {
  transferRequestId: string;
  encounterId: string;
  requestedAt: string;
  requestedBy: string;
  requestedByRole: string;
  requestNote: string;
  handled: boolean;
  handledAt?: string;
}

export interface CreateOpdToIpdTransferInput {
  encounter: OpdEncounterCase;
  payerType?: TransferPayer;
  phone?: string;
  priority: AdmissionPriority;
  preferredWard: string;
  admissionReason: string;
  provisionalDiagnosis?: string;
  requestedBy: string;
  requestedByRole: string;
  requestNote?: string;
}

export interface UpsertTransferResult {
  lead: OpdToIpdTransferLead;
  status: 'created' | 'updated';
}

function nowIso(): string {
  return new Date().toISOString();
}

function emit(): void {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readStorage(): TransferState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TransferState;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStorage(state: TransferState): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // best-effort cache only
  }
}

function ensureState(): TransferState {
  if (memoryState) return memoryState;
  memoryState = readStorage() ?? {};
  return memoryState;
}

function getSnapshot(): TransferState {
  return ensureState();
}

function setState(nextState: TransferState): void {
  memoryState = nextState;
  writeStorage(nextState);
  emit();
}

function parseAgeGender(ageGender: string): { age: number; gender: AdmissionLead['gender'] } {
  const [ageRaw = '', genderRaw = 'Other'] = ageGender.split('/').map((value) => value.trim());
  const age = Number.parseInt(ageRaw, 10);
  const normalizedGender = genderRaw.toLowerCase();
  if (normalizedGender === 'male') return { age: Number.isFinite(age) ? age : 0, gender: 'Male' };
  if (normalizedGender === 'female') return { age: Number.isFinite(age) ? age : 0, gender: 'Female' };
  return { age: Number.isFinite(age) ? age : 0, gender: 'Other' };
}

function normalizeAllergies(allergies: string[]): string {
  const cleaned = allergies
    .map((item) => item.trim())
    .filter((item) => item && item.toLowerCase() !== 'no known allergies');

  return cleaned.length > 0 ? cleaned.join(', ') : 'No known allergies';
}

function inferDepartment(preferredWard: string): string {
  const ward = preferredWard.toLowerCase();
  if (ward.includes('icu')) return 'Critical Care';
  if (ward.includes('surgical')) return 'Surgery';
  return 'Internal Medicine';
}

function buildTransferLead(
  input: CreateOpdToIpdTransferInput,
  existing?: OpdToIpdTransferLead
): OpdToIpdTransferLead {
  const encounter = input.encounter;
  const { age, gender } = parseAgeGender(encounter.ageGender);
  const patientType = PAYER_TO_PATIENT_TYPE[input.payerType ?? 'General'];
  const diagnosis =
    input.provisionalDiagnosis?.trim() ||
    encounter.problems?.[0]?.trim() ||
    encounter.chiefComplaint.trim() ||
    'Clinical observation';
  const transferRequestId = existing?.transferRequestId ?? `transfer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id: existing?.id ?? transferRequestId,
    transferRequestId,
    encounterId: encounter.id,
    mrn: encounter.mrn,
    patientType,
    aadhaarId: existing?.aadhaarId ?? 'Not provided',
    language: existing?.language ?? 'English',
    patientName: encounter.patientName,
    gender,
    age,
    mobile: input.phone?.trim() || existing?.mobile || '--',
    kinName: existing?.kinName ?? 'Not captured',
    kinPhone: existing?.kinPhone ?? '--',
    nationality: existing?.nationality ?? 'Indian',
    source: 'OPD',
    priority: input.priority,
    admissionReason: input.admissionReason.trim(),
    provisionalDiagnosis: diagnosis,
    preferredWard: input.preferredWard.trim(),
    consultant: encounter.doctor,
    knownAllergies: normalizeAllergies(encounter.allergies ?? []),
    requestedAt: nowIso(),
    requestedBy: input.requestedBy.trim() || 'Unknown',
    requestedByRole: input.requestedByRole.trim() || 'Unknown',
    requestNote: input.requestNote?.trim() || '',
    handled: false,
    handledAt: undefined,
  };
}

export function getOpdToIpdTransferLeads(options?: { includeHandled?: boolean }): OpdToIpdTransferLead[] {
  const includeHandled = options?.includeHandled ?? false;
  return Object.values(ensureState())
    .filter((lead) => includeHandled || !lead.handled)
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
}

export function findActiveTransferLeadByMrn(mrn: string): OpdToIpdTransferLead | null {
  const normalizedMrn = mrn.trim().toUpperCase();
  return (
    getOpdToIpdTransferLeads().find((lead) => lead.mrn.trim().toUpperCase() === normalizedMrn) ??
    null
  );
}

export function upsertOpdToIpdTransferLead(input: CreateOpdToIpdTransferInput): UpsertTransferResult {
  const state = ensureState();
  const existing = Object.values(state).find(
    (lead) =>
      !lead.handled &&
      lead.mrn.trim().toUpperCase() === input.encounter.mrn.trim().toUpperCase()
  );

  const lead = buildTransferLead(input, existing);
  setState({
    ...state,
    [lead.transferRequestId]: lead,
  });

  return {
    lead,
    status: existing ? 'updated' : 'created',
  };
}

export function markOpdToIpdTransferHandledByMrn(mrn: string): void {
  const state = ensureState();
  const normalizedMrn = mrn.trim().toUpperCase();
  let changed = false;
  const nextState: TransferState = { ...state };

  Object.values(state).forEach((lead) => {
    if (lead.handled) return;
    if (lead.mrn.trim().toUpperCase() !== normalizedMrn) return;

    nextState[lead.transferRequestId] = {
      ...lead,
      handled: true,
      handledAt: nowIso(),
    };
    changed = true;
  });

  if (!changed) return;
  setState(nextState);
}

export function useOpdToIpdTransferLeads(): OpdToIpdTransferLead[] {
  const snapshot = React.useSyncExternalStore<TransferState>(
    subscribe,
    getSnapshot,
    () => EMPTY_STATE
  );
  return React.useMemo(
    () =>
      Object.values(snapshot)
        .filter((lead) => !lead.handled)
        .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)),
    [snapshot]
  );
}

export function buildDefaultTransferReason(encounter: OpdEncounterCase): string {
  const complaint = encounter.chiefComplaint?.trim();
  if (!complaint) {
    return 'Requires inpatient admission from OPD consultation.';
  }
  return `Requires inpatient admission for ${complaint.toLowerCase()}.`;
}

export function buildDefaultTransferWard(encounter: OpdEncounterCase): string {
  const department = encounter.department.toLowerCase();
  if (department.includes('surgery')) return 'Surgical Ward - 1';
  if (department.includes('cardiology')) return 'ICU';
  return 'Medical Ward - 1';
}

export function buildDefaultTransferPayload(
  encounter: OpdEncounterCase,
  options?: {
    payerType?: TransferPayer;
    phone?: string;
    requestedBy?: string;
    requestedByRole?: string;
  }
): CreateOpdToIpdTransferInput {
  return {
    encounter,
    payerType: options?.payerType ?? 'General',
    phone: options?.phone,
    priority: encounter.queuePriority === 'Urgent' ? 'Urgent' : 'Routine',
    preferredWard: buildDefaultTransferWard(encounter),
    admissionReason: buildDefaultTransferReason(encounter),
    provisionalDiagnosis: encounter.problems?.[0] ?? encounter.chiefComplaint,
    requestedBy: options?.requestedBy ?? 'Clinical Team',
    requestedByRole: options?.requestedByRole ?? 'Unknown',
  };
}

export function inferTransferDepartment(preferredWard: string): string {
  return inferDepartment(preferredWard);
}
