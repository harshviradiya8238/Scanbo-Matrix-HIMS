import * as React from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  InputAdornment,
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
  setCloseCaseId: React.Dispatch<React.SetStateAction<string | null>>;
  closeCaseForm: CloseCaseForm;
  setCloseCaseForm: React.Dispatch<React.SetStateAction<CloseCaseForm>>;
  cases: InfectionCase[];
  handleConfirmCloseCase: () => void;
  canWrite: boolean;
}

const CloseCaseDialog: React.FC<CloseCaseDialogProps> = ({
  open,
  onClose,
  closeCaseId,
  setCloseCaseId,
  closeCaseForm,
  setCloseCaseForm,
  cases,
  handleConfirmCloseCase,
  canWrite,
}) => {
  const theme = useTheme();

  const handleClose = () => {
    onClose();
    setCloseCaseId(null);
  };

  return (
    <CommonDialog
      open={open}
      onClose={handleClose}
      title="Close Case"
      subtitle={
        closeCaseId
          ? (() => {
              const c = cases.find((x) => x.id === closeCaseId);
              return c
                ? `${c.patientName} · ${c.mrn} · ${c.organism} · ${c.bed}`
                : undefined;
            })()
          : undefined
      }
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
        closeCaseId ? (
          <Stack spacing={2} sx={{ mt: 1 }}>
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
              <CheckCircleIcon sx={{ fontSize: 20, color: "success.main" }} />
              <Typography
                variant="body2"
                sx={{ color: "success.dark", fontWeight: 500 }}
              >
                All closure criteria met. 3 negative cultures · Isolation ≥72h
                · Terminal cleaning done · Audit: 94%.
              </Typography>
            </Box>

            <TextField
              label="Closing Physician *"
              value={closeCaseForm.closingPhysician}
              onChange={(e) =>
                setCloseCaseForm((prev) => ({
                  ...prev,
                  closingPhysician: e.target.value,
                }))
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
                setCloseCaseForm((prev) => ({
                  ...prev,
                  closureDate: e.target.value,
                }))
              }
              placeholder="dd / mm / yyyy"
              size="small"
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <CalendarMonthIcon
                      sx={{ fontSize: 18, color: "text.disabled" }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
            />
            <TextField
              label="Final Clinical Summary"
              value={closeCaseForm.finalSummary}
              onChange={(e) =>
                setCloseCaseForm((prev) => ({
                  ...prev,
                  finalSummary: e.target.value,
                }))
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
                    setCloseCaseForm((prev) => ({
                      ...prev,
                      confirmCriteria: e.target.checked,
                    }))
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
        ) : null
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
            onClick={handleConfirmCloseCase}
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