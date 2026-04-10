# Infection Control in Global HIM System

## Overview
In a global Health Information Management System, Infection Control is a core clinical safety module, not an optional add-on. It must be embedded across patient profile, IPD/OPD, lab, clinical workflows, and hospital reporting so infection risk and containment are visible everywhere.

## Why Infection Control Must Be Global
- Infection control enforces patient safety, outbreak prevention, and regulatory compliance.
- A global HIM needs a single source of truth for infection cases, isolation status, and pathogen alerts.
- It must connect patient records, lab cultures, admissions, transfers, and audit actions.
- Without it, infection visibility becomes fragmented, and clinical staff lose trust in the HIM.

## What This Repo Already Has
- `Bugsy (Infection Control)` is defined as a clinical module in `src/screens/clinical/module-registry.ts` and `FLOW_OVERVIEW.md`.
- The module is exposed at `/clinical/modules/bugsy-infection-control` via the clinical module loader.
- Patient profile also has an `Infection Control` tab in `src/screens/ patients/PatientProfile/ tabs/InfectionTab.tsx`.
- The infection control page uses MRN context via `useMrnParam()` and stores case data in `src/mocks/infection-control.ts`.
- Permissions are implemented under `clinical.infection_control` and linked from `ROLE_ACCESS.md`.

## What Still Needs Improvement
### 1. Stronger cross-module integration
- Make infection status available in the patient profile, IPD bed board, lab results, and encounter workflows.
- Ensure `?mrn=XXX` propagation is consistent from patient profile to infection module, lab results, and IPD flows.
- Add infection alerts to patient summary cards and patient search results when a case is active.

### 2. Better patient linkage
- Link Infection Control cases directly with patient MRN and active encounter data.
- Use patient profile and patient workflows menus as the single entry points for infection review.
- Include Infection Control in any workflow that touches IPD admissions, transfers, or isolation room management.

### 3. Lab and clinical data flow
- Connect infection cases to lab orders and results, especially microbiology, cultures, and sensitivity reports.
- Display relevant lab sample/pending test status in the infection case detail screen.
- If a patient has an active infection case, lab workflows should surface that case context automatically.

### 4. Audit and action tracking
- Add structured audit records, isolation decisions, and notification history to each case.
- Provide actions for isolation, notification, and case closure inside the infection workflow.
- Ensure audit tasks are visible to infection control users, nurses, and clinical supervisors.

### 5. Global reporting and dashboards
- Add global infection metrics such as active cases, isolation occupancy, pathogen counts, and audit completion.
- Create a hospital-level dashboard or tile for infection control performance.
- Tracking should include both active cases and closed-case history for compliance.

## Recommended Global HIM Architecture
1. Core infection module
   - Route: `/clinical/modules/bugsy-infection-control`
   - Primary data: infection cases, isolation rooms, audits, notifications.
2. Patient profile integration
   - Show infection badges and active cases in `/patients/profile?mrn=XXX`.
   - Add workflow links to lab results and IPD pages.
3. MRN-based context propagation
   - Use `useMrnParam()` across clinical and diagnostic pages.
   - Keep MRN query parameters consistent between profile, patient search, and infection module.
4. Permission-based access
   - Use the existing permission namespace `clinical.infection_control`.
   - Define read/write roles clearly for infection control, admin, and clinical staff.

## Evaluation
- Current implementation: **8/10**
- Why: The repo already has a solid infection control concept, module route, permissions, and patient tab.
- What keeps it from 10/10: missing deeper cross-module data linking, global reporting, and tighter lab/clinical workflow integration.

## Next Steps
- Document the infection case lifecycle from detection to isolation and closure.
- Define the infection data model and required fields (case ID, MRN, organism, status, isolate type, audit records, linked lab orders).
- Add explicit role definitions for infection control users, infection prevention specialists, and hospital admins.
- Add a dashboard or status tile for active infection cases and isolation resource usage.
- Link infection control to lab results and IPD workflows using MRN context.

## Practical recommendation for this repo
- Keep `Bugsy (Infection Control)` as a top-level clinical module.
- Make infection control visible across patient profile and key clinical pages instead of leaving it isolated behind one module screen.
- Add a short repo-level architecture note to `FLOW_OVERVIEW.md` or `ROLE_ACCESS.md` clarifying that infection control is a hospital-wide clinical governance module.

## Flow Change Plan
The current repo flow should be updated to make infection control part of patient context and cross-module navigation.

1. Navigation and module exposure
   - Keep the clinical nav item in `src/core/navigation/nav-config.ts` under `clinical-emr` with `requiredPermissions: ['clinical.infection_control.read']`.
   - Ensure `src/app/clinical/modules/[moduleId]/ClinicalModuleClient.tsx` renders `InfectionControlPage` for `bugsy-infection-control`.

2. Patient profile and workflows
   - In `src/screens/patients/PatientProfile/tabs/InfectionTab.tsx`, surface the active infection case summary and link to `/clinical/modules/bugsy-infection-control?mrn=XXX`.
   - Update `docs/PATIENT_PROFILE_AND_LINKING.md` to explicitly include Infection Control in the patient workflows menu.

3. MRN context propagation
   - Use `useMrnParam()` consistently on the infection page and related clinical/diagnostic pages.
   - Preserve MRN query parameters when navigating from profile to infection, lab results, IPD beds, and rounds.

4. Lab and IPD linkage
   - Add a visible infection badge or alert to lab results when the patient has an active infection case.
   - Add infection status or case access on IPD bed board, admission, and transfer pages.

5. Reporting and dashboard visibility
   - Add hospital-level infection metrics to a dashboard tile or summary card.
   - Expose active case count, isolation occupancy, and audit status in a global infection control summary.

6. Documentation update
   - Add this flow plan to the guide so the repo’s current state is mapped to the desired infection control flow.
   - Update `FLOW_OVERVIEW.md` to show `Bugsy (Infection Control)` as part of the global clinical flow, not just a standalone module.

## Implemented Flow Mapping
- Navigation: `clinical-emr` exposes `Infection Control` with `clinical.infection_control.read`, and the clinical module loader renders `InfectionControlPage` for `bugsy-infection-control`.
- Patient profile: the Infection Control tab summarizes active cases and opens Bugsy with `?mrn=XXX`.
- MRN propagation: infection, lab result, IPD bed, admission, and rounds links preserve MRN context for profile-to-workflow navigation.
- Lab and IPD linkage: active infection cases surface as warnings/badges in lab results, IPD bed management, IPD admissions, and IPD rounds.
- Dashboard visibility: hospital dashboard and Bugsy summary expose active case count, isolation occupancy, and open audit status.
- Global flow: `FLOW_OVERVIEW.md` treats Bugsy as a clinical safety layer that spans patient profile, diagnostics, IPD beds/transfers, rounds, and hospital reporting.

## Bugsy Workflow Status Against Requested Flow
This section maps the requested infection control behavior to the current repo implementation.

### 1. Detect — Lab Auto-Flag, Physician Report, Nursing Flag
Status: Mostly implemented at UI/mock-data level.

- The Detect flow exists in `InfectionControlPage.tsx` and `DetectTabContent.tsx`.
- The New Case dialog supports patient linkage from IPD, pathogen details, priority, detection source, reporting physician, detected date, notes, and auto-trigger actions.
- Detection source includes `Lab Auto-Flag (LIS)`, `Physician Report`, and `Nursing Flag`.
- Auto-trigger options include assign isolation room, notify HOD, notify IPC officer, schedule audit, and outbreak flag.
- The Detect right panel shows a lab feed with auto-flag style entries.
- Current limitation: LIS is represented by mock/static data, not a real backend/LIS event stream. Auto-trigger checkboxes are captured in the form but are not yet a full automation engine.

### 2. Isolate — Room Map, Isolation Type, Dynamic PPE
Status: Implemented, with dynamic PPE recently added.

- The Isolate tab shows the case table, PPE checklist, and a room map.
- Room map statuses are visually color-coded for occupied, free, cleaning, and maintenance.
- The isolation dialog supports Contact, Droplet, Airborne, and Standard precautions.
- PPE requirements are shown in the isolation dialog.
- The PPE checklist in the Isolate tab is now patient-aware: it resolves by selected MRN first, then isolation type, then default PPE checklist.
- Checkbox state is scoped per selected patient/MRN so one patient’s checklist changes do not overwrite another patient’s checklist.
- Current limitation: room assignment still uses mock room data and does not persist to a backend resource scheduler.

### 3. Notify — Multi-Channel Notification
Status: Mostly implemented at UI/mock-data level.

- The Notify tab exists and shows notification feed data.
- Send targets include IPC Officer, HOD, Nursing Supervisor, Lab Lead, HMIS Broadcast, SMS, Email, and Regulatory `(RNTCP/IDSP)`.
- Notification feed includes critical, exposure, acknowledged, and lab-ready style events.
- The case table has a contextual `Send Notification` action on the Notify tab.
- Current limitation: SMS, Email, HMIS broadcast, and regulatory reporting are mock UI selections only. There is no real delivery gateway or escalation receipt tracking yet.

### 4. Audit — IPC Compliance Audit
Status: Implemented for the main UI.

- The Audit tab exists and has a contextual `Log Audit` action.
- Audit dialog supports audit type, ward, score, lead auditor, linked patient, date, findings, and corrective action.
- Audit checklist includes WHO hand hygiene observations, point-of-care alcohol rub, staff training, cleaning log review, and missing PPE signage items.
- Right panel shows compliance scores such as hand hygiene, PPE compliance, environmental cleaning, bundle care, and isolation protocol.
- Right panel shows `92%` last-7-days compliance and a `Download Report` action.
- Current limitation: download is UI-only and compliance scoring is mock/static; no generated PDF/report file is produced.

### 5. Close — Strict Closure Criteria
Status: Partially implemented.

- The Close tab exists and shows cases ready for closure.
- Closure criteria data includes 3 consecutive negative cultures, isolation for at least 72h post-last-positive, terminal cleaning, all exposed contacts screened, and final audit score at least 85%.
- Close case dialog requires closing physician and closure criteria confirmation before closing.
- Case status updates to `Closed` after confirmation.
- Current limitation: criteria are not independently validated against real lab/audit/contact-tracing data. The dialog uses confirmation rather than backend evidence checks.

## Strengths Confirmed
- The five-step sequence `Detect -> Isolate -> Notify -> Audit -> Close` is clinically logical and is present in the UI.
- Lab auto-flag concepts are visible through detection source and lab feed.
- Isolation room status map is practically useful and visible in the Isolate step.
- Case timeline data exists for patient case history and audit trail style review.
- Closure criteria are clear and aligned with infection control practice.
- MRN context is carried into Bugsy and related clinical links.
- Hospital-level active case, isolation occupancy, and audit summary metrics are visible.

## Gaps Still Open
- Contact tracing: no dedicated contact tracing screen exists yet for exposed patients and exposed staff.
- Outbreak management: outbreak flag exists in the New Case form, but there is no dedicated outbreak dashboard or cluster analytics view.
- Role-based views: route permissions exist through `clinical.infection_control.read/write`, but the UI does not yet render distinct nurse, IPC officer, and HOD views.
- Escalation logic: there is no 48-hour auto-escalation rule if isolation is not assigned.
- Real integrations: LIS, SMS, Email, HMIS broadcast, regulatory reporting, PDF download, and backend persistence are still mock/UI-level.

## Practical Status
Current status against the requested flow: about 75-80% functionally represented in the frontend.

The flow is good enough for a clinical workflow demo and frontend validation. It is not yet complete for production-grade infection control because contact tracing, outbreak dashboarding, role-specific views, escalation rules, and real external integrations are still missing.

## Recommended Next Build Steps
1. Add a Contact Tracing tab or side panel linked to each infection case MRN.
2. Add an Outbreak Dashboard for pathogen clusters by ward, time window, and organism.
3. Add role-based view modes for nurse, IPC officer, HOD, and admin users.
4. Add escalation rules, starting with `isolation not assigned within 48h`.
5. Replace mock LIS/notification/reporting data with backend-backed events and delivery receipts.
