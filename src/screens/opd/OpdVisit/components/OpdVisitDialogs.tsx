import * as React from "react";
import {
  Mic as MicIcon,
  TextSnippet as TextSnippetIcon,
  LibraryAdd as LibraryAddIcon,
  WarningAmber as WarningAmberIcon,
  Biotech as BiotechIcon,
  Description as DescriptionIcon,
  Science as ScienceIcon,
  Medication as MedicationIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Timer as TimerIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { Card, CommonDialog } from "@/src/ui/components/molecules";
import {
  Alert,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { OpdVisitData } from "../utils/opd-visit-types";
import {
  HISTORY_TEMPLATES,
  DIAGNOSIS_CATALOG,
  DIAGNOSIS_TYPE_OPTIONS,
  DIAGNOSIS_STATUS_OPTIONS,
} from "../utils/opd-visit.utils";
import { AdmissionPriority } from "@/src/screens/ipd/ipd-mock-data";
import { useOpdData } from "@/src/store/opdHooks";

export const OpdVisitDialogs = ({ data }: { data: OpdVisitData }) => {
  const {
    ambientDialogOpen,
    setAmbientDialogOpen,
    ambientInputText,
    setAmbientInputText,
    handleApplyAmbientInteraction,
    historyTemplateOpen,
    setHistoryTemplateOpen,
    historyTemplateId,
    setHistoryTemplateId,
    handleApplyComplaintTemplate,
    symptomDialogOpen,
    setSymptomDialogOpen,
    symptomDraft,
    setSymptomDraft,
    handleSaveSymptom,
    pastHistoryOpen,
    setPastHistoryOpen,
    priorEncounters,
    handleInsertPastHistory,
    priorNotes,
    allergyDialogOpen,
    setAllergyDialogOpen,
    allergyInput,
    setAllergyInput,
    editingAllergyIndex,
    handleSaveAllergy,
    diagnosisDialogOpen,
    setDiagnosisDialogOpen,
    diagnosisDraft,
    setDiagnosisDraft,
    editingDiagnosisId,
    handleSaveDiagnosis,
    notesDialogOpen,
    setNotesDialogOpen,
    notesDraft,
    setNotesDraft,
    editingNoteId,
    handleSaveNotesFromDialog,
    ordersDialogOpen,
    setOrdersDialogOpen,
    orderCategoryFilter,
    setOrderCategoryFilter,
    orderDraft,
    setOrderDraft,
    editingOrderId,
    filteredOrderCatalog,
    rxShieldDialogOpen,
    setRxShieldDialogOpen,
    encounterPrescriptions,
    rxShieldFindings,
    prescriptionDialogOpen,
    setPrescriptionDialogOpen,
    prescriptionDraft,
    setPrescriptionDraft,
    editingPrescriptionId,
    handleSavePrescription,
    transferDialogOpen,
    setTransferDialogOpen,
    encounter,
    transferDraft,
    setTransferDraft,
    handleSubmitTransferToIpd,
    capabilities,
  } = data;

  const { medicationCatalog } = useOpdData();

  return (
    <>
      <CommonDialog
        open={ambientDialogOpen}
        onClose={() => setAmbientDialogOpen(false)}
        maxWidth="sm"
        title="Ambient Interaction"
        icon={<MicIcon fontSize="small" />}
        description="Paste full consultation conversation. Ambient engine will populate key consultation fields."
        contentDividers
        content={
          <TextField
            fullWidth
            multiline
            minRows={5}
            label="Full Consultation Transcript"
            value={ambientInputText}
            onChange={(event) => setAmbientInputText(event.target.value)}
          />
        }
        actions={
          <>
            <Button onClick={() => setAmbientDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              startIcon={<MicIcon />}
              onClick={handleApplyAmbientInteraction}
            >
              Apply Ambient Text
            </Button>
          </>
        }
      />

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
              {HISTORY_TEMPLATES.map((t: any) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </TextField>
            {(() => {
              const s = HISTORY_TEMPLATES.find(
                (t) => t.id === historyTemplateId,
              );
              if (!s) return null;
              return (
                <Card variant="outlined" sx={{ p: 1, borderRadius: 1.5 }}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Chief Complaint
                    </Typography>
                    <Typography variant="body2">{s.chiefComplaint}</Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      HPI
                    </Typography>
                    <Typography variant="body2">{s.hpi}</Typography>
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
              onChange={(e) =>
                setSymptomDraft((p: any) => ({ ...p, symptom: e.target.value }))
              }
            />
            <TextField
              select
              fullWidth
              label="Duration"
              value={symptomDraft.duration}
              onChange={(e) =>
                setSymptomDraft((p: any) => ({
                  ...p,
                  duration: e.target.value,
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
              ].map((o) => (
                <MenuItem key={o} value={o}>
                  {o}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Severity"
              value={symptomDraft.severity}
              onChange={(e) =>
                setSymptomDraft((p: any) => ({
                  ...p,
                  severity: e.target.value,
                }))
              }
            >
              <MenuItem value="">Select severity</MenuItem>
              {["Mild", "Moderate", "Severe"].map((o) => (
                <MenuItem key={o} value={o}>
                  {o}
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
                No previous encounters available.
              </Typography>
            ) : (
              priorEncounters.map((item: any) => (
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
                  {priorNotes.slice(0, 5).map((note: any) => (
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

      <CommonDialog
        open={allergyDialogOpen}
        onClose={() => setAllergyDialogOpen(false)}
        maxWidth="sm"
        title={editingAllergyIndex === null ? "Add Allergy" : "Edit Allergy"}
        icon={<WarningAmberIcon fontSize="small" />}
        contentDividers
        content={
          <Stack spacing={1.2}>
            <TextField
              fullWidth
              label="Allergy Name"
              value={allergyInput}
              onChange={(e) => setAllergyInput(e.target.value)}
            />
          </Stack>
        }
        actions={
          <>
            <Button onClick={() => setAllergyDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={data.handleSaveAllergy}>
              {editingAllergyIndex === null ? "Add Allergy" : "Update Allergy"}
            </Button>
          </>
        }
      />

      <CommonDialog
        open={diagnosisDialogOpen}
        onClose={() => setDiagnosisDialogOpen(false)}
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
                  label="Catalog"
                  value={diagnosisDraft.diagnosisId}
                  onChange={(e) => {
                    const s = DIAGNOSIS_CATALOG.find(
                      (t: any) => t.id === e.target.value,
                    );
                    setDiagnosisDraft((p: any) => ({
                      ...p,
                      diagnosisId: e.target.value,
                      diagnosisName: s?.name ?? "",
                      icd10: s?.icd10 ?? "",
                    }));
                  }}
                >
                  <MenuItem value="">Select diagnosis</MenuItem>
                  {DIAGNOSIS_CATALOG.map((t: any) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.name} ({t.icd10})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Diagnosis"
                  value={diagnosisDraft.diagnosisName}
                  onChange={(e) =>
                    setDiagnosisDraft((p: any) => ({
                      ...p,
                      diagnosisName: e.target.value,
                    }))
                  }
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="ICD-10"
                  value={diagnosisDraft.icd10}
                  onChange={(e) =>
                    setDiagnosisDraft((p: any) => ({
                      ...p,
                      icd10: e.target.value,
                    }))
                  }
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Type"
                  value={diagnosisDraft.type}
                  onChange={(e) =>
                    setDiagnosisDraft((p: any) => ({
                      ...p,
                      type: e.target.value as any,
                    }))
                  }
                >
                  {DIAGNOSIS_TYPE_OPTIONS.map((o: any) => (
                    <MenuItem key={o} value={o}>
                      {o}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={diagnosisDraft.status}
                  onChange={(e) =>
                    setDiagnosisDraft((p: any) => ({
                      ...p,
                      status: e.target.value as any,
                    }))
                  }
                >
                  {DIAGNOSIS_STATUS_OPTIONS.map((o: any) => (
                    <MenuItem key={o} value={o}>
                      {o}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={diagnosisDraft.notes}
                  onChange={(e) =>
                    setDiagnosisDraft((p: any) => ({
                      ...p,
                      notes: e.target.value,
                    }))
                  }
                />
              </Grid>
            </Grid>
          </Stack>
        }
        actions={
          <>
            <Button onClick={() => setDiagnosisDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSaveDiagnosis}>
              {editingDiagnosisId ? "Update" : "Add"}
            </Button>
          </>
        }
      />

      <CommonDialog
        open={notesDialogOpen}
        onClose={() => setNotesDialogOpen(false)}
        maxWidth="md"
        title={editingNoteId ? "Edit Note" : "Add Note"}
        icon={<DescriptionIcon fontSize="small" />}
        contentDividers
        content={
          <Stack spacing={1.5}>
            <Grid container spacing={1.2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  required
                  label="Title"
                  value={notesDraft.title}
                  onChange={(e) =>
                    setNotesDraft((p: any) => ({ ...p, title: e.target.value }))
                  }
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Author"
                  value={notesDraft.author}
                  onChange={(e) =>
                    setNotesDraft((p: any) => ({
                      ...p,
                      author: e.target.value,
                    }))
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  multiline
                  minRows={6}
                  label="Content"
                  value={notesDraft.content}
                  onChange={(e) =>
                    setNotesDraft((p: any) => ({
                      ...p,
                      content: e.target.value,
                    }))
                  }
                />
              </Grid>
            </Grid>
          </Stack>
        }
        actions={
          <>
            <Button onClick={() => setNotesDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveNotesFromDialog}>
              {editingNoteId ? "Update" : "Add"}
            </Button>
          </>
        }
      />

      <CommonDialog
        open={ordersDialogOpen}
        onClose={() => setOrdersDialogOpen(false)}
        maxWidth="md"
        title={editingOrderId ? "Edit Order" : "Add Order"}
        icon={<ScienceIcon fontSize="small" />}
        contentDividers
        content={
          <Stack spacing={1.5}>
            <Grid container spacing={1.2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Category"
                  value={orderCategoryFilter}
                  onChange={(e) =>
                    setOrderCategoryFilter(e.target.value as any)
                  }
                >
                  {["All", "Lab", "Radiology", "Procedure"].map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  select
                  fullWidth
                  label="Order"
                  value={orderDraft.catalogId}
                  onChange={(e) =>
                    setOrderDraft((p: any) => ({
                      ...p,
                      catalogId: e.target.value,
                    }))
                  }
                >
                  {filteredOrderCatalog.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name} ({c.category})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Priority"
                  value={orderDraft.priority}
                  onChange={(e) =>
                    setOrderDraft((p: any) => ({
                      ...p,
                      priority: e.target.value as any,
                    }))
                  }
                >
                  {["Routine", "Urgent"].map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Instructions"
                  value={orderDraft.instructions}
                  onChange={(e) =>
                    setOrderDraft((p: any) => ({
                      ...p,
                      instructions: e.target.value,
                    }))
                  }
                />
              </Grid>
            </Grid>
          </Stack>
        }
        actions={
          <>
            <Button onClick={() => setOrdersDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={data.handleSaveOrder}>
              {editingOrderId ? "Update Order" : "Add Order"}
            </Button>
          </>
        }
      />

      <CommonDialog
        open={rxShieldDialogOpen}
        onClose={() => setRxShieldDialogOpen(false)}
        maxWidth="sm"
        title="Rx Shield Compare"
        icon={<MedicationIcon fontSize="small" />}
        contentDividers
        content={
          <Stack spacing={1.2}>
            <Typography variant="body2" color="text.secondary">
              Compared by Rx Shield:
            </Typography>
            <Stack spacing={0.6}>
              {encounterPrescriptions.map((item: any) => (
                <Typography key={item.id} variant="body2">
                  • {item.medicationName}
                </Typography>
              ))}
            </Stack>
            {rxShieldFindings.length > 0 ? (
              <Stack spacing={0.8}>
                {rxShieldFindings.map((finding: string) => (
                  <Alert key={finding} severity="warning">
                    {finding}
                  </Alert>
                ))}
              </Stack>
            ) : (
              <Alert severity="success">No interaction issue found.</Alert>
            )}
          </Stack>
        }
        actions={
          <Button onClick={() => setRxShieldDialogOpen(false)}>Close</Button>
        }
      />

      <CommonDialog
        open={prescriptionDialogOpen}
        onClose={() => setPrescriptionDialogOpen(false)}
        maxWidth="md"
        title={editingPrescriptionId ? "Edit Medication" : "Add Medication"}
        icon={<MedicationIcon fontSize="small" />}
        contentDividers
        content={
          <Stack spacing={1.5}>
            <Grid container spacing={1.2}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Medication"
                  value={prescriptionDraft.medicationId}
                  onChange={(e) => {
                    const m = medicationCatalog.find(
                      (i: any) => i.id === e.target.value,
                    );
                    setPrescriptionDraft((p: any) => ({
                      ...p,
                      medicationId: e.target.value,
                      dose: m?.strength ?? p.dose,
                      frequency: m?.commonFrequency ?? p.frequency,
                    }));
                  }}
                >
                  {medicationCatalog.map((i: any) => (
                    <MenuItem key={i.id} value={i.id}>
                      {i.genericName} {i.strength}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Dose"
                  value={prescriptionDraft.dose}
                  onChange={(e) =>
                    setPrescriptionDraft((p: any) => ({
                      ...p,
                      dose: e.target.value,
                    }))
                  }
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Frequency"
                  value={prescriptionDraft.frequency}
                  onChange={(e) =>
                    setPrescriptionDraft((p: any) => ({
                      ...p,
                      frequency: e.target.value,
                    }))
                  }
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Duration (days)"
                  value={prescriptionDraft.durationDays}
                  onChange={(e) =>
                    setPrescriptionDraft((p: any) => ({
                      ...p,
                      durationDays: e.target.value,
                    }))
                  }
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  select
                  fullWidth
                  label="Route"
                  value={prescriptionDraft.route}
                  onChange={(e) =>
                    setPrescriptionDraft((p: any) => ({
                      ...p,
                      route: e.target.value as any,
                    }))
                  }
                >
                  {["Oral", "IV", "IM", "Topical"].map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Instructions"
                  value={prescriptionDraft.instructions}
                  onChange={(e) =>
                    setPrescriptionDraft((p: any) => ({
                      ...p,
                      instructions: e.target.value,
                    }))
                  }
                />
              </Grid>
            </Grid>
          </Stack>
        }
        actions={
          <>
            <Button onClick={() => setPrescriptionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<LocalPharmacyIcon />}
              onClick={handleSavePrescription}
            >
              Save
            </Button>
          </>
        }
      />

      <CommonDialog
        open={transferDialogOpen}
        onClose={() => setTransferDialogOpen(false)}
        maxWidth="sm"
        title="Move Patient to IPD"
        subtitle={
          encounter ? `${encounter.patientName} (${encounter.mrn})` : ""
        }
        contentDividers
        content={
          <Stack spacing={1.5} sx={{ pt: 0.5 }}>
            <Alert severity="info">
              {" "}
              एडमिशन रिक्वेस्ट क्रिएट या अपडेट होगी.
            </Alert>
            <TextField
              select
              fullWidth
              label="Priority"
              value={transferDraft.priority}
              onChange={(e) =>
                setTransferDraft((p) => ({
                  ...p,
                  priority: e.target.value as AdmissionPriority,
                }))
              }
            >
              {["Routine", "Urgent", "Emergency"].map((o) => (
                <MenuItem key={o} value={o}>
                  {o}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Preferred Ward"
              value={transferDraft.preferredWard}
              onChange={(e) =>
                setTransferDraft((p) => ({
                  ...p,
                  preferredWard: e.target.value,
                }))
              }
            >
              {[
                "Medical Ward - 1",
                "Medical Ward - 2",
                "Surgical Ward - 1",
                "ICU",
                "HDU",
              ].map((o) => (
                <MenuItem key={o} value={o}>
                  {o}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Provisional Diagnosis"
              value={transferDraft.provisionalDiagnosis}
              onChange={(e) =>
                setTransferDraft((p) => ({
                  ...p,
                  provisionalDiagnosis: e.target.value,
                }))
              }
            />
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Admission Reason"
              value={transferDraft.admissionReason}
              onChange={(e) =>
                setTransferDraft((p) => ({
                  ...p,
                  admissionReason: e.target.value,
                }))
              }
            />
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Internal Note"
              value={transferDraft.requestNote}
              onChange={(e) =>
                setTransferDraft((p) => ({ ...p, requestNote: e.target.value }))
              }
            />
          </Stack>
        }
        actions={
          <>
            <Button onClick={() => setTransferDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSubmitTransferToIpd}
              disabled={!capabilities.canTransferToIpd}
            >
              Move to IPD
            </Button>
          </>
        }
      />
    </>
  );
};
