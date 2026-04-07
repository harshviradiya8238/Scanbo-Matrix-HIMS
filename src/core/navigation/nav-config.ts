/**
 * Modern Navigation Configuration
 * Single source of truth for sidebar navigation
 * Organized by workflow groups: MAIN, CLINICAL, OPERATIONS, ADMIN
 */

import { MenuItem } from './types';

export interface NavGroup {
  id: string;
  label: string;
  items: MenuItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'main',
    label: 'MAIN',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        iconName: 'Dashboard',
        route: '/dashboard',
        type: 'item',
        requiredPermissions: ['dashboard.read'],
        order: 1,
      },
      {
        id: 'patients',
        label: 'Patients',
        iconName: 'People',
        type: 'group',
        requiredPermissions: ['patients.read'],
        excludedRoles: ['PHARMACIST'],
        order: 2,
        children: [
          {
            id: 'patients-registration',
            label: 'Registration',
            iconName: 'PersonAdd',
            route: '/patients/registration',
            type: 'item',
            requiredPermissions: ['patients.create'],
            order: 1,
          },
          {
            id: 'patients-list',
            label: 'Patient List',
            iconName: 'List',
            route: '/patients/list',
            type: 'item',
            requiredPermissions: ['patients.read'],
            order: 2,
          },
        ],
      },
      {
        id: 'appointments',
        label: 'OPD / Appointments',
        iconName: 'Event',
        type: 'group',
        requiredPermissions: ['appointments.read'],
        excludedRoles: ['PHARMACIST'],
        order: 3,
        children: [
          {
            id: 'appointments-calendar',
            label: 'Calendar',
            iconName: 'CalendarToday',
            route: '/appointments/calendar',
            type: 'item',
            requiredPermissions: ['appointments.read'],
            order: 1,
          },
          {
            id: 'appointments-queue',
            label: 'Queue',
            iconName: 'Queue',
            route: '/appointments/queue',
            type: 'item',
            requiredPermissions: ['appointments.read'],
            order: 2,
            badgeCount: 0,
          },
        ],
      },
      {
        id: 'doctors',
        label: 'Doctors',
        iconName: 'MedicalServices',
        type: 'group',
        requiredPermissions: ['doctors.read'],
        excludedRoles: ['PHARMACIST'],
        order: 4,
        children: [
          {
            id: 'doctors-registration',
            label: 'Registration',
            iconName: 'PersonAdd',
            route: '/doctors/registration',
            type: 'item',
            requiredPermissions: ['doctors.create'],
            excludedRoles: ['DOCTOR'],
            order: 1,
          },
          {
            id: 'doctors-list',
            label: 'Doctor List',
            iconName: 'List',
            route: '/doctors/list',
            type: 'item',
            requiredPermissions: ['doctors.read'],
            excludedRoles: ['DOCTOR'],
            order: 2,
          },
          {
            id: 'doctors-schedule',
            label: 'Doctors Schedule',
            iconName: 'CalendarToday',
            route: '/doctors/schedule',
            type: 'item',
            requiredPermissions: ['doctors.read'],
            order: 3,
          },
        ],
      },
      {
        id: 'doctor-patient-cases',
        label: 'Patient Cases',
        iconName: 'FolderShared',
        route: '/doctor/patient-cases',
        type: 'item',
        requiredPermissions: ['patients.read'],
        requiredRoles: ['DOCTOR'],
        order: 5,
      },
      {
        id: 'ipd',
        label: 'IPD / Inpatient',
        iconName: 'LocalHospital',
        type: 'group',
        requiredPermissions: ['ipd.read'],
        excludedRoles: ['PHARMACIST'],
        order: 5,
        children: [
          {
            id: 'ipd-dashboard',
            label: 'IPD Dashboard',
            iconName: 'Dashboard',
            route: '/ipd/dashboard',
            type: 'item',
            requiredPermissions: ['ipd.read'],
            order: 1,
          },
          {
            id: 'ipd-admissions',
            label: 'Admission & ADT',
            iconName: 'HowToReg',
            route: '/ipd/admissions',
            type: 'item',
            requiredPermissions: ['ipd.admissions.write'],
            excludedRoles: ['DOCTOR'],
            order: 2,
          },
          {
            id: 'ipd-beds',
            label: 'Bed & Census',
            iconName: 'Hotel',
            route: '/ipd/beds',
            type: 'item',
            requiredPermissions: ['ipd.beds.read'],
            excludedRoles: ['DOCTOR'],
            order: 3,
          },
          {
            id: 'ipd-clinical-care',
            label: 'Clinical Care',
            iconName: 'MedicalServices',
            route: '/ipd/rounds',
            type: 'item',
            requiredPermissions: ['ipd.rounds.write'],
            order: 4,
          },
          {
            id: 'ipd-discharge',
            label: 'Discharge & Clearance',
            iconName: 'ExitToApp',
            route: '/ipd/discharge',
            type: 'item',
            requiredPermissions: ['ipd.discharge.write'],
            excludedRoles: ['DOCTOR'],
            order: 5,
          },
        ],
      },
      {
        id: 'main-chat',
        label: 'Chat',
        iconName: 'Chat',
        route: '/doctors/chat',
        type: 'item',
        requiredPermissions: ['doctors.chat.read'],
        requiredRoles: ['DOCTOR'],
        order: 6,
      },
    ],
  },
  {
    id: 'clinical',
    label: 'CLINICAL',
    items: [
      {
        id: 'clinical-emr',
        label: 'Clinical / EMR',
        iconName: 'MedicalInformation',
        type: 'group',
        requiredPermissions: ['clinical.read'],
        excludedRoles: ['PHARMACIST'],
        order: 1,
        children: [
          {
            id: 'clinical-care-companion',
            label: 'Care Companion',
            iconName: 'Healing',
            route: '/clinical/modules/care-companion',
            type: 'item',
            requiredPermissions: ['clinical.care_companion.read'],
            order: 1,
          },
          {
            id: 'clinical-infection-control',
            label: 'Infection Control',
            iconName: 'Security',
            route: '/clinical/modules/bugsy-infection-control',
            type: 'item',
            requiredPermissions: ['clinical.infection_control.read'],
            order: 2,
          },
          {
            id: 'clinical-emergency-asap',
            label: 'Emergency (ASAP)',
            iconName: 'LocalHospital',
            route: '/clinical/modules/asap',
            type: 'item',
            requiredPermissions: ['emergency.asap.read'],
            order: 3,
          },
        ],
      },
      {
        id: 'clinical-surgery',
        label: 'Surgery / OT',
        iconName: 'MedicalServices',
        type: 'group',
        requiredPermissions: ['surgery.optime.read'],
        excludedRoles: ['PHARMACIST'],
        order: 2,
        children: [
          {
            id: 'clinical-surgery-optime',
            label: 'OpTime',
            iconName: 'LocalHospital',
            route: '/clinical/modules/optime',
            type: 'item',
            requiredPermissions: ['surgery.optime.read'],
            order: 1,
          },
          {
            id: 'clinical-surgery-anesthesia',
            label: 'Anesthesia',
            iconName: 'MonitorHeart',
            route: '/clinical/modules/anesthesia',
            type: 'item',
            requiredPermissions: ['surgery.anesthesia.read'],
            order: 2,
          },
        ],
      },
      {
        id:"radiology",
        label:"Radiology",
        iconName:"Biotech",
        type:"group",
        requiredPermissions:["diagnostics.radiology.read"],
        excludedRoles:["PHARMACIST"],
        order:4,
        children:[
          {
            id:"radiology-dashboard",
            label:"Radiology Dashboard",
            iconName:"Dashboard",
            route:"/radiology/dashboard",
            type:"item",
            requiredPermissions:["diagnostics.radiology.read"],
            order:1,
          },
          {
            id:"schedule",
            label:"Schedule",
            iconName:"Schedule",
            route:"/radiology/schedule",
            type:"item",
            requiredPermissions:["diagnostics.radiology.read"],
            order:2,
          },
          {
            id:"worklist",
            label:"Worklist",
            iconName:"Assignment",
            route:"/radiology/worklist",
            type:"item",
            requiredPermissions:["diagnostics.radiology.read"],
            order:3,
          },
          {
            id:"pacs-viewer",
            label:"PACS Viewer",
            iconName:"PACS",
            route:"/radiology/pacs-viewer",
            type:"item",
            requiredPermissions:["diagnostics.radiology.read"],
            order:4,
          },
          {
            id:"reports",
            label:"Reports",
            iconName:"Description",
            route:"/radiology/reports",
            type:"item",
            requiredPermissions:["diagnostics.radiology.read"],
            order:5,
          },
        ]
      },
      
     
    ],
  },
  {
    id: 'laboratory',
    label: 'Laboratory',
    items: [
      {
        id: 'laboratory-sample-lifecycle',
        label: 'Sample Lifecycle',
        iconName: 'Science',
        type: 'group',
        requiredPermissions: ['diagnostics.lab.read'],
        excludedRoles: ['PHARMACIST'],
        order: 1,
        children: [
          { id: 'lab-dashboard', label: 'Dashboard', iconName: 'Dashboard', route: '/lab/dashboard', type: 'item', requiredPermissions: ['diagnostics.lab.read'], excludedRoles: ['LAB_MANAGER'], order: 1 },
          { id: 'lab-samples', label: 'Samples', iconName: 'LocalHospital', route: '/lab/samples', type: 'item', requiredPermissions: ['diagnostics.lab.read'], order: 1, badgeCount: 2 },
          // { id: 'lab-workflow', label: 'Samples', iconName: 'Assignment', route: '/lab/samples', type: 'item', requiredPermissions: ['diagnostics.lab.read'], order: 2 },
          { id: 'lab-recive', label: 'Receive', iconName: 'Science', route: '/lab/receive', type: 'item', requiredPermissions: ['diagnostics.lab.read'], order: 2, badgeCount: 7 },
          { id: 'lab-partitions', label: 'Sample Partition', iconName: 'ContentCut', route: '/lab/partitions', type: 'item', requiredPermissions: ['diagnostics.lab.read'], order: 3 },
        ],
      },
       {
        id: 'lab-analysis-workflow',
        label: 'Analysis Workflow',
        iconName: 'Timeline',
        type: 'group',
        requiredPermissions: ['diagnostics.lab.read'],
        order: 2,
        children: [
          { id: 'lab-aw-worksheets', label: 'Worksheets', iconName: 'Assignment', route: '/lab/worksheets', type: 'item', requiredPermissions: ['diagnostics.lab.read'], order: 1 },
          {id:'lab-analysis-results',label:'Analysis Results',iconName:'People',route:'/lab/analysis-results',type:'item',requiredPermissions:['diagnostics.lab.read'],order: 2},
          // { id: 'lab-aw-verification', label: 'Verification', iconName: 'FactCheck', route: '/lab/verification', type: 'item', requiredPermissions: ['diagnostics.lab.read'], order: 3, badgeCount: 11 },
          // { id: 'lab-aw-publish', label: 'Publish Reports', iconName: 'Publish', route: '/lab/publish', type: 'item', requiredPermissions: ['diagnostics.lab.read'], order: 4 },
          { id: 'lab-aw-invalidations', label: 'Invalidations', iconName: 'Undo', route: '/lab/invalidations', type: 'item', requiredPermissions: ['diagnostics.lab.read'], order: 3 },
        ]
      },
      {
        id: 'lab-quality-control',
        label: 'Quality Control',
        iconName: 'Analytics',
        type: 'group',
        requiredPermissions: ['diagnostics.lab.read'],
        order: 3,
        children: [
          { id: 'lab-qc-samples', label: 'QC Samples', iconName: 'Analytics', route: '/lab/qc', type: 'item', requiredPermissions: ['diagnostics.lab.read'], order: 1 },
          // { id: 'lab-qc-levey-jennings', label: 'Levey-Jennings', iconName: 'Timeline', route: '/lab/qc/charts', type: 'item', requiredPermissions: ['diagnostics.lab.read'], order: 2 },
          { id: 'lab-qc-calculations', label: 'Calculations', iconName: 'Calculate', route: '/lab/qc/calculations', type: 'item', requiredPermissions: ['diagnostics.lab.read'], order: 2 },
          { id: 'lab-qc-methods', label: 'Methods', iconName: 'Build', route: '/lab/qc/methods', type: 'item', requiredPermissions: ['diagnostics.lab.read'], order: 3 },
          { id: 'lab-qc-audit', label: 'Audit Trail', iconName: 'History', route: '/lab/qc/audit', type: 'item', requiredPermissions: ['diagnostics.lab.read'], order: 4 },
        ],
      },
      {
        id: 'lab-setup',
        label: 'Setup',
        iconName: 'Settings',
        type: 'group',
        requiredPermissions: ['diagnostics.lab.read'],
        order: 4,
        children: [
          { id: 'lab-test-catalog', label: 'Test Catalog', iconName: 'MenuBook', route: '/lab/test-catalog', type: 'item', requiredPermissions: ['diagnostics.lab.read'], order: 1 },
          { id: 'lab-analysis-profiles', label: 'Analysis Profiles', iconName: 'TrackChanges', route: '/lab/analysis-profiles', type: 'item', requiredPermissions: ['diagnostics.lab.read'], order: 2 },
          { id: 'lab-instruments-setup', label: 'Instruments', iconName: 'Science', route: '/lab/instruments', type: 'item', requiredPermissions: ['diagnostics.lab.read'], order: 3 },
          // { id: 'lab-reagents', label: 'Reagents', iconName: 'Vaccines', route: '/lab/reagents', type: 'item', requiredPermissions: ['diagnostics.lab.read', 'pharmacy.read'], order: 4, badgeCount: 3 },
          { id: 'lab-departments', label: 'Departments', iconName: 'CorporateFare', route: '/lab/departments', type: 'item', requiredPermissions: ['diagnostics.lab.read'], order: 4 },
        ],
      },
      
    ]
  },
  {
    id: 'operations',
    label: 'OPERATIONS',
    items: [
      {
        id: 'pharmacy',
        label: 'Pharmacy',
        iconName: 'LocalPharmacy',
        type: 'group',
        requiredPermissions: ['pharmacy.read'],
        order: 1,
        children: [
          {
            id: 'pharmacy-dashboard',
            label: 'Pharmacy Dashboard',
            iconName: 'Dashboard',
            route: '/pharmacy',
            type: 'item',
            requiredPermissions: ['pharmacy.read'],
            excludedRoles: ['PHARMACIST'],
            order: 1,
          },
          {
            id: 'pharmacy-prescription-queue',
            label: 'Prescription Queue',
            iconName: 'Medication',
            route: '/pharmacy/prescription-queue',
            type: 'item',
            requiredPermissions: ['pharmacy.read'],
            badgeCount: 3,
            order: 3,
          },
          {
            id: 'pharmacy-stock',
            label: 'Stock Management',
            iconName: 'Inventory',
            route: '/pharmacy/stock',
            type: 'item',
            requiredPermissions: ['pharmacy.stock.read'],
            order: 4,
          },
          {
            id: 'pharmacy-returns',
            label: 'Returns',
            iconName: 'Undo',
            route: '/pharmacy/returns',
            type: 'item',
            requiredPermissions: ['pharmacy.returns.write'],
            order: 5,
          },
        ],
      },
      {
        id: 'billing-control-tower',
        label: 'Billing Control Tower',
        iconName: 'ReceiptLong',
        type: 'group',
        requiredPermissions: ['billing.read'],
        excludedRoles: ['PHARMACIST'],
        order: 2,
        children: [
          {
            id: 'billing-opd',
            label: 'OPD Billing',
            iconName: 'Receipt',
            route: '/billing/opd',
            type: 'item',
            requiredPermissions: ['billing.read'],
            excludedRoles: ['PHARMACIST'],
            order: 1,
          },
          {
            id: 'billing-ipd',
            label: 'IPD Billing',
            iconName: 'LocalHospital',
            route: '/billing/ipd',
            type: 'item',
            requiredPermissions: ['billing.read'],
            excludedRoles: ['RECEPTION', 'PHARMACIST'],
            order: 2,
          },
          {
            id: 'billing-outstanding-dues',
            label: 'Outstanding Dues',
            iconName: 'Pending',
            route: '/billing/outstanding-dues',
            type: 'item',
            requiredPermissions: ['billing.read'],
            order: 3,
          },
          {
            id: 'billing-day-book',
            label: 'Day Book',
            iconName: 'MenuBook',
            route: '/billing/day-book',
            type: 'item',
            requiredPermissions: ['billing.read'],
            excludedRoles: ['PHARMACIST'],
            order: 4,
          },
          {
            id: 'billing-ipd-charge-drug',
            label: 'Patient Billing Desk',
            iconName: 'Medication',
            route: '/ipd/charges',
            type: 'item',
            requiredPermissions: ['billing.read'],
            excludedRoles: ['RECEPTION'],
            order: 5,
          },
        ],
      },
      {
        id: 'billing',
        label: 'Billing & Revenue Cycle',
        iconName: 'AccountBalance',
        type: 'group',
        requiredPermissions: ['billing.read'],
        excludedRoles: ['PHARMACIST'],
        order: 3,
        children: [
          {
            id: 'billing-dashboard',
            label: 'Billing Dashboard',
            iconName: 'DashboardOutlined',
            route: '/billing/billing-dashboard',
            type: 'item',
            requiredPermissions: ['billing.read'],
            excludedRoles: ['RECEPTION', 'PHARMACIST'],
            order: 1,
          },
          {
            id: 'billing-invoices',
            label: 'All Invoice',
            iconName: 'ReceiptLong',
            route: '/billing/invoices',
            type: 'item',
            requiredPermissions: ['billing.read'],
            order: 2,
          },
          {
            id: 'billing-payments',
            label: 'Payment Receipts',
            iconName: 'AccountBalanceWalletOutlined',
            route: '/billing/payments',
            type: 'item',
            requiredPermissions: ['billing.read'],
            order: 3,
          },
          {
            id: 'billing-refunds',
            label: 'Refunds',
            iconName: 'AssignmentReturnOutlined',
            route: '/billing/refunds',
            type: 'item',
            requiredPermissions: ['billing.read'],
            excludedRoles: ['RECEPTION'],
            order: 4,
          },
          {
            id: 'billing-reports',
            label: 'Reports',
            iconName: 'Assessment',
            route: '/billing/reports',
            type: 'item',
            requiredPermissions: ['billing.read'],
            excludedRoles: ['RECEPTION'],
            order: 5,
          },
        ],
      },
      {
        id: 'insurance-control-tower',
        label: 'Insurance Control Tower',
        iconName: 'Shield',
        type: 'group',
        requiredPermissions: ['billing.read'],
        excludedRoles: ['PHARMACIST'],
        order: 4,
        children: [
          {
            id: 'insurance-claims',
            label: 'Insurance Claims',
            iconName: 'Assignment',
            route: '/billing/insurance',
            type: 'item',
            requiredPermissions: ['billing.read'],
            excludedRoles: ['RECEPTION'],
            order: 1,
          },
          {
            id: 'insurance-tpa',
            label: 'TPA Management',
            iconName: 'Business',
            route: '/billing/tpa-management',
            type: 'item',
            requiredPermissions: ['billing.read'],
            excludedRoles: ['RECEPTION'],
            order: 2,
          },
        ],
      },
      {
        id: 'inventory',
        label: 'Inventory / Procurement',
        iconName: 'Inventory2',
        type: 'group',
        requiredPermissions: ['inventory.read'],
        order: 5,
        children: [
          {
            id: 'inventory-items',
            label: 'Items',
            iconName: 'Category',
            route: '/inventory/items',
            type: 'item',
            requiredPermissions: ['inventory.items.read'],
            order: 1,
          },
          {
            id: 'inventory-purchase-orders',
            label: 'Purchase Orders',
            iconName: 'ShoppingCart',
            route: '/inventory/purchase-orders',
            type: 'item',
            requiredPermissions: ['inventory.purchase.write'],
            order: 2,
          },
          {
            id: 'inventory-grn',
            label: 'GRN (Goods Receipt Note)',
            iconName: 'Assignment',
            route: '/inventory/grn',
            type: 'item',
            requiredPermissions: ['inventory.grn.write'],
            order: 3,
          },
          {
            id: 'inventory-vendors',
            label: 'Vendors',
            iconName: 'Business',
            route: '/inventory/vendors',
            type: 'item',
            requiredPermissions: ['inventory.vendors.read'],
            order: 4,
          },
        ],
      },
    ],
  },
  // {
  //   id: 'financial-assistance',
  //   label: 'FINANCIAL ASSISTANCE',
  //   items: [
  //     {
  //       id: 'financial-assistance-requests',
  //       label: 'Assistance Requests',
  //       iconName: 'VolunteerActivism',
  //       route: '/financial-assistance',
  //       type: 'item',
  //       requiredPermissions: ['financial-assistance.requests.read'],
  //       order: 1,
  //     },
  //   ],
  // },
  {
    id: 'admin',
    label: 'ADMIN',
    items: [
      {
        id: 'reports',
        label: 'Reports & Analytics',
        iconName: 'Assessment',
        type: 'group',
        requiredPermissions: ['reports.read'],
        order: 1,
        children: [
          {
            id: 'reports-clinical',
            label: 'Reporting Workbench',
            iconName: 'MedicalInformation',
            route: '/reports/workbench',
            type: 'item',
            requiredPermissions: ['reports.clinical.read'],
            order: 1,
          },
          // {
          //   id: 'reports-billing',
          //   label: 'Billing Reports',
          //   iconName: 'ReceiptLong',
          //   route: '/reports/billing',
          //   type: 'item',
          //   requiredPermissions: ['reports.billing.read'],
          //   excludedRoles: ['RECEPTION'],
          //   order: 2,
          // },
          // {
          //   id: 'reports-inventory',
          //   label: 'Inventory Reports',
          //   iconName: 'Inventory2',
          //   route: '/reports/inventory',
          //   type: 'item',
          //   requiredPermissions: ['reports.inventory.read'],
          //   order: 3,
          // },
          // {
          //   id: 'reports-analytics',
          //   label: 'Analytics Dashboard',
          //   iconName: 'BarChart',
          //   route: '/reports/analytics',
          //   type: 'item',
          //   requiredPermissions: ['reports.analytics.read'],
          //   order: 4,
          // },
        ],
      },
      {
        id: 'admin-settings',
        label: 'Settings / Admin',
        iconName: 'Settings',
        type: 'group',
        requiredPermissions: ['admin.read'],
        order: 2,
        children: [
          {
            id: 'admin-facility',
            label: 'Facility Settings',
            iconName: 'Business',
            route: '/admin/facility',
            type: 'item',
            requiredPermissions: ['admin.facility.write'],
            order: 1,
          },
          {
            id: 'admin-departments',
            label: 'Departments',
            iconName: 'CorporateFare',
            route: '/admin/departments',
            type: 'item',
            requiredPermissions: ['admin.departments.write'],
            order: 2,
          },
          {
            id: 'admin-audit',
            label: 'Audit Logs',
            iconName: 'History',
            route: '/admin/audit',
            type: 'item',
            requiredPermissions: ['admin.audit.read'],
            order: 3,
          },
          {
            id: 'staff-roles',
            label: 'Role Management',
            iconName: 'AdminPanelSettings',
            route: '/staff/roles',
            type: 'item',
            requiredPermissions: ['staff.roles.read'],
            order: 4,
          },
          {
            id: 'staff-users',
            label: 'User Management',
            iconName: 'People',
            route: '/staff/users',
            type: 'item',
            requiredPermissions: ['staff.users.read'],
            order: 5,
          },
        ],
      },
      {
        id: 'help',
        label: 'Help / Support',
        iconName: 'Help',
        route: '/help',
        type: 'item',
        requiredPermissions: ['help.read'],
        order: 3,
      },
    ],
  },
  {
    id: 'patient-portal',
    label: 'PATIENT PORTAL',
    items: [
      { id: 'pp-home', label: 'Dashboard', iconName: 'Home', route: '/patient-portal/home', type: 'item', requiredPermissions: ['patient-portal.read'], order: 1 },
      { id: 'pp-family', label: 'Family Members', iconName: 'FamilyRestroom', route: '/patient-portal/family', type: 'item', requiredPermissions: ['patient-portal.read'], order: 2 },
      { id: 'pp-my-appointments', label: 'My Appointments', iconName: 'CalendarMonth', route: '/patient-portal/my-appointments', type: 'item', requiredPermissions: ['patient-portal.read'], order: 3 },
      { id: 'pp-medications', label: 'Medications & Rx', iconName: 'Medication', route: '/patient-portal/medications', type: 'item', requiredPermissions: ['patient-portal.read'], order: 5 },
      { id: 'pp-medical-records', label: 'Medical Records', iconName: 'FolderShared', route: '/patient-portal/medical-records', type: 'item', requiredPermissions: ['patient-portal.read'], order: 8 },
      { id: 'pp-bills', label: 'Bills & Payments', iconName: 'CreditCard', route: '/patient-portal/bills', type: 'item', requiredPermissions: ['patient-portal.read'], order: 9 },
      { id: 'pp-chat', label: 'Chat', iconName: 'Chat', route: '/patient-portal/chat', type: 'item', requiredPermissions: ['patient-portal.read'], order: 10 },
      { id: 'pp-financial-assistance', label: 'Financial Assistance', iconName: 'VolunteerActivism', route: '/patient-portal/financial-assistance', type: 'item', requiredPermissions: ['patient-portal.read'], order: 11 },
      { id: 'pp-share', label: 'Data Sharing', iconName: 'Share', route: '/patient-portal/share', type: 'item', requiredPermissions: ['patient-portal.read'], order: 12 },
      { id: 'pp-settings', label: 'Settings', iconName: 'Settings', route: '/patient-portal/settings', type: 'item', requiredPermissions: ['patient-portal.read'], order: 13 },
    ],
  },
];

const ROUTE_ALIAS_PATTERNS: Array<{
  pattern: RegExp;
  targetRoute: string;
}> = [
  {
    pattern: /^\/encounters\/[^/]+(?:\/orders|\/prescriptions)?$/,
    targetRoute: '/appointments/queue',
  },
];

function normalizeRoute(route: string): string {
  if (!route) return '';
  if (route === '/') return route;
  return route.replace(/\/+$/, '');
}

/**
 * Resolve dynamic or alias routes to a canonical navigation route.
 */
export function resolveNavigationRoute(route: string): string {
  const normalized = normalizeRoute(route);
  const aliasMatch = ROUTE_ALIAS_PATTERNS.find((item) => item.pattern.test(normalized));
  return aliasMatch?.targetRoute ?? normalized;
}

/**
 * Get all menu items flattened (for search, etc.)
 */
export function getAllMenuItems(): MenuItem[] {
  const items: MenuItem[] = [];
  NAV_GROUPS.forEach((group) => {
    items.push(...group.items);
  });
  return items;
}

/** Lab pathname → main nav route (sidebar shows 5 items; sub-pages map to section) */
const LAB_PATH_TO_NAV_ROUTE: Record<string, string> = {
  '/lab/dashboard': '/lab/dashboard',
  '/lab/samples': '/lab/samples',
  '/lab/worksheets': '/lab/samples',
  '/lab/results': '/lab/samples',
  '/lab/clients': '/lab/clients',
  '/lab/tests': '/lab/clients',
  '/lab/instruments': '/lab/clients',
  '/lab/inventory': '/lab/clients',
  '/lab/reports': '/lab/reports',
  '/lab/quality-control': '/lab/reports',
  '/lab/settings': '/lab/settings',
};

function getLabNavRoute(pathname: string): string | null {
  const base = pathname.split('?')[0].replace(/\/+$/, '') || '';
  if (!base.startsWith('/lab/')) return null;
  const segment = base.split('/').slice(0, 3).join('/');
  return LAB_PATH_TO_NAV_ROUTE[segment] ?? LAB_PATH_TO_NAV_ROUTE['/lab/dashboard'] ?? null;
}

const PP_PATH_TO_NAV_ROUTE: Record<string, string> = {
  '/patient-portal/home': '/patient-portal/home',
  '/patient-portal/profile': '/patient-portal/profile',
  '/patient-portal/appointments': '/patient-portal/my-appointments',
  '/patient-portal/my-appointments': '/patient-portal/my-appointments',
  '/patient-portal/medications': '/patient-portal/medications',
  '/patient-portal/prescriptions': '/patient-portal/medications',
  '/patient-portal/lab-reports': '/patient-portal/lab-reports',
  '/patient-portal/lab-requisitions': '/patient-portal/lab-requisitions',
  '/patient-portal/medical-records': '/patient-portal/medical-records',
  '/patient-portal/bills': '/patient-portal/bills',
  '/patient-portal/chat': '/patient-portal/chat',
  '/patient-portal/family': '/patient-portal/family',
  '/patient-portal/financial-assistance': '/patient-portal/financial-assistance',
  '/patient-portal/share': '/patient-portal/share',
  '/patient-portal/settings': '/patient-portal/settings',
};

function getPatientPortalNavRoute(pathname: string): string | null {
  const base = pathname.split('?')[0].replace(/\/+$/, '') || '';
  if (!base.startsWith('/patient-portal/')) return null;
  const segment = base.split('/').slice(0, 3).join('/');
  return PP_PATH_TO_NAV_ROUTE[segment] ?? PP_PATH_TO_NAV_ROUTE['/patient-portal/home'] ?? null;
}

/**
 * Get menu item by route
 */
export function getMenuItemByRoute(route: string): MenuItem | null {
  const canonicalRoute = resolveNavigationRoute(route);
  const labRoute = getLabNavRoute(canonicalRoute);
  const ppRoute = getPatientPortalNavRoute(canonicalRoute);
  const routeToFind = labRoute ?? ppRoute ?? canonicalRoute;

  function searchItems(items: MenuItem[]): MenuItem | null {
    for (const item of items) {
      if (item.route === routeToFind) {
        return item;
      }
      if (item.children) {
        const found = searchItems(item.children);
        if (found) return found;
      }
    }
    return null;
  }

  for (const group of NAV_GROUPS) {
    const found = searchItems(group.items);
    if (found) return found;
  }
  return null;
}

/**
 * Get breadcrumb path for a route
 */
export function getBreadcrumbPath(route: string): MenuItem[] {
  const canonicalRoute = resolveNavigationRoute(route);
  const path: MenuItem[] = [];

  function searchItems(items: MenuItem[], currentPath: MenuItem[] = []): boolean {
    for (const item of items) {
      const newPath = [...currentPath, item];
      if (item.route === canonicalRoute) {
        path.push(...newPath);
        return true;
      }
      if (item.children) {
        if (searchItems(item.children, newPath)) {
          return true;
        }
      }
    }
    return false;
  }

  for (const group of NAV_GROUPS) {
    if (searchItems(group.items)) {
      return path;
    }
  }
  return path;
}
