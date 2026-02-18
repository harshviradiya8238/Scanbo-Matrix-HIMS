# IPD Flow (Admissions, Bed Management, Clinical Care, Charge/Drug, Discharge)

This document describes the current inpatient (IPD) workflow, role-based access control (RBAC), and OPD-to-IPD transfer behavior.

## Primary IPD Screens

- Dashboard: `/ipd/dashboard`
- Admissions: `/ipd/admissions`
- Bed & Census: `/ipd/beds`
- Clinical Care: `/ipd/rounds`
- Charge / Drug: `/ipd/charges`
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

4. Charge / Drug Review
- Charge capture and DRG validation are reviewed from the IPD charge menu.
- Pharmacy/MAR safety checks and interaction alerts are reviewed in the same workspace.
- Billing and pharmacy clearance flags are synced to IPD encounter state for discharge readiness.

5. Discharge & AVS
- Required checklist + mandatory AVS fields are validated.
- On final discharge, patient is marked discharged and visible in discharge history.
- Bed can be released for next admissions.

## Deep Validation Checklist (Step-by-Step)

Use this section to verify the full IPD workflow deeply from start to finish.

### Phase 0: Pre-check

1. Open IPD dashboard at `/ipd/dashboard`.
2. Confirm you can access:
- `/ipd/admissions`
- `/ipd/beds`
- `/ipd/rounds`
- `/ipd/charges`
- `/ipd/discharge`
3. Optional (for pharmacy/billing integration validation):
- `/pharmacy/dispense?tab=ipd`
- `/billing/invoices`

### Phase 1: Admission Intake

1. Go to `/ipd/admissions`.
2. Pick a patient from queue or create a new admission.
3. Click `Create Admission`.
4. Expected:
- Patient appears in `All IPD Patients - Admitted`.
- If bed not allocated, patient appears in `Admission Queue - Pending Bed`.
- Encounter record is created/updated in IPD encounter context.

### Phase 2: Bed Allocation

1. From Admissions, click `Allocate Bed`, or open `/ipd/beds`.
2. Assign a ward and bed.
3. Expected:
- Patient appears in inpatient/bed census list with updated ward + bed.
- Encounter context reflects bed and ward.

### Phase 3: Clinical Care (Orders + Medications)

1. Open `/ipd/rounds` and select the same patient.
2. In `Orders` tab, place lab/procedure/consult/medication orders.
3. In `Medication Schedule` tab, add/update medication rows and mark dose slots.
4. Expected:
- Order-linked billing entries are generated in clinical billing ledger.
- Medication state updates (`Due`/`Active`/`Given`) update pending medication counts.
- IPD encounter pending counts are recalculated.

### Phase 4: Pharmacy Sync Validation

1. Open `/pharmacy/dispense?tab=ipd`.
2. Select the same patient.
3. Expected:
- IPD prescriptions/medication rows are visible for dispensing workflow.
- Status transitions (`Dispense`, `Given`, `Stop`) are reflected in shared medication state.
- `pharmacyCleared` can progress to ready when pending medication is zero.

### Phase 5: Charge/Drug + Billing Sync Validation

1. Open `/ipd/charges?tab=charges` for the same MRN.
2. Check the charge ledger.
3. Expected:
- Charges include billing ledger rows synced from clinical/order/medication activity.
- `Billing Cleared` and `Pharmacy Cleared` chips reflect encounter status.
4. Switch to `/ipd/charges?tab=drug`.
5. Expected:
- MAR/drug-safety panel is visible with interaction/allergy cues.
- Pharmacy clearance actions stay linked to encounter discharge readiness.

### Phase 6: Discharge Readiness + Final Discharge

1. Open `/ipd/discharge?tab=pending`.
2. For the same patient, complete checklist + required AVS fields.
3. Ensure:
- Pending orders = 0
- Pending diagnostics = 0
- Pending medications = 0
- Billing cleared = true
- Pharmacy cleared = true
- Follow-up ready = true
4. Click `Discharge`.
5. Expected:
- Patient moves to discharged list/history.
- Encounter workflow status becomes `discharged`.
- Bed is available for next allocation.

### Phase 7: End-to-End Negative Tests (Recommended)

1. Keep billing uncleared and attempt discharge.
2. Keep pharmacy uncleared and attempt discharge.
3. Keep pending orders/medications and attempt discharge.
4. Expected:
- Discharge must be blocked with validation feedback.

## Data Sync Map (What Updates Where)

### Core encounter state
- Store key: `scanbo.hims.ipd.encounter-context.v1`
- File: `src/screens/ipd/ipd-encounter-context.ts`
- Tracks: bed/ward, pending counts, `billingCleared`, `pharmacyCleared`, `dischargeReady`, workflow status.

### OPD -> IPD transfer leads
- Store key: `scanbo.hims.ipd.opd-transfer.v1`
- File: `src/screens/ipd/ipd-transfer-store.ts`

### Clinical order/billing ledger (shared)
- Store key: `scanbo.hims.ipd.orders-billing.v1`
- Files:
  - `src/screens/ipd/IpdRoundsPage.tsx`
  - `src/screens/clinical/ClinicalPrescriptionsPage.tsx`
  - `src/screens/ipd/IpdChargeDrugPage.tsx`
- Used by: Clinical billing tab + Charge/Drug charges tab.

### IPD medication/prescription shared state
- Store key: `scanbo.hims.ipd.prescriptions.module.v1`
- Files:
  - `src/screens/clinical/ClinicalPrescriptionsPage.tsx`
  - `src/screens/ipd/IpdRoundsPage.tsx`
  - `src/screens/pharmacy/PharmacyDispensePage.tsx`
- Used by: IPD medication workflows + Pharmacy IPD tab.

### Pharmacy workflow stores
- IPD tab source: `scanbo.hims.ipd.prescriptions.module.v1`
- OPD dispense status: `scanbo.hims.opd.pharmacy-dispense.v1`
- Walk-in POS sales: `scanbo.hims.pharmacy.retail-sales.v1`
- File: `src/screens/pharmacy/PharmacyDispensePage.tsx`

## Quick Route Map for Full Validation

1. `/ipd/admissions`
2. `/ipd/beds`
3. `/ipd/rounds`
4. `/pharmacy/dispense?tab=ipd`
5. `/ipd/charges?tab=charges`
6. `/ipd/charges?tab=drug`
7. `/ipd/discharge?tab=pending`

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
- `/ipd/charges` -> `ipd.discharge.read`
- `/ipd/discharge` -> `ipd.discharge.write`

### Action-Level Enforcement

- Admissions create/save actions require `ipd.admissions.write`.
- OPD->IPD transfer actions require `ipd.transfer.write`.
- Bed allocation/transfer actions require `ipd.beds.write`.
- Charge/drug clearance updates require `ipd.discharge.write`.
- Discharge checklist completion/final discharge require `ipd.discharge.write`.

## Role-by-Action Matrix (Who Performs What)

Use this matrix while testing so there is no confusion about "who can do which action".

| Workflow Action | Permission Needed | Primary Role(s) Who Perform | Other Roles |
| --- | --- | --- | --- |
| View IPD Dashboard (`/ipd/dashboard`) | `ipd.read` | Doctor, Nurse, Reception, Care Coordinator | Hospital Admin, Super Admin, Infection Control |
| Create IPD admission | `ipd.admissions.write` | Reception, Doctor | Hospital Admin, Super Admin |
| OPD -> IPD transfer trigger | `ipd.transfer.write` | Doctor | Hospital Admin, Super Admin |
| Allocate/transfer bed | `ipd.beds.write` | Nurse | Hospital Admin, Super Admin |
| Update rounds/orders/medication schedule in IPD Clinical Care | `ipd.rounds.write` | Doctor, Nurse | Hospital Admin, Super Admin |
| Open Charge/Drug page (`/ipd/charges`) | `ipd.discharge.read` (or `ipd.discharge.write` / `billing.read`) | Doctor, Nurse, Care Coordinator (view) | Billing role (view), Hospital Admin, Super Admin |
| Mark Billing Cleared / Pharmacy Cleared from Charge/Drug | `ipd.discharge.write` | Doctor | Hospital Admin, Super Admin |
| Finalize discharge from Discharge page | `ipd.discharge.write` | Doctor | Hospital Admin, Super Admin |
| IPD dispense actions in Pharmacy (`/pharmacy/dispense?tab=ipd`) | `pharmacy.dispense.write` | Pharmacist | Hospital Admin, Super Admin |
| OPD dispense actions in Pharmacy (`/pharmacy/dispense?tab=opd`) | `pharmacy.dispense.write` | Pharmacist | Hospital Admin, Super Admin |
| Walk-in retail checkout (`/pharmacy/dispense?tab=retail`) | `pharmacy.dispense.write` | Pharmacist | Hospital Admin, Super Admin |
| Final invoice/payment/refund in Billing module | `billing.*` (or page-specific billing permissions) | Billing role | Hospital Admin, Super Admin |

### Important Read-Only Notes

- Roles with read-only permissions can open pages (where route permission allows) but action buttons are disabled in UI.
- In current route config, `/ipd/discharge` requires `ipd.discharge.write`, so roles with only `ipd.discharge.read` do not perform discharge actions there.
- Charge/Drug is intentionally broader for visibility (`ipd.discharge.read` or billing read), but clearance toggles still require `ipd.discharge.write`.

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
