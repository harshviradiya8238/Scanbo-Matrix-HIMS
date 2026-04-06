"use client";

import * as React from "react";
import {
  Button,
  Chip,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import {
  Biotech as BiotechIcon,
  DeleteOutline as DeleteOutlineIcon,
  Description as DescriptionIcon,
  EditOutlined as EditOutlinedIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { useAppDispatch } from "@/src/store/hooks";
import { addNote, updateEncounter } from "@/src/store/slices/opdSlice";
import { OpdEncounterCase } from "../../../../opd-mock-data";
import OpdTable from "../../../../components/OpdTable";
import { CommonDialog } from "@/src/ui/components/molecules";

interface DiagnosisCatalogItem {
  id: string;
  name: string;
  icd10: string;
}

interface DiagnosisLine {
  id: string;
  diagnosisId: string;
  diagnosisName: string;
  icd10: string;
  type: "Primary" | "Secondary" | "Provisional" | "Differential";
  status: "Active" | "Resolved" | "Ruled Out";
  notes: string;
}

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

interface DiagnosisTabProps {
  encounter: OpdEncounterCase | undefined;
  canDocumentConsultation: boolean;
  historyDraft: HistoryDraft;
  setSnackbar: (snackbar: {
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }) => void;
  guardRoleAction: (allowed: boolean, actionLabel: string) => boolean;
  soap: SoapNote;
  setSoap: React.Dispatch<React.SetStateAction<SoapNote>>;
}

const DIAGNOSIS_CATALOG: DiagnosisCatalogItem[] = [
  { id: "dx-1", name: "Type 2 Diabetes Mellitus", icd10: "E11.9" },
  { id: "dx-2", name: "Hypertension", icd10: "I10" },
  { id: "dx-3", name: "Coronary artery disease", icd10: "I25.10" },
  { id: "dx-4", name: "Migraine", icd10: "G43.909" },
  { id: "dx-5", name: "Recurrent pharyngitis", icd10: "J02.9" },
  { id: "dx-6", name: "Acute sinusitis", icd10: "J01.90" },
];

const DIAGNOSIS_TYPE_OPTIONS: DiagnosisLine["type"][] = [
  "Primary",
  "Secondary",
  "Provisional",
  "Differential",
];

const DIAGNOSIS_STATUS_OPTIONS: DiagnosisLine["status"][] = [
  "Active",
  "Resolved",
  "Ruled Out",
];

const buildDiagnosisLineFromCatalog = (
  item?: DiagnosisCatalogItem,
): DiagnosisLine => ({
  id: `dx-line-${Date.now()}`,
  diagnosisId: item?.id ?? "",
  diagnosisName: item?.name ?? "",
  icd10: item?.icd10 ?? "",
  type: "Primary",
  status: "Active",
  notes: "",
});

const mapProblemToDiagnosisLine = (
  problem: string,
  index: number,
): DiagnosisLine => {
  const fromCatalog = DIAGNOSIS_CATALOG.find(
    (item) => item.name.toLowerCase() === problem.toLowerCase(),
  );

  return {
    id: `dx-existing-${index}-${problem.toLowerCase().replace(/\s+/g, "-")}`,
    diagnosisId: fromCatalog?.id ?? "",
    diagnosisName: problem,
    icd10: fromCatalog?.icd10 ?? "",
    type: index === 0 ? "Primary" : "Secondary",
    status: "Active",
    notes: "",
  };
};

export default function DiagnosisTab({
  encounter,
  canDocumentConsultation,
  historyDraft,
  setSnackbar,
  guardRoleAction,
  soap,
  setSoap,
}: DiagnosisTabProps) {
  const dispatch = useAppDispatch();
  const [diagnosisDialogOpen, setDiagnosisDialogOpen] = React.useState(false);
  const [diagnosisLines, setDiagnosisLines] = React.useState<DiagnosisLine[]>(
    [],
  );
  const [diagnosisDraft, setDiagnosisDraft] = React.useState<DiagnosisLine>(
    () => buildDiagnosisLineFromCatalog(DIAGNOSIS_CATALOG[0]),
  );
  const [editingDiagnosisId, setEditingDiagnosisId] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    if (!encounter) return;
    setDiagnosisLines(
      (encounter.problems ?? []).map((problem, index) =>
        mapProblemToDiagnosisLine(problem, index),
      ),
    );
    setDiagnosisDraft(buildDiagnosisLineFromCatalog(DIAGNOSIS_CATALOG[0]));
    setEditingDiagnosisId(null);
    setDiagnosisDialogOpen(false);
  }, [encounter?.id]);

  const persistDiagnosisProblems = (nextLines: DiagnosisLine[]) => {
    if (!encounter) return;
    dispatch(
      updateEncounter({
        id: encounter.id,
        changes: {
          problems: nextLines.map((line) => line.diagnosisName).filter(Boolean),
        },
      }),
    );
  };

  const resetDiagnosisForm = React.useCallback(() => {
    setDiagnosisDraft(buildDiagnosisLineFromCatalog(DIAGNOSIS_CATALOG[0]));
    setEditingDiagnosisId(null);
  }, []);

  const openDiagnosisDialog = () => {
    if (
      !guardRoleAction(
        canDocumentConsultation,
        "manage diagnosis details in this encounter",
      )
    )
      return;
    resetDiagnosisForm();
    setDiagnosisDialogOpen(true);
  };

  const closeDiagnosisDialog = () => {
    setDiagnosisDialogOpen(false);
    resetDiagnosisForm();
  };

  const handleDiagnosisSelection = (diagnosisId: string) => {
    const selected = DIAGNOSIS_CATALOG.find((item) => item.id === diagnosisId);
    setDiagnosisDraft((prev) => ({
      ...prev,
      diagnosisId,
      diagnosisName: selected?.name ?? "",
      icd10: selected?.icd10 ?? "",
    }));
  };

  const handleEditDiagnosis = (diagnosisId: string) => {
    if (!guardRoleAction(canDocumentConsultation, "edit diagnosis details"))
      return;
    const selected = diagnosisLines.find((line) => line.id === diagnosisId);
    if (!selected) return;
    setDiagnosisDraft({
      ...selected,
      id: `dx-edit-${Date.now()}`,
    });
    setEditingDiagnosisId(selected.id);
    setDiagnosisDialogOpen(true);
  };

  const handleDeleteDiagnosis = (diagnosisId: string) => {
    if (!guardRoleAction(canDocumentConsultation, "delete diagnosis entries"))
      return;
    const next = diagnosisLines.filter((line) => line.id !== diagnosisId);
    setDiagnosisLines(next);
    persistDiagnosisProblems(next);
    if (editingDiagnosisId === diagnosisId) {
      resetDiagnosisForm();
    }
    setSoap((prev) => ({
      ...prev,
      assessment: next.length
        ? next.map((line) => line.diagnosisName).join(", ")
        : "",
    }));
    setSnackbar({
      open: true,
      message: "Diagnosis removed successfully.",
      severity: "success",
    });
  };

  const handleSaveDiagnosis = () => {
    if (!guardRoleAction(canDocumentConsultation, "save diagnosis details"))
      return;
    const name = diagnosisDraft.diagnosisName.trim();
    if (!name) {
      setSnackbar({
        open: true,
        message: "Diagnosis is required.",
        severity: "error",
      });
      return;
    }

    const normalizedName = name.toLowerCase();
    const duplicate = diagnosisLines.some(
      (line) =>
        line.diagnosisName.trim().toLowerCase() === normalizedName &&
        line.id !== editingDiagnosisId,
    );

    if (duplicate) {
      setSnackbar({
        open: true,
        message: "Diagnosis already added.",
        severity: "error",
      });
      return;
    }

    const payload: DiagnosisLine = {
      ...diagnosisDraft,
      diagnosisName: name,
    };

    if (editingDiagnosisId) {
      const next = diagnosisLines.map((line) =>
        line.id === editingDiagnosisId
          ? { ...payload, id: editingDiagnosisId }
          : line,
      );
      setDiagnosisLines(next);
      persistDiagnosisProblems(next);
      setSoap((prev) => ({
        ...prev,
        assessment: next.map((line) => line.diagnosisName).join(", "),
      }));
      closeDiagnosisDialog();
      setSnackbar({
        open: true,
        message: "Diagnosis updated successfully.",
        severity: "success",
      });
      return;
    }

    const created: DiagnosisLine = {
      ...payload,
      id: `dx-${Date.now()}`,
    };
    const next = [created, ...diagnosisLines];
    setDiagnosisLines(next);
    persistDiagnosisProblems(next);
    setSoap((prev) => ({
      ...prev,
      assessment: next.map((line) => line.diagnosisName).join(", "),
    }));
    closeDiagnosisDialog();
    setSnackbar({
      open: true,
      message: "Diagnosis added successfully.",
      severity: "success",
    });
  };

  const saveClinicalNote = () => {
    if (!guardRoleAction(canDocumentConsultation, "save consultation notes"))
      return;
    if (!encounter) return;
    if (!soap.assessment.trim() || !soap.plan.trim()) {
      setSnackbar({
        open: true,
        message: "Assessment and plan are required.",
        severity: "error",
      });
      return;
    }

    const subjectiveSummary = [
      historyDraft.chiefComplaint
        ? `Chief Complaint: ${historyDraft.chiefComplaint}`
        : "",
      historyDraft.hpi ? `HPI: ${historyDraft.hpi}` : "",
      historyDraft.duration ? `Duration: ${historyDraft.duration}` : "",
      historyDraft.severity ? `Severity: ${historyDraft.severity}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    dispatch(
      addNote({
        id: `note-${Date.now()}`,
        patientId: encounter.id,
        title: `${encounter.patientName} - OPD Progress Note`,
        content: [
          `Subjective: ${subjectiveSummary || soap.subjective}`,
          `Objective: ${soap.objective}`,
          `Assessment: ${soap.assessment}`,
          `Plan: ${soap.plan}`,
        ].join("\n"),
        savedAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        author: encounter.doctor,
      }),
    );

    setSnackbar({
      open: true,
      message: "Clinical consultation note captured.",
      severity: "success",
    });
  };

  return (
    <Stack spacing={1.2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <BiotechIcon color="primary" fontSize="small" />
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Diagnosis
        </Typography>
      </Stack>
      <OpdTable
        title="Diagnosis List"
        action={
          <Button
            variant="outlined"
            size="small"
            startIcon={<BiotechIcon />}
            disabled={!canDocumentConsultation}
            onClick={openDiagnosisDialog}
          >
            Manage Diagnosis
          </Button>
        }
        rows={diagnosisLines}
        emptyMessage="No diagnosis added yet."
        rowKey={(row) => row.id}
        variant="card"
        columns={[
          {
            id: "diagnosis",
            label: "Diagnosis",
            render: (row) => (
              <Stack spacing={0.2}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {row.diagnosisName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.icd10 || "ICD code not set"}
                </Typography>
              </Stack>
            ),
          },
          { id: "type", label: "Type", render: (row) => row.type },
          {
            id: "status",
            label: "Status",
            render: (row) => (
              <Chip
                size="small"
                label={row.status}
                color={
                  row.status === "Active"
                    ? "success"
                    : row.status === "Resolved"
                      ? "default"
                      : "warning"
                }
                variant={row.status === "Active" ? "filled" : "outlined"}
              />
            ),
          },
          {
            id: "notes",
            label: "Notes",
            render: (row) => row.notes || "--",
          },
          {
            id: "actions",
            label: "Actions",
            align: "right",
            render: (row) => (
              <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                <IconButton
                  size="small"
                  aria-label="Edit diagnosis"
                  disabled={!canDocumentConsultation}
                  onClick={() => handleEditDiagnosis(row.id)}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label="Delete diagnosis"
                  color="error"
                  disabled={!canDocumentConsultation}
                  onClick={() => handleDeleteDiagnosis(row.id)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
            ),
          },
        ]}
      />

      <Stack spacing={1}>
        <Stack direction="row" spacing={0.8} alignItems="center">
          <DescriptionIcon color="primary" fontSize="small" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Assessment & Plan
          </Typography>
        </Stack>
        <TextField
          fullWidth
          multiline
          minRows={4}
          label="Clinical Assessment"
          value={soap.assessment}
          onChange={(event) =>
            setSoap((prev: any) => ({
              ...prev,
              assessment: event.target.value,
            }))
          }
        />
        <TextField
          fullWidth
          multiline
          minRows={4}
          label="Treatment Plan"
          value={soap.plan}
          onChange={(event) =>
            setSoap((prev: any) => ({
              ...prev,
              plan: event.target.value,
            }))
          }
        />
      </Stack>
      <Stack direction="row" justifyContent="flex-end">
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={!canDocumentConsultation}
          onClick={saveClinicalNote}
        >
          Save Consultation Note
        </Button>
      </Stack>

      <CommonDialog
        open={diagnosisDialogOpen}
        onClose={closeDiagnosisDialog}
        maxWidth="md"
        title={editingDiagnosisId ? "Edit Diagnosis" : "Add Diagnosis"}
        icon={<BiotechIcon fontSize="small" />}
        contentDividers
        content={
          <Stack spacing={1.5}>
            <Grid container spacing={1.2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Diagnosis Catalog"
                  value={diagnosisDraft.diagnosisId}
                  onChange={(event) =>
                    handleDiagnosisSelection(event.target.value)
                  }
                >
                  <MenuItem value="">Select diagnosis</MenuItem>
                  {DIAGNOSIS_CATALOG.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name} ({item.icd10})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Search Diagnosis"
                  placeholder="Type to search or enter custom diagnosis"
                  value={diagnosisDraft.diagnosisName}
                  onChange={(event) =>
                    setDiagnosisDraft((prev) => ({
                      ...prev,
                      diagnosisName: event.target.value,
                    }))
                  }
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Diagnosis Type"
                  value={diagnosisDraft.type}
                  onChange={(event) =>
                    setDiagnosisDraft((prev) => ({
                      ...prev,
                      type: event.target.value as DiagnosisLine["type"],
                    }))
                  }
                >
                  {DIAGNOSIS_TYPE_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Diagnosis Status"
                  value={diagnosisDraft.status}
                  onChange={(event) =>
                    setDiagnosisDraft((prev) => ({
                      ...prev,
                      status: event.target.value as DiagnosisLine["status"],
                    }))
                  }
                >
                  {DIAGNOSIS_STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="ICD-10 Code"
                  value={diagnosisDraft.icd10}
                  onChange={(event) =>
                    setDiagnosisDraft((prev) => ({
                      ...prev,
                      icd10: event.target.value,
                    }))
                  }
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Diagnosis Notes"
              value={diagnosisDraft.notes}
              onChange={(event) =>
                setDiagnosisDraft((prev: any) => ({
                  ...prev,
                  notes: event.target.value,
                }))
              }
            />
          </Stack>
        }
        actions={
          <>
            <Button onClick={closeDiagnosisDialog}>Cancel</Button>
            <Button
              variant="contained"
              startIcon={<BiotechIcon />}
              onClick={handleSaveDiagnosis}
            >
              {editingDiagnosisId ? "Update Diagnosis" : "Add Diagnosis"}
            </Button>
          </>
        }
      />
    </Stack>
  );
}
