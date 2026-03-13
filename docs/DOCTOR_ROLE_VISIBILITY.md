# Doctor Role – HIMS Visibility & Access Guide

यह document HIMS में **Doctor** role से login होने पर क्या दिखाना चाहिए और क्या नहीं, इसका global-level specification है।

---

## 1. Dashboard

| Item | Show | Hide | Notes |
|------|------|------|-------|
| Doctor Dashboard | ✅ | | Custom doctor dashboard with Today's Schedule, Pending Tasks, IPD Patients, Alerts, Patient Cases, etc. |
| Main Admin Dashboard | | ✅ | Hospital Admin / Reception वाला full dashboard doctor को नहीं दिखना चाहिए |

**Implementation:** `DashboardPage.tsx` में `role === "DOCTOR"` होने पर `DoctorDashboardPage` render होता है।

---

## 2. Sidebar Navigation (MAIN)

| Menu Item | Show | Hide | Notes |
|-----------|------|------|-------|
| **Dashboard** | ✅ | | Doctor dashboard |
| **Patients** | | | |
| └ Registration | | ✅ | Doctor patient register नहीं करता |
| └ Patient List | ✅ | | View/search patients – read-only |
| **OPD / Appointments** | | | |
| └ Calendar | ✅ | | Appointments देखने के लिए |
| └ Queue | ✅ | | OPD queue management |
| **Doctors** | | | |
| └ Registration | | ✅ | Doctor खुद register नहीं करता |
| └ Doctor List | | ✅ | Doctor list नहीं देखता |
| └ Doctor Profile | | ✅ | Admin-level profile |
| └ Doctors Schedule / **My Schedule** | ✅ | | Doctor के लिए "My Schedule" label |
| **Patient Cases** | ✅ | | Doctor-specific – अपने cases |
| **IPD / Inpatient** | | | |
| └ IPD Dashboard | ✅ | | Overview |
| └ Admission & ADT | | ✅ | Admin/Reception work |
| └ Bed & Census | | ✅ | Admin work |
| └ Clinical Care | ✅ | | Rounds, clinical notes |
| └ Discharge & Clearance | | ✅ | Admin/Reception work |
| **Chat** | ✅ | | Doctor–patient/team chat |

---

## 3. Sidebar Navigation (CLINICAL)

| Menu Item | Show | Hide | Notes |
|-----------|------|------|-------|
| **Clinical / EMR** | | | |
| └ Care Companion | ✅ | | Clinical support |
| └ Infection Control | ✅ | | If permission |
| **Orders & Tests** | | | |
| └ Order Management | ✅ | | Orders place करने के लिए |
| └ Lab Result | ✅ | | Lab results देखने के लिए |
| └ Radiology | ✅ | | Radiology orders/results |
| **Laboratory** | | | |
| └ Dashboard, Workflow, Catalog, Reports, Settings | ⚠️ | | Lab tech work – doctor को सिर्फ results चाहिए; full lab module optional |

---

## 4. Sidebar Navigation (OPERATIONS)

| Menu Item | Show | Hide | Notes |
|-----------|------|------|-------|
| **Pharmacy** | | | |
| └ Dispense, Stock, Returns | | ✅ | Pharmacist work |
| **Billing & Medication Charges** | | | |
| └ IPD Charge / Drug | ⚠️ | | Doctor charges order कर सकता है – policy पर depend |
| └ Invoices, Payments, Insurance, Refunds | | ✅ | Billing staff work |
| **Inventory / Procurement** | | ✅ | Admin work |

---

## 5. Sidebar Navigation (ADMIN)

| Menu Item | Show | Hide | Notes |
|-----------|------|------|-------|
| **Staff** | | ✅ | User/Role management |
| **Reports & Analytics** | | | |
| └ Clinical Reports | ✅ | | अपने clinical reports |
| └ Billing, Inventory, Analytics | | ✅ | Admin reports |
| **Settings / Admin** | | ✅ | Facility, Departments, Master Data, etc. |
| **Help / Support** | ✅ | | |

---

## 6. Page-Level Restrictions (Route Access)

| Route | Doctor Access | Notes |
|-------|---------------|-------|
| `/dashboard` | ✅ | Doctor dashboard |
| `/patients/list` | ✅ | Read-only, limited actions |
| `/patients/registration` | ❌ | Access Denied |
| `/appointments/calendar` | ✅ | |
| `/appointments/queue` | ✅ | |
| `/doctors/list` | ❌ | Access Denied |
| `/doctors/registration` | ❌ | Access Denied |
| `/doctors/profile` | ❌ | Access Denied |
| `/doctors/schedule` | ✅ | My Schedule |
| `/doctor/patient-cases` | ✅ | Doctor-specific |
| `/ipd/dashboard` | ✅ | |
| `/ipd/admissions` | ❌ | Hidden in nav + Access Denied |
| `/ipd/beds` | ❌ | Hidden in nav + Access Denied |
| `/ipd/rounds` | ✅ | Clinical Care |
| `/ipd/discharge` | ❌ | Hidden in nav + Access Denied |
| `/doctors/chat` | ✅ | |

---

## 7. Patient List Page – Doctor View

| Element | Show | Hide | Notes |
|---------|------|------|-------|
| Patient Registry chip | | ✅ | |
| OPD + IPD Linked chip | | ✅ | |
| "Manage patient demographics..." text | | ✅ | |
| Import button | | ✅ | |
| Export button | | ✅ | |
| Add Patient button | | ✅ | |
| Saved Views | ✅ | | |
| Filters | ✅ | | |
| Table Export (toolbar) | | ✅ | |
| Empty state "Add Patient" CTA | | ✅ | |
| Bulk: Export selected | | ✅ | |
| Bulk: Mark inactive, Assign tags, Send SMS, Merge | ⚠️ | | Policy पर depend – अक्सर hide |
| View profile, Edit, Create appointment, etc. (row actions) | ✅ | | Clinical actions doctor को चाहिए |

---

## 8. Doctor Schedule Page

| Element | Show | Hide | Notes |
|---------|------|------|-------|
| Own schedule view | ✅ | | |
| Add doctor, bulk edit, admin controls | | ✅ | Doctor अपना schedule ही देखता है |

---

## 9. Header / Global UI

| Element | Show | Hide | Notes |
|---------|------|------|-------|
| Role switcher (Doctor option) | ✅ | | Testing के लिए |
| Quick links | ⚠️ | | Doctor-relevant links ही (Dashboard, Patient List, Appointments); Billing/Reports hide |

---

## 10. Doctor Permissions (Reference)

```
dashboard.read
patients.read, patients.profile.read
appointments.*
doctors.read
ipd.read, ipd.admissions.read, ipd.admissions.write, ipd.transfer.write
ipd.beds.read, ipd.rounds.read, ipd.rounds.write
ipd.discharge.read, ipd.discharge.write
clinical.read, clinical.flow_overview.read, clinical.ambulatory.*
clinical.clindoc.*, clinical.care_companion.read, clinical.notes.write
clinical.orders.read, clinical.orders.write, clinical.prescriptions.write
doctors.chat.read
orders.*, diagnostics.read, pharmacy.read
help.read
```

**Note:** Doctor को `patients.create` नहीं है, इसलिए Registration naturally restricted है।

---

## 11. Implementation Summary

| Area | Config / File | Mechanism |
|------|---------------|-----------|
| Sidebar items | `nav-config.ts` | `excludedRoles: ['DOCTOR']`, `requiredRoles: ['DOCTOR']` |
| Route access | `AppLayout.tsx` | `excludedRoles` check → Access Denied |
| Doctor dashboard | `DashboardPage.tsx` | `role === "DOCTOR"` → `DoctorDashboardPage` |
| Patient list UI | `PatientListPage.tsx` | `isDoctor` → hide Import, Export, Add Patient, chips, description |
| Doctor schedule | `DoctorSchedulePage.tsx` | `isDoctorView` → hide admin controls |
| Recent items | `ModernSidebar.tsx` | `excludedRoles` filter on recent items |

---

## 12. Recommended Additions (Future)

1. **Patients → Registration:** Nav से hide करें doctor के लिए (`excludedRoles: ['DOCTOR']`).
2. **Billing/Pharmacy/Inventory:** Doctor को पूरा module hide; सिर्फ clinical orders/charges जहाँ जरूरी हो वहाँ limited access.
3. **Lab module:** Doctor को सिर्फ Orders & Tests → Lab Result; full Lab Dashboard/Workflow/Catalog hide.
4. **Header quick links:** Doctor role के लिए Billing, Reports जैसे links hide करें.
5. **Bulk actions (Patient list):** Mark inactive, Assign tags, Send SMS, Merge duplicates – doctor के लिए hide करने पर विचार करें।

---

*Last updated: March 2026*
