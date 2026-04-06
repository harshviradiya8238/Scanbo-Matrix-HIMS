"use client";

import * as React from "react";
import {
  Box,
  Button,
  Card,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import {
  History as HistoryIcon,
  HistoryEdu as HistoryEduIcon,
  LibraryAdd as LibraryAddIcon,
  RecordVoiceOver as RecordVoiceOverIcon,
  TextSnippet as TextSnippetIcon,
} from "@mui/icons-material";
import { useAppDispatch } from "@/src/store/hooks";
import { updateEncounter, OpdNote } from "@/src/store/slices/opdSlice";
import { OpdEncounterCase } from "../../../../opd-mock-data";
import { CommonDialog } from "@/src/ui/components/molecules";

interface HistoryDraft {
  chiefComplaint: string;
  hpi: string;
  duration: string;
  severity: string;
}

interface HistoryTemplate {
  id: string;
  name: string;
  chiefComplaint: string;
  hpi: string;
  duration: string;
  severity: string;
}

interface SymptomDraft {
  symptom: string;
  duration: string;
  severity: string;
}

interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface HistoryTabProps {
  encounter: OpdEncounterCase | undefined;
  canDocumentConsultation: boolean;
  priorEncounters: OpdEncounterCase[];
  priorNotes: OpdNote[];
  setSnackbar: (snackbar: {
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }) => void;
  guardRoleAction: (allowed: boolean, actionLabel: string) => boolean;
  historyDraft: HistoryDraft;
  setHistoryDraft: React.Dispatch<React.SetStateAction<HistoryDraft>>;
  setSoap: React.Dispatch<React.SetStateAction<SoapNote>>;
}

const HISTORY_TEMPLATES: HistoryTemplate[] = [
  {
    id: "h-tpl-1",
    name: "Chest Pain Review",
    chiefComplaint:
      "Chest discomfort and shortness of breath for the past 2 days",
    hpi: "Intermittent retrosternal discomfort on exertion with mild breathlessness. No syncope or active palpitations.",
    duration: "1-3 days",
    severity: "Moderate",
  },
  {
    id: "h-tpl-2",
    name: "Diabetes Follow-up",
    chiefComplaint: "High blood sugar with fatigue",
    hpi: "Home glucose readings above target for one week with daytime fatigue and reduced appetite. No vomiting or abdominal pain.",
    duration: "4-7 days",
    severity: "Moderate",
  },
  {
    id: "h-tpl-3",
    name: "Acute Respiratory",
    chiefComplaint: "Fever and cough with breathlessness",
    hpi: "Fever with productive cough and exertional breathlessness. Symptoms worsening since onset.",
    duration: "1-3 days",
    severity: "Severe",
  },
];

export default function HistoryTab({
  encounter,
  canDocumentConsultation,
  priorEncounters,
  priorNotes,
  setSnackbar,
  guardRoleAction,
  historyDraft,
  setHistoryDraft,
  setSoap,
}: HistoryTabProps) {
  const dispatch = useAppDispatch();
  const [historyTemplateOpen, setHistoryTemplateOpen] = React.useState(false);
  const [historyTemplateId, setHistoryTemplateId] = React.useState(
    HISTORY_TEMPLATES[0]?.id ?? "",
  );
  const [symptomDialogOpen, setSymptomDialogOpen] = React.useState(false);
  const [symptomDraft, setSymptomDraft] = React.useState<SymptomDraft>({
    symptom: "",
    duration: "",
    severity: "",
  });
  const [pastHistoryOpen, setPastHistoryOpen] = React.useState(false);

  React.useEffect(() => {
    if (!encounter) return;
    setHistoryDraft({
      chiefComplaint: encounter.chiefComplaint || "",
      hpi: encounter.triageNote || "",
      duration: "",
      severity: "",
    });
  }, [encounter?.id]);

  const persistHistoryDraft = (nextDraft: HistoryDraft) => {
    if (!encounter) return;
    dispatch(
      updateEncounter({
        id: encounter.id,
        changes: {
          chiefComplaint: nextDraft.chiefComplaint,
          triageNote: nextDraft.hpi,
        },
      }),
    );
  };

  const handleUseComplaintTemplate = () => {
    if (!guardRoleAction(canDocumentConsultation, "use history templates"))
      return;
    setHistoryTemplateOpen(true);
  };

  const handleApplyComplaintTemplate = () => {
    if (!guardRoleAction(canDocumentConsultation, "apply history templates"))
      return;
    const selected = HISTORY_TEMPLATES.find(
      (item) => item.id === historyTemplateId,
    );
    if (!selected) {
      setSnackbar({
        open: true,
        message: "Select a template to apply.",
        severity: "error",
      });
      return;
    }

    const nextDraft: HistoryDraft = {
      chiefComplaint: selected.chiefComplaint,
      hpi: selected.hpi,
      duration: selected.duration,
      severity: selected.severity,
    };

    setHistoryDraft(nextDraft);
    setSoap((prev) => ({ ...prev, subjective: selected.hpi }));
    persistHistoryDraft(nextDraft);
    setHistoryTemplateOpen(false);
    setSnackbar({
      open: true,
      message: `${selected.name} template applied.`,
      severity: "success",
    });
  };

  const handleAddSymptom = () => {
    if (!guardRoleAction(canDocumentConsultation, "add symptom details"))
      return;
    setSymptomDraft({
      symptom: "",
      duration: historyDraft.duration,
      severity: historyDraft.severity,
    });
    setSymptomDialogOpen(true);
  };

  const handleSaveSymptom = () => {
    if (!guardRoleAction(canDocumentConsultation, "save symptom details"))
      return;
    const symptom = symptomDraft.symptom.trim();
    if (!symptom) {
      setSnackbar({
        open: true,
        message: "Symptom name is required.",
        severity: "error",
      });
      return;
    }

    const symptomDuration =
      symptomDraft.duration || historyDraft.duration || "Unspecified duration";
    const symptomSeverity =
      symptomDraft.severity || historyDraft.severity || "Unspecified severity";
    const symptomLine = `- ${symptom} (${symptomDuration}, ${symptomSeverity})`;
    const nextHpi = historyDraft.hpi
      ? `${historyDraft.hpi}\n${symptomLine}`
      : symptomLine;
    const nextDraft: HistoryDraft = {
      ...historyDraft,
      hpi: nextHpi,
      duration: symptomDraft.duration || historyDraft.duration,
      severity: symptomDraft.severity || historyDraft.severity,
    };

    setHistoryDraft(nextDraft);
    setSoap((prev) => ({ ...prev, subjective: nextHpi }));
    persistHistoryDraft(nextDraft);
    setSymptomDialogOpen(false);
    setSnackbar({
      open: true,
      message: "Symptom added to HPI.",
      severity: "success",
    });
  };

  const handleViewPastHistory = () => {
    setPastHistoryOpen(true);
  };

  const handleInsertPastHistory = (sourceEncounterId: string) => {
    if (
      !guardRoleAction(canDocumentConsultation, "insert past history details")
    )
      return;
    const source = priorEncounters.find(
      (item) => item.id === sourceEncounterId,
    );
    if (!source) {
      setSnackbar({
        open: true,
        message: "Unable to find selected past encounter.",
        severity: "error",
      });
      return;
    }

    const summary = `Past history (${source.appointmentTime}): ${source.chiefComplaint}. ${source.triageNote}`;
    const nextHpi = historyDraft.hpi
      ? `${historyDraft.hpi}\n${summary}`
      : summary;
    const nextDraft = { ...historyDraft, hpi: nextHpi };

    setHistoryDraft(nextDraft);
    setSoap((prev) => ({ ...prev, subjective: nextHpi }));
    persistHistoryDraft(nextDraft);
    setPastHistoryOpen(false);
    setSnackbar({
      open: true,
      message: "Past history inserted into HPI.",
      severity: "success",
    });
  };

  return (
    <Stack spacing={1.2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <HistoryIcon color="primary" fontSize="small" />
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          History
        </Typography>
      </Stack>
      <Card variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
        <Stack spacing={1.1}>
          <Stack direction="row" spacing={0.6} alignItems="center">
            <RecordVoiceOverIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Chief Complaint
            </Typography>
          </Stack>
          <TextField
            fullWidth
            required
            multiline
            minRows={3}
            label="Primary Complaint"
            value={historyDraft.chiefComplaint}
            onChange={(event) => {
              const nextDraft = {
                ...historyDraft,
                chiefComplaint: event.target.value,
              };
              setHistoryDraft(nextDraft);
              persistHistoryDraft(nextDraft);
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Brief description of the patient&apos;s main concern.
          </Typography>
          <Stack direction="row" spacing={0.8} flexWrap="wrap">
            <Button
              variant="outlined"
              size="small"
              startIcon={<TextSnippetIcon />}
              onClick={handleUseComplaintTemplate}
            >
              Use Template
            </Button>
          </Stack>
        </Stack>
      </Card>

      <Card variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
        <Stack spacing={1.1}>
          <Stack direction="row" spacing={0.6} alignItems="center">
            <HistoryEduIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              History of Present Illness (HPI)
            </Typography>
          </Stack>
          <TextField
            fullWidth
            multiline
            minRows={6}
            label="Detailed History"
            value={historyDraft.hpi}
            onChange={(event) => {
              const nextHpi = event.target.value;
              const nextDraft = { ...historyDraft, hpi: nextHpi };
              setHistoryDraft(nextDraft);
              setSoap((prev) => ({ ...prev, subjective: nextHpi }));
              persistHistoryDraft(nextDraft);
            }}
          />
          <Grid container spacing={1.2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Duration"
                value={historyDraft.duration}
                onChange={(event) => {
                  const nextDraft = {
                    ...historyDraft,
                    duration: event.target.value,
                  };
                  setHistoryDraft(nextDraft);
                }}
              >
                <MenuItem value="">Select duration</MenuItem>
                {[
                  "Less than 24 hours",
                  "1-3 days",
                  "4-7 days",
                  "1-2 weeks",
                  "2-4 weeks",
                  "More than 1 month",
                ].map((durationOption) => (
                  <MenuItem key={durationOption} value={durationOption}>
                    {durationOption}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Severity"
                value={historyDraft.severity}
                onChange={(event) => {
                  const nextDraft = {
                    ...historyDraft,
                    severity: event.target.value,
                  };
                  setHistoryDraft(nextDraft);
                }}
              >
                <MenuItem value="">Select severity</MenuItem>
                {["Mild", "Moderate", "Severe"].map((severityOption) => (
                  <MenuItem key={severityOption} value={severityOption}>
                    {severityOption}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Stack direction="row" spacing={0.8} flexWrap="wrap">
            <Button
              variant="outlined"
              size="small"
              startIcon={<LibraryAddIcon />}
              onClick={handleAddSymptom}
            >
              Add Symptom
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<HistoryIcon />}
              onClick={handleViewPastHistory}
            >
              Past History
            </Button>
          </Stack>
        </Stack>
      </Card>

      <CommonDialog
        open={historyTemplateOpen}
        onClose={() => setHistoryTemplateOpen(false)}
        maxWidth="sm"
        title="Use History Template"
        icon={<TextSnippetIcon fontSize="small" />}
        contentDividers
        content={
          <Stack spacing={1.2}>
            <TextField
              select
              fullWidth
              label="Template"
              value={historyTemplateId}
              onChange={(event) => setHistoryTemplateId(event.target.value)}
            >
              {HISTORY_TEMPLATES.map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.name}
                </MenuItem>
              ))}
            </TextField>
            {(() => {
              const selected = HISTORY_TEMPLATES.find(
                (item) => item.id === historyTemplateId,
              );
              if (!selected) return null;
              return (
                <Card variant="outlined" sx={{ p: 1, borderRadius: 1.5 }}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Chief Complaint
                    </Typography>
                    <Typography variant="body2">
                      {selected.chiefComplaint}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      HPI
                    </Typography>
                    <Typography variant="body2">{selected.hpi}</Typography>
                  </Stack>
                </Card>
              );
            })()}
          </Stack>
        }
        actions={
          <>
            <Button onClick={() => setHistoryTemplateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<TextSnippetIcon />}
              onClick={handleApplyComplaintTemplate}
            >
              Apply Template
            </Button>
          </>
        }
      />

      <CommonDialog
        open={symptomDialogOpen}
        onClose={() => setSymptomDialogOpen(false)}
        maxWidth="sm"
        title="Add Symptom"
        icon={<LibraryAddIcon fontSize="small" />}
        contentDividers
        content={
          <Stack spacing={1.2}>
            <TextField
              fullWidth
              required
              label="Symptom"
              value={symptomDraft.symptom}
              onChange={(event) =>
                setSymptomDraft((prev) => ({
                  ...prev,
                  symptom: event.target.value,
                }))
              }
            />
            <TextField
              select
              fullWidth
              label="Duration"
              value={symptomDraft.duration}
              onChange={(event) =>
                setSymptomDraft((prev) => ({
                  ...prev,
                  duration: event.target.value,
                }))
              }
            >
              <MenuItem value="">Select duration</MenuItem>
              {[
                "Less than 24 hours",
                "1-3 days",
                "4-7 days",
                "1-2 weeks",
                "2-4 weeks",
                "More than 1 month",
              ].map((durationOption) => (
                <MenuItem key={durationOption} value={durationOption}>
                  {durationOption}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Severity"
              value={symptomDraft.severity}
              onChange={(event) =>
                setSymptomDraft((prev: any) => ({
                  ...prev,
                  severity: event.target.value,
                }))
              }
            >
              <MenuItem value="">Select severity</MenuItem>
              {["Mild", "Moderate", "Severe"].map((severityOption) => (
                <MenuItem key={severityOption} value={severityOption}>
                  {severityOption}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        }
        actions={
          <>
            <Button onClick={() => setSymptomDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              startIcon={<LibraryAddIcon />}
              onClick={handleSaveSymptom}
            >
              Add Symptom
            </Button>
          </>
        }
      />

      <CommonDialog
        open={pastHistoryOpen}
        onClose={() => setPastHistoryOpen(false)}
        maxWidth="md"
        title="Past History"
        icon={<HistoryIcon fontSize="small" />}
        contentDividers
        content={
          <Stack spacing={1.2}>
            {priorEncounters.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No previous encounters available for this patient.
              </Typography>
            ) : (
              priorEncounters.map((item) => (
                <Card
                  key={item.id}
                  variant="outlined"
                  sx={{ p: 1.2, borderRadius: 1.5 }}
                >
                  <Stack spacing={0.8}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {item.appointmentTime} • {item.department}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<TextSnippetIcon />}
                        onClick={() => handleInsertPastHistory(item.id)}
                      >
                        Insert in HPI
                      </Button>
                    </Stack>
                    <Typography variant="body2">
                      <strong>Chief Complaint:</strong> {item.chiefComplaint}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Triage Note:</strong> {item.triageNote}
                    </Typography>
                  </Stack>
                </Card>
              ))
            )}

            {priorNotes.length > 0 ? (
              <Card variant="outlined" sx={{ p: 1.2, borderRadius: 1.5 }}>
                <Stack spacing={0.8}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Previous Consultation Notes
                  </Typography>
                  {priorNotes.slice(0, 5).map((note) => (
                    <Typography
                      key={note.id}
                      variant="caption"
                      color="text.secondary"
                    >
                      {note.savedAt} • {note.author} • {note.title}
                    </Typography>
                  ))}
                </Stack>
              </Card>
            ) : null}
          </Stack>
        }
        actions={
          <Button onClick={() => setPastHistoryOpen(false)}>Close</Button>
        }
      />
    </Stack>
  );
}
