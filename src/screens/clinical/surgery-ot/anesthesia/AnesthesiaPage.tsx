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
import CommonDialog from "@/src/ui/components/molecules/CommonDialog";
import { EnterpriseStatusChip } from "@/src/screens/clinical/components/EnterpriseUi";
import { alpha } from "@/src/ui/theme";
import {
  Close as CloseIcon,
  LocalPharmacy as LocalPharmacyIcon,
  MonitorHeart as MonitorHeartIcon,
} from "@mui/icons-material";

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
import { matchesFilter, statusTone, currentTimeStamp } from "./utils";
import { CaseSelectionView } from "./components/CaseSelectionView";
import { WorkspaceView } from "./components/WorkspaceView";

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
      <Box
        sx={{
          height: "100%",
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
            backgroundColor: UI_THEME.tableHead,
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
      </Box>

      <CommonDialog
        open={orBoardOpen}
        onClose={() => setOrBoardOpen(false)}
        maxWidth="md"
        title="OR Board"
        icon={<MonitorHeartIcon sx={{ fontSize: 18 }} />}
        contentDividers
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Room</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Procedure</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Open</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allCases.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>{item.room}</TableCell>
                <TableCell>{item.scheduledAt}</TableCell>
                <TableCell>{item.patientName}</TableCell>
                <TableCell>{item.procedure}</TableCell>
                <TableCell>
                  <EnterpriseStatusChip
                    label={item.status}
                    tone={statusTone(item.status)}
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      setSelectedCaseId(item.id);
                      setMode("workspace");
                      setOrBoardOpen(false);
                    }}
                  >
                    Open
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CommonDialog>

      <CommonDialog
        open={urgentCaseOpen}
        onClose={() => setUrgentCaseOpen(false)}
        maxWidth="sm"
        title="Add Urgent Case"
        onConfirm={handleCreateUrgentCase}
        confirmLabel="Create Case"
        contentDividers
      >
        <Stack spacing={1}>
          <TextField
            label="Patient Name *"
            size="small"
            value={urgentCaseForm.patientName}
            onChange={(event) =>
              setUrgentCaseForm((prev) => ({
                ...prev,
                patientName: event.target.value,
              }))
            }
          />
          <TextField
            label="Procedure *"
            size="small"
            value={urgentCaseForm.procedure}
            onChange={(event) =>
              setUrgentCaseForm((prev) => ({
                ...prev,
                procedure: event.target.value,
              }))
            }
          />
          <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
            <TextField
              label="OR Room"
              size="small"
              value={urgentCaseForm.room}
              onChange={(event) =>
                setUrgentCaseForm((prev) => ({
                  ...prev,
                  room: event.target.value,
                }))
              }
            />
            <TextField
              select
              label="ASA Class"
              size="small"
              value={urgentCaseForm.asaClass}
              onChange={(event) =>
                setUrgentCaseForm((prev) => ({
                  ...prev,
                  asaClass: event.target.value,
                }))
              }
            >
              {["ASA I", "ASA II", "ASA III", "ASA IV"].map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
            <TextField
              label="Surgeon"
              size="small"
              value={urgentCaseForm.surgeon}
              onChange={(event) =>
                setUrgentCaseForm((prev) => ({
                  ...prev,
                  surgeon: event.target.value,
                }))
              }
            />
            <TextField
              label="Anesthetist"
              size="small"
              value={urgentCaseForm.anesthetist}
              onChange={(event) =>
                setUrgentCaseForm((prev) => ({
                  ...prev,
                  anesthetist: event.target.value,
                }))
              }
            />
          </Stack>
        </Stack>
      </CommonDialog>

      <CommonDialog
        open={addDrugOpen}
        onClose={() => setAddDrugOpen(false)}
        maxWidth="sm"
        title="Add Drug / Infusion"
        icon={<LocalPharmacyIcon sx={{ fontSize: 18 }} />}
        onConfirm={handleSubmitAddDrug}
        confirmLabel="Add Drug"
        contentDividers
      >
        <Stack spacing={1}>
          <TextField
            size="small"
            label="Drug Name *"
            placeholder="e.g. Propofol, Midazolam..."
            value={addDrugForm.name}
            onChange={(event) =>
              setAddDrugForm((prev) => ({
                ...prev,
                name: event.target.value,
              }))
            }
          />
          <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
            <TextField
              select
              size="small"
              label="Route"
              value={addDrugForm.route}
              onChange={(event) =>
                setAddDrugForm((prev) => ({
                  ...prev,
                  route: event.target.value,
                }))
              }
            >
              {["IV", "IM", "Oral", "Inhalational"].map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Type"
              value={addDrugForm.type}
              onChange={(event) =>
                setAddDrugForm((prev) => ({
                  ...prev,
                  type: event.target.value,
                }))
              }
            >
              {["Continuous Infusion", "Bolus", "Intermittent"].map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <TextField
            size="small"
            label="Rate / Dose *"
            placeholder="e.g. 75 mcg/kg/min or 50 mg bolus"
            value={addDrugForm.dose}
            onChange={(event) =>
              setAddDrugForm((prev) => ({
                ...prev,
                dose: event.target.value,
              }))
            }
          />
          <TextField
            size="small"
            label="Notes"
            placeholder="Additional notes..."
            value={addDrugForm.notes}
            onChange={(event) =>
              setAddDrugForm((prev) => ({
                ...prev,
                notes: event.target.value,
              }))
            }
          />
        </Stack>
      </CommonDialog>

      <CommonDialog
        open={addEventOpen}
        onClose={() => setAddEventOpen(false)}
        maxWidth="sm"
        title="Add Intra-op Event"
        onConfirm={handleSubmitEvent}
        confirmLabel="Save Event"
        contentDividers
      >
        <Stack spacing={1}>
          <TextField
            label="Event Detail *"
            size="small"
            multiline
            minRows={3}
            value={addEventForm.note}
            onChange={(event) =>
              setAddEventForm((prev) => ({
                ...prev,
                note: event.target.value,
              }))
            }
          />
          <TextField
            select
            label="Severity"
            size="small"
            value={addEventForm.tone}
            onChange={(event) =>
              setAddEventForm((prev) => ({
                ...prev,
                tone: event.target.value as typeof addEventForm.tone,
              }))
            }
          >
            <MenuItem value="info">Info</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="warning">Warning</MenuItem>
            <MenuItem value="critical">Critical</MenuItem>
          </TextField>
        </Stack>
      </CommonDialog>

      <CommonDialog
        open={signCloseOpen}
        onClose={() => setSignCloseOpen(false)}
        maxWidth="xs"
        title="Sign & Close Case"
        onConfirm={() => handleSignAndCloseCase("sign-close")}
        confirmLabel="Confirm Sign & Close"
        contentDividers
      >
        <Typography variant="body2" color="text.secondary">
          This will mark the case as completed and append an event log entry.
        </Typography>
      </CommonDialog>

      <CommonDialog
        open={ventSettingsOpen}
        onClose={() => setVentSettingsOpen(false)}
        maxWidth="sm"
        title="Vent Settings"
        onConfirm={handleSaveVentSettings}
        confirmLabel="Save Settings"
        contentDividers
      >
        <Stack spacing={1}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
            <TextField
              size="small"
              label="O2 Flow"
              value={ventSettingsForm.o2Flow}
              onChange={(event) =>
                setVentSettingsForm((prev) => ({
                  ...prev,
                  o2Flow: event.target.value,
                }))
              }
            />
            <TextField
              size="small"
              label="FiO2"
              value={ventSettingsForm.fio2}
              onChange={(event) =>
                setVentSettingsForm((prev) => ({
                  ...prev,
                  fio2: event.target.value,
                }))
              }
            />
          </Stack>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
            <TextField
              size="small"
              label="Tidal Volume"
              value={ventSettingsForm.tidalVolume}
              onChange={(event) =>
                setVentSettingsForm((prev) => ({
                  ...prev,
                  tidalVolume: event.target.value,
                }))
              }
            />
            <TextField
              size="small"
              label="RR"
              value={ventSettingsForm.rr}
              onChange={(event) =>
                setVentSettingsForm((prev) => ({
                  ...prev,
                  rr: event.target.value,
                }))
              }
            />
          </Stack>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
            <TextField
              size="small"
              label="PEEP"
              value={ventSettingsForm.peep}
              onChange={(event) =>
                setVentSettingsForm((prev) => ({
                  ...prev,
                  peep: event.target.value,
                }))
              }
            />
            <TextField
              size="small"
              label="PIP"
              value={ventSettingsForm.pip}
              onChange={(event) =>
                setVentSettingsForm((prev) => ({
                  ...prev,
                  pip: event.target.value,
                }))
              }
            />
          </Stack>
        </Stack>
      </CommonDialog>

      <CommonDialog
        open={finalSignoffOpen}
        onClose={() => setFinalSignoffOpen(false)}
        maxWidth="sm"
        title="Final Sign-off"
        onConfirm={() => handleSignAndCloseCase("final-signoff")}
        confirmLabel="Complete Sign-off"
        contentDividers
      >
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            Complete final anesthesia handoff and mark the case as completed.
          </Typography>
          <TextField
            size="small"
            label="Handoff Notes"
            multiline
            minRows={3}
            value={finalSignoffNote}
            onChange={(event) => setFinalSignoffNote(event.target.value)}
          />
        </Stack>
      </CommonDialog>
    </PageTemplate>
  );
}
