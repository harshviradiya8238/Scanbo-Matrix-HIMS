"use client";

import * as React from "react";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { CustomCardTabs } from "@/src/ui/components/molecules";
import type {} from "@/src/ui/components/molecules/CommonTable";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  AddCircleOutline as AddCircleOutlineIcon,
  ArrowBack as ArrowBackIcon,
  FactCheck as FactCheckIcon,
  LocalHospital as LocalHospitalIcon,
  MonitorHeart as MonitorHeartIcon,
  Print as PrintIcon,
  Save as SaveIcon,
  Schedule as ScheduleIcon,
  TaskAlt as TaskAltIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";

import {
  getCaseBoardColumns,
  getCountColumns,
  getMedicationColumns,
  getDischargeMedicationColumns,
  OpTimeDialogs,
  OpTimeBoard,
  OpTimeWorkspaceHeader,
  PreOpWorkspacePanel,
  IntraOpWorkspacePanel,
  PostOpWorkspacePanel,
} from "./components";

import {
  WorkspaceTab,
  ViewMode,
  OtCase,
  ScheduleForm,
  InstrumentCountRow,
  MedicationRow,
  DischargeMedicationRow,
  VitalReading,
  PreOpChecklistItemState,
  ROOM_OPTIONS,
  PREOP_CHECKLIST_ITEMS,
  INITIAL_CASES,
  mapStatusToWorkspaceTab,
  buildChecklistStateForCase,
  formatChecklistTimeNow,
  INTRAOP_TIMELINE,
  defaultScheduleForm,
} from "./OpTimeData";

import AddDischargeMedicationModal from "./components/dialogs/AddDischargeMedicationModal";
import AddIntraOpEventModal, { IntraOpEventForm } from "./components/dialogs/AddIntraOpEventModal";
import AddIntraOpMedicationModal, { IntraOpMedicationForm } from "./components/dialogs/AddIntraOpMedicationModal";
import VerifyInstrumentCountModal from "./components/dialogs/VerifyInstrumentCountModal";
import type { MedicationForm } from "@/src/ui/components/forms/CommonMedicationForm";
import { useSnackbar } from "@/src/ui/components/molecules/Snackbarcontext";

export default function OpTimeSurgeryPage() {
  const theme = useTheme();

  const [cases, setCases] = React.useState<OtCase[]>(INITIAL_CASES);
  const [selectedCaseId, setSelectedCaseId] = React.useState<string>(
    INITIAL_CASES[1]?.id ?? "",
  );
  const [viewMode, setViewMode] = React.useState<ViewMode>("board");
  const [workspaceTab, setWorkspaceTab] =
    React.useState<WorkspaceTab>("intraop");
  const [scheduleDialogOpen, setScheduleDialogOpen] = React.useState(false);
  const [scheduleForm, setScheduleForm] = React.useState<ScheduleForm>(() =>
    defaultScheduleForm(ROOM_OPTIONS[0]?.id ?? "or-1"),
  );
  const [preOpChecklistByCaseId, setPreOpChecklistByCaseId] = React.useState<
    Record<string, PreOpChecklistItemState[]>
  >(() => {
    const initial: Record<string, PreOpChecklistItemState[]> = {};
    INITIAL_CASES.forEach((item) => {
      initial[item.id] = buildChecklistStateForCase(item);
    });
    return initial;
  });
  const snackbar = useSnackbar();

  React.useEffect(() => {
    if (selectedCaseId && cases.some((item) => item.id === selectedCaseId))
      return;
    setSelectedCaseId(cases[0]?.id ?? "");
  }, [cases, selectedCaseId]);

  const selectedCase = React.useMemo(
    () => cases.find((item) => item.id === selectedCaseId) ?? null,
    [cases, selectedCaseId],
  );

  React.useEffect(() => {
    if (viewMode === "workspace" && !selectedCase) {
      setViewMode("board");
    }
  }, [selectedCase, viewMode]);

  const boardRows = React.useMemo(
    () =>
      [...cases].sort(
        (a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt),
      ),
    [cases],
  );

  const roomLabelById = React.useMemo(() => {
    const map = new Map<string, string>();
    ROOM_OPTIONS.forEach((room) => map.set(room.id, room.label));
    return map;
  }, []);

  const boardStats = React.useMemo(() => {
    const scheduled = cases.filter(
      (item) => item.status === "Scheduled",
    ).length;
    const inProgress = cases.filter(
      (item) => item.status === "In OR" || item.status === "Closing",
    ).length;
    const pendingRecovery = cases.filter(
      (item) => item.status === "PACU",
    ).length;
    const completed = cases.filter(
      (item) => item.status === "Completed",
    ).length;
    const utilization = Math.round(
      ((inProgress + pendingRecovery + completed) / Math.max(cases.length, 1)) *
        100,
    );
    return { scheduled, inProgress, pendingRecovery, completed, utilization };
  }, [cases]);

  const openWorkspace = React.useCallback((row: OtCase) => {
    setSelectedCaseId(row.id);
    setWorkspaceTab(mapStatusToWorkspaceTab(row.status));
    setViewMode("workspace");
  }, []);

  const handleTabChange = React.useCallback((value: WorkspaceTab) => {
    setWorkspaceTab(value);
  }, []);

  React.useEffect(() => {
    setPreOpChecklistByCaseId((prev) => {
      let changed = false;
      const next = { ...prev };
      cases.forEach((item) => {
        if (
          !next[item.id] ||
          next[item.id].length !== PREOP_CHECKLIST_ITEMS.length
        ) {
          next[item.id] = buildChecklistStateForCase(item);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [cases]);

  const togglePreOpChecklistItem = React.useCallback(
    (index: number) => {
      if (!selectedCase) return;
      setPreOpChecklistByCaseId((prev) => {
        const current =
          prev[selectedCase.id] ?? buildChecklistStateForCase(selectedCase);
        if (index < 0 || index >= current.length) return prev;

        const nextItems = current.map((item) => ({ ...item }));
        const currentItem = nextItems[index];
        if (currentItem.done) {
          nextItems[index] = { done: false, time: null };
        } else {
          nextItems[index] = { done: true, time: formatChecklistTimeNow() };
        }
        return { ...prev, [selectedCase.id]: nextItems };
      });
    },
    [selectedCase],
  );

  const updateFormField = React.useCallback(
    <K extends keyof ScheduleForm>(key: K, value: ScheduleForm[K]) => {
      setScheduleForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleScheduleCase = React.useCallback(() => {
    if (
      !scheduleForm.patientName.trim() ||
      !scheduleForm.mrn.trim() ||
      !scheduleForm.procedure.trim() ||
      !scheduleForm.surgeon.trim()
    ) {
      snackbar.warning("Patient, MRN, Procedure, and Surgeon are required.");
      return;
    }

    const scheduledDate = new Date(scheduleForm.scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) {
      snackbar.warning("Please select a valid schedule date and time.");
      return;
    }

    const nextNumber = cases.length + 1;
    const newCase: OtCase = {
      id: `ot-case-${Date.now()}`,
      caseNo: `OT-${new Date().getFullYear()}-${String(nextNumber).padStart(3, "0")}`,
      patientName: scheduleForm.patientName.trim(),
      mrn: scheduleForm.mrn.trim(),
      ageGender: "45Y / M",
      procedure: scheduleForm.procedure.trim(),
      department: scheduleForm.department.trim() || "General Surgery",
      diagnosis: scheduleForm.diagnosis.trim() || "Pending diagnosis entry",
      surgeon: scheduleForm.surgeon.trim(),
      anesthetist: scheduleForm.anesthetist.trim() || "--",
      roomId: scheduleForm.roomId,
      scheduledAt: scheduledDate.toISOString(),
      priority: scheduleForm.priority,
      status: "Scheduled",
      prepPercent: scheduleForm.priority === "STAT" ? 25 : 40,
      allergies: ["None"],
      asaClass: "ASA II",
      estimatedDurationMin: 90,
    };

    setCases((prev) => [...prev, newCase]);
    setSelectedCaseId(newCase.id);
    setWorkspaceTab("preop");
    setViewMode("workspace");
    setScheduleDialogOpen(false);
    setScheduleForm(defaultScheduleForm(scheduleForm.roomId));
    snackbar.success(`${newCase.caseNo} scheduled and opened in workspace.`);
  }, [cases.length, scheduleForm]);

  const caseBoardColumns = React.useMemo(
    () =>
      getCaseBoardColumns(theme, roomLabelById, selectedCaseId, openWorkspace),
    [openWorkspace, roomLabelById, selectedCaseId, theme],
  );

  const countColumns = React.useMemo(() => getCountColumns(), []);
  const medicationColumns = React.useMemo(() => getMedicationColumns(), []);
  const dischargeMedicationColumns = React.useMemo(
    () => getDischargeMedicationColumns(),
    [],
  );

  const preOpChecklistRows = React.useMemo(() => {
    if (!selectedCase) {
      return PREOP_CHECKLIST_ITEMS.map((item) => ({
        label: item,
        done: false,
        time: "--",
      }));
    }

    const checklist =
      preOpChecklistByCaseId[selectedCase.id] ??
      buildChecklistStateForCase(selectedCase);
    return PREOP_CHECKLIST_ITEMS.map((item, index) => ({
      label: item,
      done: checklist[index]?.done ?? false,
      time: checklist[index]?.time ?? "--",
    }));
  }, [preOpChecklistByCaseId, selectedCase]);

  const preOpVitals = React.useMemo<VitalReading[]>(
    () => [
      { label: "BP", value: "136/84 mmHg", tone: "warning" },
      { label: "HR", value: "90 bpm", tone: "info" },
      { label: "SpO₂", value: "98%", tone: "success" },
      {
        label: "Temp",
        value: selectedCase?.allergies.includes("None") ? "37.2 °C" : "38.2 °C",
        tone: selectedCase?.allergies.includes("None") ? "info" : "warning",
      },
      { label: "RBS", value: "132 mg/dL", tone: "info" },
      { label: "Pain", value: "4/10", tone: "warning" },
    ],
    [selectedCase?.allergies],
  );

  const intraOpVitals = React.useMemo<VitalReading[]>(
    () => [
      { label: "BP", value: "118/76 mmHg", tone: "success" },
      { label: "HR", value: "82 bpm", tone: "success" },
      { label: "SpO₂", value: "99%", tone: "success" },
      { label: "EtCO₂", value: "35 mmHg", tone: "info" },
      { label: "Temp", value: "37.1 °C", tone: "info" },
      { label: "UO", value: "180 ml/hr", tone: "success" },
    ],
    [],
  );

  const postOpVitals = React.useMemo<VitalReading[]>(
    () => [
      { label: "BP", value: "122/80 mmHg", tone: "success" },
      { label: "Pulse", value: "78 bpm", tone: "success" },
      { label: "SpO₂", value: "97%", tone: "success" },
      { label: "Temp", value: "37.4 °C", tone: "info" },
      { label: "Pain", value: "3/10 VAS", tone: "warning" },
      { label: "UO", value: "95 ml/hr", tone: "info" },
    ],
    [],
  );

  const [intraOpEvents, setIntraOpEvents] = React.useState(INTRAOP_TIMELINE);

  const [instrumentRows, setInstrumentRows] = React.useState<InstrumentCountRow[]>([
    {
      id: "count-swabs",
      item: "Swabs",
      initial: "20",
      final: "20",
      status: "OK",
    },
    {
      id: "count-needles",
      item: "Needles",
      initial: "8",
      final: "8",
      status: "OK",
    },
    {
      id: "count-instruments",
      item: "Instruments",
      initial: "32",
      final: "--",
      status: "Pending",
    },
    {
      id: "count-retractors",
      item: "Retractors",
      initial: "4",
      final: "4",
      status: "OK",
    },
  ]);

  const [intraOpMedicationRows, setIntraOpMedicationRows] = React.useState<MedicationRow[]>([
    {
      id: "med-propofol",
      drug: "Propofol 2%",
      dose: "200 mg",
      route: "IV Bolus",
      time: "08:05",
    },
    {
      id: "med-cef",
      drug: "Ceftriaxone",
      dose: "1 g",
      route: "IV",
      time: "08:10",
    },
    {
      id: "med-fentanyl",
      drug: "Fentanyl",
      dose: "100 mcg",
      route: "IV Push",
      time: "08:15",
    },
    {
      id: "med-rocuronium",
      drug: "Rocuronium",
      dose: "50 mg",
      route: "IV",
      time: "08:18",
    },
  ]);

  const [addEventDialogOpen, setAddEventDialogOpen] = React.useState(false);
  const [verifyCountDialogOpen, setVerifyCountDialogOpen] = React.useState(false);
  const [addIntraOpMedDialogOpen, setAddIntraOpMedDialogOpen] = React.useState(false);

  const handleAddIntraOpEvent = (form: IntraOpEventForm) => {
    setIntraOpEvents((prev) => [...prev, form]);
    snackbar.success("Event added to timeline.");
  };

  const handleUpdateInstrumentCount = (updatedRows: InstrumentCountRow[]) => {
    setInstrumentRows(updatedRows);
    snackbar.success("Instrument counts verified.");
  };

  const handleAddIntraOpMedication = (form: IntraOpMedicationForm) => {
    const newMed: MedicationRow = {
      id: `med-${Date.now()}`,
      drug: form.drug,
      dose: form.dose,
      route: form.route,
      time: form.time,
    };
    setIntraOpMedicationRows((prev) => [...prev, newMed]);
    snackbar.success("Medication recorded.");
  };

  const [dischargeMedicationRows, setDischargeMedicationRows] = React.useState<DischargeMedicationRow[]>([
    {
      id: "dmed-1",
      drug: "Paracetamol",
      dose: "500 mg",
      frequency: "TDS",
      duration: "5 days",
      instructions: "After food",
    },
    {
      id: "dmed-2",
      drug: "Pantoprazole",
      dose: "40 mg",
      frequency: "OD",
      duration: "7 days",
      instructions: "Before breakfast",
    },
    {
      id: "dmed-3",
      drug: "Amox-Clav",
      dose: "625 mg",
      frequency: "BD",
      duration: "5 days",
      instructions: "After meals",
    },
  ]);

  const [addDischargeMedicationDialogOpen, setAddDischargeMedicationDialogOpen] = React.useState(false);

  const handleAddDischargeMedication = (form: MedicationForm) => {
    const newMedication: DischargeMedicationRow = {
      id: `dmed-${Date.now()}`,
      drug: form.drugName,
      dose: `${form.dose} ${form.doseUnit}`,
      frequency: form.frequency,
      duration: `${form.duration} ${form.durationUnit}`,
      instructions: form.instructions || form.notes || "--",
    };
    setDischargeMedicationRows((prev) => [...prev, newMedication]);
  };


  const tabMeta = React.useMemo(() => {
    const preOpDone = preOpChecklistRows.filter(
      (item: { done: boolean }) => item.done,
    ).length;
    return [
      {
        value: "preop" as const,
        label: "Pre-Op",
        count: `${preOpDone}/${PREOP_CHECKLIST_ITEMS.length}`,
        icon: <FactCheckIcon fontSize="small" />,
      },
      {
        value: "intraop" as const,
        label: "Intra-Op",
        count: "5",
        icon: <TimelineIcon fontSize="small" />,
      },
      {
        value: "postop" as const,
        label: "Post-Op",
        count: "4",
        icon: <MonitorHeartIcon fontSize="small" />,
      },
    ];
  }, [preOpChecklistRows]);

  const dashboardCardSx = React.useMemo(
    () => ({
      backgroundColor: "background.paper",
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 2,
      boxShadow: "none",
    }),
    [],
  );

  const workspaceCardSx = React.useMemo(
    () => ({
      ...dashboardCardSx,
      p: 1.25,
      height: "100%",
    }),
    [dashboardCardSx],
  );

  const tabChipSx = React.useMemo(
    () => ({
      height: 18,
      fontSize: "0.62rem",
      fontWeight: 700,
      bgcolor: alpha(theme.palette.primary.main, 0.14),
      color: "primary.main",
    }),
    [theme.palette.primary.main],
  );

  const TAB_ORDER: WorkspaceTab[] = ["preop", "intraop", "postop"];

  const workspaceTabItems = React.useMemo(() => {
    if (!selectedCase) return [];

    const commonProps = {
      selectedCase,
      theme,
      workspaceCardSx,
      preOpChecklistRows,
      preOpVitals,
      intraOpVitals,
      postOpVitals,
      instrumentRows,
      intraOpMedicationRows,
      dischargeMedicationRows,
      togglePreOpChecklistItem,
      countColumns,
      medicationColumns,
      dischargeMedicationColumns,
      onAddDischargeClick: () => setAddDischargeMedicationDialogOpen(true),
      onAddEventClick: () => setAddEventDialogOpen(true),
      onVerifyCountClick: () => setVerifyCountDialogOpen(true),
      onAddIntraOpMedClick: () => setAddIntraOpMedDialogOpen(true),
      intraOpEvents,
    };

    const preOpDone = preOpChecklistRows.filter(
      (item: { done: boolean }) => item.done,
    ).length;

    return [
      {
        label: "Pre-Op",
        icon: <FactCheckIcon fontSize="small" />,
        child: <PreOpWorkspacePanel {...commonProps} />,
        cardAction: (
          <Chip
            size="small"
            label={`${preOpDone}/${PREOP_CHECKLIST_ITEMS.length}`}
            sx={tabChipSx}
          />
        ),
      },
      {
        label: "Intra-Op",
        icon: <TimelineIcon fontSize="small" />,
        child: <IntraOpWorkspacePanel {...commonProps} />,
        cardAction: <Chip size="small" label="5" sx={tabChipSx} />,
      },
      {
        label: "Post-Op",
        icon: <MonitorHeartIcon fontSize="small" />,
        child: <PostOpWorkspacePanel {...commonProps} />,
        cardAction: <Chip size="small" label="4" sx={tabChipSx} />,
      },
    ];
  }, [
    selectedCase,
    theme,
    workspaceCardSx,
    preOpChecklistRows,
    preOpVitals,
    intraOpVitals,
    postOpVitals,
    instrumentRows,
    intraOpMedicationRows,
    dischargeMedicationRows,
    togglePreOpChecklistItem,
    countColumns,
    medicationColumns,
    dischargeMedicationColumns,
    tabChipSx,
  ]);

  return (
    <PageTemplate title="OpTime" currentPageTitle="OT Scheduling" fullHeight>
        <Stack
          spacing={1.1}
          sx={{
            flex: 1,
            minHeight: 0,
            overflowX: "hidden",
            overflowY: viewMode === "board" ? "auto" : "hidden",
          }}
        >
          {viewMode === "board" ? (
            <OpTimeBoard
              boardStats={boardStats}
              boardRows={boardRows}
              caseBoardColumns={caseBoardColumns}
              setScheduleForm={setScheduleForm}
              setScheduleDialogOpen={setScheduleDialogOpen}
              dashboardCardSx={dashboardCardSx}
              roomLabelById={roomLabelById}
            />
          ) : (
            <Stack spacing={1.1} sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              <OpTimeWorkspaceHeader
                theme={theme}
                selectedCase={selectedCase}
                setViewMode={setViewMode}
                roomLabelById={roomLabelById}
              />

              {selectedCase ? (
                <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                  <CustomCardTabs
                    items={workspaceTabItems}
                    defaultValue={TAB_ORDER.indexOf(workspaceTab)}
                    onChange={(index: number) =>
                      setWorkspaceTab(TAB_ORDER[index])
                    }
                    showBackground
                    sticky={true}
                  />
                </Box>
              ) : (
                <Box sx={{ p: 1.1 }}>
                  <Alert severity="warning">
                    No case selected. Go back to board and open one case.
                  </Alert>
                </Box>
              )}
            </Stack>
          )}
        </Stack>

      <OpTimeDialogs
        scheduleDialogOpen={scheduleDialogOpen}
        setScheduleDialogOpen={setScheduleDialogOpen}
        scheduleForm={scheduleForm}
        updateFormField={updateFormField}
        handleScheduleCase={handleScheduleCase}
      />

      <AddDischargeMedicationModal
        isOpen={addDischargeMedicationDialogOpen}
        onClose={() => setAddDischargeMedicationDialogOpen(false)}
        onSave={(med) => {
          const newMed: DischargeMedicationRow = {
            id: `dmed-${Date.now()}`,
            drug: med.drugName,
            dose: `${med.dose} ${med.doseUnit}`,
            frequency: med.frequency,
            duration: `${med.duration} ${med.durationUnit}`,
            instructions: med.instructions || med.notes || "--",
          };
          setDischargeMedicationRows((prev) => [...prev, newMed]);
        }}
      />

      <AddIntraOpEventModal
        isOpen={addEventDialogOpen}
        onClose={() => setAddEventDialogOpen(false)}
        onSave={handleAddIntraOpEvent}
      />

      <AddIntraOpMedicationModal
        isOpen={addIntraOpMedDialogOpen}
        onClose={() => setAddIntraOpMedDialogOpen(false)}
        onSave={handleAddIntraOpMedication}
      />

      <VerifyInstrumentCountModal
        isOpen={verifyCountDialogOpen}
        onClose={() => setVerifyCountDialogOpen(false)}
        instrumentRows={instrumentRows}
        onSave={handleUpdateInstrumentCount}
      />
    </PageTemplate>
  );
}
