# Lab Module Senior Developer Review

Review date: 2026-04-08

Scope reviewed:
- `src/screens/lab/**`
- `src/store/slices/limsSlice.ts`
- lab routes under `src/app/lab/**`

This is a code and workflow review, not a clinical validation or regulatory audit.

## Executive Summary

The lab module has a solid UI split in newer areas: QC calculation, methods, departments, test catalog, worksheets, and dashboard components are moving toward smaller pages, table components, and dialogs. The Redux slice also gives the module a single place for core LIMS state.

The main risks are workflow correctness and data trust. Several screens still use demo-only state or mock rows, some user actions do not persist to Redux, and important lab rules such as result flags, QC gating, verification, calculated analyses, and rejection states are not enforced consistently. Before production use, treat the current module as a functional prototype and harden the domain layer.

## High Priority Findings

### 1. Verification can mark samples verified before all ordered tests are complete

Where:
- `src/store/slices/limsSlice.ts:86`
- `src/store/slices/limsSlice.ts:201`
- `src/store/slices/limsSlice.ts:291`

`updateSampleToVerifiedIfReady` only checks that no existing result rows are pending. It does not check whether every ordered test/analyte has a result. If only one of several ordered tests is entered and verified, the sample can move to `verified`.

Why it matters:
- A partially resulted sample can be released as complete.
- `autoVerifyNormalResults` can silently verify all normal rows and advance the sample if abnormal or missing rows were never created.

Suggested fix:
- Add a domain helper such as `isSampleResultComplete(sample, results, testCatalog)` that checks ordered tests and required analytes.
- Only allow `verified` when all required rows exist, have valid values, and are verified.
- Track result-level and sample-level statuses separately: `entered`, `pending_verification`, `verified`, `rejected`, `published`.

### 2. Result flagging is hardcoded and can misclassify clinical values

Where:
- `src/screens/lab/analysis-workflow/clients/tabs/ResultEntryTab.tsx:428`
- `src/screens/lab/analysis-workflow/clients/tabs/ResultEntryTab.tsx:811`
- `src/screens/lab/modals/EnterResultsModal.tsx:20`

Flag rules are hardcoded in the component and use `parseFloat`. This misses sex/age-specific ranges, units, critical thresholds per analyte, qualitative results, and values such as `<5`, `>100`, `trace`, or `positive`. The submit path then stores blank `refLow` and `refHigh`, so verification later displays an incomplete reference range.

Why it matters:
- False normal/high/low flags can cause clinical safety issues.
- Critical values are displayed as "physician notification triggered" in UI, but no durable notification event is enforced.

Suggested fix:
- Move flag evaluation into a tested lab domain service, backed by the test catalog or analysis profile data.
- Store reference range, unit, critical low/high, method, and analyzer metadata with every result row at submission time.
- Support structured result types: numeric, bounded numeric, qualitative, free text.

### 3. Test catalog add dialog does not save anything

Where:
- `src/screens/lab/setup/test-catalog/TestCatalogPage.tsx:19`
- `src/screens/lab/setup/test-catalog/components/TestCatalogDialog.tsx:17`
- `src/screens/lab/setup/test-catalog/components/TestCatalogDialog.tsx:135`

`TestCatalogPage` filters `MOCK_SERVICES`, and the dialog fields are uncontrolled. Clicking "Add Analysis" only closes the modal.

Why it matters:
- Users can believe a new analysis was added, but the catalog is unchanged.
- Result entry relies on hardcoded `TEST_PARAMETERS`, so catalog changes would not flow into result entry anyway.

Suggested fix:
- Wire the dialog to form state and a submit callback.
- Store services in Redux or a backend source, not static `MOCK_SERVICES`.
- Use catalog entries to generate result entry rows instead of the local `TEST_PARAMETERS` constant.

### 4. Sample rejection is local-only and disappears on refresh/navigation

Where:
- `src/screens/lab/sample-lifecycle/receive/LabReceivePage.tsx:56`
- `src/screens/lab/sample-lifecycle/receive/LabReceivePage.tsx:95`

Rejecting a sample only updates component state. There is no `rejected` sample status in `SampleStatus`, no persisted reject reason, and no audit entry.

Why it matters:
- A rejected sample may reappear as pending after navigation.
- Audit and traceability are incomplete for a core LIMS workflow.

Suggested fix:
- Add `rejected` or a separate `receptionDecision` model.
- Persist condition, reject reason, rejectedBy, rejectedAt, and audit log event.
- Prevent rejected samples from being assigned to worksheets or result entry.

### 5. Worksheet verification is not tied to sample/result readiness

Where:
- `src/screens/lab/analysis-workflow/worksheets/components/WorksheetDetailView.tsx:123`
- `src/screens/lab/analysis-workflow/worksheets/components/WorksheetDetailView.tsx:132`
- `src/screens/lab/analysis-workflow/worksheets/LabWorksheetsPage.tsx:117`

The worksheet can be submitted or verified based only on the worksheet status. There is no check that all worksheet samples have results, QC passed, critical values are acknowledged, or individual sample statuses are ready.

Why it matters:
- A worksheet can be verified even when its samples are incomplete.

Suggested fix:
- Gate worksheet status transitions through a slice/domain action such as `submitWorksheetForVerification`.
- Reject transition with a typed reason when worksheet progress is below 100% or any sample has pending/rejected results.
- Surface those reasons in the UI.

## Medium Priority Findings

### 6. IDs are generated from array length or `Math.random`

Where:
- `src/store/slices/limsSlice.ts:103`
- `src/store/slices/limsSlice.ts:222`
- `src/store/slices/limsSlice.ts:302`
- `src/screens/lab/qc/calculation/CalculatedAnalysesPage.tsx:45`
- `src/screens/lab/qc/methods/ValidatedMethodsPage.tsx:43`

Array-length IDs and random string IDs are collision-prone after deletion, concurrent edits, reloads, or server synchronization. Partition IDs also use total partition count, not the per-parent count.

Suggested fix:
- Use backend IDs or `crypto.randomUUID()` for client-created draft IDs.
- For human-readable lab accession numbers, generate them server-side or with a monotonic sequence service.
- For partitions, count by `parentId` if the visible ID must be `parent-Pn`.

### 7. Form validation is too permissive in configuration screens

Where:
- `src/screens/lab/qc/calculation/components/CalculatedAnalysisDialog.tsx:61`
- `src/screens/lab/qc/calculation/components/CalculatedAnalysisDialog.tsx:80`
- `src/screens/lab/modals/AddPartitionModal.tsx:67`
- `src/screens/lab/modals/AddTestModal.tsx:50`

Required fields are labeled in UI, but save handlers do not consistently validate them. Formula text is accepted as free text without parsing; partition volume can be zero/negative/blank; empty partition analyses become `[""]`; test prices fall back to zero on bad input.

Suggested fix:
- Use a schema layer such as Zod for form validation.
- Validate numeric ranges, required fields, unique keywords/codes, and formula tokens before saving.
- Show inline errors and disable save until the form is valid.

### 8. Verification tab mixes Redux data with dead mock data and hardcoded counts

Where:
- `src/screens/lab/analysis-workflow/clients/tabs/VerificationTab.tsx:26`
- `src/screens/lab/analysis-workflow/clients/tabs/VerificationTab.tsx:339`
- `src/screens/lab/analysis-workflow/clients/tabs/VerificationTab.tsx:564`

`MOCK_VERIFICATION_ROWS` is still present but unused. The displayed rows come from Redux, while the heading says "11 results pending" regardless of actual count. QC status is always `"1:2s pass"`.

Suggested fix:
- Remove dead mock rows or move them to a story/demo fixture.
- Derive pending count from `displayRows.length`.
- Store and display real QC status from result or run metadata.

### 9. Draft result saving does not persist

Where:
- `src/screens/lab/analysis-workflow/clients/tabs/ResultEntryTab.tsx:803`

`Save Draft` only toggles UI state. Navigating away or switching samples loses entered values.

Suggested fix:
- Add a `saveDraftResults` action or backend mutation.
- Track drafts separately from submitted results so verification cannot see draft rows.

### 10. Performance will degrade as lab data grows

Where:
- `src/store/slices/limsSlice.ts:63`
- `src/screens/lab/analysis-workflow/clients/tabs/ResultEntryTab.tsx:717`
- `src/screens/lab/analysis-workflow/clients/tabs/VerificationTab.tsx:343`
- `src/screens/lab/sample-lifecycle/partitions/LabPartitionsPage.tsx:50`

Several screens repeatedly scan arrays with `find`, `filter`, and `includes` during render. This is fine for the mock dataset but will get expensive for thousands of samples/results.

Suggested fix:
- Add memoized selectors keyed by sample ID, worksheet ID, and result ID.
- Normalize Redux state with entity adapters (`createEntityAdapter`) or maps.
- Move derived joins such as result + sample patient into selectors.

## Security and Compliance Notes

### 11. No obvious direct XSS sink found in lab screens

I did not find `dangerouslySetInnerHTML`, `eval`, direct `innerHTML`, `fetch`, or `localStorage` in `src/screens/lab`. React text rendering gives a good baseline against DOM XSS.

Remaining risks:
- Lab data includes PHI (patient names, phone, DOB, notes). Current UI assumes any user reaching the route can see all lab records.
- Action users are hardcoded (`"Lab Tech"`, `"Pathologist"`, `"System (Automation)"`), so audit events are not attributable to authenticated users.
- Client-side Redux mutations cannot enforce authorization, segregation of duties, or immutable audit logging.

Suggested fix:
- Enforce permission checks on backend mutations and reads.
- Populate audit user from auth context, not hardcoded strings.
- Keep immutable server-side audit logs for result entry, verification, publication, rejection, and critical notifications.
- Avoid putting full PHI in URLs; sample IDs in query params are acceptable only if they are non-sensitive accession identifiers.

## Code Quality Improvements

1. Move lab workflow rules out of UI components.
   - Examples: result flagging, sample verification readiness, worksheet readiness, reflex testing, reagent deduction.
   - Put them in `src/screens/lab` domain utilities or a `src/domain/lab` module with unit tests.

2. Replace broad `any` types in table columns.
   - Examples: `CommonColumn<any>` in worksheets and verification, `row: any` in verification cells, `handleAddPartition(data: any)`.
   - Define small view-model types per table.

3. Centralize lab terminology and status transitions.
   - There are multiple terms for the same lifecycle: `to_be_verified`, `to_verify`, `"To be Verified"`, `analysed`, `"In Analysis"`.
   - Use typed enums/constants and translation helpers for display labels.

4. Remove demo fallback values from production paths.
   - Example: result entry shows `LAB-2025-5021`, "Priya Mehta", and "7 samples pending" when no sample is selected.
   - Prefer an empty state with a sample selector.

5. Clean debug and unused code.
   - Remove `console.log("clicked")` in `LabPartitionsPage`.
   - Remove unused `lab` variables and dead mock constants after migration.

## Recommended Next Steps

1. Stabilize core workflow invariants in `limsSlice` or a domain service:
   - complete result requirement before sample verification
   - persistent rejection state
   - worksheet verification gates
   - audit events for every irreversible action

2. Connect catalog/configuration screens to real state:
   - test catalog add/edit
   - calculation formula validation
   - method validation records

3. Add focused unit tests:
   - `inferFlag` or replacement flagging service
   - sample ready-for-verification logic
   - worksheet progress and transition guards
   - result submission replacing existing analytes without duplicate reagent deduction

4. Add integration tests for the main flows:
   - register/receive sample -> assign worksheet -> enter results -> verify -> publish
   - reject sample at reception
   - critical result entry with notification/audit requirement

5. Normalize data for scale:
   - entity adapters or keyed maps
   - selectors for results by sample and samples by worksheet
   - table pagination/virtualization where datasets can grow.

