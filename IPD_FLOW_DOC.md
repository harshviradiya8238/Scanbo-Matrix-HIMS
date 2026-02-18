# IPD Flow (Admissions, Bed Management, Clinical Care, Discharge)

This document describes the current inpatient (IPD) workflow, role-based access control (RBAC), and OPD-to-IPD transfer behavior.

## Primary IPD Screens

- Dashboard: `/ipd/dashboard`
- Admissions: `/ipd/admissions`
- Bed & Census: `/ipd/beds`
- Clinical Care: `/ipd/rounds`
- Discharge & AVS: `/ipd/discharge`

## End-to-End IPD Workflow

1. Admission Intake
- Patient enters Admission Queue from ER/OPD/transfer source.
- Registration and admission details are captured in IPD Admissions.
- Creating admission registers an IPD encounter context.

2. Bed Allocation
- Bed Control assigns or transfers the patient to an available bed.
- Bed movement is logged in Transfers.
- Encounter context is updated with selected bed and ward.

3. Clinical Care & Rounds
- Team uses rounds tabs (doctor rounds, nursing, vitals, orders, medications, notes, procedures).
- Clinical updates are synced to the IPD encounter context.
- Discharge-readiness is derived from pending orders/diagnostics/medication and clearances.

4. Discharge & AVS
- Required checklist + mandatory AVS fields are validated.
- On final discharge, patient is marked discharged and visible in discharge history.
- Bed can be released for next admissions.

## Admission Page: Queue vs All IPD Patients

This is the key difference on `/ipd/admissions`:

- `Admission Queue - Pending Bed`
  - Patients from OPD/ER/transfer plus newly created admissions that are still pending bed workflow.
  - Action: `Allocate Bed` (if admission is pending, system creates admission first and opens Bed Board).

- `All IPD Patients - Admitted`
  - Shows only patients with bed allocated (admitted list).
  - Does not include bed-pending patients.
  - Newly created rows are marked as `Entry = Created Now`.

After clicking `Create Admission`:
1. The patient is saved in IPD context and remains after refresh.
2. Patient appears in `All IPD Patients - Admitted`.
3. If bed is pending, patient also appears in `Admission Queue - Pending Bed`.
4. Use `Allocate Bed` from queue (or from All IPD action button) to open Bed Board.

## OPD to IPD Transfer Flow (New)

Transfer can now be triggered from:
- OPD Queue (`/appointments/queue`) via `Move to IPD`
- OPD Consultation (`/encounters/[encounterId]`) via `Move Patient to IPD`

Transfer behavior:
1. User opens transfer dialog and sets priority, ward, diagnosis, and reason.
2. System creates/updates an OPD->IPD transfer lead in `ipd-transfer-store`.
3. User is routed to `/ipd/admissions?mrn=<patient-mrn>`.
4. IPD Admissions merges static leads + dynamic transfer leads and pre-fills form by MRN.
5. When admission is created, the transfer lead is marked handled and removed from active queue.

## RBAC Model for IPD

### Route-Level Permissions

- `/ipd/dashboard` -> `ipd.read`
- `/ipd/admissions` -> `ipd.admissions.write`
- `/ipd/beds` -> `ipd.beds.read`
- `/ipd/rounds` -> `ipd.rounds.write`
- `/ipd/discharge` -> `ipd.discharge.write`

### Action-Level Enforcement

- Admissions create/save actions require `ipd.admissions.write`.
- OPD->IPD transfer actions require `ipd.transfer.write`.
- Bed allocation/transfer actions require `ipd.beds.write`.
- Discharge checklist completion/final discharge require `ipd.discharge.write`.

### Current Role Mapping (IPD focused)

- `HOSPITAL_ADMIN`
  - Access: `ipd.*` (full IPD access)

- `DOCTOR`
  - Access: `ipd.read`, `ipd.admissions.read`, `ipd.admissions.write`, `ipd.transfer.write`, `ipd.beds.read`, `ipd.rounds.read`, `ipd.rounds.write`, `ipd.discharge.read`, `ipd.discharge.write`

- `NURSE`
  - Access: `ipd.read`, `ipd.admissions.read`, `ipd.beds.read`, `ipd.beds.write`, `ipd.rounds.read`, `ipd.rounds.write`, `ipd.discharge.read`

- `RECEPTION`
  - Access: `ipd.read`, `ipd.admissions.read`, `ipd.admissions.write`

- `CARE_COORDINATOR`
  - Access: `ipd.read`, `ipd.discharge.read`

- `INFECTION_CONTROL`
  - Access: `ipd.read`

## Data and State Notes

- IPD encounter state: `src/screens/ipd/ipd-encounter-context.ts`
- OPD->IPD transfer state: `src/screens/ipd/ipd-transfer-store.ts`
- Admissions queue source merge: `src/screens/ipd/IpdAdmissionsPage.tsx`

Both stores are client-side and persisted in session storage for workflow continuity in the active session.

## Operational Notes

- If user lacks write permission, UI remains visible but write actions are disabled/guarded with alerts.
- If a transfer is requested multiple times for the same MRN, the active transfer lead is updated (not duplicated).
- Admission creation marks the transfer as handled so queue remains current.
