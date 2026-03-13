# Patient Profile & Linking — Hospital Flow Documentation

यह document Scanbo HIMS में patient कहाँ-कहाँ linked है, Patient Profile में क्या show हो रहा है, और hospital side पर ideal Patient Profile में क्या होना चाहिए — इन सब को cover करता है।

---

## 1. Patient Linking — Pure Flow में कहाँ-कहाँ Linked है

Patient को पूरे system में **MRN (Medical Record Number)** से identify किया जाता है। MRN query param (`?mrn=MRN-245990`) के जरिए pages के बीच context pass होता है।

### 1.1 Patient Access & Registration

| Module | Route | Patient Link | Data Source |
|--------|-------|--------------|-------------|
| Registration | `/patients/registration` | New patient create | PatientRegistrationForm |
| Patient List | `/patients/list` | List view | GLOBAL_PATIENTS, patientServer |
| **Patient Profile** | `/patients/profile?mrn=XXX` | **Central hub** | getPatientByMrn(mrn) |
| Global Search | Header / GlobalPatientSearch | Search → Profile | searchPatients(), getPatientByMrn() |

### 1.2 OPD / Appointments Flow

| Module | Route | Patient Link | Data Source |
|--------|-------|--------------|-------------|
| Calendar | `/appointments/calendar?mrn=XXX` | Booking, view | GLOBAL_PATIENTS, appointments |
| Queue | `/appointments/queue?mrn=XXX` | OPD queue | OpdQueuePage, encounters |
| Visit / Encounter | `/encounters/[id]?mrn=XXX` | Active encounter | opdSlice (encounters) |
| Vitals | OpdVitalsPage | Vitals capture | vitalTrends (patientId) |
| Notes | OpdNotesPage | Clinical notes | encounters, notes |
| Orders | OpdOrdersPage | Lab/radiology orders | orders |
| Prescriptions | OpdPrescriptionsPage | Rx | prescriptions |

### 1.3 Clinical Modules

| Module | Route | Patient Link | Data Source |
|--------|-------|--------------|-------------|
| Flow Overview | `/clinical/flow-overview?mrn=XXX` | Patient journey map | mrnParam |
| EpicCare Ambulatory | `/clinical/modules/ambulatory-care-opd` | OPD queue | QUEUE_PATIENTS |
| Welcome Kiosk | `/clinical/modules/welcome-kiosk` | Check-in | mrnParam |
| EpicCare Inpatient (ClinDoc) | `/clinical/modules/inpatient-documentation-clindoc` | IPD | mrnParam |
| Infection Control | `/clinical/modules/bugsy-infection-control` | Cases | INITIAL_CASES (mrn) |
| Care Companion | `/clinical/modules/care-companion` | Enrolled patients | EnrolledPatient |

### 1.4 Diagnostics

| Module | Route | Patient Link | Data Source |
|--------|-------|--------------|-------------|
| Lab Orders | `/orders/lab` | Order form | Lab orders (mrn) |
| Lab Samples | `/diagnostics/lab/samples` | Sample tracking | labSlice (samples) |
| **Lab Results** | `/diagnostics/lab/results?mrn=XXX` | Results view | labSlice (results) |
| Radiology Orders | `/orders/radiology` | Imaging orders | Radiology orders |
| Radiology Worklist | `/diagnostics/radiology/worklist` | Worklist | radiologySlice |
| Radiology Reports | `/diagnostics/radiology/reports` | Reports | radiologySlice |

### 1.5 IPD / Inpatient Flow

| Module | Route | Patient Link | Data Source |
|--------|-------|--------------|-------------|
| Admissions | `/ipd/admissions?mrn=XXX` | Admission | ipd-encounter-context |
| Bed Management | `/ipd/beds?mrn=XXX` | Bed assignment | INPATIENT_STAYS |
| Rounds | `/ipd/rounds?mrn=XXX` | Daily rounds | IpdRoundsPage |
| Discharge | `/ipd/discharge?mrn=XXX` | Discharge | IpdDischargePage |
| Orders / Tests | IpdOrdersTestsPage | IPD orders | encounters |
| Charge / Drug | IpdChargeDrugPage | Billing, meds | encounters |

### 1.6 Patient Workflows Menu (Infection Control)

From Infection Control table rows, Patient Workflows menu opens with links:

- **Patient Profile** → `/patients/profile?mrn=XXX`
- **Lab Results** → `/diagnostics/lab/results?mrn=XXX`
- **IPD Bed Board** → `/ipd/beds?mrn=XXX`
- **IPD Rounds** → `/ipd/rounds?mrn=XXX`
- **Microbiology** → `/ipd/orders-tests/lab?mrn=XXX`

---

## 2. Patient Profile — Current State (क्या Show हो रहा है)

**Route:** `/patients/profile?mrn=XXX`  
**Data Source:** `getPatientByMrn(mrn)` → `GLOBAL_PATIENTS`

### 2.1 Patient नहीं मिलने पर

- MRN invalid या GLOBAL_PATIENTS में नहीं → **"Find a patient"** screen
- GlobalPatientSearch + sample chips (GLOBAL_PATIENTS.slice(0,4))

### 2.2 Header Section (जो दिख रहा है)

| Field | Source | Status |
|-------|--------|--------|
| Name | patient.name | ✅ |
| MRN | patient.mrn | ✅ |
| Age | patient.age | ✅ |
| Gender | patient.gender | ✅ |
| Department | patient.department | ✅ |
| Status | patient.status | ✅ |
| Payer Type | latestAppointment.payerType | ✅ (OPD only) |
| Tags | patient.tags | ✅ |
| Allergies | opdEncounter.allergies | ✅ (OPD encounter only) |

### 2.3 Stat Tiles

| Tile | Source | Status |
|------|--------|--------|
| Total Visits | opdAppointments.length | ✅ OPD only |
| Active Medications | patientMedications (medicationCatalog) | ✅ (derived) |
| Vitals Captured | vitalHistory.length | ✅ OPD only |
| Show Rate | completedVisits / total | ✅ OPD only |

### 2.4 Sidebar Cards

| Card | Source | Status |
|------|--------|--------|
| Insurance Information | InsuranceLabel, payerType | ✅ |
| Demographics & Contact | patient.phone, city, primaryDoctor | ✅ |
| Latest Vital Signs | opdEncounter.vitals, vitalHistory | ✅ OPD only |
| Allergies & Alerts | opdEncounter.allergies | ✅ OPD only |

### 2.5 Tabs (Current)

| Tab | Data Source | Status |
|-----|-------------|--------|
| **Medical History** | timelineAppointments (OPD) | ✅ OPD only |
| **Medications** | medicationCatalog + patient.tags | ✅ (mock-derived) |
| **Lab Results** | labResults (mock) | ⚠️ Not linked to labSlice |
| **Imaging** | — | ❌ "No imaging studies" |
| **Documents** | documents (mock) | ⚠️ Static mock |
| **Appointments** | timelineAppointments | ✅ OPD only |
| **Immunizations** | immunizations (mock) | ⚠️ Static mock |
| **Problem List** | opdEncounter.problems | ✅ OPD only |

### 2.6 Gaps (जो सही से नहीं दिख रहा है)

| Area | Issue |
|------|-------|
| Lab Results | Patient Profile में lab tab — labSlice से नहीं जुड़ा; mock data |
| Imaging | Always "No imaging studies" |
| IPD Data | अगर patient IPD में है — admissions, rounds, discharge, bed वगैरह Profile में नहीं |
| Infection Control | अगर patient infection case में है — वो Profile में नहीं |
| Care Companion | Enrolled patients का data Profile में नहीं |
| Documents | Real documents नहीं, mock |
| Immunizations | Real immunizations नहीं, mock |

---

## 3. Hospital Patient Profile — Ideal Content (क्या होना चाहिए)

Hospital side पर Patient Profile एक **central longitudinal record** होना चाहिए। यहाँ recommended structure है:

### 3.1 Demographics & Identity

- [ ] MRN, Name, DOB, Age, Gender
- [ ] Photo / Avatar
- [ ] Blood Group
- [ ] Contact: Phone, Email, Address
- [ ] Emergency Contact
- [ ] Preferred Language
- [ ] Identification (Aadhaar, etc.)

### 3.2 Clinical Summary

- [ ] **Allergies** — सबसे ऊपर, highlighted
- [ ] **Active Problems** — Problem list
- [ ] **Active Medications** — Current Rx
- [ ] **Vitals** — Latest + trend
- [ ] **Immunizations** — Vaccination history

### 3.3 Encounters & Visits

- [ ] **OPD** — Appointments, visits, chief complaint
- [ ] **IPD** — Admissions, admissions, discharge summaries
- [ ] **Emergency** — ED visits (if applicable)

### 3.4 Diagnostics

- [ ] **Lab Results** — labSlice से filter by MRN
- [ ] **Radiology** — Imaging orders, reports
- [ ] **Pathology** — Microbiology, culture reports

### 3.5 Clinical Modules Integration

- [ ] **Infection Control** — अगर active case है → status, organism, isolation
- [ ] **Care Companion** — अगर enrolled है → program, adherence
- [ ] **Surgical / Procedures** — ऑपरेशन history (अगर module हो)

### 3.6 Documents

- [ ] Discharge summaries
- [ ] Consent forms
- [ ] Referral letters
- [ ] Uploaded documents

### 3.7 Billing & Insurance

- [ ] Insurance details
- [ ] Outstanding balance
- [ ] Payment history

### 3.8 Quick Actions

- [ ] New Appointment
- [ ] Admit to IPD
- [ ] Order Lab
- [ ] Order Radiology
- [ ] New Prescription
- [ ] Send Message

---

## 4. Data Flow Summary

```
GLOBAL_PATIENTS (getPatientByMrn)
    ↓
Patient Profile Page
    ├── opdSlice: appointments, encounters, vitalTrends, medicationCatalog
    ├── labSlice: results (currently NOT linked in Profile lab tab)
    ├── ipd-encounter-context: IPD (NOT linked in Profile)
    └── Mock/static: documents, immunizations, labResults
```

### 4.1 Linking Fixes (जो करना चाहिए)

1. **Lab Results tab** — Profile में lab tab को `labSlice.results` से filter by MRN करके लिंक करें।
2. **Radiology** — radiologySlice से patient's imaging data लें।
3. **IPD Summary** — अगर patient admitted है तो admission, discharge, bed info दिखाएं।
4. **Infection Control** — अगर active case है तो case status, organism दिखाएं।
5. **Care Companion** — Enrolled patients के लिए program, adherence दिखाएं।

---

## 5. Quick Reference — MRN Links

| From | To | URL Pattern |
|------|-----|-------------|
| Anywhere | Patient Profile | `/patients/profile?mrn=MRN-XXX` |
| Profile | Calendar | `/appointments/calendar?mrn=XXX&booking=1` |
| Profile | Lab Results | `/diagnostics/lab/results?mrn=XXX` |
| Profile | IPD Beds | `/ipd/beds?mrn=XXX` |
| Profile | IPD Rounds | `/ipd/rounds?mrn=XXX` |
| Infection Control | Profile / Lab / etc. | Patient Workflows menu → `?mrn=XXX` |
| Flow Overview | Profile | `withMrn('/patients/profile')` |
| OPD Queue | Visit | encounter.mrn |
| IPD Admissions | Beds / Rounds | mrnParam |

---

*Document Version: 1.0 | Last Updated: March 2025*
