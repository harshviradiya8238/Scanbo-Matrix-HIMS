"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  MenuItem,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import { Card, CommonTabs, StatTile } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon,
  Inventory2 as Inventory2Icon,
  LocalPharmacy as LocalPharmacyIcon,
  PriorityHigh as PriorityHighIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Science as ScienceIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
import { usePermission } from "@/src/core/auth/usePermission";
import {
  buildInventoryId,
  getItemLabel,
  INVENTORY_STATE_STORAGE_KEY,
  InventoryState,
  readInventoryState,
  writeInventoryState,
} from "@/src/core/inventory/inventoryStore";

type WillowTab = "queue" | "dispensed" | "inventory" | "activity";
type Priority = "STAT" | "Urgent" | "Routine";
type RxStatus = "Pending" | "In Review" | "On Hold" | "Dispensed";
type ActivitySeverity = "success" | "info" | "warning" | "error";

type QueueStatusFilter = "All" | RxStatus;
type PriorityFilter = "All" | Priority;

interface WillowMedication {
  id: string;
  name: string;
  dose: string;
  route: string;
  frequency: string;
  quantity: number;
  note: string;
  inventoryDrug: string;
}

interface WillowRx {
  id: string;
  rxNo: string;
  patientName: string;
  initials: string;
  patientId: string;
  mrn: string;
  ageGender: string;
  priority: Priority;
  status: RxStatus;
  department: string;
  prescriber: string;
  receivedAt: string;
  complaint: string;
  allergies: string[];
  medications: WillowMedication[];
  holdReason?: string;
}

interface DispensedRecord {
  id: string;
  rxId: string;
  rxNo: string;
  patientName: string;
  department: string;
  dispensedAt: string;
  dispensedBy: string;
  itemCount: number;
}

interface WillowInventoryRow {
  itemId: string;
  drug: string;
  stock: number;
  reorderLevel: number;
  location: string;
  nextExpiry: string;
  category: string;
  itemStatus: "Active" | "Inactive";
}

interface ActivityEvent {
  id: string;
  timestamp: string;
  type: "Status Update" | "Dispense" | "Clarification" | "Inventory";
  message: string;
  actor: string;
  severity: ActivitySeverity;
  rxNo?: string;
  patientName?: string;
}

interface WillowUiState {
  queue: WillowRx[];
  dispensed: DispensedRecord[];
  activity: ActivityEvent[];
}

interface ToastState {
  open: boolean;
  msg: string;
  severity: ActivitySeverity;
}

const TABS: Array<{ id: WillowTab; label: string }> = [
  { id: "queue", label: "Prescription Queue" },
  { id: "dispensed", label: "Dispensed Today" },
  { id: "inventory", label: "Inventory Health" },
  { id: "activity", label: "Activity Trail" },
];

const WILLOW_UI_STORAGE_KEY = "scanbo.hims.pharmacy.willow.ui.v2";

const PRIORITY_RANK: Record<Priority, number> = {
  STAT: 0,
  Urgent: 1,
  Routine: 2,
};

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("en-IN", {
  hour: "2-digit",
  minute: "2-digit",
});

function formatDateTime(value: string): string {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return "--";
  return dateTimeFormatter.format(parsed);
}

function formatTime(value: string): string {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return "--";
  return timeFormatter.format(parsed);
}

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeDrugLabel(value: string): string {
  return value.trim().toLowerCase();
}

function buildDefaultState(): WillowUiState {
  const now = Date.now();

  return {
    queue: [
      {
        id: "wl-rx-001",
        rxNo: "WL-2026-001",
        patientName: "Ramesh Gupta",
        initials: "RG",
        patientId: "ER-5101",
        mrn: "MRN-247811",
        ageGender: "58y / Male",
        priority: "STAT",
        status: "In Review",
        department: "Emergency",
        prescriber: "Dr. Neha Bhat",
        receivedAt: new Date(now - 22 * 60_000).toISOString(),
        complaint: "Acute chest pain with diaphoresis",
        allergies: ["Aspirin", "Penicillin"],
        medications: [
          {
            id: "wl-rx-001-m-1",
            name: "Clopidogrel",
            dose: "300 mg",
            route: "Oral",
            frequency: "STAT x1",
            quantity: 1,
            note: "Aspirin substituted due to allergy.",
            inventoryDrug: "Clopidogrel 75mg",
          },
          {
            id: "wl-rx-001-m-2",
            name: "Atorvastatin",
            dose: "80 mg",
            route: "Oral",
            frequency: "OD",
            quantity: 14,
            note: "Monitor LFT and CPK due to high-intensity therapy.",
            inventoryDrug: "Atorvastatin 80mg",
          },
          {
            id: "wl-rx-001-m-3",
            name: "Morphine",
            dose: "4 mg",
            route: "IV",
            frequency: "STAT x1",
            quantity: 1,
            note: "Controlled drug. Dual sign check required.",
            inventoryDrug: "Morphine 10mg/mL",
          },
        ],
      },
      {
        id: "wl-rx-002",
        rxNo: "WL-2026-002",
        patientName: "Asha Iyer",
        initials: "AI",
        patientId: "ER-5102",
        mrn: "MRN-247902",
        ageGender: "32y / Female",
        priority: "Urgent",
        status: "Pending",
        department: "Emergency",
        prescriber: "Dr. Neha Bhat",
        receivedAt: new Date(now - 34 * 60_000).toISOString(),
        complaint: "Road traffic injury with severe pain",
        allergies: ["No known allergy"],
        medications: [
          {
            id: "wl-rx-002-m-1",
            name: "Morphine",
            dose: "5 mg",
            route: "IV",
            frequency: "STAT x1",
            quantity: 1,
            note: "Controlled dispensing log required.",
            inventoryDrug: "Morphine 10mg/mL",
          },
          {
            id: "wl-rx-002-m-2",
            name: "Ketorolac",
            dose: "30 mg",
            route: "IV",
            frequency: "STAT x1",
            quantity: 1,
            note: "No major interaction identified.",
            inventoryDrug: "Ketorolac 30mg/mL",
          },
        ],
      },
      {
        id: "wl-rx-003",
        rxNo: "WL-2026-003",
        patientName: "Farhan Ali",
        initials: "FA",
        patientId: "IPD-1204",
        mrn: "MRN-241100",
        ageGender: "64y / Male",
        priority: "Routine",
        status: "Pending",
        department: "IPD Ward-2",
        prescriber: "Dr. P. Sharma",
        receivedAt: new Date(now - 56 * 60_000).toISOString(),
        complaint: "Hypertension follow-up",
        allergies: ["No known allergy"],
        medications: [
          {
            id: "wl-rx-003-m-1",
            name: "Amlodipine",
            dose: "5 mg",
            route: "Oral",
            frequency: "OD",
            quantity: 30,
            note: "Routine supply for discharge planning.",
            inventoryDrug: "Amlodipine 5mg",
          },
          {
            id: "wl-rx-003-m-2",
            name: "Telmisartan",
            dose: "40 mg",
            route: "Oral",
            frequency: "OD",
            quantity: 30,
            note: "Routine supply.",
            inventoryDrug: "Telmisartan 40mg",
          },
        ],
      },
      {
        id: "wl-rx-004",
        rxNo: "WL-2026-004",
        patientName: "Meera Singh",
        initials: "MS",
        patientId: "IPD-1410",
        mrn: "MRN-243200",
        ageGender: "44y / Female",
        priority: "Urgent",
        status: "On Hold",
        department: "ICU",
        prescriber: "Dr. Harish Rao",
        receivedAt: new Date(now - 70 * 60_000).toISOString(),
        complaint: "Sepsis protocol medication set",
        allergies: ["Vancomycin"],
        medications: [
          {
            id: "wl-rx-004-m-1",
            name: "Piperacillin/Tazobactam",
            dose: "4.5 g",
            route: "IV",
            frequency: "Q6H",
            quantity: 8,
            note: "Awaiting renal dose clarification.",
            inventoryDrug: "Piperacillin/Tazobactam 4.5g",
          },
          {
            id: "wl-rx-004-m-2",
            name: "Noradrenaline",
            dose: "4 mg",
            route: "IV",
            frequency: "As directed",
            quantity: 2,
            note: "Critical care support; verify titration protocol.",
            inventoryDrug: "Noradrenaline 4mg",
          },
        ],
        holdReason:
          "Need prescriber confirmation due to documented Vancomycin allergy.",
      },
    ],
    dispensed: [
      {
        id: "wl-d-001",
        rxId: "seed-rx-legacy",
        rxNo: "WL-2026-000",
        patientName: "Lata Patwardhan",
        department: "Maternity",
        dispensedAt: new Date(now - 96 * 60_000).toISOString(),
        dispensedBy: "Ph. Ananya",
        itemCount: 2,
      },
    ],
    activity: [
      {
        id: "wl-a-001",
        timestamp: new Date(now - 10 * 60_000).toISOString(),
        type: "Status Update",
        message: "WL-2026-001 moved to In Review.",
        actor: "Ph. Ananya",
        severity: "info",
        rxNo: "WL-2026-001",
        patientName: "Ramesh Gupta",
      },
      {
        id: "wl-a-002",
        timestamp: new Date(now - 15 * 60_000).toISOString(),
        type: "Inventory",
        message: "Low stock alert raised for Morphine 10mg/mL.",
        actor: "System",
        severity: "warning",
      },
      {
        id: "wl-a-003",
        timestamp: new Date(now - 23 * 60_000).toISOString(),
        type: "Dispense",
        message: "WL-2026-000 dispensed with 2 medication items.",
        actor: "Ph. Ananya",
        severity: "success",
        rxNo: "WL-2026-000",
        patientName: "Lata Patwardhan",
      },
    ],
  };
}

const DEFAULT_STATE = buildDefaultState();

function readUiState(): WillowUiState {
  if (typeof window === "undefined") return DEFAULT_STATE;

  try {
    const raw = window.localStorage.getItem(WILLOW_UI_STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<WillowUiState>;
    if (!parsed || typeof parsed !== "object") return DEFAULT_STATE;
    return {
      queue: Array.isArray(parsed.queue) ? parsed.queue : DEFAULT_STATE.queue,
      dispensed: Array.isArray(parsed.dispensed)
        ? parsed.dispensed
        : DEFAULT_STATE.dispensed,
      activity: Array.isArray(parsed.activity)
        ? parsed.activity
        : DEFAULT_STATE.activity,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeUiState(state: WillowUiState): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(WILLOW_UI_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // best effort persistence
  }
}

function buildEventId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100_000)}`;
}

function appendActivity(
  activity: ActivityEvent[],
  next: Omit<ActivityEvent, "id" | "timestamp">,
): ActivityEvent[] {
  const row: ActivityEvent = {
    ...next,
    id: buildEventId("wl-a"),
    timestamp: nowIso(),
  };
  return [row, ...activity].slice(0, 180);
}

function inventoryHealth(
  row: WillowInventoryRow,
): "Out of stock" | "Low stock" | "Normal" {
  if (row.stock <= 0) return "Out of stock";
  if (row.stock <= row.reorderLevel) return "Low stock";
  return "Normal";
}

function activityColor(
  severity: ActivitySeverity,
): "success" | "info" | "warning" | "error" {
  return severity;
}

export default function WillowPharmacyPage() {
  const theme = useTheme();
  const router = useRouter();
  const permissionGate = usePermission();
  const canWrite =
    permissionGate("pharmacy.willow.write") || permissionGate("pharmacy.*");

  const [activeTab, setActiveTab] = React.useState<WillowTab>("queue");
  const [uiState, setUiState] = React.useState<WillowUiState>(() =>
    readUiState(),
  );
  const [inventoryState, setInventoryState] = React.useState<InventoryState>(
    () => readInventoryState(),
  );
  const [selectedId, setSelectedId] = React.useState("");

  const [search, setSearch] = React.useState("");
  const [priorityFilter, setPriorityFilter] =
    React.useState<PriorityFilter>("All");
  const [statusFilter, setStatusFilter] =
    React.useState<QueueStatusFilter>("All");
  const [dispensedSearch, setDispensedSearch] = React.useState("");
  const [inventorySearch, setInventorySearch] = React.useState("");

  const [clarifyOpen, setClarifyOpen] = React.useState(false);
  const [clarifyMessage, setClarifyMessage] = React.useState("");

  const [holdOpen, setHoldOpen] = React.useState(false);
  const [holdReason, setHoldReason] = React.useState("");

  const [restockItemId, setRestockItemId] = React.useState("");
  const [restockQty, setRestockQty] = React.useState("");

  const [toast, setToast] = React.useState<ToastState>({
    open: false,
    msg: "",
    severity: "success",
  });

  React.useEffect(() => {
    writeUiState(uiState);
  }, [uiState]);

  React.useEffect(() => {
    writeInventoryState(inventoryState);
  }, [inventoryState]);

  React.useEffect(() => {
    const refreshInventory = () => {
      const latest = readInventoryState();
      setInventoryState((current) =>
        JSON.stringify(current) === JSON.stringify(latest) ? current : latest,
      );
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === INVENTORY_STATE_STORAGE_KEY) {
        refreshInventory();
      }
    };

    window.addEventListener("focus", refreshInventory);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("focus", refreshInventory);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const notify = React.useCallback(
    (msg: string, severity: ActivitySeverity = "success") => {
      setToast({ open: true, msg, severity });
    },
    [],
  );

  const inventoryRows = React.useMemo<WillowInventoryRow[]>(() => {
    return inventoryState.items
      .map((item) => {
        const stockRow = inventoryState.stock.find(
          (entry) => entry.itemId === item.id,
        );
        return {
          itemId: item.id,
          drug: getItemLabel(item),
          stock: stockRow?.onHand ?? 0,
          reorderLevel: item.reorderLevel,
          location: stockRow?.location ?? "UNASSIGNED",
          nextExpiry: stockRow?.nextExpiry ?? "--",
          category: item.category,
          itemStatus: item.status,
        };
      })
      .sort((a, b) => {
        const scoreA =
          inventoryHealth(a) === "Out of stock"
            ? 0
            : inventoryHealth(a) === "Low stock"
              ? 1
              : 2;
        const scoreB =
          inventoryHealth(b) === "Out of stock"
            ? 0
            : inventoryHealth(b) === "Low stock"
              ? 1
              : 2;

        if (scoreA !== scoreB) return scoreA - scoreB;
        return a.drug.localeCompare(b.drug);
      });
  }, [inventoryState.items, inventoryState.stock]);

  const filteredQueue = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...uiState.queue]
      .filter((row) => {
        if (priorityFilter !== "All" && row.priority !== priorityFilter)
          return false;
        if (statusFilter !== "All" && row.status !== statusFilter) return false;
        if (!query) return true;

        return (
          row.patientName.toLowerCase().includes(query) ||
          row.rxNo.toLowerCase().includes(query) ||
          row.mrn.toLowerCase().includes(query) ||
          row.patientId.toLowerCase().includes(query) ||
          row.department.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const rankDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        if (rankDiff !== 0) return rankDiff;
        return Date.parse(b.receivedAt) - Date.parse(a.receivedAt);
      });
  }, [priorityFilter, search, statusFilter, uiState.queue]);

  React.useEffect(() => {
    if (!filteredQueue.length) {
      setSelectedId("");
      return;
    }

    if (!filteredQueue.some((row) => row.id === selectedId)) {
      setSelectedId(filteredQueue[0].id);
    }
  }, [filteredQueue, selectedId]);

  const selectedRx = filteredQueue.find((row) => row.id === selectedId) ?? null;

  const pendingCount = uiState.queue.filter(
    (row) => row.status === "Pending",
  ).length;
  const reviewCount = uiState.queue.filter(
    (row) => row.status === "In Review",
  ).length;
  const holdCount = uiState.queue.filter(
    (row) => row.status === "On Hold",
  ).length;
  const statCount = uiState.queue.filter(
    (row) => row.priority === "STAT" && row.status !== "Dispensed",
  ).length;
  const lowStockCount = inventoryRows.filter(
    (row) => inventoryHealth(row) === "Low stock",
  ).length;
  const outOfStockCount = inventoryRows.filter(
    (row) => inventoryHealth(row) === "Out of stock",
  ).length;

  const inventoryByDrug = React.useMemo(() => {
    return new Map(
      inventoryRows.map((item) => [normalizeDrugLabel(item.drug), item]),
    );
  }, [inventoryRows]);

  const dispensedRows = React.useMemo(() => {
    const q = dispensedSearch.trim().toLowerCase();
    if (!q) return uiState.dispensed;

    return uiState.dispensed.filter((row) => {
      return (
        row.rxNo.toLowerCase().includes(q) ||
        row.patientName.toLowerCase().includes(q) ||
        row.department.toLowerCase().includes(q) ||
        row.dispensedBy.toLowerCase().includes(q)
      );
    });
  }, [dispensedSearch, uiState.dispensed]);

  const filteredInventoryRows = React.useMemo(() => {
    const q = inventorySearch.trim().toLowerCase();
    if (!q) return inventoryRows;

    return inventoryRows.filter((row) => {
      return (
        row.drug.toLowerCase().includes(q) ||
        row.location.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q) ||
        inventoryHealth(row).toLowerCase().includes(q)
      );
    });
  }, [inventoryRows, inventorySearch]);

  const updateSelectedStatus = React.useCallback(
    (nextStatus: RxStatus) => {
      if (!selectedRx) return;
      if (!canWrite) {
        notify("You are in read-only mode for Willow actions.", "warning");
        return;
      }

      const targetSnapshot = selectedRx;

      setUiState((prev) => {
        const target = prev.queue.find((item) => item.id === targetSnapshot.id);
        if (!target) return prev;

        const queue = prev.queue.map((row) =>
          row.id === target.id ? { ...row, status: nextStatus } : row,
        );

        let dispensed = prev.dispensed;
        let activity = prev.activity;

        if (nextStatus === "Dispensed" && target.status !== "Dispensed") {
          const dispensedRow: DispensedRecord = {
            id: buildEventId("wl-d"),
            rxId: target.id,
            rxNo: target.rxNo,
            patientName: target.patientName,
            department: target.department,
            dispensedAt: nowIso(),
            dispensedBy: "Shift Pharmacist",
            itemCount: target.medications.length,
          };

          const existingIndex = prev.dispensed.findIndex(
            (row) => row.rxId === target.id,
          );
          if (existingIndex >= 0) {
            dispensed = prev.dispensed.map((row, idx) =>
              idx === existingIndex ? dispensedRow : row,
            );
          } else {
            dispensed = [dispensedRow, ...prev.dispensed];
          }

          activity = appendActivity(activity, {
            type: "Dispense",
            message: `${target.rxNo} dispensed with ${target.medications.length} items.`,
            actor: "Shift Pharmacist",
            severity: "success",
            rxNo: target.rxNo,
            patientName: target.patientName,
          });
        } else {
          activity = appendActivity(activity, {
            type: "Status Update",
            message: `${target.rxNo} moved to ${nextStatus}.`,
            actor: "Shift Pharmacist",
            severity: nextStatus === "On Hold" ? "warning" : "info",
            rxNo: target.rxNo,
            patientName: target.patientName,
          });
        }

        return {
          ...prev,
          queue,
          dispensed,
          activity,
        };
      });

      if (nextStatus === "Dispensed" && selectedRx.status !== "Dispensed") {
        setInventoryState((prev) => {
          const itemByLabel = new Map(
            prev.items.map((item) => [
              normalizeDrugLabel(getItemLabel(item)),
              item,
            ]),
          );
          const stock = [...prev.stock];

          targetSnapshot.medications.forEach((med) => {
            const item = itemByLabel.get(normalizeDrugLabel(med.inventoryDrug));
            if (!item) return;

            const idx = stock.findIndex((row) => row.itemId === item.id);
            if (idx >= 0) {
              const current = stock[idx];
              stock[idx] = {
                ...current,
                onHand: Math.max(0, current.onHand - med.quantity),
                updatedAt: nowIso(),
              };
            } else {
              stock.push({
                id: buildInventoryId("stk"),
                itemId: item.id,
                onHand: 0,
                reserved: 0,
                location: "UNASSIGNED",
                nextExpiry: "",
                updatedAt: nowIso(),
              });
            }
          });

          return {
            ...prev,
            stock,
          };
        });
      }

      notify(
        `Prescription marked as ${nextStatus}.`,
        nextStatus === "Dispensed" ? "success" : "info",
      );
    },
    [canWrite, notify, selectedRx],
  );

  const submitClarification = () => {
    if (!selectedRx) return;
    if (!canWrite) {
      notify("You are in read-only mode for Willow actions.", "warning");
      return;
    }
    if (!clarifyMessage.trim()) {
      notify("Clarification note cannot be empty.", "warning");
      return;
    }

    setUiState((prev) => ({
      ...prev,
      activity: appendActivity(prev.activity, {
        type: "Clarification",
        message: `Clarification sent for ${selectedRx.rxNo}: ${clarifyMessage.trim()}`,
        actor: "Shift Pharmacist",
        severity: "info",
        rxNo: selectedRx.rxNo,
        patientName: selectedRx.patientName,
      }),
    }));

    setClarifyMessage("");
    setClarifyOpen(false);
    notify("Clarification note sent to prescriber.", "success");
  };

  const submitHold = () => {
    if (!selectedRx) return;
    if (!canWrite) {
      notify("You are in read-only mode for Willow actions.", "warning");
      return;
    }
    if (!holdReason.trim()) {
      notify("Hold reason is required.", "warning");
      return;
    }

    setUiState((prev) => {
      const queue = prev.queue.map((row) =>
        row.id === selectedRx.id
          ? {
              ...row,
              status: "On Hold" as RxStatus,
              holdReason: holdReason.trim(),
            }
          : row,
      );

      return {
        ...prev,
        queue,
        activity: appendActivity(prev.activity, {
          type: "Status Update",
          message: `${selectedRx.rxNo} placed on hold: ${holdReason.trim()}`,
          actor: "Shift Pharmacist",
          severity: "warning",
          rxNo: selectedRx.rxNo,
          patientName: selectedRx.patientName,
        }),
      };
    });

    setHoldReason("");
    setHoldOpen(false);
    notify("Prescription moved to hold queue.", "warning");
  };

  const openRestock = (itemId: string) => {
    setRestockItemId(itemId);
    setRestockQty("");
  };

  const submitRestock = () => {
    if (!restockItemId) return;
    if (!canWrite) {
      notify("You are in read-only mode for inventory actions.", "warning");
      return;
    }

    const qty = Number(restockQty);
    if (!Number.isFinite(qty) || qty <= 0) {
      notify("Restock quantity must be greater than zero.", "warning");
      return;
    }

    const targetRow = inventoryRows.find((row) => row.itemId === restockItemId);
    const drugLabel = targetRow?.drug || "Inventory item";

    setInventoryState((prev) => {
      const stock = [...prev.stock];
      const idx = stock.findIndex((row) => row.itemId === restockItemId);

      if (idx >= 0) {
        stock[idx] = {
          ...stock[idx],
          onHand: stock[idx].onHand + qty,
          updatedAt: nowIso(),
        };
      } else {
        stock.push({
          id: buildInventoryId("stk"),
          itemId: restockItemId,
          onHand: qty,
          reserved: 0,
          location: "MAIN-STORE",
          nextExpiry: "",
          updatedAt: nowIso(),
        });
      }

      return {
        ...prev,
        stock,
      };
    });

    setUiState((prev) => ({
      ...prev,
      activity: appendActivity(prev.activity, {
        type: "Inventory",
        message: `${drugLabel} restocked by ${qty} units from Willow desk.`,
        actor: "Inventory Desk",
        severity: "success",
      }),
    }));

    setRestockItemId("");
    setRestockQty("");
    notify("Inventory updated successfully.", "success");
  };

  const restockItem =
    inventoryRows.find((row) => row.itemId === restockItemId) ?? null;

  const metricTiles = [
    {
      label: "Pending",
      value: pendingCount,
      subtitle: "Awaiting pharmacist review",
      icon: <ScienceIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "In Review",
      value: reviewCount,
      subtitle: "Under validation",
      icon: <LocalPharmacyIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "On Hold",
      value: holdCount,
      subtitle: "Needs clarification",
      icon: <WarningAmberIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "STAT Open",
      value: statCount,
      subtitle: "Priority dispensing",
      icon: <PriorityHighIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "Low / OOS",
      value: `${lowStockCount} / ${outOfStockCount}`,
      subtitle: "Inventory alerts",
      icon: <Inventory2Icon sx={{ fontSize: 18 }} />,
    },
  ];

  const panelBorderColor = alpha(theme.palette.primary.main, 0.14);
  const sectionBorderColor = alpha(theme.palette.primary.main, 0.12);
  const listDividerColor = alpha(theme.palette.text.primary, 0.08);
  const scrollbarThumbColor = alpha(theme.palette.primary.main, 0.22);

  const shellCardSx = {
    borderRadius: 2.2,
    border: "1px solid",
    borderColor: panelBorderColor,
    bgcolor: alpha(theme.palette.background.paper, 0.98),
    boxShadow: `0 4px 14px ${alpha(theme.palette.common.black, 0.03)}`,
  };

  return (
    <PageTemplate
      title="Willow Pharmacy"
      subtitle="Pharmacist workspace with live inventory sync from Item Master / PO / GRN chain."
      currentPageTitle="Willow"
      fullHeight
    >
      <Stack spacing={1.25} sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        {!canWrite ? (
          <Alert severity="info">
            You are currently in read-only mode for Willow actions.
          </Alert>
        ) : null}

        <Card elevation={0} sx={{ ...shellCardSx, p: 1.2 }}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ lg: "center" }}
            sx={{ mb: 1 }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              Workflow Standard: Verify / Dispense / Track Inventory / Audit
            </Typography>
            <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
              <Button
                size="small"
                variant="outlined"
                onClick={() => router.push("/inventory/items")}
              >
                Item Master
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => router.push("/inventory/purchase-orders")}
              >
                Purchase Orders
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => router.push("/inventory/grn")}
              >
                Receive (GRN)
              </Button>
            </Stack>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
                xl: "repeat(5, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {metricTiles.map((tile) => (
              <StatTile
                key={tile.label}
                label={tile.label}
                value={tile.value}
                subtitle={tile.subtitle}
                icon={tile.icon}
                variant="soft"
              />
            ))}
          </Box>
        </Card>

        <Card
          elevation={0}
          sx={{
            ...shellCardSx,
            borderColor: sectionBorderColor,
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: 1,
              py: 0.6,
              borderBottom: "1px solid",
              borderColor: sectionBorderColor,
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              flexShrink: 0,
            }}
          >
            <CommonTabs
              tabs={TABS.map((tab) => ({ id: tab.id, label: tab.label }))}
              value={activeTab}
              onChange={setActiveTab}
              tabSx={{
                minHeight: 34,
                px: 1.2,
                borderRadius: 1.2,
                fontSize: 12.5,
              }}
            />
          </Box>

          {activeTab === "queue" ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "340px minmax(0, 1fr)" },
                flex: 1,
                minHeight: 0,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                  borderRight: { lg: "none" },
                  borderBottom: { xs: "none", lg: "none" },
                  bgcolor: "background.paper",
                }}
              >
                <Box
                  sx={{
                    p: 1.2,
                    borderBottom: "1px solid",
                    borderColor: sectionBorderColor,
                    flexShrink: 0,
                  }}
                >
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Search by patient / MRN / Rx"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />

                  <Stack
                    direction={{ xs: "column", sm: "row", lg: "column" }}
                    spacing={0.8}
                    sx={{ mt: 1 }}
                  >
                    <TextField
                      select
                      label="Priority"
                      size="small"
                      value={priorityFilter}
                      onChange={(event) =>
                        setPriorityFilter(event.target.value as PriorityFilter)
                      }
                    >
                      {(["All", "STAT", "Urgent", "Routine"] as const).map(
                        (value) => (
                          <MenuItem key={value} value={value}>
                            {value}
                          </MenuItem>
                        ),
                      )}
                    </TextField>
                    <TextField
                      select
                      label="Status"
                      size="small"
                      value={statusFilter}
                      onChange={(event) =>
                        setStatusFilter(event.target.value as QueueStatusFilter)
                      }
                    >
                      {(
                        [
                          "All",
                          "Pending",
                          "In Review",
                          "On Hold",
                          "Dispensed",
                        ] as const
                      ).map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    "&::-webkit-scrollbar": { width: 5 },
                    "&::-webkit-scrollbar-thumb": {
                      bgcolor: scrollbarThumbColor,
                      borderRadius: 99,
                    },
                  }}
                >
                  {filteredQueue.length === 0 ? (
                    <Box sx={{ p: 1.25 }}>
                      <Alert severity="info">
                        No prescriptions match current filters.
                      </Alert>
                    </Box>
                  ) : (
                    filteredQueue.map((row) => {
                      const isSelected = selectedRx?.id === row.id;
                      const accent =
                        row.priority === "STAT"
                          ? theme.palette.error.main
                          : row.priority === "Urgent"
                            ? theme.palette.warning.main
                            : theme.palette.primary.main;

                      return (
                        <Box
                          key={row.id}
                          onClick={() => setSelectedId(row.id)}
                          sx={{
                            px: 1.2,
                            py: 1.05,
                            borderBottom: "1px solid",
                            borderColor: listDividerColor,
                            borderLeft: "3px solid",
                            borderLeftColor: isSelected
                              ? accent
                              : "transparent",
                            bgcolor: isSelected
                              ? alpha(theme.palette.primary.main, 0.06)
                              : "background.paper",
                            cursor: "pointer",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="flex-start"
                          >
                            <Avatar
                              sx={{
                                width: 30,
                                height: 30,
                                fontSize: 11,
                                fontWeight: 800,
                                bgcolor: accent,
                              }}
                            >
                              {row.initials}
                            </Avatar>

                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                spacing={0.5}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 800 }}
                                >
                                  {row.patientName}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={row.priority}
                                  color={
                                    row.priority === "STAT"
                                      ? "error"
                                      : row.priority === "Urgent"
                                        ? "warning"
                                        : "default"
                                  }
                                  variant={
                                    row.priority === "Routine"
                                      ? "outlined"
                                      : "filled"
                                  }
                                  sx={{ fontSize: 10, height: 20 }}
                                />
                              </Stack>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  fontFamily: '"JetBrains Mono", monospace',
                                }}
                              >
                                {row.rxNo} - {row.patientId} - {row.mrn}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block" }}
                              >
                                {row.department} - {formatTime(row.receivedAt)}
                              </Typography>

                              <Chip
                                size="small"
                                label={row.status}
                                color={
                                  row.status === "Dispensed"
                                    ? "success"
                                    : row.status === "In Review"
                                      ? "info"
                                      : row.status === "On Hold"
                                        ? "warning"
                                        : "default"
                                }
                                sx={{ mt: 0.45, fontWeight: 700, height: 20 }}
                              />
                            </Box>
                          </Stack>
                        </Box>
                      );
                    })
                  )}
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                }}
              >
                {!selectedRx ? (
                  <Box sx={{ p: 1.2 }}>
                    <Alert severity="info">
                      Select a prescription from queue.
                    </Alert>
                  </Box>
                ) : (
                  <>
                    <Box
                      sx={{
                        p: 1.2,
                        borderBottom: "1px solid",
                        borderColor: sectionBorderColor,
                        bgcolor: "background.paper",
                        flexShrink: 0,
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        justifyContent="space-between"
                        spacing={1}
                      >
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 800 }}
                          >
                            {selectedRx.patientName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {selectedRx.rxNo} - {selectedRx.patientId} -{" "}
                            {selectedRx.mrn} - {selectedRx.ageGender}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.45 }}
                          >
                            {selectedRx.complaint}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mt: 0.35 }}
                          >
                            Prescriber: {selectedRx.prescriber}
                          </Typography>
                        </Box>

                        <Stack
                          direction="row"
                          spacing={0.6}
                          flexWrap="wrap"
                          useFlexGap
                          alignItems="flex-start"
                        >
                          <Chip
                            size="small"
                            label={selectedRx.priority}
                            color={
                              selectedRx.priority === "STAT"
                                ? "error"
                                : selectedRx.priority === "Urgent"
                                  ? "warning"
                                  : "default"
                            }
                          />
                          <Chip
                            size="small"
                            label={selectedRx.status}
                            color={
                              selectedRx.status === "Dispensed"
                                ? "success"
                                : selectedRx.status === "In Review"
                                  ? "info"
                                  : selectedRx.status === "On Hold"
                                    ? "warning"
                                    : "default"
                            }
                          />
                        </Stack>
                      </Stack>
                    </Box>

                    <Box
                      sx={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: "auto",
                        p: 1.2,
                        "&::-webkit-scrollbar": { width: 5 },
                        "&::-webkit-scrollbar-thumb": {
                          bgcolor: scrollbarThumbColor,
                          borderRadius: 99,
                        },
                      }}
                    >
                      {selectedRx.allergies[0] !== "No known allergy" ? (
                        <Alert severity="warning" sx={{ mb: 1 }}>
                          Allergy warning: {selectedRx.allergies.join(", ")}
                        </Alert>
                      ) : (
                        <Alert severity="success" sx={{ mb: 1 }}>
                          No known drug allergy documented.
                        </Alert>
                      )}

                      {selectedRx.holdReason ? (
                        <Alert severity="info" sx={{ mb: 1 }}>
                          Hold reason: {selectedRx.holdReason}
                        </Alert>
                      ) : null}

                      <Card
                        elevation={0}
                        sx={{
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: sectionBorderColor,
                        }}
                      >
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Medication</TableCell>
                                <TableCell>Dose / Route</TableCell>
                                <TableCell>Frequency</TableCell>
                                <TableCell>Qty</TableCell>
                                <TableCell>Stock</TableCell>
                                <TableCell>Safety Note</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedRx.medications.map((med) => {
                                const inventory = inventoryByDrug.get(
                                  normalizeDrugLabel(med.inventoryDrug),
                                );
                                const stock = inventory?.stock ?? 0;
                                const health = inventory
                                  ? inventoryHealth(inventory)
                                  : "Out of stock";

                                return (
                                  <TableRow key={med.id}>
                                    <TableCell sx={{ fontWeight: 700 }}>
                                      {med.name}
                                    </TableCell>
                                    <TableCell>{`${med.dose} / ${med.route}`}</TableCell>
                                    <TableCell>{med.frequency}</TableCell>
                                    <TableCell>{med.quantity}</TableCell>
                                    <TableCell>
                                      <Chip
                                        size="small"
                                        label={`${stock} (${health})`}
                                        color={
                                          health === "Out of stock"
                                            ? "error"
                                            : health === "Low stock"
                                              ? "warning"
                                              : "success"
                                        }
                                      />
                                    </TableCell>
                                    <TableCell>{med.note}</TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Card>
                    </Box>

                    <Box
                      sx={{
                        px: 1.2,
                        py: 0.9,
                        borderTop: "1px solid",
                        borderColor: sectionBorderColor,
                        bgcolor: "background.paper",
                        flexShrink: 0,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={0.8}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <Button
                          size="small"
                          variant="contained"
                          color="info"
                          disabled={!canWrite}
                          onClick={() => updateSelectedStatus("In Review")}
                        >
                          Mark In Review
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          disabled={!canWrite}
                          onClick={() => setHoldOpen(true)}
                        >
                          Put On Hold
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          disabled={!canWrite}
                          onClick={() => updateSelectedStatus("Dispensed")}
                          startIcon={<CheckCircleIcon fontSize="small" />}
                        >
                          Mark Dispensed
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<QuestionAnswerIcon fontSize="small" />}
                          onClick={() => setClarifyOpen(true)}
                        >
                          Clarify with Doctor
                        </Button>
                      </Stack>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          ) : null}

          {activeTab === "dispensed" ? (
            <Box sx={{ p: 1.2, flex: 1, minHeight: 0, overflow: "hidden" }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: sectionBorderColor,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  minHeight: 0,
                }}
              >
                <Box
                  sx={{
                    px: 1.2,
                    py: 0.9,
                    borderBottom: "1px solid",
                    borderColor: sectionBorderColor,
                    bgcolor: alpha(theme.palette.success.main, 0.04),
                  }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={1}
                    alignItems={{ md: "center" }}
                  >
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <CheckCircleIcon
                        sx={{ fontSize: 18, color: "success.main" }}
                      />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Dispensed Transactions
                      </Typography>
                    </Stack>
                    <Box sx={{ flex: 1 }} />
                    <TextField
                      size="small"
                      placeholder="Search by Rx / patient"
                      value={dispensedSearch}
                      onChange={(event) =>
                        setDispensedSearch(event.target.value)
                      }
                      sx={{ width: { xs: "100%", md: 280 } }}
                    />
                  </Stack>
                </Box>

                <TableContainer
                  sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Rx No.</TableCell>
                        <TableCell>Patient</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Items</TableCell>
                        <TableCell>Dispensed At</TableCell>
                        <TableCell>Dispensed By</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dispensedRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <Alert severity="info">
                              No dispensed records for the current search.
                            </Alert>
                          </TableCell>
                        </TableRow>
                      ) : (
                        dispensedRows.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell sx={{ fontWeight: 700 }}>
                              {row.rxNo}
                            </TableCell>
                            <TableCell>{row.patientName}</TableCell>
                            <TableCell>{row.department}</TableCell>
                            <TableCell>{row.itemCount}</TableCell>
                            <TableCell>
                              {formatDateTime(row.dispensedAt)}
                            </TableCell>
                            <TableCell>{row.dispensedBy}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Box>
          ) : null}

          {activeTab === "inventory" ? (
            <Box sx={{ p: 1.2, flex: 1, minHeight: 0, overflow: "hidden" }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: sectionBorderColor,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  minHeight: 0,
                }}
              >
                <Box
                  sx={{
                    px: 1.2,
                    py: 0.9,
                    borderBottom: "1px solid",
                    borderColor: sectionBorderColor,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={1}
                    alignItems={{ md: "center" }}
                  >
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <Inventory2Icon
                        sx={{ fontSize: 18, color: "primary.main" }}
                      />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Live Inventory Health (Unified)
                      </Typography>
                    </Stack>
                    <Box sx={{ flex: 1 }} />
                    <TextField
                      size="small"
                      placeholder="Search drug / location"
                      value={inventorySearch}
                      onChange={(event) =>
                        setInventorySearch(event.target.value)
                      }
                      sx={{ width: { xs: "100%", md: 280 } }}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => router.push("/pharmacy/stock")}
                    >
                      Open Stock Management
                    </Button>
                  </Stack>
                </Box>

                <TableContainer
                  sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Drug</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>On Hand</TableCell>
                        <TableCell>Reorder Level</TableCell>
                        <TableCell>Coverage</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Next Expiry</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredInventoryRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9}>
                            <Alert severity="info">
                              No inventory rows for the current search.
                            </Alert>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredInventoryRows.map((row) => {
                          const health = inventoryHealth(row);
                          const coverage =
                            row.reorderLevel > 0
                              ? Math.min(
                                  100,
                                  Math.round(
                                    (row.stock / row.reorderLevel) * 100,
                                  ),
                                )
                              : 0;

                          return (
                            <TableRow key={row.itemId}>
                              <TableCell sx={{ fontWeight: 700 }}>
                                {row.drug}
                              </TableCell>
                              <TableCell>{row.category}</TableCell>
                              <TableCell>{row.stock}</TableCell>
                              <TableCell>{row.reorderLevel}</TableCell>
                              <TableCell sx={{ minWidth: 170 }}>
                                <Box sx={{ minWidth: 160 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={Math.max(0, coverage)}
                                    color={
                                      health === "Out of stock"
                                        ? "error"
                                        : health === "Low stock"
                                          ? "warning"
                                          : "success"
                                    }
                                    sx={{ height: 7, borderRadius: 999 }}
                                  />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ mt: 0.25 }}
                                  >
                                    {coverage}% of reorder threshold
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={health}
                                  color={
                                    health === "Out of stock"
                                      ? "error"
                                      : health === "Low stock"
                                        ? "warning"
                                        : "success"
                                  }
                                  icon={
                                    health === "Normal" ? (
                                      <LocalPharmacyIcon fontSize="small" />
                                    ) : (
                                      <WarningAmberIcon fontSize="small" />
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell>{row.location}</TableCell>
                              <TableCell>{row.nextExpiry}</TableCell>
                              <TableCell>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  disabled={
                                    !canWrite || row.itemStatus !== "Active"
                                  }
                                  onClick={() => openRestock(row.itemId)}
                                >
                                  Restock
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Box>
          ) : null}

          {activeTab === "activity" ? (
            <Box sx={{ p: 1.2, flex: 1, minHeight: 0, overflow: "hidden" }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: sectionBorderColor,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  minHeight: 0,
                }}
              >
                <Box
                  sx={{
                    px: 1.2,
                    py: 0.9,
                    borderBottom: "1px solid",
                    borderColor: sectionBorderColor,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  }}
                >
                  <Stack direction="row" spacing={0.8} alignItems="center">
                    <HistoryIcon sx={{ fontSize: 18, color: "primary.main" }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      Operational Activity Trail
                    </Typography>
                  </Stack>
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    p: 1.1,
                    "&::-webkit-scrollbar": { width: 5 },
                    "&::-webkit-scrollbar-thumb": {
                      bgcolor: scrollbarThumbColor,
                      borderRadius: 99,
                    },
                  }}
                >
                  {uiState.activity.length === 0 ? (
                    <Alert severity="info">No activity recorded yet.</Alert>
                  ) : (
                    <Stack spacing={0.85}>
                      {uiState.activity.map((event) => (
                        <Card
                          key={event.id}
                          elevation={0}
                          sx={{
                            borderRadius: 1.6,
                            border: "1px solid",
                            borderColor: alpha(
                              theme.palette.primary.main,
                              0.14,
                            ),
                            px: 1,
                            py: 0.85,
                          }}
                        >
                          <Stack
                            direction={{ xs: "column", md: "row" }}
                            spacing={0.7}
                          >
                            <Stack
                              direction="row"
                              spacing={0.6}
                              alignItems="center"
                              sx={{ minWidth: 0 }}
                            >
                              <Chip
                                size="small"
                                label={event.type}
                                color={activityColor(event.severity)}
                                sx={{ fontWeight: 700 }}
                              />
                              {event.rxNo ? (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontWeight: 700 }}
                                >
                                  {event.rxNo}
                                </Typography>
                              ) : null}
                            </Stack>

                            <Typography variant="body2" sx={{ flex: 1 }}>
                              {event.message}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {event.actor} - {formatDateTime(event.timestamp)}
                            </Typography>
                          </Stack>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Card>
            </Box>
          ) : null}
        </Card>
      </Stack>

      <Dialog
        open={clarifyOpen}
        onClose={() => setClarifyOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Send Clarification to Prescriber</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            multiline
            minRows={3}
            value={clarifyMessage}
            onChange={(event) => setClarifyMessage(event.target.value)}
            placeholder="Write a concise clarification note for the prescriber..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClarifyOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitClarification}>
            Send Note
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={holdOpen}
        onClose={() => setHoldOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Place Prescription On Hold</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            multiline
            minRows={3}
            value={holdReason}
            onChange={(event) => setHoldReason(event.target.value)}
            placeholder="Enter reason for hold (allergy conflict, dose clarification, stock issue, etc.)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHoldOpen(false)}>Cancel</Button>
          <Button color="warning" variant="contained" onClick={submitHold}>
            Confirm Hold
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(restockItem)}
        onClose={() => setRestockItemId("")}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Restock Inventory</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {restockItem
              ? `Drug: ${restockItem.drug}`
              : "Select inventory item"}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            label="Quantity"
            type="number"
            value={restockQty}
            onChange={(event) => setRestockQty(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestockItemId("")}>Cancel</Button>
          <Button variant="contained" onClick={submitRestock}>
            Update Stock
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={2600}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </PageTemplate>
  );
}
