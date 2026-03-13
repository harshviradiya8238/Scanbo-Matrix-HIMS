export type InventoryItemStatus = 'Active' | 'Inactive';
export type ScheduleClass = 'OTC' | 'Rx' | 'Controlled';
export type PurchaseOrderStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'Sent to Vendor'
  | 'Partially Received'
  | 'Closed'
  | 'Cancelled';

export interface InventoryItem {
  id: string;
  itemCode: string;
  drugName: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  route: string;
  category: string;
  scheduleClass: ScheduleClass;
  defaultUnit: string;
  reorderLevel: number;
  unitCost: number;
  preferredVendor: string;
  status: InventoryItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStockRow {
  id: string;
  itemId: string;
  onHand: number;
  reserved: number;
  location: string;
  nextExpiry: string;
  updatedAt: string;
}

export interface PurchaseOrderLine {
  id: string;
  itemId: string;
  itemLabel: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
}

export interface PurchaseOrderHistory {
  id: string;
  at: string;
  actor: string;
  action: string;
  note?: string;
}

export interface PurchaseOrderRecord {
  id: string;
  poNumber: string;
  vendor: string;
  status: PurchaseOrderStatus;
  expectedDeliveryDate: string;
  requestedBy: string;
  approvedBy?: string;
  createdAt: string;
  notes: string;
  lines: PurchaseOrderLine[];
  history: PurchaseOrderHistory[];
}

export interface GrnLine {
  id: string;
  itemId: string;
  itemLabel: string;
  acceptedQty: number;
  rejectedQty: number;
  batchNo: string;
  expiryDate: string;
  location: string;
  unitCost: number;
}

export interface GrnRecord {
  id: string;
  grnNumber: string;
  poId: string;
  poNumber: string;
  vendor: string;
  invoiceNo: string;
  receivedBy: string;
  receivedAt: string;
  notes: string;
  lines: GrnLine[];
}

export interface InventoryState {
  version: 1;
  items: InventoryItem[];
  stock: InventoryStockRow[];
  purchaseOrders: PurchaseOrderRecord[];
  grns: GrnRecord[];
}

export const INVENTORY_STATE_STORAGE_KEY = 'scanbo.hims.inventory.unified.v1';

const now = new Date();

function atOffset(hours: number): string {
  return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
}

const DEFAULT_ITEMS: InventoryItem[] = [
  {
    id: 'itm-001',
    itemCode: 'DRG-0001',
    drugName: 'Clopidogrel',
    genericName: 'Clopidogrel',
    strength: '75mg',
    dosageForm: 'Tablet',
    route: 'Oral',
    category: 'Cardiology',
    scheduleClass: 'Rx',
    defaultUnit: 'tablet',
    reorderLevel: 120,
    unitCost: 18,
    preferredVendor: 'Healix Pharma',
    status: 'Active',
    createdAt: atOffset(800),
    updatedAt: atOffset(24),
  },
  {
    id: 'itm-002',
    itemCode: 'DRG-0002',
    drugName: 'Atorvastatin',
    genericName: 'Atorvastatin',
    strength: '80mg',
    dosageForm: 'Tablet',
    route: 'Oral',
    category: 'Cardiology',
    scheduleClass: 'Rx',
    defaultUnit: 'tablet',
    reorderLevel: 100,
    unitCost: 24,
    preferredVendor: 'Healix Pharma',
    status: 'Active',
    createdAt: atOffset(790),
    updatedAt: atOffset(20),
  },
  {
    id: 'itm-003',
    itemCode: 'DRG-0003',
    drugName: 'Morphine',
    genericName: 'Morphine Sulfate',
    strength: '10mg/mL',
    dosageForm: 'Injection',
    route: 'IV',
    category: 'Controlled',
    scheduleClass: 'Controlled',
    defaultUnit: 'ampoule',
    reorderLevel: 20,
    unitCost: 145,
    preferredVendor: 'LifeMed Exports',
    status: 'Active',
    createdAt: atOffset(780),
    updatedAt: atOffset(12),
  },
  {
    id: 'itm-004',
    itemCode: 'DRG-0004',
    drugName: 'Noradrenaline',
    genericName: 'Norepinephrine',
    strength: '4mg',
    dosageForm: 'Injection',
    route: 'IV',
    category: 'Critical Care',
    scheduleClass: 'Rx',
    defaultUnit: 'ampoule',
    reorderLevel: 15,
    unitCost: 310,
    preferredVendor: 'MedAxis',
    status: 'Active',
    createdAt: atOffset(760),
    updatedAt: atOffset(9),
  },
  {
    id: 'itm-005',
    itemCode: 'DRG-0005',
    drugName: 'Amlodipine',
    genericName: 'Amlodipine',
    strength: '5mg',
    dosageForm: 'Tablet',
    route: 'Oral',
    category: 'General Medicine',
    scheduleClass: 'Rx',
    defaultUnit: 'tablet',
    reorderLevel: 200,
    unitCost: 4,
    preferredVendor: 'Universal Drugs',
    status: 'Active',
    createdAt: atOffset(700),
    updatedAt: atOffset(6),
  },
  {
    id: 'itm-006',
    itemCode: 'DRG-0006',
    drugName: 'Piperacillin/Tazobactam',
    genericName: 'Piperacillin + Tazobactam',
    strength: '4.5g',
    dosageForm: 'Injection',
    route: 'IV',
    category: 'Antibiotic',
    scheduleClass: 'Rx',
    defaultUnit: 'vial',
    reorderLevel: 30,
    unitCost: 265,
    preferredVendor: 'Kare Labs',
    status: 'Active',
    createdAt: atOffset(680),
    updatedAt: atOffset(8),
  },
  {
    id: 'itm-007',
    itemCode: 'DRG-0007',
    drugName: 'Vancomycin',
    genericName: 'Vancomycin',
    strength: '500mg',
    dosageForm: 'Injection',
    route: 'IV',
    category: 'Antibiotic',
    scheduleClass: 'Rx',
    defaultUnit: 'vial',
    reorderLevel: 16,
    unitCost: 188,
    preferredVendor: 'Kare Labs',
    status: 'Active',
    createdAt: atOffset(640),
    updatedAt: atOffset(10),
  },
];

const DEFAULT_STOCK: InventoryStockRow[] = [
  {
    id: 'stk-001',
    itemId: 'itm-001',
    onHand: 312,
    reserved: 0,
    location: 'S-12/B',
    nextExpiry: '2026-12-15',
    updatedAt: atOffset(2),
  },
  {
    id: 'stk-002',
    itemId: 'itm-002',
    onHand: 190,
    reserved: 0,
    location: 'S-22/A',
    nextExpiry: '2027-01-30',
    updatedAt: atOffset(3),
  },
  {
    id: 'stk-003',
    itemId: 'itm-003',
    onHand: 6,
    reserved: 0,
    location: 'SAFE-1',
    nextExpiry: '2026-05-05',
    updatedAt: atOffset(2),
  },
  {
    id: 'stk-004',
    itemId: 'itm-004',
    onHand: 3,
    reserved: 0,
    location: 'ICU-4',
    nextExpiry: '2026-06-16',
    updatedAt: atOffset(5),
  },
  {
    id: 'stk-005',
    itemId: 'itm-005',
    onHand: 502,
    reserved: 0,
    location: 'S-03/C',
    nextExpiry: '2027-02-10',
    updatedAt: atOffset(1),
  },
  {
    id: 'stk-006',
    itemId: 'itm-006',
    onHand: 18,
    reserved: 0,
    location: 'ICU-COLD-2',
    nextExpiry: '2026-08-02',
    updatedAt: atOffset(4),
  },
  {
    id: 'stk-007',
    itemId: 'itm-007',
    onHand: 0,
    reserved: 0,
    location: 'A-12',
    nextExpiry: '2026-04-09',
    updatedAt: atOffset(10),
  },
];

const DEFAULT_PURCHASE_ORDERS: PurchaseOrderRecord[] = [
  {
    id: 'po-001',
    poNumber: 'PO-2026-001',
    vendor: 'Kare Labs',
    status: 'Sent to Vendor',
    expectedDeliveryDate: '2026-03-17',
    requestedBy: 'Inventory Desk',
    approvedBy: 'Inventory Supervisor',
    createdAt: atOffset(48),
    notes: 'Low stock and OOS replenishment for ICU + ward.',
    lines: [
      {
        id: 'po-001-l-1',
        itemId: 'itm-007',
        itemLabel: 'Vancomycin 500mg',
        quantityOrdered: 24,
        quantityReceived: 0,
        unitCost: 188,
      },
      {
        id: 'po-001-l-2',
        itemId: 'itm-006',
        itemLabel: 'Piperacillin/Tazobactam 4.5g',
        quantityOrdered: 30,
        quantityReceived: 0,
        unitCost: 265,
      },
    ],
    history: [
      {
        id: 'po-001-h-1',
        at: atOffset(48),
        actor: 'Inventory Desk',
        action: 'PO drafted',
      },
      {
        id: 'po-001-h-2',
        at: atOffset(44),
        actor: 'Inventory Supervisor',
        action: 'PO approved',
      },
      {
        id: 'po-001-h-3',
        at: atOffset(40),
        actor: 'Inventory Desk',
        action: 'Sent to vendor',
      },
    ],
  },
  {
    id: 'po-002',
    poNumber: 'PO-2026-002',
    vendor: 'LifeMed Exports',
    status: 'Draft',
    expectedDeliveryDate: '2026-03-20',
    requestedBy: 'Inventory Desk',
    createdAt: atOffset(10),
    notes: 'Controlled drug restock request.',
    lines: [
      {
        id: 'po-002-l-1',
        itemId: 'itm-003',
        itemLabel: 'Morphine 10mg/mL',
        quantityOrdered: 20,
        quantityReceived: 0,
        unitCost: 145,
      },
    ],
    history: [
      {
        id: 'po-002-h-1',
        at: atOffset(10),
        actor: 'Inventory Desk',
        action: 'PO drafted',
      },
    ],
  },
];

const DEFAULT_GRNS: GrnRecord[] = [
  {
    id: 'grn-001',
    grnNumber: 'GRN-2026-001',
    poId: 'po-legacy',
    poNumber: 'PO-2026-000',
    vendor: 'Healix Pharma',
    invoiceNo: 'INV-HX-7712',
    receivedBy: 'Store Receiver',
    receivedAt: atOffset(120),
    notes: 'Received against prior cycle PO.',
    lines: [
      {
        id: 'grn-001-l-1',
        itemId: 'itm-001',
        itemLabel: 'Clopidogrel 75mg',
        acceptedQty: 120,
        rejectedQty: 0,
        batchNo: 'CPG-26-01',
        expiryDate: '2026-12-15',
        location: 'S-12/B',
        unitCost: 18,
      },
    ],
  },
];

const DEFAULT_STATE: InventoryState = {
  version: 1,
  items: DEFAULT_ITEMS,
  stock: DEFAULT_STOCK,
  purchaseOrders: DEFAULT_PURCHASE_ORDERS,
  grns: DEFAULT_GRNS,
};

export function nowIso(): string {
  return new Date().toISOString();
}

export function buildInventoryId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100_000)}`;
}

export function getItemLabel(item: Pick<InventoryItem, 'drugName' | 'strength'>): string {
  return `${item.drugName} ${item.strength}`.trim();
}

export function getNextPoNumber(existing: PurchaseOrderRecord[]): string {
  const serial = existing.length + 1;
  return `PO-${new Date().getFullYear()}-${String(serial).padStart(3, '0')}`;
}

export function getNextGrnNumber(existing: GrnRecord[]): string {
  const serial = existing.length + 1;
  return `GRN-${new Date().getFullYear()}-${String(serial).padStart(3, '0')}`;
}

export function computePoStatusFromLines(
  currentStatus: PurchaseOrderStatus,
  lines: PurchaseOrderLine[]
): PurchaseOrderStatus {
  if (currentStatus === 'Cancelled') return 'Cancelled';
  const totalOrdered = lines.reduce((sum, line) => sum + line.quantityOrdered, 0);
  const totalReceived = lines.reduce((sum, line) => sum + line.quantityReceived, 0);

  if (totalOrdered === 0) return currentStatus;
  if (totalReceived <= 0) return currentStatus;
  if (totalReceived < totalOrdered) return 'Partially Received';
  return 'Closed';
}

export function readInventoryState(): InventoryState {
  if (typeof window === 'undefined') return DEFAULT_STATE;

  try {
    const raw = window.localStorage.getItem(INVENTORY_STATE_STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;

    const parsed = JSON.parse(raw) as Partial<InventoryState>;
    if (!parsed || typeof parsed !== 'object') return DEFAULT_STATE;

    return {
      version: 1,
      items: Array.isArray(parsed.items) ? parsed.items : DEFAULT_STATE.items,
      stock: Array.isArray(parsed.stock) ? parsed.stock : DEFAULT_STATE.stock,
      purchaseOrders: Array.isArray(parsed.purchaseOrders)
        ? parsed.purchaseOrders
        : DEFAULT_STATE.purchaseOrders,
      grns: Array.isArray(parsed.grns) ? parsed.grns : DEFAULT_STATE.grns,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function writeInventoryState(state: InventoryState): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(INVENTORY_STATE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // best effort persistence
  }
}
