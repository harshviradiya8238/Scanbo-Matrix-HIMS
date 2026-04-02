import * as React from "react";
import {
  LibraryAdd as LibraryAddIcon,
  WarningAmber as WarningAmberIcon,
  EditOutlined as EditOutlinedIcon,
  DeleteOutline as DeleteOutlineIcon,
} from "@mui/icons-material";
import {
  Button,
  IconButton,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { OpdVisitData } from "../utils/opd-visit-types";
import OpdTable from "../../common/components/OpdTable";

export const AllergiesTab = ({ data }: { data: OpdVisitData }) => {
  const {
    encounter,
    capabilities,
    handleAddAllergy,
    handleDeleteAllergy,
    setEditingAllergyIndex,
    setAllergyInput,
    setAllergyDialogOpen,
    guardRoleAction,
  } = data;
  const managedAllergies = React.useMemo(() => {
    if (!encounter?.allergies) return [];
    return encounter.allergies.filter(
      (item: string) => item && item.toLowerCase() !== "no known allergies",
    );
  }, [encounter?.allergies]);

  const allergyRows = managedAllergies.map(
    (allergyName: string, index: number) => ({
      id: `allergy-${index}-${allergyName.toLowerCase().replace(/\s+/g, "-")}`,
      allergyName,
      index,
    }),
  );

  const handleSelectAllergyForEdit = (index: number) => {
    if (
      !guardRoleAction(
        capabilities.canDocumentConsultation,
        "edit allergy details",
      )
    )
      return;
    const selected = managedAllergies[index];
    if (!selected) return;
    setEditingAllergyIndex(index);
    setAllergyInput(selected);
    setAllergyDialogOpen(true);
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
            disabled={!capabilities.canDocumentConsultation}
            onClick={handleAddAllergy}
          >
            + Add Allergy
          </Button>
        }
        rows={allergyRows}
        emptyMessage="No known allergies documented."
        rowKey={(row: any) => row.id}
        variant="card"
        columns={[
          {
            id: "allergyName",
            label: "Allergy",
            render: (row: any) => (
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
            render: (row: any) => (
              <Stack direction="row" justifyContent="flex-end" spacing={0.25}>
                <IconButton
                  size="small"
                  aria-label="Edit allergy"
                  disabled={!capabilities.canDocumentConsultation}
                  onClick={() => handleSelectAllergyForEdit(row.index)}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label="Delete allergy"
                  color="error"
                  disabled={!capabilities.canDocumentConsultation}
                  onClick={() => handleDeleteAllergy(row.index)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
            ),
          },
        ]}
      />
    </Stack>
  );
};
