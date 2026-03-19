# Global HIMS - Phase 2 Frontend (UI) Gap Analysis

**Overall Frontend Status:** 0% Complete (Not Started)
_Current clinical pages (IPD/OPD) cover Phase 1. Phase 2 requires highly specialized new UIs and entirely new external portal views._

---

## 1. Epic Stork UI — OB / Maternity Care Module

_This requires specialized UI layouts separate from the standard IPD/OPD modules to manage the pregnancy lifecycle._

**⏳ UI Layouts to Build:**

- **Prenatal Tracking Dashboard:** A timeline-based UI tracking trimesters, routine OB visits, complex ultrasounds scheduling, and prenatal lab trends on a single view.
- **Labor & Delivery (L&D) Flowsheet:** A specialized, live vital-monitoring UI specifically for fetal monitoring (CTG graphs), contraction tracking timelines, and delivery milestones.
- **Newborn / Neonatal Chart (NICU Link):** A split-screen or linked UI workflow that connects a mother's chart to a newly generated baby's chart seamlessly (including visual Apgar scoring UI).
- **Postpartum Care & Recovery:** Specialized discharge planning UI focusing on maternal recovery checklists.
- **High-Risk Pregnancy Management:** UI scorecards (MFM alerts) and specialist consult referral interfaces specifically tailored for pregnancy risk scoring.

---

## 2. Epic Care Link UI — External Provider Portal

*We currently only have internal `doctors` and `patient-portal`. Phase 2 requires a completely new UI web portal intended for *external* doctors (e.g., small independent clinic doctors referring patients to your global hospital).*

**⏳ UI Layouts to Build:**

- **Referring Physician Dashboard:** A clean, restricted web portal UI allowing outside doctors to log in and securely submit patient referral forms.
- **Read-Only Chart Access:** A role-limited patient profile UI that removes all ordering/editing capabilities. It simply shows the external doctor beautifully formatted discharge summaries, IPD progress, and lab results.
- **Referral Management Workspace:** Internal UI Kanban board (like the Emergency Queue) for hospital staff to Accept, Decline, or Update incoming external referrals.
- **External Message Centre:** A secure messaging UI specifically bridging internal hospital staff and external clinic providers.
- **Result Auto-Delivery Dashboard:** A notification UI for external doctors where they see pushed lab & imaging results for their referred patients.

---

## 3. Care Everywhere UI — Health Information Exchange (HIE)

_While this is heavily backend-driven (APIs), the Frontend needs specific UI elements to handle global cross-border medical record sharing._

**⏳ UI Layouts to Build:**

- **Query Outside Records (Pull/Push) UI:** A seamless button and search modal inside the doctor's clinical view that allows them to search global hospital networks and "Pull" a patient's historical records.
- **Document Exchange Viewer (CCD/XML):** A specialized document viewer UI that takes heavily formatted XML/CCD discharge summaries from external hospitals and makes them readable for the doctor.
- **Consent Management Settings:** A patient-facing and registry-facing UI (toggles and legal checkboxes) where patients can securely Opt-in or Opt-out of global data sharing.
- **Duplicate Detection (Merge Patients) UI:** A critical side-by-side comparison UI. When an external hospital queries a patient, the system might find a duplicate MRN. The UI must let the admin compare two profiles side-by-side and confidently click "Merge Records".
- **Real-time ADT Alert Feed:** A notification feed UI alerting external Primary Care Physicians when their patient gets admitted to your hospital's emergency room.
