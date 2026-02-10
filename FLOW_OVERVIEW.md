# Scanbo HIMS Flowwise Module Guide

This document maps the full HIMS journey end-to-end and places every Epic module from the reference sheet in the correct flow stage. Use it as the master checklist for building UI modules and wiring navigation.

## How To Use This Document
1. Start from the **Flow Stages** section to understand the patient journey.
2. Use the **Module Inventory** to see where each Epic module fits and whether it already exists in the app.
3. Use the **Existing Scanbo Routes** section to jump into the current UI and validate linking.
4. Build new UIs using the flow stage as your blueprint, then update the Module Inventory status.

## Flow Stages (End-to-End Journey)

### 1. Patient Access and Scheduling
1. Registration & ADT: Patient registration, insurance capture, admission, discharge, and bed management.
2. Calendar Scheduling: Appointment booking and calendar management.
3. Open Scheduling: Patient self-scheduling without calling, handled in the same Calendar Scheduling workflow.
4. Epic Welcome Kiosk: Self check-in and intake at the front office.
5. MyChart: Patient portal for appointments and messages.

### 2. OPD Clinical Encounter (Outpatient)
1. EpicCare Ambulatory (OPD): The main outpatient encounter workspace.
2. Epic Hyperspace: Primary clinician workstation experience.
3. Epic Haiku: Mobile clinician workflow in OPD.
4. Epic Lucy: Search/assistant to speed up tasks.
5. Epic Care Link: Referrals and shared care plans.

### 3. Diagnostics and Orders
1. Epic Reporting Workbench: Operational reports for OPD/IPD.
2. Radiant: Imaging orders and radiology reporting.
3. Beaker: Laboratory orders and results.
4. Epic Lumens: Analytics and clinical insights.

### 4. Inpatient and Surgery (IPD)
1. EpicCare Inpatient / ClinDoc: Admission notes, daily rounds, discharge summaries.
2. OpTime: Operating room scheduling and procedure documentation.
3. Anesthesia: Intraoperative anesthesia documentation.
4. Epic Stork: OB/GYN and L&D workflows.
5. Bones: Orthopedic workflows and follow-up.

### 5. Emergency
1. ASAP: Emergency department triage, tracking, and discharge.

### 6. Pharmacy and Medications
1. Willow: Medication verification, dispensing, and inventory.

### 7. Revenue Cycle and Financial
1. Resolute Billing: Claims, coding, denials, and payments.
2. Epic Financial Assistance: Patient financial support and eligibility.

### 8. Post-care, Home Health, and Engagement
1. Epic Care Companion: Reminders, check-ins, and patient engagement.
2. Epic Care Home Health (Dorothy): Home visits and remote follow-up.
3. MyChart: Results viewing, messaging, online payments.

### 9. Infection Control and Safety
1. Bugsy (Infection Control): Tracking infections, isolation, audits, actions.

### 10. Interoperability and Population Health
1. Care Everywhere: Sharing records with external providers.
2. Healthy Planet: Registries, risk stratification, population outcomes.

### 11. Specialty Lines
1. Epic Beacon (Oncology): Chemo plans, treatment cycles, follow-ups.
2. Epic Cupid (Cardiology): Cardiology documentation, imaging/hemodynamics.

### 12. Longitudinal Record
1. Epic Chronicles: Complete longitudinal patient record.

## Module Inventory (Epic Reference Sheet)

Legend:
- Implemented = full UI exists in Scanbo.
- Placeholder = route exists but UI is not built.
- Not Created = no route/UI yet.

| Category | Module | Flow Stage | Scanbo Route | Status |
| --- | --- | --- | --- | --- |
| Clinical | EpicCare Ambulatory (OPD) | OPD Clinical Encounter | `/clinical/modules/ambulatory-care-opd` | Implemented |
| Clinical | EpicCare Inpatient / ClinDoc | Inpatient and Surgery | `/clinical/modules/inpatient-documentation-clindoc` (also `/ipd/rounds`) | Implemented |
| Clinical | Epic Welcome Kiosk | Patient Access and Scheduling | `/clinical/modules/welcome-kiosk` | Implemented |
| Clinical | Epic Care Companion | Post-care, Home Health, and Engagement | `/clinical/modules/care-companion` | Implemented |
| Clinical | Bugsy (Infection Control) | Infection Control and Safety | `/clinical/modules/bugsy-infection-control` | Implemented |
| Clinical | Epic Haiku | OPD Clinical Encounter | `/clinical/modules/haiku-mobile` | Placeholder |
| Clinical | Epic Lumens | Diagnostics and Orders | `/clinical/modules/lumens-insights` | Placeholder |
| Clinical | Epic Care Link | OPD Clinical Encounter | `/clinical/modules/care-link` | Placeholder |
| Clinical | Epic Lucy | OPD Clinical Encounter | `/clinical/modules/lucy-assistant` | Placeholder |
| Clinical | Epic Financial Assistance | Revenue Cycle and Financial | `/clinical/modules/financial-assistance` | Placeholder |
| Clinical | Epic Reporting Workbench | Diagnostics and Orders | `/clinical/modules/reporting-workbench` | Placeholder |
| Clinical | Epic Care Home Health (Dorothy) | Post-care, Home Health, and Engagement | `/clinical/modules/home-health-dorothy` | Placeholder |
| Clinical | Epic Chronicles | Longitudinal Record | `/clinical/modules/chronicles` | Placeholder |
| Emergency | ASAP | Emergency | Not created | Not Created |
| Emergency | Bones (Orthopedics) | Inpatient and Surgery | Not created | Not Created |
| Surgery | OpTime | Inpatient and Surgery | Not created | Not Created |
| Surgery | Anesthesia | Inpatient and Surgery | Not created | Not Created |
| Radiology | Radiant | Diagnostics and Orders | `/clinical/modules/radiant` | Implemented |
| Laboratory | Beaker | Diagnostics and Orders | Not created | Not Created |
| Pharmacy | Willow | Pharmacy and Medications | Not created | Not Created |
| Patient Access | Calendar Scheduling | Patient Access and Scheduling | `/appointments/calendar` | Implemented |
| Patient Access | Registration & ADT | Patient Access and Scheduling | `/clinical/modules/prelude-grand-central` | Implemented |
| Revenue Cycle | Resolute Billing | Revenue Cycle and Financial | Not created | Not Created |
| Patient Portal | MyChart | Post-care, Home Health, and Engagement | Not created | Not Created |
| Interoperability | Care Everywhere | Interoperability and Population Health | Not created | Not Created |
| Population Health | Healthy Planet | Interoperability and Population Health | Not created | Not Created |
| Oncology | Epic Beacon | Specialty Lines | Not created | Not Created |
| Cardiology | Epic Cupid | Specialty Lines | Not created | Not Created |
| Clinical Core | Epic Hyperspace | OPD Clinical Encounter | Not created | Not Created |
| Scheduling | Open Scheduling | Patient Access and Scheduling | `/appointments/calendar` | Implemented |
| Obstetrics | Epic Stork | Inpatient and Surgery | Not created | Not Created |

## Existing Scanbo Routes (Non‑Epic Screens Used in the Flow)
These screens already exist in the app and are connected to the five implemented Epic modules.

OPD Flow
1. `/appointments/calendar`
2. `/appointments/queue`
3. `/appointments/visit`
4. `/clinical/vitals`
5. `/clinical/notes`
6. `/clinical/orders`
7. `/clinical/prescriptions`

IPD Flow
1. `/ipd/admissions`
2. `/ipd/beds`
3. `/ipd/rounds`
4. `/ipd/discharge`

Patient Access
1. `/patients/registration`
2. `/patients/profile`
3. `/patients/list`
4. `/patients/documents`

## Navigation Tip (MRN Context)
Most flows accept an MRN query param to keep patient context, for example:
- `/appointments/queue?mrn=MRN-245781`
- `/ipd/rounds?mrn=MRN-245990`

## Flow Overview Screen
Use the visual map at:
- `/clinical/flow-overview`

This page shows intake, OPD, IPD, and post-care steps with direct links that preserve MRN context.

## Suggested Build Order (When Creating New UI)
1. Patient Access and Scheduling (Registration & ADT, Calendar Scheduling, Open Scheduling).
2. Diagnostics and Orders (Beaker).
3. Pharmacy (Willow).
4. Revenue Cycle (Resolute Billing, Financial Assistance).
5. Emergency and Surgery (ASAP, OpTime, Anesthesia).
6. Specialty Lines (Stork, Beacon, Cupid, Bones).
7. Interoperability and Population Health (Care Everywhere, Healthy Planet).
8. Analytics and Record (Lumens, Reporting Workbench, Chronicles).
