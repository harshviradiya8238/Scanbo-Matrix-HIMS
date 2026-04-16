import * as React from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import { CommonDialog } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  CalendarMonth as CalendarMonthIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

interface CloseCaseForm {
  selectedPatientId: string;
  closingPhysician: string;
  closureDate: string;
  finalSummary: string;
  confirmCriteria: boolean;
}

interface InfectionCase {
  id: string;
  patientName: string;
  mrn: string;
  organism: string;
  bed: string;
}

interface CloseCaseDialogProps {
  open: boolean;
  onClose: () => void;
  closeCaseId: string | null;
  cases: InfectionCase[];
  onConfirmCloseCase: (data: CloseCaseForm) => void;
  canWrite: boolean;
}

const CloseCaseDialog: React.FC<CloseCaseDialogProps> = ({
  open,
  onClose,
  closeCaseId,
  cases,
  onConfirmCloseCase,
  canWrite,
}) => {
  const theme = useTheme();

  const [closeCaseForm, setCloseCaseForm] = React.useState<CloseCaseForm>({
    selectedPatientId: "",
    closingPhysician: "",
    closureDate: new Date().toLocaleDateString("en-GB"),
    finalSummary: "",
    confirmCriteria: true,
  });

  React.useEffect(() => {
    if (open) {
      const preselected = closeCaseId ? cases.find((c) => c.id === closeCaseId) : cases[0];
      setCloseCaseForm({
        selectedPatientId: preselected?.id ?? "",
        closingPhysician: "",
        closureDate: new Date().toLocaleDateString("en-GB"),
        finalSummary: "",
        confirmCriteria: true,
      });
    }
  }, [open, closeCaseId, cases]);

  const resolvedCase = cases.find((c) => c.id === closeCaseForm.selectedPatientId);

  const handleClose = () => onClose();
  const handleConfirm = () => onConfirmCloseCase(closeCaseForm);

  return (
    <CommonDialog
      open={open}
      onClose={handleClose}
      title="Close Case"
      subtitle={resolvedCase ? `${resolvedCase.patientName} · ${resolvedCase.mrn} · ${resolvedCase.organism} · Bed ${resolvedCase.bed}` : "Select a patient to close"}
      icon={
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(theme.palette.success.main, 0.12),
            color: "success.main",
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 22 }} />
        </Box>
      }
      maxWidth="sm"
      fullWidth
      content={
        <Stack spacing={2} sx={{ mt: 1 }}>

          {/* ── Patient Selection ─────────────────────────────── */}
          <TextField
            select
            label="Select Patient *"
            value={closeCaseForm.selectedPatientId}
            onChange={(e) =>
              setCloseCaseForm((prev) => ({ ...prev, selectedPatientId: e.target.value }))
            }
            size="small"
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
          >
            <MenuItem value="">— Select Patient —</MenuItem>
            {cases.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                <Stack spacing={0}>
                  <span style={{ fontWeight: 700 }}>{c.patientName}</span>
                  <span style={{ fontSize: "0.75rem", color: "#888" }}>
                    {c.mrn} · {c.organism} · Bed {c.bed}
                  </span>
                </Stack>
              </MenuItem>
            ))}
          </TextField>

          {/* Closure status banner */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.success.main, 0.08),
              border: "1px solid",
              borderColor: alpha(theme.palette.success.main, 0.25),
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 20, color: "success.main", flexShrink: 0 }} />
            <Typography variant="body2" sx={{ color: "success.dark", fontWeight: 500 }}>
              {resolvedCase
                ? `Closure criteria met for ${resolvedCase.patientName}: 3 negative cultures · Isolation ≥72h · Terminal cleaning done · Audit: 94%.`
                : "All closure criteria met. 3 negative cultures · Isolation ≥72h · Terminal cleaning done · Audit: 94%."
              }
            </Typography>
          </Box>

          <TextField
            label="Closing Physician *"
            value={closeCaseForm.closingPhysician}
            onChange={(e) =>
              setCloseCaseForm((prev) => ({ ...prev, closingPhysician: e.target.value }))
            }
            placeholder="Name / Employee ID"
            size="small"
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
          />
          <TextField
            label="Closure Date"
            value={closeCaseForm.closureDate}
            onChange={(e) =>
              setCloseCaseForm((prev) => ({ ...prev, closureDate: e.target.value }))
            }
            placeholder="dd / mm / yyyy"
            size="small"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <CalendarMonthIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                </InputAdornment>
              ),
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
          />
          <TextField
            label="Final Clinical Summary"
            value={closeCaseForm.finalSummary}
            onChange={(e) =>
              setCloseCaseForm((prev) => ({ ...prev, finalSummary: e.target.value }))
            }
            placeholder="Outcome, follow-up required, lessons learned..."
            size="small"
            fullWidth
            multiline
            rows={4}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={closeCaseForm.confirmCriteria}
                onChange={(e) =>
                  setCloseCaseForm((prev) => ({ ...prev, confirmCriteria: e.target.checked }))
                }
                color="primary"
              />
            }
            label="I confirm all closure criteria are verified and this case is safe to close."
            sx={{
              alignItems: "flex-start",
              "& .MuiFormControlLabel-label": { fontWeight: 500 },
            }}
          />
        </Stack>
      }
      actions={
        <Stack direction="row" spacing={1.5} alignItems="center" width="100%">
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleClose}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            disabled={!canWrite}
            onClick={handleConfirm}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Confirm Case Closure
          </Button>
        </Stack>
      }
    />
  );
};

export default CloseCaseDialog;
