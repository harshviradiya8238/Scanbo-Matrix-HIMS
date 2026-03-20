# 🏥 Front Desk (RECEPTION Role) — Complete Gap Analysis

### Global HIMS — Scanbo Matrix

**Last Updated:** March 19, 2026  
**Role in System:** `RECEPTION` (Front Desk / Patient Access)  
**Landing Route:** `/appointments/calendar`

---

## 📌 Overview

Front Desk (RECEPTION role) hims system ka sabse pehla point-of-contact hai. Iska kaam hai:

- Patient ko register karna
- Appointment book karna / check-in karna
- Bed management dekhna
- Insurance verify karna
- IPD admission initiate karna
- Billing read karna (limited)

---

## ✅ KYA BANA HAI (Completed)

### 1. ✅ Patient Registration Form — `/patients/registration`

**File:** `src/screens/patients/PatientRegistrationForm.tsx`  
**Status:** ✅ **Fully Implemented**

| Step                      | Content                                                                          | Status  |
| ------------------------- | -------------------------------------------------------------------------------- | ------- |
| Step 1: Identity & Type   | MRN, Aadhaar, ABHA, PAN, Insurance, Patient Type (General / International / BPL) | ✅ Done |
| Step 2: Personal Details  | Name, DOB, Age, Gender, Marital Status, Blood Group, Religion, Allergies         | ✅ Done |
| Step 3: Contact & Address | Mobile, Email, Address (Urban/Rural), State, City, Pin Code                      | ✅ Done |
| Step 4: Next of Kin       | NOK name, Relationship, Contact, Permission                                      | ✅ Done |
| Step 5: Clinical Info     | Department, Treating Doctor, Chief Complaint, Admission Type                     | ✅ Done |

📌 **Note:** Form submit hone ke baad patient DB/mock me save nahi hota (no backend integration yet — only mock).

---

### 2. ✅ Patient List — `/patients`

**File:** `src/screens/patients/PatientListPage.tsx`  
**Status:** ✅ **Implemented** (mock data)

| Feature                                                                   | Status              |
| ------------------------------------------------------------------------- | ------------------- |
| Patient table with MRN, Name, Age/Gender, Phone, City, Last Visit, Status | ✅ Done             |
| Filter drawer (Status, Gender, Age Range, Date Range, Tags)               | ✅ Done             |
| Patient row click → Profile page (for RECEPTION)                          | ✅ Done             |
| Register Patient button                                                   | ✅ Done             |
| Export / Import buttons                                                   | ✅ Done (stub/mock) |
| Saved views                                                               | ✅ Done (stub)      |
| KPI cards (Total, Today Registrations, Pending Bills, Admitted)           | ✅ Done             |

📌 **Note:** Action menu items (View, Edit, Start Visit, Admit, Invoice, Archive) mostly redirect / stubs.

---

### 3. ✅ Patient Profile — `/patients/profile`

**File:** `src/screens/patients/PatientProfilePage.tsx`  
**Status:** ✅ **Implemented** (194KB — comprehensive)

| Tab                     | Status  |
| ----------------------- | ------- |
| Demographics / Overview | ✅ Done |
| OPD tab                 | ✅ Done |
| IPD / Inpatient tab     | ✅ Done |
| Billing tab             | ✅ Done |
| Care Companion tab      | ✅ Done |
| Infection Control tab   | ✅ Done |
| Radiology tab           | ✅ Done |

---

### 4. ✅ Appointment Calendar — `/appointments/calendar`

**File:** `src/screens/opd/OpdCalendarPage.tsx`  
**Status:** ✅ **Implemented** (87KB — rich calendar)

| Feature                        | Status  |
| ------------------------------ | ------- |
| Doctor-wise calendar view      | ✅ Done |
| New appointment booking        | ✅ Done |
| Reschedule / Cancel            | ✅ Done |
| Doctor availability slots      | ✅ Done |
| Appointment details side panel | ✅ Done |

---

### 5. ✅ OPD Queue — `/appointments/queue`

**File:** `src/screens/opd/OpdQueuePage.tsx`  
**Status:** ✅ **Implemented** (28KB)

| Feature                                              | Status  |
| ---------------------------------------------------- | ------- |
| Queue list with patient, token, status               | ✅ Done |
| Check-in patient                                     | ✅ Done |
| Queue status badges (Waiting, In Consultation, Done) | ✅ Done |

---

### 6. ✅ Welcome Kiosk — `/clinical/modules/welcome-kiosk`

**File:** `src/screens/clinical/WelcomeKioskPage.tsx`  
**Status:** ✅ **Implemented** (583 lines)

| Feature                                                                     | Status         |
| --------------------------------------------------------------------------- | -------------- |
| Kiosk station monitor (Online/Offline/Maintenance)                          | ✅ Done        |
| Live check-in sessions                                                      | ✅ Done        |
| 6-step Intake Flow display                                                  | ✅ Done        |
| Staff tasks panel                                                           | ✅ Done        |
| KPI cards (Active Stations, Check-ins Today, Avg Completion, Staff Assists) | ✅ Done        |
| Quick actions (Verify Docs, Send Intake Link, Print Token)                  | ✅ Done (stub) |
| Handoff buttons (to Profile, Calendar, Queue, Visit)                        | ✅ Done        |

---

### 7. ✅ Registration & ADT — `/clinical/modules/prelude-grand-central`

**File:** `src/screens/clinical/RegistrationAdtPage.tsx`  
**Status:** ✅ **Implemented** (580 lines)

| Feature                                                                        | Status  |
| ------------------------------------------------------------------------------ | ------- |
| Admission Queue table (Awaiting Insurance, Ready, Bed Assigned, Completed)     | ✅ Done |
| Selected case detail panel                                                     | ✅ Done |
| Bed Board Snapshot (ward occupancy bars)                                       | ✅ Done |
| Insurance & ID Verification tasks table                                        | ✅ Done |
| KPI cards (Registrations Today, Admissions Pending, Beds Occupied, Discharges) | ✅ Done |
| New Registration + Start Admission buttons                                     | ✅ Done |

---

### 8. ✅ IPD Admissions (Read) — `/ipd/admissions`

**File:** `src/screens/ipd/IpdAdmissionsPage.tsx`  
**Status:** ✅ **Implemented** — RECEPTION can read admissions

---

### 9. ✅ Billing — Read Access

**Permission:** `billing.read`  
RECEPTION role ko billing ka read access hai via permissions.

---

## ⏳ KYA PENDING HAI (Incomplete / Not Built)

---

### 1. ❌ Front Desk — Dedicated Dashboard

**Route Suggested:** `/frontdesk/dashboard` ya `/reception/home`  
**Status:** ❌ **Not Built**

RECEPTION role ki **apni dedicated dashboard** nahi hai. Abhi doctor/admin ka generic dashboard dikhta hai. Chahiye:

| Feature                              | Priority  |
| ------------------------------------ | --------- |
| Today's appointment summary          | 🔴 High   |
| Pending check-ins count              | 🔴 High   |
| Walk-in patient quick-add button     | 🔴 High   |
| Insurance verification pending tasks | 🔴 High   |
| Bed availability quick view          | 🟡 Medium |
| Discharge pending count              | 🟡 Medium |
| Announcements / Alerts feed          | 🟢 Low    |

---

### 2. ❌ Walk-in Quick Registration (Express Mode)

**Status:** ❌ **Not Built**

Abhi ka registration form bahut lamba (5 steps) hai. Front Desk ke liye ek **quick 1-page walk-in form** zaruri hai jo:

- Sirf naam, DOB, mobile, chief complaint maange
- Directly queue me daale patient ko
- Full registration baad mein complete kar sake

---

### 3. ❌ Patient Check-in from Calendar

**Status:** ⚠️ **Partial** (Queue pe dikha raha hai, calendar se direct check-in nahi hai)

| Feature                                                    | Status                     |
| ---------------------------------------------------------- | -------------------------- |
| "Check-in" button directly on appointment card in calendar | ❌ Missing                 |
| Confirmation modal with MRN print/token generation         | ❌ Missing                 |
| Auto-move to queue after check-in                          | ⚠️ Partial (redirect only) |

---

### 4. ❌ Token / Slip Printing

**Status:** ❌ **Not Built** (Button hai but no functionality)

- Print token slip after check-in ❌
- Print appointment confirmation slip ❌
- Print registration summary ❌

---

### 5. ❌ Insurance Pre-Authorization Workflow

**Status:** ❌ **Not Built**

Abhi Registration & ADT page me sirf static table hai. Real workflow chahiye:

| Feature                                                       | Priority  |
| ------------------------------------------------------------- | --------- |
| Insurance card/document upload UI                             | 🔴 High   |
| Pre-auth request form (TPA details, policy number, diagnosis) | 🔴 High   |
| Pre-auth status tracker (Pending → Approved → Rejected)       | 🔴 High   |
| Auto-link with billing module                                 | 🟡 Medium |

---

### 6. ❌ Bed Availability & Assignment UI (Front Desk view)

**Status:** ⚠️ **Very Partial** (Only snapshot in ADT page)

IPD ka full `IpdBedManagementPage.tsx` exist karta hai, but Front Desk ke liye simplified view chahiye:

| Feature                                  | Status                    |
| ---------------------------------------- | ------------------------- |
| Real-time bed board (ward-wise)          | ⚠️ Snapshot only (static) |
| Bed assignment from registration context | ❌ Missing                |
| Transfer request initiation              | ❌ Missing                |
| Housekeeping status (dirty/clean)        | ❌ Missing                |

---

### 7. ❌ Emergency / Walk-in to ASAP Handoff

**Status:** ❌ **Not Built**

ASAP Emergency page exist karta hai, but Front Desk se emergency patient ko directly ASAP me push karne ka flow nahi hai.

| Feature                                            | Status     |
| -------------------------------------------------- | ---------- |
| "Send to Emergency" button from queue/registration | ❌ Missing |
| Triage override for walk-in emergencies            | ❌ Missing |

---

### 8. ❌ Appointment Reminder / Notification System (UI)

**Status:** ❌ **Not Built**

| Feature                                             | Status     |
| --------------------------------------------------- | ---------- |
| Send SMS/WhatsApp reminder to patient from calendar | ❌ Missing |
| No-show tracking                                    | ❌ Missing |
| Reschedule request management                       | ❌ Missing |

---

### 9. ❌ Patient Search — Universal Quick Search

**Status:** ⚠️ **Partial**

Abhi patient list me search hai, but Front Desk ko ek **global quick-search bar** chahiye jo:

- MRN se search kare
- Name se search kare
- Phone number se search kare
- Instantly result dikhaye (without going to patient list)

---

### 10. ❌ Consent Form Management

**Status:** ❌ **Not Built**

Registration form me consent checkboxes hain (verbal, written, ABHA share), but:

| Feature                     | Status     |
| --------------------------- | ---------- |
| Digital consent form viewer | ❌ Missing |
| E-signature capture UI      | ❌ Missing |
| Consent history log         | ❌ Missing |

---

### 11. ❌ Discharge Planning — Front Desk View

**Status:** ❌ **Not Built**

IPD Discharge page exist karta hai, but Front Desk ko ek simplified view chahiye:

| Feature                                                             | Status     |
| ------------------------------------------------------------------- | ---------- |
| "Ready for discharge" patient list                                  | ❌ Missing |
| Discharge clearance checklist (billing cleared, medicines, reports) | ❌ Missing |
| Final discharge slip printing                                       | ❌ Missing |

---

### 12. ❌ Front Desk — Inbasket / Task Management

**Status:** ❌ **Not Built**

| Feature                              | Status     |
| ------------------------------------ | ---------- |
| Task inbox for pending verifications | ❌ Missing |
| Assignment of tasks to staff members | ❌ Missing |
| Escalation alerts                    | ❌ Missing |

---

### 13. ❌ Role-Based Sidebar Customization for RECEPTION

**Status:** ⚠️ **Partial**

RECEPTION ka sidebar generic hai. Role-specific shortcuts nahi hain:

- Shortcuts: New Registration, Today's Appointments, Queue, Bed Board
- Quick links visible on sidebar for typical front desk workflows

---

## 📊 Summary Table

| Module / Feature                   | Status     | Priority  |
| ---------------------------------- | ---------- | --------- |
| Patient Registration (5-step form) | ✅ Done    | —         |
| Patient List & Filters             | ✅ Done    | —         |
| Patient Profile (all tabs)         | ✅ Done    | —         |
| Appointment Calendar               | ✅ Done    | —         |
| OPD Queue                          | ✅ Done    | —         |
| Welcome Kiosk Monitor              | ✅ Done    | —         |
| Registration & ADT                 | ✅ Done    | —         |
| IPD Admissions (read)              | ✅ Done    | —         |
| **Front Desk Dedicated Dashboard** | ❌ Pending | 🔴 High   |
| **Walk-in Quick Registration**     | ❌ Pending | 🔴 High   |
| **Direct Check-in from Calendar**  | ❌ Pending | 🔴 High   |
| **Token / Slip Printing**          | ❌ Pending | 🔴 High   |
| **Insurance Pre-Auth Workflow**    | ❌ Pending | 🔴 High   |
| **Bed Assignment UI (FD view)**    | ❌ Pending | 🟡 Medium |
| **Emergency ASAP Handoff**         | ❌ Pending | 🟡 Medium |
| **Appointment Reminders UI**       | ❌ Pending | 🟡 Medium |
| **Universal Patient Quick Search** | ❌ Pending | 🟡 Medium |
| **Consent Form Management**        | ❌ Pending | 🟡 Medium |
| **Discharge Planning — FD View**   | ❌ Pending | 🟡 Medium |
| **Front Desk Inbasket / Tasks**    | ❌ Pending | 🟡 Medium |
| **Role-Based Sidebar Shortcuts**   | ❌ Pending | 🟢 Low    |

---

## 🔢 Completion Estimate

|                                   | Count    |
| --------------------------------- | -------- |
| ✅ Completed Features             | **9**    |
| ❌ Pending Features               | **13**   |
| **Overall Front Desk Completion** | **~40%** |

---

## 🗓️ Suggested Next Steps (Priority Order)

### Phase A — Core Workflows (Immediate)

1. **Front Desk Dashboard** — Consolidated view for daily operations
2. **Walk-in Quick Registration** — 1-page express form
3. **Check-in from Calendar** — Direct check-in button on appointment cards
4. **Token Printing** — Printable slip after check-in

### Phase B — Financial & Operational

5. **Insurance Pre-Auth Workflow** — Upload, track, approve
6. **Discharge Clearance View** — Billing status + print discharge slip
7. **Bed Assignment UI** — Simplified bed board for Front Desk

### Phase C — Advanced

8. **Universal Quick Search** — Global patient search bar
9. **Consent Form Management** — Digital consent + e-signature
10. **Front Desk Inbasket** — Task management and escalation

---

_Document generated by Antigravity | Project: Scanbo Matrix HIMS_
