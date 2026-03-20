# 🔐 Front Desk (RECEPTION Role) Permissions Guide

### Global HIMS System — Role-Based Access Control (RBAC)

HIMS system mein Front Desk (Reception) ka role sabse critical hota hai kyunki wahi primary data entry point hai. Lekin Patient Privacy (HIPAA/GDPR) aur Financial Security ke liye permissions ko balance karna zaruri hai.

---

## ✅ 1. KYA PERMISSION DENI CHAIYE (MUST HAVE)

Ye permissions Front Desk ke daily operational workflows ke liye mandatory hain:

### 📋 Patient Management

- **`patients.create` / `patients.write`**: Naye patient register karne ke liye.
- **`patients.read`**: Purane patients ki details search aur view karne ke liye.
- **`patients.search`**: Global universal search (Phone, MRN, Name).

### 📅 OPD / Appointments

- **`appointments.read`**: Calendar aur availability dekhne ke liye.
- **`appointments.write`**: Booking, Rescheduling aur Cancellation ke liye.
- **`appointments.checkin`**: Patient ko queue mein send karne ke liye.

### 🏥 IPD / Admissions

- **`ipd.admissions.read`**: Bed status aur admission queue dekhne ke liye.
- **`ipd.admissions.write`**: Admission process initiate karne ke liye (Bed allotment context).
- **`ipd.beds.read`**: Real-time bed board dekhne ke liye.

### 💰 Billing (Limited)

- **`billing.read`**: Patient ke outstanding dues aur status check karne ke liye.
- **`billing.payments.write`**: Counter par registration fees ya basic payments accept karne ke liye.
- **`billing.invoices.read`**: Invoices print karke patient ko dene ke liye.

### 🩺 Clinical (Support only)

- **`clinical.kiosk.*`**: Self-service kiosk manage karne ke liye.
- **`clinical.flow_overview.read`**: Patient hospital mein kahan hai (Lab, Radiology, Dr Cabin) ye dekhne ke liye.

---

## 🚫 2. KYA PERMISSION **NAHI** DENI CHAIYE (RESTRICTED)

Ye cheezein Front Desk ke scope se bahar hain aur security risk ho sakti hain:

### 💊 Clinical Actions (Strict No)

- **`clinical.orders.write`**: Dr. prescription ya Lab orders Front Desk nahi de sakta.
- **`clinical.notes.write`**: Patient ki medical history ya consultation notes check/edit nahi kar sakte.
- **`clinical.lab.results.view`**: Sensitive lab reports (HIV, Biopsy, etc.) ki details dekhne ki permission nahi honi chaiye (sirf "Ready/Pending" status dikhna chaiye).

### 📈 Global Billing & Finance

- **`billing.dashboard.read`**: Hospital ka total revenue, collection summary, aur financial growth graph hide hona chaiye.
- **`billing.reports.global`**: Daily Collection Reports (DCR) ya TPA settlements ke global reports restrict honi chaiye.
- **`billing.refunds.write`**: Refund initiate karne ka authority sirf Billing Manager ya Admin ko honi chaiye.

### ⚙️ System Administration

- **`staff.*`**: Staff ki salary, attendance, ya credentials manage karna.
- **`admin.settings`**: Hospital departments, doctor consultation fees setup, ya integration settings.
- **`inventory.*`**: Items kharidna (Procurement) ya Stock adjust karna.

### 🛡️ Security

- **`admin.audit.read`**: Yeh dekhna ki kisne kya change kiya (Audit Trails) sirf Auditors aur Admins ke liye hona chaiye.

---

## 🛠️ Implementation Checklist (Scanbo Matrix)

Scanbo HIMS mein `RECEPTION` role ke liye humne ye implementation ki hai:

| Module               | Access Level          | Reason                                        |
| :------------------- | :-------------------- | :-------------------------------------------- |
| **Dashboard**        | `RECEPTION Dashboard` | Admin ka metrics wala dashboard hide hai.     |
| **Billing Reports**  | 🚫 **Excluded**       | Financial leak prevent karne ke liye.         |
| **TPA Management**   | 🚫 **Excluded**       | TPA global settings secure rakhne ke liye.    |
| **IPD Billing Desk** | 🚫 **Excluded**       | Charges/Medicine entry secure rakhne ke liye. |
| **IPD Billing**      | 🚫 **Excluded**       | Specialized IPD workflows restricted.         |
| **Billing Refunds**  | 🚫 **Excluded**       | Fraud risk prevent karne ke liye.             |
| **Insurance Claims** | 🚫 **Excluded**       | Managed by specialized insurance team.        |
| **Clinical Modules** | 🔍 **Read Only**      | Patient workflow track karne ke liye.         |

---

**Last Updated:** March 19, 2026  
**Status:** Approved for Phase 2 Implementation
