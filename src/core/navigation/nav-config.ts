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
        id: 'ipd',
        label: 'IPD / Inpatient',
        iconName: 'LocalHospital',
        type: 'group',
        requiredPermissions: ['ipd.read'],
        order: 4,
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
            order: 2,
          },
          {
            id: 'ipd-beds',
            label: 'Bed & Census',
            iconName: 'Hotel',
            route: '/ipd/beds',
            type: 'item',
            requiredPermissions: ['ipd.beds.read'],
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
            order: 5,
          },
        ],
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
        ],
      },
      {
        id: 'orders-tests',
        label: 'Orders & Tests',
        iconName: 'ShoppingCart',
        type: 'group',
        requiredPermissions: ['orders.read', 'diagnostics.read'],
        order: 2,
        children: [
          {
            id: 'orders-tests-order-management',
            label: 'Order Management',
            iconName: 'Receipt',
            route: '/ipd/orders-tests/orders',
            type: 'item',
            requiredPermissions: ['orders.read', 'ipd.rounds.read', 'ipd.rounds.write'],
            order: 1,
          },
          {
            id: 'orders-tests-lab-result',
            label: 'Lab Result',
            iconName: 'Science',
            route: '/ipd/orders-tests/lab',
            type: 'item',
            requiredPermissions: ['diagnostics.read', 'diagnostics.lab.read', 'diagnostics.lab.results.read'],
            order: 2,
          },
          {
            id: 'orders-tests-radiology',
            label: 'Radiology',
            iconName: 'Biotech',
            route: '/ipd/orders-tests/radiology',
            type: 'item',
            requiredPermissions: ['diagnostics.read', 'diagnostics.radiology.read'],
            order: 3,
          },
        ],
      },
      {
        id: 'laboratory',
        label: 'Laboratory',
        iconName: 'Science',
        type: 'group',
        requiredPermissions: ['diagnostics.lab.read'],
        order: 3,
        children: [
          { id: 'lab-dashboard', label: 'Dashboard', iconName: 'Dashboard', route: '/lab/dashboard', type: 'item', requiredPermissions: ['diagnostics.lab.read'], order: 1 },
          { id: 'lab-workflow', label: 'Workflow', iconName: 'Assignment', route: '/lab/samples', type: 'item', requiredPermissions: ['diagnostics.lab.read'], order: 2 },
          { id: 'lab-catalog', label: 'Catalog & Setup', iconName: 'Inventory2', route: '/lab/clients', type: 'item', requiredPermissions: ['diagnostics.lab.read'], order: 3 },
          { id: 'lab-reports-qc', label: 'Reports & QC', iconName: 'Description', route: '/lab/reports', type: 'item', requiredPermissions: ['diagnostics.lab.read'], order: 4 },
          { id: 'lab-settings', label: 'Settings', iconName: 'Settings', route: '/lab/settings', type: 'item', requiredPermissions: ['diagnostics.lab.read'], order: 5 },
        ],
      },
    ],
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
            id: 'pharmacy-dispense',
            label: 'Dispense',
            iconName: 'ShoppingBag',
            route: '/pharmacy/dispense',
            type: 'item',
            requiredPermissions: ['pharmacy.dispense.write'],
            order: 1,
          },
          {
            id: 'pharmacy-stock',
            label: 'Stock Management',
            iconName: 'Inventory',
            route: '/pharmacy/stock',
            type: 'item',
            requiredPermissions: ['pharmacy.stock.read'],
            order: 2,
          },
          {
            id: 'pharmacy-returns',
            label: 'Returns',
            iconName: 'Undo',
            route: '/pharmacy/returns',
            type: 'item',
            requiredPermissions: ['pharmacy.returns.write'],
            order: 3,
          },
        ],
      },
      {
        id: 'billing',
        label: 'Billing & Medication Charges',
        iconName: 'ReceiptLong',
        type: 'group',
        requiredPermissions: ['billing.read'],
        order: 2,
        children: [
          {
            id: 'billing-ipd-charge-drug',
            label: 'IPD Charge / Drug',
            iconName: 'Medication',
            route: '/ipd/charges',
            type: 'item',
            requiredPermissions: ['billing.read'],
            order: 1,
          },
          {
            id: 'billing-invoices',
            label: 'Invoices',
            iconName: 'Description',
            route: '/billing/invoices',
            type: 'item',
            requiredPermissions: ['billing.invoices.read'],
            order: 2,
          },
          {
            id: 'billing-payments',
            label: 'Payments',
            iconName: 'Payment',
            route: '/billing/payments',
            type: 'item',
            requiredPermissions: ['billing.payments.write'],
            order: 3,
          },
          {
            id: 'billing-insurance',
            label: 'Insurance / TPA',
            iconName: 'Security',
            route: '/billing/insurance',
            type: 'item',
            requiredPermissions: ['billing.insurance.read'],
            order: 4,
          },
          {
            id: 'billing-refunds',
            label: 'Refunds',
            iconName: 'MoneyOff',
            route: '/billing/refunds',
            type: 'item',
            requiredPermissions: ['billing.refunds.write'],
            order: 5,
          },
        ],
      },
      {
        id: 'inventory',
        label: 'Inventory / Procurement',
        iconName: 'Inventory2',
        type: 'group',
        requiredPermissions: ['inventory.read'],
        order: 3,
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
  {
    id: 'admin',
    label: 'ADMIN',
    items: [
      {
        id: 'staff',
        label: 'Staff',
        iconName: 'Groups',
        type: 'group',
        requiredPermissions: ['staff.read'],
        order: 1,
        children: [
          {
            id: 'staff-users',
            label: 'User Management',
            iconName: 'People',
            route: '/staff/users',
            type: 'item',
            requiredPermissions: ['staff.users.read'],
            order: 1,
          },
          {
            id: 'staff-roles',
            label: 'Role Management',
            iconName: 'AdminPanelSettings',
            route: '/staff/roles',
            type: 'item',
            requiredPermissions: ['staff.roles.read'],
            order: 2,
          },
          {
            id: 'staff-duty-roster',
            label: 'Duty Roster',
            iconName: 'Schedule',
            route: '/staff/duty-roster',
            type: 'item',
            requiredPermissions: ['staff.roster.read'],
            order: 3,
          },
        ],
      },
      {
        id: 'reports',
        label: 'Reports & Analytics',
        iconName: 'Assessment',
        type: 'group',
        requiredPermissions: ['reports.read'],
        order: 2,
        children: [
          {
            id: 'reports-clinical',
            label: 'Clinical Reports',
            iconName: 'MedicalInformation',
            route: '/reports/clinical',
            type: 'item',
            requiredPermissions: ['reports.clinical.read'],
            order: 1,
          },
          {
            id: 'reports-billing',
            label: 'Billing Reports',
            iconName: 'ReceiptLong',
            route: '/reports/billing',
            type: 'item',
            requiredPermissions: ['reports.billing.read'],
            order: 2,
          },
          {
            id: 'reports-inventory',
            label: 'Inventory Reports',
            iconName: 'Inventory2',
            route: '/reports/inventory',
            type: 'item',
            requiredPermissions: ['reports.inventory.read'],
            order: 3,
          },
          {
            id: 'reports-analytics',
            label: 'Analytics Dashboard',
            iconName: 'BarChart',
            route: '/reports/analytics',
            type: 'item',
            requiredPermissions: ['reports.analytics.read'],
            order: 4,
          },
        ],
      },
      {
        id: 'admin-settings',
        label: 'Settings / Admin',
        iconName: 'Settings',
        type: 'group',
        requiredPermissions: ['admin.read'],
        order: 3,
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
            id: 'admin-master-data',
            label: 'Master Data',
            iconName: 'Storage',
            route: '/admin/master-data',
            type: 'item',
            requiredPermissions: ['admin.master.write'],
            order: 3,
          },
          {
            id: 'admin-audit',
            label: 'Audit Logs',
            iconName: 'History',
            route: '/admin/audit',
            type: 'item',
            requiredPermissions: ['admin.audit.read'],
            order: 4,
          },
          {
            id: 'admin-integrations',
            label: 'Integrations',
            iconName: 'Link',
            route: '/admin/integrations',
            type: 'item',
            requiredPermissions: ['admin.integrations.write'],
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
        order: 4,
      },
    ],
  },
  {
    id: 'patient-portal',
    label: '',
    items: [
      { id: 'pp-home', label: 'Dashboard', iconName: 'Home', route: '/patient-portal/home', type: 'item', requiredPermissions: ['patient-portal.read'], order: 1 },
      { id: 'pp-appointments', label: 'Calendar', iconName: 'Event', route: '/patient-portal/appointments', type: 'item', requiredPermissions: ['patient-portal.read'], order: 3 },
      { id: 'pp-my-appointments', label: 'My Appointments', iconName: 'CalendarMonth', route: '/patient-portal/my-appointments', type: 'item', requiredPermissions: ['patient-portal.read'], order: 4 },
      { id: 'pp-medications', label: 'Medications & Rx', iconName: 'Medication', route: '/patient-portal/medications', type: 'item', requiredPermissions: ['patient-portal.read'], order: 5 },
      { id: 'pp-lab-reports', label: 'Lab Reports', iconName: 'Science', route: '/patient-portal/lab-reports', type: 'item', requiredPermissions: ['patient-portal.read'], order: 6 },
      { id: 'pp-medical-records', label: 'Medical Records', iconName: 'FolderShared', route: '/patient-portal/medical-records', type: 'item', requiredPermissions: ['patient-portal.read'], order: 8 },
      { id: 'pp-bills', label: 'Bills & Payments', iconName: 'CreditCard', route: '/patient-portal/bills', type: 'item', requiredPermissions: ['patient-portal.read'], order: 9 },
      { id: 'pp-chat', label: 'Chat', iconName: 'Chat', route: '/patient-portal/chat', type: 'item', requiredPermissions: ['patient-portal.read'], order: 10 },
      { id: 'pp-settings', label: 'Settings', iconName: 'Settings', route: '/patient-portal/settings', type: 'item', requiredPermissions: ['patient-portal.read'], order: 11 },
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
  '/patient-portal/appointments': '/patient-portal/appointments',
  '/patient-portal/my-appointments': '/patient-portal/my-appointments',
  '/patient-portal/medications': '/patient-portal/medications',
  '/patient-portal/prescriptions': '/patient-portal/medications',
  '/patient-portal/lab-reports': '/patient-portal/lab-reports',
  '/patient-portal/medical-records': '/patient-portal/medical-records',
  '/patient-portal/bills': '/patient-portal/bills',
  '/patient-portal/chat': '/patient-portal/chat',
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
