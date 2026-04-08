import * as React from "react";
import { Stack, TextField, Typography } from "@/src/ui/components/atoms";
import CommonDialog from "@/src/ui/components/molecules/CommonDialog";

interface FinalSignoffDialogProps {
  open: boolean;
  onClose: () => void;
  finalSignoffNote: string;
  setFinalSignoffNote: (note: string) => void;
  onConfirm: () => void;
}

export const FinalSignoffDialog = ({
  open,
  onClose,
  finalSignoffNote,
  setFinalSignoffNote,
  onConfirm,
}: FinalSignoffDialogProps) => {
  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      title="Final Sign-off"
      onConfirm={onConfirm}
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
  );
};
