"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Box,
  Typography,
  Stack,
  Grid,
  Button,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
  Divider,
  Autocomplete,
  TextField,
  Badge,
} from "@/src/ui/components/atoms";
import { Card, CardHeader, CardBody } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Medication as RxIcon,
  Person as PatientIcon,
  ArrowBack as BackIcon,
  CheckCircle as CompleteIcon,
  Delete as RemoveIcon,
  LocalShipping as ShippingIcon,
  CalendarToday as CalendarIcon,
  Inventory2Outlined as InventoryIcon,
  ReceiptLong as BillIcon,
  InfoOutlined as InfoIcon,
  MedicalServices as MedIcon,
  Add,
  Remove,
} from "@mui/icons-material";

// ── TYPES ──────────────────────────────────────────────────────────
type SelectedMed = {
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

type Patient = {
  id: string;
  name: string;
  mrn: string;
  age: number;
  gender: string;
  prescribedBy: string;
  department: string;
  prescriptionDate: string;
  allergies: string[];
};

// ── MOCK DATA ──────────────────────────────────────────────────────
const MOCK_PATIENTS: Patient[] = [
  {
    id: "p1",
    name: "Priya Sharma",
    mrn: "P-9082",
    age: 28,
    gender: "Female",
    prescribedBy: "Dr. Ananya Mehta",
    department: "General Medicine",
    prescriptionDate: "23 Mar 2026, 10:15 AM",
    allergies: ["Penicillin"],
  },
  {
    id: "p2",
    name: "Rahul Khanna",
    mrn: "P-8821",
    age: 42,
    gender: "Male",
    prescribedBy: "Dr. Sameer Joshi",
    department: "Cardiology",
    prescriptionDate: "23 Mar 2026, 11:30 AM",
    allergies: [],
  },
  {
    id: "p3",
    name: "Sneha Kapur",
    mrn: "P-7734",
    age: 35,
    gender: "Female",
    prescribedBy: "Dr. Vikram Seth",
    department: "Orthopedics",
    prescriptionDate: "22 Mar 2026, 04:45 PM",
    allergies: ["Aspirin", "Sulfa"],
  },
];

const INITIAL_MEDS: SelectedMed[] = [
  {
    id: "M001",
    name: "Amoxicillin 500mg",
    category: "Antibiotic",
    dosage: "1 Tab",
    frequency: "TID",
    duration: "5 days",
    stock: 120,
    price: 45.0,
    qty: 15,
  },
  {
    id: "M045",
    name: "Paracetamol 650mg",
    category: "Analgesic",
    dosage: "1 Tab",
    frequency: "SOS",
    duration: "3 days",
    stock: 1500,
    price: 2.5,
    qty: 10,
  },
];

// ── STOCK INDICATOR ───────────────────────────────────────────────
function StockIndicator({ stock }: { stock: number }) {
  const theme = useTheme();
  const isLow = stock < 50;
  const isMedium = stock >= 50 && stock < 200;
  const color = isLow
    ? theme.palette.error.main
    : isMedium
      ? theme.palette.warning.main
      : theme.palette.success.main;
  const label = isLow ? "Low" : isMedium ? "Medium" : "Adequate";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: color,
          boxShadow: `0 0 6px ${alpha(color, 0.7)}`,
          flexShrink: 0,
        }}
      />
      <Box>
        <Typography variant="caption" color="text.secondary" display="block" lineHeight={1.2}>
          {stock.toLocaleString()} units
        </Typography>
        <Typography variant="caption" sx={{ color, fontWeight: 700, fontSize: "0.65rem" }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

// ── CATEGORY CHIP ─────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  Antibiotic: "#4f8ef7",
  Analgesic: "#f78c4f",
  Antifungal: "#6ecf8d",
  Antiviral: "#b96ef7",
  default: "#8fa3b8",
};

function CategoryChip({ label }: { label: string }) {
  const color = CATEGORY_COLORS[label] || CATEGORY_COLORS.default;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: 1,
        py: 0.25,
        borderRadius: 1,
        bgcolor: alpha(color, 0.12),
        border: `1px solid ${alpha(color, 0.3)}`,
      }}
    >
      <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color }}>
        {label.toUpperCase()}
      </Typography>
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
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        border: "1.5px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        height: 32,
      }}
    >
      <IconButton
        size="small"
        onClick={onDecrease}
        sx={{
          borderRadius: 0,
          px: 0.75,
          height: "100%",
          "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.08) },
        }}
      >
        <Remove sx={{ fontSize: 14 }} />
      </IconButton>
      <Typography
        variant="subtitle2"
        fontWeight={800}
        sx={{ px: 1.5, minWidth: 30, textAlign: "center" }}
      >
        {qty}
      </Typography>
      <IconButton
        size="small"
        onClick={onIncrease}
        sx={{
          borderRadius: 0,
          px: 0.75,
          height: "100%",
          "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.08) },
        }}
      >
        <Add sx={{ fontSize: 14 }} />
      </IconButton>
    </Box>
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
  const theme = useTheme();
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Typography
        variant={bold ? "body1" : "body2"}
        fontWeight={bold ? 800 : 500}
        color={bold ? "text.primary" : "text.secondary"}
      >
        {label}
      </Typography>
      <Typography
        variant={bold ? "h6" : "body2"}
        fontWeight={bold ? 800 : 600}
        color={accent ? "primary.main" : bold ? "text.primary" : "text.primary"}
      >
        {value}
      </Typography>
    </Box>
  );
}

// ── DISPENSE PAGE ─────────────────────────────────────────────────
export default function DispensePage() {
  const router = useRouter();
  const theme = useTheme();

  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(
    MOCK_PATIENTS[0]
  );
  const [selectedMeds, setSelectedMeds] = React.useState<SelectedMed[]>(INITIAL_MEDS);
  const [dispensed, setDispensed] = React.useState(false);

  const updateQty = (id: string, delta: number) => {
    setSelectedMeds((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, qty: Math.max(1, Math.min(m.stock, m.qty + delta)) } : m
      )
    );
  };

  const removeMed = (id: string) => {
    setSelectedMeds((prev) => prev.filter((m) => m.id !== id));
  };

  const subtotal = selectedMeds.reduce((sum, m) => sum + m.price * m.qty, 0);
  const gst = subtotal * 0.12;
  const total = subtotal + gst;

  const hasAllergyWarning =
    selectedPatient?.allergies.length &&
    selectedMeds.some((m) =>
      selectedPatient.allergies.some((a) =>
        m.name.toLowerCase().includes(a.toLowerCase())
      )
    );

  return (
    <PageTemplate
      title="New Medication Dispense"
      subtitle="Verify prescription details and dispense medications to patient."
      currentPageTitle="Dispense"
    >
      <Grid container spacing={3} sx={{ p: 1 }}>

        {/* ─── LEFT COLUMN ─────────────────────────────── */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={3}>

            {/* Patient Search */}
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PatientIcon sx={{ fontSize: 18, color: "primary.main" }} />
                    Search Patient
                  </Box>
                }
                subtitle="Search by MRN or patient name to load prescription"
              />
              <CardBody>
                <Autocomplete
                  options={MOCK_PATIENTS}
                  getOptionLabel={(o) => `${o.name} · ${o.mrn}`}
                  value={selectedPatient}
                  onChange={(_, v) => setSelectedPatient(v)}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            bgcolor: alpha(theme.palette.primary.main, 0.15),
                            color: "primary.main",
                          }}
                        >
                          {option.name.split(" ").map((n) => n[0]).join("")}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            {option.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.mrn} · {option.gender}, {option.age}y
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Enter MRN or patient name..."
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <SearchIcon sx={{ color: "text.disabled", mr: 1, fontSize: 20 }} />
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  fullWidth
                />
              </CardBody>
            </Card>

            {/* Patient Context Card */}
            {selectedPatient && (
              <Card>
                <CardHeader
                  title="Patient & Prescription Context"
                  action={
                    <Chip
                      icon={<RxIcon sx={{ fontSize: "14px !important" }} />}
                      label="Active Rx"
                      color="success"
                      size="small"
                      variant="filled"
                      sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                    />
                  }
                />
                <CardBody>
                  <Grid container spacing={2} alignItems="stretch">
                    {/* Avatar + Name */}
                    <Grid item xs={12} sm={5}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 2,
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                          border: "1px solid",
                          borderColor: alpha(theme.palette.primary.main, 0.12),
                          height: "100%",
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: theme.palette.primary.main,
                            color: "white",
                            width: 52,
                            height: 52,
                            fontWeight: 800,
                            fontSize: "1.1rem",
                            boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
                            flexShrink: 0,
                          }}
                        >
                          {selectedPatient.name.split(" ").map((n) => n[0]).join("")}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2}>
                            {selectedPatient.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {selectedPatient.gender} · {selectedPatient.age}y
                          </Typography>
                          <Typography
                            variant="caption"
                            display="block"
                            fontWeight={700}
                            color="primary.main"
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                              mt: 0.5,
                              width: "fit-content",
                            }}
                          >
                            {selectedPatient.mrn}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Prescription Info */}
                    <Grid item xs={12} sm={7}>
                      <Stack spacing={1.5} sx={{ height: "100%", justifyContent: "center" }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                            Prescribed by
                          </Typography>
                          <Typography variant="subtitle2" fontWeight={800}>
                            {selectedPatient.prescribedBy}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {selectedPatient.department}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <CalendarIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary">
                            {selectedPatient.prescriptionDate}
                          </Typography>
                        </Box>
                        {selectedPatient.allergies.length > 0 && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                            <Typography variant="caption" fontWeight={700} color="error.main" sx={{ textTransform: "uppercase" }}>
                              ⚠ Allergies:
                            </Typography>
                            {selectedPatient.allergies.map((a) => (
                              <Chip
                                key={a}
                                label={a}
                                size="small"
                                color="error"
                                variant="outlined"
                                sx={{ fontWeight: 700, fontSize: "0.65rem", height: 20 }}
                              />
                            ))}
                          </Box>
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </CardBody>
              </Card>
            )}

            {/* Allergy warning banner */}
            {hasAllergyWarning && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.error.main, 0.06),
                  border: "1.5px solid",
                  borderColor: alpha(theme.palette.error.main, 0.3),
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <InfoIcon sx={{ color: "error.main", fontSize: 20, flexShrink: 0 }} />
                <Typography variant="body2" color="error.main" fontWeight={600}>
                  Possible allergen conflict detected in current prescription. Please verify with the prescribing doctor before dispensing.
                </Typography>
              </Box>
            )}

            {/* Medications */}
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <MedIcon sx={{ fontSize: 18, color: "primary.main" }} />
                    Prescribed Medications
                  </Box>
                }
                subtitle={`${selectedMeds.length} item${selectedMeds.length !== 1 ? "s" : ""} — verify quantity before dispensing`}
                action={
                  <Button
                    startIcon={<AddIcon />}
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{ fontWeight: 700, borderRadius: 2 }}
                  >
                    Add Medicine
                  </Button>
                }
              />
              <CardBody>
                <Stack spacing={2}>
                  {selectedMeds.length === 0 && (
                    <Box
                      sx={{
                        py: 6,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1,
                        color: "text.disabled",
                      }}
                    >
                      <InventoryIcon sx={{ fontSize: 40, opacity: 0.4 }} />
                      <Typography variant="body2">No medications added yet</Typography>
                    </Box>
                  )}

                  {selectedMeds.map((med, idx) => (
                    <Box
                      key={med.id}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        border: "1.5px solid",
                        borderColor: alpha(theme.palette.divider, 0.7),
                        bgcolor: theme.palette.background.paper,
                        transition: "box-shadow 0.2s, border-color 0.2s",
                        "&:hover": {
                          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}`,
                          borderColor: alpha(theme.palette.primary.main, 0.25),
                        },
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        {/* Index Badge + Name */}
                        <Grid item xs={12} sm={5}>
                          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                            <Box
                              sx={{
                                minWidth: 26,
                                height: 26,
                                borderRadius: "50%",
                                bgcolor: alpha(theme.palette.primary.main, 0.12),
                                color: "primary.main",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: "0.7rem",
                                flexShrink: 0,
                                mt: 0.25,
                              }}
                            >
                              {idx + 1}
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={800} lineHeight={1.3}>
                                {med.name}
                              </Typography>
                              <Box sx={{ display: "flex", gap: 0.75, mt: 0.5, flexWrap: "wrap", alignItems: "center" }}>
                                <CategoryChip label={med.category} />
                                <Typography variant="caption" color="text.secondary">
                                  {med.dosage} · {med.frequency} · {med.duration}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Stock */}
                        <Grid item xs={6} sm={2}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: 0.4, fontSize: "0.62rem" }}>
                            In Stock
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            <StockIndicator stock={med.stock} />
                          </Box>
                        </Grid>

                        {/* Qty Control */}
                        <Grid item xs={6} sm={2}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: 0.4, fontSize: "0.62rem" }}>
                            Quantity
                          </Typography>
                          <Box sx={{ mt: 0.75 }}>
                            <QtyControl
                              qty={med.qty}
                              onIncrease={() => updateQty(med.id, 1)}
                              onDecrease={() => updateQty(med.id, -1)}
                            />
                          </Box>
                        </Grid>

                        {/* Amount */}
                        <Grid item xs={6} sm={2}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: 0.4, fontSize: "0.62rem" }}>
                            Amount
                          </Typography>
                          <Typography variant="subtitle2" fontWeight={800} sx={{ mt: 0.5 }}>
                            ₹{(med.price * med.qty).toFixed(2)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @₹{med.price}/unit
                          </Typography>
                        </Grid>

                        {/* Remove */}
                        <Grid item xs={6} sm={1} sx={{ textAlign: "right" }}>
                          <Tooltip title="Remove" placement="top">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeMed(med.id)}
                              sx={{
                                border: "1px solid",
                                borderColor: alpha(theme.palette.error.main, 0.25),
                                "&:hover": {
                                  bgcolor: alpha(theme.palette.error.main, 0.1),
                                  borderColor: "error.main",
                                },
                              }}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Stack>
              </CardBody>
            </Card>

          </Stack>
        </Grid>

        {/* ─── RIGHT COLUMN ─────────────────────────────── */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ position: "sticky", top: 24 }}>
            <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.015) }}>
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <BillIcon sx={{ fontSize: 18, color: "primary.main" }} />
                    Dispense Summary
                  </Box>
                }
                divider={false}
              />
              <CardBody>
                <Stack spacing={3}>

                  {/* Bill Breakdown */}
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      bgcolor: "background.paper",
                      border: "1.5px dashed",
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                    }}
                  >
                    <Stack spacing={1.5}>
                      {selectedMeds.map((m) => (
                        <Box key={m.id} sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="caption" color="text.secondary" sx={{ maxWidth: "60%", lineHeight: 1.4 }}>
                            {m.name} × {m.qty}
                          </Typography>
                          <Typography variant="caption" fontWeight={700}>
                            ₹{(m.price * m.qty).toFixed(2)}
                          </Typography>
                        </Box>
                      ))}

                      <Divider sx={{ borderStyle: "dashed", my: 0.5 }} />

                      <SummaryRow label="Subtotal" value={`₹${subtotal.toFixed(2)}`} />
                      <SummaryRow label="GST (12%)" value={`₹${gst.toFixed(2)}`} />

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
                      fontWeight={700}
                      color="text.secondary"
                      display="block"
                      gutterBottom
                      sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.65rem" }}
                    >
                      Payment Status
                    </Typography>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2.5,
                        bgcolor: alpha(theme.palette.warning.main, 0.08),
                        border: "1px solid",
                        borderColor: alpha(theme.palette.warning.main, 0.25),
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
                          bgcolor: "warning.main",
                          flexShrink: 0,
                          animation: "pulse 1.5s ease-in-out infinite",
                          "@keyframes pulse": {
                            "0%, 100%": { opacity: 1 },
                            "50%": { opacity: 0.4 },
                          },
                        }}
                      />
                      <Typography variant="body2" fontWeight={700} color="warning.dark">
                        Bill Generated · Pending Payment
                      </Typography>
                    </Box>
                  </Box>

                  {/* Medications count badge */}
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2.5,
                      bgcolor: alpha(theme.palette.info.main, 0.06),
                      border: "1px solid",
                      borderColor: alpha(theme.palette.info.main, 0.15),
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Medications to dispense
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={800} color="info.main">
                      {selectedMeds.length} item{selectedMeds.length !== 1 ? "s" : ""}
                    </Typography>
                  </Box>

                  {/* Action Buttons */}
                  <Stack spacing={1.5}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<CompleteIcon />}
                      disabled={selectedMeds.length === 0 || !selectedPatient}
                      onClick={() => setDispensed(true)}
                      sx={{
                        py: 1.6,
                        borderRadius: 3,
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
                        "&:hover": {
                          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.45)}`,
                          transform: "translateY(-1px)",
                        },
                        transition: "all 0.2s",
                      }}
                    >
                      Confirm & Dispense
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="secondary"
                      startIcon={<ShippingIcon />}
                      sx={{
                        py: 1.3,
                        borderRadius: 3,
                        fontWeight: 700,
                        "&:hover": { transform: "translateY(-1px)" },
                        transition: "all 0.2s",
                      }}
                    >
                      Mark for Home Delivery
                    </Button>
                    <Button
                      fullWidth
                      variant="text"
                      color="inherit"
                      startIcon={<BackIcon />}
                      onClick={() => router.back()}
                      sx={{ py: 1, borderRadius: 3, fontWeight: 600, color: "text.secondary" }}
                    >
                      Back
                    </Button>
                  </Stack>

                  {/* Disclaimer */}
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      textAlign="center"
                      display="block"
                      sx={{ fontStyle: "italic", lineHeight: 1.6 }}
                    >
                      Once dispensed, inventory will be auto-deducted and status updated in the EMR.
                    </Typography>
                  </Box>
                </Stack>
              </CardBody>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </PageTemplate>
  );
}