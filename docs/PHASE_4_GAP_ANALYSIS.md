# Global HIMS - Phase 4 Frontend (UI) Gap Analysis

**Overall Frontend Status:** ~60% Complete (Advanced progress!)
_Unlike Phase 2 and 3, your Phase 4 (Revenue Cycle & Billing) has a massive head start. You already have a dedicated `billing` folder with robust UI pages for Invoices, Receipts, Outstanding Dues, TPA, and Daybooks. However, to match the "Epic Resolute & Financial Assistance" global standard, several specialized UI modules are still missing._

---

## 1. Professional Billing UI (Resolute PB) — Outpatient/Doctor Fees

_You already have `OpdBillingPage.tsx` and `OutstandingDuesPage.tsx`, but missing advanced claiming workflows._

**⏳ UI Layouts to Build (The Gaps):**

- **Charge Capture Review UI:** A UI that automatically pulls ICD-10/CPT codes from the doctor's clinical notes and presents them to the billing team for rapid approval.
- **Claim Scrubbing Dashboard:** A warning UI that highlights errors in a bill (e.g., "Missing modifier code") BEFORE the hospital submits it to the insurance company.
- **Denial Management Worklist:** A Kanban-style UI board for rejected insurance claims where staff can upload appeal documents and click "Resubmit".
- **ERA / Remittance Auto-Post Viewer:** A reconciliation UI showing bulk electronic payments received from insurance (TPA) and how they split across hundreds of patient bills.

---

## 2. Hospital Billing UI (Resolute HB) — Inpatient/Facility Charges

_You have `IpdBillingPage.tsx`, but lack complex grouping and accounting layouts._

**⏳ UI Layouts to Build (The Gaps):**

- **DRG Grouping Calculator UI:** A highly specific calculator interface that takes all the patient's IPD diagnoses, surgeries, and ventilator hours, and outputs a standardized DRG (Diagnosis-Related Group) code for bulk billing.
- **UB-04 / Institutional Claim Form UI:** A precise, grid-based frontend template that perfectly mimics standard global institutional claim forms (like CMS-1450) exactly as they will be printed or sent digitally.
- **Cost Accounting Dashboard:** A financial UI that compares the "Billed Amount" against the "Actual Cost to Hospital" (e.g., bed electricity, nurse hourly rate, implant wholesale cost) to show per-encounter profit margins.

---

## 3. Financial Assistance UI — Patient Aid & Charity Care

_This entire module is currently missing. It is mandatory for global HIMS networks interacting with government schemes and impoverished patients._

**⏳ UI Layouts to Build (The Gaps):**

- **Eligibility Screening Form:** A frontend calculator that takes patient income, family size, and local poverty lines (FPL) to generate an immediate "Eligible for 50% discount" result.
- **Charity Care Application Workflow:** A document upload UI (for income proof/tax returns) with a multi-step approval timeline for the finance director to sign off on free care.
- **Payment Plan (EMI) Setup UI:** A specialized checkout UI allowing patients to split huge surgery bills into monthly installments directly from the hospital portal.
- **Government Scheme Linkage UI:** Highly customized data-entry forms for specific global schemes (e.g., PMJAY/Ayushman Bharat in India, Medicare/Medicaid in US, NHS in UK) that enforce specific validation rules.
- **Compliance Audit Trail:** A read-only grid UI for regulators/auditors to verify why a patient was given a 100% discount, ensuring no fraudulent write-offs.
