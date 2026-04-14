"use client";

import * as React from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import { alpha, useTheme } from "@/src/ui/theme";
import { CommonDialog } from "@/src/ui/components/molecules";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";
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
  FilterList as FilterIcon,
  KeyboardArrowDown as ArrowDownIcon,
  MedicalServices as MedicalServicesIcon,
  Medication as MedicationIcon,
  Science as ScienceIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { useSearchParams } from "next/navigation";
import { CustomCardTabs } from "@/src/ui/components/molecules";

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
  { id: "l-1", name: "Complete Blood Count (CBC)", category: "Haematology", defaultPriority: "Routine" },
  { id: "l-2", name: "HbA1c", category: "Biochemistry", defaultPriority: "Routine" },
  { id: "l-3", name: "Fasting Blood Glucose", category: "Biochemistry", defaultPriority: "Routine" },
  { id: "l-4", name: "Lipid Profile", category: "Biochemistry", defaultPriority: "Routine" },
  { id: "l-5", name: "Renal Function Test (RFT)", category: "Biochemistry", defaultPriority: "Routine" },
  { id: "l-6", name: "Liver Function Test (LFT)", category: "Biochemistry", defaultPriority: "Routine" },
  { id: "l-7", name: "Thyroid Profile (TSH, T3, T4)", category: "Immunology", defaultPriority: "Routine" },
  { id: "l-8", name: "Urine Routine & Microscopy", category: "Microbiology", defaultPriority: "Routine" },
  { id: "l-9", name: "Prothrombin Time (PT/INR)", category: "Haematology", defaultPriority: "Urgent" },
  { id: "l-10", name: "Serum Electrolytes", category: "Biochemistry", defaultPriority: "Urgent" },
  { id: "l-11", name: "Blood Culture & Sensitivity", category: "Microbiology", defaultPriority: "Urgent" },
  { id: "l-12", name: "Troponin I", category: "Biochemistry", defaultPriority: "STAT" },
  { id: "l-13", name: "D-Dimer", category: "Haematology", defaultPriority: "STAT" },
  { id: "l-14", name: "Serum Creatinine", category: "Biochemistry", defaultPriority: "Routine" },
  { id: "l-15", name: "CRP (C-Reactive Protein)", category: "Immunology", defaultPriority: "Routine" },
];

const LAB_CATEGORIES = ["All", "Biochemistry", "Haematology", "Microbiology", "Immunology"];

const RADIOLOGY_CATALOG: OrderCatalogItem[] = [
  { id: "r-1", name: "Chest X-Ray (PA)", category: "X-Ray", defaultPriority: "Routine" },
  { id: "r-2", name: "Abdomen X-Ray", category: "X-Ray", defaultPriority: "Routine" },
  { id: "r-3", name: "CT Chest", category: "CT Scan", defaultPriority: "Urgent" },
  { id: "r-4", name: "CT Abdomen & Pelvis", category: "CT Scan", defaultPriority: "Routine" },
  { id: "r-5", name: "CT Brain (Non-contrast)", category: "CT Scan", defaultPriority: "STAT" },
  { id: "r-6", name: "MRI Brain with Contrast", category: "MRI", defaultPriority: "Urgent" },
  { id: "r-7", name: "MRI Spine (Lumbar)", category: "MRI", defaultPriority: "Routine" },
  { id: "r-8", name: "Ultrasound Abdomen", category: "Ultrasound", defaultPriority: "Routine" },
  { id: "r-9", name: "Echocardiography (2D Echo)", category: "Cardiology", defaultPriority: "Routine" },
  { id: "r-10", name: "ECG (12-Lead)", category: "Cardiology", defaultPriority: "STAT" },
  { id: "r-11", name: "Mammography", category: "Mammography", defaultPriority: "Routine" },
  { id: "r-12", name: "Doppler Study (Lower Limb)", category: "Ultrasound", defaultPriority: "Urgent" },
];

const RADIOLOGY_CATEGORIES = ["All", "X-Ray", "CT Scan", "MRI", "Ultrasound", "Cardiology", "Mammography"];

const PROCEDURE_CATALOG: OrderCatalogItem[] = [
  { id: "p-1", name: "Upper GI Endoscopy", category: "Endoscopy", defaultPriority: "Routine" },
  { id: "p-2", name: "Colonoscopy", category: "Endoscopy", defaultPriority: "Routine" },
  { id: "p-3", name: "Lumbar Puncture", category: "Neurology", defaultPriority: "Urgent" },
  { id: "p-4", name: "Bone Marrow Biopsy", category: "Haematology", defaultPriority: "Routine" },
  { id: "p-5", name: "Pleural Tap (Thoracentesis)", category: "Pulmonology", defaultPriority: "Urgent" },
  { id: "p-6", name: "Ascitic Tap (Paracentesis)", category: "Gastroenterology", defaultPriority: "Urgent" },
  { id: "p-7", name: "Central Line Insertion", category: "ICU / Critical", defaultPriority: "STAT" },
  { id: "p-8", name: "Intubation & Ventilation", category: "ICU / Critical", defaultPriority: "STAT" },
  { id: "p-9", name: "Wound Debridement", category: "Surgery", defaultPriority: "Routine" },
  { id: "p-10", name: "Incision & Drainage", category: "Surgery", defaultPriority: "Routine" },
  { id: "p-11", name: "Cardiology Consult", category: "Consult", defaultPriority: "Routine" },
  { id: "p-12", name: "Nephrology Consult", category: "Consult", defaultPriority: "Routine" },
  { id: "p-13", name: "Physiotherapy Session", category: "Rehabilitation", defaultPriority: "Routine" },
  { id: "p-14", name: "Dialysis Session", category: "Nephrology", defaultPriority: "Routine" },
];

const PROCEDURE_CATEGORIES = ["All", "Endoscopy", "Neurology", "Haematology", "Pulmonology", "Gastroenterology", "ICU / Critical", "Surgery", "Consult", "Rehabilitation", "Nephrology"];

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
  patientId: string;
  patientName: string;
  mrn: string;
  doctorName: string;
  department: string;
  date: string;
  totalDrugs: number;
  items: Medication[];
  status: "Pending" | "Accepted" | "Rejected";
};

const mockPrescriptions: Prescription[] = [
  {
    id: "RX-002",
    patientId: "p1",
    patientName: "Priya Sharma",
    mrn: "MRN-23456",
    doctorName: "Dr. Mehta",
    department: "Neurology",
    date: "2023-10-25 11:00 AM",
    totalDrugs: 2,
    items: [
      { id: "M001", name: "Levetiracetam", category: "Anticonvulsant", dosage: "500mg", frequency: "BD", duration: "3 months", stock: 120, price: 45.0, qty: 15 },
      { id: "M002", name: "Clonazepam", category: "Benzodiazepine", dosage: "0.5mg", frequency: "HS", duration: "1 month", stock: 85, price: 12.5, qty: 10 },
    ],
    status: "Pending",
  },
  {
    id: "RX-001",
    patientId: "p2",
    patientName: "John Doe",
    mrn: "MRN-12345",
    doctorName: "Dr. Rao",
    department: "Cardiology",
    date: "2023-10-25 10:30 AM",
    totalDrugs: 2,
    items: [
      { id: "M003", name: "Aspirin", category: "Antiplatelet", dosage: "75mg", frequency: "OD", duration: "1 month", stock: 500, price: 2.5, qty: 30 },
      { id: "M004", name: "Atorvastatin", category: "Statin", dosage: "40mg", frequency: "HS", duration: "1 month", stock: 240, price: 18.0, qty: 30 },
    ],
    status: "Pending",
  },
  {
    id: "RX-003",
    patientId: "p4",
    patientName: "Rahul Verma",
    mrn: "MRN-34567",
    doctorName: "Dr. Singh",
    department: "Orthopedics",
    date: "2023-10-24 03:15 PM",
    totalDrugs: 6,
    items: [
      { id: "M005", name: "Metoprolol", category: "Beta Blocker", dosage: "50mg", frequency: "BD", duration: "1 month", stock: 150, price: 8.5, qty: 60 },
      { id: "M006", name: "Ramipril", category: "ACE Inhibitor", dosage: "10mg", frequency: "OD", duration: "1 month", stock: 90, price: 14.0, qty: 30 },
      { id: "M007", name: "Furosemide", category: "Diuretic", dosage: "40mg", frequency: "OD", duration: "2 weeks", stock: 40, price: 5.5, qty: 14 },
      { id: "M008", name: "Spironolactone", category: "Diuretic", dosage: "25mg", frequency: "OD", duration: "1 month", stock: 65, price: 11.0, qty: 30 },
      { id: "M009", name: "Diclofenac", category: "NSAID", dosage: "50mg", frequency: "BD", duration: "5 days", stock: 300, price: 4.5, qty: 10 },
      { id: "M010", name: "Pantoprazole", category: "PPI", dosage: "40mg", frequency: "OD", duration: "5 days", stock: 450, price: 12.0, qty: 5 },
    ],
    status: "Accepted",
  },
  {
    id: "RX-004",
    patientId: "p3",
    patientName: "Anita Patel",
    mrn: "MRN-45678",
    doctorName: "Dr. Joshi",
    department: "General Medicine",
    date: "2023-10-24 09:00 AM",
    totalDrugs: 1,
    items: [
      { id: "M011", name: "Amoxicillin", category: "Antibiotic", dosage: "500mg", frequency: "TID", duration: "7 days", stock: 15, price: 25.0, qty: 21 },
    ],
    status: "Rejected",
  },
];

const INITIAL_RX_BY_PATIENT = mockPrescriptions.reduce<Record<string, RxEntry[]>>((acc, rx) => {
  const rows: RxEntry[] = rx.items.map((item) => ({
    id: item.id,
    drugName: item.name,
    dose: item.dosage,
    doseUnit: "",
    frequency: item.frequency,
    route: "Oral",
    duration: item.duration,
    durationUnit: "",
    notes: "",
    status: (rx.status === "Accepted" ? "Active" : rx.status === "Rejected" ? "Stopped" : "Pending") as "Pending" | "Active" | "Stopped",
  }));

  return {
    ...acc,
    [rx.patientId]: [...(acc[rx.patientId] ?? []), ...rows],
  };
}, { p1: [], p2: [], p3: [], p4: [] });

// ─── Mock Patients ────────────────────────────────────────────────────────────

const MOCK_PATIENTS: Patient[] = [
  { id: "p1", name: "Priya Sharma", mrn: "MRN-23456", age: "34", gender: "F", diagnosis: "Type 2 Diabetes", avatar: "PS" },
  { id: "p2", name: "John Doe", mrn: "MRN-12345", age: "45", gender: "M", diagnosis: "Coronary Artery Disease", avatar: "JD" },
  { id: "p3", name: "Anita Patel", mrn: "MRN-45678", age: "28", gender: "F", diagnosis: "General Medicine", avatar: "AP" },
  { id: "p4", name: "Rahul Verma", mrn: "MRN-34567", age: "52", gender: "M", diagnosis: "Orthopedics", avatar: "RV" },
];

const INITIAL_LAB_ORDERS: Record<string, LabOrder[]> = {
  p1: [
    { id: "l1", test: "HbA1c", category: "Biochemistry", priority: "Routine", status: "Resulted", orderedAt: "10:30 AM", instructions: "" },
    { id: "l2", test: "Fasting Blood Glucose", category: "Biochemistry", priority: "Routine", status: "Collected", orderedAt: "10:32 AM", instructions: "" },
    { id: "l3", test: "Lipid Profile", category: "Biochemistry", priority: "Routine", status: "Pending", orderedAt: "10:33 AM", instructions: "" },
  ],
  p2: [
    { id: "l4", test: "CBC", category: "Haematology", priority: "Urgent", status: "Collected", orderedAt: "09:15 AM", instructions: "" },
    { id: "l5", test: "Renal Function Test", category: "Biochemistry", priority: "Routine", status: "Pending", orderedAt: "09:16 AM", instructions: "" },
  ],
  p3: [{ id: "l6", test: "Thyroid Profile", category: "Immunology", priority: "Routine", status: "Pending", orderedAt: "11:00 AM", instructions: "" }],
  p4: [{ id: "l7", test: "H. Pylori Antigen", category: "Microbiology", priority: "Routine", status: "Pending", orderedAt: "02:00 PM", instructions: "" }],
};

const INITIAL_RADIOLOGY_ORDERS: Record<string, RadiologyOrder[]> = {
  p1: [{ id: "r1", study: "Chest X-Ray (PA)", modality: "X-Ray", priority: "Routine", status: "Reported", orderedAt: "10:31 AM", instructions: "" }],
  p2: [{ id: "r2", study: "ECG (12-Lead)", modality: "Cardiology", priority: "Urgent", status: "Scheduled", orderedAt: "09:17 AM", instructions: "" }],
  p3: [{ id: "r3", study: "MRI Brain", modality: "MRI", priority: "Urgent", status: "Scheduled", orderedAt: "11:01 AM", instructions: "" }],
  p4: [],
};

const INITIAL_PROCEDURES: Record<string, ProcedureOrder[]> = {
  p1: [{ id: "pr1", name: "HbA1c Monitoring", type: "Monitoring", priority: "Routine", status: "Completed", scheduledAt: "10:45 AM", instructions: "" }],
  p2: [{ id: "pr2", name: "BP Monitoring", type: "Monitoring", priority: "Routine", status: "Scheduled", scheduledAt: "09:30 AM", instructions: "" }],
  p3: [],
  p4: [{ id: "pr3", name: "Upper GI Endoscopy", type: "Endoscopy", priority: "Routine", status: "Scheduled", scheduledAt: "Tomorrow 09:00 AM", instructions: "" }],
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
  const [statusFilter, setStatusFilter] = React.useState<"All" | "Pending" | "Accepted" | "Rejected">("All");
  const [departmentFilter, setDepartmentFilter] = React.useState("All");
  const [timeFilter, setTimeFilter] = React.useState("All");
  const [queueSort, setQueueSort] = React.useState<"Newest" | "Oldest">("Newest");

  const filteredQueue = mockPrescriptions
    .filter((rx) => {
      const matchesText =
        rx.patientName.toLowerCase().includes(search.toLowerCase()) ||
        rx.mrn.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || rx.status === statusFilter;
      const matchesDepartment =
        departmentFilter === "All" || rx.department === departmentFilter;
      const rxDate = new Date(rx.date);
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      const matchesTime =
        timeFilter === "All" ||
        (timeFilter === "Today" && rxDate >= startOfToday) ||
        (timeFilter === "Yesterday" && rxDate >= startOfYesterday && rxDate < startOfToday) ||
        (timeFilter === "Week" && rxDate >= startOfWeek);
      return matchesText && matchesStatus && matchesDepartment && matchesTime;
    })
    .sort((a, b) => {
      if (queueSort === "Newest") return b.date.localeCompare(a.date);
      return a.date.localeCompare(b.date);
    });

  const queueStats = {
    pending: mockPrescriptions.filter((rx) => rx.status === "Pending").length,
    accepted: mockPrescriptions.filter((rx) => rx.status === "Accepted").length,
    rejected: mockPrescriptions.filter((rx) => rx.status === "Rejected").length,
  };

  // Dialog states
  const [rxOpen, setRxOpen] = React.useState(false);
  const [labOpen, setLabOpen] = React.useState(false);
  const [radOpen, setRadOpen] = React.useState(false);
  const [procOpen, setProcOpen] = React.useState(false);

  // Data
  const [rxByPatient, setRxByPatient] = React.useState<Record<string, RxEntry[]>>(INITIAL_RX_BY_PATIENT);
  const [labByPatient, setLabByPatient] = React.useState(INITIAL_LAB_ORDERS);
  const [radByPatient, setRadByPatient] = React.useState(INITIAL_RADIOLOGY_ORDERS);
  const [procByPatient, setProcByPatient] = React.useState(INITIAL_PROCEDURES);

  // Detail dialog state
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailData, setDetailData] = React.useState<any>(null);

  const medicationFormRef = React.useRef<CommonMedicationFormHandle>(null);

  const selectedPatient = MOCK_PATIENTS.find((p) => p.id === activePatientId)!;
  const patientRx = rxByPatient[activePatientId] ?? [];
  const patientLab = labByPatient[activePatientId] ?? [];
  const patientRad = radByPatient[activePatientId] ?? [];
  const patientProc = procByPatient[activePatientId] ?? [];

  const TAB_COUNTS = {
    prescriptions: patientRx.length,
    lab: patientLab.length,
    radiology: patientRad.length,
    procedures: patientProc.length,
  };

  const cardSx = {
    p: 2, borderRadius: 2.5, border: "1px solid",
    borderColor: alpha(theme.palette.primary.main, 0.14),
    background: theme.palette.background.paper,
    boxShadow: `0 2px 12px ${alpha(theme.palette.primary.main, 0.06)}`,
  };

  const tabs: { key: OrderTab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "prescriptions", label: "Prescriptions", icon: <MedicationIcon sx={{ fontSize: 16 }} />, color: "#fff" },
    { key: "lab", label: "Lab Orders", icon: <ScienceIcon sx={{ fontSize: 16 }} />, color: "#fff" },
    { key: "radiology", label: "Radiology", icon: <BiotechIcon sx={{ fontSize: 16 }} />, color: "#fff" },
    { key: "procedures", label: "Procedures", icon: <MedicalServicesIcon sx={{ fontSize: 16 }} />, color: "#fff" },
  ];

  const metrics = [
    { label: "Total Rx", value: Object.values(rxByPatient).flat().length, icon: <MedicationIcon />, color: "#6366f1" },
    { label: "Lab Orders", value: Object.values(labByPatient).flat().length, icon: <ScienceIcon />, color: "#0891b2" },
    { label: "Radiology", value: Object.values(radByPatient).flat().length, icon: <BiotechIcon />, color: "#7c3aed" },
    { label: "Procedures", value: Object.values(procByPatient).flat().length, icon: <MedicalServicesIcon />, color: "#059669" },
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

  const showDetails = (data: any) => {
    setDetailData(data);
    setDetailOpen(true);
  };

  const rxColumns: CommonColumn<RxEntry>[] = [
    { field: "drugName", headerName: "Medication", flex: 1, renderCell: (row) => <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.drugName}</Typography> },
    { field: "dose", headerName: "Dose", flex: 1, renderCell: (row) => <Typography variant="caption">{row.dose} {row.doseUnit}</Typography> },
    { field: "frequency", headerName: "Frequency", flex: 1 },
    { field: "duration", headerName: "Duration", flex: 1, renderCell: (row) => <Typography variant="caption">{row.duration} {row.durationUnit}</Typography> },
    { field: "status", headerName: "Status", flex: 1, renderCell: (row) => <StatusChip status={row.status} /> },
    {
      field: "actions",
      headerName: "Action",
      width: 120,
      renderCell: (row) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => showDetails(row)}>View</Button>
          <IconButton
            size="small"
            color="error"
            onClick={() =>
              setRxByPatient((prev) => ({
                ...prev,
                [activePatientId]: prev[activePatientId].filter((r) => r.id !== row.id),
              }))
            }
          >
            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const labColumns: CommonColumn<LabOrder>[] = [
    { field: "test", headerName: "Test Name", flex: 1, renderCell: (row) => <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.test}</Typography> },
    { field: "category", headerName: "Category", flex: 1 },
    { field: "priority", headerName: "Priority", flex: 1, renderCell: (row) => <PriorityChip priority={row.priority} /> },
    { field: "status", headerName: "Status", flex: 1, renderCell: (row) => <StatusChip status={row.status} /> },
    { field: "orderedAt", headerName: "Time", flex: 1 },
    {
      field: "actions",
      headerName: "Action",
      width: 120,
      renderCell: (row) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => showDetails(row)}>View</Button>
          <IconButton
            size="small"
            color="error"
            onClick={() =>
              setLabByPatient((prev) => ({
                ...prev,
                [activePatientId]: prev[activePatientId].filter((x) => x.id !== row.id),
              }))
            }
          >
            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const radColumns: CommonColumn<RadiologyOrder>[] = [
    { field: "study", headerName: "Study", flex: 1, renderCell: (row) => <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.study}</Typography> },
    { field: "modality", headerName: "Modality", flex: 1 },
    { field: "priority", headerName: "Priority", flex: 1, renderCell: (row) => <PriorityChip priority={row.priority} /> },
    { field: "status", headerName: "Status", flex: 1, renderCell: (row) => <StatusChip status={row.status} /> },
    { field: "orderedAt", headerName: "Time", flex: 1 },
    {
      field: "actions",
      headerName: "Action",
      width: 120,
      renderCell: (row) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => showDetails(row)}>View</Button>
          <IconButton
            size="small"
            color="error"
            onClick={() =>
              setRadByPatient((prev) => ({
                ...prev,
                [activePatientId]: prev[activePatientId].filter((x) => x.id !== row.id),
              }))
            }
          >
            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const procColumns: CommonColumn<ProcedureOrder>[] = [
    { field: "name", headerName: "Procedure", flex: 1, renderCell: (row) => <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.name}</Typography> },
    { field: "type", headerName: "Type", flex: 1 },
    { field: "priority", headerName: "Priority", flex: 1, renderCell: (row) => <PriorityChip priority={row.priority} /> },
    { field: "status", headerName: "Status", flex: 1, renderCell: (row) => <StatusChip status={row.status} /> },
    { field: "scheduledAt", headerName: "Schedule", flex: 1 },
    {
      field: "actions",
      headerName: "Action",
      width: 120,
      renderCell: (row) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => showDetails(row)}>View</Button>
          <IconButton
            size="small"
            color="error"
            onClick={() =>
              setProcByPatient((prev) => ({
                ...prev,
                [activePatientId]: prev[activePatientId].filter((x) => x.id !== row.id),
              }))
            }
          >
            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <PageTemplate title="Doctor's Orders" fullHeight>

      {/* Metrics */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 0 }}>
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
      <Stack direction={{ xs: "column", lg: "row" }} spacing={1.9} sx={{ flex: 1, minHeight: 0, height: "100%" }}>

        {/* LEFT: Doctor orders queue */}
        <Box sx={{ mt: 0.8, bgcolor: "#fff", borderRadius: 2, width: { xs: "100%", lg: 320 }, flexShrink: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Box sx={{ p: 0, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <Box sx={{ px: 2.5, py: 1.75, display: "flex", alignItems: "center", gap: 2, borderBottom: "1px solid", borderColor: "divider" }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.1 }}>Orders Queue</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block", fontWeight: 600 }}>Doctor Desk</Typography>
              </Box>
              <Box sx={{ ml: "auto" }}>
                <Badge badgeContent={queueStats.pending} color="warning" max={99}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: 1.5,
                      border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <FilterIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  </Box>
                </Badge>
              </Box>
            </Box>

            <Box sx={{ px: 2.5, py: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search patient or MRN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 2.5,
                    bgcolor: "#F8FAFC",
                    fontSize: 13,
                    "& fieldset": { borderColor: "#E2E8F0" },
                    "&:hover fieldset": { borderColor: alpha(theme.palette.primary.main, 0.35) },
                  },
                }}
                sx={{ mb: 2 }}
              />

              <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mb: 2 }}>
                {(["All", "Pending", "Accepted", "Rejected"] as const).map((status) => {
                  const active = statusFilter === status;
                  return (
                    <Box
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      sx={{
                        px: 1.25,
                        py: 0.45,
                        borderRadius: 2,
                        cursor: "pointer",
                        border: `1.5px solid ${active ? theme.palette.primary.main : "#E2E8F0"}`,
                        bgcolor: active ? alpha(theme.palette.primary.main, 0.12) : "transparent",
                        transition: "all 0.12s ease",
                      }}
                    >
                      <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: active ? theme.palette.primary.main : "text.secondary" }}>
                        {status}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>

            </Box>

            <Divider sx={{ borderColor: "#E2E8F0" }} />

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2.5, py: 1.25 }}>
              <Typography sx={{ fontSize: 11, color: "text.secondary", fontWeight: 600 }}>
                {filteredQueue.length} results
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.25} sx={{ cursor: "pointer" }} onClick={() => setQueueSort(queueSort === "Newest" ? "Oldest" : "Newest")}>
                <Typography sx={{ fontSize: 11, color: "text.secondary", fontWeight: 600 }}>{queueSort}</Typography>
                <ArrowDownIcon sx={{ fontSize: 14, color: "text.secondary" }} />
              </Stack>
            </Stack>

            <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2.5, pb: 2, minHeight: 0 }}>
              <Stack spacing={1.25}>
                {filteredQueue.map((rx) => {
                  const isActive = rx.patientId === activePatientId;
                  return (
                    <Box
                      key={rx.id}
                      onClick={() => {
                        setActivePatientId(rx.patientId);
                        setActiveTab("prescriptions");
                      }}
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        border: "1px solid",
                        borderColor: isActive ? theme.palette.primary.main : "#E2E8F0",
                        bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : theme.palette.background.paper,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        "&:hover": { boxShadow: `0 8px 18px ${alpha(theme.palette.primary.main, 0.08)}` },
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                          <Avatar sx={{ width: 40, height: 40, fontSize: 14, fontWeight: 700, bgcolor: theme.palette.primary.main }}>
                            {rx.patientName.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase()}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>{rx.patientName}</Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>{rx.mrn}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }} noWrap>
                              {rx.doctorName} · {rx.department}
                            </Typography>
                          </Box>
                        </Stack>
                        <StatusChip status={rx.status} />
                      </Stack>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1.25 }}>
                        {rx.items.slice(0, 2).map((item) => (
                          <Chip
                            key={item.id}
                            size="small"
                            label={item.name}
                            sx={{ fontSize: 11, fontWeight: 700, borderRadius: 1.75, bgcolor: "#F8FAFC" }}
                          />
                        ))}
                        {rx.items.length > 2 && (
                          <Chip size="small" label={`+${rx.items.length - 2}`} sx={{ fontSize: 11, fontWeight: 700, borderRadius: 1.75, bgcolor: "#F8FAFC" }} />
                        )}
                      </Box>
                    </Box>
                  );
                })}
                {filteredQueue.length === 0 && (
                  <Box sx={{ textAlign: "center", py: 6 }}>
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>No orders match the selected filters.</Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* RIGHT: Orders panel */}
        <Box sx={{ mt: 0.8, flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <Box sx={{ borderRadius: 2, p: 0, overflow: "hidden", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>

            {/* Patient header */}
            <Box sx={{ borderTopLeftRadius: 2, borderTopRightRadius: 2, px: 2.5, py: 1.8, background: `linear-gradient(115deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${theme.palette.background.paper} 60%)`, borderBottom: "1px solid", borderColor: "divider" }}>
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
                    if (activeTab === "prescriptions") setRxOpen(true);
                    else if (activeTab === "lab") setLabOpen(true);
                    else if (activeTab === "radiology") setRadOpen(true);
                    else setProcOpen(true);
                  }}
                  sx={{ flexShrink: 0, borderRadius: 2, px: 2 }}
                >
                  Add {activeTab === "prescriptions" ? "Medication" : activeTab === "lab" ? "Lab Order" : activeTab === "radiology" ? "Radiology Order" : "Procedure"}
                </Button>
              </Stack>
            </Box>

            {/* CustomCardTabs for Orders */}
            <CustomCardTabs
              key={activePatientId}
              defaultValue={tabs.findIndex((t) => t.key === activeTab)}
              onChange={(index) => setActiveTab(tabs[index].key)}
              tabsSx={{
                borderTopLeftRadius: 2, borderTopRightRadius: 12
              }}
              items={tabs.map((tab) => ({
                label: (
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <Typography sx={{ fontSize: 13, fontWeight: activeTab === tab.key ? 800 : 500 }}>
                      {tab.label}
                    </Typography>
                    <Chip
                      size="small"
                      label={TAB_COUNTS[tab.key]}
                      sx={{
                        height: 18,
                        fontSize: 10,
                        fontWeight: 700,
                        minWidth: 22,
                        borderRadius: "9px",
                        bgcolor: activeTab === tab.key
                          ? "primary.main"
                          : "action.selected",
                        color: activeTab === tab.key ? "#fff" : "text.secondary",
                        "& .MuiChip-label": { px: 0.8 },
                      }}
                    />
                  </Stack>
                ),
                icon: React.cloneElement(tab.icon as React.ReactElement, {
                  sx: { fontSize: 16, color: activeTab === tab.key ? tab.color : "inherit" },
                }),
                child: (
                  <Box sx={{ flex: 1, minHeight: 300, display: "flex", flexDirection: "column", }}>
                    {tab.key === "prescriptions" && (
                      <CommonDataGrid
                        rows={patientRx}
                        columns={rxColumns as any}
                        emptyTitle="No prescriptions yet"
                        emptyDescription='Click "+ Add Medication" to create a new prescription.'
                      />
                    )}
                    {tab.key === "lab" && (
                      <CommonDataGrid
                        rows={patientLab}
                        columns={labColumns as any}
                        hideToolbar
                        emptyTitle="No lab orders yet"
                        emptyDescription="Order lab tests to see them here."
                      />
                    )}
                    {tab.key === "radiology" && (
                      <CommonDataGrid
                        rows={patientRad}
                        columns={radColumns as any}
                        hideToolbar
                        emptyTitle="No radiology orders yet"
                        emptyDescription="Create radiology orders for imaging studies."
                      />
                    )}
                    {tab.key === "procedures" && (
                      <CommonDataGrid
                        rows={patientProc}
                        columns={procColumns as any}
                        hideToolbar
                        emptyTitle="No procedures ordered yet"
                        emptyDescription="Schedule procedures or consultants here."
                      />
                    )}
                  </Box>
                ),
              }))}
            />
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



      {/* ── Detail Dialog ────────────────────────────────────────────── */}
      <CommonDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Order Details"
        icon={<SearchIcon fontSize="small" />}
        maxWidth="xs"
        fullWidth
        content={
          detailData && (
            <Stack spacing={2} sx={{ py: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                  Item / Service
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 800 }}>
                  {detailData.drugName || detailData.test || detailData.study || detailData.name}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                    Category
                  </Typography>
                  <Typography variant="body2">{detailData.category || detailData.modality || detailData.type}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <StatusChip status={detailData.status} />
                  </Box>
                </Grid>
                {detailData.priority && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                      Priority
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <PriorityChip priority={detailData.priority} />
                    </Box>
                  </Grid>
                )}
                {detailData.frequency && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                      Frequency
                    </Typography>
                    <Typography variant="body2">{detailData.frequency}</Typography>
                  </Grid>
                )}
              </Grid>

              {(detailData.notes || detailData.instructions) && (
                <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", display: "block", mb: 0.5 }}>
                    Notes / Instructions
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                    {detailData.notes || detailData.instructions}
                  </Typography>
                </Box>
              )}
            </Stack>
          )
        }
        actions={<Button onClick={() => setDetailOpen(false)}>Close</Button>}
      />
    </PageTemplate>
  );
}
