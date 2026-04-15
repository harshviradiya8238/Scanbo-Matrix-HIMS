"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import { alpha } from "@/src/ui/theme";
import {
  Bed as BedIcon,
  BugReport as BugReportIcon,
  CheckCircle as CheckCircleIcon,
  CleaningServices as CleaningServicesIcon,
  Close as CloseIcon,
  Hotel as HotelIcon,
  Search as SearchIcon,
  SwapHoriz as SwapHorizIcon,
} from "@mui/icons-material";
import { getActiveInfectionCaseByMrn } from "@/src/mocks/infection-control";
import {
  BedStatus,
  DISCHARGE_CANDIDATES,
  INPATIENT_STAYS,
  INITIAL_BED_BOARD,
  WardBed,
} from "./ipd-mock-data";
import { IPD_COLORS } from "./components/ipd-ui";
import { useMrnParam } from "@/src/core/patients/useMrnParam";
import { getPatientByMrn } from "@/src/mocks/global-patients";
import { usePermission } from "@/src/core/auth/usePermission";
import IpdPatientTopBar, {
  IpdPatientOption,
  IpdPatientTopBarField,
} from "./components/IpdPatientTopBar";
import {
  assignIpdEncounterBed,
  useIpdEncounters,
} from "./ipd-encounter-context";
import CommonDataGrid, {
  CommonColumn,
} from "@/src/components/table/CommonDataGrid";

interface BedAllocationForm {
  patientId: string;
  targetBedId: string;
  transferReason: string;
  notes: string;
  isolation: boolean;
}

interface BedMovementLog {
  id: string;
  patientName: string;
  action: "Allocation" | "Transfer";
  fromBed: string;
  toBed: string;
  time: string;
  operator: string;
}

type BedCensusTab =
  | "bed-board"
  | "waiting"
  | "inpatient-list"
  | "transfers"
  | "isolation";

interface BedPatient {
  id: string;
  mrn: string;
  patientName: string;
  consultant: string;
  diagnosis: string;
  ward: string;
  bed: string;
}

const BED_CENSUS_TABS: Array<{ id: BedCensusTab; label: string }> = [
  { id: "bed-board", label: "Bed Board" },
  { id: "inpatient-list", label: "Inpatient List" },
  { id: "transfers", label: "Transfers" },
  { id: "isolation", label: "Isolation" },
];

function isBedCensusTab(value: string | null): value is BedCensusTab {
  return value !== null && BED_CENSUS_TABS.some((tab) => tab.id === value);
}

const IMG_UI_COLORS = {
  available: "#22c55e",
  occupied: "#3b82f6",
  cleaning: "#9ca3af",
  reserved: "#f59e0b",
  maintenance: "#ef4444",
  icu: "#a855f7",
};

const bedStatusColorMap: Record<BedStatus, string> = {
  Available: IMG_UI_COLORS.available,
  Occupied: IMG_UI_COLORS.occupied,
  Cleaning: IMG_UI_COLORS.cleaning,
  Reserved: IMG_UI_COLORS.reserved,
  Blocked: IMG_UI_COLORS.maintenance,
};

const bedStatusBackgroundMap: Record<BedStatus, string> = {
  Available: alpha(IMG_UI_COLORS.available, 0.06),
  Occupied: alpha(IMG_UI_COLORS.occupied, 0.05),
  Cleaning: alpha(IMG_UI_COLORS.cleaning, 0.08),
  Reserved: alpha(IMG_UI_COLORS.reserved, 0.08),
  Blocked: alpha(IMG_UI_COLORS.maintenance, 0.08),
};

const INSURANCE_BY_PATIENT_ID: Record<string, string> = {
  "ipd-1": "Star Health",
  "ipd-2": "HDFC Ergo",
  "ipd-3": "New India Assurance",
  "ipd-4": "No Insurance",
};

const TOTAL_BILL_BY_PATIENT_ID: Record<string, number> = {
  "ipd-1": 67000,
  "ipd-2": 52000,
  "ipd-3": 182000,
  "ipd-4": 48000,
};

const INR_CURRENCY = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatNowTime(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function clearPatientData(bed: WardBed): WardBed {
  return {
    ...bed,
    patientId: undefined,
    patientName: undefined,
    mrn: undefined,
    diagnosis: undefined,
    isolation: false,
  };
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

export default function IpdBedManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mrnParam = useMrnParam();
  const patientIdParam = searchParams.get("patientId")?.trim() ?? "";
  const permissionGate = usePermission();
  const ipdEncounters = useIpdEncounters();
  const canManageBeds = permissionGate("ipd.beds.write");
  const canAccessClinical = permissionGate("ipd.rounds.write");
  const [bedBoard, setBedBoard] = React.useState<WardBed[]>(INITIAL_BED_BOARD);
  const [activeTab, setActiveTab] = React.useState<BedCensusTab>("bed-board");
  const [wardFilter, setWardFilter] = React.useState<"All" | string>("All");
  const [statusFilter, setStatusFilter] = React.useState<
    "All" | BedStatus | "ICU"
  >("All");
  const [search, setSearch] = React.useState("");
  const [allocation, setAllocation] = React.useState<BedAllocationForm>({
    patientId: "",
    targetBedId: "",
    transferReason: "New Admission",
    notes: "",
    isolation: false,
  });
  const [isBedDetailsOpen, setIsBedDetailsOpen] = React.useState(false);
  const [movementLog, setMovementLog] = React.useState<BedMovementLog[]>([
    {
      id: "log-1",
      patientName: "Sneha Patil",
      action: "Allocation",
      fromBed: "-",
      toBed: "A-04",
      time: "08:35 AM",
      operator: "Ward Desk",
    },
    {
      id: "log-2",
      patientName: "Rahul Menon",
      action: "Transfer",
      fromBed: "ER-OBS-02",
      toBed: "B-12",
      time: "09:12 AM",
      operator: "Bed Control",
    },
  ]);

  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const appliedPatientIdRef = React.useRef<string>("");
  const appliedMrnRef = React.useRef<string>("");

  React.useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (isBedCensusTab(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const ipdPatients = React.useMemo<BedPatient[]>(
    () =>
      ipdEncounters
        .filter((record) => record.workflowStatus !== "discharged")
        .map((record) => ({
          id: record.patientId,
          mrn: record.mrn,
          patientName: record.patientName,
          consultant: record.consultant,
          diagnosis: record.diagnosis,
          ward: record.ward,
          bed: record.bed,
        }))
        .sort((left, right) =>
          left.patientName.localeCompare(right.patientName),
        ),
    [ipdEncounters],
  );

  React.useEffect(() => {
    if (!allocation.patientId) return;
    if (ipdPatients.some((patient) => patient.id === allocation.patientId))
      return;
    setAllocation((prev) => ({ ...prev, patientId: "", targetBedId: "" }));
  }, [allocation.patientId, ipdPatients]);

  const selectedPatient = React.useMemo(
    () => ipdPatients.find((patient) => patient.id === allocation.patientId),
    [allocation.patientId, ipdPatients],
  );

  const currentBed = React.useMemo(
    () => bedBoard.find((bed) => bed.patientId === allocation.patientId),
    [bedBoard, allocation.patientId],
  );

  const seededPatient = getPatientByMrn(selectedPatient?.mrn ?? mrnParam);
  const displayMrn = selectedPatient?.mrn || seededPatient?.mrn || mrnParam;
  const activeInfectionCase = React.useMemo(
    () => getActiveInfectionCaseByMrn(displayMrn || ""),
    [displayMrn],
  );

  const wardOptions = React.useMemo(() => {
    const wards = new Set<string>();
    bedBoard.forEach((bed) => wards.add(bed.ward));
    return ["All", ...Array.from(wards).sort((a, b) => a.localeCompare(b))];
  }, [bedBoard]);

  const filteredBedBoard = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    return bedBoard.filter((bed) => {
      const matchesWard = wardFilter === "All" || bed.ward === wardFilter;
      const matchesStatus =
        statusFilter === "All"
          ? true
          : statusFilter === "ICU"
            ? bed.isolation || bed.ward === "ICU"
            : bed.status === statusFilter;
      const matchesSearch =
        query.length === 0 ||
        [
          bed.ward,
          bed.room,
          bed.bedNumber,
          bed.patientName ?? "",
          bed.mrn ?? "",
          bed.status,
          bed.bedType,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesWard && matchesStatus && matchesSearch;
    });
  }, [bedBoard, wardFilter, statusFilter, search]);

  const allocatableBeds = React.useMemo(
    () =>
      bedBoard.filter(
        (bed) =>
          bed.status === "Available" ||
          bed.status === "Reserved" ||
          bed.patientId === allocation.patientId,
      ),
    [bedBoard, allocation.patientId],
  );

  const totalBeds = bedBoard.length;
  const occupiedBeds = bedBoard.filter(
    (bed) => bed.status === "Occupied",
  ).length;
  const availableBeds = bedBoard.filter(
    (bed) => bed.status === "Available",
  ).length;
  const blockedBeds = bedBoard.filter(
    (bed) => bed.status === "Blocked" || bed.status === "Cleaning",
  ).length;

  const occupancyPercent =
    totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const waitingForBedRows = React.useMemo(() => {
    return ipdPatients.filter((patient) => {
      const alreadyAllocated = bedBoard.some(
        (bed) => bed.patientId === patient.id && bed.status === "Occupied",
      );
      return !alreadyAllocated;
    });
  }, [bedBoard, ipdPatients]);

  const inpatientRows = React.useMemo(() => {
    return ipdPatients.map((patient) => {
      const bed = bedBoard.find((entry) => entry.patientId === patient.id);
      return {
        ...patient,
        currentBed: bed?.bedNumber ?? patient.bed ?? "Not assigned",
        currentWard: bed?.ward ?? patient.ward ?? "--",
        status: bed?.status ?? "Occupied",
      };
    });
  }, [bedBoard, ipdPatients]);

  const isolationRows = React.useMemo(
    () => bedBoard.filter((bed) => bed.isolation || bed.ward === "ICU"),
    [bedBoard],
  );

  const updateTabInRoute = React.useCallback(
    (nextTab: BedCensusTab) => {
      setActiveTab(nextTab);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", nextTab);
      if (displayMrn) {
        params.set("mrn", displayMrn);
      }
      if (allocation.patientId) {
        params.set("patientId", allocation.patientId);
      }
      const query = params.toString();
      router.replace(query ? `/ipd/beds?${query}` : "/ipd/beds", {
        scroll: false,
      });
    },
    [allocation.patientId, displayMrn, router, searchParams],
  );

  const openClinicalCare = React.useCallback(
    (mrn?: string, tab: string = "rounds") => {
      const params = new URLSearchParams();
      const contextMrn = mrn || displayMrn;
      if (contextMrn) params.set("mrn", contextMrn);
      params.set("tab", tab);
      const query = params.toString();
      router.push(query ? `/ipd/rounds?${query}` : "/ipd/rounds");
    },
    [displayMrn, router],
  );

  const inpatientColumns = React.useMemo<
    CommonColumn<(typeof inpatientRows)[0]>[]
  >(
    () => [
      {
        field: "patientName",
        headerName: "Patient (MRN)",
        width: 280,
        renderCell: (row) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                bgcolor: alpha(IPD_COLORS.primary, 0.1),
                color: IPD_COLORS.primary,
                width: 36,
                height: 36,
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              {initials(row.patientName)}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {row.patientName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.mrn}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        field: "currentWard",
        headerName: "Ward & Bed",
        width: 180,
        renderCell: (row) => (
          <Typography variant="body2">
            {row.currentWard} · {row.currentBed}
          </Typography>
        ),
      },
      {
        field: "consultant",
        headerName: "Consultant",
        width: 200,
      },
      {
        field: "diagnosis",
        headerName: "Diagnosis",
        width: 220,
        renderCell: (row) => (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {row.diagnosis}
          </Typography>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 140,
        renderCell: (row) => (
          <Chip
            size="small"
            label={row.status}
            color={row.status === "Occupied" ? "warning" : "default"}
          />
        ),
      },
       ...(canAccessClinical
    ? [
        {
          field: "id",
          headerName: "Actions",
          width: 150,
          renderCell: (row: any) => (
            <Button
              size="small"
              variant="outlined"
              onClick={() => openClinicalCare(row.mrn, "rounds")}
            >
              Clinical Care
            </Button>
          ),
        },
      ]
    : []),
    ],
    [openClinicalCare],
  );

  const topBarPatientOptions = React.useMemo<IpdPatientOption[]>(() => {
    return ipdPatients.map((patient) => {
      const globalPatient = getPatientByMrn(patient.mrn);
      const stay = INPATIENT_STAYS.find(
        (row) => row.id === patient.id || row.mrn === patient.mrn,
      );
      const candidate = DISCHARGE_CANDIDATES.find(
        (row) => row.patientId === patient.id,
      );
      const bed = bedBoard.find((row) => row.patientId === patient.id);
      const status = patient.ward.toLowerCase().includes("icu")
        ? "ICU"
        : candidate
          ? "Discharge Due"
          : "Admitted";
      const tags = ["Admitted"];
      if (candidate) tags.push("Discharge Due");
      const infectionCase = getActiveInfectionCaseByMrn(patient.mrn);
      if (infectionCase) tags.push("Infection Control");
      if (
        patient.ward.toLowerCase().includes("icu") ||
        patient.bed.toLowerCase().includes("icu")
      )
        tags.push("ICU");

      return {
        patientId: patient.id,
        name: patient.patientName,
        mrn: patient.mrn,
        ageGender: stay?.ageGender ?? globalPatient?.ageGender ?? "--",
        ward: bed?.ward ?? patient.ward ?? "--",
        bed: bed?.bedNumber ?? patient.bed ?? "--",
        consultant: patient.consultant || "--",
        diagnosis: patient.diagnosis || "--",
        status: infectionCase ? "Infection Alert" : status,
        statusTone:
          infectionCase
            ? "error"
            : status === "ICU"
              ? "info"
              : status === "Discharge Due"
                ? "warning"
                : "success",
        insurance: INSURANCE_BY_PATIENT_ID[patient.id] ?? "--",
        totalBill: TOTAL_BILL_BY_PATIENT_ID[patient.id] ?? 0,
        tags,
      };
    });
  }, [bedBoard, ipdPatients]);

  const selectedTopBarPatient = React.useMemo(
    () =>
      selectedPatient
        ? (topBarPatientOptions.find(
          (row) => row.patientId === selectedPatient.id,
        ) ?? null)
        : (topBarPatientOptions[0] ?? null),
    [selectedPatient, topBarPatientOptions],
  );

  const topBarFields = React.useMemo<IpdPatientTopBarField[]>(() => {
    const activePatient = selectedTopBarPatient;
    if (!activePatient) return [];
    const stay = INPATIENT_STAYS.find(
      (row) =>
        row.id === activePatient.patientId || row.mrn === activePatient.mrn,
    );
    const candidate = DISCHARGE_CANDIDATES.find(
      (row) => row.patientId === activePatient.patientId,
    );
    const globalPatient = getPatientByMrn(activePatient.mrn);
    const allergies = globalPatient?.tags?.join(", ") || "No known";
    const status = activePatient.status ?? "Admitted";

    return [
      ...(activeInfectionCase
        ? [
          {
            id: "infection",
            label: "Infection",
            value: `${activeInfectionCase.organism} · ${activeInfectionCase.icStatus}`,
            tone: "error" as const,
          },
        ]
        : []),
      {
        id: "age-sex",
        label: "Age / Sex",
        value: stay?.ageGender ?? globalPatient?.ageGender ?? "--",
      },
      {
        id: "ward-bed",
        label: "Ward / Bed",
        value: `${activePatient.ward ?? "--"} · ${activePatient.bed ?? "--"}`,
      },
      { id: "admitted", label: "Admitted", value: stay?.admissionDate ?? "--" },
      {
        id: "los",
        label: "LOS",
        value: candidate ? `Day ${candidate.losDays}` : "--",
      },
      {
        id: "diagnosis",
        label: "Diagnosis",
        value: activePatient.diagnosis || "--",
      },
      {
        id: "consultant",
        label: "Consultant",
        value: activePatient.consultant || "--",
      },
      { id: "blood-group", label: "Blood Group", value: "--" },
      {
        id: "allergies",
        label: "Allergies",
        value: allergies,
        tone: allergies === "No known" ? "success" : "warning",
      },
      {
        id: "insurance",
        label: "Insurance",
        value: INSURANCE_BY_PATIENT_ID[activePatient.patientId] ?? "--",
        tone: "info",
      },
      {
        id: "status",
        label: "Status",
        value: status,
        tone: status === "Discharge Due" ? "warning" : "success",
      },
      {
        id: "total-bill",
        label: "Total Bill",
        value: INR_CURRENCY.format(
          TOTAL_BILL_BY_PATIENT_ID[activePatient.patientId] ?? 0,
        ),
        tone: "info",
      },
    ];
  }, [activeInfectionCase, selectedTopBarPatient]);

  const onTopBarSelectPatient = React.useCallback(
    (patientId: string) => {
      const patient = ipdPatients.find((row) => row.id === patientId);
      if (!patient) return;
      setAllocation((prev) => ({ ...prev, patientId, targetBedId: "" }));
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", activeTab);
      params.set("patientId", patientId);
      params.set("mrn", patient.mrn);
      const query = params.toString();
      router.replace(query ? `/ipd/beds?${query}` : "/ipd/beds", {
        scroll: false,
      });
    },
    [activeTab, ipdPatients, router, searchParams],
  );

  const topBarHeader = (
    <IpdPatientTopBar
      moduleTitle="IPD Bed & Census"
      sectionLabel="IPD"
      pageLabel="Bed & Census"
      patient={selectedTopBarPatient}
      fields={topBarFields}
      patientOptions={topBarPatientOptions}
      onSelectPatient={onTopBarSelectPatient}
    />
  );

  const updateAllocationField = <K extends keyof BedAllocationForm>(
    field: K,
    value: BedAllocationForm[K],
  ) => {
    setAllocation((prev) => ({ ...prev, [field]: value }));
  };

  React.useEffect(() => {
    if (!patientIdParam) return;
    if (appliedPatientIdRef.current === patientIdParam) return;
    const patient = ipdPatients.find((item) => item.id === patientIdParam);
    if (!patient) return;

    setAllocation((prev) => ({ ...prev, patientId: patient.id }));
    appliedPatientIdRef.current = patientIdParam;
  }, [patientIdParam, ipdPatients]);

  React.useEffect(() => {
    if (!mrnParam) return;
    const normalizedMrn = mrnParam.trim().toUpperCase();
    if (!normalizedMrn || appliedMrnRef.current === normalizedMrn) return;

    const patient = ipdPatients.find(
      (item) => item.mrn.trim().toUpperCase() === normalizedMrn,
    );
    const bed = bedBoard.find((item) => item.mrn === mrnParam);

    if (!patient && !bed) {
      // Keep waiting until encounter/bed state is ready for this MRN.
      return;
    }

    if (patient && !patientIdParam) {
      setAllocation((prev) => ({ ...prev, patientId: patient.id }));
    }
    if (bed) {
      setSearch(mrnParam);
      setWardFilter("All");
      setStatusFilter("All");
    }
    appliedMrnRef.current = normalizedMrn;
  }, [mrnParam, patientIdParam, ipdPatients, bedBoard]);

  const handleAssignBed = () => {
    if (!canManageBeds) {
      setSnackbar({
        open: true,
        message: "You do not have permission to allocate or transfer beds.",
        severity: "error",
      });
      return;
    }

    if (!selectedPatient) {
      setSnackbar({
        open: true,
        message: "Select a patient to allocate a bed.",
        severity: "error",
      });
      return;
    }

    if (!allocation.targetBedId) {
      setSnackbar({
        open: true,
        message: "Select a target bed for allocation or transfer.",
        severity: "error",
      });
      return;
    }

    const targetBed = bedBoard.find((bed) => bed.id === allocation.targetBedId);
    if (!targetBed) {
      setSnackbar({
        open: true,
        message: "Selected bed was not found.",
        severity: "error",
      });
      return;
    }

    if (currentBed?.id === targetBed.id) {
      setSnackbar({
        open: true,
        message: `${selectedPatient.patientName} is already in ${targetBed.bedNumber}.`,
        severity: "info",
      });
      return;
    }

    if (targetBed.status === "Blocked" || targetBed.status === "Cleaning") {
      setSnackbar({
        open: true,
        message: `${targetBed.bedNumber} is currently ${targetBed.status.toLowerCase()}.`,
        severity: "error",
      });
      return;
    }

    if (
      targetBed.status === "Occupied" &&
      targetBed.patientId !== selectedPatient.id
    ) {
      setSnackbar({
        open: true,
        message: `${targetBed.bedNumber} is occupied by another patient.`,
        severity: "error",
      });
      return;
    }

    setBedBoard((prev) =>
      prev.map((bed) => {
        if (bed.id === targetBed.id) {
          return {
            ...bed,
            status: "Occupied",
            patientId: selectedPatient.id,
            patientName: selectedPatient.patientName,
            mrn: selectedPatient.mrn,
            diagnosis: selectedPatient.diagnosis,
            isolation: allocation.isolation,
          };
        }

        if (bed.patientId === selectedPatient.id && bed.id !== targetBed.id) {
          return {
            ...clearPatientData(bed),
            status: "Cleaning",
          };
        }

        return bed;
      }),
    );

    const logEntry: BedMovementLog = {
      id: `log-${Date.now()}`,
      patientName: selectedPatient.patientName,
      action: currentBed ? "Transfer" : "Allocation",
      fromBed: currentBed?.bedNumber ?? "-",
      toBed: targetBed.bedNumber,
      time: formatNowTime(),
      operator: "Bed Control Desk",
    };

    setMovementLog((prev) => [logEntry, ...prev]);
    setAllocation((prev) => ({ ...prev, targetBedId: "", notes: "" }));
    assignIpdEncounterBed(
      selectedPatient.id,
      targetBed.bedNumber,
      targetBed.ward,
      selectedPatient.diagnosis,
    );

    setSnackbar({
      open: true,
      message: `${logEntry.action} completed for ${selectedPatient.patientName}.`,
      severity: "success",
    });
  };

  return (
    <PageTemplate
      title="Bed & Census"
      header={topBarHeader}
      currentPageTitle="Bed & Census"
    >
      <Stack spacing={1.5}>
        {!canManageBeds ? (
          <Alert severity="warning">
            You are in read-only mode for bed allocation. Contact admin for
            `ipd.beds.write` access.
          </Alert>
        ) : null}

        {activeInfectionCase ? (
          <Alert
            severity="warning"
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<BugReportIcon />}
                onClick={() =>
                  router.push(
                    `/clinical/modules/bugsy-infection-control?mrn=${encodeURIComponent(activeInfectionCase.mrn)}`,
                  )
                }
              >
                Open Case
              </Button>
            }
          >
            Active infection case: {activeInfectionCase.organism} ·{" "}
            {activeInfectionCase.icStatus} · {activeInfectionCase.isolationType}{" "}
            isolation.
          </Alert>
        ) : null}

        {/* ── Stats Row ── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2,1fr)", md: "repeat(4,1fr)" },
            gap: 1.5,
          }}
        >
          {/* Occupancy */}
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: "16px",
              border: "1px solid #DDE8F0",
              p: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                sx={{ fontSize: "11.5px", color: "#9AAFBF", mb: 0.75, fontWeight: 500 }}
              >
                Occupancy
              </Typography>
              <Typography
                sx={{ fontSize: 26, fontWeight: 700, lineHeight: 1, color: "#0D1B2A" }}
              >
                {occupancyPercent}%
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "#9AAFBF", mt: 0.5 }}>
                {occupiedBeds} of {totalBeds} beds occupied
              </Typography>
              <Box
                sx={{
                  height: 6,
                  bgcolor: "#DDE8F0",
                  borderRadius: 1,
                  overflow: "hidden",
                  mt: 0.75,
                  width: 120,
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    bgcolor: "#1172BA",
                    borderRadius: 1,
                    width: `${occupancyPercent}%`,
                  }}
                />
              </Box>
            </Box>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: "13px",
                bgcolor: "#DBEAFE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <HotelIcon sx={{ fontSize: 22, color: "#1172BA" }} />
            </Box>
          </Box>

          {/* Available */}
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: "16px",
              border: "1px solid #DDE8F0",
              p: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                sx={{ fontSize: "11.5px", color: "#9AAFBF", mb: 0.75, fontWeight: 500 }}
              >
                Available Beds
              </Typography>
              <Typography
                sx={{ fontSize: 26, fontWeight: 700, lineHeight: 1, color: "#16A34A" }}
              >
                {availableBeds}
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "#9AAFBF", mt: 0.5 }}>
                Ready for new admissions
              </Typography>
            </Box>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: "13px",
                bgcolor: "#DCFCE7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 22, color: "#16A34A" }} />
            </Box>
          </Box>

          {/* Occupied */}
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: "16px",
              border: "1px solid #DDE8F0",
              p: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                sx={{ fontSize: "11.5px", color: "#9AAFBF", mb: 0.75, fontWeight: 500 }}
              >
                Occupied Beds
              </Typography>
              <Typography
                sx={{ fontSize: 26, fontWeight: 700, lineHeight: 1, color: "#0D1B2A" }}
              >
                {occupiedBeds}
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "#9AAFBF", mt: 0.5 }}>
                Inpatient census
              </Typography>
            </Box>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: "13px",
                bgcolor: "#FEF3C7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <BedIcon sx={{ fontSize: 22, color: "#D97706" }} />
            </Box>
          </Box>

          {/* Blocked / Cleaning */}
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: "16px",
              border: "1px solid #DDE8F0",
              p: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                sx={{ fontSize: "11.5px", color: "#9AAFBF", mb: 0.75, fontWeight: 500 }}
              >
                Blocked / Cleaning
              </Typography>
              <Typography
                sx={{ fontSize: 26, fontWeight: 700, lineHeight: 1, color: "#DC2626" }}
              >
                {blockedBeds}
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "#9AAFBF", mt: 0.5 }}>
                Temporarily unavailable
              </Typography>
            </Box>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: "13px",
                bgcolor: "#FEE2E2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CleaningServicesIcon sx={{ fontSize: 22, color: "#DC2626" }} />
            </Box>
          </Box>
        </Box>

        {/* ── Body: Bed Board + Allocation Panel ── */}
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>

          {/* BED BOARD */}
          <Box
            sx={{
              flex: 1,
              bgcolor: "#fff",
              borderRadius: "20px",
              border: "1px solid #DDE8F0",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minWidth: 0,
            }}
          >
            {/* Header */}
            <Box sx={{ p: "16px 20px", borderBottom: "1px solid #DDE8F0" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1.75,
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#0D1B2A" }}>
                    Bed Management
                  </Typography>
                  <Typography sx={{ fontSize: "11.5px", color: "#9AAFBF", mt: 0.25 }}>
                    Monitor occupancy, filter wards, and assign the right bed.
                  </Typography>
                </Box>
                {canAccessClinical && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => openClinicalCare(undefined, "rounds")}
                    sx={{
                      borderRadius: "10px",
                      px: 2.25,
                      py: 1,
                      fontWeight: 700,
                      fontSize: "12.5px",
                      textTransform: "none",
                      background: "#1172BA",
                      flexShrink: 0,
                      "&:hover": { background: "#0D5A94" },
                    }}
                  >
                    Open Clinical Care
                  </Button>
                )}
              </Box>

              {/* Toolbar */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {(["All", "Available", "Occupied", "Reserved", "ICU"] as const).map(
                    (f) => {
                      const isOn = statusFilter === f;
                      return (
                        <Box
                          key={f}
                          onClick={() => setStatusFilter(f as any)}
                          sx={{
                            px: 1.75,
                            py: 0.75,
                            borderRadius: "20px",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            border: "1.5px solid",
                            borderColor: isOn ? "#0A4472" : "#DDE8F0",
                            bgcolor: isOn ? "#0A4472" : "#F5F8FB",
                            color: isOn ? "#fff" : "#5A7184",
                            transition: "all .15s",
                            userSelect: "none",
                            "&:hover": isOn
                              ? {}
                              : { borderColor: "#5BA4D4", color: "#1172BA" },
                          }}
                        >
                          {f}
                        </Box>
                      );
                    },
                  )}
                </Box>

                <TextField
                  select
                  size="small"
                  value={wardFilter}
                  onChange={(e) => setWardFilter(e.target.value)}
                  sx={{
                    minWidth: 150,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      bgcolor: "#F5F8FB",
                      fontSize: "12.5px",
                      "& fieldset": {
                        borderColor: "#DDE8F0",
                        borderWidth: "1.5px",
                      },
                    },
                  }}
                >
                  {wardOptions.map((ward) => (
                    <MenuItem key={ward} value={ward}>
                      {ward}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  size="small"
                  placeholder="Search bed or patient..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: "#9AAFBF" }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: "10px",
                      bgcolor: "#F5F8FB",
                      fontSize: "12.5px",
                      "& fieldset": {
                        borderColor: "#DDE8F0",
                        borderWidth: "1.5px",
                      },
                    },
                  }}
                  sx={{ minWidth: 200 }}
                />
              </Box>
            </Box>

            {/* Tab bar */}
            <Box
              sx={{
                display: "flex",
                gap: 0.375,
                px: 2.5,
                py: 0.875,
                borderBottom: "1px solid #DDE8F0",
              }}
            >
              {BED_CENSUS_TABS.map((tab) => (
                <Box
                  key={tab.id}
                  onClick={() => updateTabInRoute(tab.id)}
                  sx={{
                    px: 2,
                    py: 0.875,
                    borderRadius: "10px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    bgcolor: activeTab === tab.id ? "#1172BA" : "transparent",
                    color: activeTab === tab.id ? "#fff" : "#5A7184",
                    transition: "all .15s",
                    userSelect: "none",
                    "&:hover":
                      activeTab !== tab.id
                        ? { bgcolor: "#F5F8FB", color: "#0D1B2A" }
                        : {},
                  }}
                >
                  {tab.label}
                </Box>
              ))}
            </Box>

            {/* Tab content */}
            <Box sx={{ p: activeTab === "inpatient-list" ? 0 : 2.5 }}>
              {/* BED BOARD TAB */}
              {activeTab === "bed-board" && (
                <Box
                  sx={{
                    display: "grid",
                    gap: 1.25,
                    gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                  }}
                >
                  {filteredBedBoard.map((bed) => {
                    const isIcu = bed.isolation || bed.ward === "ICU";
                    const isSelected = allocation.targetBedId === bed.id;

                    const getBedStyle = (): {
                      border: string;
                      bg: string;
                      dot: string;
                    } => {
                      if (isIcu)
                        return {
                          border: "#C4B5FD",
                          bg: "#FAF5FF",
                          dot: "#7C3AED",
                        };
                      const map: Record<
                        BedStatus,
                        { border: string; bg: string; dot: string }
                      > = {
                        Occupied: {
                          border: "#BFDBFE",
                          bg: "#EFF6FF",
                          dot: "#1172BA",
                        },
                        Available: {
                          border: "#86EFAC",
                          bg: "#F0FFF4",
                          dot: "#16A34A",
                        },
                        Cleaning: {
                          border: "#D1D5DB",
                          bg: "#F9FAFB",
                          dot: "#6B7280",
                        },
                        Reserved: {
                          border: "#FDE68A",
                          bg: "#FFFBEB",
                          dot: "#D97706",
                        },
                        Blocked: {
                          border: "#FCA5A5",
                          bg: "#FFF5F5",
                          dot: "#DC2626",
                        },
                      };
                      return (
                        map[bed.status] ?? {
                          border: "#DDE8F0",
                          bg: "#F5F8FB",
                          dot: "#9AAFBF",
                        }
                      );
                    };

                    const { border, bg, dot } = getBedStyle();
                    const patientLabel =
                      bed.status === "Occupied"
                        ? (bed.patientName?.split(" ")[0] ?? "Occupied")
                        : bed.status;

                    const labelColor =
                      bed.status === "Available"
                        ? "#16A34A"
                        : bed.status === "Cleaning"
                          ? "#6B7280"
                          : bed.status === "Reserved"
                            ? "#D97706"
                            : bed.status === "Blocked"
                              ? "#DC2626"
                              : isIcu
                                ? "#7C3AED"
                                : "#5A7184";

                    return (
                      <Box
                        key={bed.id}
                        onClick={() =>
                          canManageBeds &&
                          updateAllocationField("targetBedId", bed.id)
                        }
                        sx={{
                          borderRadius: "16px",
                          border: "2px solid",
                          borderColor: isSelected ? "#1172BA" : border,
                          bgcolor: isSelected ? "#E8F3FB" : bg,
                          p: "14px 12px",
                          cursor: canManageBeds ? "pointer" : "default",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 1,
                          transition: "all .15s",
                          position: "relative",
                          textAlign: "center",
                          "&:hover": canManageBeds
                            ? { borderColor: "#5BA4D4", bgcolor: "#E8F3FB" }
                            : {},
                        }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            width: 9,
                            height: 9,
                            borderRadius: "50%",
                            bgcolor: dot,
                          }}
                        />
                        <BedIcon sx={{ fontSize: 28, color: dot }} />
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#0D1B2A",
                            lineHeight: 1.2,
                          }}
                        >
                          {bed.bedNumber}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 11,
                            color: labelColor,
                            fontWeight: bed.status !== "Occupied" ? 600 : 400,
                            mt: 0.125,
                          }}
                        >
                          {patientLabel}
                        </Typography>
                      </Box>
                    );
                  })}
                  {filteredBedBoard.length === 0 && (
                    <Box sx={{ gridColumn: "1 / -1", py: 6, textAlign: "center" }}>
                      <Typography sx={{ color: "#9AAFBF", fontSize: 13 }}>
                        No beds match the current filter.
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* INPATIENT LIST TAB */}
              {activeTab === "inpatient-list" && (
                <CommonDataGrid<(typeof inpatientRows)[0]>
                  rows={inpatientRows}
                  columns={inpatientColumns}
                  getRowId={(row) => row.id}
                  paperSx={{
                    border: "none",
                    borderRadius: 0,
                    boxShadow: "none",
                    borderTop: "1px solid #DDE8F0",
                  }}
                />
              )}

              {/* TRANSFERS TAB */}
              {activeTab === "transfers" && (
                <Stack spacing={1}>
                  {movementLog.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No bed movement recorded.
                    </Typography>
                  ) : (
                    movementLog.map((entry) => (
                      <Box
                        key={entry.id}
                        sx={{
                          p: 1.75,
                          borderRadius: "14px",
                          border: "1.5px solid #DDE8F0",
                          bgcolor: "#fff",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                            {entry.patientName}
                          </Typography>
                          <Typography
                            sx={{ fontSize: "11.5px", color: "#5A7184" }}
                          >
                            {entry.fromBed} → {entry.toBed} · {entry.time}
                          </Typography>
                          <Typography sx={{ fontSize: "11px", color: "#9AAFBF" }}>
                            Handled by {entry.operator}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          color={
                            entry.action === "Transfer" ? "warning" : "success"
                          }
                          label={entry.action}
                        />
                      </Box>
                    ))
                  )}
                </Stack>
              )}

              {/* ISOLATION TAB */}
              {activeTab === "isolation" && (
                <Stack spacing={1}>
                  {isolationRows.length === 0 ? (
                    <Alert severity="info">
                      No isolation-designated beds are active right now.
                    </Alert>
                  ) : (
                    isolationRows.map((bed) => (
                      <Box
                        key={bed.id}
                        sx={{
                          p: 1.75,
                          borderRadius: "14px",
                          border: "1.5px solid #DDE8F0",
                          bgcolor: "#fff",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                            {bed.bedNumber} · {bed.ward}
                          </Typography>
                          <Typography
                            sx={{ fontSize: "11.5px", color: "#5A7184" }}
                          >
                            {bed.patientName ?? "No active patient"}
                            {bed.mrn ? ` (${bed.mrn})` : ""}
                          </Typography>
                          <Typography sx={{ fontSize: "11px", color: "#9AAFBF" }}>
                            {bed.diagnosis ?? "No diagnosis captured"} ·{" "}
                            {bed.status}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={0.8} alignItems="center">
                          <Chip
                            size="small"
                            color={bed.isolation ? "warning" : "default"}
                            label={bed.isolation ? "Isolation" : "ICU Monitor"}
                          />
                          {bed.mrn && canAccessClinical ? (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => openClinicalCare(bed.mrn, "rounds")}
                            >
                              Clinical Care
                            </Button>
                          ) : null}
                        </Stack>
                      </Box>
                    ))
                  )}
                </Stack>
              )}
            </Box>
          </Box>

          {/* ── ALLOCATION PANEL ── */}
          <Box
            sx={{
              width: 272,
              minWidth: 272,
              bgcolor: "#fff",
              borderRadius: "20px",
              border: "1px solid #DDE8F0",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <Box sx={{ p: "16px 18px", borderBottom: "1px solid #DDE8F0" }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#0D1B2A" }}>
                Allocation / Transfer
              </Typography>
              <Typography sx={{ fontSize: "11.5px", color: "#9AAFBF", mt: 0.25 }}>
                Assign beds for new admissions and clinical moves.
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                p: "16px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              {/* Patient */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".5px",
                    color: "#9AAFBF",
                  }}
                >
                  Patient
                </Typography>
                <TextField
                  select
                  size="small"
                  value={allocation.patientId}
                  onChange={(e) =>
                    updateAllocationField("patientId", e.target.value)
                  }
                  disabled={!canManageBeds}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      bgcolor: "#F5F8FB",
                      fontSize: "12.5px",
                      "& fieldset": {
                        borderColor: "#DDE8F0",
                        borderWidth: "1.5px",
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    Select patient...
                  </MenuItem>
                  {ipdPatients.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.patientName} — {p.mrn}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Target Bed */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".5px",
                    color: "#9AAFBF",
                  }}
                >
                  Target Bed
                </Typography>
                <TextField
                  select
                  size="small"
                  value={allocation.targetBedId}
                  onChange={(e) =>
                    updateAllocationField("targetBedId", e.target.value)
                  }
                  disabled={!canManageBeds}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      bgcolor: "#F5F8FB",
                      fontSize: "12.5px",
                      "& fieldset": {
                        borderColor: "#DDE8F0",
                        borderWidth: "1.5px",
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    Select bed...
                  </MenuItem>
                  {allocatableBeds.map((bed) => (
                    <MenuItem key={bed.id} value={bed.id}>
                      {bed.bedNumber} · {bed.ward} ({bed.status})
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Reason */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".5px",
                    color: "#9AAFBF",
                  }}
                >
                  Reason
                </Typography>
                <TextField
                  select
                  size="small"
                  value={allocation.transferReason}
                  onChange={(e) =>
                    updateAllocationField("transferReason", e.target.value)
                  }
                  disabled={!canManageBeds}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      bgcolor: "#F5F8FB",
                      fontSize: "12.5px",
                      "& fieldset": {
                        borderColor: "#DDE8F0",
                        borderWidth: "1.5px",
                      },
                    },
                  }}
                >
                  {[
                    "New Admission",
                    "Transfer",
                    "Upgrade",
                    "Clinical Requirement",
                    "Isolation Protocol",
                  ].map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Notes */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".5px",
                    color: "#9AAFBF",
                  }}
                >
                  Notes
                </Typography>
                <TextField
                  multiline
                  size="small"
                  minRows={3}
                  placeholder="Add clinical notes or instructions..."
                  value={allocation.notes}
                  onChange={(e) => updateAllocationField("notes", e.target.value)}
                  disabled={!canManageBeds}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      bgcolor: "#F5F8FB",
                      fontSize: "12.5px",
                      "& fieldset": {
                        borderColor: "#DDE8F0",
                        borderWidth: "1.5px",
                      },
                    },
                  }}
                />
              </Box>

              {/* Isolation toggle */}
              <Box
                onClick={() =>
                  canManageBeds &&
                  updateAllocationField("isolation", !allocation.isolation)
                }
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: "10px 12px",
                  bgcolor: "#F5F8FB",
                  borderRadius: "10px",
                  border: "1.5px solid",
                  borderColor: allocation.isolation ? "#1172BA" : "#DDE8F0",
                  cursor: canManageBeds ? "pointer" : "default",
                  transition: "border-color .15s",
                  "&:hover": canManageBeds
                    ? { borderColor: "#5BA4D4" }
                    : {},
                }}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: "4px",
                    border: "2px solid",
                    borderColor: allocation.isolation ? "#1172BA" : "#DDE8F0",
                    bgcolor: allocation.isolation ? "#1172BA" : "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all .15s",
                  }}
                >
                  {allocation.isolation && (
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 10 10"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                    >
                      <path d="M2 5l2.5 2.5L8 3" />
                    </svg>
                  )}
                </Box>
                <Typography
                  sx={{ fontSize: "12.5px", fontWeight: 600, color: "#0D1B2A" }}
                >
                  Mark as isolation bed
                </Typography>
              </Box>

              {/* Selected patient summary */}
              {selectedPatient && (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: "10px",
                    border: "1.5px solid #DDE8F0",
                    bgcolor: "#F5F8FB",
                  }}
                >
                  <Typography
                    sx={{ fontSize: 10, color: "#9AAFBF", fontWeight: 600 }}
                  >
                    Selected patient
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                    {selectedPatient.patientName}
                  </Typography>
                  <Typography sx={{ fontSize: "11px", color: "#5A7184" }}>
                    Current bed: {currentBed?.bedNumber ?? "Not assigned"}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Footer buttons */}
            <Box
              sx={{
                p: "14px 18px",
                borderTop: "1px solid #DDE8F0",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <Button
                variant="contained"
                fullWidth
                onClick={handleAssignBed}
                disabled={!canManageBeds}
                startIcon={<SwapHorizIcon />}
                sx={{
                  py: 1.375,
                  borderRadius: "12px",
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "none",
                  background: "#1172BA",
                  "&:hover": { background: "#0D5A94" },
                }}
              >
                Confirm Allocation
              </Button>
              {canAccessClinical && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() =>
                    openClinicalCare(selectedPatient?.mrn, "rounds")
                  }
                  sx={{
                    py: 1.25,
                    borderRadius: "12px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    textTransform: "none",
                    borderColor: "#DDE8F0",
                    color: "#5A7184",
                    "&:hover": { bgcolor: "#F5F8FB" },
                  }}
                >
                  Continue to Rounds
                </Button>
              )}
              <Button
                variant="text"
                fullWidth
                onClick={() => setIsBedDetailsOpen(true)}
                disabled={!allocation.targetBedId}
                sx={{
                  py: 1,
                  borderRadius: "10px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  textTransform: "none",
                  color: "#9AAFBF",
                  "&:hover": { color: "#1172BA" },
                }}
              >
                View Bed Details
              </Button>
            </Box>
          </Box>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3200}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
        <Dialog
          open={isBedDetailsOpen}
          onClose={() => setIsBedDetailsOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3, p: 2 },
          }}
        >
          <DialogContent sx={{ p: 0 }}>
            <Box
              sx={{
                pb: 1,
                borderBottom: "1px solid",
                borderColor: "grey.100",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: "text.primary",
                }}
              >
                BED DETAIL
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 600 }}
                >
                  {allocation.targetBedId
                    ? bedBoard.find((b) => b.id === allocation.targetBedId)
                      ?.bedNumber
                    : "--"}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setIsBedDetailsOpen(false)}
                  sx={{ color: "text.secondary", ml: 1, padding: 0.5 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
            <Box sx={{ pt: 3 }}>
              {(() => {
                const selGridBed = bedBoard.find(
                  (b) => b.id === allocation.targetBedId,
                );
                return selGridBed ? (
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      {selGridBed.status === "Occupied" &&
                        selGridBed.patientName ? (
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: "#3b82f6",
                            fontWeight: 600,
                            fontSize: "1.2rem",
                            color: "white",
                          }}
                        >
                          {initials(selGridBed.patientName)}
                        </Avatar>
                      ) : (
                        <Avatar
                          sx={{ width: 48, height: 48, bgcolor: "grey.100" }}
                        >
                          <BedIcon
                            sx={{
                              fontSize: 24,
                              color:
                                bedStatusColorMap[selGridBed.status] ||
                                "grey.400",
                            }}
                          />
                        </Avatar>
                      )}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 700,
                            color: "text.primary",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {selGridBed.status === "Occupied"
                            ? selGridBed.patientName
                            : selGridBed.bedNumber}
                        </Typography>
                        {selGridBed.status === "Occupied" && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block" }}
                          >
                            {(selGridBed as any)?.age || "44"}M ·{" "}
                            {selGridBed.diagnosis || "Pneumonia"}
                          </Typography>
                        )}
                      </Box>
                    </Stack>

                    <Box>
                      <Chip
                        label={selGridBed.status}
                        size="small"
                        sx={{
                          bgcolor: alpha(
                            bedStatusColorMap[selGridBed.status] || "#ccc",
                            0.1,
                          ),
                          color:
                            bedStatusColorMap[selGridBed.status] || "grey.700",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          borderRadius: 1.5,
                        }}
                      />
                    </Box>

                    <Divider sx={{ my: 0.5 }} />

                    {selGridBed.status === "Occupied" ? (
                      <>
                        <Stack spacing={1.5}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Admitted
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "text.primary" }}
                            >
                              14 Mar
                            </Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Doctor
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "text.primary" }}
                            >
                              {(selGridBed as any).consultant || "Dr. Chen"}
                            </Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Diagnosis
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "text.primary" }}
                            >
                              {selGridBed.diagnosis || "Pneumonia"}
                            </Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Notes
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: "text.primary",
                                textAlign: "right",
                                maxWidth: "60%",
                              }}
                            >
                              Antibiotics commenced
                            </Typography>
                          </Stack>
                        </Stack>

                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Box
                            sx={{
                              flex: 1,
                              bgcolor: "#f8fafc",
                              p: 1,
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: "grey.200",
                              textAlign: "center",
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 700, color: "text.primary" }}
                            >
                              116/74
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "grey.400", fontSize: "0.65rem" }}
                            >
                              BP mmHg
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              flex: 1,
                              bgcolor: "#f8fafc",
                              p: 1,
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: "grey.200",
                              textAlign: "center",
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 700, color: "text.primary" }}
                            >
                              88
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "grey.400", fontSize: "0.65rem" }}
                            >
                              HR bpm
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              flex: 1,
                              bgcolor: "#f8fafc",
                              p: 1,
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: "grey.200",
                              textAlign: "center",
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 700, color: "text.primary" }}
                            >
                              95%
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "grey.400", fontSize: "0.65rem" }}
                            >
                              SpO2
                            </Typography>
                          </Box>
                        </Stack>

                        {/* <Stack spacing={1} sx={{ mt: 2 }}>
                          <Button
                            variant="contained"
                            sx={{
                              bgcolor: "#1d4ed8",
                              color: "white",
                              borderRadius: 1.5,
                              py: 1,
                              textTransform: "none",
                              fontWeight: 600,
                              "&:hover": { bgcolor: "#1e40af" },
                            }}
                          >
                            View Full Record
                          </Button>
                          <Button
                            variant="outlined"
                            sx={{
                              borderColor: "grey.300",
                              color: "text.primary",
                              borderRadius: 1.5,
                              py: 1,
                              textTransform: "none",
                              fontWeight: 600,
                            }}
                          >
                            Transfer Patient
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            sx={{
                              borderColor: alpha("#ef4444", 0.3),
                              color: "#ef4444",
                              borderRadius: 1.5,
                              py: 1,
                              textTransform: "none",
                              fontWeight: 600,
                              bgcolor: alpha("#ef4444", 0.05),
                            }}
                          >
                            Initiate Discharge
                          </Button>
                        </Stack> */}
                      </>
                    ) : (
                      <>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 2, mb: 2 }}
                        >
                          No patient currently assigned to this bed.
                        </Typography>
                      </>
                    )}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Select a bed from the board to view details or manage
                    allocation.
                  </Typography>
                );
              })()}
            </Box>
          </DialogContent>
        </Dialog>
      </Stack>
    </PageTemplate>
  );
}
