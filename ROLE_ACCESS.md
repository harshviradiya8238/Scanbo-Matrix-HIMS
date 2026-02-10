# Scanbo HIMS Role Access Guide

This document explains role-wise access for the Scanbo HIMS flow. It is aligned with the permission map in `src/core/navigation/permissions.ts`.

## Roles Configured
These are the roles currently implemented in the app:
- Super Admin
- Hospital Admin
- Doctor
- Nurse
- Reception
- Care Coordinator
- Infection Control
- Lab Technician
- Radiology Technician
- Pharmacist
- Billing
- Inventory
- Patient Portal
- Auditor

## Role-to-Flow Mapping (Flowwise Access)

Patient Access and Scheduling
- Reception: Patient registration, appointments, kiosk handoff.
- Hospital Admin: Full access.
- Super Admin: Full access.

OPD Clinical Encounter
- Doctor: OPD encounter, notes, orders, prescriptions.
- Nurse: Vitals, triage, OPD support.
- Hospital Admin: Full access.
- Super Admin: Full access.

Diagnostics and Orders
- Lab Technician: Lab orders and results.
- Radiology Technician: Imaging orders and reports.
- Doctor: Order placement and result review.
- Hospital Admin: Full access.
- Super Admin: Full access.

Inpatient (IPD)
- Doctor: Admissions, rounds, discharge summaries.
- Nurse: Bed board and inpatient workflows.
- Hospital Admin: Full access.
- Super Admin: Full access.

Pharmacy
- Pharmacist: Dispense, stock, prescriptions review.
- Hospital Admin: Full access.
- Super Admin: Full access.

Revenue Cycle
- Billing: Claims, invoices, payments, denials.
- Hospital Admin: Full access.
- Super Admin: Full access.

Post-care and Engagement
- Care Coordinator: Care Companion, follow-ups.
- Doctor: Clinical follow-ups.
- Hospital Admin: Full access.
- Super Admin: Full access.

Infection Control
- Infection Control: Bugsy/infection prevention.
- Doctor/Nurse: Read-only supporting access via patient flows.
- Hospital Admin: Full access.
- Super Admin: Full access.

Patient Portal
- Patient Portal: Limited view of profile, results, appointments, invoices.

Audit and Reporting
- Auditor: Read-only access to reports and audit logs.
- Hospital Admin: Full access.
- Super Admin: Full access.

## Module Access (Epic Reference Sheet)

Implemented Modules (Role Access)
- EpicCare Ambulatory (OPD): Doctor, Nurse, Hospital Admin, Super Admin.
- EpicCare Inpatient / ClinDoc: Doctor, Nurse, Hospital Admin, Super Admin.
- Epic Welcome Kiosk: Reception, Nurse, Hospital Admin, Super Admin.
- Epic Care Companion: Care Coordinator, Hospital Admin, Super Admin.
- Bugsy (Infection Control): Infection Control, Hospital Admin, Super Admin.

Planned Modules (Suggested Access)
- Epic Haiku: Doctor, Nurse.
- Epic Lumens: Hospital Admin, Auditor.
- Epic Care Link: Doctor, Care Coordinator.
- Epic Lucy: Doctor, Nurse.
- Epic Financial Assistance: Billing, Hospital Admin.
- Epic Reporting Workbench: Hospital Admin, Auditor.
- Epic Care Home Health (Dorothy): Care Coordinator, Nurse.
- Epic Chronicles: Hospital Admin, Doctor.
- ASAP: Doctor, Nurse.
- Bones (Orthopedics): Doctor, Nurse.
- OpTime: Doctor, Nurse.
- Anesthesia: Doctor (Anesthesiologist role can be added later).
- Radiant: Radiology Technician, Doctor.
- Beaker: Lab Technician, Doctor.
- Willow: Pharmacist, Doctor.
- Cadence: Reception, Hospital Admin.
- Prelude / Grand Central: Reception, Hospital Admin.
- Resolute Billing: Billing, Hospital Admin.
- MyChart: Patient Portal, Hospital Admin.
- Care Everywhere: Hospital Admin, Doctor.
- Healthy Planet: Care Coordinator, Hospital Admin.
- Epic Beacon (Oncology): Doctor.
- Epic Cupid (Cardiology): Doctor.
- Epic Hyperspace: Doctor, Nurse.
- Epic Open Scheduling: Reception, Patient Portal.
- Epic Stork: Doctor, Nurse.

## Where Permissions Are Enforced
- Sidebar menus: `src/core/navigation/nav-config.ts`
- Role permissions: `src/core/navigation/permissions.ts`
- Route access guard: `src/core/navigation/route-access.ts` + `src/ui/components/AppLayout.tsx`
- Module-specific UI actions: Implemented in OPD/IPD/Kiosk/Care Companion/Infection Control pages.

## Quick Tip
Use `/staff/roles` to inspect live role access in the UI and verify whether a role can see specific menus or modules.
