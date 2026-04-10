"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import {
  Card,
  CommonDialog,
  PatientGlobalHeader,
} from "@/src/ui/components/molecules";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { useTheme } from "@/src/ui/theme";
import {
  Biotech as BiotechIcon,
  Description as DescriptionIcon,
  History as HistoryIcon,
  Medication as MedicationIcon,
  Mic as MicIcon,
  MonitorHeart as MonitorHeartIcon,
  Science as ScienceIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
import { useMrnParam } from "@/src/core/patients/useMrnParam";
import { useUser } from "@/src/core/auth/UserContext";
import { usePermission } from "@/src/core/auth/usePermission";
import { useAppDispatch } from "@/src/store/hooks";
import { updateEncounter } from "@/src/store/slices/opdSlice";
import { useOpdData } from "@/src/store/opdHooks";
import { useSnackbar } from "@/src/ui/components/molecules/Snackbarcontext";
import { getOpdRoleFlowProfile } from "../../opd-role-flow";
import OpdLayout from "../../components/OpdLayout";
import ConsultationWorkspaceHeader from "../../components/ConsultationWorkspaceHeader";
import {
  buildDefaultTransferPayload,
  upsertOpdToIpdTransferLead,
} from "@/src/screens/ipd/ipd-transfer-store";
import VitalsTab from "./components/tabs/VitalsTab";
import HistoryTab from "./components/tabs/HistoryTab";
import AllergiesTab from "./components/tabs/AllergiesTab";
import DiagnosisTab from "./components/tabs/DiagnosisTab";
import OrdersTab from "./components/tabs/OrdersTab";
import PrescriptionsTab from "./components/tabs/PrescriptionsTab";
import NotesTab from "./components/tabs/NotesTab";
import CustomCardTabs from "@/src/ui/components/molecules/CustomCardTabs";

interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface HistoryDraft {
  chiefComplaint: string;
  hpi: string;
  duration: string;
  severity: string;
}

const formatElapsed = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const getPatientAge = (ageGender: string): string =>
  ageGender.split(",")[0]?.trim() || "--";

const getPatientGender = (ageGender: string): string =>
  ageGender.split(",")[1]?.trim() || "--";

const toDisplayStatusLabel = (status: string): string => {
  switch (status) {
    case "BOOKED": return "Booked";
    case "ARRIVED": return "Arrived";
    case "IN_QUEUE": return "In Queue";
    case "IN_PROGRESS": return "In Consultation";
    case "COMPLETED": return "Completed";
    case "CANCELLED": return "Cancelled";
    default: return status;
  }
};

export default function OpdVisitPage({ encounterId }: { encounterId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mrnParam = useMrnParam();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { role } = useUser();
  const permissionGate = usePermission();

  // HIMS Premium Snackbar Context
  const { success, error: notifyError, warning: notifyWarning, info: notifyInfo } = useSnackbar();

  // Shim for handle legacey object-based snackbar calls from tab components
  const handleSnackbarShim = React.useCallback((opts: any) => {
    if (typeof opts === 'string') {
      success(opts);
      return;
    }
    const { message, severity } = opts;
    if (severity === "error") notifyError(message);
    else if (severity === "warning") notifyWarning(message);
    else if (severity === "info") notifyInfo(message);
    else success(message);
  }, [success, notifyError, notifyWarning, notifyInfo]);

  // Data Fetching
  const {
    appointments,
    encounters,
    notes,
    status: opdStatus,
    error: opdError,
  } = useOpdData();

  // Selected Encounter Resolution
  const encounter = React.useMemo(() => {
    const id = encounterId || searchParams.get("id");
    if (id) return encounters.find((e) => e.id === id);
    if (mrnParam) return encounters.find((e) => e.mrn === mrnParam);
    return undefined;
  }, [encounters, encounterId, searchParams, mrnParam]);

  // Contextual Data
  const priorEncounters = React.useMemo(() =>
    encounters.filter((item) => item.mrn === encounter?.mrn && item.id !== encounter?.id),
    [encounters, encounter?.id, encounter?.mrn]
  );

  const priorNotes = React.useMemo(() => {
    const priorEncounterIds = new Set(priorEncounters.map((e) => e.id));
    return (notes as any[]).filter((n) => priorEncounterIds.has(n.patientId));
  }, [notes, priorEncounters]);

  // Tab State
  const [soap, setSoap] = React.useState<SoapNote>({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });
  const [historyDraft, setHistoryDraft] = React.useState<HistoryDraft>({
    chiefComplaint: "",
    hpi: "",
    duration: "",
    severity: "",
  });

  // Workspace Timer
  const [workspaceStartedAt] = React.useState(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);

  // RBAC Config
  const roleProfile = React.useMemo(() => getOpdRoleFlowProfile(role), [role]);
  const canStartConsult = roleProfile.capabilities.canStartConsult;
  const canDocumentConsultation = roleProfile.capabilities.canDocumentConsultation;
  const canPlaceOrders = roleProfile.capabilities.canPlaceOrders;
  const canPrescribe = roleProfile.capabilities.canPrescribe;
  const canCompleteVisit = roleProfile.capabilities.canCompleteVisit;
  const canTransferToIpd = roleProfile.capabilities.canTransferToIpd && permissionGate("ipd.transfer.write");

  // Transfer Dialog State
  const [transferDialogOpen, setTransferDialogOpen] = React.useState(false);
  const [transferDraft, setTransferDraft] = React.useState<any>({
    priority: "Routine",
    preferredWard: "Medical Ward - 1",
    provisionalDiagnosis: "",
    admissionReason: "",
    requestNote: "",
  });

  // Ambient Dialog State
  const [ambientDialogOpen, setAmbientDialogOpen] = React.useState(false);
  const [ambientTranscript, setAmbientTranscript] = React.useState("");

  const applyAmbientData = React.useCallback(() => {
    if (!ambientTranscript.trim()) return;
    const sections = {
      chiefComplaint: /Chief Complaint:\s*([\s\S]+?)(?=\n[A-Z][a-z]+ ?:|$)/i,
      hpi: /HPI:\s*([\s\S]+?)(?=\n[A-Z][a-z]+ ?:|$)/i,
      assessment: /Assessment:\s*([\s\S]+?)(?=\n[A-Z][a-z]+ ?:|$)/i,
      plan: /Plan:\s*([\s\S]+?)(?=\n[A-Z][a-z]+ ?:|$)/i,
      subjective: /Subjective:\s*([\s\S]+?)(?=\n[A-Z][a-z]+ ?:|$)/i,
    };
    const extracted: any = {};
    Object.entries(sections).forEach(([key, regex]) => {
      const match = ambientTranscript.match(regex);
      if (match) extracted[key] = match[1].trim();
    });
    if (extracted.chiefComplaint || extracted.hpi) {
      setHistoryDraft((prev) => ({
        ...prev,
        chiefComplaint: extracted.chiefComplaint || prev.chiefComplaint,
        hpi: extracted.hpi || prev.hpi,
      }));
    }
    if (extracted.assessment || extracted.plan || extracted.subjective) {
      setSoap((prev) => ({
        ...prev,
        assessment: extracted.assessment || prev.assessment,
        plan: extracted.plan || prev.plan,
        subjective: extracted.subjective || prev.subjective,
      }));
    }
    setAmbientDialogOpen(false);
    success("Ambient data applied to consultation.");
  }, [ambientTranscript, success]);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - workspaceStartedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [workspaceStartedAt]);

  React.useEffect(() => {
    if (!encounter) return;
    setSoap((prev) => ({
      subjective: prev.subjective || encounter.triageNote || "",
      objective: prev.objective || `BP ${encounter.vitals.bp}, HR ${encounter.vitals.hr}, RR ${encounter.vitals.rr}, Temp ${encounter.vitals.temp}, SpO2 ${encounter.vitals.spo2}`,
      assessment: prev.assessment || (encounter.problems.length ? encounter.problems.join(", ") : ""),
      plan: prev.plan,
    }));
    setHistoryDraft((prev) => ({
      chiefComplaint: prev.chiefComplaint || encounter.chiefComplaint || "",
      hpi: prev.hpi || encounter.triageNote || "",
      duration: prev.duration,
      severity: prev.severity,
    }));
  }, [encounter?.id]);

  const guardRoleAction = (allowed: boolean, actionLabel: string): boolean => {
    if (!allowed) {
      notifyError(`Your role (${roleProfile.label}) is not authorized to ${actionLabel}.`);
      return false;
    }
    return true;
  };

  const handleStartVisit = () => {
    if (!guardRoleAction(canStartConsult, "start consultation")) return;
    if (!encounter) return;
    dispatch(updateEncounter({ id: encounter.id, changes: { status: "IN_PROGRESS" } }));
    success("Consultation started.");
  };

  const handleExitVisit = () => {
    if (!encounter) return;
    router.push(`/appointments/queue?mrn=${encodeURIComponent(encounter.mrn)}`);
  };

  const handleCompleteVisit = () => {
    if (!guardRoleAction(canCompleteVisit, "complete consultation")) return;
    if (!encounter) return;
    if (encounter.status !== "IN_PROGRESS") {
      notifyError("Consultation must be IN_PROGRESS before completion.");
      return;
    }
    dispatch(updateEncounter({ id: encounter.id, changes: { status: "COMPLETED" } }));
    success(`Visit completed for ${encounter.patientName}.`);
    router.push(`/appointments/queue?mrn=${encodeURIComponent(encounter.mrn)}`);
  };

  const handleOpenAmbientConsultation = () => {
    setAmbientTranscript("");
    setAmbientDialogOpen(true);
  };

  const handleOpenTransferToIpd = () => {
    if (!guardRoleAction(canTransferToIpd, "move patient to IPD")) return;
    if (!encounter) return;
    const appointment = appointments.find((row) => row.id === encounter.appointmentId);
    if (!appointment) return;
    const defaults = buildDefaultTransferPayload(encounter, {
      payerType: appointment.payerType,
      phone: appointment.phone,
      requestedBy: roleProfile.label,
      requestedByRole: role,
    });
    setTransferDraft({
      priority: defaults.priority,
      preferredWard: defaults.preferredWard,
      provisionalDiagnosis: defaults.provisionalDiagnosis ?? "",
      admissionReason: defaults.admissionReason,
      requestNote: "",
    });
    setTransferDialogOpen(true);
  };

  const handleSubmitTransferToIpd = () => {
    if (!guardRoleAction(canTransferToIpd, "move patient to IPD")) return;
    if (!encounter) return;
    if (!transferDraft.preferredWard.trim() || !transferDraft.admissionReason.trim()) {
      notifyError("Ward and reason are required for IPD transfer.");
      return;
    }
    const appointment = appointments.find((row) => row.id === encounter.appointmentId);
    const defaults = buildDefaultTransferPayload(encounter, {
      payerType: appointment?.payerType,
      phone: appointment?.phone,
      requestedBy: roleProfile.label,
      requestedByRole: role,
    });
    const result = upsertOpdToIpdTransferLead({ ...defaults, ...transferDraft });
    dispatch(updateEncounter({ id: encounter.id, changes: { status: "IN_PROGRESS" } }));
    setTransferDialogOpen(false);

    const msg = result.status === "created"
      ? "IPD transfer request created successfully."
      : "IPD transfer request updated successfully.";
    success(msg);

    if (role !== "DOCTOR") {
      router.push(`/ipd/admissions?mrn=${encodeURIComponent(encounter.mrn)}`);
    }
  };

  if (!encounter) {
    return (
      <OpdLayout title="Encounter" currentPageTitle="Encounter" subtitle={mrnParam ? `MRN ${mrnParam}` : undefined}>
        <Alert severity="warning">No encounter found. Start from Queue and select a patient.</Alert>
      </OpdLayout>
    );
  }

  const allergyList = encounter.allergies.filter((item) => item && item.toLowerCase() !== "no known allergies");
  const workspaceDateLabel = `Date ${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;

  const tabs = [
    { label: "Vitals", icon: <MonitorHeartIcon fontSize="small" />, child: <VitalsTab encounter={encounter} canDocumentConsultation={canDocumentConsultation} setSnackbar={handleSnackbarShim} guardRoleAction={guardRoleAction} /> },
    { label: "History", icon: <HistoryIcon fontSize="small" />, child: <HistoryTab encounter={encounter} canDocumentConsultation={canDocumentConsultation} setSnackbar={handleSnackbarShim} guardRoleAction={guardRoleAction} historyDraft={historyDraft} setHistoryDraft={setHistoryDraft} priorEncounters={priorEncounters} priorNotes={priorNotes} setSoap={setSoap} /> },
    { label: "Allergies", icon: <WarningAmberIcon fontSize="small" />, child: <AllergiesTab encounter={encounter} canDocumentConsultation={canDocumentConsultation} setSnackbar={handleSnackbarShim} guardRoleAction={guardRoleAction} /> },
    { label: "Diagnosis", icon: <BiotechIcon fontSize="small" />, child: <DiagnosisTab encounter={encounter} canDocumentConsultation={canDocumentConsultation} historyDraft={historyDraft} setSnackbar={handleSnackbarShim} guardRoleAction={guardRoleAction} soap={soap} setSoap={setSoap} /> },
    { label: "Orders", icon: <ScienceIcon fontSize="small" />, child: <OrdersTab encounter={encounter} canPlaceOrders={canPlaceOrders} setSnackbar={handleSnackbarShim} guardRoleAction={guardRoleAction} /> },
    { label: "Prescription", icon: <MedicationIcon fontSize="small" />, child: <PrescriptionsTab encounter={encounter} canPrescribe={canPrescribe} setSnackbar={handleSnackbarShim} guardRoleAction={guardRoleAction} /> },
    { label: "Additional Notes", icon: <DescriptionIcon fontSize="small" />, child: <NotesTab encounter={encounter} canDocumentConsultation={canDocumentConsultation} setSnackbar={handleSnackbarShim} guardRoleAction={guardRoleAction} /> },
  ];

  return (
    <OpdLayout title="Consultation Workspace" currentPageTitle="Consultation" fullHeight>
      {opdStatus === "loading" && <Alert severity="info">Loading OPD data...</Alert>}
      {opdStatus === "error" && <Alert severity="warning">OPD data error: {opdError}</Alert>}

      <ConsultationWorkspaceHeader
        status={encounter.status}
        elapsedLabel={formatElapsed(elapsedSeconds)}
        dateLabel={workspaceDateLabel}
        onAmbientConsult={handleOpenAmbientConsultation}
        onExit={handleExitVisit}
        onComplete={handleCompleteVisit}
        onStart={handleStartVisit}
        canAmbientConsult={canDocumentConsultation}
        canStart={canStartConsult}
        canComplete={canCompleteVisit}
      />

      <Grid container spacing={2} sx={{ flex: 1, minHeight: 0, height: "100%", overflow: "hidden", alignItems: "stretch" }}>
        <Grid item xs={12} lg={3} sx={{ minHeight: 0 }}>
          <PatientGlobalHeader
            variant="opd"
            patientName={encounter.patientName}
            mrn={encounter.mrn}
            ageGender={encounter.ageGender}
            primaryContext={`Chief complaint: ${encounter.chiefComplaint || "--"}`}
            providerLabel="Doctor"
            providerName={encounter.doctor}
            summaryItems={[
              { label: "Age", value: getPatientAge(encounter.ageGender) },
              { label: "Gender", value: getPatientGender(encounter.ageGender) },
              { label: "Department", value: encounter.department || "--" },
              { label: "Check-in Time", value: encounter.appointmentTime || "--" },
            ]}
            statusChips={[
              { label: `Status: ${toDisplayStatusLabel(encounter.status)}`, color: encounter.status === "COMPLETED" ? "success" : "info", variant: "outlined" },
              { label: `Priority: ${encounter.queuePriority}`, color: encounter.queuePriority === "Urgent" ? "error" : "info", variant: "outlined" },
              ...(allergyList.length === 0 ? [{ label: "No known allergies", color: "success" as const, variant: "outlined" as const }] : allergyList.slice(0, 2).map((a) => ({ label: `Allergy: ${a}`, color: "error" as const, variant: "outlined" as const }))),
            ]}
          >
            <Stack spacing={0.8} sx={{ pt: 0.4 }}>
              <Button variant="contained" color="secondary" disabled={!canTransferToIpd} onClick={handleOpenTransferToIpd}>
                Move Patient to IPD
              </Button>
            </Stack>
          </PatientGlobalHeader>
        </Grid>

        <Grid item xs={12} lg={9} sx={{ minHeight: 0, height: "100%", display: "flex", width: "100%", overflow: "hidden" }}>
          <Card elevation={0} sx={{ display: "flex", flexDirection: "column", flex: 1, height: "100%", p: 1.5, borderRadius: 2, boxShadow: "0 12px 24px rgba(15, 23, 42, 0.06)", overflowY: "hidden" }}>
            <CustomCardTabs showBackground scrollable={true} tabsSx={{ p: 1, borderRadius: 2, }} sticky={true} items={tabs} />
          </Card>
        </Grid>
      </Grid>

      <CommonDialog
        open={transferDialogOpen}
        onClose={() => setTransferDialogOpen(false)}
        title="Move Patient to IPD (Admissions Lead)"
        content={
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select fullWidth label="Transfer Priority" value={transferDraft.priority} onChange={(e) => setTransferDraft((p: any) => ({ ...p, priority: e.target.value }))}>
              {["Routine", "Urgent", "Emergency"].map((o) => (<MenuItem key={o} value={o}>{o}</MenuItem>))}
            </TextField>
            <TextField select fullWidth label="Preferred Ward" value={transferDraft.preferredWard} onChange={(e) => setTransferDraft((p: any) => ({ ...p, preferredWard: e.target.value }))}>
              {["Medical Ward - 1", "Medical Ward - 2", "Surgical Ward - 1", "ICU", "HDU"].map((o) => (<MenuItem key={o} value={o}>{o}</MenuItem>))}
            </TextField>
            <TextField fullWidth label="Provisional Diagnosis" value={transferDraft.provisionalDiagnosis} onChange={(e) => setTransferDraft((p: any) => ({ ...p, provisionalDiagnosis: e.target.value }))} />
            <TextField fullWidth multiline minRows={2} label="Admission Reason" value={transferDraft.admissionReason} onChange={(e) => setTransferDraft((p: any) => ({ ...p, admissionReason: e.target.value }))} />
            <TextField fullWidth multiline minRows={2} label="Internal Note" value={transferDraft.requestNote} onChange={(e) => setTransferDraft((p: any) => ({ ...p, requestNote: e.target.value }))} />
          </Stack>
        }
        actions={<><Button onClick={() => setTransferDialogOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleSubmitTransferToIpd}>Move to IPD</Button></>}
      />

      <CommonDialog
        open={ambientDialogOpen}
        onClose={() => setAmbientDialogOpen(false)}
        maxWidth="md"
        title="Ambient Interaction"
        icon={<MicIcon color="primary" fontSize="small" />}
        content={
          <Stack spacing={1} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">Paste full consultation conversation. Ambient engine will populate key consultation fields.</Typography>
            <TextField fullWidth multiline minRows={15} label="Full Consultation Transcript" placeholder="e.g. Chief Complaint: Fever and body ache..." value={ambientTranscript} onChange={(e) => setAmbientTranscript(e.target.value)} variant="outlined" />
          </Stack>
        }
        actions={<><Button onClick={() => setAmbientDialogOpen(false)}>Cancel</Button><Button variant="contained" startIcon={<MicIcon />} onClick={applyAmbientData}>Apply Ambient Text</Button></>}
      />
    </OpdLayout>
  );
}
