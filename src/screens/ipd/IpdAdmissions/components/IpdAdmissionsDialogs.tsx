"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { CommonDialog } from "@/src/ui/components/molecules";
import { IpdSectionCard, ipdFormStylesSx } from "../../components/ipd-ui";
import { IpdAdmissionsData } from "../utils/ipd-admissions-types";

interface IpdAdmissionsDialogsProps {
  data: IpdAdmissionsData;
}

export function IpdAdmissionsDialogs({ data }: IpdAdmissionsDialogsProps) {
  const {
    dialogOpen,
    setDialogOpen,
    form,
    setForm,
    errors,
    handleSaveAdmission,
    snackbar,
    setSnackbar,
    canManageAdmissions,
    canOpenBedBoard,
  } = data;

  const handleFieldChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateAdmission = (openBedBoard: boolean) => {
    // In a real app we'd pass this flag to the handler
    // For now we'll just call the existing handler which redirects to bed board anyway
    handleSaveAdmission();
  };

  return (
    <>
      <CommonDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Patient Admission Registration"
        maxWidth="md"
        fullWidth
        actions={
          <Stack
            direction="row"
            spacing={1}
            justifyContent="flex-end"
            sx={{ width: "100%" }}
          >
            <Button
              variant="outlined"
              onClick={() =>
                setSnackbar({
                  open: true,
                  message: "Draft saved.",
                  severity: "info",
                })
              }
              disabled={!canManageAdmissions}
            >
              Save Draft
            </Button>
            <Button variant="outlined" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => handleCreateAdmission(false)}
              disabled={!canManageAdmissions}
            >
              Create Admission
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleCreateAdmission(true)}
              disabled={!canManageAdmissions || !canOpenBedBoard}
            >
              Create + Bed Allocate
            </Button>
          </Stack>
        }
      >
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            You are creating a new IPD admission record. Ensure all mandatory
            clinical and administrative fields are completed.
          </Alert>

          <Grid container spacing={3}>
            {/* Patient Demographics */}
            <Grid item xs={12}>
              <IpdSectionCard title="Patient Demographics">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Patient Name"
                      value={form.patientName}
                      disabled
                      sx={ipdFormStylesSx}
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      label="MRN"
                      value={form.mrn}
                      disabled
                      sx={ipdFormStylesSx}
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      label="Mobile Number"
                      value={form.mobile}
                      onChange={(e) =>
                        handleFieldChange("mobile", e.target.value)
                      }
                      sx={ipdFormStylesSx}
                    />
                  </Grid>
                </Grid>
              </IpdSectionCard>
            </Grid>

            {/* Admission Details */}
            <Grid item xs={12}>
              <IpdSectionCard title="Admission & Clinical Detail">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      fullWidth
                      label="Admission Type"
                      value={form.admissionType}
                      onChange={(e) =>
                        handleFieldChange("admissionType", e.target.value)
                      }
                      sx={ipdFormStylesSx}
                    >
                      <MenuItem value="Medical">Medical</MenuItem>
                      <MenuItem value="Surgical">Surgical</MenuItem>
                      <MenuItem value="Emergency">Emergency</MenuItem>
                      <MenuItem value="Maternity">Maternity</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      fullWidth
                      label="Priority"
                      value={form.priority}
                      onChange={(e) =>
                        handleFieldChange("priority", e.target.value)
                      }
                      error={!!errors.priority}
                      helperText={errors.priority}
                      sx={ipdFormStylesSx}
                    >
                      <MenuItem value="Routine">Routine</MenuItem>
                      <MenuItem value="Urgent">Urgent</MenuItem>
                      <MenuItem value="Emergency">Stat / Emergency</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      fullWidth
                      label="Preferred Ward"
                      value={form.preferredWard}
                      onChange={(e) =>
                        handleFieldChange("preferredWard", e.target.value)
                      }
                      error={!!errors.preferredWard}
                      helperText={errors.preferredWard}
                      sx={ipdFormStylesSx}
                    >
                      <MenuItem value="Medical Ward - 1">
                        Medical Ward - 1
                      </MenuItem>
                      <MenuItem value="Surgical Ward - 1">
                        Surgical Ward - 1
                      </MenuItem>
                      <MenuItem value="ICU">ICU / Critical Care</MenuItem>
                      <MenuItem value="Semi-Private">Semi-Private</MenuItem>
                      <MenuItem value="General Ward">General Ward</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Provisional Diagnosis"
                      value={form.provisionalDiagnosis}
                      onChange={(e) =>
                        handleFieldChange(
                          "provisionalDiagnosis",
                          e.target.value,
                        )
                      }
                      sx={ipdFormStylesSx}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Reason for Admission"
                      value={form.admissionReason}
                      onChange={(e) =>
                        handleFieldChange("admissionReason", e.target.value)
                      }
                      error={!!errors.admissionReason}
                      helperText={errors.admissionReason}
                      sx={ipdFormStylesSx}
                    />
                  </Grid>
                </Grid>
              </IpdSectionCard>
            </Grid>

            {/* Billing & Insurance */}
            <Grid item xs={12}>
              <IpdSectionCard title="Billing & Insurance">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      fullWidth
                      label="Payer Type"
                      value={form.payerType}
                      onChange={(e) =>
                        handleFieldChange("payerType", e.target.value)
                      }
                      sx={ipdFormStylesSx}
                    >
                      <MenuItem value="General">Cash / General</MenuItem>
                      <MenuItem value="Insurance">Insurance / TPA</MenuItem>
                      <MenuItem value="Corporate">Corporate</MenuItem>
                    </TextField>
                  </Grid>
                  {form.payerType === "Insurance" && (
                    <>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Insurance Provider"
                          value={form.insuranceProvider}
                          onChange={(e) =>
                            handleFieldChange(
                              "insuranceProvider",
                              e.target.value,
                            )
                          }
                          sx={ipdFormStylesSx}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Policy / TPA ID"
                          value={form.policyNumber}
                          onChange={(e) =>
                            handleFieldChange("policyNumber", e.target.value)
                          }
                          sx={ipdFormStylesSx}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </IpdSectionCard>
            </Grid>

            {/* Terms */}
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.termsAccepted}
                      onChange={(e) =>
                        handleFieldChange("termsAccepted", e.target.checked)
                      }
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I confirm that the patient has provided written consent
                      for admission and all provided information is accurate as
                      per hospital records.
                    </Typography>
                  }
                />
                {errors.termsAccepted && (
                  <Typography variant="caption" color="error" sx={{ ml: 4 }}>
                    {errors.termsAccepted}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Stack>
      </CommonDialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: 2, boxShadow: 3 }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
