import * as React from "react";
import { Typography } from "@/src/ui/components/atoms";
import CommonDialog from "@/src/ui/components/molecules/CommonDialog";

interface SignCloseDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const SignCloseDialog = ({
  open,
  onClose,
  onConfirm,
}: SignCloseDialogProps) => {
  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      title="Sign & Close Case"
      onConfirm={onConfirm}
      confirmLabel="Confirm Sign & Close"
      contentDividers
    >
      <Typography variant="body2" color="text.secondary">
        This will mark the case as completed and append an event log entry.
      </Typography>
    </CommonDialog>
  );
};
