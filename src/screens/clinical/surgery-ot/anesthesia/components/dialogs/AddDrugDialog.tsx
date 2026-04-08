import * as React from "react";
import { Stack, TextField, MenuItem } from "@/src/ui/components/atoms";
import CommonDialog from "@/src/ui/components/molecules/CommonDialog";
import { LocalPharmacy as LocalPharmacyIcon } from "@mui/icons-material";

interface AddDrugDialogProps {
  open: boolean;
  onClose: () => void;
  addDrugForm: {
    name: string;
    route: string;
    type: string;
    dose: string;
    notes: string;
  };
  setAddDrugForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      route: string;
      type: string;
      dose: string;
      notes: string;
    }>
  >;
  onConfirm: () => void;
}

export const AddDrugDialog = ({
  open,
  onClose,
  addDrugForm,
  setAddDrugForm,
  onConfirm,
}: AddDrugDialogProps) => {
  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      title="Add Drug / Infusion"
      icon={<LocalPharmacyIcon sx={{ fontSize: 18 }} />}
      onConfirm={onConfirm}
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
  );
};
