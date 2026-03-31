# Laboratory Flow (LIMS - Hospital Perspective)

This document describes the Laboratory Information Management System (LIMS) workflow, role-based access control (RBAC), and integration with the broader Hospital Information Management System (HIMS). The flow is designed to be a "global-level" system inspired by **Senaite LIMS** while tailored for hospital operations.

## Primary Laboratory Screens

- **Laboratory Dashboard**: `/lab/dashboard` (KPIs, TAT monitoring, workload)
- **Sample Management**: `/lab/samples` (Lifecycle: Register -> Receive -> Assign -> Result -> Verify -> Publish)
- **Analysis Workflow (Results)**: `/lab/clients` (Tabbed view: Result Entry, Verification, Published Reports)
- **Test Catalog**: `/lab/test-catalog` (Manage tests, departments, methods, and pricing)
- **QC Samples**: `/lab/qc` (Quality Control tracking and records)
- **Instruments**: `/lab/instruments` (Equipment status and calibration logs)
- **Inventory**: `/lab/inventory` (Reagents and consumable tracking)

---

## End-to-End Laboratory Workflow

The workflow follows the standard LIMS state machine (Open -> Received -> Assigned -> Analysed -> Verified -> Published).

### 1. Pre-Analytical Phase (Request & Collection)

- **Order Trigger**: Doctor places a lab order from OPD (`/appointments/queue`) or IPD (`/ipd/rounds`).
- **Sample Selection**: System identifies required sample types (Blood, Urine, Swab) based on test configuration.
- **Collection**: Phlebotomist collects the sample and marks it as "Collected" in the system.
- **Accessioning**: System generates a unique **Lab ID** and **Barcode** for the sample.

### 2. Analytical Phase (Lab Processing)

- **Reception**: Lab Technician receives the physical sample and clicks `Mark Received` in the system to acknowledge arrival.
- **Assignment**: Samples are assigned to specific **Analysts** or **Worksheets** (grouping by instrument or department).
- **Analysis**: The test is performed. Results are either:
  - Automatically imported via **Instrument Integration** (Middleware).
  - Manually entered via the `Enter Results` modal.
- **Submission**: Once results are saved, the status moves to `Analysed`.

### 3. Post-Analytical Phase (Verification & Dispatch)

- **Verification**: A Senior Pathologist or Laboratory Head reviews the results. They can:
  - **Approve**: Move status to `Verified`.
  - **Reject/Retest**: Send back for re-analysis if results are suspect.
- **Publication**: Verified results are "Published", making them immutable and generating the final report.
- **Doctor Notification**: Results are pushed back to the Patient's EMR and become visible to the ordering physician.

---

## Deep Validation Checklist

### Phase 1: Sample Intake

1. Go to `/lab/samples`.
2. Click `Add Sample` (Simulating a new request).
3. Select Patient, Client, Sample Type, Priority, and Tests.
4. **Expected**:
   - Sample appears in the list with status `registered`.
   - Audit log reflects "New sample received".

### Phase 2: Lab Reception

1. Select a `registered` sample.
2. Click `Mark Received`.
3. **Expected**:
   - Status changes to `received`.
   - Sample is now eligible for analyst assignment.

### Phase 3: Assignment & Analysis

1. Select a `received` sample.
2. Choose an Analyst from the dropdown and click `Assign`.
3. Click `Enter Results` for a specific analysis (e.g., CBC).
4. Enter values and click `Submit`.
5. **Expected**:
   - Status changes to `analysed`.
   - Results tab shows the entered data with appropriate high/low flags.

### Phase 4: Verification & Approval

1. Select an `analysed` sample.
2. Review findings in the `Results` tab.
3. Click `Verify`.
4. **Expected**:
   - Status changes to `verified`.
   - Result rows are marked as `verified`.

### Phase 5: Publication & Reporting

1. Select a `verified` sample.
2. Click `Publish`.
3. **Expected**:
   - Status changes to `published`.
   - Sample becomes read-only (immutable).
   - Report is ready for download/print.

---

## Detailed Navigation & Interaction Map

| Button/Action   | Screen         | Target Status | Resulting Interaction                              |
| --------------- | -------------- | ------------- | -------------------------------------------------- |
| `Add Sample`    | `/lab/samples` | `registered`  | Opens modal to capture patient/test info.          |
| `Mark Received` | `/lab/samples` | `received`    | Acknowledges physical receipt of sample in lab.    |
| `Assign`        | `/lab/samples` | `assigned`    | Assigns a specific technician to the sample.       |
| `Enter Results` | `/lab/samples` | `analysed`    | Opens result entry form for one or more analytes.  |
| `Verify`        | `/lab/samples` | `verified`    | Final technical review by authorized personnel.    |
| `Publish`       | `/lab/samples` | `published`   | Finalizes report and pushes to EMR/Patient Portal. |
| `Retest`        | `/lab/clients` | `received`    | (Proposed) Clears current results for a re-run.    |

---

## Global HIMS Integration Features (Proposed Additions)

To make it a true global-level system, the following features should be integrated:

1. **Instrument Middleware**: Direct socket-based communication with lab analyzers (Sysmex, Roche, etc.) to eliminate manual entry errors.
2. **Reagent Inventory Sync**: Automatically decrement reagent stock on hand when a test is performed (Integration with `/inventory`).
3. **Dynamic Reference Ranges**: Reference ranges that automatically adjust based on Patient Age, Gender, and Pregnancy status (captured from HIMS Patient profile).
4. **Critical Value Alerts**: Automated SMS/Notification to the Doctor if a result falls in the critical/life-threatening range.
5. **TAT Analytics Dashboard**: Monitor bottlenecks (e.g., "Time from collection to reception" or "Time from analysis to verification").
6. **Multi-Location Sync**: Support for "Spoke-Hub" models where samples are collected at clinics (Spokes) but processed at a central Lab (Hub).

---

## Role-Based Access Control (RBAC)

| Role                       | Permissions                               | Primary Responsibilities                      |
| -------------------------- | ----------------------------------------- | --------------------------------------------- |
| **Lab Technician**         | `lab.samples.write`, `lab.results.write`  | Registering, receiving, and entering results. |
| **Analyst**                | `lab.results.write`                       | Performing tests and submitting findings.     |
| **Lab Head / Pathologist** | `lab.verify.write`, `lab.publish.write`   | Verifying accuracy and signing off reports.   |
| **Lab Admin**              | `lab.catalog.write`, `lab.settings.write` | Managing test menus, prices, and instruments. |
| **Doctor**                 | `lab.results.read`                        | View final reports and track order status.    |

---

## Data Structure Highlights (LIMS Store)

- **Store**: `limsSlice` (Redux)
- **Key entities**:
  - `samples`: Tracks status, patient link, and workflow state.
  - `results`: Individual analyte data (Id, Result, Flag, Ref Ranges).
  - `auditLog`: Immutable trail of every status change and user action.
  - `testCatalog`: Definition of tests, departments, and SOPs.
