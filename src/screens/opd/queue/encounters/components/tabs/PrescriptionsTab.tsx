"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import {
  Medication as MedicationIcon,
  DeleteOutline as DeleteOutlineIcon,
  EditOutlined as EditOutlinedIcon,
  LocalPharmacy as LocalPharmacyIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  addEncounterPrescription,
  removeEncounterPrescription,
  updateEncounter,
  updateEncounterPrescription,
} from "@/src/store/slices/opdSlice";
import {
  MedicationCatalogItem,
  OpdEncounterCase,
  OpdEncounterPrescription,
} from "../../../../opd-mock-data";
import OpdTable from "../../../../components/OpdTable";
import { CommonDialog } from "@/src/ui/components/molecules";

interface PrescriptionDraftLine {
  id: string;
  medicationId: string;
  medicationName: string;
  dose: string;
  frequency: string;
  durationDays: string;
  route: OpdEncounterPrescription["route"];
  instructions: string;
}

interface PrescriptionsTabProps {
  encounter: OpdEncounterCase | undefined;
  canPrescribe: boolean;
  setSnackbar: (snackbar: {
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }) => void;
  guardRoleAction: (allowed: boolean, actionLabel: string) => boolean;
}

const MEDICATION_CATALOG: MedicationCatalogItem[] = [
  {
    id: "med-1",
    genericName: "Paracetamol",
    strength: "500mg",
    form: "Tablet",
    commonFrequency: "1-0-1",
  },
  {
    id: "med-2",
    genericName: "Amoxicillin",
    strength: "250mg",
    form: "Capsule",
    commonFrequency: "1-1-1",
  },
  {
    id: "med-3",
    genericName: "Atorvastatin",
    strength: "20mg",
    form: "Tablet",
    commonFrequency: "0-0-1",
  },
  {
    id: "med-4",
    genericName: "Metformin",
    strength: "500mg",
    form: "Tablet",
    commonFrequency: "1-0-1",
  },
  {
    id: "med-5",
    genericName: "Ibuprofen",
    strength: "400mg",
    form: "Tablet",
    commonFrequency: "1-0-1",
  },
];

const buildPrescriptionLineFromCatalog = (
  item?: MedicationCatalogItem,
): PrescriptionDraftLine => ({
  id: `rx-line-${Date.now()}`,
  medicationId: item?.id ?? "",
  medicationName: item ? `${item.genericName} ${item.strength}` : "",
  dose: item?.strength ?? "",
  frequency: item?.commonFrequency ?? "1-0-1",
  durationDays: "5",
  route: "Oral",
  instructions: "",
});

export default function PrescriptionsTab({
  encounter,
  canPrescribe,
  setSnackbar,
  guardRoleAction,
}: PrescriptionsTabProps) {
  const dispatch = useAppDispatch();
  const allPrescriptions = useAppSelector((state) => state.opd.prescriptions);

  const encounterPrescriptions = React.useMemo(() => {
    if (!encounter) return [];
    return (allPrescriptions as OpdEncounterPrescription[]).filter(
      (item) => item.encounterId === encounter.id,
    );
  }, [allPrescriptions, encounter?.id]);

  const [prescriptionDialogOpen, setPrescriptionDialogOpen] =
    React.useState(false);
  const [rxShieldDialogOpen, setRxShieldDialogOpen] = React.useState(false);
  const [prescriptionDraft, setPrescriptionDraft] =
    React.useState<PrescriptionDraftLine>(() =>
      buildPrescriptionLineFromCatalog(MEDICATION_CATALOG[0]),
    );
  const [editingPrescriptionId, setEditingPrescriptionId] = React.useState<
    string | null
  >(null);

  const openPrescriptionDialog = () => {
    if (
      !guardRoleAction(
        canPrescribe,
        "prescribe medications during this consultation",
      )
    )
      return;
    setEditingPrescriptionId(null);
    setPrescriptionDraft(
      buildPrescriptionLineFromCatalog(MEDICATION_CATALOG[0]),
    );
    setPrescriptionDialogOpen(true);
  };

  const closePrescriptionDialog = () => {
    setPrescriptionDialogOpen(false);
    setEditingPrescriptionId(null);
  };

  const handleMedicationSelection = (medicationId: string) => {
    const selected = MEDICATION_CATALOG.find(
      (item) => item.id === medicationId,
    );
    if (!selected) return;
    setPrescriptionDraft((prev) => ({
      ...prev,
      medicationId,
      medicationName: `${selected.genericName} ${selected.strength}`,
      dose: selected.strength,
      frequency: selected.commonFrequency,
    }));
  };

  const handleEditPrescription = (prescriptionId: string) => {
    if (!guardRoleAction(canPrescribe, "edit prescriptions")) return;
    const selected = encounterPrescriptions.find(
      (item) => item.id === prescriptionId,
    );
    if (!selected) return;
    const catalogItem = MEDICATION_CATALOG.find(
      (item) =>
        `${item.genericName} ${item.strength}` === selected.medicationName,
    );
    setPrescriptionDraft({
      id: selected.id,
      medicationId: catalogItem?.id ?? "",
      medicationName: selected.medicationName,
      dose: selected.dose,
      frequency: selected.frequency,
      durationDays: selected.durationDays,
      route: selected.route,
      instructions: selected.instructions || "",
    });
    setEditingPrescriptionId(selected.id);
    setPrescriptionDialogOpen(true);
  };

  const handleRemovePrescription = (prescriptionId: string) => {
    if (!guardRoleAction(canPrescribe, "remove prescriptions")) return;
    dispatch(removeEncounterPrescription(prescriptionId));
    setSnackbar({
      open: true,
      message: "Medicine removed from prescription.",
      severity: "success",
    });
  };

  const handleSavePrescription = () => {
    if (!guardRoleAction(canPrescribe, "save encounter prescriptions")) return;
    if (!encounter) return;

    if (
      !prescriptionDraft.medicationId ||
      !prescriptionDraft.dose ||
      !prescriptionDraft.frequency ||
      !prescriptionDraft.durationDays
    ) {
      setSnackbar({
        open: true,
        message: "Medication, dose, frequency and duration are required.",
        severity: "error",
      });
      return;
    }

    const medication = MEDICATION_CATALOG.find(
      (item) => item.id === prescriptionDraft.medicationId,
    );
    if (!medication) {
      setSnackbar({
        open: true,
        message: "Invalid medication selected.",
        severity: "error",
      });
      return;
    }

    const issuedAt = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (editingPrescriptionId) {
      dispatch(
        updateEncounterPrescription({
          id: editingPrescriptionId,
          changes: {
            medicationName: `${medication.genericName} ${medication.strength}`,
            dose: prescriptionDraft.dose,
            frequency: prescriptionDraft.frequency,
            durationDays: prescriptionDraft.durationDays,
            route: prescriptionDraft.route,
            instructions: prescriptionDraft.instructions,
            issuedAt,
          },
        }),
      );
      closePrescriptionDialog();
      setSnackbar({
        open: true,
        message: "Prescription item updated.",
        severity: "success",
      });
      return;
    }

    dispatch(
      addEncounterPrescription({
        id: `rx-${Date.now()}`,
        encounterId: encounter.id,
        patientId: encounter.patientId,
        medicationName: `${medication.genericName} ${medication.strength}`,
        dose: prescriptionDraft.dose,
        frequency: prescriptionDraft.frequency,
        durationDays: prescriptionDraft.durationDays,
        route: prescriptionDraft.route,
        instructions: prescriptionDraft.instructions,
        issuedAt,
      }),
    );

    dispatch(
      updateEncounter({
        id: encounter.id,
        changes: { status: "IN_PROGRESS" },
      }),
    );

    closePrescriptionDialog();
    setSnackbar({
      open: true,
      message: "Medicine added to prescription.",
      severity: "success",
    });
  };

  const handleOpenRxShieldComparison = () => {
    if (!guardRoleAction(canPrescribe, "run Rx Shield comparison")) return;
    if (encounterPrescriptions.length < 2) {
      setSnackbar({
        open: true,
        message: "Add at least 2 medicines to run Rx Shield.",
        severity: "info",
      });
      return;
    }
    setRxShieldDialogOpen(true);
  };

  return (
    <Stack spacing={1.2}>
      <OpdTable
        title="Prescriptions"
        action={
          <Stack direction="row" spacing={0.8}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<LocalPharmacyIcon />}
              disabled={!canPrescribe}
              onClick={handleOpenRxShieldComparison}
            >
              Rx Shield
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<MedicationIcon />}
              disabled={!canPrescribe}
              onClick={openPrescriptionDialog}
            >
              + Add Medicine
            </Button>
          </Stack>
        }
        rows={encounterPrescriptions}
        emptyMessage="No medicines prescribed yet."
        rowKey={(row) => (row as OpdEncounterPrescription).id}
        variant="card"
        columns={[
          {
            id: "medicationName",
            label: "Medication",
            render: (row) => {
              const rx = row as OpdEncounterPrescription;
              return (
                <Stack spacing={0.25}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {rx.medicationName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {rx.route} • {rx.instructions || "No custom instructions"}
                  </Typography>
                </Stack>
              );
            },
          },
          {
            id: "doseFreq",
            label: "Dose & Frequency",
            render: (row) =>
              `${(row as OpdEncounterPrescription).dose} • ${(row as OpdEncounterPrescription).frequency}`,
          },
          {
            id: "duration",
            label: "Duration",
            render: (row) =>
              `${(row as OpdEncounterPrescription).durationDays} Days`,
          },
          {
            id: "actions",
            label: "Actions",
            align: "right",
            render: (row) => (
              <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                <IconButton
                  size="small"
                  aria-label="Edit prescription"
                  disabled={!canPrescribe}
                  onClick={() =>
                    handleEditPrescription((row as OpdEncounterPrescription).id)
                  }
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label="Delete medicine"
                  color="error"
                  disabled={!canPrescribe}
                  onClick={() =>
                    handleRemovePrescription(
                      (row as OpdEncounterPrescription).id,
                    )
                  }
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
            ),
          },
        ]}
      />

      <CommonDialog
        open={prescriptionDialogOpen}
        onClose={closePrescriptionDialog}
        maxWidth="md"
        title={editingPrescriptionId ? "Edit Prescription" : "Add Medicine"}
        icon={<MedicationIcon fontSize="small" />}
        contentDividers
        content={
          <Stack spacing={1.5}>
            <Grid container spacing={1.2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Available Medications"
                  value={prescriptionDraft.medicationId}
                  onChange={(e) => handleMedicationSelection(e.target.value)}
                >
                  <MenuItem value="">Select medication</MenuItem>
                  {MEDICATION_CATALOG.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.genericName} {item.strength} ({item.form})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Search Medication"
                  placeholder="Type to search catalog..."
                  value={prescriptionDraft.medicationName}
                  onChange={(e) =>
                    setPrescriptionDraft((p: any) => ({
                      ...p,
                      medicationName: e.target.value,
                    }))
                  }
                />
              </Grid>
              <Grid item xs={12} sm={4}>
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
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Frequency"
                  placeholder="e.g. 1-0-1"
                  value={prescriptionDraft.frequency}
                  onChange={(e) =>
                    setPrescriptionDraft((p: any) => ({
                      ...p,
                      frequency: e.target.value,
                    }))
                  }
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Duration (Days)"
                  type="number"
                  value={prescriptionDraft.durationDays}
                  onChange={(e) =>
                    setPrescriptionDraft((p: any) => ({
                      ...p,
                      durationDays: e.target.value,
                    }))
                  }
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Route"
                  value={prescriptionDraft.route}
                  onChange={(e) =>
                    setPrescriptionDraft((p: any) => ({
                      ...p,
                      route: e.target
                        .value as OpdEncounterPrescription["route"],
                    }))
                  }
                >
                  {["Oral", "Topical", "IV", "IM"].map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Instructions"
                  placeholder="e.g. Take after meals"
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
            <Button onClick={closePrescriptionDialog}>Cancel</Button>
            <Button
              variant="contained"
              startIcon={<MedicationIcon />}
              onClick={handleSavePrescription}
            >
              {editingPrescriptionId
                ? "Update Medicine"
                : "Add to Prescription"}
            </Button>
          </>
        }
      />

      <CommonDialog
        open={rxShieldDialogOpen}
        onClose={() => setRxShieldDialogOpen(false)}
        maxWidth="md"
        title="Rx Shield - Clinical Comparison"
        icon={<LocalPharmacyIcon fontSize="small" color="primary" />}
        contentDividers
        content={
          <Stack spacing={1.5}>
            <Alert severity="info">
              Rx Shield is comparing {encounterPrescriptions.length} medications
              for potential drug-drug interactions and dosage anomalies.
            </Alert>
            <Card variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
              <Stack spacing={1}>
                {encounterPrescriptions.map((rx, idx) => (
                  <Typography key={rx.id} variant="body2">
                    {idx + 1}. {rx.medicationName} ({rx.dose}, {rx.frequency})
                  </Typography>
                ))}
                <Box
                  sx={{
                    mt: 1,
                    pt: 1,
                    borderTop: "1px dashed",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="success.main"
                    sx={{ fontWeight: 700 }}
                  >
                    Analysis Outcome
                  </Typography>
                  <Typography variant="body2">
                    No clinically significant drug-drug interactions detected
                    between selected medications. Dosage frequencies are within
                    standardized therapeutic ranges for adult patients.
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Stack>
        }
        actions={
          <Button onClick={() => setRxShieldDialogOpen(false)}>Done</Button>
        }
      />
    </Stack>
  );
}
