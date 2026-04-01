"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Stack,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Divider,
  Avatar,
  Grid,
  Paper,
  TextField,
  // MenuItem,
  // Select,
  InputAdornment,
  Badge,
  MenuItem,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Print as PrintIcon,
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  Medication as RxIcon,
  LocalPharmacyOutlined as PharmacyIcon,
  Schedule as ScheduleIcon,
  DateRange as DateIcon,
  ViewModule as GridIcon,
  ViewList as ListIcon,
  KeyboardArrowDown as ArrowDownIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Assignment as TotalIcon,
  Delete as DeleteIcon,
  Add as AddIconSmall,
  Remove as RemoveIconSmall,
  ReceiptLong as BillIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CompleteIcon,
} from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import { StatTile } from "@/src/ui/components/molecules";
import { Select } from "@/src/ui/components";

// ── TYPES ──────────────────────────────────────────────────────────
type Medication = {
  id: string;
  name: string;
  category: string;
  dosage: string;
  frequency: string;
  duration: string;
  stock: number;
  price: number;
  qty: number;
};

type Prescription = {
  id: string;
  patientName: string;
  mrn: string;
  doctorName: string;
  department: string;
  date: string;
  totalDrugs: number;
  items: Medication[];
  status: "Pending" | "Accepted" | "Rejected";
};

// ── MOCK DATA ───────────────────────────────────────────────────────
const mockPrescriptions: Prescription[] = [
  {
    id: "RX-002",
    patientName: "Priya Sharma",
    mrn: "MRN-23456",
    doctorName: "Dr. Mehta",
    department: "Neurology",
    date: "2023-10-25 11:00 AM",
    totalDrugs: 2,
    items: [
      {
        id: "M001",
        name: "Levetiracetam",
        category: "Anticonvulsant",
        dosage: "500mg",
        frequency: "BD",
        duration: "3 months",
        stock: 120,
        price: 45.0,
        qty: 15,
      },
      {
        id: "M002",
        name: "Clonazepam",
        category: "Benzodiazepine",
        dosage: "0.5mg",
        frequency: "HS",
        duration: "1 month",
        stock: 85,
        price: 12.5,
        qty: 10,
      },
    ],
    status: "Pending",
  },
  {
    id: "RX-001",
    patientName: "John Doe",
    mrn: "MRN-12345",
    doctorName: "Dr. Rao",
    department: "Cardiology",
    date: "2023-10-25 10:30 AM",
    totalDrugs: 2,
    items: [
      {
        id: "M003",
        name: "Aspirin",
        category: "Antiplatelet",
        dosage: "75mg",
        frequency: "OD",
        duration: "1 month",
        stock: 500,
        price: 2.5,
        qty: 30,
      },
      {
        id: "M004",
        name: "Atorvastatin",
        category: "Statin",
        dosage: "40mg",
        frequency: "HS",
        duration: "1 month",
        stock: 240,
        price: 18.0,
        qty: 30,
      },
    ],
    status: "Pending",
  },
  {
    id: "RX-003",
    patientName: "Rahul Verma",
    mrn: "MRN-34567",
    doctorName: "Dr. Singh",
    department: "Orthopedics",
    date: "2023-10-24 03:15 PM",
    totalDrugs: 6,
    items: [
      {
        id: "M005",
        name: "Metoprolol",
        category: "Beta Blocker",
        dosage: "50mg",
        frequency: "BD",
        duration: "1 month",
        stock: 150,
        price: 8.5,
        qty: 60,
      },
      {
        id: "M006",
        name: "Ramipril",
        category: "ACE Inhibitor",
        dosage: "10mg",
        frequency: "OD",
        duration: "1 month",
        stock: 90,
        price: 14.0,
        qty: 30,
      },
      {
        id: "M007",
        name: "Furosemide",
        category: "Diuretic",
        dosage: "40mg",
        frequency: "OD",
        duration: "2 weeks",
        stock: 40,
        price: 5.5,
        qty: 14,
      },
      {
        id: "M008",
        name: "Spironolactone",
        category: "Diuretic",
        dosage: "25mg",
        frequency: "OD",
        duration: "1 month",
        stock: 65,
        price: 11.0,
        qty: 30,
      },
      {
        id: "M009",
        name: "Diclofenac",
        category: "NSAID",
        dosage: "50mg",
        frequency: "BD",
        duration: "5 days",
        stock: 300,
        price: 4.5,
        qty: 10,
      },
      {
        id: "M010",
        name: "Pantoprazole",
        category: "PPI",
        dosage: "40mg",
        frequency: "OD",
        duration: "5 days",
        stock: 450,
        price: 12.0,
        qty: 5,
      },
    ],
    status: "Accepted",
  },
  {
    id: "RX-004",
    patientName: "Anita Patel",
    mrn: "MRN-45678",
    doctorName: "Dr. Joshi",
    department: "General Medicine",
    date: "2023-10-24 09:00 AM",
    totalDrugs: 1,
    items: [
      {
        id: "M011",
        name: "Amoxicillin",
        category: "Antibiotic",
        dosage: "500mg",
        frequency: "TID",
        duration: "7 days",
        stock: 15,
        price: 25.0,
        qty: 21,
      },
    ],
    status: "Rejected",
  },
];

// ── DESIGN TOKENS ───────────────────────────────────────────────────
const COLORS = {
  bg: "#F0F4F8",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",
  accent: "#1172BA",
  accentDark: "#0284C7",
  accentMuted: "#E0F2FE",
  pending: { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
  accepted: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  rejected: { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  rxOrange: "#F97316",
  rxOrangeMuted: "#FFF7ED",
};

const FREQ_COLORS: Record<string, { bg: string; text: string }> = {
  OD: { bg: "#EFF6FF", text: "#1D4ED8" },
  BD: { bg: "#F0FDF4", text: "#15803D" },
  TID: { bg: "#FEF9C3", text: "#854D0E" },
  HS: { bg: "#FAF5FF", text: "#7E22CE" },
};

// ── HELPERS ─────────────────────────────────────────────────────────
function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statusMeta(status: string) {
  if (status === "Pending") return COLORS.pending;
  if (status === "Accepted") return COLORS.accepted;
  return COLORS.rejected;
}

function freqMeta(freq: string) {
  return FREQ_COLORS[freq] ?? { bg: "#F1F5F9", text: "#475569" };
}

// ── SECTION LABEL ───────────────────────────────────────────────────
// ── STOCK INDICATOR ───────────────────────────────────────────────
function StockIndicator({ stock }: { stock: number }) {
  const isLow = stock < 50;
  const isMedium = stock >= 50 && stock < 200;
  const color = isLow ? "#EF4444" : isMedium ? "#F59E0B" : "#10B981";
  const label = isLow ? "Low" : isMedium ? "Medium" : "Adequate";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          bgcolor: color,
          boxShadow: `0 0 4px ${alpha(color, 0.4)}`,
          flexShrink: 0,
        }}
      />
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{ fontSize: "0.65rem", lineHeight: 1 }}
        >
          {stock.toLocaleString()} units
        </Typography>
        <Typography
          variant="caption"
          sx={{ color, fontWeight: 700, fontSize: "0.6rem" }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

// ── QTY CONTROL ───────────────────────────────────────────────────
function QtyControl({
  qty,
  onIncrease,
  onDecrease,
}: {
  qty: number;
  onIncrease: () => void;
  onDecrease: () => void;
}) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        border: "1.2px solid",
        borderColor: COLORS.border,
        borderRadius: 2,
        overflow: "hidden",
        height: 28,
        bgcolor: "#FAFBFC",
      }}
    >
      <IconButton
        size="small"
        onClick={onDecrease}
        sx={{
          borderRadius: 0,
          px: 0.5,
          height: "100%",
          "&:hover": { bgcolor: alpha("#EF4444", 0.08) },
        }}
      >
        <RemoveIconSmall sx={{ fontSize: 13 }} />
      </IconButton>
      <Typography
        fontWeight={800}
        sx={{ px: 1, minWidth: 24, textAlign: "center", fontSize: 13 }}
      >
        {qty}
      </Typography>
      <IconButton
        size="small"
        onClick={onIncrease}
        sx={{
          borderRadius: 0,
          px: 0.5,
          height: "100%",
          "&:hover": { bgcolor: alpha(COLORS.accent, 0.08) },
        }}
      >
        <AddIconSmall sx={{ fontSize: 13 }} />
      </IconButton>
    </Box>
  );
}

// ── CATEGORY CHIP ─────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  Antibiotic: "#10B981",
  Analgesic: "#F97316",
  Anticonvulsant: "#6366F1",
  Benzodiazepine: "#EC4899",
  default: "#64748B",
};

function CategoryChip({ label }: { label: string }) {
  const color = CATEGORY_COLORS[label] || CATEGORY_COLORS.default;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: 0.75,
        py: 0.15,
        borderRadius: 1,
        bgcolor: alpha(color, 0.08),
        border: `1px solid ${alpha(color, 0.2)}`,
      }}
    >
      <Typography sx={{ fontSize: "0.58rem", fontWeight: 800, color }}>
        {label.toUpperCase()}
      </Typography>
    </Box>
  );
}

// ── MED CARD ────────────────────────────────────────────────────────
function MedCard({
  med,
  mode,
  onUpdateQty,
  onRemove,
}: {
  med: Medication;
  mode: "grid" | "list";
  onUpdateQty?: (delta: number) => void;
  onRemove?: () => void;
}) {
  const fq = freqMeta(med.frequency);

  const cardStyle = {
    p: 2,
    borderRadius: 3,
    border: `1.2px solid ${COLORS.border}`,
    bgcolor: COLORS.surface,
    transition: "all 0.15s",
    "&:hover": {
      borderColor: COLORS.accent,
      boxShadow: `0 4px 12px ${alpha(COLORS.accent, 0.06)}`,
    },
  };

  if (mode === "list") {
    return (
      <Paper
        elevation={0}
        sx={{ ...cardStyle, display: "flex", alignItems: "center", gap: 2 }}
      >
        {/* Info */}
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1.5 }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: alpha(COLORS.accent, 0.06),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <RxIcon sx={{ fontSize: 18, color: COLORS.accent }} />
          </Box>
          <Box>
            <Typography
              sx={{ fontWeight: 800, color: COLORS.textPrimary, fontSize: 14 }}
            >
              {med.name}
            </Typography>
            <Box
              sx={{ display: "flex", gap: 0.5, mt: 0.3, alignItems: "center" }}
            >
              <CategoryChip label={med.category} />
              <Typography sx={{ color: COLORS.textSecondary, fontSize: 11 }}>
                {med.dosage}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Prescription Details */}
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={0.75}>
            <Chip
              label={med.frequency}
              size="small"
              sx={{
                height: 20,
                fontSize: 10,
                fontWeight: 700,
                bgcolor: fq.bg,
                color: fq.text,
              }}
            />
            <Chip
              label={med.duration}
              size="small"
              sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
            />
          </Stack>
        </Box>

        {/* Stock */}
        <Box sx={{ flex: 0.8 }}>
          <StockIndicator stock={med.stock} />
        </Box>

        {/* Qty */}
        <Box sx={{ flex: 0.8 }}>
          {onUpdateQty && (
            <QtyControl
              qty={med.qty}
              onIncrease={() => onUpdateQty(1)}
              onDecrease={() => onUpdateQty(-1)}
            />
          )}
        </Box>

        {/* Amount */}
        <Box sx={{ flex: 0.8, textAlign: "right" }}>
          <Typography
            sx={{ fontWeight: 800, color: COLORS.textPrimary, fontSize: 14 }}
          >
            ₹{(med.price * med.qty).toFixed(2)}
          </Typography>
          <Typography sx={{ color: COLORS.textMuted, fontSize: 10 }}>
            @₹{med.price}
          </Typography>
        </Box>

        {/* Actions */}
        <Box>
          {onRemove && (
            <IconButton
              size="small"
              color="error"
              onClick={onRemove}
              sx={{
                border: "1px solid",
                borderColor: alpha("#EF4444", 0.2),
                "&:hover": { bgcolor: alpha("#EF4444", 0.06) },
              }}
            >
              <DeleteIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={cardStyle}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
        <Box sx={{ display: "flex", gap: 1.25 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: alpha(COLORS.accent, 0.06),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RxIcon sx={{ fontSize: 18, color: COLORS.accent }} />
          </Box>
          <Box>
            <Typography
              sx={{ fontWeight: 800, color: COLORS.textPrimary, fontSize: 14 }}
            >
              {med.name}
            </Typography>
            <CategoryChip label={med.category} />
          </Box>
        </Box>
        {onRemove && (
          <IconButton
            size="small"
            color="error"
            onClick={onRemove}
            sx={{
              width: 28,
              height: 28,
              border: "1px solid",
              borderColor: alpha("#EF4444", 0.2),
              "&:hover": { bgcolor: alpha("#EF4444", 0.06) },
            }}
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>

      <Stack spacing={1.5}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography sx={{ color: COLORS.textSecondary, fontSize: 12 }}>
            {med.dosage} · {med.frequency} · {med.duration}
          </Typography>
          <StockIndicator stock={med.stock} />
        </Box>

        <Divider sx={{ borderStyle: "dashed" }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {onUpdateQty && (
            <QtyControl
              qty={med.qty}
              onIncrease={() => onUpdateQty(1)}
              onDecrease={() => onUpdateQty(-1)}
            />
          )}
          <Box sx={{ textAlign: "right" }}>
            <Typography
              sx={{ fontWeight: 800, color: COLORS.textPrimary, fontSize: 15 }}
            >
              ₹{(med.price * med.qty).toFixed(2)}
            </Typography>
            <Typography sx={{ color: COLORS.textMuted, fontSize: 10 }}>
              @₹{med.price}/unit
            </Typography>
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
}

// ── SECTION LABEL ───────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: 11,
        fontWeight: 800,
        color: COLORS.textMuted,
        letterSpacing: 1,
        textTransform: "uppercase",
        mb: 1,
      }}
    >
      {children}
    </Typography>
  );
}

// ── SUMMARY ROW ───────────────────────────────────────────────────
function SummaryRow({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography
        variant={bold ? "body1" : "body2"}
        fontWeight={bold ? 800 : 500}
        color={bold ? "textPrimary" : "textSecondary"}
        sx={{ fontSize: bold ? 15 : 13 }}
      >
        {label}
      </Typography>
      <Typography
        variant={bold ? "h6" : "body2"}
        fontWeight={bold ? 800 : 600}
        color={accent ? "primary.main" : "textPrimary"}
        sx={{ fontSize: bold ? 18 : 13 }}
      >
        {value}
      </Typography>
    </Box>
  );
}

// ── RX LIST ITEM ────────────────────────────────────────────────────
function RxListItem({
  rx,
  isSelected,
  onClick,
}: {
  rx: Prescription;
  isSelected: boolean;
  onClick: () => void;
}) {
  const sm = statusMeta(rx.status);
  return (
    <Box
      onClick={onClick}
      sx={{
        p: 1.5,
        borderRadius: 2,
        cursor: "pointer",
        border: `1.5px solid ${isSelected ? COLORS.accent : COLORS.border}`,
        bgcolor: isSelected ? alpha(COLORS.accent, 0.03) : COLORS.surface,
        transition: "all 0.15s",
        "&:hover": {
          borderColor: COLORS.accent,
          bgcolor: alpha(COLORS.accent, 0.02),
        },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{ mb: 1 }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar
            sx={{
              width: 36,
              height: 36,
              fontSize: 13,
              fontWeight: 800,
              bgcolor: isSelected ? COLORS.accent : "#E2E8F0",
              color: isSelected ? "#fff" : COLORS.textSecondary,
              letterSpacing: 0.5,
            }}
          >
            {initials(rx.patientName)}
          </Avatar>
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 14.5,
                color: COLORS.textPrimary,
                lineHeight: 1.2,
              }}
            >
              {rx.patientName}
            </Typography>
            <Typography
              sx={{
                fontSize: 11,
                color: COLORS.textSecondary,
                fontWeight: 600,
                fontFamily: "monospace",
                lineHeight: 1.4,
              }}
            >
              {rx.mrn}
            </Typography>
          </Box>
        </Stack>
        <Box
          sx={{
            px: 1,
            py: 0.4,
            borderRadius: 1,
            bgcolor: sm.bg,
            border: `1px solid ${sm.border}`,
          }}
        >
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 800,
              color: sm.text,
              letterSpacing: 0.8,
            }}
          >
            {rx.status.toUpperCase()}
          </Typography>
        </Box>
      </Stack>
      <Stack spacing={0.5} sx={{ pl: "48px" }}>
        <Typography
          sx={{
            fontSize: 12,
            color: COLORS.textSecondary,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <PharmacyIcon sx={{ fontSize: 14, color: COLORS.textMuted }} />{" "}
          <Box
            component="span"
            sx={{ fontWeight: 700, color: COLORS.textPrimary }}
          >
            {rx.doctorName}
          </Box>{" "}
          · {rx.date}
        </Typography>
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ mt: 0.5, flexWrap: "wrap", gap: 0.5 }}
        >
          {rx.items.slice(0, 2).map((item, i) => (
            <Box
              key={i}
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 0.75,
                bgcolor: "#F8FAFC",
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <Typography
                sx={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: COLORS.textSecondary,
                }}
              >
                {item.name}
              </Typography>
            </Box>
          ))}
          {rx.items.length > 2 && (
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: COLORS.textMuted,
                alignSelf: "center",
                ml: 0.5,
              }}
            >
              +{rx.items.length - 2}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

// ── MAIN PAGE ───────────────────────────────────────────────────────
export default function PharmacyPrescriptionQueuePage() {
  const [prescriptions, setPrescriptions] =
    React.useState<Prescription[]>(mockPrescriptions);
  const [selectedRx, setSelectedRx] = React.useState<Prescription | null>(
    mockPrescriptions[0],
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [medViewMode, setMedViewMode] = React.useState<"grid" | "list">("grid");
  const [snackbar, setSnackbar] = React.useState<{
    message: string;
    severity: "success" | "error" | "info";
  } | null>(null);

  const stats = {
    total: prescriptions.length,
    pending: prescriptions.filter((p) => p.status === "Pending").length,
    accepted: prescriptions.filter((p) => p.status === "Accepted").length,
    rejected: prescriptions.filter((p) => p.status === "Rejected").length,
  };

  const filteredPrescriptions = prescriptions.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.patientName.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAction = (id: string, action: "Accepted" | "Rejected") => {
    const updated = prescriptions.map((rx) =>
      rx.id === id ? { ...rx, status: action } : rx,
    );
    setPrescriptions(updated);
    const updatedRx = updated.find((rx) => rx.id === id) ?? null;
    setSelectedRx(updatedRx);
    setSnackbar(
      action === "Accepted"
        ? {
            message: "Prescription accepted — stock deducted.",
            severity: "success",
          }
        : { message: "Prescription rejected.", severity: "info" },
    );
  };

  const updateMedQty = (medId: string, delta: number) => {
    if (!selectedRx) return;
    const updatedItems = selectedRx.items.map((m) =>
      m.id === medId
        ? { ...m, qty: Math.max(1, Math.min(m.stock, m.qty + delta)) }
        : m,
    );
    const updatedRx = {
      ...selectedRx,
      items: updatedItems,
      totalDrugs: updatedItems.length,
    };
    setSelectedRx(updatedRx);
    setPrescriptions((prev) =>
      prev.map((p) => (p.id === updatedRx.id ? updatedRx : p)),
    );
  };

  const removeMed = (medId: string) => {
    if (!selectedRx) return;
    const updatedItems = selectedRx.items.filter((m) => m.id !== medId);
    const updatedRx = {
      ...selectedRx,
      items: updatedItems,
      totalDrugs: updatedItems.length,
    };
    setSelectedRx(updatedRx);
    setPrescriptions((prev) =>
      prev.map((p) => (p.id === updatedRx.id ? updatedRx : p)),
    );
  };

  const sm = selectedRx ? statusMeta(selectedRx.status) : null;

  const subtotal =
    selectedRx?.items.reduce((sum, m) => sum + m.price * m.qty, 0) || 0;
  const gst = subtotal * 0.12;
  const total = subtotal + gst;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          //   bgcolor: COLORS.bg,
          overflow: "hidden",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* ══ SIDEBAR ══════════════════════════════════════════════ */}
        <Box
          sx={{
            width: 340,
            borderRight: `1px solid ${COLORS.border}`,
            display: "flex",
            flexDirection: "column",
            bgcolor: COLORS.surface,
            flexShrink: 0,
          }}
        >
          {/* Sidebar header */}
          <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{ mb: 2.5 }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  bgcolor: COLORS.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PharmacyIcon sx={{ color: "#fff", fontSize: 17 }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 800,
                    fontSize: 16,
                    color: COLORS.textPrimary,
                    lineHeight: 1,
                  }}
                >
                  Prescription Queue
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: COLORS.textSecondary,
                    fontWeight: 500,
                    mt: 0.5,
                  }}
                >
                  Pharmacy Desk
                </Typography>
              </Box>
              <Box sx={{ ml: "auto" }}>
                <Badge badgeContent={stats.pending} color="warning" max={99}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1.5,
                      border: `1px solid ${COLORS.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FilterIcon
                      sx={{ fontSize: 14, color: COLORS.textSecondary }}
                    />
                  </Box>
                </Badge>
              </Box>
            </Stack>

            {/* Search */}
            <TextField
              fullWidth
              placeholder="Search patient or MRN…"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{ fontSize: 16, color: COLORS.textMuted }}
                    />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2.5,
                  bgcolor: "#F8FAFC",
                  fontSize: 13,
                  "& fieldset": { borderColor: COLORS.border },
                  "&:hover fieldset": { borderColor: COLORS.borderStrong },
                },
              }}
            />

            {/* Status filter pills */}
            <Stack
              direction="row"
              spacing={0.75}
              sx={{ mb: 2 }}
              flexWrap="wrap"
            >
              {(["All", "Pending", "Accepted", "Rejected"] as const).map(
                (s) => {
                  const active = statusFilter === s;
                  const meta = s !== "All" ? statusMeta(s) : null;
                  return (
                    <Box
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      sx={{
                        px: 1.5,
                        py: 0.4,
                        borderRadius: 2,
                        cursor: "pointer",
                        border: `1.5px solid ${active ? (meta?.border ?? COLORS.accent) : COLORS.border}`,
                        bgcolor: active
                          ? (meta?.bg ?? alpha(COLORS.accent, 0.06))
                          : "transparent",
                        transition: "all 0.12s",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: active
                            ? (meta?.text ?? COLORS.accent)
                            : COLORS.textSecondary,
                        }}
                      >
                        {s}
                      </Typography>
                    </Box>
                  );
                },
              )}
            </Stack>

            {/* Dept filter */}
            <SectionLabel>Filter by Department and Date</SectionLabel>
            <Select
              fullWidth
              size="small"
              value="All"
              IconComponent={ArrowDownIcon}
              sx={{
                borderRadius: 2.5,
                fontSize: 13,
                mb: 1.5,
                "& fieldset": { borderColor: COLORS.border },
                "& .MuiSelect-select": { py: 1 },
              }}
            >
              <MenuItem value="All">All Departments</MenuItem>
              <MenuItem value="Neurology">Neurology</MenuItem>
              <MenuItem value="Cardiology">Cardiology</MenuItem>
              <MenuItem value="Orthopedics">Orthopedics</MenuItem>
              <MenuItem value="General Medicine">General Medicine</MenuItem>
            </Select>

            {/* <SectionLabel>Date Range</SectionLabel> */}
            <Select
              fullWidth
              size="small"
              value="All"
              IconComponent={ArrowDownIcon}
              sx={{
                borderRadius: 2.5,
                fontSize: 13,
                "& fieldset": { borderColor: COLORS.border },
                "& .MuiSelect-select": { py: 1 },
              }}
            >
              <MenuItem value="All">All Time</MenuItem>
              <MenuItem value="Today">Today</MenuItem>
              <MenuItem value="Yesterday">Yesterday</MenuItem>
              <MenuItem value="Week">This Week</MenuItem>
            </Select>
          </Box>

          <Divider sx={{ borderColor: COLORS.border }} />

          {/* List header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ px: 2.5, py: 1.25 }}
          >
            <Typography
              sx={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600 }}
            >
              {filteredPrescriptions.length} results
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.25}
              sx={{ cursor: "pointer" }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  color: COLORS.textSecondary,
                  fontWeight: 600,
                }}
              >
                Newest
              </Typography>
              <ArrowDownIcon
                sx={{ fontSize: 14, color: COLORS.textSecondary }}
              />
            </Stack>
          </Stack>

          {/* Rx list */}
          <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2, pb: 2 }}>
            <Stack spacing={1.25}>
              {filteredPrescriptions.map((rx) => (
                <RxListItem
                  key={rx.id}
                  rx={rx}
                  isSelected={selectedRx?.id === rx.id}
                  onClick={() => setSelectedRx(rx)}
                />
              ))}
              {filteredPrescriptions.length === 0 && (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <Typography sx={{ color: COLORS.textMuted, fontSize: 13 }}>
                    No prescriptions found
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Box>

        {/* ══ MAIN CONTENT ═════════════════════════════════════════ */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Stat row */}
          <Grid container spacing={2} sx={{ p: 3, pb: 0 }}>
            {[
              {
                label: "Total",
                value: stats.total,
                tone: "primary" as const,
                icon: <TotalIcon sx={{ fontSize: 24 }} />,
              },
              {
                label: "Pending",
                value: stats.pending,
                tone: "warning" as const,
                icon: <ScheduleIcon sx={{ fontSize: 24 }} />,
              },
              {
                label: "Accepted",
                value: stats.accepted,
                tone: "success" as const,
                icon: <AcceptIcon sx={{ fontSize: 24 }} />,
              },
              {
                label: "Rejected",
                value: stats.rejected,
                tone: "error" as const,
                icon: <RejectIcon sx={{ fontSize: 24 }} />,
              },
            ].map((s) => (
              <Grid item xs={3} key={s.label}>
                <StatTile
                  label={s.label}
                  value={s.value}
                  tone={s.tone}
                  icon={s.icon}
                  variant="soft"
                />
              </Grid>
            ))}
          </Grid>

          {/* Detail panel */}
          <Box sx={{ p: 3, flexGrow: 1 }}>
            {selectedRx ? (
              <Grid container spacing={3}>
                <Grid item xs={12} lg={8.2}>
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 4,
                      border: `1px solid ${COLORS.border}`,
                      bgcolor: COLORS.surface,
                      overflow: "hidden",
                    }}
                  >
                    {/* ── Patient header ─────────────────────── */}
                    <Box
                      sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        borderBottom: `1px solid ${COLORS.border}`,
                        background: `linear-gradient(135deg, ${alpha(COLORS.accent, 0.04)} 0%, ${COLORS.surface} 60%)`,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 44,
                          height: 44,
                          bgcolor: COLORS.accent,
                          fontSize: 15,
                          fontWeight: 800,
                          fontFamily: "'Sora', sans-serif",
                          boxShadow: `0 0 0 3px ${alpha(COLORS.accent, 0.15)}`,
                        }}
                      >
                        {initials(selectedRx.patientName)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography
                          sx={{
                            fontFamily: "'Sora', sans-serif",
                            fontWeight: 800,
                            fontSize: 18,
                            color: COLORS.textPrimary,
                            lineHeight: 1.2,
                          }}
                        >
                          {selectedRx.patientName}
                        </Typography>
                        <Stack direction="row" spacing={1.5} sx={{ mt: 0.5 }}>
                          <Typography
                            sx={{
                              fontSize: 12.5,
                              color: COLORS.textSecondary,
                              fontWeight: 600,
                              fontFamily: "monospace",
                            }}
                          >
                            {selectedRx.mrn}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 12.5,
                              color: COLORS.textSecondary,
                              fontWeight: 500,
                            }}
                          >
                            · {selectedRx.totalDrugs} medications
                          </Typography>
                        </Stack>
                      </Box>
                      {/* Status badge */}
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          bgcolor: sm?.bg,
                          border: `1.5px solid ${sm?.border}`,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: sm?.text,
                            letterSpacing: 1,
                          }}
                        >
                          {selectedRx.status.toUpperCase()}
                        </Typography>
                      </Box>
                      {/* Rx ID badge */}
                      <Box
                        sx={{
                          px: 1.25,
                          py: 0.35,
                          borderRadius: 1.25,
                          bgcolor: "#F1F5F9",
                          border: `1px solid ${COLORS.border}`,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: COLORS.textSecondary,
                            fontFamily: "monospace",
                          }}
                        >
                          {selectedRx.id}
                        </Typography>
                      </Box>
                    </Box>

                    {/* ── Info row ───────────────────────────── */}
                    <Grid
                      container
                      sx={{ borderBottom: `1px solid ${COLORS.border}` }}
                    >
                      {/* Prescription info */}
                      <Grid
                        item
                        xs={6}
                        sx={{ p: 2, borderRight: `1px solid ${COLORS.border}` }}
                      >
                        <SectionLabel>Prescription Info</SectionLabel>
                        <Stack spacing={1} sx={{ mt: 1 }}>
                          {[
                            {
                              icon: <RxIcon sx={{ fontSize: 13 }} />,
                              label: "Rx ID",
                              val: selectedRx.id,
                            },
                            {
                              icon: <TimeIcon sx={{ fontSize: 13 }} />,
                              label: "Received",
                              val: selectedRx.date,
                            },
                            {
                              icon: <RxIcon sx={{ fontSize: 13 }} />,
                              label: "Total Drugs",
                              val: `${selectedRx.totalDrugs} medications`,
                            },
                          ].map((row) => (
                            <Stack
                              key={row.label}
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Stack
                                direction="row"
                                spacing={0.75}
                                alignItems="center"
                              >
                                <Box sx={{ color: COLORS.textMuted }}>
                                  {row.icon}
                                </Box>
                                <Typography
                                  sx={{
                                    fontSize: 12.5,
                                    color: COLORS.textSecondary,
                                    fontWeight: 500,
                                  }}
                                >
                                  {row.label}
                                </Typography>
                              </Stack>
                              <Typography
                                sx={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: COLORS.textPrimary,
                                  fontFamily:
                                    row.label === "Rx ID"
                                      ? "monospace"
                                      : "inherit",
                                }}
                              >
                                {row.val}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Grid>

                      {/* Doctor info */}
                      <Grid item xs={6} sx={{ p: 2 }}>
                        <SectionLabel>Doctor & Department</SectionLabel>
                        <Stack spacing={1} sx={{ mt: 1 }}>
                          {[
                            {
                              icon: <PersonIcon sx={{ fontSize: 13 }} />,
                              label: "Doctor",
                              val: selectedRx.doctorName,
                            },
                            {
                              icon: <HospitalIcon sx={{ fontSize: 13 }} />,
                              label: "Department",
                              val: selectedRx.department,
                            },
                          ].map((row) => (
                            <Stack
                              key={row.label}
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Stack
                                direction="row"
                                spacing={0.75}
                                alignItems="center"
                              >
                                <Box sx={{ color: COLORS.textMuted }}>
                                  {row.icon}
                                </Box>
                                <Typography
                                  sx={{
                                    fontSize: 12.5,
                                    color: COLORS.textSecondary,
                                    fontWeight: 500,
                                  }}
                                >
                                  {row.label}
                                </Typography>
                              </Stack>
                              <Typography
                                sx={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: COLORS.textPrimary,
                                }}
                              >
                                {row.val}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Grid>
                    </Grid>

                    {/* ── Medications ────────────────────────── */}
                    <Box sx={{ p: 3 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 2 }}
                      >
                        <SectionLabel>Prescribed Medications</SectionLabel>
                        {/* View toggle */}
                        <Stack direction="row" spacing={0.5}>
                          {(["grid", "list"] as const).map((mode) => (
                            <IconButton
                              key={mode}
                              size="small"
                              onClick={() => setMedViewMode(mode)}
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: 1.5,
                                bgcolor:
                                  medViewMode === mode
                                    ? COLORS.accent
                                    : "transparent",
                                border: `1px solid ${medViewMode === mode ? COLORS.accent : COLORS.border}`,
                                color:
                                  medViewMode === mode
                                    ? "#fff"
                                    : COLORS.textSecondary,
                                "&:hover": {
                                  bgcolor:
                                    medViewMode === mode
                                      ? COLORS.accentDark
                                      : "#F1F5F9",
                                },
                              }}
                            >
                              {mode === "grid" ? (
                                <GridIcon sx={{ fontSize: 15 }} />
                              ) : (
                                <ListIcon sx={{ fontSize: 15 }} />
                              )}
                            </IconButton>
                          ))}
                        </Stack>
                      </Stack>

                      {/* Frequency filter row */}
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mb: 2.5 }}
                        alignItems="center"
                      >
                        <TextField
                          size="small"
                          placeholder="Search drug…"
                          sx={{ flex: 1 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon
                                  sx={{ fontSize: 14, color: COLORS.textMuted }}
                                />
                              </InputAdornment>
                            ),
                            sx: {
                              borderRadius: 2.5,
                              fontSize: 12,
                              bgcolor: "#F8FAFC",
                              "& fieldset": { borderColor: COLORS.border },
                            },
                          }}
                        />
                        <Stack direction="row" spacing={0.75}>
                          {["All", "OD", "BD", "TID", "HS"].map((f) => {
                            const fq = f !== "All" ? freqMeta(f) : null;
                            return (
                              <Box
                                key={f}
                                sx={{
                                  px: 1.25,
                                  py: 0.35,
                                  borderRadius: 1.5,
                                  cursor: "pointer",
                                  bgcolor: fq ? fq.bg : "#F1F5F9",
                                  border: `1px solid ${COLORS.border}`,
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: fq ? fq.text : COLORS.textSecondary,
                                  }}
                                >
                                  {f}
                                </Typography>
                              </Box>
                            );
                          })}
                          <Box
                            sx={{
                              px: 1.5,
                              py: 0.35,
                              borderRadius: 1.5,
                              bgcolor: COLORS.accentMuted,
                              border: `1px solid ${alpha(COLORS.accent, 0.2)}`,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: COLORS.accent,
                              }}
                            >
                              {selectedRx.totalDrugs} drugs
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>

                      <Box
                        sx={{
                          maxHeight: 400,
                          overflowY: "auto",
                          pr: 1,
                          overflowX: "hidden",
                        }}
                      >
                        <Grid container spacing={1.5}>
                          {selectedRx.items.map((med, i) => (
                            <Grid
                              item
                              xs={medViewMode === "grid" ? 6 : 12}
                              key={med.id}
                            >
                              <MedCard
                                med={med}
                                mode={medViewMode}
                                onUpdateQty={(delta) =>
                                  updateMedQty(med.id, delta)
                                }
                                onRemove={() => removeMed(med.id)}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    </Box>

                    {/* ── Actions ────────────────────────────── */}
                    <Box
                      sx={{
                        p: 2.5,
                        display: "flex",
                        gap: 1.5,
                        justifyContent: "flex-end",
                        borderTop: `1px solid ${COLORS.border}`,
                        bgcolor: "#FAFBFC",
                      }}
                    >
                      <Button
                        variant="outlined"
                        startIcon={<PrintIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          borderRadius: 2.5,
                          px: 2.5,
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: 13,
                          color: COLORS.textSecondary,
                          borderColor: COLORS.borderStrong,
                          "&:hover": {
                            borderColor: COLORS.textSecondary,
                            bgcolor: "#F1F5F9",
                          },
                        }}
                      >
                        Print
                      </Button>

                      {selectedRx.status === "Pending" ? (
                        <>
                          <Button
                            variant="outlined"
                            startIcon={<RejectIcon sx={{ fontSize: 16 }} />}
                            onClick={() =>
                              handleAction(selectedRx.id, "Rejected")
                            }
                            sx={{
                              borderRadius: 2.5,
                              px: 2.5,
                              textTransform: "none",
                              fontWeight: 700,
                              fontSize: 13,
                              color: "white",
                              borderColor: "#f27180ff",
                              bgcolor: "#f27180ff",
                              "&:hover": {
                                bgcolor: "#f27180ff",
                                borderColor: "#f27180ff",
                              },
                            }}
                          >
                            Reject
                          </Button>
                          <Button
                            // fullWidth
                            variant="contained"
                            startIcon={<AcceptIcon sx={{ fontSize: 16 }} />}
                            onClick={() =>
                              handleAction(selectedRx.id, "Accepted")
                            }
                            sx={{
                              borderRadius: 2.5,
                              textTransform: "none",
                              fontWeight: 700,
                              fontSize: 13,
                              bgcolor: "#10B981",
                              boxShadow: "none",
                              "&:hover": {
                                bgcolor: "#059669",
                                boxShadow: "none",
                              },
                            }}
                          >
                            Accept & Deduct Stock
                          </Button>
                        </>
                      ) : (
                        <Box
                          sx={{
                            flexGrow: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 2.5,
                            border: `1.5px solid ${sm?.border}`,
                            bgcolor: sm?.bg,
                            py: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: sm?.text,
                              letterSpacing: 1,
                            }}
                          >
                            PRESCRIPTION {selectedRx.status.toUpperCase()}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Grid>

                {/* ─── DISPENSE SUMMARY ────────────────────────── */}
                <Grid item xs={12} lg={3.8}>
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 4,
                      border: `1px solid ${COLORS.border}`,
                      overflow: "hidden",
                      // bgcolor: alpha(COLORS.accent, 0.01),
                      position: "sticky",
                      top: 24,
                    }}
                  >
                    <Box
                      sx={{
                        p: 2.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        borderBottom: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <BillIcon sx={{ fontSize: 20, color: COLORS.accent }} />
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: 16,
                          color: COLORS.textPrimary,
                        }}
                      >
                        Dispense Summary
                      </Typography>
                    </Box>

                    <Box sx={{ p: 2.5 }}>
                      <Stack spacing={2.5}>
                        {/* Bill Breakdown */}
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            // bgcolor: COLORS.surface,
                            border: "1.5px dashed",
                            borderColor: alpha(COLORS.accent, 0.25),
                          }}
                        >
                          <Stack spacing={1.5}>
                            {selectedRx.items.map((m) => (
                              <Box
                                key={m.id}
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                  sx={{
                                    maxWidth: "65%",
                                    lineHeight: 1.4,
                                    fontSize: 12,
                                  }}
                                >
                                  {m.name} × {m.qty}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  fontWeight={700}
                                  sx={{ fontSize: 12 }}
                                >
                                  ₹{(m.price * m.qty).toFixed(2)}
                                </Typography>
                              </Box>
                            ))}

                            <Divider sx={{ borderStyle: "dashed", my: 0.5 }} />

                            <SummaryRow
                              label="Subtotal"
                              value={`₹${subtotal.toFixed(2)}`}
                            />
                            <SummaryRow
                              label="GST (12%)"
                              value={`₹${gst.toFixed(2)}`}
                            />

                            <Divider sx={{ borderStyle: "dashed", my: 0.5 }} />

                            <SummaryRow
                              label="Total Payable"
                              value={`₹${total.toFixed(2)}`}
                              bold
                              accent
                            />
                          </Stack>
                        </Box>

                        {/* Payment Status */}
                        <Box>
                          <Typography
                            variant="caption"
                            fontWeight={800}
                            color="textSecondary"
                            display="block"
                            gutterBottom
                            sx={{
                              textTransform: "uppercase",
                              letterSpacing: 0.8,
                              fontSize: "0.65rem",
                            }}
                          >
                            Payment Status
                          </Typography>
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2.5,
                              bgcolor: alpha("#F59E0B", 0.08),
                              border: "1px solid",
                              borderColor: alpha("#F59E0B", 0.2),
                              display: "flex",
                              alignItems: "center",
                              gap: 1.25,
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: "#F59E0B",
                                flexShrink: 0,
                                animation: "pulse 2s ease-in-out infinite",
                                "@keyframes pulse": {
                                  "0%, 100%": { opacity: 1 },
                                  "50%": { opacity: 0.4 },
                                },
                              }}
                            />
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              color="#92400E"
                              sx={{ fontSize: 13 }}
                            >
                              Bill Generated · Pending Payment
                            </Typography>
                          </Box>
                        </Box>

                        {/* Medications count badge */}
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2.5,
                            bgcolor: alpha(COLORS.accent, 0.06),
                            border: `1px solid ${alpha(COLORS.accent, 0.15)}`,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            sx={{
                              color: COLORS.textSecondary,
                              fontWeight: 600,
                              fontSize: 12,
                            }}
                          >
                            Medications to dispense
                          </Typography>
                          <Typography
                            sx={{
                              fontWeight: 800,
                              color: COLORS.accent,
                              fontSize: 14,
                            }}
                          >
                            {selectedRx.items.length} item
                            {selectedRx.items.length !== 1 ? "s" : ""}
                          </Typography>
                        </Box>

                        {/* Action Buttons */}
                        {/* <Stack spacing={1}>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<CompleteIcon sx={{ fontSize: 18 }} />}
                            onClick={() =>
                              handleAction(selectedRx.id, "Accepted")
                            }
                            sx={{
                              py: 1.2,
                              borderRadius: 2.5,
                              fontWeight: 800,
                              fontSize: 14,
                              bgcolor: COLORS.accent,
                              textTransform: "none",
                              "&:hover": { bgcolor: COLORS.accentDark },
                            }}
                          >
                            Confirm & Dispense
                          </Button>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<ShippingIcon sx={{ fontSize: 18 }} />}
                            sx={{
                              py: 1,
                              borderRadius: 2.5,
                              fontWeight: 700,
                              fontSize: 13,
                              textTransform: "none",
                              color: COLORS.textSecondary,
                              borderColor: COLORS.borderStrong,
                            }}
                          >
                            Mark for Home Delivery
                          </Button>
                        </Stack> */}
                      </Stack>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Box
                sx={{
                  height: "60vh",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `2px dashed ${COLORS.border}`,
                  borderRadius: 4,
                }}
              >
                <Typography sx={{ color: COLORS.textMuted, fontSize: 14 }}>
                  Select a prescription to view details
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {snackbar ? (
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar(null)}
            variant="filled"
            sx={{ borderRadius: 2.5, fontWeight: 600, fontSize: 13 }}
          >
            {snackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}
