import * as React from "react";
import { Stack, TextField, MenuItem } from "@/src/ui/components/atoms";
import CommonDialog from "@/src/ui/components/molecules/CommonDialog";

interface AddEventDialogProps {
  open: boolean;
  onClose: () => void;
  addEventForm: {
    note: string;
    tone: "info" | "active" | "warning" | "critical";
  };
  setAddEventForm: React.Dispatch<
    React.SetStateAction<{
      note: string;
      tone: "info" | "active" | "warning" | "critical";
    }>
  >;
  onConfirm: () => void;
}

export const AddEventDialog = ({
  open,
  onClose,
  addEventForm,
  setAddEventForm,
  onConfirm,
}: AddEventDialogProps) => {
  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      title="Add Intra-op Event"
      onConfirm={onConfirm}
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
  );
};
