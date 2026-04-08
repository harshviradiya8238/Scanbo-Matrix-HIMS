import * as React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import { IconButton, MenuItem } from "@mui/material";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  Close as CloseIcon,
  Lock as LockIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
import type { EnrolledPatient, PatientStatus } from "../../utils/types";

interface ClosePlanDialogProps {
  open: boolean;
  onClose: () => void;
  patient: EnrolledPatient | null;
  onConfirmClose: (patient: EnrolledPatient) => void;
}

export default function ClosePlanDialog({
  open,
  onClose,
  patient,
  onConfirmClose,
}: ClosePlanDialogProps) {
  const theme = useTheme();
  const [closeReason, setCloseReason] = React.useState("completed");
  const [closingNotes, setClosingNotes] = React.useState("");

  const handleClose = () => {
    onClose();
    setCloseReason("completed");
    setClosingNotes("");
  };

  const handleConfirm = () => {
    if (patient) {
      onConfirmClose(patient);
    }
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 24px 64px rgba(0,0,0,0.12)",
          overflow: "hidden",
        },
      }}
    >
      {/* ── HEADER ── */}
      <Box
        sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" mb={0.4}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1.25,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LockIcon sx={{ fontSize: 15, color: "error.main" }} />
            </Box>
            <Typography variant="h6" fontWeight={800} letterSpacing="-0.01em">
              Close Care Plan
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {patient ? `${patient.name} — ${patient.program}` : ""}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{
            bgcolor: alpha(theme.palette.text.primary, 0.05),
            "&:hover": { bgcolor: alpha(theme.palette.text.primary, 0.1) },
            flexShrink: 0,
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* ── CONTENT ── */}
      <DialogContent sx={{ px: 3, py: 2.5 }}>
        {patient && (
          <Stack spacing={2.5}>
            {/* Warning Banner */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.error.main, 0.05),
                border: "1px solid",
                borderColor: alpha(theme.palette.error.main, 0.2),
                display: "flex",
                gap: 1.5,
                alignItems: "flex-start",
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.25,
                  bgcolor: alpha(theme.palette.error.main, 0.12),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <WarningAmberIcon sx={{ color: "error.main", fontSize: 18 }} />
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color="error.main"
                  mb={0.4}
                >
                  This will archive the patient's care plan.
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  lineHeight={1.6}
                >
                  Automated reminders and check-in requests will stop. All data
                  will be archived and accessible for future reference.
                  Re-enroll to restart.
                </Typography>
              </Box>
            </Box>

            {/* Program Summary */}
            <Box>
              <Typography
                variant="overline"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.65rem",
                  letterSpacing: "0.1em",
                  color: "text.disabled",
                  display: "block",
                  mb: 1,
                }}
              >
                Program Summary
              </Typography>
              <Box
                sx={{
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  overflow: "hidden",
                }}
              >
                {[
                  { k: "Patient", v: `${patient.name}, 58 yrs` },
                  { k: "Program", v: patient.program },
                  { k: "Enrolled", v: "Jan 12, 2025" },
                  { k: "Closing On", v: "10 Mar 2026" },
                  { k: "Total Check-ins", v: "3 logged" },
                  {
                    k: "Overall Adherence",
                    v: `${patient.adherence}%`,
                    alert: true,
                  },
                ].map(({ k, v, alert }, i, arr) => (
                  <Stack
                    key={k}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      px: 2,
                      py: 1.1,
                      borderBottom: i < arr.length - 1 ? "1px solid" : "none",
                      borderColor: "divider",
                      bgcolor: alert
                        ? alpha(theme.palette.error.main, 0.03)
                        : "transparent",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {k}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={alert ? "error.main" : "text.primary"}
                    >
                      {v}
                    </Typography>
                  </Stack>
                ))}
              </Box>
            </Box>

            {/* Reason for Closing */}
            <Box>
              <Typography
                variant="overline"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.65rem",
                  letterSpacing: "0.1em",
                  color: "text.disabled",
                  display: "block",
                  mb: 1,
                }}
              >
                Reason for Closing
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={closeReason}
                onChange={(e) => setCloseReason(e.target.value)}
              >
                <MenuItem value="completed">
                  Program completed successfully
                </MenuItem>
                <MenuItem value="transferred">Patient transferred</MenuItem>
                <MenuItem value="withdrawn">Patient withdrew</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Box>

            {/* Closing Notes */}
            <Box>
              <Typography
                variant="overline"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.65rem",
                  letterSpacing: "0.1em",
                  color: "text.disabled",
                  display: "block",
                  mb: 1,
                }}
              >
                Closing Notes{" "}
                <Box
                  component="span"
                  sx={{
                    textTransform: "none",
                    fontSize: "0.68rem",
                    fontWeight: 400,
                  }}
                >
                  (Optional)
                </Box>
              </Typography>
              <TextField
                multiline
                rows={3}
                fullWidth
                size="small"
                placeholder="e.g. Patient recovered well. Follow-up in 6 months..."
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
              />
            </Box>
          </Stack>
        )}
      </DialogContent>

      {/* ── FOOTER ── */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          justifyContent: "flex-end",
          gap: 1,
          bgcolor: alpha(theme.palette.background.default, 0.6),
        }}
      >
        <Button
          variant="outlined"
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 1.5,
            px: 2.5,
          }}
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          disableElevation
          startIcon={<LockIcon sx={{ fontSize: 16, color: "common.white" }} />}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 1.5,
            px: 2.5,
            color: "common.white",
          }}
          onClick={handleConfirm}
        >
          Close Care Plan
        </Button>
      </Box>
    </Dialog>
  );
}
