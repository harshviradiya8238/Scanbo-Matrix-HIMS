"use client";

import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import { alpha, useTheme } from "@/src/ui/theme";
import { CommonDialog } from "@/src/ui/components/molecules";
import CommonMedicationForm, {
  type CommonMedicationFormHandle,
  type MedicationForm,
} from "@/src/ui/components/forms/CommonMedicationForm";
import {
  CommonOrderDialog,
  type DraftOrderLine,
  type OrderCatalogItem,
} from "@/src/screens/clinical/components/CommonOrderDialog";
import {
  Add as AddIcon,
  Biotech as BiotechIcon,
  DeleteOutline as DeleteOutlineIcon,
  MedicalServices as MedicalServicesIcon,
  Medication as MedicationIcon,
  Science as ScienceIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { useSearchParams } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderTab = "prescriptions" | "lab" | "radiology" | "procedures";

interface Patient {
  id: string;
  name: string;
  mrn: string;
  age: string;
  gender: string;
  diagnosis: string;
  avatar: string;
}

interface RxEntry {
  id: string;
  drugName: string;
  dose: string;
  doseUnit: string;
  frequency: string;
  route: string;
  duration: string;
  durationUnit: string;
  notes: string;
  status: "Active" | "Stopped" | "Pending";
}

interface LabOrder {
  id: string;
  test: string;
  category: string;
  priority: string;
  status: "Pending" | "Collected" | "Resulted";
  orderedAt: string;
  instructions: string;
}

interface RadiologyOrder {
  id: string;
  study: string;
  modality: string;
  priority: string;
  status: "Pending" | "Scheduled" | "Reported";
  orderedAt: string;
  instructions: string;
}

interface ProcedureOrder {
  id: string;
  name: string;
  type: string;
  priority: string;
  status: "Scheduled" | "Pending" | "Completed";
  scheduledAt: string;
  instructions: string;
}

// ─── Catalogs ─────────────────────────────────────────────────────────────────

const LAB_CATALOG: OrderCatalogItem[] = [
  { id: "l-1",  name: "Complete Blood Count (CBC)",       category: "Haematology",   defaultPriority: "Routine" },
  { id: "l-2",  name: "HbA1c",                            category: "Biochemistry",  defaultPriority: "Routine" },
  { id: "l-3",  name: "Fasting Blood Glucose",            category: "Biochemistry",  defaultPriority: "Routine" },
  { id: "l-4",  name: "Lipid Profile",                    category: "Biochemistry",  defaultPriority: "Routine" },
  { id: "l-5",  name: "Renal Function Test (RFT)",        category: "Biochemistry",  defaultPriority: "Routine" },
  { id: "l-6",  name: "Liver Function Test (LFT)",        category: "Biochemistry",  defaultPriority: "Routine" },
  { id: "l-7",  name: "Thyroid Profile (TSH, T3, T4)",    category: "Immunology",    defaultPriority: "Routine" },
  { id: "l-8",  name: "Urine Routine & Microscopy",       category: "Microbiology",  defaultPriority: "Routine" },
  { id: "l-9",  name: "Prothrombin Time (PT/INR)",        category: "Haematology",   defaultPriority: "Urgent"  },
  { id: "l-10", name: "Serum Electrolytes",               category: "Biochemistry",  defaultPriority: "Urgent"  },
  { id: "l-11", name: "Blood Culture & Sensitivity",      category: "Microbiology",  defaultPriority: "Urgent"  },
  { id: "l-12", name: "Troponin I",                       category: "Biochemistry",  defaultPriority: "STAT"    },
  { id: "l-13", name: "D-Dimer",                          category: "Haematology",   defaultPriority: "STAT"    },
  { id: "l-14", name: "Serum Creatinine",                 category: "Biochemistry",  defaultPriority: "Routine" },
  { id: "l-15", name: "CRP (C-Reactive Protein)",         category: "Immunology",    defaultPriority: "Routine" },
];

const LAB_CATEGORIES = ["All", "Biochemistry", "Haematology", "Microbiology", "Immunology"];

const RADIOLOGY_CATALOG: OrderCatalogItem[] = [
  { id: "r-1",  name: "Chest X-Ray (PA)",                 category: "X-Ray",         defaultPriority: "Routine" },
  { id: "r-2",  name: "Abdomen X-Ray",                    category: "X-Ray",         defaultPriority: "Routine" },
  { id: "r-3",  name: "CT Chest",                         category: "CT Scan",       defaultPriority: "Urgent"  },
  { id: "r-4",  name: "CT Abdomen & Pelvis",              category: "CT Scan",       defaultPriority: "Routine" },
  { id: "r-5",  name: "CT Brain (Non-contrast)",          category: "CT Scan",       defaultPriority: "STAT"    },
  { id: "r-6",  name: "MRI Brain with Contrast",          category: "MRI",           defaultPriority: "Urgent"  },
  { id: "r-7",  name: "MRI Spine (Lumbar)",               category: "MRI",           defaultPriority: "Routine" },
  { id: "r-8",  name: "Ultrasound Abdomen",               category: "Ultrasound",    defaultPriority: "Routine" },
  { id: "r-9",  name: "Echocardiography (2D Echo)",       category: "Cardiology",    defaultPriority: "Routine" },
  { id: "r-10", name: "ECG (12-Lead)",                    category: "Cardiology",    defaultPriority: "STAT"    },
  { id: "r-11", name: "Mammography",                      category: "Mammography",   defaultPriority: "Routine" },
  { id: "r-12", name: "Doppler Study (Lower Limb)",       category: "Ultrasound",    defaultPriority: "Urgent"  },
];

const RADIOLOGY_CATEGORIES = ["All", "X-Ray", "CT Scan", "MRI", "Ultrasound", "Cardiology", "Mammography"];

const PROCEDURE_CATALOG: OrderCatalogItem[] = [
  { id: "p-1",  name: "Upper GI Endoscopy",               category: "Endoscopy",     defaultPriority: "Routine" },
  { id: "p-2",  name: "Colonoscopy",                      category: "Endoscopy",     defaultPriority: "Routine" },
  { id: "p-3",  name: "Lumbar Puncture",                  category: "Neurology",     defaultPriority: "Urgent"  },
  { id: "p-4",  name: "Bone Marrow Biopsy",               category: "Haematology",   defaultPriority: "Routine" },
  { id: "p-5",  name: "Pleural Tap (Thoracentesis)",      category: "Pulmonology",   defaultPriority: "Urgent"  },
  { id: "p-6",  name: "Ascitic Tap (Paracentesis)",       category: "Gastroenterology", defaultPriority: "Urgent" },
  { id: "p-7",  name: "Central Line Insertion",           category: "ICU / Critical",defaultPriority: "STAT"    },
  { id: "p-8",  name: "Intubation & Ventilation",         category: "ICU / Critical",defaultPriority: "STAT"    },
  { id: "p-9",  name: "Wound Debridement",                category: "Surgery",       defaultPriority: "Routine" },
  { id: "p-10", name: "Incision & Drainage",              category: "Surgery",       defaultPriority: "Routine" },
  { id: "p-11", name: "Cardiology Consult",               category: "Consult",       defaultPriority: "Routine" },
  { id: "p-12", name: "Nephrology Consult",               category: "Consult",       defaultPriority: "Routine" },
  { id: "p-13", name: "Physiotherapy Session",            category: "Rehabilitation",defaultPriority: "Routine" },
  { id: "p-14", name: "Dialysis Session",                 category: "Nephrology",    defaultPriority: "Routine" },
];

const PROCEDURE_CATEGORIES = ["All", "Endoscopy", "Neurology", "Haematology", "Pulmonology", "Gastroenterology", "ICU / Critical", "Surgery", "Consult", "Rehabilitation", "Nephrology"];

// ─── Mock Patients ────────────────────────────────────────────────────────────

const MOCK_PATIENTS: Patient[] = [
  { id: "p1", name: "Priya Sharma",  mrn: "MRN-23456", age: "34", gender: "F", diagnosis: "Type 2 Diabetes",  avatar: "PS" },
  { id: "p2", name: "Rahul Patel",   mrn: "MRN-34567", age: "52", gender: "M", diagnosis: "Hypertension",      avatar: "RP" },
  { id: "p3", name: "Anita Verma",   mrn: "MRN-45678", age: "28", gender: "F", diagnosis: "Migraine",           avatar: "AV" },
  { id: "p4", name: "Karan Mehta",   mrn: "MRN-56789", age: "45", gender: "M", diagnosis: "GERD",               avatar: "KM" },
];

const INITIAL_LAB_ORDERS: Record<string, LabOrder[]> = {
  p1: [
    { id: "l1", test: "HbA1c",               category: "Biochemistry", priority: "Routine", status: "Resulted",  orderedAt: "10:30 AM", instructions: "" },
    { id: "l2", test: "Fasting Blood Glucose",category: "Biochemistry", priority: "Routine", status: "Collected", orderedAt: "10:32 AM", instructions: "" },
    { id: "l3", test: "Lipid Profile",        category: "Biochemistry", priority: "Routine", status: "Pending",   orderedAt: "10:33 AM", instructions: "" },
  ],
  p2: [
    { id: "l4", test: "CBC",                  category: "Haematology",  priority: "Urgent",  status: "Collected", orderedAt: "09:15 AM", instructions: "" },
    { id: "l5", test: "Renal Function Test",  category: "Biochemistry", priority: "Routine", status: "Pending",   orderedAt: "09:16 AM", instructions: "" },
  ],
  p3: [{ id: "l6", test: "Thyroid Profile",   category: "Immunology",   priority: "Routine", status: "Pending",   orderedAt: "11:00 AM", instructions: "" }],
  p4: [{ id: "l7", test: "H. Pylori Antigen", category: "Microbiology", priority: "Routine", status: "Pending",   orderedAt: "02:00 PM", instructions: "" }],
};

const INITIAL_RADIOLOGY_ORDERS: Record<string, RadiologyOrder[]> = {
  p1: [{ id: "r1", study: "Chest X-Ray (PA)", modality: "X-Ray",    priority: "Routine", status: "Reported",   orderedAt: "10:31 AM", instructions: "" }],
  p2: [{ id: "r2", study: "ECG (12-Lead)",    modality: "Cardiology",priority: "Urgent",  status: "Scheduled",  orderedAt: "09:17 AM", instructions: "" }],
  p3: [{ id: "r3", study: "MRI Brain",        modality: "MRI",      priority: "Urgent",  status: "Scheduled",  orderedAt: "11:01 AM", instructions: "" }],
  p4: [],
};

const INITIAL_PROCEDURES: Record<string, ProcedureOrder[]> = {
  p1: [{ id: "pr1", name: "HbA1c Monitoring",         type: "Monitoring", priority: "Routine", status: "Completed", scheduledAt: "10:45 AM",        instructions: "" }],
  p2: [{ id: "pr2", name: "BP Monitoring",             type: "Monitoring", priority: "Routine", status: "Scheduled", scheduledAt: "09:30 AM",        instructions: "" }],
  p3: [],
  p4: [{ id: "pr3", name: "Upper GI Endoscopy",        type: "Endoscopy",  priority: "Routine", status: "Scheduled", scheduledAt: "Tomorrow 09:00 AM", instructions: "" }],
};

// ─── Helper chips ─────────────────────────────────────────────────────────────

function StatusChip({ status }: { status: string }) {
  const color =
    status === "Active" || status === "Resulted" || status === "Completed" || status === "Reported" ? "success"
    : status === "Pending" ? "warning"
    : status === "Stopped" ? "error"
    : "info";
  return <Chip size="small" label={status} color={color as any} sx={{ fontWeight: 700, fontSize: 11 }} />;
}

function PriorityChip({ priority }: { priority: string }) {
  const color = priority === "STAT" ? "error" : priority === "Urgent" ? "warning" : "default";
  return <Chip size="small" label={priority} color={color as any} variant="outlined" sx={{ fontSize: 10, height: 20 }} />;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DoctorOrdersPage() {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as OrderTab | null) ?? "prescriptions";

  const [activePatientId, setActivePatientId] = React.useState("p1");
  const [activeTab, setActiveTab] = React.useState<OrderTab>(initialTab);
  const [search, setSearch] = React.useState("");

  // Dialog states
  const [rxOpen, setRxOpen]   = React.useState(false);
  const [labOpen, setLabOpen] = React.useState(false);
  const [radOpen, setRadOpen] = React.useState(false);
  const [procOpen, setProcOpen] = React.useState(false);

  // Data
  const [rxByPatient,   setRxByPatient]   = React.useState<Record<string, RxEntry[]>>({ p1: [], p2: [], p3: [], p4: [] });
  const [labByPatient,  setLabByPatient]  = React.useState(INITIAL_LAB_ORDERS);
  const [radByPatient,  setRadByPatient]  = React.useState(INITIAL_RADIOLOGY_ORDERS);
  const [procByPatient, setProcByPatient] = React.useState(INITIAL_PROCEDURES);

  const medicationFormRef = React.useRef<CommonMedicationFormHandle>(null);

  const selectedPatient  = MOCK_PATIENTS.find((p) => p.id === activePatientId)!;
  const patientRx        = rxByPatient[activePatientId]   ?? [];
  const patientLab       = labByPatient[activePatientId]  ?? [];
  const patientRad       = radByPatient[activePatientId]  ?? [];
  const patientProc      = procByPatient[activePatientId] ?? [];

  const filteredPatients = MOCK_PATIENTS.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.mrn.toLowerCase().includes(search.toLowerCase()),
  );

  const TAB_COUNTS = {
    prescriptions: patientRx.length,
    lab:           patientLab.length,
    radiology:     patientRad.length,
    procedures:    patientProc.length,
  };

  const cardSx = {
    p: 2, borderRadius: 2.5, border: "1px solid",
    borderColor: alpha(theme.palette.primary.main, 0.14),
    background: theme.palette.background.paper,
    boxShadow: `0 2px 12px ${alpha(theme.palette.primary.main, 0.06)}`,
  };

  const tabs: { key: OrderTab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "prescriptions", label: "Prescriptions", icon: <MedicationIcon sx={{ fontSize: 16 }} />, color: "#6366f1" },
    { key: "lab",           label: "Lab Orders",    icon: <ScienceIcon    sx={{ fontSize: 16 }} />, color: "#0891b2" },
    { key: "radiology",     label: "Radiology",     icon: <BiotechIcon    sx={{ fontSize: 16 }} />, color: "#7c3aed" },
    { key: "procedures",    label: "Procedures",    icon: <MedicalServicesIcon sx={{ fontSize: 16 }} />, color: "#059669" },
  ];

  const metrics = [
    { label: "Total Rx",    value: Object.values(rxByPatient).flat().length,   icon: <MedicationIcon />,      color: "#6366f1" },
    { label: "Lab Orders",  value: Object.values(labByPatient).flat().length,  icon: <ScienceIcon />,         color: "#0891b2" },
    { label: "Radiology",   value: Object.values(radByPatient).flat().length,  icon: <BiotechIcon />,         color: "#7c3aed" },
    { label: "Procedures",  value: Object.values(procByPatient).flat().length, icon: <MedicalServicesIcon />, color: "#059669" },
  ];

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleLabSave = (order: DraftOrderLine) => {
    setLabByPatient((prev) => ({
      ...prev,
      [activePatientId]: [
        ...(prev[activePatientId] ?? []),
        {
          id: `l-${Date.now()}`,
          test: order.orderName,
          category: order.category,
          priority: order.priority,
          status: "Pending",
          orderedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          instructions: order.instructions,
        },
      ],
    }));
    setLabOpen(false);
  };

  const handleRadSave = (order: DraftOrderLine) => {
    setRadByPatient((prev) => ({
      ...prev,
      [activePatientId]: [
        ...(prev[activePatientId] ?? []),
        {
          id: `r-${Date.now()}`,
          study: order.orderName,
          modality: order.category,
          priority: order.priority,
          status: "Pending",
          orderedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          instructions: order.instructions,
        },
      ],
    }));
    setRadOpen(false);
  };

  const handleProcSave = (order: DraftOrderLine) => {
    setProcByPatient((prev) => ({
      ...prev,
      [activePatientId]: [
        ...(prev[activePatientId] ?? []),
        {
          id: `pr-${Date.now()}`,
          name: order.orderName,
          type: order.category,
          priority: order.priority,
          status: "Pending",
          scheduledAt: "TBD",
          instructions: order.instructions,
        },
      ],
    }));
    setProcOpen(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <PageTemplate title="Doctor's Orders">

      {/* Metrics */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 0 }}>
        {metrics.map((m) => (
          <Box key={m.label} sx={{ flex: 1, ...cardSx, display: "flex", alignItems: "center", gap: 2, py: 1.5 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, display: "grid", placeItems: "center", backgroundColor: alpha(m.color, 0.14), color: m.color, flexShrink: 0 }}>
              {m.icon}
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1 }}>{m.value}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{m.label}</Typography>
            </Box>
          </Box>
        ))}
      </Stack>

      {/* Body */}
      <Stack direction={{ xs: "column", lg: "row" }} spacing={2} sx={{ minHeight: 600 }}>

        {/* LEFT: Patient list */}
        <Box sx={{ width: { xs: "100%", lg: 280 }, flexShrink: 0 }}>
          <Box sx={{ ...cardSx, p: 0, overflow: "hidden", height: "100%" }}>
            <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>My Patients Today</Typography>
              <TextField
                size="small" fullWidth
                placeholder="Search patient or MRN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: <SearchIcon sx={{ fontSize: 16, color: "text.secondary", mr: 0.5 }} /> }}
              />
            </Box>
            <Stack sx={{ overflowY: "auto", maxHeight: 560 }}>
              {filteredPatients.map((p) => {
                const isActive = p.id === activePatientId;
                const rxCount = (rxByPatient[p.id] ?? []).length;
                return (
                  <Box
                    key={p.id}
                    onClick={() => setActivePatientId(p.id)}
                    sx={{
                      px: 2, py: 1.5, cursor: "pointer",
                      borderBottom: "1px solid", borderColor: "divider",
                      backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.1) : "transparent",
                      borderLeft: "3px solid",
                      borderLeftColor: isActive ? "primary.main" : "transparent",
                      transition: "all 0.15s ease",
                      "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.06) },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.2}>
                      <Avatar sx={{ width: 36, height: 36, fontSize: 13, fontWeight: 800, bgcolor: isActive ? "primary.main" : alpha(theme.palette.primary.main, 0.18), color: isActive ? "white" : "primary.main" }}>
                        {p.avatar}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>{p.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{p.mrn} · {p.age}/{p.gender}</Typography>
                      </Box>
                      {rxCount > 0 && (
                        <Chip size="small" label={`${rxCount} Rx`} color="primary"
                          sx={{ height: 18, fontSize: 10, fontWeight: 700, "& .MuiChip-label": { px: 0.8 } }} />
                      )}
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.3, display: "block", pl: 6 }}>
                      {p.diagnosis}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Box>

        {/* RIGHT: Orders panel */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ ...cardSx, p: 0, overflow: "hidden" }}>

            {/* Patient header */}
            <Box sx={{ px: 2.5, py: 1.8, background: `linear-gradient(115deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${theme.palette.background.paper} 60%)`, borderBottom: "1px solid", borderColor: "divider" }}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ width: 44, height: 44, fontSize: 15, fontWeight: 800, bgcolor: "primary.main" }}>
                    {selectedPatient.avatar}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{selectedPatient.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedPatient.mrn} · {selectedPatient.age}/{selectedPatient.gender} · {selectedPatient.diagnosis}
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  variant="contained" size="small" 
                  startIcon={<AddIcon />}
                  onClick={() => {
                    if      (activeTab === "prescriptions") setRxOpen(true);
                    else if (activeTab === "lab")           setLabOpen(true);
                    else if (activeTab === "radiology")     setRadOpen(true);
                    else                                   setProcOpen(true);
                  }}
                  sx={{ flexShrink: 0, borderRadius: 2, px: 2 }}
                >
                   Add {activeTab === "prescriptions" ? "Medication" : activeTab === "lab" ? "Lab Order" : activeTab === "radiology" ? "Radiology Order" : "Procedure"}
                </Button>
              </Stack>
            </Box>

            {/* Tabs */}
            <Stack direction="row" sx={{ borderBottom: "1px solid", borderColor: "divider", px: 1, pt: 0.5 }}>
              {tabs.map((tab) => (
                <Box key={tab.key} onClick={() => setActiveTab(tab.key)}
                  sx={{ px: 2, py: 1, cursor: "pointer", display: "flex", alignItems: "center", gap: 0.6,
                    borderBottom: "2px solid", borderBottomColor: activeTab === tab.key ? tab.color : "transparent",
                    color: activeTab === tab.key ? tab.color : "text.secondary",
                    fontWeight: activeTab === tab.key ? 700 : 500, fontSize: 13,
                    transition: "all 0.15s", "&:hover": { color: tab.color },
                  }}>
                  {tab.icon}
                  {tab.label}
                  <Chip size="small" label={TAB_COUNTS[tab.key]}
                    sx={{ height: 18, fontSize: 10, fontWeight: 700,
                      bgcolor: activeTab === tab.key ? alpha(tab.color, 0.15) : "action.hover",
                      color: activeTab === tab.key ? tab.color : "text.secondary",
                      "& .MuiChip-label": { px: 0.8 },
                    }} />
                </Box>
              ))}
            </Stack>

            {/* Tab Content */}
            <Box sx={{ p: 2, overflowY: "auto", maxHeight: 480 }}>

              {/* Prescriptions */}
              {activeTab === "prescriptions" && (
                <Stack spacing={1}>
                  {patientRx.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 6 }}>
                      <MedicationIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
                      <Typography color="text.secondary" variant="body2">No prescriptions yet. Click "+ Add Medication".</Typography>
                    </Box>
                  ) : (
                    <Stack direction="row" flexWrap="wrap" gap={1.5}>
                      {patientRx.map((rx) => (
                        <Box key={rx.id} sx={{
                          width: { xs: "100%", sm: "calc(50% - 6px)", lg: "calc(33% - 8px)" },
                          p: 1.8, borderRadius: 2, border: "1px solid",
                          borderColor: alpha("#6366f1", 0.18), borderTop: "3px solid #6366f1",
                          background: alpha("#6366f1", 0.03),
                        }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>{rx.drugName}</Typography>
                              <Typography variant="caption" color="text.secondary">{rx.dose} {rx.doseUnit} · {rx.frequency}</Typography>
                            </Box>
                            <Stack direction="row" spacing={0.3} alignItems="center">
                              <StatusChip status={rx.status} />
                              <IconButton size="small" color="error" sx={{ p: 0.4 }}
                                onClick={() => setRxByPatient((prev) => ({ ...prev, [activePatientId]: prev[activePatientId].filter((r) => r.id !== rx.id) }))}>
                                <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Stack>
                          </Stack>
                          <Stack direction="row" gap={0.5} flexWrap="wrap" sx={{ mt: 0.8 }}>
                            <Chip size="small" label={rx.route} variant="outlined" sx={{ fontSize: 10, height: 18, "& .MuiChip-label": { px: 0.7 } }} />
                            <Chip size="small" label={`${rx.duration} ${rx.durationUnit}`} variant="outlined" sx={{ fontSize: 10, height: 18, "& .MuiChip-label": { px: 0.7 } }} />
                          </Stack>
                          {rx.notes && <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block", fontStyle: "italic" }}>{rx.notes}</Typography>}
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Stack>
              )}

              {/* Lab Orders */}
              {activeTab === "lab" && (
                <Stack spacing={1}>
                  {patientLab.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 6 }}>
                      <ScienceIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
                      <Typography color="text.secondary" variant="body2">No lab orders yet.</Typography>
                    </Box>
                  ) : (
                    <Stack direction="row" flexWrap="wrap" gap={1.5}>
                      {patientLab.map((l) => (
                        <Box key={l.id} sx={{
                          width: { xs: "100%", sm: "calc(50% - 6px)", lg: "calc(33% - 8px)" },
                          p: 1.8, borderRadius: 2, border: "1px solid",
                          borderColor: alpha("#0891b2", 0.18), borderTop: "3px solid #0891b2",
                          background: alpha("#0891b2", 0.03),
                        }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>{l.test}</Typography>
                              <Typography variant="caption" color="text.secondary">{l.category} · {l.orderedAt}</Typography>
                            </Box>
                            <Stack direction="row" spacing={0.3} alignItems="center">
                              <StatusChip status={l.status} />
                              <IconButton size="small" color="error" sx={{ p: 0.4 }}
                                onClick={() => setLabByPatient((prev) => ({ ...prev, [activePatientId]: prev[activePatientId].filter((x) => x.id !== l.id) }))}>
                                <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Stack>
                          </Stack>
                          <Stack direction="row" gap={0.5} flexWrap="wrap" sx={{ mt: 0.8 }}>
                            <PriorityChip priority={l.priority} />
                          </Stack>
                          {l.instructions && <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block", fontStyle: "italic" }}>{l.instructions}</Typography>}
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Stack>
              )}

              {/* Radiology */}
              {activeTab === "radiology" && (
                <Stack spacing={1}>
                  {patientRad.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 6 }}>
                      <BiotechIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
                      <Typography color="text.secondary" variant="body2">No radiology orders yet.</Typography>
                    </Box>
                  ) : (
                    <Stack direction="row" flexWrap="wrap" gap={1.5}>
                      {patientRad.map((r) => (
                        <Box key={r.id} sx={{
                          width: { xs: "100%", sm: "calc(50% - 6px)", lg: "calc(33% - 8px)" },
                          p: 1.8, borderRadius: 2, border: "1px solid",
                          borderColor: alpha("#7c3aed", 0.18), borderTop: "3px solid #7c3aed",
                          background: alpha("#7c3aed", 0.03),
                        }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>{r.study}</Typography>
                              <Typography variant="caption" color="text.secondary">{r.modality} · {r.orderedAt}</Typography>
                            </Box>
                            <Stack direction="row" spacing={0.3} alignItems="center">
                              <StatusChip status={r.status} />
                              <IconButton size="small" color="error" sx={{ p: 0.4 }}
                                onClick={() => setRadByPatient((prev) => ({ ...prev, [activePatientId]: prev[activePatientId].filter((x) => x.id !== r.id) }))}>
                                <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Stack>
                          </Stack>
                          <Stack direction="row" gap={0.5} flexWrap="wrap" sx={{ mt: 0.8 }}>
                            <PriorityChip priority={r.priority} />
                          </Stack>
                          {r.instructions && <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block", fontStyle: "italic" }}>{r.instructions}</Typography>}
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Stack>
              )}

              {/* Procedures */}
              {activeTab === "procedures" && (
                <Stack spacing={1}>
                  {patientProc.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 6 }}>
                      <MedicalServicesIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
                      <Typography color="text.secondary" variant="body2">No procedures ordered yet.</Typography>
                    </Box>
                  ) : (
                    <Stack direction="row" flexWrap="wrap" gap={1.5}>
                      {patientProc.map((p) => (
                        <Box key={p.id} sx={{
                          width: { xs: "100%", sm: "calc(50% - 6px)", lg: "calc(33% - 8px)" },
                          p: 1.8, borderRadius: 2, border: "1px solid",
                          borderColor: alpha("#059669", 0.18), borderTop: "3px solid #059669",
                          background: alpha("#059669", 0.03),
                        }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>{p.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{p.type} · {p.scheduledAt}</Typography>
                            </Box>
                            <Stack direction="row" spacing={0.3} alignItems="center">
                              <StatusChip status={p.status} />
                              <IconButton size="small" color="error" sx={{ p: 0.4 }}
                                onClick={() => setProcByPatient((prev) => ({ ...prev, [activePatientId]: prev[activePatientId].filter((x) => x.id !== p.id) }))}>
                                <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Stack>
                          </Stack>
                          <Stack direction="row" gap={0.5} flexWrap="wrap" sx={{ mt: 0.8 }}>
                            <PriorityChip priority={p.priority} />
                          </Stack>
                          {p.instructions && <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block", fontStyle: "italic" }}>{p.instructions}</Typography>}
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Stack>
              )}

            </Box>
          </Box>
        </Box>
      </Stack>

      {/* ── Rx Dialog (CommonMedicationForm) ──────────────────────────── */}
      <CommonDialog
        open={rxOpen}
        onClose={() => setRxOpen(false)}
        title="+ Add Prescription"
        icon={<MedicationIcon fontSize="small" />}
        maxWidth="sm"
        fullWidth
        contentDividers
        content={
          <CommonMedicationForm
            ref={medicationFormRef}
            onSave={(data: MedicationForm) => {
              setRxByPatient((prev) => ({
                ...prev,
                [activePatientId]: [
                  ...(prev[activePatientId] ?? []),
                  {
                    id: `rx-${Date.now()}`,
                    drugName: data.drugName,
                    dose: data.dose,
                    doseUnit: data.doseUnit,
                    frequency: data.frequency,
                    route: data.route,
                    duration: data.duration,
                    durationUnit: data.durationUnit,
                    notes: data.notes,
                    status: "Active",
                  },
                ],
              }));
              setRxOpen(false);
            }}
          />
        }
        actions={
          <>
            <Button onClick={() => setRxOpen(false)}>Cancel</Button>
            <Button variant="contained" startIcon={<MedicationIcon />} onClick={() => medicationFormRef.current?.submit()}>
              Save Prescription
            </Button>
          </>
        }
      />

      {/* ── Lab Order Dialog (CommonOrderDialog) ──────────────────────── */}
      <CommonOrderDialog
        open={labOpen}
        onClose={() => setLabOpen(false)}
        onSave={handleLabSave}
        catalog={LAB_CATALOG}
        categories={LAB_CATEGORIES}
        title="Order Lab Test"
      />

      {/* ── Radiology Dialog (CommonOrderDialog) ──────────────────────── */}
      <CommonOrderDialog
        open={radOpen}
        onClose={() => setRadOpen(false)}
        onSave={handleRadSave}
        catalog={RADIOLOGY_CATALOG}
        categories={RADIOLOGY_CATEGORIES}
        title="Order Radiology Study"
      />

      {/* ── Procedure Dialog (CommonOrderDialog) ──────────────────────── */}
      <CommonOrderDialog
        open={procOpen}
        onClose={() => setProcOpen(false)}
        onSave={handleProcSave}
        catalog={PROCEDURE_CATALOG}
        categories={PROCEDURE_CATEGORIES}
        title="Order Procedure / Consult"
        showFrequency={false}
        showDuration={false}
      />

    </PageTemplate>
  );
}
