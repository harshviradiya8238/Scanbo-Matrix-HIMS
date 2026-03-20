"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import { Card } from "@/src/ui/components/molecules";
import { alpha } from "@/src/ui/theme";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import {
  Bed as BedIcon,
  CheckCircle as CheckCircleIcon,
  CleaningServices as CleaningServicesIcon,
  Close as CloseIcon,
  Hotel as HotelIcon,
  Search as SearchIcon,
  SwapHoriz as SwapHorizIcon,
} from "@mui/icons-material";
import {
  BedStatus,
  DISCHARGE_CANDIDATES,
  INPATIENT_STAYS,
  INITIAL_BED_BOARD,
  WardBed,
} from "./ipd-mock-data";
import {
  IPD_COLORS,
  IpdMetricCard,
  IpdSectionCard,
  ipdFormStylesSx,
} from "./components/ipd-ui";
import IpdModuleTabs from "./components/IpdModuleTabs";
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
  { id: "waiting", label: "Waiting for Bed" },
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
      {
        field: "id",
        headerName: "Actions",
        width: 150,
        renderCell: (row) => (
          <Button
            size="small"
            variant="outlined"
            onClick={() => openClinicalCare(row.mrn, "rounds")}
          >
            Clinical Care
          </Button>
        ),
      },
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
        status,
        statusTone:
          status === "ICU"
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
  }, [selectedTopBarPatient]);

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
      <Stack spacing={2}>
        {!canManageBeds ? (
          <Alert severity="warning">
            You are in read-only mode for bed allocation. Contact admin for
            `ipd.beds.write` access.
          </Alert>
        ) : null}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <IpdMetricCard
              label="Occupancy"
              value={`${occupancyPercent}%`}
              trend={`${occupiedBeds} of ${totalBeds} beds occupied`}
              tone="info"
              icon={<HotelIcon sx={{ fontSize: 32 }} />}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <IpdMetricCard
              label="Available Beds"
              value={availableBeds}
              trend="Ready for new admissions"
              tone="success"
              icon={<CheckCircleIcon sx={{ fontSize: 32 }} />}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <IpdMetricCard
              label="Occupied Beds"
              value={occupiedBeds}
              trend="Inpatient census"
              tone="warning"
              icon={<BedIcon sx={{ fontSize: 32 }} />}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <IpdMetricCard
              label="Blocked / Cleaning"
              value={blockedBeds}
              trend="Temporarily unavailable"
              tone="danger"
              icon={<CleaningServicesIcon sx={{ fontSize: 32 }} />}
            />
          </Grid>
        </Grid>

        <Box sx={{ px: 1 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <IpdModuleTabs
                tabs={BED_CENSUS_TABS}
                value={activeTab}
                onChange={(value) => updateTabInRoute(value as BedCensusTab)}
              />
            </Box>
            <Button
              size="small"
              variant="outlined"
              onClick={() => openClinicalCare(undefined, "rounds")}
              sx={{
                alignSelf: { xs: "flex-end", md: "center" },
                flexShrink: 0,
                mb: { xs: 0.5, md: 0 },
              }}
            >
              Open Clinical Care
            </Button>
          </Stack>
        </Box>

        {activeTab === "bed-board" ? (
          <Grid container spacing={1}>
            <Grid item xs={12} lg={8}>
              <IpdSectionCard
                title="Bed Management"
                subtitle="Monitor occupancy, filter wards, and assign the right bed."
                bodySx={ipdFormStylesSx}
              >
                <Stack spacing={1.5}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                    sx={{ mb: 1 }}
                  >
                    <Stack
                      direction="row"
                      spacing={0.8}
                      sx={{ flexWrap: "wrap", gap: 0.8 }}
                    >
                      {["All", "Available", "Occupied", "Reserved", "ICU"].map(
                        (status) => {
                          const isSelected = statusFilter === status;
                          return (
                            <Button
                              key={status}
                              onClick={() => setStatusFilter(status as any)}
                              sx={{
                                borderRadius: 1.5,
                                px: 2,
                                py: 0.6,
                                minWidth: 0,
                                textTransform: "none",
                                fontWeight: 600,
                                bgcolor: isSelected ? "#1D4ED8" : "transparent",
                                color: isSelected
                                  ? "#ffffff"
                                  : "text.secondary",
                                "&:hover": {
                                  bgcolor: isSelected
                                    ? "#1e40af"
                                    : alpha("#000000", 0.04),
                                },
                              }}
                            >
                              {status}
                            </Button>
                          );
                        },
                      )}
                    </Stack>

                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <TextField
                        size="small"
                        select
                        value={wardFilter}
                        onChange={(event) => setWardFilter(event.target.value)}
                        sx={{
                          minWidth: 150,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,
                            bgcolor: "#f8fafc",
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
                        onChange={(event) => setSearch(event.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                          sx: { borderRadius: 1.5, bgcolor: "#f8fafc" },
                        }}
                      />
                    </Stack>
                  </Stack>

                  <Box
                    sx={{
                      display: "grid",
                      gap: 1.2,
                      gridTemplateColumns: {
                        xs: "repeat(2, minmax(0, 1fr))",
                        sm: "repeat(3, minmax(0, 1fr))",
                        md: "repeat(4, minmax(0, 1fr))",
                        lg: "repeat(6, minmax(0, 1fr))",
                      },
                      alignItems: "stretch",
                    }}
                  >
                    {filteredBedBoard.map((bed) => {
                      const isSelected = allocation.targetBedId === bed.id;
                      const isIcu = bed.isolation || bed.ward === "ICU";
                      const statusColor = isIcu
                        ? IMG_UI_COLORS.icu
                        : bedStatusColorMap[bed.status];

                      return (
                        <Box
                          key={bed.id}
                          sx={{ display: "flex", minWidth: 0, width: "100%" }}
                        >
                          <Card
                            elevation={0}
                            onClick={() => {
                              if (!canManageBeds) return;
                              updateAllocationField("targetBedId", bed.id);
                            }}
                            sx={{
                              p: 1.2,
                              pt: 1.5,
                              pb: 1.5,
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: isSelected
                                ? "#1D4ED8"
                                : alpha(statusColor, 0.4),
                              cursor: canManageBeds ? "pointer" : "default",
                              backgroundColor: isSelected
                                ? alpha("#1D4ED8", 0.05)
                                : "#ffffff",
                              transition: "all 0.15s ease-in-out",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "100%",
                              minHeight: 90,
                              position: "relative",
                              overflow: "hidden",
                              "&:hover": canManageBeds
                                ? {
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                  }
                                : undefined,
                            }}
                          >
                            <Box
                              sx={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: statusColor,
                              }}
                            />
                            <BedIcon
                              sx={{
                                color: statusColor,
                                fontSize: 28,
                                mb: 0.5,
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                color: "text.primary",
                                lineHeight: 1.2,
                              }}
                            >
                              {bed.bedNumber}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",
                                fontSize: "0.7rem",
                                mt: 0.2,
                                display: "-webkit-box",
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {bed.status === "Occupied"
                                ? (bed.patientName?.split(" ")[0] ?? "Occupied")
                                : bed.status}
                            </Typography>
                          </Card>
                        </Box>
                      );
                    })}
                  </Box>
                </Stack>
              </IpdSectionCard>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Stack spacing={2}>
                <IpdSectionCard
                  title="Allocation / Transfer"
                  subtitle="Assign beds for new admissions and clinical moves."
                >
                  <Stack spacing={1.2}>
                    <TextField
                      select
                      size="small"
                      label="Patient"
                      value={allocation.patientId}
                      onChange={(event) =>
                        updateAllocationField("patientId", event.target.value)
                      }
                      disabled={!canManageBeds}
                    >
                      <MenuItem value="" disabled>
                        Select patient
                      </MenuItem>
                      {ipdPatients.map((patient) => (
                        <MenuItem key={patient.id} value={patient.id}>
                          {patient.patientName} ({patient.mrn})
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      size="small"
                      label="Target Bed"
                      value={allocation.targetBedId}
                      onChange={(event) =>
                        updateAllocationField("targetBedId", event.target.value)
                      }
                      disabled={!canManageBeds}
                    >
                      {allocatableBeds.map((bed) => (
                        <MenuItem key={bed.id} value={bed.id}>
                          {bed.bedNumber} · {bed.ward} ({bed.status})
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      size="small"
                      label="Reason"
                      value={allocation.transferReason}
                      onChange={(event) =>
                        updateAllocationField(
                          "transferReason",
                          event.target.value,
                        )
                      }
                      disabled={!canManageBeds}
                    >
                      {[
                        "New Admission",
                        "Clinical Transfer",
                        "Infection Isolation",
                        "Patient Preference",
                      ].map((reason) => (
                        <MenuItem key={reason} value={reason}>
                          {reason}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      multiline
                      size="small"
                      minRows={2}
                      label="Notes"
                      value={allocation.notes}
                      onChange={(event) =>
                        updateAllocationField("notes", event.target.value)
                      }
                      disabled={!canManageBeds}
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={allocation.isolation}
                          onChange={(event) =>
                            updateAllocationField(
                              "isolation",
                              event.target.checked,
                            )
                          }
                          disabled={!canManageBeds}
                        />
                      }
                      label={
                        <Typography variant="body2">
                          Mark as isolation bed
                        </Typography>
                      }
                    />

                    {selectedPatient ? (
                      <Card
                        variant="outlined"
                        sx={{ p: 1.2, borderRadius: 1.5 }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Selected patient
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {selectedPatient.patientName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Current bed: {currentBed?.bedNumber ?? "Not assigned"}
                        </Typography>
                      </Card>
                    ) : null}

                    <Button
                      variant="contained"
                      startIcon={<SwapHorizIcon />}
                      onClick={handleAssignBed}
                      disabled={!canManageBeds}
                      sx={{
                        mt: 1,
                        background: `linear-gradient(135deg, ${IPD_COLORS.primary} 0%, ${IPD_COLORS.primaryLight} 100%)`,
                        "&:hover": {
                          background: `linear-gradient(135deg, ${IPD_COLORS.primaryLight} 0%, ${IPD_COLORS.primary} 100%)`,
                        },
                      }}
                    >
                      Confirm Allocation
                    </Button>

                    <Button
                      variant="outlined"
                      onClick={() =>
                        openClinicalCare(selectedPatient?.mrn, "rounds")
                      }
                    >
                      Continue to Rounds
                    </Button>
                    <Button
                      variant="outlined"
                      color="info"
                      onClick={() => setIsBedDetailsOpen(true)}
                      disabled={!allocation.targetBedId}
                    >
                      View Bed Details
                    </Button>
                  </Stack>
                </IpdSectionCard>
              </Stack>
            </Grid>
          </Grid>
        ) : null}

        {activeTab === "waiting" ? (
          <IpdSectionCard
            title="Waiting for Bed"
            subtitle="Admitted patients pending bed assignment."
          >
            <Stack spacing={1}>
              {waitingForBedRows.length === 0 ? (
                <Alert severity="success">
                  All admitted patients are already mapped to beds.
                </Alert>
              ) : (
                waitingForBedRows.map((patient) => (
                  <Card
                    key={patient.id}
                    variant="outlined"
                    sx={{ p: 1.2, borderRadius: 1.6 }}
                  >
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      spacing={1}
                      alignItems={{ xs: "flex-start", md: "center" }}
                    >
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700 }}
                        >
                          {patient.patientName} ({patient.mrn})
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {patient.ward || "Ward pending"} ·{" "}
                          {patient.consultant}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {patient.diagnosis ||
                            "Admission created. Awaiting bed allocation."}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.8} alignItems="center">
                        <Chip
                          size="small"
                          color="warning"
                          label="Bed Pending"
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={!canManageBeds}
                          onClick={() => {
                            updateAllocationField("patientId", patient.id);
                            updateTabInRoute("bed-board");
                          }}
                        >
                          Assign Bed
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>
                ))
              )}
            </Stack>
          </IpdSectionCard>
        ) : null}

        {activeTab === "inpatient-list" ? (
          // <IpdSectionCard
          //   title="Inpatient List"
          //   subtitle="Current census with bed and ward mapping."
          // >
          <CommonDataGrid<(typeof inpatientRows)[0]>
            rows={inpatientRows}
            columns={inpatientColumns}
            getRowId={(row) => row.id}
          />
        ) : // </IpdSectionCard>
        null}

        {activeTab === "transfers" ? (
          <IpdSectionCard
            title="Transfers"
            subtitle="Bed movement log and transfer workflow status."
          >
            <Stack spacing={1}>
              {movementLog.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No bed movement recorded.
                </Typography>
              ) : (
                movementLog.map((entry) => (
                  <Card
                    key={entry.id}
                    variant="outlined"
                    sx={{ p: 1.2, borderRadius: 1.6 }}
                  >
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700 }}
                        >
                          {entry.patientName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {entry.fromBed} {">"} {entry.toBed} · {entry.time}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
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
                    </Stack>
                  </Card>
                ))
              )}
            </Stack>
          </IpdSectionCard>
        ) : null}

        {activeTab === "isolation" ? (
          <IpdSectionCard
            title="Isolation Beds"
            subtitle="Isolation and ICU status view for infection-control readiness."
          >
            <Stack spacing={1}>
              {isolationRows.length === 0 ? (
                <Alert severity="info">
                  No isolation-designated beds are active right now.
                </Alert>
              ) : (
                isolationRows.map((bed) => (
                  <Card
                    key={bed.id}
                    variant="outlined"
                    sx={{ p: 1.2, borderRadius: 1.6 }}
                  >
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700 }}
                        >
                          {bed.bedNumber} · {bed.ward}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {bed.patientName ?? "No active patient"}{" "}
                          {bed.mrn ? `(${bed.mrn})` : ""}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
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
                        {bed.mrn ? (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => openClinicalCare(bed.mrn, "rounds")}
                          >
                            Clinical Care
                          </Button>
                        ) : null}
                      </Stack>
                    </Stack>
                  </Card>
                ))
              )}
            </Stack>
          </IpdSectionCard>
        ) : null}

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
