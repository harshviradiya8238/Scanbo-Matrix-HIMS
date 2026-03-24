# Pharmacist Menu Permissions Documentation

This document outlines the recommended and current menu permissions for the **Pharmacist** role in the Scanbo Matrix HIMS.

## Current Permissions Structure

As defined in `src/core/navigation/permissions.ts`, the `PHARMACIST` role currently has the following permissions:

- `dashboard.read`: Access to the main dashboard.
- `patients.read`, `patients.profile.read`: Ability to view patient lists and detailed profiles.
- `clinical.prescriptions.read`, `clinical.prescriptions.write`: Management of patient prescriptions.
- `pharmacy.*`: Full access to all pharmacy-related modules.
- `inventory.*`: Full access to inventory and stock management.
- `reports.inventory.*`: Access to inventory-related reports.
- `doctors.chat.read`: Ability to use the internal chat system for communication with doctors.
- `billing.read`: Ability to view billing information (essential for dispensing).
- `help.read`: Access to help and support documentation.

## Visible Menu Items (Based on Nav Config)

### 1. MAIN Section

- **Dashboard**: Visible (`dashboard.read`).
- **Patients**:
  - **Patient List**: Visible (`patients.read`).
  - _Registration_: Hidden (`patients.create` not granted).
- **OPD / IPD / Appointments**: Entirely hidden for pharmacists to maintain clinical focus.

### 2. OPERATIONS Section

- **Pharmacy**:
  - **Pharmacy Dashboard**: Hidden (Explicitly excluded for `PHARMACIST` as per recent update).
  - **Willow Pharmacy**: Visible (`pharmacy.read`).
  - **Dispense**: New menu for medication dispensing (`pharmacy.read`).
  - **Prescription Queue**: Visible (`pharmacy.read`).
  - **Returns**: Visible (`pharmacy.returns.write`).
- **Billing Control Tower**:
  - **Limited Access**: Only **Outstanding Dues** and **Patient Billing Desk** are visible to the Pharmacist for tracking payments and adding medication charges.
  - _Hidden_: OPD Billing, IPD Billing, and Day Book are hidden.
- **Billing & Revenue Cycle**: Entirely hidden for Pharmacists (`excludedRoles`).
- **Insurance Control Tower**: Entirely hidden for Pharmacists (`excludedRoles`).
- **Inventory / Procurement**:
  - Full access to **Items**, **Purchase Orders**, **GRN**, and **Vendors** (`inventory.*`).

### 3. ADMIN Section

- **Reports & Analytics**:
  - **Inventory Reports**: Accessible (`reports.inventory.read`).
  - Note: Pharmacists do _not_ see billing or clinical reports.

## Recent Changes

- **Pharmacy Dashboard**: This menu item has been hidden for the `PHARMACIST` role to streamline the workflow and focus on the Prescription Queue and Stock Management.

## Recommendations for Configuration

1. **Chat Access**: Currently, the "Chat" menu item in the sidebar is restricted to the `DOCTOR` role in `nav-config.ts`. If pharmacists need to initiate chat with doctors, this should be updated to include `PHARMACIST`.
2. **Prescription Filling**: Ensure `clinical.prescriptions.write` is used for marking prescriptions as "Filled" or "Dispensed".
3. **Billing Integration**: Pharmacists need `billing.read` to ensure medications are only dispensed after payment verification (unless following a credit policy).
