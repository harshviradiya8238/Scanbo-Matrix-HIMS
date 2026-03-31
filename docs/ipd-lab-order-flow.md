# IPD → Doctor Order → Lab Flow — Implementation Guide

> **Role context:** This documentation explains the full inpatient (IPD) lab order lifecycle as seen
> when logged in as **Lab Manager** (`LAB_MANAGER`). Every section maps to actual code files &
> mock data in the project.

---

## 1. The Full Flow — Bird's Eye View

```
[Doctor — IPD Ward / ICU]
        │
        │  Places lab order (e.g. CBC, Troponin, CRP)
        ▼
[Order REGISTERED in Lab System]          ← status: "registered"
        │
        │  Phlebotomist collects sample from bedside
        ▼
[Sample RECEIVED at Lab Reception]         ← status: "received"
  → Page: Lab › Receive  (/lab/receive)
        │
        │  Lab Tech assigns analyst and worksheet
        ▼
[Sample ASSIGNED to Analyst]               ← status: "assigned"
  → Page: Lab › Samples  (/lab/samples)
        │
        │  Analyst runs tests on instrument, enters results
        ▼
[Sample ANALYSED — results entered]        ← status: "analysed"
  → Page: Lab › Samples → Analyses tab
        │
        │  Lab Manager / Pathologist verifies results
        ▼
[Sample VERIFIED]                           ← status: "verified"
        │
        │  Lab Manager publishes the report
        ▼
[Report PUBLISHED — visible to Doctor]     ← status: "published"
  → Page: Orders & Tests › Lab Result  (/ipd/orders-tests/lab)
```

---

## 2. Where to See Each Stage

### Step 1 — Doctor Placing the Order

**Who:** DOCTOR or NURSE  
**Where in the app:** `IPD / Inpatient` → `Clinical Care` → **Orders & Tests**  
**Nav item:** `Orders & Tests > Order Management` → `/ipd/orders-tests/orders`

Orders from IPD wards automatically appear in the Lab module as samples with
`status: "registered"` and `client: "WARD-<wardName>"`.

---

### Step 2 — Lab Manager Sees Incoming Orders

**Who:** LAB_MANAGER  
**Where in the app (when logged in as Lab Manager):**

```
Sidebar → Sample Lifecycle → IPD Orders   (route: /lab/ipd-orders)
```

This is the **new `IpdLabOrdersPage`** added in this implementation.

**What you see:**

- A KPI strip (Total orders, Pending, In-Progress, Completed)
- Red alert banner for STAT priority orders
- Tabbed table: All · Pending (New) · In Progress · Completed
- Each row shows: Patient, Ward/Bed, Priority, Consultant, Diagnosis, Tests Ordered, Current Status

**Clicking any row** opens the full sample detail in `/lab/samples?id=<sampleId>`.

---

### Step 3 — Receive the Sample

**Who:** LAB_MANAGER / LAB_TECH  
**Page:** `Sample Lifecycle → Receive` → `/lab/receive`

The `LabReceivePage` lists all samples in `registered` or `received` status. The lab tech:

1. Verifies sample condition (Acceptable / Haemolysed / Clotted / etc.)
2. Clicks **Accept** → dispatches `updateSampleStatus({ sampleId, status: "received" })` + appends audit log

---

### Step 4 — Assign Analyst and Worksheet

**Who:** LAB_MANAGER  
**Page:** `Sample Lifecycle → Samples` → `/lab/samples`

In the sample detail view:

1. Select analyst from dropdown → dispatches `assignAnalyst({ sampleId, analyst })`
2. Status auto-updates to `"assigned"`
3. Sample can be added to a **Worksheet** (`Analysis Workflow → Worksheets`)

---

### Step 5 — Enter Results

**Who:** LAB_TECH / Analyst  
**Page:** `/lab/samples` → click sample → **Analyses** tab → **Enter Results**

Each test (CBC, CRP, etc.) has an "Enter Results" button that opens `EnterResultsModal`.
Dispatches `addResults([...LabResultRow])`. Status auto-transitions to `"analysed"` when
all tests have entries.

---

### Step 6 — Verify Results

**Who:** LAB_MANAGER / Pathologist  
**Page:** `/lab/samples` → sample detail → **Verify** button  
Also: `Analysis Workflow → Clients → Verification tab`

Dispatches `verifyAllPendingForSample({ sampleId, verifiedBy: "Supervisor" })`.
Status transitions to `"verified"`.

---

### Step 7 — Publish Report

**Who:** LAB_MANAGER  
**Page:** `/lab/samples` → sample detail → **Publish** button

Dispatches `publishSample({ sampleId })`. Status transitions to `"published"`.

The published report is then visible to the doctor at:
`Orders & Tests → Lab Result` → `/ipd/orders-tests/lab`

---

## 3. Dummy Data — IPD Samples Added

All IPD samples are in `src/mocks/lab/labSamples.ts`.

They use `client: "WARD-<X>"` to mark them as IPD-originated.

| Sample ID      | Patient       | Ward       | Status     | Tests               | Doctor/Consultant   |
| -------------- | ------------- | ---------- | ---------- | ------------------- | ------------------- |
| S-IPD-2026-001 | Arvind Sharma | ICU        | registered | CBC, CMP, Troponin  | Dr. K. Anand        |
| S-IPD-2026-002 | Neha Sinha    | Medical-1  | received   | HBA1C, GLU, INSULIN | Dr. Vidya Iyer      |
| S-IPD-2026-003 | Rahul Menon   | Medical-2  | assigned   | CRP, PCT, LFT       | Dr. Nisha Rao       |
| S-IPD-2026-004 | Sneha Patil   | Surgical-1 | analysed   | CBC, CRP            | Dr. Sameer Kulkarni |
| S-IPD-2026-005 | Tanvi Kapoor  | Medical-1  | verified   | UA, CS              | Dr. Vidya Iyer      |
| S-IPD-2026-006 | Arvind Sharma | ICU        | published  | CBC, CMP            | Dr. K. Anand        |
| S-IPD-2026-007 | Dev Malhotra  | ER         | registered | CBC, LFT, RFT, CRP  | Dr. Nisha Rao       |

> These samples **cover every stage** of the workflow so you can click through the entire lifecycle.

---

## 4. Files Changed / Added

| File                                              | Change                                                      |
| ------------------------------------------------- | ----------------------------------------------------------- |
| `src/mocks/lab/labSamples.ts`                     | Added 7 IPD-originated samples across all 6 workflow stages |
| `src/mocks/lab/labResults.ts`                     | Added 13 result rows for IPD samples                        |
| `src/core/navigation/nav-config.ts`               | Added `IPD Orders` menu item under `Sample Lifecycle`       |
| `src/screens/lab/ipd-orders/IpdLabOrdersPage.tsx` | **New page** — IPD orders queue for Lab Manager             |
| `src/app/lab/ipd-orders/page.tsx`                 | **New route** — Next.js page wrapper                        |

---

## 5. Redux State — limsSlice

All lab data lives in `src/store/slices/limsSlice.ts` under the `lims` key.

Key actions used in this flow:

| Action                      | When used                              |
| --------------------------- | -------------------------------------- |
| `addSample`                 | When a new order is registered         |
| `updateSampleStatus`        | Moving any sample between states       |
| `assignAnalyst`             | Assigning a lab analyst                |
| `assignWorksheet`           | Adding sample to an analysis batch     |
| `addResults / addResult`    | Entering test results                  |
| `verifyAllPendingForSample` | Lab Manager verifies                   |
| `publishSample`             | Lab Manager publishes report           |
| `appendAudit`               | Every action writes to the audit trail |

---

## 6. How to Demo the Full Flow (as Lab Manager)

1. **Switch role** → click the role switcher in the top bar → select **Lab Manager**
2. **Sidebar** → `Sample Lifecycle` → **IPD Orders**
   - You'll see 7 IPD orders with colour-coded priorities
   - Red alert banner for STAT orders
3. **Click** `S-IPD-2026-001` (Arvind Sharma, STAT, ICU) → opens in Samples page
   - Status: `Registered` — click **Mark Received**
   - Assign analyst → click **Assign**
   - Go to **Analyses** tab → click **Enter Results** for each test
   - Click **Verify** → **Publish**
4. **Receive tab** → `Sample Lifecycle` → **Receive**
   - See `S-IPD-2026-002` (Neha Sinha) with `received` status
5. **Samples tab** → check `S-IPD-2026-003` (assigned), `S-IPD-2026-004` (analysed)
6. **Clients** → **Verification** tab → see samples awaiting final sign-off

---

## 7. Role-Based Access Summary

| Role           | IPD Orders page | Samples page | Receive page | Verify/Publish |
| -------------- | --------------- | ------------ | ------------ | -------------- |
| DOCTOR         | ❌              | ❌           | ❌           | ❌             |
| NURSE          | ❌              | ❌           | ❌           | ❌             |
| LAB_MANAGER    | ✅              | ✅           | ✅           | ✅             |
| HOSPITAL_ADMIN | ✅              | ✅           | ✅           | ✅             |

The `LAB_MANAGER` role has `diagnostics.lab.*` wildcard permission which unlocks all lab pages.

---

_Generated: 2026-03-31 | Scanbo Matrix HIMS | Lab Module v2_
