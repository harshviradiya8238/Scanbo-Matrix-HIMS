"use client";

import * as React from "react";
import {
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import {
  DeleteOutline as DeleteOutlineIcon,
  EditOutlined as EditOutlinedIcon,
  LibraryAdd as LibraryAddIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
import { useAppDispatch } from "@/src/store/hooks";
import { updateEncounter } from "@/src/store/slices/opdSlice";
import { OpdEncounterCase } from "../../../../opd-mock-data";
import OpdTable from "../../../../components/OpdTable";
import { CommonDialog } from "@/src/ui/components/molecules";

interface AllergyListRow {
  id: string;
  allergyName: string;
  index: number;
}

interface AllergiesTabProps {
  encounter: OpdEncounterCase | undefined;
  canDocumentConsultation: boolean;
  setSnackbar: (snackbar: {
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }) => void;
  guardRoleAction: (allowed: boolean, actionLabel: string) => boolean;
}

const sanitizeAllergies = (allergies: string[]): string[] =>
  Array.from(
    new Set(
      allergies
        .map((item) => item.trim())
        .filter((item) => item && item.toLowerCase() !== "no known allergies"),
    ),
  );

export default function AllergiesTab({
  encounter,
  canDocumentConsultation,
  setSnackbar,
  guardRoleAction,
}: AllergiesTabProps) {
  const dispatch = useAppDispatch();
  const [allergyDialogOpen, setAllergyDialogOpen] = React.useState(false);
  const [allergyInput, setAllergyInput] = React.useState("");
  const [editingAllergyIndex, setEditingAllergyIndex] = React.useState<
    number | null
  >(null);

  if (!encounter) return null;

  const managedAllergies = sanitizeAllergies(encounter.allergies);
  const allergyRows: AllergyListRow[] = managedAllergies.map(
    (allergyName, index) => ({
      id: `allergy-${index}-${allergyName.toLowerCase().replace(/\s+/g, "-")}`,
      allergyName,
      index,
    }),
  );

  const persistAllergies = (allergies: string[]) => {
    const cleaned = sanitizeAllergies(allergies);
    dispatch(
      updateEncounter({
        id: encounter.id,
        changes: {
          allergies: cleaned.length > 0 ? cleaned : ["No known allergies"],
        },
      }),
    );
  };

  const handleAddAllergy = () => {
    if (!guardRoleAction(canDocumentConsultation, "add allergy details"))
      return;
    setAllergyDialogOpen(true);
    setEditingAllergyIndex(null);
    setAllergyInput("");
  };

  const closeAllergyDialog = () => {
    setAllergyDialogOpen(false);
    setEditingAllergyIndex(null);
    setAllergyInput("");
  };

  const handleSelectAllergyForEdit = (index: number) => {
    if (!guardRoleAction(canDocumentConsultation, "edit allergy details"))
      return;
    const cleaned = sanitizeAllergies(encounter.allergies);
    const selected = cleaned[index];
    if (!selected) return;
    setEditingAllergyIndex(index);
    setAllergyInput(selected);
    setAllergyDialogOpen(true);
  };

  const handleSaveAllergy = () => {
    if (!guardRoleAction(canDocumentConsultation, "save allergy details"))
      return;
    const value = allergyInput.trim();
    if (!value) {
      setSnackbar({
        open: true,
        message: "Allergy name is required.",
        severity: "error",
      });
      return;
    }

    const current = sanitizeAllergies(encounter.allergies);
    const next =
      editingAllergyIndex === null
        ? [...current, value]
        : current.map((item, index) =>
            index === editingAllergyIndex ? value : item,
          );

    persistAllergies(next);
    closeAllergyDialog();
    setSnackbar({
      open: true,
      message:
        editingAllergyIndex === null ? "Allergy added." : "Allergy updated.",
      severity: "success",
    });
  };

  const handleDeleteAllergy = (index: number) => {
    if (!guardRoleAction(canDocumentConsultation, "delete allergy details"))
      return;
    const current = sanitizeAllergies(encounter.allergies);
    const next = current.filter((_, itemIndex) => itemIndex !== index);
    persistAllergies(next);
    if (editingAllergyIndex === index) {
      setEditingAllergyIndex(null);
      setAllergyInput("");
    }
    setSnackbar({
      open: true,
      message: "Allergy removed.",
      severity: "success",
    });
  };

  return (
    <Stack spacing={1.2}>
      <OpdTable
        title="Allergies"
        action={
          <Button
            variant="outlined"
            size="small"
            startIcon={<LibraryAddIcon />}
            disabled={!canDocumentConsultation}
            onClick={handleAddAllergy}
          >
            + Add Allergy
          </Button>
        }
        rows={allergyRows}
        emptyMessage="No known allergies documented."
        rowKey={(row) => row.id}
        variant="card"
        columns={[
          {
            id: "allergyName",
            label: "Allergy",
            render: (row) => (
              <Stack direction="row" spacing={0.6} alignItems="center">
                <WarningAmberIcon
                  fontSize="small"
                  color={allergyRows.length > 0 ? "error" : "primary"}
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {row.allergyName}
                </Typography>
              </Stack>
            ),
          },
          {
            id: "actions",
            label: "Actions",
            align: "right",
            render: (row) => (
              <Stack direction="row" justifyContent="flex-end" spacing={0.25}>
                <IconButton
                  size="small"
                  aria-label="Edit allergy"
                  disabled={!canDocumentConsultation}
                  onClick={() => handleSelectAllergyForEdit(row.index)}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label="Delete allergy"
                  color="error"
                  disabled={!canDocumentConsultation}
                  onClick={() => handleDeleteAllergy(row.index)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
            ),
          },
        ]}
      />

      <CommonDialog
        open={allergyDialogOpen}
        onClose={closeAllergyDialog}
        maxWidth="sm"
        title={editingAllergyIndex === null ? "Add Allergy" : "Edit Allergy"}
        icon={
          <WarningAmberIcon
            color={managedAllergies.length ? "error" : "primary"}
            fontSize="small"
          />
        }
        contentDividers
        content={
          <Stack spacing={1.2}>
            <TextField
              fullWidth
              label="Allergy Name"
              value={allergyInput}
              onChange={(event) => setAllergyInput(event.target.value)}
            />
          </Stack>
        }
        actions={
          <>
            <Button onClick={closeAllergyDialog}>Cancel</Button>
            <Button
              variant="contained"
              startIcon={<LibraryAddIcon />}
              onClick={handleSaveAllergy}
            >
              {editingAllergyIndex === null ? "Add Allergy" : "Update Allergy"}
            </Button>
          </>
        }
      />
    </Stack>
  );
}
