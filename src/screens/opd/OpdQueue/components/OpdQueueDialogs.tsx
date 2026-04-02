"use client";

import * as React from "react";
import {
  Alert,
  Button,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
} from "@/src/ui/components/atoms";
import { CommonDialog } from "@/src/ui/components/molecules";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { SwapHoriz as SwapHorizIcon } from "@mui/icons-material";
import { AdmissionPriority } from "@/src/screens/ipd/ipd-mock-data";
import { OpdQueueData } from "../utils/opd-queue-types";

interface OpdQueueDialogsProps {
  data: OpdQueueData;
}

export function OpdQueueDialogs({ data }: OpdQueueDialogsProps) {
  const {
    transferDialogOpen,
    setTransferDialogOpen,
    selectedTransferItem,
    transferDraft,
    setTransferDraft,
    handleSubmitTransfer,
    snackbar,
    setSnackbar,
  } = data;

  const handleUpdateDraftField = (
    field: keyof typeof transferDraft,
    value: any,
  ) => {
    setTransferDraft((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <CommonDialog
        open={transferDialogOpen}
        onClose={() => setTransferDialogOpen(false)}
        maxWidth="md"
        title="Move Patient to IPD (In-Patient Department)"
        icon={<SwapHorizIcon fontSize="small" />}
        description={
          selectedTransferItem
            ? `Initiate IPD admission request for ${selectedTransferItem.patientName} (${selectedTransferItem.mrn}).`
            : "Initiate IPD admission request."
        }
        contentDividers
        content={
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Admission Priority"
                  value={transferDraft.priority}
                  onChange={(e) =>
                    handleUpdateDraftField(
                      "priority",
                      e.target.value as AdmissionPriority,
                    )
                  }
                >
                  {["Routine", "Urgent", "Emergency"].map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Preferred Ward / Bed Type"
                  value={transferDraft.preferredWard}
                  onChange={(e) =>
                    handleUpdateDraftField("preferredWard", e.target.value)
                  }
                  helperText="e.g., General Ward, Semi-Private, ICU"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Provisional Diagnosis"
                  value={transferDraft.provisionalDiagnosis}
                  onChange={(e) =>
                    handleUpdateDraftField(
                      "provisionalDiagnosis",
                      e.target.value,
                    )
                  }
                  placeholder={
                    selectedTransferItem?.chiefComplaint ||
                    "Enter suspected diagnosis"
                  }
                  helperText="Initial reason for admission"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Primary Reason for Admission"
                  value={transferDraft.admissionReason}
                  onChange={(e) =>
                    handleUpdateDraftField("admissionReason", e.target.value)
                  }
                  placeholder="e.g., Requires continuous monitoring, Post-operative recovery"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Admission Request Notes"
                  value={transferDraft.requestNote}
                  onChange={(e) =>
                    handleUpdateDraftField("requestNote", e.target.value)
                  }
                  placeholder="Additional instructions for the admissions team"
                />
              </Grid>
            </Grid>
            <Alert severity="info" sx={{ mt: 1 }}>
              Once submitted, the patient status will show as
              &quot;Completed&quot; in the OPD queue and they will appear in the
              IPD Admissions worklist.
            </Alert>
          </Stack>
        }
        actions={
          <>
            <Button onClick={() => setTransferDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<SwapHorizIcon />}
              onClick={handleSubmitTransfer}
            >
              Submit IPD Request
            </Button>
          </>
        }
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3200}
        onClose={() => setSnackbar((prev: any) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev: any) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
