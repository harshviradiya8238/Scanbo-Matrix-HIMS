# Front Desk (RECEPTION) Role Blueprint
## Global-Level HIMS Strategy

The Front Desk is the nerve center of hospital operations. In a global-scale HIMS (referencing Epic Cadence/Prelude standards), the Receptionist's role is not just "booking" but **Patient Access Management**.

### 🛠 Core Permission Modules

#### 1. Patient Access & Identity (Master Patient Index)
*Goal: Ensure a "Single Source of Truth" for patient data.*
- **`patients.create`**: Advanced registration with mandatory fields (DOB, Gender, Contact).
- **`patients.read`**: Search by Phone, MRN, National ID, or QR code.
- **`patients.update`**: Updating demographics (Address, Emergency contacts).
- **`patients.documents.write`**: Scanning and attaching ID proofs, insurance cards, and consent forms.
- **`patients.portal.invite`**: Sending MyChart/Patient Portal activation links.

#### 2. Scheduling & Slot Management (Cadence)
*Goal: Maximizing doctor utilization and minimizing patient wait times.*
- **`appointments.read`**: Full access to departmental calendars.
- **`appointments.create`**: Single-slot and recurring booking.
- **`appointments.update`**: Rescheduling, cancellation reasons, and waitlist management.
- **`appointments.checkin`**: Moving patients to the "Arrived" queue.
- **`appointments.checkout`**: Ensuring follow-up is booked before the patient leaves.

#### 3. Inpatient Lifecycle (ADT - Admission, Discharge, Transfer)
*Goal: Frictionless transition from OPD/ER to Wards.*
- **`ipd.admissions.create`**: Registering a patient for a bed.
- **`ipd.beds.read`**: Real-time bed board heatmap (View only).
- **`ipd.discharge.initiate`**: Administrative clearance for discharge.
- **`ipd.adt.log.read`**: Basic tracking of current patient location for visitor inquiry.

#### 4. Revenue Cycle - Point of Service (Resolute)
*Goal: Collecting payments at the source to reduce outstanding dues.*
- **`billing.registration.write`**: Collecting registration and consultation fees.
- **`billing.advance.create`**: Handling deposits for IPD or surgeries.
- **`billing.receipts.read`**: Re-printing invoices and payment receipts.
- **`billing.outstanding.read`**: Viewing "Red Flags" for patients with bad debt.

---

### 🛡 Security & Privacy Boundaries
**A Global HIMS must enforce strict "Clinical Isolation" for front-office staff.**

| Restricted Area | Reason |
| :--- | :--- |
| **Clinical Notes (`clinical.*`)** | HIPAA/GDPR: Front desk doesn't need to know the diagnosis. |
| **Diagnostic Results** | Risk of accidental disclosure of sensitive results. |
| **Medication Orders** | Only Licensed Professionals (Doctors/Pharmacists) can order. |
| **Advanced Discounts** | Prevents financial leakage; requiring "Manager Overwrite" for any discount >0%. |

---

### 🚀 Premium Recommendations for Your HIMS
1. **Queue Heatmaps**: Give them a dashboard showing which department is currently overloaded.
2. **Kiosk Handoff**: Ability to "Push" a registration to a self-service tablet (Kiosk) if the desk is busy.
3. **Insurance Eligibility**: A "Check Insurance" button that integrates with TPA portals (Mocked or Real).
4. **Multi-Facility Booking**: If your HIMS is global (Multi-hospital), allow them to book appointments in other branches.

---

> [!IMPORTANT]
> **Implementation Tip:** In `src/core/navigation/permissions.ts`, ensure `RECEPTION` has `patients.*` and `appointments.*` but explicitly **exclude** `clinical.read` and `diagnostics.read` to maintain a secure healthcare environment.
