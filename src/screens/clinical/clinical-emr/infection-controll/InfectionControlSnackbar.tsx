import * as React from "react";
import { Snackbar, Alert } from "@/src/ui/components/atoms";

interface InfectionControlSnackbarProps {
  open: boolean;
  message: string;
  severity: "success" | "info";
  onClose: () => void;
}

export default function InfectionControlSnackbar({
  open,
  message,
  severity,
  onClose,
}: InfectionControlSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
