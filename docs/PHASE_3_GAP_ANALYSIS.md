# Global HIMS - Phase 3 Frontend (UI) Gap Analysis

**Overall Frontend Status:** 0% Complete (Not Started)
_Phase 3 focuses entirely on highly specialized clinical departments. Currently, your frontend covers general Hospital modules (Phase 1), but none of these specific surgery or specialty UIs exist yet._

---

## 1. OpTime UI — OR (Operation Theatre) & Surgical Management

_The core component of Phase 3. The UI needs to handle complex scheduling and live operation documentation._

**⏳ UI Layouts to Build:**

- **OR Scheduling Board:** A complex drag-and-drop calendar UI (similar to a Gantt chart) for booking Operation Theatres, blocking times, and managing surgical cases.
- **Surgical Documentation Dashboard:** An intra-operative UI for surgeons/nurses to log operation notes, track implanted devices, and record sponge/instrument counts live.
- **Pre-op & Post-op Checklists:** Interactive, specialized checklist UIs for PACU (Post-Anesthesia Care Unit) care and pre-surgery verifications.
- **Surgeon Preference Cards:** A specialized inventory UI where each surgeon’s specific required tools and supplies for a surgery can be listed and picked.
- **OR Utilization Reports:** Analytics UI (graphs/charts) tracking OT turnover times and efficiency metrics.

---

## 2. Anesthesia UI — Perioperative Record

_This UI must be launched alongside OpTime. It focuses on live vitals and drug tracking during surgery._

**⏳ UI Layouts to Build:**

- **Intraop Record (Live Flowsheet):** A dense, live-updating graphing UI that continuously plots vitals, ventilatory data, and exact milestones of anesthesia drugs given.
- **Pre-anesthesia Assessment Form:** A specialized clinical form UI focusing strictly on ASA (American Society of Anesthesiologists) classifications and airway risks.
- **Device Integration Dashboards:** UI monitors that visually sync and display feeds from ventilators and anesthesia machines in real-time.

---

## 3. Bones UI — Orthopedics

_Specialized UI for bone, joint, and spine treatments._

**⏳ UI Layouts to Build:**

- **Implant Tracking Module:** Inventory+Clinical UI tailored to track lot numbers, serials, and manufacturer data for artificial joints.
- **Joint Registry Reporting:** Form-based UI for submitting orthopedic outcomes to national/global registries.
- **Fracture Care Pathway:** Workflow UI guiding the patient from the ED directly to the OR and into post-op rehab tracking.

---

## 4. Epic Beacon UI — Oncology (Cancer Care)

_Requires very strict protocol-driven UIs._

**⏳ UI Layouts to Build:**

- **Chemo Order Sets:** Specially designed CPOE (Order Entry) screens that strictly follow oncology protocols and weight-based dosing calculators to prevent deadly errors.
- **Treatment Plan Tracking:** A long-term timeline UI showing chemotherapy cycles, patient toxicity responses, and multi-month treatment adherence.
- **Tumor Board Support:** A centralized presentation/collaboration UI where multidisciplinary teams can prep cases and view pathology/radiology side-by-side.

---

## 5. Epic Cupid UI — Cardiology

_Specialized UI for heart procedures._

**⏳ UI Layouts to Build:**

- **Cath Lab Workflows:** Specialized procedural documentation UI for PCIs (stents) and cath reports.
- **ECG & Echo Integration:** Deep integration UIs that natively display streaming or imported ECG waveforms and Echo imaging directly within the patient chart.

---

## 6. Epic Lumens UI — Endoscopy

_Specialized UI for GI procedures._

**⏳ UI Layouts to Build:**

- **Endoscopy Scheduling:** Suite management and prep-order scheduling UI (often requires specific fasting instructions/prep kits).
- **Scope Tracking:** An inventory tracking UI focusing specifically on the reprocessing and sterilization cycles of expensive endoscopic scopes.
