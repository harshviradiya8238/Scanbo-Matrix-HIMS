"use client";

import * as React from "react";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import {
  ViewMode,
  WorkspaceTab,
  WorklistFilter,
  CaseStatus,
  StatusTone,
  DrugEntry,
  EventEntry,
  WorklistCase,
} from "./types";
import { CASES, UI_THEME } from "./constants";
import { matchesFilter, currentTimeStamp } from "./utils";
import { CaseSelectionView } from "./components/CaseSelectionView";
import { WorkspaceView } from "./components/WorkspaceView";
import { OrBoardDialog } from "./components/dialogs/OrBoardDialog";
import { UrgentCaseDialog } from "./components/dialogs/UrgentCaseDialog";
import { AddDrugDialog } from "./components/dialogs/AddDrugDialog";
import { AddEventDialog } from "./components/dialogs/AddEventDialog";
import { SignCloseDialog } from "./components/dialogs/SignCloseDialog";
import { VentSettingsDialog } from "./components/dialogs/VentSettingsDialog";
import { FinalSignoffDialog } from "./components/dialogs/FinalSignoffDialog";
import { alpha } from "@mui/material";

export default function AnesthesiaPage() {
  const [mode, setMode] = React.useState<ViewMode>("select");
  const [tab, setTab] = React.useState<WorkspaceTab>("overview");
  const [filter, setFilter] = React.useState<WorklistFilter>("all");
  const [query, setQuery] = React.useState("");
  const [selectedCaseId, setSelectedCaseId] = React.useState<string>(
    CASES[0].id,
  );

  const [customCases, setCustomCases] = React.useState<WorklistCase[]>([]);
  const [extraDrugsByCase, setExtraDrugsByCase] = React.useState<
    Record<string, DrugEntry[]>
  >({});
  const [extraEventsByCase, setExtraEventsByCase] = React.useState<
    Record<string, EventEntry[]>
  >({});
  const [ventilationOverrides, setVentilationOverrides] = React.useState<
    Record<string, WorklistCase["ventilation"]>
  >({});
  const [statusOverrides, setStatusOverrides] = React.useState<
    Record<string, CaseStatus>
  >({});

  const [orBoardOpen, setOrBoardOpen] = React.useState(false);
  const [urgentCaseOpen, setUrgentCaseOpen] = React.useState(false);
  const [addDrugOpen, setAddDrugOpen] = React.useState(false);
  const [addEventOpen, setAddEventOpen] = React.useState(false);
  const [signCloseOpen, setSignCloseOpen] = React.useState(false);
  const [ventSettingsOpen, setVentSettingsOpen] = React.useState(false);
  const [finalSignoffOpen, setFinalSignoffOpen] = React.useState(false);

  const [addDrugForm, setAddDrugForm] = React.useState({
    name: "",
    route: "IV",
    type: "Continuous Infusion",
    dose: "",
    notes: "",
  });
  const [addEventForm, setAddEventForm] = React.useState<{
    note: string;
    tone: "info" | "active" | "warning" | "critical";
  }>({
    note: "",
    tone: "info",
  });
  const [urgentCaseForm, setUrgentCaseForm] = React.useState({
    room: "OR-U1",
    patientName: "",
    procedure: "",
    surgeon: "",
    anesthetist: "",
    asaClass: "ASA III",
  });
  const [ventSettingsForm, setVentSettingsForm] = React.useState<
    WorklistCase["ventilation"]
  >(CASES[0].ventilation);
  const [finalSignoffNote, setFinalSignoffNote] = React.useState("");

  const allCases = React.useMemo(() => {
    return [...customCases, ...CASES].map((item) => ({
      ...item,
      status: statusOverrides[item.id] ?? item.status,
      drugs: [...(extraDrugsByCase[item.id] ?? []), ...item.drugs],
      events: [...(extraEventsByCase[item.id] ?? []), ...item.events],
      ventilation: ventilationOverrides[item.id] ?? item.ventilation,
    }));
  }, [
    customCases,
    extraDrugsByCase,
    extraEventsByCase,
    ventilationOverrides,
    statusOverrides,
  ]);

  const selectedCase =
    allCases.find((item) => item.id === selectedCaseId) ??
    allCases[0] ??
    CASES[0];

  React.useEffect(() => {
    if (!allCases.length) return;
    if (allCases.some((item) => item.id === selectedCaseId)) return;
    setSelectedCaseId(allCases[0].id);
  }, [allCases, selectedCaseId]);

  const filteredCases = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return allCases.filter((item) => {
      if (!matchesFilter(item.status, filter)) return false;
      if (!normalizedQuery) return true;
      return (
        item.patientName.toLowerCase().includes(normalizedQuery) ||
        item.mrn.toLowerCase().includes(normalizedQuery) ||
        item.procedure.toLowerCase().includes(normalizedQuery) ||
        item.room.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [allCases, filter, query]);

  const handleSubmitAddDrug = () => {
    const normalizedName = addDrugForm.name.trim();
    const normalizedDose = addDrugForm.dose.trim();
    if (!normalizedName || !normalizedDose) return;

    const tone: StatusTone =
      addDrugForm.type === "Bolus"
        ? "warning"
        : addDrugForm.type === "Intermittent"
          ? "info"
          : "active";
    const statusLabel =
      addDrugForm.type === "Bolus"
        ? "Bolus"
        : addDrugForm.type === "Intermittent"
          ? "Scheduled"
          : "Continuous";
    const time = currentTimeStamp();

    const newDrug: DrugEntry = {
      name: normalizedName,
      route: addDrugForm.route,
      rate: normalizedDose,
      status: statusLabel,
      tone,
      time,
    };

    setExtraDrugsByCase((prev) => ({
      ...prev,
      [selectedCase.id]: [newDrug, ...(prev[selectedCase.id] ?? [])],
    }));
    setExtraEventsByCase((prev) => ({
      ...prev,
      [selectedCase.id]: [
        {
          time,
          text: `Medication added: ${normalizedName} (${normalizedDose})`,
          tone: "info",
        },
        ...(prev[selectedCase.id] ?? []),
      ],
    }));
    setAddDrugOpen(false);
    setAddDrugForm({
      name: "",
      route: "IV",
      type: "Continuous Infusion",
      dose: "",
      notes: "",
    });
    setTab("drugs");
  };

  const handleSubmitEvent = () => {
    const note = addEventForm.note.trim();
    if (!note) return;
    const newEvent: EventEntry = {
      time: currentTimeStamp(),
      text: note,
      tone: addEventForm.tone,
    };
    setExtraEventsByCase((prev) => ({
      ...prev,
      [selectedCase.id]: [newEvent, ...(prev[selectedCase.id] ?? [])],
    }));
    setAddEventOpen(false);
    setAddEventForm({ note: "", tone: "info" });
  };

  const handleCreateUrgentCase = () => {
    const patientName = urgentCaseForm.patientName.trim();
    const procedure = urgentCaseForm.procedure.trim();
    if (!patientName || !procedure) return;

    const caseId = `custom-${Date.now()}`;
    const now = currentTimeStamp();
    const newCase: WorklistCase = {
      id: caseId,
      room: urgentCaseForm.room || "OR-U1",
      scheduledAt: now,
      patientName,
      mrn: `URG-${String(Date.now()).slice(-6)}`,
      ageGender: "-- / --",
      procedure,
      diagnosis: "Urgent surgical case",
      surgeon: urgentCaseForm.surgeon.trim() || "On-call Surgeon",
      anesthetist: urgentCaseForm.anesthetist.trim() || "On-call Anesthesia",
      asaClass: urgentCaseForm.asaClass || "ASA III",
      status: "Pre-Op",
      duration: "00:00",
      fluidsInMl: "0",
      bloodLossMl: "0",
      allergyTags: ["Pending review"],
      vitals: {
        hr: "-",
        bp: "-",
        spo2: "-",
        etco2: "-",
        temp: "-",
        bis: "-",
      },
      ventilation: {
        o2Flow: "Planned",
        fio2: "Planned",
        tidalVolume: "Planned",
        rr: "Planned",
        peep: "Planned",
        pip: "Planned",
      },
      checklist: [
        {
          step: "Urgent triage checklist",
          done: false,
          owner: "OT Coordinator",
        },
      ],
      events: [
        {
          time: now,
          text: "Urgent case created from OR board",
          tone: "warning",
        },
      ],
      drugs: [],
      flowsheetTimes: [],
      flowsheetRows: [],
      team: [],
      notes: "Urgent case created. Complete pre-op anesthesia assessment.",
    };

    setCustomCases((prev) => [newCase, ...prev]);
    setUrgentCaseOpen(false);
    setUrgentCaseForm({
      room: "OR-U1",
      patientName: "",
      procedure: "",
      surgeon: "",
      anesthetist: "",
      asaClass: "ASA III",
    });
    setSelectedCaseId(caseId);
    setMode("workspace");
  };

  const handleSignAndCloseCase = (source: "sign-close" | "final-signoff") => {
    setStatusOverrides((prev) => ({
      ...prev,
      [selectedCase.id]: "Completed",
    }));
    const note = source === "final-signoff" ? finalSignoffNote.trim() : "";
    setExtraEventsByCase((prev) => ({
      ...prev,
      [selectedCase.id]: [
        {
          time: currentTimeStamp(),
          text:
            source === "final-signoff"
              ? `Final sign-off completed${note ? `: ${note}` : ""}`
              : "Case signed and closed by anesthesia team",
          tone: "completed",
        },
        ...(prev[selectedCase.id] ?? []),
      ],
    }));
    setSignCloseOpen(false);
    setFinalSignoffOpen(false);
    setFinalSignoffNote("");
  };

  const handleSaveVentSettings = () => {
    setVentilationOverrides((prev) => ({
      ...prev,
      [selectedCase.id]: { ...ventSettingsForm },
    }));
    setVentSettingsOpen(false);
  };

  return (
    <PageTemplate title="Anesthesia Module" fullHeight>
      <Stack
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          overflow: "hidden",
          backgroundColor: "transparent",
          p: 0,
          "& .MuiTableCell-root": {
            borderBottomColor: UI_THEME.border,
          },
          "& .MuiTableHead-root .MuiTableCell-root": {
            color: UI_THEME.textSecondary,
            fontSize: "0.68rem",
            textTransform: "uppercase",
            letterSpacing: "0.55px",
            fontWeight: 700,
          },
          "& .MuiTableBody-root .MuiTableRow-root:hover .MuiTableCell-root": {
            backgroundColor: UI_THEME.panelSoft,
          },
        }}
      >
        {mode === "select" ? (
          <CaseSelectionView
            query={query}
            setQuery={setQuery}
            filter={filter}
            setFilter={setFilter}
            allCases={allCases}
            cases={filteredCases}
            onOpenOrBoard={() => setOrBoardOpen(true)}
            onOpenUrgentCase={() => setUrgentCaseOpen(true)}
            onSelect={(caseId) => {
              setSelectedCaseId(caseId);
              setMode("workspace");
            }}
          />
        ) : (
          <WorkspaceView
            caseData={selectedCase}
            tab={tab}
            setTab={setTab}
            onBack={() => setMode("select")}
            onOpenAddEvent={() => setAddEventOpen(true)}
            onOpenSignClose={() => setSignCloseOpen(true)}
            onOpenAddDrug={() => setAddDrugOpen(true)}
            onOpenVentSettings={() => {
              setVentSettingsForm({ ...selectedCase.ventilation });
              setVentSettingsOpen(true);
            }}
            onOpenFinalSignOff={() => setFinalSignoffOpen(true)}
          />
        )}
      </Stack>

      <OrBoardDialog
        open={orBoardOpen}
        onClose={() => setOrBoardOpen(false)}
        allCases={allCases}
        onOpenCase={(caseId) => {
          setSelectedCaseId(caseId);
          setMode("workspace");
        }}
      />

      <UrgentCaseDialog
        open={urgentCaseOpen}
        onClose={() => setUrgentCaseOpen(false)}
        urgentCaseForm={urgentCaseForm}
        setUrgentCaseForm={setUrgentCaseForm}
        onConfirm={handleCreateUrgentCase}
      />

      <AddDrugDialog
        open={addDrugOpen}
        onClose={() => setAddDrugOpen(false)}
        addDrugForm={addDrugForm}
        setAddDrugForm={setAddDrugForm}
        onConfirm={handleSubmitAddDrug}
      />

      <AddEventDialog
        open={addEventOpen}
        onClose={() => setAddEventOpen(false)}
        addEventForm={addEventForm}
        setAddEventForm={setAddEventForm}
        onConfirm={handleSubmitEvent}
      />

      <SignCloseDialog
        open={signCloseOpen}
        onClose={() => setSignCloseOpen(false)}
        onConfirm={() => handleSignAndCloseCase("sign-close")}
      />

      <VentSettingsDialog
        open={ventSettingsOpen}
        onClose={() => setVentSettingsOpen(false)}
        ventSettingsForm={ventSettingsForm}
        setVentSettingsForm={setVentSettingsForm}
        onConfirm={handleSaveVentSettings}
      />

      <FinalSignoffDialog
        open={finalSignoffOpen}
        onClose={() => setFinalSignoffOpen(false)}
        finalSignoffNote={finalSignoffNote}
        setFinalSignoffNote={setFinalSignoffNote}
        onConfirm={() => handleSignAndCloseCase("final-signoff")}
      />
    </PageTemplate>
  );
}
