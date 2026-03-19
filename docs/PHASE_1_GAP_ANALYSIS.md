# Global HIMS - Phase 1 Architecture & Gap Analysis

Based on the Epic Phase 1 architecture reference you provided, here is a detailed status tracking document outlining what has been built in **Scanbo-Matrix-HIMS** and what remains pending (Gaps) to complete Phase 1.

---

## 1. Epic Chronicles — Database & Integration Layer (Backend)

_Status: Mostly Pending — You have a rich frontend with mock data, but the core backend layer needs to be fully realized._

**✅ What we have (Mocked):**

- Basic mock data structures for patients, users, orders, and results.

**⏳ What is PENDING (The Gap):**

- **Patient Master Index (EMPI/PMI):** A centralized, unique identifier system (MRN generation and cross-referencing global databases).
- **Clinical Data Repo:** Setting up the actual database (PostgreSQL / MongoDB) that persists all encounters and health records securely.
- **Audit Trail:** Implementing strict system-wide logging (who accessed what patient file and when) for HIPAA/compliance.
- **Master Files:** Centralized master management for Facilities, Departments, Providers, and ICD-10/SNOMED codes.
- **HL7 / FHIR Interface:** The integration engine to talk to external machines (Lab Analyzers, Pacs/DICOM) and other hospitals.
- **Reporting Engine:** A backend service specifically for data queries, extracts, and population health analytics.

---

## 2. Epic Hyperspace — Clinical UI Layer (Frontend)

*Status: Advanced — We have built out *most* of the core clinical UI modules mimicking Hyperspace.*

**✅ What is COMPLETED (Or nearly complete):**

- **Patient Registration (ADT):** Admissions, Discharges (IPD Discharge module), Transfers, Bed Management.
- **Scheduling:** OPD Appointments & Calendars.
- **Order Entry (CPOE):** Lab & Radiology order creation interfaces.
- **Clinical Documentation:** IPD Rounds, ASAP Emergency clinical notes, SOAP note integrations.
- **Medication Management:** Pharmacy module, IPD rounds MAR (Medication Administration Record), Prescriptions.
- **Results Review:** Lab Results & Radiology Image/Report viewers.

**⏳ What is PENDING (The Gap):**

- **InBasket:** Staff messaging, task delegation, and internal alerts (A dedicated inbox for doctors/nurses).
- **Problem List & Allergy:** While present in Patient Profile, a dedicated structured module for active diagnoses (ICD coding) and known allergies with severity tracking needs dedicated components.
- **Decision Support (CDS):** Clinical Decision Support rules (e.g., triggering a pop-up warning if a doctor prescribes a drug the patient is allergic to, or duplicate lab warnings).

---

## 3. Epic Haiku — Mobile Layer (Doctor's Phone)

_Status: Fully Pending — This layer requires a mobile-optimized approach._

**⏳ What is PENDING (The Gap):**

- **Mobile Architecture:** Deciding whether to build a Progressive Web App (PWA) with responsive Next.js views, or a separate React Native/Flutter app.
- **Patient Chart View:** A clean, mobile-first view of patient vitals, active meds, and lab results.
- **Quick Order Entry:** A simplified mobile CPOE for doctors to place rush orders bedside.
- **Push Notifications:** Alerting the doctor's phone directly about critical lab results, InBasket messages, or code blue situations.

---

## 4. Detailed Frontend (UI) Progress Breakdown

_Specifically looking at the Frontend (React/Next.js) level, you are currently at approximately **80-85% completion** for the core clinical workflows defined in Phase 1._

### ✅ Completed UI Modules (Frontend)

1. **Patient Registration & ADT:** Admission, Discharge, transfers, and bed allocation views (Emergency ASAP & IPD).
2. **OPD & Scheduling:** Doctor appointments, list/queue management.
3. **CPOE (Order Entry):** Rich screens for Lab tests, radiology scans, and medication prescription.
4. **Clinical Documentation:** SOAP notes, IPD rounding patient charts, and progress note modalities.
5. **Results Review:** Lab samples tracking, formatted Lab reports, and Radiology diagnostic viewers.
6. **Medication & Pharmacy:** Internal pharmacy stock and MAR (Medication Administration Record) tracking.
7. **Billing & Inventory:** OPD Billing, Outstanding Dues, IPD Billing ledgers, and inventory management.
8. **Patient Portal & Care Companion:** Patient-facing dashboards and remote monitoring metrics.

### ⏳ Pending UI Modules (Frontend Gap)

1. **InBasket (Clinical Messaging & Alerts Hub):**
   - A Central Inbox UI where doctors can see their pending tasks ("Unsigned Notes", "Critical Lab Results", "Patient Messages", "Referrals").
2. **Decision Support System (CDS) UI Alerts:**
   - Frontend pop-ups / warning Modals. For example, when a doctor prescribes an item, the UI needs smart warning popups for things like "Warning: Patient is allergic to Penicillin" or "Drug-Drug Interaction".
3. **Dedicated Problem List & Allergy Flow (ICD-10 Search):**
   - An advanced Auto-complete UI inside the Patient Profile where doctors can search globally defined ICD-10 (diseases) and SNOMED codes to add chronic problems (e.g., Asthma, Diabetes) and manage severity accurately.
4. **Hospital Admin & Master Data Pages:**
   - A dedicated "Settings" or "System Master" page for Hospital Administrators to add new Wards (Rooms/Beds), Department configurations, and fine-tune User Roles (Permissions) through a frontend interface.

---

## Next Recommended Actions for Phase 1:

1. **Prioritize InBasket UI:** Build out the InBasket / Messaging module to connect all the separate workflows.
2. **Setup Admin Settings:** Create the basic Hospital Master Data UI so departments and rooms can be dynamic instead of hardcoded.
3. **Backend Transition:** Begin translating your mock data structures into real API routes (Chronicles layer) connected to a SQL/NoSQL database.
4. **Mobile Initiative:** Start deciding the strategy for mobile-responsive "Haiku-tier" views for bedside clinicians.
